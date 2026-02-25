use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

use anyhow::{Context, Result};
use tauri::{AppHandle, Emitter};
use tracing::{error, info, warn};

use super::protocol::{FromSidecar, ToSidecar};

pub struct SidecarManager {
    child: Arc<Mutex<Option<Child>>>,
    stdin_tx: Arc<Mutex<Option<std::process::ChildStdin>>>,
}

impl SidecarManager {
    pub fn new() -> Self {
        Self {
            child: Arc::new(Mutex::new(None)),
            stdin_tx: Arc::new(Mutex::new(None)),
        }
    }

    pub fn spawn(&self, sidecar_path: &str, app_handle: AppHandle) -> Result<()> {
        info!("Spawning sidecar: {}", sidecar_path);

        let mut child = Command::new(sidecar_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .context("Failed to spawn sidecar process")?;

        let stdin = child.stdin.take().context("Failed to get sidecar stdin")?;
        let stdout = child.stdout.take().context("Failed to get sidecar stdout")?;
        let stderr = child.stderr.take().context("Failed to get sidecar stderr")?;

        *self.stdin_tx.lock().unwrap() = Some(stdin);
        *self.child.lock().unwrap() = Some(child);

        // Read stdout in a separate thread
        let app_handle_clone = app_handle.clone();
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        if line.trim().is_empty() {
                            continue;
                        }
                        match serde_json::from_str::<FromSidecar>(&line) {
                            Ok(msg) => {
                                Self::handle_message(&app_handle_clone, msg);
                            }
                            Err(e) => {
                                warn!("Failed to parse sidecar message: {} — line: {}", e, line);
                            }
                        }
                    }
                    Err(e) => {
                        error!("Error reading sidecar stdout: {}", e);
                        break;
                    }
                }
            }
            info!("Sidecar stdout reader exited");
            let _ = app_handle_clone.emit("sidecar-exited", ());
        });

        // Read stderr for logging
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        if !line.trim().is_empty() {
                            info!("[sidecar stderr] {}", line);
                        }
                    }
                    Err(e) => {
                        error!("Error reading sidecar stderr: {}", e);
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    fn handle_message(app_handle: &AppHandle, msg: FromSidecar) {
        match &msg {
            FromSidecar::SdkMessage { message } => {
                let _ = app_handle.emit("sdk-message", message);
            }
            FromSidecar::PermissionRequest {
                request_id,
                tool_name,
                input,
            } => {
                let _ = app_handle.emit(
                    "permission-request",
                    serde_json::json!({
                        "requestId": request_id,
                        "toolName": tool_name,
                        "input": input,
                    }),
                );
            }
            FromSidecar::SessionReady { session_id } => {
                let _ = app_handle.emit("session-ready", session_id);
            }
            FromSidecar::StreamingText { text } => {
                let _ = app_handle.emit("streaming-text", text);
            }
            FromSidecar::TurnComplete { messages } => {
                let _ = app_handle.emit("turn-complete", messages);
            }
            FromSidecar::Error { message } => {
                error!("Sidecar error: {}", message);
                let _ = app_handle.emit("sidecar-error", message);
            }
        }
    }

    pub fn send(&self, msg: &ToSidecar) -> Result<()> {
        let mut stdin_guard = self.stdin_tx.lock().unwrap();
        let stdin = stdin_guard
            .as_mut()
            .context("Sidecar stdin not available")?;

        let json = serde_json::to_string(msg)?;
        writeln!(stdin, "{}", json)?;
        stdin.flush()?;
        Ok(())
    }

    pub fn is_running(&self) -> bool {
        let mut child_guard = self.child.lock().unwrap();
        if let Some(child) = child_guard.as_mut() {
            match child.try_wait() {
                Ok(None) => true,  // Still running
                Ok(Some(_)) => false,  // Exited
                Err(_) => false,
            }
        } else {
            false
        }
    }

    pub fn kill(&self) -> Result<()> {
        let mut child_guard = self.child.lock().unwrap();
        if let Some(child) = child_guard.as_mut() {
            child.kill()?;
        }
        *child_guard = None;
        *self.stdin_tx.lock().unwrap() = None;
        Ok(())
    }
}

impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.kill();
    }
}

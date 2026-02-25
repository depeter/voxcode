mod audio;
mod commands;
mod error;
mod sidecar;
mod state;

use tauri::Manager;
use state::AppState;
use tracing::info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "voxcode=info".into()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Resolve sidecar path
            let sidecar_path = resolve_sidecar_path(&app_handle);
            info!("Sidecar path: {}", sidecar_path);

            // Spawn the sidecar
            let state = app.state::<AppState>();
            let sidecar = state.sidecar.lock().unwrap();
            if let Err(e) = sidecar.spawn(&sidecar_path, app_handle) {
                tracing::error!("Failed to spawn sidecar: {}", e);
            }

            // Try to load Whisper model if it exists
            let model_path = audio::transcribe::Transcriber::default_model_path();
            if model_path.exists() {
                let mut audio = state.audio.lock().unwrap();
                match audio.load_model(&model_path) {
                    Ok(()) => info!("Whisper model loaded from {}", model_path.display()),
                    Err(e) => tracing::warn!("Failed to load Whisper model: {}", e),
                }
            } else {
                info!(
                    "Whisper model not found at {}. Download it to enable speech-to-text.",
                    model_path.display()
                );
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::chat::send_message,
            commands::chat::interrupt,
            commands::chat::is_sidecar_running,
            commands::permissions::respond_permission,
            commands::permissions::set_permission_mode,
            commands::audio::start_recording,
            commands::audio::stop_recording,
            commands::audio::is_recording,
            commands::audio::is_model_loaded,
            commands::audio::load_whisper_model,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn resolve_sidecar_path(app_handle: &tauri::AppHandle) -> String {
    // In development, use the sidecar from the project directory
    let dev_path = std::env::current_dir()
        .ok()
        .map(|p| p.join("sidecar").join("dist").join("voxcode-sidecar"));

    if let Some(path) = dev_path {
        if path.exists() {
            return path.to_string_lossy().to_string();
        }
    }

    // In production, resolve from the app's resource directory
    let resource_dir = app_handle.path().resource_dir().ok();
    if let Some(dir) = resource_dir {
        let path = dir.join("binaries").join("voxcode-sidecar");
        if path.exists() {
            return path.to_string_lossy().to_string();
        }
    }

    // Fallback: try node directly (for development without compiled sidecar)
    "node".to_string()
}

use tauri::State;

use crate::error::VoxError;
use crate::sidecar::protocol::ToSidecar;
use crate::state::AppState;

#[tauri::command]
pub fn send_message(
    state: State<AppState>,
    text: String,
    cwd: Option<String>,
) -> Result<(), VoxError> {
    let sidecar = state.sidecar.lock().unwrap();
    sidecar
        .send(&ToSidecar::Send {
            text,
            cwd,
        })
        .map_err(|e| VoxError::Sidecar(e.to_string()))
}

#[tauri::command]
pub fn interrupt(state: State<AppState>) -> Result<(), VoxError> {
    let sidecar = state.sidecar.lock().unwrap();
    sidecar
        .send(&ToSidecar::Interrupt)
        .map_err(|e| VoxError::Sidecar(e.to_string()))
}

#[tauri::command]
pub fn is_sidecar_running(state: State<AppState>) -> bool {
    let sidecar = state.sidecar.lock().unwrap();
    sidecar.is_running()
}

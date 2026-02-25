use tauri::State;

use crate::error::VoxError;
use crate::sidecar::protocol::ToSidecar;
use crate::state::AppState;

#[tauri::command]
pub fn respond_permission(
    state: State<AppState>,
    request_id: String,
    decision: String,
) -> Result<(), VoxError> {
    let sidecar = state.sidecar.lock().unwrap();
    sidecar
        .send(&ToSidecar::RespondPermission {
            request_id,
            decision,
        })
        .map_err(|e| VoxError::Sidecar(e.to_string()))
}

#[tauri::command]
pub fn set_permission_mode(
    state: State<AppState>,
    mode: String,
) -> Result<(), VoxError> {
    let sidecar = state.sidecar.lock().unwrap();
    sidecar
        .send(&ToSidecar::SetPermissionMode { mode })
        .map_err(|e| VoxError::Sidecar(e.to_string()))
}

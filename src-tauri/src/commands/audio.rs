use tauri::{AppHandle, State};

use crate::error::VoxError;
use crate::state::AppState;

#[tauri::command]
pub fn start_recording(
    state: State<AppState>,
    app_handle: AppHandle,
) -> Result<(), VoxError> {
    let mut audio = state.audio.lock().unwrap();
    audio
        .start_recording(app_handle)
        .map_err(|e: anyhow::Error| VoxError::Sidecar(e.to_string()))
}

#[tauri::command]
pub fn stop_recording(
    state: State<AppState>,
    app_handle: AppHandle,
) -> Result<String, VoxError> {
    let mut audio = state.audio.lock().unwrap();
    audio
        .stop_recording(app_handle)
        .map_err(|e: anyhow::Error| VoxError::Sidecar(e.to_string()))
}

#[tauri::command]
pub fn is_recording(state: State<AppState>) -> bool {
    let audio = state.audio.lock().unwrap();
    audio.is_recording()
}

#[tauri::command]
pub fn is_model_loaded(state: State<AppState>) -> bool {
    let audio = state.audio.lock().unwrap();
    audio.is_model_loaded()
}

#[tauri::command]
pub fn load_whisper_model(
    state: State<AppState>,
    model_path: String,
) -> Result<(), VoxError> {
    let mut audio = state.audio.lock().unwrap();
    audio
        .load_model(std::path::Path::new(&model_path))
        .map_err(|e: anyhow::Error| VoxError::Sidecar(e.to_string()))
}

use std::sync::Mutex;

use crate::audio::AudioPipeline;
use crate::sidecar::manager::SidecarManager;

pub struct AppState {
    pub sidecar: Mutex<SidecarManager>,
    pub audio: Mutex<AudioPipeline>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            sidecar: Mutex::new(SidecarManager::new()),
            audio: Mutex::new(AudioPipeline::new()),
        }
    }
}

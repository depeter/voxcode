use anyhow::{Context, Result};
use std::path::{Path, PathBuf};
use tracing::info;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

pub struct Transcriber {
    ctx: WhisperContext,
}

impl Transcriber {
    pub fn new(model_path: &Path) -> Result<Self> {
        info!("Loading Whisper model from: {}", model_path.display());

        let ctx = WhisperContext::new_with_params(
            model_path.to_str().context("Invalid model path")?,
            WhisperContextParameters::default(),
        )
        .map_err(|e| anyhow::anyhow!("Failed to load Whisper model: {:?}", e))?;

        info!("Whisper model loaded successfully");
        Ok(Self { ctx })
    }

    pub fn transcribe(&self, audio: &[f32]) -> Result<String> {
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        params.set_language(Some("en"));
        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);
        params.set_suppress_blank(true);
        params.set_single_segment(true);
        params.set_no_context(true);
        // Speed optimization for real-time
        params.set_n_threads(4);

        let mut state = self
            .ctx
            .create_state()
            .map_err(|e| anyhow::anyhow!("Failed to create state: {:?}", e))?;

        state
            .full(params, audio)
            .map_err(|e| anyhow::anyhow!("Transcription failed: {:?}", e))?;

        let num_segments = state
            .full_n_segments()
            .map_err(|e| anyhow::anyhow!("Failed to get segments: {:?}", e))?;

        let mut text = String::new();
        for i in 0..num_segments {
            if let Ok(segment) = state.full_get_segment_text(i) {
                text.push_str(&segment);
            }
        }

        Ok(text.trim().to_string())
    }

    pub fn default_model_dir() -> PathBuf {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".voxcode")
            .join("models")
    }

    pub fn default_model_path() -> PathBuf {
        Self::default_model_dir().join("ggml-base.en.bin")
    }
}

fn dirs_home_dir() -> Option<PathBuf> {
    std::env::var("HOME").ok().map(PathBuf::from)
}

// Inline minimal dirs replacement
mod dirs {
    use std::path::PathBuf;

    pub fn home_dir() -> Option<PathBuf> {
        std::env::var("HOME")
            .ok()
            .map(PathBuf::from)
    }
}

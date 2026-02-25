pub mod capture;
pub mod resample;
pub mod transcribe;
pub mod vad;

use std::sync::{Arc, Mutex};

use anyhow::Result;
use tauri::{AppHandle, Emitter};
use tracing::{info, warn};

use capture::AudioCapture;
use resample::AudioResampler;
use transcribe::Transcriber;

pub struct AudioPipeline {
    capture: AudioCapture,
    transcriber: Option<Arc<Transcriber>>,
    audio_buffer: Arc<Mutex<Vec<f32>>>,
}

impl AudioPipeline {
    pub fn new() -> Self {
        Self {
            capture: AudioCapture::new(),
            transcriber: None,
            audio_buffer: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn load_model(&mut self, model_path: &std::path::Path) -> Result<()> {
        let transcriber = Transcriber::new(model_path)?;
        self.transcriber = Some(Arc::new(transcriber));
        Ok(())
    }

    pub fn is_model_loaded(&self) -> bool {
        self.transcriber.is_some()
    }

    pub fn start_recording(&mut self, app_handle: AppHandle) -> Result<()> {
        let buffer = self.audio_buffer.clone();
        buffer.lock().unwrap().clear();

        let app = app_handle.clone();
        let sample_rate = self.capture.start(move |samples| {
            let rms: f32 = if samples.is_empty() {
                0.0
            } else {
                let sum: f32 = samples.iter().map(|s| s * s).sum();
                (sum / samples.len() as f32).sqrt()
            };

            let _ = app.emit("audio-level", rms);
            buffer.lock().unwrap().extend_from_slice(samples);
        })?;

        info!("Recording started at {}Hz", sample_rate);
        let _ = app_handle.emit("recording-started", sample_rate);

        Ok(())
    }

    pub fn stop_recording(&mut self, app_handle: AppHandle) -> Result<String> {
        self.capture.stop();
        info!("Recording stopped");

        let samples = {
            let mut buf = self.audio_buffer.lock().unwrap();
            let s = buf.clone();
            buf.clear();
            s
        };

        if samples.is_empty() {
            warn!("No audio captured");
            return Ok(String::new());
        }

        let mut resampler = AudioResampler::new(48000)?;
        let resampled = resampler.process(&samples)?;

        info!(
            "Audio: {} samples captured, {} after resampling",
            samples.len(),
            resampled.len()
        );

        let transcriber = self
            .transcriber
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("Whisper model not loaded"))?
            .clone();

        let text = transcriber.transcribe(&resampled)?;
        info!("Transcription: {:?}", text);

        let _ = app_handle.emit("transcription", &text);

        Ok(text)
    }

    pub fn is_recording(&self) -> bool {
        self.capture.is_recording()
    }
}

use anyhow::{Context, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{SampleFormat, Stream};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tracing::{error, info};

/// Wrapper that makes Stream usable across threads.
/// Safety: cpal Stream on Linux (ALSA) is thread-safe in practice,
/// and we only drop it from the same thread pattern.
struct SendStream(Stream);
unsafe impl Send for SendStream {}
unsafe impl Sync for SendStream {}

pub struct AudioCapture {
    stream: Option<SendStream>,
    is_recording: Arc<AtomicBool>,
}

impl AudioCapture {
    pub fn new() -> Self {
        Self {
            stream: None,
            is_recording: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start<F>(&mut self, on_samples: F) -> Result<u32>
    where
        F: Fn(&[f32]) + Send + 'static,
    {
        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .context("No default input device found")?;

        info!("Using input device: {}", device.name().unwrap_or_default());

        let config = device
            .default_input_config()
            .context("Failed to get default input config")?;

        let sample_rate = config.sample_rate().0;
        let channels = config.channels() as usize;

        info!(
            "Audio config: {}Hz, {} channels, {:?}",
            sample_rate,
            channels,
            config.sample_format()
        );

        let is_recording = self.is_recording.clone();
        is_recording.store(true, Ordering::SeqCst);

        let err_fn = |err| error!("Audio stream error: {}", err);

        let stream = match config.sample_format() {
            SampleFormat::F32 => {
                let is_rec = is_recording.clone();
                device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        if !is_rec.load(Ordering::SeqCst) {
                            return;
                        }
                        if channels == 1 {
                            on_samples(data);
                        } else {
                            let mono: Vec<f32> = data
                                .chunks(channels)
                                .map(|frame| frame.iter().sum::<f32>() / channels as f32)
                                .collect();
                            on_samples(&mono);
                        }
                    },
                    err_fn,
                    None,
                )?
            }
            SampleFormat::I16 => {
                let is_rec = is_recording.clone();
                device.build_input_stream(
                    &config.into(),
                    move |data: &[i16], _: &cpal::InputCallbackInfo| {
                        if !is_rec.load(Ordering::SeqCst) {
                            return;
                        }
                        let float_data: Vec<f32> = data
                            .iter()
                            .map(|&s| s as f32 / i16::MAX as f32)
                            .collect();
                        if channels == 1 {
                            on_samples(&float_data);
                        } else {
                            let mono: Vec<f32> = float_data
                                .chunks(channels)
                                .map(|frame| frame.iter().sum::<f32>() / channels as f32)
                                .collect();
                            on_samples(&mono);
                        }
                    },
                    err_fn,
                    None,
                )?
            }
            sample_format => {
                anyhow::bail!("Unsupported sample format: {:?}", sample_format);
            }
        };

        stream.play()?;
        self.stream = Some(SendStream(stream));

        Ok(sample_rate)
    }

    pub fn stop(&mut self) {
        self.is_recording.store(false, Ordering::SeqCst);
        if let Some(stream) = self.stream.take() {
            drop(stream);
        }
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::SeqCst)
    }
}

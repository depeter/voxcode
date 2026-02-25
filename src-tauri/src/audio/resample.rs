use anyhow::Result;
use rubato::{FftFixedIn, Resampler};
use tracing::info;

const WHISPER_SAMPLE_RATE: usize = 16000;

pub struct AudioResampler {
    resampler: Option<FftFixedIn<f32>>,
    source_rate: usize,
}

impl AudioResampler {
    pub fn new(source_rate: u32) -> Result<Self> {
        let source_rate = source_rate as usize;

        if source_rate == WHISPER_SAMPLE_RATE {
            info!("Source rate matches Whisper (16kHz), no resampling needed");
            return Ok(Self {
                resampler: None,
                source_rate,
            });
        }

        let chunk_size = 1024;
        let resampler = FftFixedIn::new(
            source_rate,
            WHISPER_SAMPLE_RATE,
            chunk_size,
            2, // sub chunks
            1, // mono
        )?;

        info!(
            "Resampler: {}Hz -> {}Hz (chunk_size={})",
            source_rate, WHISPER_SAMPLE_RATE, chunk_size
        );

        Ok(Self {
            resampler: Some(resampler),
            source_rate,
        })
    }

    pub fn process(&mut self, input: &[f32]) -> Result<Vec<f32>> {
        if let Some(ref mut resampler) = self.resampler {
            let frames_needed = resampler.input_frames_next();

            if input.len() < frames_needed {
                // Pad with zeros if we don't have enough samples
                let mut padded = input.to_vec();
                padded.resize(frames_needed, 0.0);
                let output = resampler.process(&[padded], None)?;
                Ok(output.into_iter().next().unwrap_or_default())
            } else {
                // Process in chunks
                let mut all_output = Vec::new();
                let mut offset = 0;

                while offset + frames_needed <= input.len() {
                    let chunk = &input[offset..offset + frames_needed];
                    let output = resampler.process(&[chunk.to_vec()], None)?;
                    if let Some(out) = output.into_iter().next() {
                        all_output.extend_from_slice(&out);
                    }
                    offset += frames_needed;
                }

                Ok(all_output)
            }
        } else {
            Ok(input.to_vec())
        }
    }

    pub fn target_rate(&self) -> u32 {
        WHISPER_SAMPLE_RATE as u32
    }

    pub fn source_rate(&self) -> u32 {
        self.source_rate as u32
    }
}

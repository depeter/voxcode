/// Simple energy-based voice activity detection.
/// A proper WebRTC VAD could be added later but this works for push-to-talk.
pub struct VoiceActivityDetector {
    threshold: f32,
    /// Number of consecutive low-energy frames before silence is declared
    silence_frames: usize,
    low_count: usize,
}

impl VoiceActivityDetector {
    pub fn new(threshold: f32, silence_frames: usize) -> Self {
        Self {
            threshold,
            silence_frames,
            low_count: 0,
        }
    }

    /// Check if a chunk of audio contains speech.
    /// Returns (is_speech, rms_energy).
    pub fn process(&mut self, samples: &[f32]) -> (bool, f32) {
        let rms = Self::compute_rms(samples);

        if rms >= self.threshold {
            self.low_count = 0;
            (true, rms)
        } else {
            self.low_count += 1;
            (self.low_count < self.silence_frames, rms)
        }
    }

    pub fn reset(&mut self) {
        self.low_count = 0;
    }

    fn compute_rms(samples: &[f32]) -> f32 {
        if samples.is_empty() {
            return 0.0;
        }
        let sum: f32 = samples.iter().map(|s| s * s).sum();
        (sum / samples.len() as f32).sqrt()
    }
}

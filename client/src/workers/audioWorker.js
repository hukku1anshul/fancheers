// Web Worker for Off-Thread Audio Computation & Concurrency Processing
// Keeps the main React / Three.js UI thread locked at 60 FPS even during 10,000 taps/second cheer spikes.

self.onmessage = function(e) {
  const { type, payload, id } = e.data;

  switch (type) {
    case 'CALCULATE_VELOCITY_ENVELOPE': {
      // Computes audio filter cutoff frequency and dynamic gain from cheer frequency
      const { cheerCount, durationWindowMs } = payload;
      const ratePerSec = (cheerCount / (durationWindowMs || 1000)) * 1000;
      
      // Cutoff scales dynamically from 300Hz (murmur) to 4800Hz (deafening roar)
      const cutoff = Math.min(4800, 300 + ratePerSec * 45);
      // Gain envelope scales from 0.05 to 0.95
      const targetGain = Math.min(0.95, 0.05 + (ratePerSec / 100) * 0.9);

      self.postMessage({
        id,
        type: 'VELOCITY_ENVELOPE_RESULT',
        result: { cutoff, targetGain, ratePerSec }
      });
      break;
    }

    case 'GENERATE_RADIO_SQUELCH': {
      // Generates procedural walkie-talkie start/end squelch bursts
      const sampleRate = payload.sampleRate || 44100;
      const length = Math.floor(sampleRate * 0.08); // 80ms burst
      const buffer = new Float32Array(length);

      for (let i = 0; i < length; i++) {
        // High-pass filtered noise + tone burst (1200Hz)
        const noise = (Math.random() * 2 - 1) * 0.4;
        const tone = Math.sin((2 * Math.PI * 1200 * i) / sampleRate) * 0.3;
        const decay = Math.exp(-i / (sampleRate * 0.02));
        buffer[i] = (noise + tone) * decay;
      }

      self.postMessage({
        id,
        type: 'RADIO_SQUELCH_RESULT',
        result: buffer
      }, [buffer.buffer]);
      break;
    }

    default:
      break;
  }
};

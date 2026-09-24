class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = typeof window !== 'undefined' ? localStorage.getItem('fanpulse_muted') === 'true' : false;
    this.ambientGain = null;
    this.ambientSource = null;
    this.ambientFilter = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fanpulse_muted', this.isMuted.toString());
    }
    if (this.isMuted && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Start procedural ambient stadium rumble (subtle stadium atmosphere)
  startAmbientCrowd() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.ambientSource = noise;
      this.ambientGain = gain;
      this.ambientFilter = filter;
      this.isAmbientPlaying = true;
    } catch (e) {}
  }

  // Dynamically swell crowd volume and frequency based on global cheer velocity
  swellCrowd(velocityRatio = 0.5) {
    if (this.isMuted || !this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;
    try {
      const targetGain = Math.min(0.04 + velocityRatio * 0.15, 0.25);
      const targetFreq = Math.min(280 + velocityRatio * 600, 1000);
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(targetGain, now + 0.3);
      this.ambientFilter.frequency.linearRampToValueAtTime(targetFreq, now + 0.3);
      
      // Auto-decay after 2 seconds
      this.ambientGain.gain.linearRampToValueAtTime(0.04, now + 2.5);
      this.ambientFilter.frequency.linearRampToValueAtTime(280, now + 2.5);
    } catch (e) {}
  }

  // Synthesize a stadium crowd roar with filtered noise
  playCrowdRoar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 1.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 1.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // Synthesize rhythmic stadium clap sequence: clap-clap clap-clap-clap
  playStadiumClap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const clapTimes = [0, 0.22, 0.50, 0.72, 0.94];
      const now = this.ctx.currentTime;

      clapTimes.forEach((offset) => {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now + offset);
        filter.Q.setValueAtTime(1.5, now + offset);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(now + offset);
      });
    } catch (e) {}
  }

  // Tense Heartbeat Thump (Double thump for clutch / penalty / review)
  playHeartbeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.16].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 68 : 55, now + offset);
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.12);

        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch (e) {}
  }

  // Synthesize an airhorn blast
  playAirhorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freqs = [466.16, 587.33, 698.46]; // Bb chord
      const now = this.ctx.currentTime;

      freqs.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  // Referee Whistle
  playWhistle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [2800, 3100].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + 150, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (e) {}
  }

  // Tap sound with rising pitch on combo streak
  playTap(streak = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 220 + Math.min(streak * 25, 450);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Melodic chant chime
  playChantBeep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // Procedural Stadium Choir Sing-Along Synthesis
  playChoirChant(chantType = 'allez') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Melodic notes for crowd chant (e.g. Eb4, G4, Bb4, C5)
      const chord = [311.13, 392.00, 466.16, 523.25];

      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        // Formant filter to mimic collective human voices ("Ooooh" / "Allez")
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650 + (i * 120), now);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.2 + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + 1.8);
      });

      // Layer stadium applause
      this.playClap();
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
export const soundEffects = soundEngine;

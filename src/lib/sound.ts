"use client";
/**
 * SoundManager — fully synthesised with WebAudio (no audio files).
 * Off by default and only ever started from a user gesture (the SOUND toggle).
 * Mirrors the reference clips' riser → breath → lift envelope:
 * an ambient pad, a 3 s riser on entry, a whoosh on whips, soft hover ticks.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pad: { stop: () => void } | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = false;
  private lastTick = 0;

  get isEnabled() {
    return this.enabled;
  }

  async enable() {
    if (this.enabled) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx ??= new Ctor();
    await this.ctx.resume();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.master.gain.linearRampToValueAtTime(0.9, this.ctx.currentTime + 1.2);
    this.noise = this.makeNoise();
    this.pad = this.startPad();
    this.enabled = true;
  }

  disable() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const m = this.master;
    const pad = this.pad;
    m.gain.cancelScheduledValues(this.ctx.currentTime);
    m.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    window.setTimeout(() => {
      pad?.stop();
      m.disconnect();
    }, 700);
    this.pad = null;
    this.master = null;
    this.enabled = false;
  }

  private makeNoise() {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private startPad() {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0.045;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    const oscs = [55, 82.41, 110.3, 164.8].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sawtooth";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 6;
      o.connect(filter);
      o.start();
      return o;
    });
    filter.connect(out).connect(this.master!);
    lfo.start();
    return {
      stop: () => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      },
    };
  }

  /** Riser: 0–3 s swell (mirrors the clips' −41 → −19 dB envelope). */
  riser() {
    if (!this.enabled || !this.ctx || !this.master || !this.noise) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 2.5;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 2.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    const tone = ctx.createOscillator();
    tone.type = "sine";
    tone.frequency.setValueAtTime(110, t);
    tone.frequency.exponentialRampToValueAtTime(440, t + 3);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.0001, t);
    tg.gain.exponentialRampToValueAtTime(0.05, t + 2.8);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    src.connect(bp).connect(g).connect(this.master);
    tone.connect(tg).connect(this.master);
    src.start(t);
    tone.start(t);
    src.stop(t + 3.7);
    tone.stop(t + 3.7);
  }

  /** Whoosh for whip-pans (0.5 s). */
  whoosh() {
    if (!this.enabled || !this.ctx || !this.master || !this.noise) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.22);
    bp.frequency.exponentialRampToValueAtTime(500, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.6);
  }

  /** Soft hover tick (rate-limited). */
  tick() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = performance.now();
    if (now - this.lastTick < 70) return;
    this.lastTick = now;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(1800, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.06);
  }
}

export const sound = new SoundManager();

// Web Audio API chiptune synthesizer for authentic retro Pokemon audio.
// Zero external dependencies, pure browser audio.

interface Note {
  freq: number;
  time: number;
  dur: number;
  vol?: number;
  wave?: OscillatorType;
}

interface Sweep {
  startFreq: number;
  endFreq: number;
  dur: number;
  vol: number;
  wave: OscillatorType;
}

class RetroAudio {
  private ctx: AudioContext | null = null;
  private suspendedByGame = false;
  private masterVolume: number;
  public enabled = true;

  constructor() {
    this.masterVolume = this.readStoredVolume();

    if (typeof window !== "undefined") {
      const savedEnabled = localStorage.getItem("portfolio_sound_enabled");
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === "true";
      }
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_sound_enabled", String(this.enabled));
    }
    return this.enabled;
  }

  public setMasterVolume(v: number): void {
    this.masterVolume = Math.min(1, Math.max(0, v));
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_master_volume", String(this.masterVolume));
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public suspend(): void {
    this.suspendedByGame = true;
    this.ctx?.suspend().catch(() => {});
  }

  public resume(): void {
    this.suspendedByGame = false;
    if (this.ctx?.state === "suspended" && this.enabled) {
      this.ctx.resume().catch(() => {});
    }
  }

  private readStoredVolume(): number {
    if (typeof window === "undefined") return 1;
    const saved = Number.parseFloat(localStorage.getItem("portfolio_master_volume") ?? "1");
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 1;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || this.suspendedByGame || typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }

    if (this.ctx?.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private playSequence(notes: Note[]): void {
    const ctx = this.getContext();
    if (!ctx || this.masterVolume <= 0) return;

    const now = ctx.currentTime;

    notes.forEach((note) => {
      const start = now + note.time;
      const end = start + note.dur;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const volume = (note.vol ?? 0.15) * this.masterVolume;

      osc.type = note.wave ?? "sine";
      osc.frequency.setValueAtTime(note.freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(volume, start + Math.min(0.02, note.dur / 4));
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end);
    });
  }

  private playSweep({ startFreq, endFreq, dur, vol, wave }: Sweep): void {
    const ctx = this.getContext();
    if (!ctx || this.masterVolume <= 0) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol * this.masterVolume, now + Math.min(0.05, dur / 4));
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  public playDoorChime(): void {
    this.playSequence([
      { freq: 659.25, time: 0, dur: 0.12, vol: 0.18, wave: "sine" },
      { freq: 880, time: 0.1, dur: 0.22, vol: 0.18, wave: "sine" },
    ]);
  }

  public playLocationChime(): void {
    this.playSequence([
      { freq: 587.33, time: 0, dur: 0.09, vol: 0.08, wave: "sine" },
      { freq: 880, time: 0.07, dur: 0.16, vol: 0.08, wave: "sine" },
    ]);
  }

  public playHealJingle(): void {
    this.playSequence([
      { freq: 493.88, time: 0, dur: 0.11, vol: 0.14, wave: "square" },
      { freq: 493.88, time: 0.12, dur: 0.11, vol: 0.14, wave: "square" },
      { freq: 493.88, time: 0.24, dur: 0.11, vol: 0.14, wave: "square" },
      { freq: 659.25, time: 0.38, dur: 0.22, vol: 0.14, wave: "square" },
      { freq: 830.61, time: 0.62, dur: 0.16, vol: 0.14, wave: "square" },
      { freq: 987.77, time: 0.8, dur: 0.38, vol: 0.14, wave: "square" },
    ]);
  }

  public playVictoryFanfare(): void {
    this.playSequence([
      { freq: 523.25, time: 0, dur: 0.12, vol: 0.24, wave: "triangle" },
      { freq: 659.25, time: 0.13, dur: 0.12, vol: 0.24, wave: "triangle" },
      { freq: 783.99, time: 0.26, dur: 0.12, vol: 0.24, wave: "triangle" },
      { freq: 1046.5, time: 0.39, dur: 0.28, vol: 0.24, wave: "triangle" },
      { freq: 783.99, time: 0.7, dur: 0.12, vol: 0.24, wave: "triangle" },
      { freq: 1046.5, time: 0.85, dur: 0.55, vol: 0.24, wave: "triangle" },
    ]);
    this.playSequence([
      { freq: 523.25, time: 0.85, dur: 0.6, vol: 0.08, wave: "square" },
      { freq: 659.25, time: 0.85, dur: 0.6, vol: 0.08, wave: "square" },
      { freq: 783.99, time: 0.85, dur: 0.6, vol: 0.08, wave: "square" },
      { freq: 1046.5, time: 0.85, dur: 0.6, vol: 0.08, wave: "square" },
    ]);
  }

  public playBadgeUnlock(): void {
    this.playSequence(
      [659.25, 783.99, 987.77, 1318.5].map((freq, index) => ({
        freq,
        time: index * 0.08,
        dur: 0.25,
        vol: 0.18,
        wave: "sine" as OscillatorType,
      })),
    );
  }

  public playInteract(): void {
    this.playSweep({
      startFreq: 440,
      endFreq: 880,
      dur: 0.05,
      vol: 0.08,
      wave: "triangle",
    });
  }

  public playBattleStart(): void {
    this.playSequence([
      { freq: 440, time: 0, dur: 0.08, vol: 0.18, wave: "square" },
      { freq: 554.37, time: 0.08, dur: 0.08, vol: 0.18, wave: "square" },
      { freq: 659.25, time: 0.16, dur: 0.08, vol: 0.18, wave: "square" },
      { freq: 880, time: 0.24, dur: 0.16, vol: 0.18, wave: "square" },
      { freq: 783.99, time: 0.4, dur: 0.1, vol: 0.18, wave: "square" },
      { freq: 987.77, time: 0.5, dur: 0.35, vol: 0.18, wave: "square" },
    ]);
  }

  public playPokeballThrow(): void {
    this.playSweep({
      startFreq: 350,
      endFreq: 1100,
      dur: 0.38,
      vol: 0.16,
      wave: "sine",
    });
  }

  public playPokeballOpen(): void {
    this.playSweep({
      startFreq: 1200,
      endFreq: 300,
      dur: 0.05,
      vol: 0.2,
      wave: "square",
    });
    this.playSequence(
      [880, 1108.73, 1318.51, 1760].map((freq, index) => ({
        freq,
        time: 0.04 + index * 0.04,
        dur: 0.22,
        vol: 0.15,
        wave: "triangle" as OscillatorType,
      })),
    );
  }

  public playAttackHit(): void {
    this.playSweep({
      startFreq: 220,
      endFreq: 45,
      dur: 0.15,
      vol: 0.25,
      wave: "sawtooth",
    });
  }

  public playSuperEffective(): void {
    this.playSweep({
      startFreq: 320,
      endFreq: 30,
      dur: 0.22,
      vol: 0.3,
      wave: "sawtooth",
    });
    this.playSweep({
      startFreq: 650,
      endFreq: 1200,
      dur: 0.15,
      vol: 0.18,
      wave: "square",
    });
  }

  public playFaint(): void {
    this.playSweep({
      startFreq: 400,
      endFreq: 50,
      dur: 0.6,
      vol: 0.2,
      wave: "sawtooth",
    });
  }

  public playRun(): void {
    this.playSweep({
      startFreq: 300,
      endFreq: 900,
      dur: 0.2,
      vol: 0.15,
      wave: "triangle",
    });
  }
}

export const sound = new RetroAudio();

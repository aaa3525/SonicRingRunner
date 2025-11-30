import { MUSIC_TRACKS } from '../constants';

class AudioService {
  private bgMusic: HTMLAudioElement | null = null;
  private sfxRing: HTMLAudioElement | null = null;
  private isMusicEnabled: boolean = false;
  private currentTrackId: string = 'greenhill';

  constructor() {
    this.bgMusic = new Audio();
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;
    
    // Prevent errors if file is missing
    this.bgMusic.onerror = () => {
      console.warn("Background music file not found or format unsupported.");
    };

    // Initialize Ring Sound
    this.sfxRing = new Audio('audio/ring-collect.mp3');
    this.sfxRing.volume = 0.6;
    this.sfxRing.onerror = () => {
       // Silent fail, we will fallback to beep in playRingSound
    };
    // Preload
    this.sfxRing.load();
  }

  init() {
    this.loadTrack(this.currentTrackId);
  }

  loadTrack(trackId: string) {
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (track && this.bgMusic) {
      this.currentTrackId = trackId;
      this.bgMusic.src = track.src;
      if (this.isMusicEnabled) {
        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Auto-play was prevented or file not found. 
            // We suppress this error to keep console clean.
          });
        }
      }
    }
  }

  toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.bgMusic) {
      if (this.isMusicEnabled) {
        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("Audio autoplay blocked by browser. User interaction needed.");
          });
        }
      } else {
        this.bgMusic.pause();
      }
    }
    return this.isMusicEnabled;
  }

  playRingSound() {
    if (!this.isMusicEnabled) return;

    if (this.sfxRing && this.sfxRing.readyState >= 2) {
      // Clone node to allow rapid overlapping playback (machine gun effect)
      const sound = this.sfxRing.cloneNode() as HTMLAudioElement;
      sound.volume = 0.6;
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // If real audio fails (missing file), use synth
          this.playFallbackBeep();
        });
      }
    } else {
      this.playFallbackBeep();
    }
  }

  playDamageSound() {
    if (!this.isMusicEnabled) return;
    try {
      // Synthesize a chaotic slide/crash sound for losing rings
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        // Pitch slide down specifically for "damage" feel
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Ignore
    }
  }

  private playFallbackBeep() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Ignore
    }
  }

  playGameOverSound() {
    if (!this.isMusicEnabled) return;
     try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      // Ignore
    }
  }

  isMusicPlaying() {
    return this.isMusicEnabled;
  }
}

export const audioService = new AudioService();
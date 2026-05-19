type AudioType = 'bgm' | 'sfx' | 'voice';

interface AudioTrack {
  id: string;
  src: string;
  loop?: boolean;
  volume?: number;
}

const BGM_TRACKS: AudioTrack[] = [
  { id: 'menu', src: '/audio/bgm_menu.mp3', loop: true, volume: 0.5 },
  { id: 'chapter1', src: '/audio/bgm_office.mp3', loop: true, volume: 0.4 },
  { id: 'chapter2', src: '/audio/bgm_dream.mp3', loop: true, volume: 0.4 },
  { id: 'chapter3', src: '/audio/bgm_therapy.mp3', loop: true, volume: 0.4 },
  { id: 'ending_good', src: '/audio/bgm_ending_good.mp3', loop: false, volume: 0.6 },
  { id: 'ending_bad', src: '/audio/bgm_ending_bad.mp3', loop: false, volume: 0.5 },
];

const SFX_SOUNDS: AudioTrack[] = [
  { id: 'click', src: '/audio/sfx_click.mp3', volume: 0.8 },
  { id: 'transition', src: '/audio/sfx_transition.mp3', volume: 0.6 },
  { id: 'emotion_success', src: '/audio/sfx_success.mp3', volume: 0.7 },
  { id: 'emotion_fail', src: '/audio/sfx_fail.mp3', volume: 0.6 },
  { id: 'notification', src: '/audio/sfx_notify.mp3', volume: 0.5 },
];

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxPool: Map<string, HTMLAudioElement[]> = new Map();
  private currentBgmId: string | null = null;
  private volumes: Record<AudioType, number> = {
    bgm: 0.7,
    sfx: 0.8,
    voice: 1.0,
  };
  private muted: Record<AudioType, boolean> = {
    bgm: false,
    sfx: false,
    voice: false,
  };
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    this.bgmAudio = new Audio();
    this.bgmAudio.preload = 'auto';
    
    this.preloadSfx();
  }

  private preloadSfx() {
    SFX_SOUNDS.forEach((sound) => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(sound.src);
        audio.volume = (sound.volume || 1) * this.volumes.sfx;
        pool.push(audio);
      }
      this.sfxPool.set(sound.id, pool);
    });
  }

  setVolume(type: AudioType, value: number) {
    this.volumes[type] = Math.max(0, Math.min(1, value));
    
    if (type === 'bgm' && this.bgmAudio) {
      this.bgmAudio.volume = this.volumes.bgm * (BGM_TRACKS.find(t => t.id === this.currentBgmId)?.volume || 0.5);
    }
  }

  getVolume(type: AudioType): number {
    return this.volumes[type];
  }

  mute(type?: AudioType) {
    if (type) {
      this.muted[type] = true;
      if (type === 'bgm' && this.bgmAudio) {
        this.bgmAudio.muted = true;
      }
    } else {
      Object.keys(this.muted).forEach(key => {
        this.muted[key as AudioType] = true;
      });
      if (this.bgmAudio) {
        this.bgmAudio.muted = true;
      }
    }
  }

  unmute(type?: AudioType) {
    if (type) {
      this.muted[type] = false;
      if (type === 'bgm' && this.bgmAudio) {
        this.bgmAudio.muted = false;
      }
    } else {
      Object.keys(this.muted).forEach(key => {
        this.muted[key as AudioType] = false;
      });
      if (this.bgmAudio) {
        this.bgmAudio.muted = false;
      }
    }
  }

  isMuted(type: AudioType): boolean {
    return this.muted[type];
  }

  async playBGM(trackId: string, options?: { fadeIn?: number }): Promise<void> {
    if (!this.bgmAudio || this.muted.bgm) return;
    
    const track = BGM_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    if (this.currentBgmId === trackId && !this.bgmAudio.paused) return;

    const fadeIn = options?.fadeIn ?? 1000;

    if (this.bgmAudio.src) {
      await this.stopBGM(fadeIn / 2);
    }

    this.bgmAudio.src = track.src;
    this.bgmAudio.loop = track.loop ?? true;
    this.bgmAudio.volume = 0;

    try {
      await this.bgmAudio.play();
      this.currentBgmId = trackId;

      const targetVolume = track.volume ?? 0.5 * this.volumes.bgm;
      await this.fadeVolume(this.bgmAudio, targetVolume, fadeIn);
    } catch (error) {
      console.warn('BGM playback failed:', error);
    }
  }

  async stopBGM(fadeOut: number = 500): Promise<void> {
    if (!this.bgmAudio || !this.bgmAudio.src) return;

    await this.fadeVolume(this.bgmAudio, 0, fadeOut);
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
    this.currentBgmId = null;
  }

  pauseBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  resumeBGM() {
    if (this.bgmAudio && this.bgmAudio.paused && !this.muted.bgm) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  playSFX(soundId: string): void {
    if (this.muted.sfx) return;

    const pool = this.sfxPool.get(soundId);
    if (!pool) return;

    const audio = pool.find(a => a.paused) || pool[0];
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }

    audio.volume = (SFX_SOUNDS.find(s => s.id === soundId)?.volume || 1) * this.volumes.sfx;
    audio.play().catch(() => {});
  }

  private fadeVolume(audio: HTMLAudioElement, target: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume + (target - startVolume) * this.easeOutCubic(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  getCurrentBgmId(): string | null {
    return this.currentBgmId;
  }
}

export const audioManager = new AudioManager();

export function useAudio() {
  return audioManager;
}

export interface TimerCallbacks {
  onTick?: (remainingSeconds: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export class MeditationTimer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private remainingSeconds: number = 0;
  private originalDuration: number = 0;
  private callbacks: TimerCallbacks = {};
  private isRunning = false;

  constructor(callbacks: TimerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  start(durationSeconds: number): void {
    if (this.isRunning) {
      this.stop();
    }

    this.originalDuration = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.remainingSeconds -= 1;
      this.callbacks.onTick?.(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.callbacks.onComplete?.();
      }
    }, 1000);
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
    }
  }

  resume(): void {
    if (!this.isRunning && this.remainingSeconds > 0) {
      this.isRunning = true;
      this.intervalId = setInterval(() => {
        this.remainingSeconds -= 1;
        this.callbacks.onTick?.(this.remainingSeconds);

        if (this.remainingSeconds <= 0) {
          this.stop();
          this.callbacks.onComplete?.();
        }
      }, 1000);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  reset(): void {
    this.stop();
    this.remainingSeconds = 0;
  }

  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getProgress(): number {
    if (this.originalDuration === 0) return 0;
    const elapsed = this.originalDuration - this.remainingSeconds;
    return Math.min(elapsed / this.originalDuration, 1);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

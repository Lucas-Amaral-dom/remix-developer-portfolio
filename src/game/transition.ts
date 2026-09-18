// Pokemon-style screen transition engine (Canvas 2D overlay)
// Supports Iris Circle Wipe, Venetian Shutter Blinds, Diamond Grid, and Smooth Fade.

export type TransitionType = "iris" | "shutter" | "diamond" | "fade";

export interface TransitionPoint {
  x: number;
  y: number;
}

export interface TransitionOptions {
  type: TransitionType;
  origin: TransitionPoint;
  onMidpoint: () => void;
  getNewOrigin?: () => TransitionPoint;
  onComplete: () => void;
  duration?: number; // duration per half in ms, default ~320ms
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class TransitionManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animId: number | null = null;
  private activeType: TransitionType = "iris";
  public isRunning: boolean = false;

  constructor(container: HTMLElement, width = 960, height = 704) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "40";
    this.canvas.className = "pixel-crisp";
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
  }

  public setType(type: TransitionType) {
    this.activeType = type;
  }

  public getType(): TransitionType {
    return this.activeType;
  }

  public runTransition(opts: TransitionOptions) {
    if (!this.ctx) {
      opts.onMidpoint();
      opts.onComplete();
      return;
    }

    this.cancel();
    this.isRunning = true;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const halfDuration = opts.duration ?? 320;
    const type = opts.type || this.activeType;

    let origin = { ...opts.origin };
    let startTime: number | null = null;
    let phase: "closing" | "pause" | "opening" = "closing";
    let pauseStartTime = 0;
    const pauseDuration = 80; // brief dark pause while scene swaps underneath

    const renderFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      if (phase === "closing") {
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / halfDuration);
        const eased = easeInOutCubic(progress);

        this.drawTransition(ctx, type, eased, origin, w, h, false);

        if (progress >= 1) {
          // Midpoint reached: screen is 100% black
          phase = "pause";
          pauseStartTime = timestamp;

          // Swap the scene and get new player spawn screen coords
          opts.onMidpoint();
          if (opts.getNewOrigin) {
            origin = opts.getNewOrigin();
          }
        }
      } else if (phase === "pause") {
        // Keep screen fully black for a beat
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#120e0c";
        ctx.fillRect(0, 0, w, h);

        if (timestamp - pauseStartTime >= pauseDuration) {
          phase = "opening";
          startTime = timestamp;
        }
      } else if (phase === "opening") {
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / halfDuration);
        const eased = easeInOutCubic(progress);

        this.drawTransition(ctx, type, eased, origin, w, h, true);

        if (progress >= 1) {
          // Fully opened
          this.isRunning = false;
          ctx.clearRect(0, 0, w, h);
          this.animId = null;
          opts.onComplete();
          return;
        }
      }

      this.animId = requestAnimationFrame(renderFrame);
    };

    this.animId = requestAnimationFrame(renderFrame);
  }

  private drawTransition(
    ctx: CanvasRenderingContext2D,
    type: TransitionType,
    eased: number,
    origin: TransitionPoint,
    w: number,
    h: number,
    isOpening: boolean,
  ) {
    ctx.clearRect(0, 0, w, h);

    const darkColor = "#120e0c";

    switch (type) {
      case "iris": {
        // Pokemon Circular Iris Aperture
        // When closing: aperture radius goes from max to 0
        // When opening: aperture radius goes from 0 to max
        const cx = Math.max(0, Math.min(w, origin.x));
        const cy = Math.max(0, Math.min(h, origin.y));
        const maxRadius = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 40;

        const currentRadius = isOpening ? maxRadius * eased : maxRadius * (1 - eased);

        // Fill background with dark color
        ctx.fillStyle = darkColor;
        ctx.fillRect(0, 0, w, h);

        // Cut out the iris circle aperture
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        // Restore blend mode
        ctx.globalCompositeOperation = "source-over";

        // Draw classic Pokemon retro golden-ember border ring around the iris aperture
        if (currentRadius > 4 && currentRadius < maxRadius - 10) {
          ctx.strokeStyle = "#e8b84b";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, currentRadius), 0, Math.PI * 2);
          ctx.stroke();

          // Outer subtle dark contour ring
          ctx.strokeStyle = "#2e1e18";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, currentRadius + 3), 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case "shutter": {
        // Horizontal Venetian Blinds / Screen Slats
        const SLATS = 14;
        const slatH = Math.ceil(h / SLATS);
        const fraction = isOpening ? 1 - eased : eased;

        ctx.fillStyle = darkColor;

        for (let i = 0; i < SLATS; i++) {
          const y = i * slatH;
          const bandW = w * fraction;
          if (i % 2 === 0) {
            // Slides from left
            ctx.fillRect(0, y, bandW, slatH + 1);
            if (fraction > 0.05 && fraction < 0.98) {
              ctx.fillStyle = "#e8b84b";
              ctx.fillRect(bandW - 3, y, 3, slatH + 1);
              ctx.fillStyle = darkColor;
            }
          } else {
            // Slides from right
            ctx.fillRect(w - bandW, y, bandW, slatH + 1);
            if (fraction > 0.05 && fraction < 0.98) {
              ctx.fillStyle = "#e8b84b";
              ctx.fillRect(w - bandW, y, 3, slatH + 1);
              ctx.fillStyle = darkColor;
            }
          }
        }
        break;
      }

      case "diamond": {
        // Retro Pokemon Diamond Grid Wipe
        const tileSize = 48;
        const cols = Math.ceil(w / tileSize) + 2;
        const rows = Math.ceil(h / tileSize) + 2;
        const fraction = isOpening ? 1 - eased : eased;
        const maxScale = tileSize * 1.5;
        const curScale = maxScale * fraction;

        ctx.fillStyle = darkColor;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = c * tileSize;
            const cy = r * tileSize;

            ctx.beginPath();
            ctx.moveTo(cx, cy - curScale);
            ctx.lineTo(cx + curScale, cy);
            ctx.lineTo(cx, cy + curScale);
            ctx.lineTo(cx - curScale, cy);
            ctx.closePath();
            ctx.fill();
          }
        }
        break;
      }

      case "fade":
      default: {
        // Silky smooth 60fps black fade
        const alpha = isOpening ? 1 - eased : eased;
        ctx.fillStyle = darkColor;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;
        break;
      }
    }
  }

  public cancel() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isRunning = false;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public destroy() {
    this.cancel();
    this.canvas.remove();
  }
}

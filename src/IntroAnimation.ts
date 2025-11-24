import { Group, Sprite, SpriteMaterial, type Texture } from "three";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";

export class IntroAnimation extends Group {
  private sprite: Sprite;
  private isActive: boolean = false;
  private elapsedTime: number = 0;
  private onComplete: () => void;

  // Animation parameters
  private duration: number = 1.0; // Total duration in seconds
  private startScale: number = 50; // Initial size
  private endScale: number = Math.max(GAME_WIDTH, GAME_HEIGHT) * 2; // Final size (cover screen)

  constructor(texture: Texture, onComplete: () => void) {
    super();
    this.onComplete = onComplete;

    const material = new SpriteMaterial({ map: texture });
    this.sprite = new Sprite(material);
    this.sprite.scale.set(this.startScale, this.startScale, 1);
    this.sprite.visible = false;
    this.add(this.sprite);

    // Ensure it's on top of everything
    this.renderOrder = 1000;
    this.position.z = 4.8; // Just in front of everything else (camera is at 5)
  }

  public start() {
    this.isActive = true;
    this.elapsedTime = 0;
    this.sprite.visible = true;
    this.sprite.scale.set(this.startScale, this.startScale, 1);
    this.sprite.material.opacity = 1;
  }

  public update(deltaTime: number) {
    if (!this.isActive) return;

    this.elapsedTime += deltaTime;
    const progress = Math.min(this.elapsedTime / this.duration, 1);

    // Accelerating ease (quadratic or cubic)
    const ease = progress * progress * progress;

    const currentScale =
      this.startScale + (this.endScale - this.startScale) * ease;
    this.sprite.scale.set(currentScale, currentScale, 1);

    // Fade out in the last 20% of the animation
    if (progress > 0.8) {
      const fadeProgress = (progress - 0.8) / 0.2;
      this.sprite.material.opacity = 1 - fadeProgress;
    } else {
      this.sprite.material.opacity = 1;
    }

    if (progress >= 1) {
      this.isActive = false;
      this.sprite.visible = false;
      this.onComplete();
    }
  }

  public setDuration(duration: number) {
    this.duration = duration;
  }
}

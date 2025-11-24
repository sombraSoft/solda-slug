import {
  Audio,
  type AudioListener,
  type OrthographicCamera,
  type PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  type Texture,
  type Vector2,
  Vector3,
} from "three";
import { SOLDERING_IRON_SCALE } from "./constants";
import { SmokeSystem } from "./SmokeSystem";

export class SolderingIron extends Sprite {
  private defaultTexture: Texture;
  private hotTexture: Texture;
  private sound: Audio;
  public isSoldering: boolean = false;
  public smokeSystem: SmokeSystem;

  constructor(
    private camera: PerspectiveCamera | OrthographicCamera,
    audioListener: AudioListener,
    defaultTexture: Texture,
    hotTexture: Texture,
    soundBuffer: AudioBuffer,
  ) {
    const material = new SpriteMaterial({
      map: defaultTexture,
      depthTest: false,
    });
    super(material);

    this.defaultTexture = defaultTexture;
    this.hotTexture = hotTexture;

    this.sound = new Audio(audioListener);
    this.sound.setBuffer(soundBuffer);
    this.sound.setLoop(true);

    this.scale.set(SOLDERING_IRON_SCALE, SOLDERING_IRON_SCALE, 1);
    this.center.set(0.06, 0.95);
    this.renderOrder = 201; // Ensure it renders on top of Xandao

    this.smokeSystem = new SmokeSystem();
  }

  public update(deltaTime: number, mouse: Vector2) {
    this.updatePosition(mouse);
    this.smokeSystem.update(deltaTime);

    // Only smoke if we are soldering AND hitting the target (sound is playing)
    if (this.isSoldering && this.sound.isPlaying) {
      // Spawn smoke at the tip (current position)
      // Since center is set to the tip, this.position is the tip location
      this.smokeSystem.spawn(this.position);
    }
  }

  private updatePosition(mouse: Vector2) {
    const mouse3D = new Vector3(mouse.x, mouse.y, 0.5);
    mouse3D.unproject(this.camera);
    this.position.copy(mouse3D);
    // z=4.8 to be in front of mute button (z=4.5) but behind camera (z=5)
    this.position.z = 4.8;
  }

  public heat(): void {
    this.isSoldering = true;
    if (this.hotTexture) {
      this.material.map = this.hotTexture;
      this.material.needsUpdate = true;
    }
  }

  public cool(): void {
    this.isSoldering = false;
    if (this.defaultTexture) {
      this.material.map = this.defaultTexture;
      this.material.needsUpdate = true;
    }
    this.stopSound();
  }

  public startSound(): void {
    if (this.sound && !this.sound.isPlaying) {
      this.sound.play();
    }
  }

  public stopSound(): void {
    if (this.sound?.isPlaying) this.sound.stop();
  }

  public reset(): void {
    this.cool();
    this.smokeSystem.reset();
  }
}

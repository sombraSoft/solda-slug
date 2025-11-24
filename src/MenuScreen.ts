import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  type Texture,
} from "three";
import { TextButton } from "./TextButton";

export class MenuScreen extends Group {
  public startButton: TextButton;
  private background: Mesh;
  private pulseTimer: number = 0;

  constructor(onStart: () => void, backgroundTexture: Texture) {
    super();

    // Background
    const bgGeometry = new PlaneGeometry(1920, 1080);
    const bgMaterial = new MeshBasicMaterial({ map: backgroundTexture });
    this.background = new Mesh(bgGeometry, bgMaterial);
    this.add(this.background);

    // Start Button
    this.startButton = new TextButton("COMEÇAR", 48, onStart);
    this.startButton.position.set(0, -50, 0);
    // Store the base scale in userData for the animation
    this.startButton.userData.baseScaleX = this.startButton.scale.x;
    this.startButton.userData.baseScaleY = this.startButton.scale.y;
    this.add(this.startButton);

    this.position.z = 4; // Ensure it's on top (camera is at z=5)
  }

  public update(deltaTime: number) {
    this.pulseTimer += deltaTime;
    const pulseSpeed = 3;
    const pulseMagnitude = 0.05;
    const scaleFactor =
      1 + Math.sin(this.pulseTimer * pulseSpeed) * pulseMagnitude;

    this.startButton.scale.set(
      this.startButton.userData.baseScaleX * scaleFactor,
      this.startButton.userData.baseScaleY * scaleFactor,
      1,
    );
  }

  public hideContent() {
    this.startButton.visible = false;
  }

  public reset() {
    this.startButton.onHover(false);
    this.startButton.visible = true;
    this.pulseTimer = 0; // Reset timer
  }
}

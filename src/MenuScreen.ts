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

  constructor(onStart: () => void, backgroundTexture: Texture) {
    super();

    // Background
    const bgGeometry = new PlaneGeometry(1920, 1080);
    const bgMaterial = new MeshBasicMaterial({ map: backgroundTexture });
    this.background = new Mesh(bgGeometry, bgMaterial);
    this.add(this.background);

    // Start Button
    this.startButton = new TextButton("COMEÇAR", 40, onStart);
    this.startButton.position.set(0, -50, 0);
    this.add(this.startButton);

    this.position.z = 4; // Ensure it's on top (camera is at z=5)
  }

  public hideContent() {
    this.startButton.visible = false;
  }

  public reset() {
    this.startButton.onHover(false);
    this.startButton.visible = true;
  }
}

import {
  MathUtils,
  Sprite,
  SpriteMaterial,
  type Texture,
  Vector3,
} from "three";
import { GAME_HEIGHT, GAME_WIDTH, XANDAO_SCALE } from "./constants";

type XandaoState =
  | "hidden"
  | "almost_peeking"
  | "moving_to_peek"
  | "peeking"
  | "retreating";
type SpawnEdge = "left" | "right" | "bottom";

export class Xandao extends Sprite {
  private state: XandaoState = "hidden";
  private timer: number = 0;
  private almostPeekDuration: number = 0; // Will be randomized
  private peekDuration: number = 2; // Fixed 2 seconds
  private spawnEdge: SpawnEdge = "left";

  // Positions
  private startPos = new Vector3();
  private almostPeekPos = new Vector3();
  private peekPos = new Vector3();

  constructor(texture: Texture) {
    const material = new SpriteMaterial({ map: texture, depthTest: false });
    super(material);

    const image = texture.image as HTMLImageElement;
    const aspectRatio = image.width / image.height;
    this.scale.set(XANDAO_SCALE * aspectRatio, XANDAO_SCALE, 1);

    this.renderOrder = 200; // High render order to appear on top
    this.center.set(0.5, 0.5); // Set pivot to center for rotation
    this.reset();
  }

  public update(deltaTime: number) {
    if (this.state === "hidden") return;

    this.timer += deltaTime;

    if (this.state === "almost_peeking") {
      const alpha = Math.min(this.timer / 0.5, 1);
      this.position.lerpVectors(this.startPos, this.almostPeekPos, alpha);
      if (this.timer >= this.almostPeekDuration) {
        this.state = "moving_to_peek";
        this.timer = 0;
      }
    } else if (this.state === "moving_to_peek") {
      const alpha = Math.min(this.timer / 0.3, 1);
      this.position.lerpVectors(this.almostPeekPos, this.peekPos, alpha);
      if (alpha >= 1) {
        this.state = "peeking";
        this.timer = 0;
      }
    } else if (this.state === "peeking") {
      if (this.timer >= this.peekDuration) {
        this.retreat();
      }
    } else if (this.state === "retreating") {
      const alpha = Math.min(this.timer / 0.5, 1);
      this.position.lerpVectors(this.peekPos, this.startPos, alpha);
      if (alpha >= 1) {
        this.state = "hidden";
      }
    }
  }

  public startPeeking() {
    if (this.state !== "hidden") return;

    this.state = "almost_peeking";
    this.timer = 0;
    this.visible = true;
    this.almostPeekDuration = MathUtils.randFloat(1, 4); // Stay almost peeking for 1-4s

    this.setupMovement();

    this.position.copy(this.startPos);
  }

  public retreat() {
    if (this.state === "peeking") {
      this.state = "retreating";
      this.timer = 0;
    }
  }

  public isPeeking(): boolean {
    return this.state === "peeking";
  }

  public reset() {
    this.state = "hidden";
    this.visible = false;
    this.timer = 0;
    this.position.set(9999, 9999, 0); // Move way off-screen
  }

  private setupMovement() {
    const edges: SpawnEdge[] = ["left", "right", "bottom"];
    this.spawnEdge = edges[Math.floor(Math.random() * edges.length)] ?? "left";

    const spriteHeight = this.scale.y;

    const almostPeekAmount = spriteHeight * 0.2; // Show 20% of height
    const peekAmount = spriteHeight * 0.5; // Show 50% of height

    switch (this.spawnEdge) {
      case "left":
        this.startPos.x = -GAME_WIDTH / 2 - spriteHeight / 2;
        this.almostPeekPos.x =
          -GAME_WIDTH / 2 - spriteHeight / 2 + almostPeekAmount;
        this.peekPos.x = -GAME_WIDTH / 2 - spriteHeight / 2 + peekAmount;
        this.startPos.y = MathUtils.randFloat(
          -GAME_HEIGHT / 3,
          GAME_HEIGHT / 3,
        );
        this.almostPeekPos.y = this.startPos.y;
        this.peekPos.y = this.startPos.y;
        this.material.rotation = -Math.PI / 2; // Pointing right
        break;
      case "right":
        this.startPos.x = GAME_WIDTH / 2 + spriteHeight / 2;
        this.almostPeekPos.x =
          GAME_WIDTH / 2 + spriteHeight / 2 - almostPeekAmount;
        this.peekPos.x = GAME_WIDTH / 2 + spriteHeight / 2 - peekAmount;
        this.startPos.y = MathUtils.randFloat(
          -GAME_HEIGHT / 3,
          GAME_HEIGHT / 3,
        );
        this.almostPeekPos.y = this.startPos.y;
        this.peekPos.y = this.startPos.y;
        this.material.rotation = Math.PI / 2; // Pointing left
        break;
      case "bottom":
        this.startPos.y = -GAME_HEIGHT / 2 - spriteHeight / 2;
        this.almostPeekPos.y =
          -GAME_HEIGHT / 2 - spriteHeight / 2 + almostPeekAmount;
        this.peekPos.y = -GAME_HEIGHT / 2 - spriteHeight / 2 + peekAmount;
        this.startPos.x = MathUtils.randFloat(-GAME_WIDTH / 3, GAME_WIDTH / 3);
        this.almostPeekPos.x = this.startPos.x;
        this.peekPos.x = this.startPos.x;
        this.material.rotation = 0; // Pointing up
        break;
    }
  }
}

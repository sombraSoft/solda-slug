import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";
import { GAME_HEIGHT } from "./constants";

export class BossHealthBar extends Group {
  private bar: Mesh;
  private maxHealthWidth: number;

  constructor() {
    super();

    const width = 1300;
    const height = 40;
    const borderSize = 6;

    this.maxHealthWidth = width;

    // Container (Border/Background)
    const borderGeometry = new PlaneGeometry(
      width + borderSize * 2,
      height + borderSize * 2,
    );
    const borderMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      depthTest: false,
    });
    const border = new Mesh(borderGeometry, borderMaterial);
    border.renderOrder = 10;
    this.add(border);

    const bgGeometry = new PlaneGeometry(width, height);
    const bgMaterial = new MeshBasicMaterial({
      color: 0x333333,
      depthTest: false,
    });
    const bg = new Mesh(bgGeometry, bgMaterial);
    bg.position.z = 0.1;
    bg.renderOrder = 11;
    this.add(bg);

    // Health Bar
    const barGeometry = new PlaneGeometry(1, height);
    const barMaterial = new MeshBasicMaterial({
      color: 0x00ff00,
      depthTest: false,
    });
    this.bar = new Mesh(barGeometry, barMaterial);
    this.bar.position.z = 0.2;
    this.bar.position.x = -width / 2;
    barGeometry.translate(0.5, 0, 0);

    this.bar.scale.x = width;
    this.bar.renderOrder = 12;
    this.add(this.bar);

    // Label
    const labelTexture = this.createLabelTexture("TORNOZELEIRA ELETRÔNICA");
    const labelMaterial = new SpriteMaterial({
      map: labelTexture,
      depthTest: false,
    });
    const label = new Sprite(labelMaterial);
    label.scale.set(labelTexture.image.width, labelTexture.image.height, 1);
    label.position.set(
      -width / 2 + labelTexture.image.width / 2,
      -height - 20,
      0.3,
    );
    label.renderOrder = 13;
    this.add(label);
    this.position.set(0, GAME_HEIGHT / 2 - 80, 1);
  }

  private createLabelTexture(text: string): CanvasTexture {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    const fontSize = 24;
    ctx.font = `${fontSize}px "Press Start 2P", sans-serif`;
    const textMetrics = ctx.measureText(text);
    const width = textMetrics.width;
    const height = fontSize * 1.5;

    canvas.width = width;
    canvas.height = height;

    // Re-set font after resizing canvas
    ctx.font = `${fontSize}px "Press Start 2P", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, 0, height / 2);

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }

  public update(health: number) {
    const clampedHealth = Math.max(0, Math.min(100, health));
    const percent = clampedHealth / 100;

    this.bar.scale.x = this.maxHealthWidth * percent;

    const material = this.bar.material as MeshBasicMaterial;
    if (clampedHealth > 50) {
      material.color.setHex(0x00ff00);
    } else if (clampedHealth > 20) {
      material.color.setHex(0xffff00);
    } else {
      material.color.setHex(0xff0000);
    }
  }
}

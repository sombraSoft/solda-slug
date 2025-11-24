import { Sprite, SpriteMaterial, type Texture } from "three";
import { BOZO_POSITION, BOZO_SCALE } from "./constants";

export class Bozo extends Sprite {
  constructor(texture: Texture) {
    const material = new SpriteMaterial({ map: texture });
    super(material);

    this.position.set(BOZO_POSITION.x, BOZO_POSITION.y, BOZO_POSITION.z);
    this.scale.set(BOZO_SCALE, BOZO_SCALE, 1);
    this.renderOrder = 0;
  }
}

import { Sprite, SpriteMaterial, type Texture } from "three";
import { BOLSONARO_POSITION, BOLSONARO_SCALE } from "./constants";

export class Bolsonaro extends Sprite {
  constructor(texture: Texture) {
    const material = new SpriteMaterial({ map: texture });
    super(material);

    this.position.set(
      BOLSONARO_POSITION.x,
      BOLSONARO_POSITION.y,
      BOLSONARO_POSITION.z,
    );
    this.scale.set(BOLSONARO_SCALE, BOLSONARO_SCALE, 1);
    this.renderOrder = 0;
  }
}

import * as THREE from "three";
import { BOLSONARO_POSITION, BOLSONARO_SCALE } from "./constants";

export class Bolsonaro extends THREE.Sprite {
	constructor() {
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load("/assets/bolsonaro_sentado.png");
		texture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.SpriteMaterial({ map: texture });
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

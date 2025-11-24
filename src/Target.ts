import * as THREE from "three";
import { ANKLE_MONITOR_OFFSET, BOLSONARO_POSITION } from "./constants";
import type { SolderingIron } from "./SolderingIron";

export class Target extends THREE.Mesh {
	public health: number = 100;
	private raycaster = new THREE.Raycaster();
	private mouse = new THREE.Vector2();

	constructor(
		private camera: THREE.OrthographicCamera | THREE.PerspectiveCamera,
		private solderingIron: SolderingIron,
	) {
		const geometry = new THREE.BoxGeometry(50, 30, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0xff0000,
			transparent: true,
			opacity: 0.5,
		});
		super(geometry, material);

		this.position.set(
			BOLSONARO_POSITION.x + ANKLE_MONITOR_OFFSET.x,
			BOLSONARO_POSITION.y + ANKLE_MONITOR_OFFSET.y,
			BOLSONARO_POSITION.z + ANKLE_MONITOR_OFFSET.z,
		);
		this.renderOrder = 2;

		window.addEventListener("mousemove", this.onMouseMove.bind(this));
	}

	private onMouseMove(event: MouseEvent) {
		const { innerWidth, innerHeight } = window;
		// We need to use the same logic as in SolderingIron to get the correct mouse coordinates
		// But for raycasting, we need normalized device coordinates (-1 to +1)
		// Since we are using an orthographic camera and resizing the renderer,
		// we can just use the standard normalization if the canvas fills the window.
		// However, our resize logic maintains aspect ratio, so there might be black bars.
		// Let's assume for now the mouse event coordinates are relative to the window.

		// Re-calculating the game area dimensions as in main.ts/SolderingIron.ts
		const gameWidth = 1920;
		const gameHeight = 1080;
		const aspectRatio = gameWidth / gameHeight;

		let newWidth: number;
		let newHeight: number;

		if (innerWidth / innerHeight > aspectRatio) {
			newHeight = innerHeight;
			newWidth = newHeight * aspectRatio;
		} else {
			newWidth = innerWidth;
			newHeight = newWidth / aspectRatio;
		}

		// Calculate offset if centered (which it is by CSS usually, or default behavior)
		// Actually, in main.ts we just set size. We didn't center the canvas if it's smaller.
		// Assuming top-left alignment for now based on main.ts implementation.

		this.mouse.x = (event.clientX / newWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / newHeight) * 2 + 1;
	}

	public update(deltaTime: number) {
		if (this.solderingIron.isSoldering) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObject(this);

			if (intersects.length > 0) {
				this.health -= 5 * deltaTime;

				if (this.health < 0) this.health = 0;
			}
		}
	}
}

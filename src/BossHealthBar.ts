import * as THREE from "three";

export class BossHealthBar extends THREE.Group {
	private bar: THREE.Mesh;
	private maxHealthWidth: number;

	constructor() {
		super();

		const width = 1700; // Approx 90% of 1920
		const height = 40;
		const borderSize = 6;

		this.maxHealthWidth = width;

		// Container (Border/Background)
		const borderGeometry = new THREE.PlaneGeometry(width + borderSize * 2, height + borderSize * 2);
		const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const border = new THREE.Mesh(borderGeometry, borderMaterial);
		border.renderOrder = 10; // Ensure UI is on top
		this.add(border);

		const bgGeometry = new THREE.PlaneGeometry(width, height);
		const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
		const bg = new THREE.Mesh(bgGeometry, bgMaterial);
		bg.position.z = 0.1; // Slightly in front of border
		bg.renderOrder = 11;
		this.add(bg);

		// Health Bar
		const barGeometry = new THREE.PlaneGeometry(1, height); // Start with width 1, scale it later
		const barMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		this.bar = new THREE.Mesh(barGeometry, barMaterial);
		this.bar.position.z = 0.2; // In front of bg
		this.bar.position.x = -width / 2; // Align to left edge initially (pivot fix)
		// To make scaling work from left, we need to adjust geometry or position.
		// Easier: geometry centered, but we move mesh.
		// Actually, let's translate the geometry so pivot is at left.
		barGeometry.translate(0.5, 0, 0); 
		this.bar.position.x = -width / 2;
		
		this.bar.scale.x = width; // Initial full width
		this.bar.renderOrder = 12;
		this.add(this.bar);

		// Label
		const labelTexture = this.createLabelTexture("TORNOZELEIRA ELETRÔNICA");
		const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
		const label = new THREE.Sprite(labelMaterial);
		label.scale.set(labelTexture.image.width, labelTexture.image.height, 1);
		label.position.set(-width / 2 + labelTexture.image.width / 2, -height - 20, 0.3); // Move below the bar
		label.renderOrder = 13;
		this.add(label);

		// Position the whole group at the top of the screen
		// Game height is 1080. Top is 540.
		this.position.set(0, 540 - 80, 1); // Place in front of background (z=-1) and within camera frustum
	}

	private createLabelTexture(text: string): THREE.CanvasTexture {
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

		const texture = new THREE.CanvasTexture(canvas);
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

	public update(health: number) {
		const clampedHealth = Math.max(0, Math.min(100, health));
		const percent = clampedHealth / 100;
		
		this.bar.scale.x = this.maxHealthWidth * percent;

		const material = this.bar.material as THREE.MeshBasicMaterial;
		if (clampedHealth > 50) {
			material.color.setHex(0x00ff00);
		} else if (clampedHealth > 20) {
			material.color.setHex(0xffff00);
		} else {
			material.color.setHex(0xff0000);
		}
	}
}
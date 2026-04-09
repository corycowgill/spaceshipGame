import * as THREE from 'three';
import { CONFIG, COLORS, WEAPON_TYPES } from './config.js';

const POWERUP_TYPES = [
    { type: 'weapon', weapon: WEAPON_TYPES.SPREAD, color: COLORS.POWERUP_WEAPON, label: 'S' },
    { type: 'weapon', weapon: WEAPON_TYPES.SIDE, color: 0x4488ff, label: 'W' },
    { type: 'weapon', weapon: WEAPON_TYPES.REAR, color: 0xff8844, label: 'R' },
    { type: 'weapon', weapon: WEAPON_TYPES.LASER, color: 0x00ffff, label: 'L' },
    { type: 'weapon', weapon: WEAPON_TYPES.HOMING, color: 0xff44ff, label: 'H' },
    { type: 'upgrade', color: COLORS.POWERUP_UPGRADE, label: 'U' },
    { type: 'life', color: COLORS.POWERUP_LIFE, label: '+' },
];

class PowerUp {
    constructor(scene, x, y, typeInfo) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.active = true;
        this.typeInfo = typeInfo;
        this.age = 0;

        // Create mesh - rotating diamond shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.4);
        shape.lineTo(0.4, 0);
        shape.lineTo(0, -0.4);
        shape.lineTo(-0.4, 0);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 3);
        this.mesh.scale.set(CONFIG.POWERUP_SIZE, CONFIG.POWERUP_SIZE, 1);
        scene.add(this.mesh);

        // Glow effect
        const glowGeo = new THREE.CircleGeometry(0.5, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
        });
        this.glow = new THREE.Mesh(glowGeo, glowMat);
        this.glow.position.set(x, y, 2.9);
        scene.add(this.glow);
    }

    update(dt) {
        if (!this.active || !this.mesh) return;
        this.age += dt;
        this.y -= CONFIG.POWERUP_FALL_SPEED * dt;
        this.x += Math.sin(this.age * 3) * 0.5 * dt;

        this.mesh.position.set(this.x, this.y, 3);
        this.mesh.rotation.z = this.age * 2;

        this.glow.position.set(this.x, this.y, 2.9);
        this.glow.material.opacity = 0.15 + Math.sin(this.age * 5) * 0.1;
        const glowScale = 1 + Math.sin(this.age * 4) * 0.2;
        this.glow.scale.set(glowScale, glowScale, 1);

        // Off-screen
        if (this.y < -CONFIG.GAME_HEIGHT / 2 - 2) {
            this.destroy();
        }
    }

    getBounds() {
        const s = CONFIG.POWERUP_SIZE * 0.4;
        return { x: this.x - s, y: this.y - s, w: s * 2, h: s * 2 };
    }

    destroy() {
        this.active = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        if (this.glow) {
            this.scene.remove(this.glow);
            this.glow.geometry.dispose();
            this.glow.material.dispose();
            this.glow = null;
        }
    }
}

export class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerups = [];
    }

    // Spawn a random power-up at position
    spawn(x, y) {
        // Weighted random selection
        const roll = Math.random();
        let typeInfo;
        if (roll < 0.05) {
            // 5% chance of life
            typeInfo = POWERUP_TYPES[6];
        } else if (roll < 0.20) {
            // 15% chance of upgrade
            typeInfo = POWERUP_TYPES[5];
        } else {
            // 80% chance of weapon
            const weaponIdx = Math.floor(Math.random() * 5);
            typeInfo = POWERUP_TYPES[weaponIdx];
        }

        const powerup = new PowerUp(this.scene, x, y, typeInfo);
        this.powerups.push(powerup);
    }

    update(dt) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            if (!p.active) {
                this.powerups.splice(i, 1);
                continue;
            }
            p.update(dt);
            if (!p.active) {
                this.powerups.splice(i, 1);
            }
        }
    }

    getActive() {
        return this.powerups.filter(p => p.active);
    }

    clearAll() {
        for (const p of this.powerups) {
            p.destroy();
        }
        this.powerups = [];
    }
}

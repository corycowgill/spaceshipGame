import * as THREE from 'three';
import { CONFIG, COLORS, WEAPON_TYPES } from './config.js';

const POWERUP_TYPES = [
    { type: 'weapon', weapon: WEAPON_TYPES.SPREAD, color: 0x00ff88, icon: 'spread' },
    { type: 'weapon', weapon: WEAPON_TYPES.SIDE, color: 0x44aaff, icon: 'side' },
    { type: 'weapon', weapon: WEAPON_TYPES.REAR, color: 0xff8844, icon: 'rear' },
    { type: 'weapon', weapon: WEAPON_TYPES.LASER, color: 0x00ffff, icon: 'laser' },
    { type: 'weapon', weapon: WEAPON_TYPES.HOMING, color: 0xff44ff, icon: 'homing' },
    { type: 'upgrade', color: COLORS.POWERUP_UPGRADE, icon: 'upgrade' },
    { type: 'life', color: COLORS.POWERUP_LIFE, icon: 'life' },
];

// Build a small dark icon shape for each type
function createIconGeometry(icon) {
    const s = new THREE.Shape();
    switch (icon) {
        case 'spread':
            // Three diverging chevrons
            s.moveTo(-0.2, -0.1);
            s.lineTo(0, 0.18);
            s.lineTo(0.2, -0.1);
            s.lineTo(0.1, -0.1);
            s.lineTo(0, 0.05);
            s.lineTo(-0.1, -0.1);
            s.closePath();
            break;
        case 'side':
            // Three parallel horizontal bars
            s.moveTo(-0.2, -0.15);
            s.lineTo(0.2, -0.15);
            s.lineTo(0.2, -0.07);
            s.lineTo(-0.2, -0.07);
            s.lineTo(-0.2, -0.03);
            s.lineTo(0.2, -0.03);
            s.lineTo(0.2, 0.05);
            s.lineTo(-0.2, 0.05);
            s.lineTo(-0.2, 0.09);
            s.lineTo(0.2, 0.09);
            s.lineTo(0.2, 0.17);
            s.lineTo(-0.2, 0.17);
            s.closePath();
            break;
        case 'rear':
            // Down arrow
            s.moveTo(-0.05, 0.2);
            s.lineTo(0.05, 0.2);
            s.lineTo(0.05, -0.05);
            s.lineTo(0.15, -0.05);
            s.lineTo(0, -0.2);
            s.lineTo(-0.15, -0.05);
            s.lineTo(-0.05, -0.05);
            s.closePath();
            break;
        case 'laser':
            // Thin vertical beam with flared top
            s.moveTo(-0.04, -0.2);
            s.lineTo(0.04, -0.2);
            s.lineTo(0.04, 0.1);
            s.lineTo(0.12, 0.2);
            s.lineTo(-0.12, 0.2);
            s.lineTo(-0.04, 0.1);
            s.closePath();
            break;
        case 'homing':
            // Small ring - use an octagon difference trick via ring geom done outside
            s.moveTo(0.18, 0);
            for (let i = 1; i <= 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                s.lineTo(Math.cos(a) * 0.18, Math.sin(a) * 0.18);
            }
            const hole = new THREE.Path();
            hole.moveTo(0.1, 0);
            for (let i = 1; i <= 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                hole.lineTo(Math.cos(a) * 0.1, Math.sin(a) * 0.1);
            }
            s.holes.push(hole);
            break;
        case 'upgrade':
            // Up arrow
            s.moveTo(-0.15, -0.05);
            s.lineTo(-0.05, -0.05);
            s.lineTo(-0.05, -0.2);
            s.lineTo(0.05, -0.2);
            s.lineTo(0.05, -0.05);
            s.lineTo(0.15, -0.05);
            s.lineTo(0, 0.2);
            s.closePath();
            break;
        case 'life':
            // Plus sign
            s.moveTo(-0.05, -0.2);
            s.lineTo(0.05, -0.2);
            s.lineTo(0.05, -0.05);
            s.lineTo(0.2, -0.05);
            s.lineTo(0.2, 0.05);
            s.lineTo(0.05, 0.05);
            s.lineTo(0.05, 0.2);
            s.lineTo(-0.05, 0.2);
            s.lineTo(-0.05, 0.05);
            s.lineTo(-0.2, 0.05);
            s.lineTo(-0.2, -0.05);
            s.lineTo(-0.05, -0.05);
            s.closePath();
            break;
    }
    return new THREE.ShapeGeometry(s);
}

class PowerUp {
    constructor(scene, x, y, typeInfo) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.active = true;
        this.typeInfo = typeInfo;
        this.age = 0;

        // Diamond shell
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.45);
        shape.lineTo(0.45, 0);
        shape.lineTo(0, -0.45);
        shape.lineTo(-0.45, 0);
        shape.closePath();

        // Outline
        const outlineMat = new THREE.MeshBasicMaterial({
            color: COLORS.OUTLINE,
            side: THREE.DoubleSide,
        });
        const outlineGeo = new THREE.ShapeGeometry(shape);
        this.outline = new THREE.Mesh(outlineGeo, outlineMat);
        this.outline.scale.set(CONFIG.POWERUP_SIZE * 1.15, CONFIG.POWERUP_SIZE * 1.15, 1);
        this.outline.position.set(x, y, 2.9);
        scene.add(this.outline);

        // Body
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 3);
        this.mesh.scale.set(CONFIG.POWERUP_SIZE, CONFIG.POWERUP_SIZE, 1);
        scene.add(this.mesh);

        // Dark icon on top
        try {
            const iconGeo = createIconGeometry(typeInfo.icon);
            const iconMat = new THREE.MeshBasicMaterial({
                color: 0x000011,
                side: THREE.DoubleSide,
            });
            this.icon = new THREE.Mesh(iconGeo, iconMat);
            this.icon.scale.set(CONFIG.POWERUP_SIZE, CONFIG.POWERUP_SIZE, 1);
            this.icon.position.set(x, y, 3.1);
            scene.add(this.icon);
        } catch (e) {
            this.icon = null;
        }

        // Additive glow halo
        const glowGeo = new THREE.CircleGeometry(0.6, 20);
        const glowMat = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.glow = new THREE.Mesh(glowGeo, glowMat);
        this.glow.position.set(x, y, 2.85);
        scene.add(this.glow);

        // Rainbow outer ring
        const ringGeo = new THREE.RingGeometry(0.55, 0.62, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.position.set(x, y, 2.95);
        scene.add(this.ring);

        this._rainbowColor = new THREE.Color();
    }

    update(dt, playerX = null, playerY = null) {
        if (!this.active || !this.mesh) return;
        this.age += dt;

        // Magnet: if player is within range, attract toward them
        const MAGNET_RANGE = 5.0;
        const MAGNET_STRENGTH = 18;
        if (playerX !== null && playerY !== null) {
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAGNET_RANGE && dist > 0.01) {
                const pull = (1 - dist / MAGNET_RANGE) * MAGNET_STRENGTH;
                this.x += (dx / dist) * pull * dt;
                this.y += (dy / dist) * pull * dt;
            } else {
                this.y -= CONFIG.POWERUP_FALL_SPEED * dt;
                this.x += Math.sin(this.age * 3) * 0.5 * dt;
            }
        } else {
            this.y -= CONFIG.POWERUP_FALL_SPEED * dt;
            this.x += Math.sin(this.age * 3) * 0.5 * dt;
        }

        const rot = this.age * 2;
        this.mesh.position.set(this.x, this.y, 3);
        this.mesh.rotation.z = rot;
        this.outline.position.set(this.x, this.y, 2.9);
        this.outline.rotation.z = rot;
        if (this.icon) {
            this.icon.position.set(this.x, this.y, 3.1);
            // Icon stays upright (counter-rotate a bit for readability)
        }

        // Pulsing glow
        this.glow.position.set(this.x, this.y, 2.85);
        const glowPulse = 0.25 + Math.sin(this.age * 5) * 0.15;
        this.glow.material.opacity = glowPulse;
        const glowScale = 1 + Math.sin(this.age * 4) * 0.2;
        this.glow.scale.set(glowScale, glowScale, 1);

        // Rainbow cycling ring
        this.ring.position.set(this.x, this.y, 2.95);
        this._rainbowColor.setHSL((this.age * 0.6) % 1, 1, 0.65);
        this.ring.material.color.copy(this._rainbowColor);
        this.ring.material.opacity = 0.5 + Math.sin(this.age * 6) * 0.25;
        const ringScale = 1 + Math.sin(this.age * 3) * 0.1;
        this.ring.scale.set(ringScale, ringScale, 1);

        if (this.y < -CONFIG.GAME_HEIGHT / 2 - 2) {
            this.destroy();
        }
    }

    getBounds() {
        const s = CONFIG.POWERUP_SIZE * 0.45;
        return { x: this.x - s, y: this.y - s, w: s * 2, h: s * 2 };
    }

    destroy() {
        this.active = false;
        const rm = (m) => {
            if (!m) return;
            this.scene.remove(m);
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
        };
        rm(this.mesh);
        rm(this.outline);
        rm(this.icon);
        rm(this.glow);
        rm(this.ring);
        this.mesh = null;
        this.outline = null;
        this.icon = null;
        this.glow = null;
        this.ring = null;
    }
}

export class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerups = [];
    }

    spawn(x, y) {
        const roll = Math.random();
        let typeInfo;
        if (roll < 0.05) {
            typeInfo = POWERUP_TYPES[6];
        } else if (roll < 0.20) {
            typeInfo = POWERUP_TYPES[5];
        } else {
            const weaponIdx = Math.floor(Math.random() * 5);
            typeInfo = POWERUP_TYPES[weaponIdx];
        }

        const powerup = new PowerUp(this.scene, x, y, typeInfo);
        this.powerups.push(powerup);
    }

    update(dt, playerX = null, playerY = null) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            if (!p.active) {
                this.powerups.splice(i, 1);
                continue;
            }
            p.update(dt, playerX, playerY);
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

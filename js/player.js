import * as THREE from 'three';
import { CONFIG, COLORS, WEAPON_TYPES } from './config.js';

// Main ship silhouette - angular fighter
function createShipGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.7);
    shape.lineTo(0.2, 0.3);
    shape.lineTo(0.5, 0.0);
    shape.lineTo(0.6, -0.3);
    shape.lineTo(1.0, -0.5);
    shape.lineTo(0.8, -0.6);
    shape.lineTo(0.4, -0.4);
    shape.lineTo(0.15, -0.5);
    shape.lineTo(0, -0.3);
    shape.lineTo(-0.15, -0.5);
    shape.lineTo(-0.4, -0.4);
    shape.lineTo(-0.8, -0.6);
    shape.lineTo(-1.0, -0.5);
    shape.lineTo(-0.6, -0.3);
    shape.lineTo(-0.5, 0.0);
    shape.lineTo(-0.2, 0.3);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

// Inner hull - darker layer with visible "panels"
function createInnerHullGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.55);
    shape.lineTo(0.15, 0.25);
    shape.lineTo(0.35, 0.0);
    shape.lineTo(0.45, -0.2);
    shape.lineTo(0.25, -0.35);
    shape.lineTo(0, -0.2);
    shape.lineTo(-0.25, -0.35);
    shape.lineTo(-0.45, -0.2);
    shape.lineTo(-0.35, 0.0);
    shape.lineTo(-0.15, 0.25);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

export class Player {
    constructor(scene) {
        this.scene = scene;

        const bodyGeo = createShipGeometry();
        const s = CONFIG.PLAYER_SIZE;

        // Outline layer (dark, slightly bigger, behind)
        const outlineMat = new THREE.MeshBasicMaterial({
            color: COLORS.OUTLINE,
            side: THREE.DoubleSide,
        });
        this.outline = new THREE.Mesh(bodyGeo, outlineMat);
        this.outline.scale.set(s * 1.12, s * 1.12, 1);
        this.outline.position.z = 0.9;
        scene.add(this.outline);

        // Additive glow halo
        const glowGeo = new THREE.CircleGeometry(1.2, 24);
        const glowMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_GLOW,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.halo = new THREE.Mesh(glowGeo, glowMat);
        this.halo.position.z = 0.85;
        scene.add(this.halo);

        // Main body
        const bodyMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_BODY,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(bodyGeo, bodyMat);
        this.mesh.scale.set(s, s, 1);
        this.mesh.position.z = 1;
        scene.add(this.mesh);

        // Inner hull (darker panel detail)
        const innerGeo = createInnerHullGeometry();
        const innerMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_HULL,
            side: THREE.DoubleSide,
        });
        this.innerHull = new THREE.Mesh(innerGeo, innerMat);
        this.innerHull.scale.set(s, s, 1);
        this.innerHull.position.z = 1.05;
        scene.add(this.innerHull);

        // Hot magenta cockpit (only player uses magenta!)
        const cockpitGeo = new THREE.CircleGeometry(0.12, 12);
        const cockpitMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_COCKPIT,
        });
        this.cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        this.cockpit.scale.set(s, s, 1);
        this.cockpit.position.z = 1.1;
        scene.add(this.cockpit);

        // Cockpit glow
        const cockpitGlowGeo = new THREE.CircleGeometry(0.25, 16);
        const cockpitGlowMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_COCKPIT,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.cockpitGlow = new THREE.Mesh(cockpitGlowGeo, cockpitGlowMat);
        this.cockpitGlow.scale.set(s, s, 1);
        this.cockpitGlow.position.z = 1.08;
        scene.add(this.cockpitGlow);

        // Twin engine glows
        const engineGeo = new THREE.CircleGeometry(0.18, 10);
        const engineMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_ENGINE,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.engine1 = new THREE.Mesh(engineGeo, engineMat);
        this.engine1.position.z = 1.2;
        scene.add(this.engine1);
        this.engine2 = new THREE.Mesh(engineGeo.clone(), engineMat.clone());
        this.engine2.position.z = 1.2;
        scene.add(this.engine2);

        this._allMeshes = [
            this.outline, this.halo, this.mesh, this.innerHull,
            this.cockpit, this.cockpitGlow, this.engine1, this.engine2,
        ];

        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = -CONFIG.GAME_HEIGHT / 2 + 4;
        this.weaponType = WEAPON_TYPES.SINGLE;
        this.weaponLevel = 1;
        this.fireTimer = 0;
        this.invincibleTimer = 0;
        this.alive = true;
        this.respawnTimer = 0;
        this._syncPosition();
        this.setVisible(true);
    }

    setVisible(visible) {
        for (const m of this._allMeshes) m.visible = visible;
    }

    update(dt, input) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            return;
        }

        let dx = 0, dy = 0;
        if (input.touchActive || input.isGamepadActive) {
            // Analog input from touch joystick or gamepad stick
            dx = input.axisX;
            dy = input.axisY;
        } else {
            if (input.left) dx -= 1;
            if (input.right) dx += 1;
            if (input.up) dy += 1;
            if (input.down) dy -= 1;
            if (dx !== 0 && dy !== 0) {
                const len = Math.sqrt(dx * dx + dy * dy);
                dx /= len;
                dy /= len;
            }
        }

        this.x += dx * CONFIG.PLAYER_SPEED * dt;
        this.y += dy * CONFIG.PLAYER_SPEED * dt;

        const halfW = CONFIG.GAME_WIDTH / 2 - 1;
        const halfH = CONFIG.GAME_HEIGHT / 2 - 1;
        this.x = Math.max(-halfW, Math.min(halfW, this.x));
        this.y = Math.max(-halfH, Math.min(halfH, this.y));

        if (this.fireTimer > 0) this.fireTimer -= dt;

        // Invincibility blink
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            const visible = Math.floor(this.invincibleTimer * 10) % 2 === 0;
            this.mesh.visible = visible;
            this.innerHull.visible = visible;
            this.cockpit.visible = visible;
            this.outline.visible = visible;
        } else {
            this.mesh.visible = true;
            this.innerHull.visible = true;
            this.cockpit.visible = true;
            this.outline.visible = true;
        }

        this._syncPosition();

        // Pulsing glow and cockpit
        const t = performance.now() * 0.001;
        const enginePulse = 0.7 + Math.sin(t * 12) * 0.3;
        this.engine1.material.opacity = enginePulse;
        this.engine2.material.opacity = enginePulse;
        const engineScale = 0.8 + Math.sin(t * 15) * 0.2;
        this.engine1.scale.set(engineScale, engineScale * 1.5, 1);
        this.engine2.scale.set(engineScale, engineScale * 1.5, 1);

        const haloPulse = 0.2 + Math.sin(t * 3) * 0.08;
        this.halo.material.opacity = haloPulse;
        const haloScale = 1 + Math.sin(t * 2) * 0.1;
        this.halo.scale.set(haloScale, haloScale, 1);

        this.cockpitGlow.material.opacity = 0.3 + Math.sin(t * 4) * 0.15;
    }

    _syncPosition() {
        const sync = (mesh, dx = 0, dy = 0) => {
            if (mesh) {
                mesh.position.x = this.x + dx;
                mesh.position.y = this.y + dy;
            }
        };
        sync(this.mesh);
        sync(this.outline);
        sync(this.halo);
        sync(this.innerHull);
        sync(this.cockpit, 0, 0.15);
        sync(this.cockpitGlow, 0, 0.15);
        sync(this.engine1, -0.15, -0.5);
        sync(this.engine2, 0.15, -0.5);
    }

    canFire() {
        return this.alive && this.fireTimer <= 0;
    }

    fire() {
        this.fireTimer = CONFIG.PLAYER_FIRE_RATE;
    }

    hit() {
        if (this.invincibleTimer > 0) return false;
        this.alive = false;
        this.respawnTimer = CONFIG.RESPAWN_TIME;
        this.setVisible(false);
        return true;
    }

    respawn() {
        this.alive = true;
        this.x = 0;
        this.y = -CONFIG.GAME_HEIGHT / 2 + 4;
        this.invincibleTimer = CONFIG.INVINCIBILITY_TIME;
        this.setVisible(true);
        this._syncPosition();
        this.weaponType = WEAPON_TYPES.SINGLE;
        this.weaponLevel = 1;
    }

    upgradeWeapon(type) {
        if (this.weaponType === type && this.weaponLevel < 3) {
            this.weaponLevel++;
        } else {
            this.weaponType = type;
            this.weaponLevel = 1;
        }
    }

    getBounds() {
        const s = CONFIG.PLAYER_SIZE * 0.5;
        return {
            x: this.x - s,
            y: this.y - s,
            w: s * 2,
            h: s * 2,
        };
    }

    destroy() {
        for (const m of this._allMeshes) {
            this.scene.remove(m);
        }
    }
}

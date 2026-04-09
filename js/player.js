import * as THREE from 'three';
import { CONFIG, COLORS, WEAPON_TYPES } from './config.js';

// Create the player ship geometry - angular, fighter-like
function createShipGeometry() {
    const shape = new THREE.Shape();
    // Nose
    shape.moveTo(0, 0.7);
    // Right side
    shape.lineTo(0.2, 0.3);
    shape.lineTo(0.5, 0.0);
    shape.lineTo(0.6, -0.3);
    // Right wing
    shape.lineTo(1.0, -0.5);
    shape.lineTo(0.8, -0.6);
    shape.lineTo(0.4, -0.4);
    // Center back
    shape.lineTo(0.15, -0.5);
    shape.lineTo(0, -0.3);
    // Left side (mirror)
    shape.lineTo(-0.15, -0.5);
    shape.lineTo(-0.4, -0.4);
    shape.lineTo(-0.8, -0.6);
    shape.lineTo(-1.0, -0.5);
    shape.lineTo(-0.6, -0.3);
    shape.lineTo(-0.5, 0.0);
    shape.lineTo(-0.2, 0.3);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
}

export class Player {
    constructor(scene) {
        this.scene = scene;

        // Ship mesh
        const geometry = createShipGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_BODY,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE, 1);
        this.mesh.position.z = 1;
        scene.add(this.mesh);

        // Wing highlight
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0.5, 0.0);
        wingShape.lineTo(0.6, -0.3);
        wingShape.lineTo(1.0, -0.5);
        wingShape.lineTo(0.8, -0.6);
        wingShape.lineTo(0.4, -0.4);
        wingShape.closePath();
        const wingGeo = new THREE.ShapeGeometry(wingShape);
        const wingMat = new THREE.MeshBasicMaterial({ color: COLORS.PLAYER_WING, side: THREE.DoubleSide });
        this.rightWing = new THREE.Mesh(wingGeo, wingMat);
        this.rightWing.scale.set(CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE, 1);
        this.rightWing.position.z = 1.1;
        scene.add(this.rightWing);

        // Left wing (mirror)
        const leftWingGeo = wingGeo.clone();
        leftWingGeo.scale(-1, 1, 1);
        this.leftWing = new THREE.Mesh(leftWingGeo, wingMat.clone());
        this.leftWing.scale.set(CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE, 1);
        this.leftWing.position.z = 1.1;
        scene.add(this.leftWing);

        // Engine glow
        const engineGeo = new THREE.CircleGeometry(0.15, 8);
        const engineMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_ENGINE,
            transparent: true,
            opacity: 0.8,
        });
        this.engine1 = new THREE.Mesh(engineGeo, engineMat);
        this.engine1.position.z = 1.2;
        scene.add(this.engine1);
        this.engine2 = new THREE.Mesh(engineGeo.clone(), engineMat.clone());
        this.engine2.position.z = 1.2;
        scene.add(this.engine2);

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
        this.mesh.visible = visible;
        this.rightWing.visible = visible;
        this.leftWing.visible = visible;
        this.engine1.visible = visible;
        this.engine2.visible = visible;
    }

    update(dt, input) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            return;
        }

        // Movement
        let dx = 0, dy = 0;
        if (input.left) dx -= 1;
        if (input.right) dx += 1;
        if (input.up) dy += 1;
        if (input.down) dy -= 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        this.x += dx * CONFIG.PLAYER_SPEED * dt;
        this.y += dy * CONFIG.PLAYER_SPEED * dt;

        // Clamp to game bounds
        const halfW = CONFIG.GAME_WIDTH / 2 - 1;
        const halfH = CONFIG.GAME_HEIGHT / 2 - 1;
        this.x = Math.max(-halfW, Math.min(halfW, this.x));
        this.y = Math.max(-halfH, Math.min(halfH, this.y));

        // Fire timer
        if (this.fireTimer > 0) this.fireTimer -= dt;

        // Invincibility
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            // Blink effect
            const visible = Math.floor(this.invincibleTimer * 10) % 2 === 0;
            this.mesh.visible = visible;
            this.rightWing.visible = visible;
            this.leftWing.visible = visible;
        } else {
            this.mesh.visible = true;
            this.rightWing.visible = true;
            this.leftWing.visible = true;
        }

        this._syncPosition();

        // Engine glow animation
        const enginePulse = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
        this.engine1.material.opacity = enginePulse;
        this.engine2.material.opacity = enginePulse;
        const engineScale = 0.8 + Math.sin(Date.now() * 0.015) * 0.2;
        this.engine1.scale.set(engineScale, engineScale * 1.5, 1);
        this.engine2.scale.set(engineScale, engineScale * 1.5, 1);
    }

    _syncPosition() {
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.rightWing.position.x = this.x;
        this.rightWing.position.y = this.y;
        this.leftWing.position.x = this.x;
        this.leftWing.position.y = this.y;
        this.engine1.position.x = this.x - 0.15;
        this.engine1.position.y = this.y - 0.5;
        this.engine2.position.x = this.x + 0.15;
        this.engine2.position.y = this.y - 0.5;
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
        // Reset weapon on death
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

    // Collision bounds (AABB)
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
        this.scene.remove(this.mesh);
        this.scene.remove(this.rightWing);
        this.scene.remove(this.leftWing);
        this.scene.remove(this.engine1);
        this.scene.remove(this.engine2);
    }
}

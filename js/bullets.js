import * as THREE from 'three';
import { CONFIG, COLORS, WEAPON_TYPES } from './config.js';

// Bullet types
const BULLET_PLAYER = 0;
const BULLET_ENEMY = 1;
const BULLET_HOMING = 2;
const BULLET_LASER = 3;

class Bullet {
    constructor() {
        this.active = false;
        this.type = BULLET_PLAYER;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.size = 0.15;
        this.mesh = null;
    }
}

export class BulletSystem {
    constructor(scene) {
        this.scene = scene;
        this.playerBullets = [];
        this.enemyBullets = [];
        this.laserActive = false;
        this.laserMesh = null;

        // Pre-create bullet meshes for pooling
        this._playerBulletPool = [];
        this._enemyBulletPool = [];

        // Create bullet geometry templates
        this._playerBulletGeo = new THREE.PlaneGeometry(0.2, 0.5);
        this._enemyBulletGeo = new THREE.CircleGeometry(0.15, 6);
        this._homingBulletGeo = new THREE.PlaneGeometry(0.25, 0.4);
        this._playerBulletMat = new THREE.MeshBasicMaterial({
            color: COLORS.PLAYER_BULLET,
            transparent: true,
            opacity: 0.9,
        });
        this._enemyBulletMat = new THREE.MeshBasicMaterial({
            color: COLORS.ENEMY_BULLET,
            transparent: true,
            opacity: 0.9,
        });
        this._homingBulletMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.9,
        });

        // Laser beam mesh
        const laserGeo = new THREE.PlaneGeometry(0.3, CONFIG.GAME_HEIGHT);
        const laserMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });
        this.laserMesh = new THREE.Mesh(laserGeo, laserMat);
        this.laserMesh.position.z = 3;
        this.laserMesh.visible = false;
        scene.add(this.laserMesh);

        // Laser core (brighter, thinner)
        const laserCoreGeo = new THREE.PlaneGeometry(0.1, CONFIG.GAME_HEIGHT);
        const laserCoreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });
        this.laserCoreMesh = new THREE.Mesh(laserCoreGeo, laserCoreMat);
        this.laserCoreMesh.position.z = 3.1;
        this.laserCoreMesh.visible = false;
        scene.add(this.laserCoreMesh);

        // Pre-allocate pools
        for (let i = 0; i < 100; i++) {
            this._createPlayerBullet();
        }
        for (let i = 0; i < 200; i++) {
            this._createEnemyBullet();
        }
    }

    _createPlayerBullet() {
        const bullet = new Bullet();
        bullet.type = BULLET_PLAYER;
        bullet.mesh = new THREE.Mesh(this._playerBulletGeo, this._playerBulletMat.clone());
        bullet.mesh.position.z = 2;
        bullet.mesh.visible = false;
        this.scene.add(bullet.mesh);
        this._playerBulletPool.push(bullet);
        return bullet;
    }

    _createEnemyBullet() {
        const bullet = new Bullet();
        bullet.type = BULLET_ENEMY;
        bullet.mesh = new THREE.Mesh(this._enemyBulletGeo, this._enemyBulletMat.clone());
        bullet.mesh.position.z = 2;
        bullet.mesh.visible = false;
        this.scene.add(bullet.mesh);
        this._enemyBulletPool.push(bullet);
        return bullet;
    }

    _getPlayerBullet() {
        for (const b of this._playerBulletPool) {
            if (!b.active) return b;
        }
        return this._createPlayerBullet();
    }

    _getEnemyBullet() {
        for (const b of this._enemyBulletPool) {
            if (!b.active) return b;
        }
        return this._createEnemyBullet();
    }

    // Fire player bullets based on weapon type and level
    firePlayer(x, y, weaponType, weaponLevel) {
        const speed = CONFIG.PLAYER_BULLET_SPEED;
        const dmg = weaponLevel;

        switch (weaponType) {
            case WEAPON_TYPES.SINGLE:
                this._spawnPlayerBullet(x, y + 0.5, 0, speed, dmg);
                if (weaponLevel >= 2) {
                    this._spawnPlayerBullet(x - 0.3, y + 0.3, 0, speed, dmg);
                    this._spawnPlayerBullet(x + 0.3, y + 0.3, 0, speed, dmg);
                }
                if (weaponLevel >= 3) {
                    this._spawnPlayerBullet(x - 0.5, y + 0.1, 0, speed, dmg);
                    this._spawnPlayerBullet(x + 0.5, y + 0.1, 0, speed, dmg);
                }
                break;

            case WEAPON_TYPES.SPREAD: {
                const count = 3 + weaponLevel * 2;
                const arc = (0.3 + weaponLevel * 0.15);
                for (let i = 0; i < count; i++) {
                    const angle = Math.PI / 2 + (i - (count - 1) / 2) * arc / count;
                    this._spawnPlayerBullet(x, y + 0.5,
                        Math.cos(angle) * speed * 0.8,
                        Math.sin(angle) * speed * 0.8,
                        Math.max(1, dmg - 1));
                }
                break;
            }

            case WEAPON_TYPES.SIDE:
                this._spawnPlayerBullet(x, y + 0.5, 0, speed, dmg);
                this._spawnPlayerBullet(x - 0.6, y, -speed * 0.5, speed * 0.5, dmg);
                this._spawnPlayerBullet(x + 0.6, y, speed * 0.5, speed * 0.5, dmg);
                if (weaponLevel >= 2) {
                    this._spawnPlayerBullet(x - 0.8, y, -speed * 0.7, speed * 0.3, dmg);
                    this._spawnPlayerBullet(x + 0.8, y, speed * 0.7, speed * 0.3, dmg);
                }
                if (weaponLevel >= 3) {
                    this._spawnPlayerBullet(x - 0.4, y, -speed * 0.3, speed * 0.7, dmg);
                    this._spawnPlayerBullet(x + 0.4, y, speed * 0.3, speed * 0.7, dmg);
                }
                break;

            case WEAPON_TYPES.REAR:
                this._spawnPlayerBullet(x, y + 0.5, 0, speed, dmg);
                this._spawnPlayerBullet(x, y - 0.5, 0, -speed * 0.6, dmg);
                if (weaponLevel >= 2) {
                    this._spawnPlayerBullet(x - 0.3, y + 0.3, 0, speed, dmg);
                    this._spawnPlayerBullet(x + 0.3, y + 0.3, 0, speed, dmg);
                }
                if (weaponLevel >= 3) {
                    this._spawnPlayerBullet(x - 0.3, y - 0.3, -speed * 0.2, -speed * 0.5, dmg);
                    this._spawnPlayerBullet(x + 0.3, y - 0.3, speed * 0.2, -speed * 0.5, dmg);
                }
                break;

            case WEAPON_TYPES.LASER:
                // Laser is handled differently - continuous beam
                this.laserActive = true;
                break;

            case WEAPON_TYPES.HOMING:
                this._spawnPlayerBullet(x, y + 0.5, 0, speed, dmg);
                this._spawnHomingBullet(x - 0.4, y, dmg);
                this._spawnHomingBullet(x + 0.4, y, dmg);
                if (weaponLevel >= 2) {
                    this._spawnHomingBullet(x - 0.6, y - 0.2, dmg);
                    this._spawnHomingBullet(x + 0.6, y - 0.2, dmg);
                }
                break;
        }
    }

    _spawnPlayerBullet(x, y, vx, vy, damage) {
        const b = this._getPlayerBullet();
        b.active = true;
        b.x = x;
        b.y = y;
        b.vx = vx;
        b.vy = vy;
        b.damage = damage;
        b.size = 0.15;
        b.isHoming = false;
        b.mesh.visible = true;
        b.mesh.material.color.setHex(COLORS.PLAYER_BULLET);
        b.mesh.position.set(x, y, 2);
    }

    _spawnHomingBullet(x, y, damage) {
        const b = this._getPlayerBullet();
        b.active = true;
        b.x = x;
        b.y = y;
        b.vx = (Math.random() - 0.5) * 5;
        b.vy = CONFIG.PLAYER_BULLET_SPEED * 0.5;
        b.damage = damage;
        b.size = 0.2;
        b.isHoming = true;
        b.mesh.visible = true;
        b.mesh.material.color.setHex(0x00ff88);
        b.mesh.position.set(x, y, 2);
    }

    // Fire enemy bullet
    fireEnemy(x, y, vx, vy, damage = 1) {
        const b = this._getEnemyBullet();
        b.active = true;
        b.x = x;
        b.y = y;
        b.vx = vx;
        b.vy = vy;
        b.damage = damage;
        b.mesh.visible = true;
        b.mesh.position.set(x, y, 2);
    }

    // Fire aimed shot at player
    fireAtPlayer(x, y, playerX, playerY, speed = CONFIG.ENEMY_BULLET_SPEED, damage = 1) {
        const dx = playerX - x;
        const dy = playerY - y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.01) return;
        this.fireEnemy(x, y, (dx / len) * speed, (dy / len) * speed, damage);
    }

    update(dt, enemies, playerX, playerY) {
        const bounds = CONFIG.GAME_HEIGHT / 2 + 2;
        const boundsW = CONFIG.GAME_WIDTH / 2 + 2;

        // Update player bullets
        for (const b of this._playerBulletPool) {
            if (!b.active) continue;

            // Homing logic
            if (b.isHoming && enemies && enemies.length > 0) {
                let closest = null;
                let closestDist = Infinity;
                for (const e of enemies) {
                    if (!e.active) continue;
                    const dx = e.x - b.x;
                    const dy = e.y - b.y;
                    const dist = dx * dx + dy * dy;
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = e;
                    }
                }
                if (closest) {
                    const dx = closest.x - b.x;
                    const dy = closest.y - b.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0.1) {
                        const homingStrength = 8;
                        b.vx += (dx / len) * homingStrength * dt;
                        b.vy += (dy / len) * homingStrength * dt;
                        // Clamp speed
                        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                        const maxSpd = CONFIG.PLAYER_BULLET_SPEED * 0.8;
                        if (spd > maxSpd) {
                            b.vx = (b.vx / spd) * maxSpd;
                            b.vy = (b.vy / spd) * maxSpd;
                        }
                    }
                }
            }

            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.mesh.position.set(b.x, b.y, 2);

            if (b.y > bounds || b.y < -bounds || b.x > boundsW || b.x < -boundsW) {
                b.active = false;
                b.mesh.visible = false;
            }
        }

        // Update enemy bullets
        for (const b of this._enemyBulletPool) {
            if (!b.active) continue;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.mesh.position.set(b.x, b.y, 2);

            if (b.y > bounds || b.y < -bounds || b.x > boundsW || b.x < -boundsW) {
                b.active = false;
                b.mesh.visible = false;
            }
        }

        // Update laser
        if (this.laserActive) {
            this.laserMesh.visible = true;
            this.laserCoreMesh.visible = true;
            this.laserMesh.position.x = playerX;
            this.laserMesh.position.y = playerY + CONFIG.GAME_HEIGHT / 2;
            this.laserCoreMesh.position.x = playerX;
            this.laserCoreMesh.position.y = playerY + CONFIG.GAME_HEIGHT / 2;
            // Flicker effect
            this.laserMesh.material.opacity = 0.4 + Math.random() * 0.3;
            this.laserCoreMesh.material.opacity = 0.6 + Math.random() * 0.3;
            const widthPulse = 0.2 + Math.random() * 0.15;
            this.laserMesh.scale.x = widthPulse / 0.3;
        } else {
            this.laserMesh.visible = false;
            this.laserCoreMesh.visible = false;
        }
        // Reset laser each frame (must be re-activated by firing)
        this.laserActive = false;
    }

    // Get active player bullets for collision
    getActivePlayerBullets() {
        return this._playerBulletPool.filter(b => b.active);
    }

    // Get active enemy bullets for collision
    getActiveEnemyBullets() {
        return this._enemyBulletPool.filter(b => b.active);
    }

    isLaserActive() {
        return this.laserMesh.visible;
    }

    getLaserX() {
        return this.laserMesh.position.x;
    }

    deactivateBullet(bullet) {
        bullet.active = false;
        bullet.mesh.visible = false;
    }

    clearAll() {
        for (const b of this._playerBulletPool) {
            b.active = false;
            b.mesh.visible = false;
        }
        for (const b of this._enemyBulletPool) {
            b.active = false;
            b.mesh.visible = false;
        }
        this.laserMesh.visible = false;
        this.laserCoreMesh.visible = false;
    }

    clearEnemyBullets() {
        for (const b of this._enemyBulletPool) {
            b.active = false;
            b.mesh.visible = false;
        }
    }
}

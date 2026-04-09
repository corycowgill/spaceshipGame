import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Enemy types
export const ENEMY_TYPE = {
    FIGHTER: 'fighter',
    CRUISER: 'cruiser',
    TURRET: 'turret',
    BOMBER: 'bomber',
    DART: 'dart',
};

// Create enemy ship geometries
function createFighterGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.lineTo(0.4, -0.1);
    shape.lineTo(0.7, 0.3);
    shape.lineTo(0.3, 0.2);
    shape.lineTo(0, 0.5);
    shape.lineTo(-0.3, 0.2);
    shape.lineTo(-0.7, 0.3);
    shape.lineTo(-0.4, -0.1);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createCruiserGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.7);
    shape.lineTo(0.3, -0.4);
    shape.lineTo(0.5, -0.1);
    shape.lineTo(0.8, 0.2);
    shape.lineTo(0.6, 0.4);
    shape.lineTo(0.4, 0.3);
    shape.lineTo(0.2, 0.6);
    shape.lineTo(0, 0.5);
    shape.lineTo(-0.2, 0.6);
    shape.lineTo(-0.4, 0.3);
    shape.lineTo(-0.6, 0.4);
    shape.lineTo(-0.8, 0.2);
    shape.lineTo(-0.5, -0.1);
    shape.lineTo(-0.3, -0.4);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createTurretGeometry() {
    const shape = new THREE.Shape();
    // Hexagonal base
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const y = Math.sin(angle) * 0.5;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createBomberGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.4);
    shape.lineTo(0.6, 0);
    shape.lineTo(0.5, 0.4);
    shape.lineTo(0, 0.3);
    shape.lineTo(-0.5, 0.4);
    shape.lineTo(-0.6, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createDartGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.6);
    shape.lineTo(0.25, 0.1);
    shape.lineTo(0.5, 0.4);
    shape.lineTo(0, 0.2);
    shape.lineTo(-0.5, 0.4);
    shape.lineTo(-0.25, 0.1);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

const GEOMETRY_MAP = {
    [ENEMY_TYPE.FIGHTER]: createFighterGeometry,
    [ENEMY_TYPE.CRUISER]: createCruiserGeometry,
    [ENEMY_TYPE.TURRET]: createTurretGeometry,
    [ENEMY_TYPE.BOMBER]: createBomberGeometry,
    [ENEMY_TYPE.DART]: createDartGeometry,
};

const COLOR_MAP = {
    [ENEMY_TYPE.FIGHTER]: COLORS.ENEMY_FIGHTER,
    [ENEMY_TYPE.CRUISER]: COLORS.ENEMY_CRUISER,
    [ENEMY_TYPE.TURRET]: COLORS.ENEMY_TURRET,
    [ENEMY_TYPE.BOMBER]: 0xffaa00,
    [ENEMY_TYPE.DART]: 0xff44aa,
};

const HP_MAP = {
    [ENEMY_TYPE.FIGHTER]: 2,
    [ENEMY_TYPE.CRUISER]: 8,
    [ENEMY_TYPE.TURRET]: 5,
    [ENEMY_TYPE.BOMBER]: 4,
    [ENEMY_TYPE.DART]: 1,
};

const SCORE_MAP = {
    [ENEMY_TYPE.FIGHTER]: CONFIG.SCORE_FIGHTER,
    [ENEMY_TYPE.CRUISER]: CONFIG.SCORE_CRUISER,
    [ENEMY_TYPE.TURRET]: CONFIG.SCORE_TURRET,
    [ENEMY_TYPE.BOMBER]: 200,
    [ENEMY_TYPE.DART]: 75,
};

const SIZE_MAP = {
    [ENEMY_TYPE.FIGHTER]: 0.8,
    [ENEMY_TYPE.CRUISER]: 1.4,
    [ENEMY_TYPE.TURRET]: 1.0,
    [ENEMY_TYPE.BOMBER]: 1.1,
    [ENEMY_TYPE.DART]: 0.6,
};

export class Enemy {
    constructor(scene, type, x, y) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
        this.hp = HP_MAP[type] || 2;
        this.maxHp = this.hp;
        this.score = SCORE_MAP[type] || 100;
        this.size = SIZE_MAP[type] || 0.8;
        this.fireTimer = 1 + Math.random() * 2;
        this.fireRate = 2 + Math.random();
        this.age = 0;

        // Movement pattern
        this.pattern = null;
        this.patternData = {};

        const geoFn = GEOMETRY_MAP[type] || createFighterGeometry;
        const geometry = geoFn();
        const material = new THREE.MeshBasicMaterial({
            color: COLOR_MAP[type] || COLORS.ENEMY_FIGHTER,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(this.size, this.size, 1);
        this.mesh.position.set(x, y, 1);
        // Enemies face downward
        this.mesh.rotation.z = Math.PI;
        scene.add(this.mesh);
    }

    update(dt, playerX, playerY, bulletSystem) {
        this.age += dt;

        // Apply movement pattern
        if (this.pattern) {
            this.pattern(this, dt, playerX, playerY);
        } else {
            // Default: drift downward
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        this.mesh.position.set(this.x, this.y, 1);

        // Firing logic
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && this.active) {
            this.fireTimer = this.fireRate;
            this._fire(bulletSystem, playerX, playerY);
        }

        // Off-screen check
        if (this.y < -CONFIG.GAME_HEIGHT / 2 - 3 ||
            this.y > CONFIG.GAME_HEIGHT / 2 + 3 ||
            this.x < -CONFIG.GAME_WIDTH / 2 - 3 ||
            this.x > CONFIG.GAME_WIDTH / 2 + 3) {
            if (this.age > 1) { // Don't remove if just spawned
                this.destroy();
            }
        }
    }

    _fire(bulletSystem, playerX, playerY) {
        if (!bulletSystem) return;

        switch (this.type) {
            case ENEMY_TYPE.FIGHTER:
                bulletSystem.fireEnemy(this.x, this.y - 0.5, 0, -CONFIG.ENEMY_BULLET_SPEED);
                break;
            case ENEMY_TYPE.CRUISER:
                bulletSystem.fireAtPlayer(this.x - 0.4, this.y - 0.3, playerX, playerY, CONFIG.ENEMY_BULLET_SPEED * 0.8);
                bulletSystem.fireAtPlayer(this.x + 0.4, this.y - 0.3, playerX, playerY, CONFIG.ENEMY_BULLET_SPEED * 0.8);
                break;
            case ENEMY_TYPE.TURRET:
                bulletSystem.fireAtPlayer(this.x, this.y, playerX, playerY, CONFIG.ENEMY_BULLET_SPEED * 1.1);
                break;
            case ENEMY_TYPE.BOMBER:
                // Spread shot downward
                for (let i = -2; i <= 2; i++) {
                    bulletSystem.fireEnemy(
                        this.x, this.y - 0.4,
                        i * 3,
                        -CONFIG.ENEMY_BULLET_SPEED * 0.7,
                    );
                }
                break;
            case ENEMY_TYPE.DART:
                // Darts don't shoot, they ram
                break;
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        // Flash white on hit
        if (this.mesh.material) {
            this.mesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (this.mesh.material) {
                    this.mesh.material.color.setHex(COLOR_MAP[this.type] || COLORS.ENEMY_FIGHTER);
                }
            }, 50);
        }
        if (this.hp <= 0) {
            this.active = false;
            return true; // destroyed
        }
        return false;
    }

    getBounds() {
        const s = this.size * 0.4;
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
    }
}

// Movement pattern factory functions
export const Patterns = {
    // Straight down
    straight(speed = 5) {
        return (enemy, dt) => {
            enemy.y -= speed * dt;
        };
    },

    // Sine wave
    sineWave(speed = 5, amplitude = 3, frequency = 2) {
        return (enemy, dt) => {
            enemy.y -= speed * dt;
            enemy.x = enemy.patternData.startX + Math.sin(enemy.age * frequency) * amplitude;
        };
    },

    // Arc from side
    arc(startSide = 'left', speed = 8) {
        return (enemy, dt) => {
            const dir = startSide === 'left' ? 1 : -1;
            enemy.x += dir * speed * 0.5 * dt;
            enemy.y -= speed * dt * 0.3;
            enemy.x += Math.sin(enemy.age * 3) * 2 * dt;
        };
    },

    // V-formation dive
    dive(targetX = 0, targetY = -5, speed = 10) {
        return (enemy, dt) => {
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.5) {
                enemy.x += (dx / dist) * speed * dt;
                enemy.y += (dy / dist) * speed * dt;
            } else {
                // After reaching target, fly off screen
                enemy.y -= speed * dt;
            }
        };
    },

    // Circle pattern
    circle(centerX = 0, centerY = 5, radius = 4, speed = 2) {
        return (enemy, dt) => {
            enemy.x = centerX + Math.cos(enemy.age * speed) * radius;
            enemy.y = centerY + Math.sin(enemy.age * speed) * radius;
        };
    },

    // Spiral inward
    spiral(speed = 5) {
        return (enemy, dt) => {
            const radius = Math.max(0.5, 8 - enemy.age * 1.5);
            enemy.x = enemy.patternData.startX + Math.cos(enemy.age * speed) * radius;
            enemy.y = enemy.patternData.startY + Math.sin(enemy.age * speed) * radius - enemy.age * 2;
        };
    },

    // Charge at player
    charge(chargeDelay = 1, chargeSpeed = 25) {
        return (enemy, dt, playerX, playerY) => {
            if (enemy.age < chargeDelay) {
                // Hover
                enemy.y -= 2 * dt;
            } else if (!enemy.patternData.charging) {
                // Lock on and charge
                enemy.patternData.charging = true;
                const dx = playerX - enemy.x;
                const dy = playerY - enemy.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                enemy.vx = (dx / len) * chargeSpeed;
                enemy.vy = (dy / len) * chargeSpeed;
            } else {
                enemy.x += enemy.vx * dt;
                enemy.y += enemy.vy * dt;
            }
        };
    },

    // Turret: stationary, scrolls down slowly
    turret(scrollSpeed = 2) {
        return (enemy, dt) => {
            enemy.y -= scrollSpeed * dt;
            // Rotate to face generally downward
            if (enemy.mesh) {
                enemy.mesh.rotation.z += dt * 0.5;
            }
        };
    },
};

// EnemyManager handles spawning and wave management
export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.waveQueue = [];
        this.waveTimer = 0;
        this.waveDelay = 0;
        this.spawningComplete = false;
    }

    loadWaves(waves) {
        this.waveQueue = [...waves];
        this.waveTimer = 0;
        this.waveDelay = 0;
        this.spawningComplete = false;
    }

    update(dt, playerX, playerY, bulletSystem) {
        // Spawn waves
        if (this.waveQueue.length > 0) {
            this.waveTimer += dt;
            if (this.waveTimer >= this.waveDelay) {
                const wave = this.waveQueue.shift();
                this._spawnWave(wave);
                this.waveDelay = wave.delay || 3;
                this.waveTimer = 0;
            }
        } else if (!this.spawningComplete) {
            this.spawningComplete = true;
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) {
                if (enemy.mesh) enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }
            enemy.update(dt, playerX, playerY, bulletSystem);
            if (!enemy.active) {
                if (enemy.mesh) enemy.destroy();
                this.enemies.splice(i, 1);
            }
        }
    }

    _spawnWave(wave) {
        const { type, count, formation, x, y, speed, extras } = wave;
        const halfW = CONFIG.GAME_WIDTH / 2;
        const topY = CONFIG.GAME_HEIGHT / 2 + 1;

        for (let i = 0; i < count; i++) {
            let ex, ey, pattern;

            switch (formation) {
                case 'line':
                    ex = (x || 0) + (i - (count - 1) / 2) * 2;
                    ey = y || topY;
                    pattern = Patterns.straight(speed || 5);
                    break;

                case 'v':
                    ex = (x || 0) + (i - (count - 1) / 2) * 1.5;
                    ey = (y || topY) + Math.abs(i - (count - 1) / 2) * 1.2;
                    pattern = Patterns.straight(speed || 5);
                    break;

                case 'sine':
                    ex = (x || 0) + (i - (count - 1) / 2) * 2;
                    ey = (y || topY) + i * 0.8;
                    pattern = Patterns.sineWave(speed || 4, extras?.amplitude || 3, extras?.frequency || 2);
                    break;

                case 'arc_left':
                    ex = -halfW - 1;
                    ey = (y || topY - 5) - i * 1.5;
                    pattern = Patterns.arc('left', speed || 8);
                    break;

                case 'arc_right':
                    ex = halfW + 1;
                    ey = (y || topY - 5) - i * 1.5;
                    pattern = Patterns.arc('right', speed || 8);
                    break;

                case 'circle':
                    ex = (x || 0);
                    ey = (y || topY);
                    pattern = Patterns.circle(
                        x || 0,
                        extras?.centerY || 5,
                        extras?.radius || 4,
                        (extras?.speed || 2) + i * 0.3,
                    );
                    break;

                case 'dive':
                    ex = (x || 0) + (i - (count - 1) / 2) * 2;
                    ey = y || topY;
                    pattern = Patterns.dive(
                        (Math.random() - 0.5) * halfW,
                        -CONFIG.GAME_HEIGHT / 4,
                        speed || 10,
                    );
                    break;

                case 'spiral':
                    ex = (x || 0);
                    ey = (y || topY);
                    pattern = Patterns.spiral(speed || 3 + i * 0.5);
                    break;

                case 'charge':
                    ex = (x || 0) + (i - (count - 1) / 2) * 3;
                    ey = y || topY;
                    pattern = Patterns.charge(0.5 + i * 0.3, speed || 25);
                    break;

                case 'turret':
                    ex = (x || 0) + (i - (count - 1) / 2) * 4;
                    ey = y || topY;
                    pattern = Patterns.turret(speed || 2);
                    break;

                default: // random
                    ex = (Math.random() - 0.5) * (CONFIG.GAME_WIDTH - 4);
                    ey = topY + i * 1.5;
                    pattern = Patterns.straight(speed || 5);
            }

            const enemy = new Enemy(this.scene, type, ex, ey);
            enemy.pattern = pattern;
            enemy.patternData.startX = ex;
            enemy.patternData.startY = ey;

            if (extras?.hp) enemy.hp = extras.hp;
            if (extras?.fireRate) enemy.fireRate = extras.fireRate;

            this.enemies.push(enemy);
        }
    }

    getActiveEnemies() {
        return this.enemies.filter(e => e.active);
    }

    isAllClear() {
        return this.spawningComplete && this.enemies.length === 0;
    }

    clearAll() {
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies = [];
        this.waveQueue = [];
    }
}

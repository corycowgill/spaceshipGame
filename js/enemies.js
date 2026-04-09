import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

export const ENEMY_TYPE = {
    FIGHTER: 'fighter',
    CRUISER: 'cruiser',
    TURRET: 'turret',
    BOMBER: 'bomber',
    DART: 'dart',
};

// --------- Geometries ---------
function createFighterGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.lineTo(0.4, -0.1);
    shape.lineTo(0.75, 0.35);
    shape.lineTo(0.3, 0.2);
    shape.lineTo(0, 0.5);
    shape.lineTo(-0.3, 0.2);
    shape.lineTo(-0.75, 0.35);
    shape.lineTo(-0.4, -0.1);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createCruiserGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.8);
    shape.lineTo(0.35, -0.5);
    shape.lineTo(0.55, -0.1);
    shape.lineTo(0.9, 0.25);
    shape.lineTo(0.7, 0.45);
    shape.lineTo(0.45, 0.35);
    shape.lineTo(0.25, 0.7);
    shape.lineTo(0, 0.55);
    shape.lineTo(-0.25, 0.7);
    shape.lineTo(-0.45, 0.35);
    shape.lineTo(-0.7, 0.45);
    shape.lineTo(-0.9, 0.25);
    shape.lineTo(-0.55, -0.1);
    shape.lineTo(-0.35, -0.5);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createTurretGeometry() {
    const shape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = i % 2 === 0 ? 0.55 : 0.45;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createTurretBarrelGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.08, -0.1);
    shape.lineTo(0.08, -0.1);
    shape.lineTo(0.08, 0.45);
    shape.lineTo(-0.08, 0.45);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createBomberGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.lineTo(0.3, -0.3);
    shape.lineTo(0.8, 0.05);
    shape.lineTo(0.7, 0.45);
    shape.lineTo(0.3, 0.3);
    shape.lineTo(0, 0.4);
    shape.lineTo(-0.3, 0.3);
    shape.lineTo(-0.7, 0.45);
    shape.lineTo(-0.8, 0.05);
    shape.lineTo(-0.3, -0.3);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

function createDartGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.75);
    shape.lineTo(0.2, 0.05);
    shape.lineTo(0.5, 0.35);
    shape.lineTo(0, 0.15);
    shape.lineTo(-0.5, 0.35);
    shape.lineTo(-0.2, 0.05);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

// Inner-detail geometries (darker layer on top of main body)
function createFighterInner() {
    const s = new THREE.Shape();
    s.moveTo(0, -0.3);
    s.lineTo(0.2, 0.0);
    s.lineTo(0, 0.25);
    s.lineTo(-0.2, 0.0);
    s.closePath();
    return new THREE.ShapeGeometry(s);
}
function createCruiserInner() {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.lineTo(0.3, -0.1);
    s.lineTo(0.2, 0.3);
    s.lineTo(-0.2, 0.3);
    s.lineTo(-0.3, -0.1);
    s.closePath();
    return new THREE.ShapeGeometry(s);
}
function createBomberInner() {
    const s = new THREE.Shape();
    s.moveTo(-0.4, -0.1);
    s.lineTo(0.4, -0.1);
    s.lineTo(0.3, 0.2);
    s.lineTo(-0.3, 0.2);
    s.closePath();
    return new THREE.ShapeGeometry(s);
}
function createDartInner() {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.lineTo(0.1, 0.0);
    s.lineTo(-0.1, 0.0);
    s.closePath();
    return new THREE.ShapeGeometry(s);
}

const GEOMETRY_MAP = {
    [ENEMY_TYPE.FIGHTER]: createFighterGeometry,
    [ENEMY_TYPE.CRUISER]: createCruiserGeometry,
    [ENEMY_TYPE.TURRET]: createTurretGeometry,
    [ENEMY_TYPE.BOMBER]: createBomberGeometry,
    [ENEMY_TYPE.DART]: createDartGeometry,
};

const INNER_GEOMETRY_MAP = {
    [ENEMY_TYPE.FIGHTER]: createFighterInner,
    [ENEMY_TYPE.CRUISER]: createCruiserInner,
    [ENEMY_TYPE.TURRET]: null, // turret has barrel instead
    [ENEMY_TYPE.BOMBER]: createBomberInner,
    [ENEMY_TYPE.DART]: createDartInner,
};

const COLOR_MAP = {
    [ENEMY_TYPE.FIGHTER]: { body: COLORS.ENEMY_FIGHTER, dark: COLORS.ENEMY_FIGHTER_DARK, core: COLORS.ENEMY_FIGHTER_CORE },
    [ENEMY_TYPE.CRUISER]: { body: COLORS.ENEMY_CRUISER, dark: COLORS.ENEMY_CRUISER_DARK, core: COLORS.ENEMY_CRUISER_CORE },
    [ENEMY_TYPE.TURRET]: { body: COLORS.ENEMY_TURRET, dark: COLORS.ENEMY_TURRET_DARK, core: COLORS.ENEMY_TURRET_CORE },
    [ENEMY_TYPE.BOMBER]: { body: COLORS.ENEMY_BOMBER, dark: COLORS.ENEMY_BOMBER_DARK, core: COLORS.ENEMY_BOMBER_CORE },
    [ENEMY_TYPE.DART]: { body: COLORS.ENEMY_DART, dark: COLORS.ENEMY_DART_DARK, core: COLORS.ENEMY_DART_CORE },
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
    [ENEMY_TYPE.FIGHTER]: 0.9,
    [ENEMY_TYPE.CRUISER]: 1.5,
    [ENEMY_TYPE.TURRET]: 1.1,
    [ENEMY_TYPE.BOMBER]: 1.2,
    [ENEMY_TYPE.DART]: 0.7,
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
        this.hitFlashTimer = 0;

        this.pattern = null;
        this.patternData = {};

        const colors = COLOR_MAP[type] || COLOR_MAP[ENEMY_TYPE.FIGHTER];
        this.colors = colors;

        const geoFn = GEOMETRY_MAP[type] || createFighterGeometry;
        const geometry = geoFn();

        // Outline layer
        const outlineMat = new THREE.MeshBasicMaterial({
            color: COLORS.OUTLINE,
            side: THREE.DoubleSide,
        });
        this.outline = new THREE.Mesh(geometry, outlineMat);
        this.outline.scale.set(this.size * 1.15, this.size * 1.15, 1);
        this.outline.position.set(x, y, 0.9);
        this.outline.rotation.z = Math.PI;
        scene.add(this.outline);

        // Main body
        const material = new THREE.MeshBasicMaterial({
            color: colors.body,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(this.size, this.size, 1);
        this.mesh.position.set(x, y, 1);
        this.mesh.rotation.z = Math.PI;
        scene.add(this.mesh);

        // Inner detail / dark hull
        const innerFn = INNER_GEOMETRY_MAP[type];
        if (innerFn) {
            const innerGeo = innerFn();
            const innerMat = new THREE.MeshBasicMaterial({
                color: colors.dark,
                side: THREE.DoubleSide,
            });
            this.inner = new THREE.Mesh(innerGeo, innerMat);
            this.inner.scale.set(this.size, this.size, 1);
            this.inner.position.set(x, y, 1.05);
            this.inner.rotation.z = Math.PI;
            scene.add(this.inner);
        }

        // Turret gets rotating barrel
        if (type === ENEMY_TYPE.TURRET) {
            const barrelGeo = createTurretBarrelGeometry();
            const barrelMat = new THREE.MeshBasicMaterial({
                color: colors.dark,
                side: THREE.DoubleSide,
            });
            this.barrel = new THREE.Mesh(barrelGeo, barrelMat);
            this.barrel.scale.set(this.size, this.size, 1);
            this.barrel.position.set(x, y, 1.05);
            scene.add(this.barrel);

            // Center core
            const coreGeo = new THREE.CircleGeometry(0.15, 12);
            const coreMat = new THREE.MeshBasicMaterial({ color: colors.core });
            this.core = new THREE.Mesh(coreGeo, coreMat);
            this.core.scale.set(this.size, this.size, 1);
            this.core.position.set(x, y, 1.1);
            scene.add(this.core);
        } else {
            // Glowing core for other enemies
            const coreGeo = new THREE.CircleGeometry(0.08, 10);
            const coreMat = new THREE.MeshBasicMaterial({
                color: colors.core,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            this.core = new THREE.Mesh(coreGeo, coreMat);
            this.core.scale.set(this.size, this.size, 1);
            this.core.position.set(x, y, 1.1);
            scene.add(this.core);
        }
    }

    update(dt, playerX, playerY, bulletSystem) {
        this.age += dt;

        if (this.pattern) {
            this.pattern(this, dt, playerX, playerY);
        } else {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        // Sync all meshes
        if (this.mesh) this.mesh.position.set(this.x, this.y, 1);
        if (this.outline) this.outline.position.set(this.x, this.y, 0.9);
        if (this.inner) this.inner.position.set(this.x, this.y, 1.05);
        if (this.core) this.core.position.set(this.x, this.y, 1.1);

        // Turret barrel aims at player
        if (this.type === ENEMY_TYPE.TURRET && this.barrel) {
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const angle = Math.atan2(dy, dx) - Math.PI / 2;
            this.barrel.rotation.z = angle;
            this.barrel.position.set(this.x, this.y, 1.05);
        }

        // Hit flash timer (replaces setTimeout)
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
            const t = Math.max(0, this.hitFlashTimer / 0.08);
            if (this.mesh && this.mesh.material) {
                const c = new THREE.Color(this.colors.body);
                c.lerp(new THREE.Color(0xffffff), t);
                this.mesh.material.color.copy(c);
            }
        }

        // Firing
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && this.active) {
            this.fireTimer = this.fireRate;
            this._fire(bulletSystem, playerX, playerY);
        }

        // Off-screen cleanup
        if (this.y < -CONFIG.GAME_HEIGHT / 2 - 3 ||
            this.y > CONFIG.GAME_HEIGHT / 2 + 3 ||
            this.x < -CONFIG.GAME_WIDTH / 2 - 3 ||
            this.x > CONFIG.GAME_WIDTH / 2 + 3) {
            if (this.age > 1) {
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
                for (let i = -2; i <= 2; i++) {
                    bulletSystem.fireEnemy(
                        this.x, this.y - 0.4,
                        i * 3,
                        -CONFIG.ENEMY_BULLET_SPEED * 0.7,
                    );
                }
                break;
            case ENEMY_TYPE.DART:
                break;
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlashTimer = 0.08;
        if (this.hp <= 0) {
            this.active = false;
            return true;
        }
        return false;
    }

    getBounds() {
        const s = this.size * 0.4;
        return { x: this.x - s, y: this.y - s, w: s * 2, h: s * 2 };
    }

    destroy() {
        this.active = false;
        const removeMesh = (m) => {
            if (!m) return;
            this.scene.remove(m);
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
        };
        removeMesh(this.mesh);
        removeMesh(this.outline);
        removeMesh(this.inner);
        removeMesh(this.core);
        removeMesh(this.barrel);
        this.mesh = null;
        this.outline = null;
        this.inner = null;
        this.core = null;
        this.barrel = null;
    }
}

// Movement patterns (unchanged)
export const Patterns = {
    straight(speed = 5) {
        return (enemy, dt) => { enemy.y -= speed * dt; };
    },
    sineWave(speed = 5, amplitude = 3, frequency = 2) {
        return (enemy, dt) => {
            enemy.y -= speed * dt;
            enemy.x = enemy.patternData.startX + Math.sin(enemy.age * frequency) * amplitude;
        };
    },
    arc(startSide = 'left', speed = 8) {
        return (enemy, dt) => {
            const dir = startSide === 'left' ? 1 : -1;
            enemy.x += dir * speed * 0.5 * dt;
            enemy.y -= speed * dt * 0.3;
            enemy.x += Math.sin(enemy.age * 3) * 2 * dt;
        };
    },
    dive(targetX = 0, targetY = -5, speed = 10) {
        return (enemy, dt) => {
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.5) {
                enemy.x += (dx / dist) * speed * dt;
                enemy.y += (dy / dist) * speed * dt;
            } else {
                enemy.y -= speed * dt;
            }
        };
    },
    circle(centerX = 0, centerY = 5, radius = 4, speed = 2) {
        return (enemy, dt) => {
            enemy.x = centerX + Math.cos(enemy.age * speed) * radius;
            enemy.y = centerY + Math.sin(enemy.age * speed) * radius;
        };
    },
    spiral(speed = 5) {
        return (enemy, dt) => {
            const radius = Math.max(0.5, 8 - enemy.age * 1.5);
            enemy.x = enemy.patternData.startX + Math.cos(enemy.age * speed) * radius;
            enemy.y = enemy.patternData.startY + Math.sin(enemy.age * speed) * radius - enemy.age * 2;
        };
    },
    charge(chargeDelay = 1, chargeSpeed = 25) {
        return (enemy, dt, playerX, playerY) => {
            if (enemy.age < chargeDelay) {
                enemy.y -= 2 * dt;
            } else if (!enemy.patternData.charging) {
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
    turret(scrollSpeed = 2) {
        return (enemy, dt) => {
            enemy.y -= scrollSpeed * dt;
        };
    },
};

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
                default:
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

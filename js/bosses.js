import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Boss definitions for each stage
function createBossGeometry(type) {
    const shape = new THREE.Shape();

    switch (type) {
        case 0: // Stage 1 - Asteroid Guardian (wide, angular)
            shape.moveTo(0, -1.2);
            shape.lineTo(0.6, -0.8);
            shape.lineTo(1.2, -0.3);
            shape.lineTo(1.5, 0.2);
            shape.lineTo(1.8, 0.5);
            shape.lineTo(1.2, 0.8);
            shape.lineTo(0.6, 0.6);
            shape.lineTo(0.3, 1.0);
            shape.lineTo(0, 0.8);
            shape.lineTo(-0.3, 1.0);
            shape.lineTo(-0.6, 0.6);
            shape.lineTo(-1.2, 0.8);
            shape.lineTo(-1.8, 0.5);
            shape.lineTo(-1.5, 0.2);
            shape.lineTo(-1.2, -0.3);
            shape.lineTo(-0.6, -0.8);
            shape.closePath();
            break;

        case 1: // Stage 2 - Fleet Commander (elongated, menacing)
            shape.moveTo(0, -1.5);
            shape.lineTo(0.4, -1.0);
            shape.lineTo(0.8, -0.5);
            shape.lineTo(2.0, 0.0);
            shape.lineTo(1.5, 0.3);
            shape.lineTo(1.0, 0.2);
            shape.lineTo(0.5, 0.8);
            shape.lineTo(0.3, 1.2);
            shape.lineTo(0, 1.0);
            shape.lineTo(-0.3, 1.2);
            shape.lineTo(-0.5, 0.8);
            shape.lineTo(-1.0, 0.2);
            shape.lineTo(-1.5, 0.3);
            shape.lineTo(-2.0, 0.0);
            shape.lineTo(-0.8, -0.5);
            shape.lineTo(-0.4, -1.0);
            shape.closePath();
            break;

        case 2: // Stage 3 - Alien Warden (organic, curved)
            shape.moveTo(0, -1.3);
            shape.quadraticCurveTo(0.8, -1.0, 1.2, -0.3);
            shape.quadraticCurveTo(1.8, 0.2, 1.5, 0.8);
            shape.quadraticCurveTo(1.0, 1.2, 0.5, 1.0);
            shape.quadraticCurveTo(0.2, 1.3, 0, 1.1);
            shape.quadraticCurveTo(-0.2, 1.3, -0.5, 1.0);
            shape.quadraticCurveTo(-1.0, 1.2, -1.5, 0.8);
            shape.quadraticCurveTo(-1.8, 0.2, -1.2, -0.3);
            shape.quadraticCurveTo(-0.8, -1.0, 0, -1.3);
            break;

        case 3: // Stage 4 - Base Core (mechanical, symmetric)
            shape.moveTo(0, -1.5);
            shape.lineTo(1.0, -1.0);
            shape.lineTo(1.5, -0.5);
            shape.lineTo(2.0, 0);
            shape.lineTo(1.5, 0.5);
            shape.lineTo(1.0, 1.0);
            shape.lineTo(0, 1.5);
            shape.lineTo(-1.0, 1.0);
            shape.lineTo(-1.5, 0.5);
            shape.lineTo(-2.0, 0);
            shape.lineTo(-1.5, -0.5);
            shape.lineTo(-1.0, -1.0);
            shape.closePath();
            break;

        case 4: // Stage 5 - Final Mothership (massive, complex)
            shape.moveTo(0, -2.0);
            shape.lineTo(0.5, -1.5);
            shape.lineTo(1.5, -1.0);
            shape.lineTo(2.5, -0.3);
            shape.lineTo(2.2, 0.3);
            shape.lineTo(1.8, 0.5);
            shape.lineTo(2.0, 1.0);
            shape.lineTo(1.5, 1.2);
            shape.lineTo(1.0, 0.8);
            shape.lineTo(0.5, 1.5);
            shape.lineTo(0, 1.3);
            shape.lineTo(-0.5, 1.5);
            shape.lineTo(-1.0, 0.8);
            shape.lineTo(-1.5, 1.2);
            shape.lineTo(-2.0, 1.0);
            shape.lineTo(-1.8, 0.5);
            shape.lineTo(-2.2, 0.3);
            shape.lineTo(-2.5, -0.3);
            shape.lineTo(-1.5, -1.0);
            shape.lineTo(-0.5, -1.5);
            shape.closePath();
            break;
    }

    return new THREE.ShapeGeometry(shape);
}

const BOSS_CONFIGS = [
    {
        name: 'ASTEROID GUARDIAN',
        hp: 150,
        size: 2.0,
        color: COLORS.BOSS_BODY,
        accentColor: COLORS.BOSS_ACCENT,
        phases: 2,
    },
    {
        name: 'FLEET COMMANDER',
        hp: 250,
        size: 2.2,
        color: 0x4422aa,
        accentColor: 0xff6600,
        phases: 2,
    },
    {
        name: 'ALIEN WARDEN',
        hp: 350,
        size: 2.3,
        color: 0x22aa44,
        accentColor: 0x88ff00,
        phases: 3,
    },
    {
        name: 'BASE CORE',
        hp: 450,
        size: 2.5,
        color: 0xaa2244,
        accentColor: 0xff4400,
        phases: 3,
    },
    {
        name: 'VOID MOTHERSHIP',
        hp: 600,
        size: 3.0,
        color: 0x6600cc,
        accentColor: 0xff00ff,
        phases: 4,
    },
];

export class Boss {
    constructor(scene, stageIndex) {
        this.scene = scene;
        this.stageIndex = stageIndex;
        const config = BOSS_CONFIGS[stageIndex] || BOSS_CONFIGS[0];

        this.name = config.name;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.size = config.size;
        this.active = true;
        this.phase = 0;
        this.maxPhases = config.phases;
        this.age = 0;
        this.fireTimer = 0;
        this.patternTimer = 0;
        this.attackPattern = 0;

        // Position - enter from top
        this.x = 0;
        this.y = CONFIG.GAME_HEIGHT / 2 + 5;
        this.targetY = CONFIG.GAME_HEIGHT / 2 - 5;
        this.entering = true;

        // Create mesh
        const geometry = createBossGeometry(stageIndex);
        const material = new THREE.MeshBasicMaterial({
            color: config.color,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(config.size, config.size, 1);
        this.mesh.position.set(this.x, this.y, 1);
        this.mesh.rotation.z = Math.PI;
        scene.add(this.mesh);

        // Accent details
        const accentShape = new THREE.Shape();
        accentShape.moveTo(0, -0.3);
        accentShape.lineTo(0.3, 0);
        accentShape.lineTo(0, 0.3);
        accentShape.lineTo(-0.3, 0);
        accentShape.closePath();
        const accentGeo = new THREE.ShapeGeometry(accentShape);
        const accentMat = new THREE.MeshBasicMaterial({
            color: config.accentColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
        this.accent = new THREE.Mesh(accentGeo, accentMat);
        this.accent.position.z = 1.1;
        this.accent.scale.set(config.size * 0.6, config.size * 0.6, 1);
        scene.add(this.accent);

        // Engine glow
        const glowGeo = new THREE.CircleGeometry(0.5, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: config.accentColor,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        });
        this.glow = new THREE.Mesh(glowGeo, glowMat);
        this.glow.position.z = 0.9;
        this.glow.scale.set(config.size, config.size, 1);
        scene.add(this.glow);
    }

    update(dt, playerX, playerY, bulletSystem) {
        this.age += dt;

        // Entry movement
        if (this.entering) {
            this.y += (this.targetY - this.y) * 2 * dt;
            if (Math.abs(this.y - this.targetY) < 0.1) {
                this.y = this.targetY;
                this.entering = false;
            }
            this._syncPosition();
            return;
        }

        // Phase transitions
        const hpRatio = this.hp / this.maxHp;
        const newPhase = Math.floor((1 - hpRatio) * this.maxPhases);
        if (newPhase > this.phase) {
            this.phase = newPhase;
            this.attackPattern = 0;
            this.patternTimer = 0;
        }

        // Movement
        this._updateMovement(dt, playerX);

        // Attack patterns
        this.fireTimer -= dt;
        this.patternTimer += dt;
        if (this.fireTimer <= 0) {
            this._attack(bulletSystem, playerX, playerY);
        }

        // Visual effects
        const pulse = 0.8 + Math.sin(this.age * 3) * 0.2;
        this.glow.material.opacity = 0.2 * pulse;
        this.glow.scale.set(this.size * pulse, this.size * pulse, 1);
        this.accent.rotation.z = this.age * 1.5;

        // Flash red when low HP
        if (hpRatio < 0.3) {
            if (Math.floor(this.age * 5) % 2 === 0) {
                this.mesh.material.color.setHex(0xff0000);
            } else {
                this.mesh.material.color.setHex(BOSS_CONFIGS[this.stageIndex]?.color || COLORS.BOSS_BODY);
            }
        }

        this._syncPosition();
    }

    _updateMovement(dt, playerX) {
        // Sway back and forth, more aggressive in later phases
        const speed = 3 + this.phase * 2;
        const amplitude = 4 + this.phase * 1.5;
        this.x = Math.sin(this.age * speed * 0.3) * amplitude;

        // Occasionally lunge toward player
        if (this.phase >= 1 && Math.sin(this.age * 0.7) > 0.9) {
            this.x += (playerX - this.x) * 0.02;
        }

        // Vertical bobbing
        this.y = this.targetY + Math.sin(this.age * 0.5) * 1.5;
    }

    _attack(bulletSystem, playerX, playerY) {
        const spd = CONFIG.ENEMY_BULLET_SPEED;

        switch (this.stageIndex) {
            case 0: this._attackStage1(bulletSystem, playerX, playerY, spd); break;
            case 1: this._attackStage2(bulletSystem, playerX, playerY, spd); break;
            case 2: this._attackStage3(bulletSystem, playerX, playerY, spd); break;
            case 3: this._attackStage4(bulletSystem, playerX, playerY, spd); break;
            case 4: this._attackStage5(bulletSystem, playerX, playerY, spd); break;
        }
    }

    _attackStage1(bs, px, py, spd) {
        if (this.phase === 0) {
            // Simple spread shots
            for (let i = -2; i <= 2; i++) {
                bs.fireEnemy(this.x + i * 0.5, this.y - 1, i * 2, -spd);
            }
            this.fireTimer = 0.8;
        } else {
            // Aimed bursts + spread
            bs.fireAtPlayer(this.x, this.y - 1, px, py, spd * 1.2);
            bs.fireAtPlayer(this.x - 1, this.y - 0.5, px, py, spd);
            bs.fireAtPlayer(this.x + 1, this.y - 0.5, px, py, spd);
            for (let i = -3; i <= 3; i++) {
                bs.fireEnemy(this.x + i * 0.4, this.y - 1.2, i * 1.5, -spd * 0.8);
            }
            this.fireTimer = 0.6;
        }
    }

    _attackStage2(bs, px, py, spd) {
        if (this.phase === 0) {
            // Alternating side shots
            const side = Math.floor(this.patternTimer * 2) % 2 === 0 ? -1 : 1;
            for (let i = 0; i < 4; i++) {
                bs.fireEnemy(this.x + side * 1.5, this.y - 0.5 - i * 0.3,
                    side * (spd * 0.3), -spd * 0.8);
            }
            this.fireTimer = 0.5;
        } else {
            // Circular bullet pattern
            const count = 12;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + this.patternTimer;
                bs.fireEnemy(this.x, this.y,
                    Math.cos(angle) * spd * 0.8,
                    Math.sin(angle) * spd * 0.8);
            }
            this.fireTimer = 0.7;
        }
    }

    _attackStage3(bs, px, py, spd) {
        const attackType = Math.floor(this.patternTimer / 3) % 3;
        if (attackType === 0) {
            // Spiral bullets
            for (let i = 0; i < 5; i++) {
                const angle = this.age * 3 + i * (Math.PI * 2 / 5);
                bs.fireEnemy(this.x, this.y,
                    Math.cos(angle) * spd,
                    Math.sin(angle) * spd);
            }
            this.fireTimer = 0.2;
        } else if (attackType === 1) {
            // Aimed triple shot
            for (let i = -1; i <= 1; i++) {
                bs.fireAtPlayer(this.x + i * 1, this.y - 1, px, py, spd * 1.1);
            }
            this.fireTimer = 0.4;
        } else {
            // Wall of bullets with gap
            const gap = Math.floor(Math.random() * 8);
            for (let i = 0; i < 10; i++) {
                if (Math.abs(i - gap) <= 1) continue;
                bs.fireEnemy(
                    this.x + (i - 4.5) * 1.2, this.y - 1,
                    0, -spd * 0.6);
            }
            this.fireTimer = 0.8;
        }
    }

    _attackStage4(bs, px, py, spd) {
        const attackType = Math.floor(this.patternTimer / 2.5) % 4;
        if (attackType === 0) {
            // Cross pattern
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.age;
                bs.fireEnemy(this.x, this.y,
                    Math.cos(angle) * spd, Math.sin(angle) * spd);
            }
            this.fireTimer = 0.15;
        } else if (attackType === 1) {
            // Tracking burst
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    bs.fireAtPlayer(this.x, this.y - 1, px, py, spd * 1.3);
                }, i * 100);
            }
            this.fireTimer = 0.6;
        } else if (attackType === 2) {
            // Side sweeps
            for (let i = 0; i < 6; i++) {
                bs.fireEnemy(this.x - 2, this.y - 1 + i * 0.3, spd * 0.5, -spd * 0.5);
                bs.fireEnemy(this.x + 2, this.y - 1 + i * 0.3, -spd * 0.5, -spd * 0.5);
            }
            this.fireTimer = 0.5;
        } else {
            // Aimed rapid fire
            bs.fireAtPlayer(this.x, this.y - 1.5, px, py, spd * 1.5);
            this.fireTimer = 0.15;
        }
    }

    _attackStage5(bs, px, py, spd) {
        // Final boss - combines everything
        const attackType = Math.floor(this.patternTimer / 2) % 5;

        // Always fire aimed shots
        if (Math.random() < 0.3) {
            bs.fireAtPlayer(this.x - 1.5, this.y - 1, px, py, spd);
            bs.fireAtPlayer(this.x + 1.5, this.y - 1, px, py, spd);
        }

        if (attackType === 0) {
            // Double spiral
            for (let i = 0; i < 6; i++) {
                const a1 = this.age * 4 + i * (Math.PI * 2 / 6);
                const a2 = -this.age * 4 + i * (Math.PI * 2 / 6);
                bs.fireEnemy(this.x, this.y, Math.cos(a1) * spd, Math.sin(a1) * spd);
                bs.fireEnemy(this.x, this.y, Math.cos(a2) * spd * 0.8, Math.sin(a2) * spd * 0.8);
            }
            this.fireTimer = 0.2;
        } else if (attackType === 1) {
            // Wide spread
            for (let i = -5; i <= 5; i++) {
                bs.fireEnemy(this.x + i * 0.8, this.y - 1.5, i * 1.5, -spd * 0.7);
            }
            this.fireTimer = 0.5;
        } else if (attackType === 2) {
            // Aimed burst x5
            for (let i = 0; i < 5; i++) {
                const offset = (i - 2) * 0.8;
                bs.fireAtPlayer(this.x + offset, this.y - 1, px, py, spd * 1.2);
            }
            this.fireTimer = 0.3;
        } else if (attackType === 3) {
            // Radial explosion
            const count = 16 + this.phase * 4;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                bs.fireEnemy(this.x, this.y,
                    Math.cos(angle) * spd * 0.9,
                    Math.sin(angle) * spd * 0.9);
            }
            this.fireTimer = 1.0;
        } else {
            // Walls with random gaps
            for (let wave = 0; wave < 2; wave++) {
                const gap = Math.floor(Math.random() * 10);
                for (let i = 0; i < 12; i++) {
                    if (Math.abs(i - gap) <= 1) continue;
                    const delay = wave * 200;
                    setTimeout(() => {
                        bs.fireEnemy(
                            this.x + (i - 5.5) * 1.0, this.y - 1,
                            0, -spd * (0.5 + wave * 0.2));
                    }, delay);
                }
            }
            this.fireTimer = 0.8;
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        // Flash
        if (this.mesh.material) {
            this.mesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (this.mesh && this.mesh.material) {
                    this.mesh.material.color.setHex(
                        BOSS_CONFIGS[this.stageIndex]?.color || COLORS.BOSS_BODY
                    );
                }
            }, 30);
        }
        if (this.hp <= 0) {
            this.active = false;
            return true;
        }
        return false;
    }

    getBounds() {
        const s = this.size * 0.7;
        return { x: this.x - s, y: this.y - s, w: s * 2, h: s * 2 };
    }

    _syncPosition() {
        if (this.mesh) {
            this.mesh.position.set(this.x, this.y, 1);
        }
        if (this.accent) {
            this.accent.position.set(this.x, this.y, 1.1);
        }
        if (this.glow) {
            this.glow.position.set(this.x, this.y, 0.9);
        }
    }

    destroy() {
        this.active = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        if (this.accent) {
            this.scene.remove(this.accent);
            this.accent.geometry.dispose();
            this.accent.material.dispose();
            this.accent = null;
        }
        if (this.glow) {
            this.scene.remove(this.glow);
            this.glow.geometry.dispose();
            this.glow.material.dispose();
            this.glow = null;
        }
    }
}

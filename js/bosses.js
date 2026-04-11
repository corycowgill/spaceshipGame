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
        this.maxPhases = Math.max(3, config.phases); // minimum 3 phases
        this.age = 0;
        this.fireTimer = 0;
        this.patternTimer = 0;
        this.attackPattern = 0;

        // Phase transition state
        this.phaseTransitionTimer = 0; // >0 = in transition (attacks paused, flash)
        this.phaseTransitionDuration = 1.2;

        // Timer queue to replace setTimeout for staggered bullet spawns
        this._timerQueue = []; // [{delay, fn}]

        // Position - enter from top
        this.x = 0;
        this.y = CONFIG.GAME_HEIGHT / 2 + 5;
        this.targetY = CONFIG.GAME_HEIGHT / 2 - 5;
        this.entering = true;

        this.config = config;
        this.bodyColor = new THREE.Color(config.color);
        this.damageColor = new THREE.Color(0xff3300);
        this.hitFlashTimer = 0;

        const geometry = createBossGeometry(stageIndex);

        // Outer halo (big additive bloom)
        const haloGeo = new THREE.CircleGeometry(config.size * 1.8, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: config.accentColor,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.halo = new THREE.Mesh(haloGeo, haloMat);
        this.halo.position.set(this.x, this.y, 0.8);
        scene.add(this.halo);

        // Outline layer
        const outlineMat = new THREE.MeshBasicMaterial({
            color: COLORS.OUTLINE,
            side: THREE.DoubleSide,
        });
        this.outline = new THREE.Mesh(geometry, outlineMat);
        this.outline.scale.set(config.size * 1.1, config.size * 1.1, 1);
        this.outline.position.set(this.x, this.y, 0.9);
        this.outline.rotation.z = Math.PI;
        scene.add(this.outline);

        // Main body
        const material = new THREE.MeshBasicMaterial({
            color: config.color,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(config.size, config.size, 1);
        this.mesh.position.set(this.x, this.y, 1);
        this.mesh.rotation.z = Math.PI;
        scene.add(this.mesh);

        // Dark inner layer for depth
        const innerMat = new THREE.MeshBasicMaterial({
            color: config.darkColor || 0x110022,
            side: THREE.DoubleSide,
        });
        this.inner = new THREE.Mesh(geometry, innerMat);
        this.inner.scale.set(config.size * 0.7, config.size * 0.7, 1);
        this.inner.position.set(this.x, this.y, 1.05);
        this.inner.rotation.z = Math.PI;
        scene.add(this.inner);

        // Rotating accent diamond (core)
        const accentShape = new THREE.Shape();
        accentShape.moveTo(0, -0.4);
        accentShape.lineTo(0.3, 0);
        accentShape.lineTo(0, 0.4);
        accentShape.lineTo(-0.3, 0);
        accentShape.closePath();
        const accentGeo = new THREE.ShapeGeometry(accentShape);
        const accentMat = new THREE.MeshBasicMaterial({
            color: config.accentColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.accent = new THREE.Mesh(accentGeo, accentMat);
        this.accent.position.z = 1.12;
        this.accent.scale.set(config.size * 0.6, config.size * 0.6, 1);
        scene.add(this.accent);

        // Weapon ports (4 pulsing circles at cardinal offsets)
        this.ports = [];
        const portOffsets = [
            { x: -0.8, y: -0.3 },
            { x: 0.8, y: -0.3 },
            { x: -0.5, y: 0.6 },
            { x: 0.5, y: 0.6 },
        ];
        for (const off of portOffsets) {
            const portGeo = new THREE.CircleGeometry(0.12, 10);
            const portMat = new THREE.MeshBasicMaterial({
                color: COLORS.BOSS_PORT,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const port = new THREE.Mesh(portGeo, portMat);
            port.userData.offset = off;
            port.scale.set(config.size, config.size, 1);
            port.position.z = 1.15;
            scene.add(port);
            this.ports.push(port);
        }

        // Engine glow
        const glowGeo = new THREE.CircleGeometry(0.5, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: config.accentColor,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.glow = new THREE.Mesh(glowGeo, glowMat);
        this.glow.position.set(this.x, this.y, 0.9);
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

        // Timer queue (replaces setTimeout for staggered bullets)
        for (let i = this._timerQueue.length - 1; i >= 0; i--) {
            this._timerQueue[i].delay -= dt;
            if (this._timerQueue[i].delay <= 0) {
                this._timerQueue[i].fn();
                this._timerQueue.splice(i, 1);
            }
        }

        // Phase transitions
        const hpRatio = this.hp / this.maxHp;
        const newPhase = Math.floor((1 - hpRatio) * this.maxPhases);
        if (newPhase > this.phase) {
            this.phase = newPhase;
            this.attackPattern = 0;
            this.patternTimer = 0;
            // Phase transition feedback
            this.phaseTransitionTimer = this.phaseTransitionDuration;
            this._timerQueue = []; // cancel pending bullets
            // Clear enemy bullets (give player breathing room) — done via callback
            if (this._onPhaseChange) this._onPhaseChange(this.phase);
        }

        // Phase transition pause: flash and don't attack
        if (this.phaseTransitionTimer > 0) {
            this.phaseTransitionTimer -= dt;
            this._updateMovement(dt, playerX);
            // White flash during transition
            if (this.mesh && this.mesh.material) {
                const flashT = Math.sin(this.phaseTransitionTimer * 12);
                this.mesh.material.color.setHex(flashT > 0 ? 0xffffff : this.config.color);
            }
            this._syncPosition();
            return; // skip attack logic during phase transition
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
        this.accent.material.opacity = 0.8 + Math.sin(this.age * 4) * 0.15;

        // Halo pulse
        if (this.halo) {
            const haloPulse = 1 + Math.sin(this.age * 1.5) * 0.08;
            this.halo.scale.set(haloPulse, haloPulse, 1);
            this.halo.material.opacity = 0.12 + Math.sin(this.age * 2) * 0.05;
        }

        // Weapon ports pulse brighter near firing
        const portPulse = Math.max(0, 1 - this.fireTimer * 3);
        for (const port of this.ports) {
            port.material.opacity = 0.4 + portPulse * 0.6;
            const ps = 1 + portPulse * 0.5;
            port.scale.set(this.size * ps, this.size * ps, 1);
        }

        // Damage color lerp - body gets redder as HP drops
        const damage = 1 - hpRatio;
        const cur = new THREE.Color().copy(this.bodyColor).lerp(this.damageColor, damage * 0.7);

        // Hit flash overlay
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
            const flashT = Math.max(0, this.hitFlashTimer / 0.06);
            cur.lerp(new THREE.Color(0xffffff), flashT);
        }

        // Low HP flicker
        if (hpRatio < 0.3 && Math.floor(this.age * 8) % 2 === 0) {
            cur.lerp(new THREE.Color(0xff2200), 0.4);
        }

        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.copy(cur);
        }

        // Emit sparks when heavily damaged
        if (hpRatio < 0.5 && Math.random() < 0.1 && this._particles) {
            this._particles.explode(
                this.x + (Math.random() - 0.5) * this.size * 2,
                this.y + (Math.random() - 0.5) * this.size * 2,
                3, 0.4,
            );
        }

        this._syncPosition();
    }

    // Injected by game loop so boss can spawn damage sparks
    setParticleSystem(p) { this._particles = p; }

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
                this._timerQueue.push({ delay: i * 0.1, fn: () => {
                    if (this.active) bs.fireAtPlayer(this.x, this.y - 1, px, py, spd * 1.3);
                }});
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
                    const waveSpd = spd * (0.5 + wave * 0.2);
                    const col = i;
                    this._timerQueue.push({ delay: wave * 0.2, fn: () => {
                        if (this.active) bs.fireEnemy(
                            this.x + (col - 5.5) * 1.0, this.y - 1,
                            0, -waveSpd);
                    }});
                }
            }
            this.fireTimer = 0.8;
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlashTimer = 0.06;
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
        if (this.mesh) this.mesh.position.set(this.x, this.y, 1);
        if (this.outline) this.outline.position.set(this.x, this.y, 0.9);
        if (this.inner) this.inner.position.set(this.x, this.y, 1.05);
        if (this.accent) this.accent.position.set(this.x, this.y, 1.12);
        if (this.glow) this.glow.position.set(this.x, this.y, 0.9);
        if (this.halo) this.halo.position.set(this.x, this.y, 0.8);
        if (this.ports) {
            for (const port of this.ports) {
                const off = port.userData.offset;
                port.position.set(
                    this.x + off.x * this.size,
                    this.y + off.y * this.size,
                    1.15,
                );
            }
        }
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
        rm(this.inner);
        rm(this.accent);
        rm(this.glow);
        rm(this.halo);
        if (this.ports) {
            for (const p of this.ports) rm(p);
            this.ports = null;
        }
        this.mesh = null;
        this.outline = null;
        this.inner = null;
        this.accent = null;
        this.glow = null;
        this.halo = null;
    }
}

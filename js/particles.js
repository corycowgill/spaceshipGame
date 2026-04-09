import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Particle class with age-based color ramp
class Particle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.size = 0;
        this.kind = 0; // 0 = fire, 1 = thruster, 2 = debris, 3 = spark
    }

    reset(x, y, vx, vy, life, size, kind = 0) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.kind = kind;
    }
}

// Expanding ring shockwave (pooled)
class Shockwave {
    constructor(scene) {
        this.scene = scene;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.life = 0;
        this.maxLife = 0;
        this.maxRadius = 0;

        const geo = new THREE.RingGeometry(0.95, 1.0, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.visible = false;
        scene.add(this.mesh);
    }

    trigger(x, y, maxRadius, life, color) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.life = life;
        this.maxLife = life;
        this.mesh.position.set(x, y, 2.5);
        this.mesh.material.color.setHex(color);
        this.mesh.visible = true;
    }

    update(dt) {
        if (!this.active) return;
        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
            this.mesh.visible = false;
            return;
        }
        const t = 1 - this.life / this.maxLife;
        const r = this.maxRadius * t;
        this.mesh.scale.set(r, r, 1);
        this.mesh.material.opacity = (1 - t) * 0.9;
    }
}

// Screen flash overlay
class ScreenFlash {
    constructor(scene) {
        const geo = new THREE.PlaneGeometry(CONFIG.GAME_WIDTH * 1.2, CONFIG.GAME_HEIGHT * 1.2);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.z = 5;
        this.mesh.visible = false;
        scene.add(this.mesh);
        this.life = 0;
        this.maxLife = 0;
    }

    trigger(intensity, life, color = 0xffffff) {
        this.life = life;
        this.maxLife = life;
        this.intensity = intensity;
        this.mesh.material.color.setHex(color);
        this.mesh.visible = true;
    }

    update(dt) {
        if (this.life <= 0) {
            this.mesh.visible = false;
            return;
        }
        this.life -= dt;
        const t = Math.max(0, this.life / this.maxLife);
        this.mesh.material.opacity = this.intensity * t;
        if (this.life <= 0) this.mesh.visible = false;
    }
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeCount = 0;

        for (let i = 0; i < CONFIG.MAX_PARTICLES; i++) {
            this.particles.push(new Particle());
        }

        const positions = new Float32Array(CONFIG.MAX_PARTICLES * 3);
        const colors = new Float32Array(CONFIG.MAX_PARTICLES * 3);
        const sizes = new Float32Array(CONFIG.MAX_PARTICLES);

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.material = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.3,
            sizeAttenuation: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        scene.add(this.points);

        // Reusable color objects for age-based ramp
        this._colorA = new THREE.Color();
        this._colorB = new THREE.Color();
        this._colorOut = new THREE.Color();

        // Fire ramp: white -> yellow -> orange -> red
        this._fireRamp = [
            new THREE.Color(0xffffff),
            new THREE.Color(COLORS.EXPLOSION_CORE),
            new THREE.Color(COLORS.EXPLOSION_MID),
            new THREE.Color(COLORS.EXPLOSION_OUTER),
            new THREE.Color(0x220000),
        ];

        // Thruster ramp: white -> cyan -> blue
        this._thrusterRamp = [
            new THREE.Color(0xffffff),
            new THREE.Color(0x00ffff),
            new THREE.Color(0x0044ff),
            new THREE.Color(0x000022),
        ];

        // Shockwave pool
        this._shockwaves = [];
        for (let i = 0; i < 12; i++) {
            this._shockwaves.push(new Shockwave(scene));
        }

        this.flash = new ScreenFlash(scene);
    }

    _getParticle() {
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) return this.particles[i];
        }
        return null;
    }

    _getShockwave() {
        for (const s of this._shockwaves) {
            if (!s.active) return s;
        }
        return null;
    }

    // Spawn an explosion at position
    explode(x, y, count = CONFIG.EXPLOSION_PARTICLE_COUNT, scale = 1) {
        for (let i = 0; i < count; i++) {
            const p = this._getParticle();
            if (!p) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 14) * scale;
            const life = 0.35 + Math.random() * 0.55;
            const size = (0.18 + Math.random() * 0.35) * scale;

            p.reset(
                x + (Math.random() - 0.5) * 0.5 * scale,
                y + (Math.random() - 0.5) * 0.5 * scale,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life, size, 0,
            );
        }

        // Shockwave ring
        const wave = this._getShockwave();
        if (wave) wave.trigger(x, y, 2.5 * scale, 0.35, 0xffffaa);
    }

    // Big boss explosion
    bigExplosion(x, y) {
        this.explode(x, y, CONFIG.BIG_EXPLOSION_PARTICLE_COUNT, 2.5);

        // Large shockwave
        const wave1 = this._getShockwave();
        if (wave1) wave1.trigger(x, y, 8, 0.7, 0xffffff);
        const wave2 = this._getShockwave();
        if (wave2) wave2.trigger(x, y, 5, 0.5, 0xff8800);

        // Screen flash
        this.flash.trigger(0.4, 0.3, 0xffffff);

        // Debris
        for (let i = 0; i < 12; i++) {
            const p = this._getParticle();
            if (!p) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            p.reset(
                x + (Math.random() - 0.5) * 1,
                y + (Math.random() - 0.5) * 1,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                1.2 + Math.random() * 0.8,
                0.2 + Math.random() * 0.15,
                2, // debris
            );
        }

        // Secondary delayed explosions
        setTimeout(() => this.explode(x + 1, y + 0.5, 20, 1.5), 100);
        setTimeout(() => this.explode(x - 1, y - 0.5, 20, 1.5), 200);
        setTimeout(() => this.explode(x + 0.5, y - 1, 20, 1.5), 300);
        setTimeout(() => this.explode(x - 0.5, y + 1, 25, 2.0), 400);
    }

    // Thruster particles for player ship
    thruster(x, y) {
        for (let i = 0; i < 2; i++) {
            const p = this._getParticle();
            if (!p) return;
            p.reset(
                x + (Math.random() - 0.5) * 0.3,
                y,
                (Math.random() - 0.5) * 1,
                -(2 + Math.random() * 3),
                0.2 + Math.random() * 0.15,
                0.15 + Math.random() * 0.1,
                1, // thruster
            );
        }
    }

    // Sparkle effect for power-ups
    sparkle(x, y, color) {
        for (let i = 0; i < 6; i++) {
            const p = this._getParticle();
            if (!p) break;
            const angle = Math.random() * Math.PI * 2;
            p.reset(
                x, y,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                0.4 + Math.random() * 0.3,
                0.12 + Math.random() * 0.15,
                3, // spark
            );
            p.sparkColor = color;
        }
        const wave = this._getShockwave();
        if (wave) wave.trigger(x, y, 1.5, 0.3, color);
    }

    // Small hit spark
    hitSpark(x, y) {
        for (let i = 0; i < 4; i++) {
            const p = this._getParticle();
            if (!p) break;
            const angle = Math.random() * Math.PI * 2;
            p.reset(
                x, y,
                Math.cos(angle) * 4,
                Math.sin(angle) * 4,
                0.2 + Math.random() * 0.15,
                0.1 + Math.random() * 0.1,
                0,
            );
        }
    }

    // Sample a ramp: t in [0,1]
    _sampleRamp(ramp, t) {
        const n = ramp.length - 1;
        const idx = Math.min(n - 1, Math.floor(t * n));
        const frac = t * n - idx;
        this._colorOut.copy(ramp[idx]).lerp(ramp[idx + 1], frac);
        return this._colorOut;
    }

    update(dt) {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;
        const sizes = this.geometry.attributes.size.array;
        let activeIdx = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            p.life -= dt;
            if (p.life <= 0) {
                p.active = false;
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Debris has gravity and drag; others just drag
            if (p.kind === 2) {
                p.vy -= 5 * dt; // gravity
                p.vx *= 0.98;
                p.vy *= 0.98;
            } else {
                p.vx *= 0.96;
                p.vy *= 0.96;
            }

            const ageT = 1 - p.life / p.maxLife;
            let color;

            if (p.kind === 0) {
                color = this._sampleRamp(this._fireRamp, ageT);
            } else if (p.kind === 1) {
                color = this._sampleRamp(this._thrusterRamp, ageT);
            } else if (p.kind === 2) {
                // Debris - dark gray to black
                const g = 0.3 * (1 - ageT);
                this._colorOut.setRGB(g, g * 0.7, g * 0.5);
                color = this._colorOut;
            } else {
                // Spark - uses sparkColor, fades to white then out
                this._colorOut.setHex(p.sparkColor || 0xffffff);
                const pulse = Math.sin(ageT * Math.PI);
                this._colorOut.multiplyScalar(pulse);
                color = this._colorOut;
            }

            const alpha = 1 - ageT;
            positions[activeIdx * 3] = p.x;
            positions[activeIdx * 3 + 1] = p.y;
            positions[activeIdx * 3 + 2] = 2;

            colors[activeIdx * 3] = color.r * alpha;
            colors[activeIdx * 3 + 1] = color.g * alpha;
            colors[activeIdx * 3 + 2] = color.b * alpha;

            sizes[activeIdx] = p.size * (0.5 + alpha * 0.5);
            activeIdx++;
        }

        for (let i = activeIdx; i < CONFIG.MAX_PARTICLES; i++) {
            positions[i * 3 + 2] = -100;
            sizes[i] = 0;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.activeCount = activeIdx;

        // Update shockwaves and flash
        for (const s of this._shockwaves) s.update(dt);
        this.flash.update(dt);
    }
}

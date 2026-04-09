import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Particle system for explosions and effects
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
        this.color = new THREE.Color();
    }

    reset(x, y, vx, vy, life, size, color) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color.setHex(color);
    }
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeCount = 0;

        // Pre-allocate particle pool
        for (let i = 0; i < CONFIG.MAX_PARTICLES; i++) {
            this.particles.push(new Particle());
        }

        // Create geometry
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
        this.scene.add(this.points);
    }

    _getParticle() {
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) return this.particles[i];
        }
        return null;
    }

    // Spawn an explosion at position
    explode(x, y, count = CONFIG.EXPLOSION_PARTICLE_COUNT, scale = 1) {
        const coreColors = [COLORS.EXPLOSION_CORE, COLORS.EXPLOSION_MID, COLORS.EXPLOSION_OUTER];
        for (let i = 0; i < count; i++) {
            const p = this._getParticle();
            if (!p) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 12) * scale;
            const color = coreColors[Math.floor(Math.random() * 3)];
            const life = 0.3 + Math.random() * 0.5;
            const size = (0.15 + Math.random() * 0.35) * scale;

            p.reset(
                x + (Math.random() - 0.5) * 0.5 * scale,
                y + (Math.random() - 0.5) * 0.5 * scale,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                size,
                color,
            );
        }
    }

    // Big boss explosion
    bigExplosion(x, y) {
        this.explode(x, y, CONFIG.BIG_EXPLOSION_PARTICLE_COUNT, 2.5);
        // Secondary delayed explosions
        setTimeout(() => this.explode(x + 1, y + 0.5, 20, 1.5), 100);
        setTimeout(() => this.explode(x - 1, y - 0.5, 20, 1.5), 200);
        setTimeout(() => this.explode(x + 0.5, y - 1, 20, 1.5), 300);
        setTimeout(() => this.explode(x - 0.5, y + 1, 25, 2.0), 400);
    }

    // Thruster particles for player ship
    thruster(x, y) {
        const p = this._getParticle();
        if (!p) return;
        p.reset(
            x + (Math.random() - 0.5) * 0.3,
            y,
            (Math.random() - 0.5) * 1,
            -(2 + Math.random() * 3),
            0.15 + Math.random() * 0.1,
            0.15 + Math.random() * 0.1,
            Math.random() > 0.5 ? 0x00ddff : 0x0088ff,
        );
    }

    // Sparkle effect for power-ups
    sparkle(x, y, color) {
        for (let i = 0; i < 3; i++) {
            const p = this._getParticle();
            if (!p) break;
            const angle = Math.random() * Math.PI * 2;
            p.reset(
                x, y,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                0.3 + Math.random() * 0.2,
                0.1 + Math.random() * 0.15,
                color,
            );
        }
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
            p.vx *= 0.97;
            p.vy *= 0.97;

            const alpha = p.life / p.maxLife;

            positions[activeIdx * 3] = p.x;
            positions[activeIdx * 3 + 1] = p.y;
            positions[activeIdx * 3 + 2] = 2;

            colors[activeIdx * 3] = p.color.r * alpha;
            colors[activeIdx * 3 + 1] = p.color.g * alpha;
            colors[activeIdx * 3 + 2] = p.color.b * alpha;

            sizes[activeIdx] = p.size * (0.5 + alpha * 0.5);
            activeIdx++;
        }

        // Zero out remaining
        for (let i = activeIdx; i < CONFIG.MAX_PARTICLES; i++) {
            positions[i * 3 + 2] = -100;
            sizes[i] = 0;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.activeCount = activeIdx;
    }
}

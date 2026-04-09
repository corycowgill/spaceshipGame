import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Multi-layer parallax starfield background
export class Background {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this._createStarLayers();
    }

    _createStarLayers() {
        const layerConfigs = [
            { count: 120, speed: 3, size: 0.08, color: COLORS.STAR_DIM, z: -10 },
            { count: 80, speed: 6, size: 0.12, color: COLORS.STAR_MID, z: -5 },
            { count: 40, speed: 10, size: 0.18, color: COLORS.STAR_BRIGHT, z: -2 },
        ];

        for (const cfg of layerConfigs) {
            const positions = new Float32Array(cfg.count * 3);
            const basePositions = new Float32Array(cfg.count * 3);

            for (let i = 0; i < cfg.count; i++) {
                const x = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.2;
                const y = (Math.random() - 0.5) * CONFIG.GAME_HEIGHT * 1.5;
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = cfg.z;
                basePositions[i * 3] = x;
                basePositions[i * 3 + 1] = y;
                basePositions[i * 3 + 2] = cfg.z;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.PointsMaterial({
                color: cfg.color,
                size: cfg.size,
                sizeAttenuation: false,
            });

            const points = new THREE.Points(geometry, material);
            this.scene.add(points);

            this.layers.push({
                points,
                geometry,
                speed: cfg.speed,
                count: cfg.count,
            });
        }
    }

    update(dt) {
        const halfH = CONFIG.GAME_HEIGHT * 0.75;

        for (const layer of this.layers) {
            const positions = layer.geometry.attributes.position.array;
            for (let i = 0; i < layer.count; i++) {
                positions[i * 3 + 1] -= layer.speed * dt;
                // Wrap stars that go off screen
                if (positions[i * 3 + 1] < -halfH) {
                    positions[i * 3 + 1] += halfH * 2;
                    positions[i * 3] = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.2;
                }
            }
            layer.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Set tint for different stages
    setStageTheme(stageIndex) {
        const themes = [
            [0x444466, 0x6666aa, 0xaaaaff], // Asteroid belt - cool blues
            [0x664444, 0xaa6666, 0xffaaaa], // Enemy fleet - warm reds
            [0x446644, 0x66aa66, 0xaaffaa], // Alien planet - greens
            [0x664466, 0xaa66aa, 0xffaaff], // Underground - purples
            [0x666644, 0xaaaa66, 0xffffaa], // Mothership - yellows
        ];
        const colors = themes[stageIndex % themes.length];
        this.layers.forEach((layer, i) => {
            layer.points.material.color.setHex(colors[i]);
        });
    }
}

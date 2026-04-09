import * as THREE from 'three';
import { CONFIG, COLORS } from './config.js';

// Multi-layer parallax starfield with nebula clouds and twinkle
export class Background {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this._createNebulaLayer();
        this._createStarLayers();
    }

    _createNebulaLayer() {
        // Big soft nebula clouds as additive sprites in the deep background
        const group = new THREE.Group();
        const nebulaCount = 10;
        const colors = [COLORS.NEBULA_BLUE, COLORS.NEBULA_MAGENTA, 0x442266, 0x113355];

        for (let i = 0; i < nebulaCount; i++) {
            const size = 6 + Math.random() * 8;
            const geo = new THREE.CircleGeometry(size, 24);
            const mat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.08 + Math.random() * 0.06,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.5,
                (Math.random() - 0.5) * CONFIG.GAME_HEIGHT * 1.5,
                -15,
            );
            group.add(mesh);
        }

        this.nebula = group;
        this.nebulaSpeed = 1.2;
        this.scene.add(group);
    }

    _createStarLayers() {
        const layerConfigs = [
            { count: 150, speed: 2.5, size: 0.06, z: -10, bright: false },
            { count: 90, speed: 6, size: 0.11, z: -5, bright: false },
            { count: 45, speed: 11, size: 0.17, z: -2, bright: true },
        ];

        for (const cfg of layerConfigs) {
            const positions = new Float32Array(cfg.count * 3);
            const colorsArr = new Float32Array(cfg.count * 3);
            const phases = new Float32Array(cfg.count);

            const baseTint = new THREE.Color();

            for (let i = 0; i < cfg.count; i++) {
                const x = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.3;
                const y = (Math.random() - 0.5) * CONFIG.GAME_HEIGHT * 1.5;
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = cfg.z;

                // Slight color variation per star
                const h = 0.55 + Math.random() * 0.15;
                const s = 0.1 + Math.random() * 0.4;
                const l = cfg.bright ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;
                baseTint.setHSL(h, s, l);
                colorsArr[i * 3] = baseTint.r;
                colorsArr[i * 3 + 1] = baseTint.g;
                colorsArr[i * 3 + 2] = baseTint.b;

                phases[i] = Math.random() * Math.PI * 2;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

            const material = new THREE.PointsMaterial({
                size: cfg.size,
                sizeAttenuation: false,
                vertexColors: true,
                transparent: true,
            });

            const points = new THREE.Points(geometry, material);
            this.scene.add(points);

            this.layers.push({
                points,
                geometry,
                speed: cfg.speed,
                count: cfg.count,
                phases,
                bright: cfg.bright,
                baseColors: colorsArr.slice(),
            });
        }
    }

    update(dt) {
        const halfH = CONFIG.GAME_HEIGHT * 0.75;
        const now = performance.now() * 0.001;

        // Scroll nebula
        if (this.nebula) {
            for (const child of this.nebula.children) {
                child.position.y -= this.nebulaSpeed * dt;
                if (child.position.y < -halfH - 10) {
                    child.position.y += halfH * 2 + 20;
                    child.position.x = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.5;
                }
            }
        }

        for (const layer of this.layers) {
            const positions = layer.geometry.attributes.position.array;
            const colors = layer.geometry.attributes.color.array;

            for (let i = 0; i < layer.count; i++) {
                positions[i * 3 + 1] -= layer.speed * dt;
                if (positions[i * 3 + 1] < -halfH) {
                    positions[i * 3 + 1] += halfH * 2;
                    positions[i * 3] = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 1.3;
                }

                // Twinkle by modulating brightness for bright layer
                if (layer.bright) {
                    const twinkle = 0.5 + 0.5 * Math.sin(now * 3 + layer.phases[i]);
                    colors[i * 3] = layer.baseColors[i * 3] * (0.4 + 0.6 * twinkle);
                    colors[i * 3 + 1] = layer.baseColors[i * 3 + 1] * (0.4 + 0.6 * twinkle);
                    colors[i * 3 + 2] = layer.baseColors[i * 3 + 2] * (0.4 + 0.6 * twinkle);
                }
            }
            layer.geometry.attributes.position.needsUpdate = true;
            if (layer.bright) {
                layer.geometry.attributes.color.needsUpdate = true;
            }
        }
    }

    // Stage-specific nebula tint without crushing foreground stars
    setStageTheme(stageIndex) {
        const themes = [
            [0x2244aa, 0x113366],
            [0xaa2244, 0x661122],
            [0x22aa44, 0x114422],
            [0x6622aa, 0x330066],
            [0xaa2288, 0x440022],
        ];
        const colors = themes[stageIndex % themes.length];
        if (this.nebula) {
            this.nebula.children.forEach((child, i) => {
                child.material.color.setHex(colors[i % 2]);
            });
        }
    }
}

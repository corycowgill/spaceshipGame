import * as THREE from 'three';
import { CONFIG, GAME_STATE, WEAPON_TYPES } from './config.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { Background } from './starfield.js';
import { ParticleSystem } from './particles.js';
import { HUD } from './overlay.js';
import { Player } from './player.js';
import { BulletSystem } from './bullets.js';
import { EnemyManager } from './enemies.js';
import { PowerUpManager } from './powerups.js';
import { Boss } from './bosses.js';
import { STAGES } from './stages.js';

// ==========================================
// VOID STRIKER - Main Game
// ==========================================

class Game {
    constructor() {
        // Three.js setup
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.renderer.setClearColor(0x000008);
        this.renderer.domElement.id = 'game-canvas';
        document.body.appendChild(this.renderer.domElement);

        // Orthographic camera looking down at XY plane
        const halfW = CONFIG.GAME_WIDTH / 2;
        const halfH = CONFIG.GAME_HEIGHT / 2;
        this.camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100);
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();

        // Systems
        this.input = new Input();
        this.audio = new Audio();
        this.background = new Background(this.scene);
        this.particles = new ParticleSystem(this.scene);
        this.hud = new HUD();
        this.bullets = new BulletSystem(this.scene);
        this.enemyManager = new EnemyManager(this.scene);
        this.powerups = new PowerUpManager(this.scene);

        // Player
        this.player = new Player(this.scene);

        // Game state
        this.state = GAME_STATE.TITLE;
        this.stateTimer = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('voidStriker_highScore') || '0');
        this.lives = CONFIG.MAX_LIVES;
        this.currentStage = 0;
        this.boss = null;

        // Timing
        this.lastTime = 0;
        this.frameDt = 1 / 60;

        // Handle resize
        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Hide loading
        document.getElementById('loading').classList.add('hidden');

        // Start game loop
        requestAnimationFrame((t) => this._loop(t));
    }

    _resize() {
        const aspect = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        let width, height;

        if (window.innerWidth / window.innerHeight > aspect) {
            height = window.innerHeight;
            width = height * aspect;
        } else {
            width = window.innerWidth;
            height = width / aspect;
        }

        this.renderer.domElement.style.width = width + 'px';
        this.renderer.domElement.style.height = height + 'px';
        this.hud.resize(width, height);
    }

    _loop(time) {
        requestAnimationFrame((t) => this._loop(t));

        const dt = Math.min((time - this.lastTime) / 1000, 0.05); // Cap dt
        this.lastTime = time;

        this.input.update();
        this.frameDt = dt; // Store for use in collision checks
        this._update(dt);
        this._render();
    }

    _update(dt) {
        this.stateTimer += dt;
        this.hud.update(dt);

        switch (this.state) {
            case GAME_STATE.TITLE:
                this._updateTitle(dt);
                break;
            case GAME_STATE.STAGE_INTRO:
                this._updateStageIntro(dt);
                break;
            case GAME_STATE.PLAYING:
                this._updatePlaying(dt);
                break;
            case GAME_STATE.BOSS_WARNING:
                this._updateBossWarning(dt);
                break;
            case GAME_STATE.BOSS_FIGHT:
                this._updateBossFight(dt);
                break;
            case GAME_STATE.STAGE_CLEAR:
                this._updateStageClear(dt);
                break;
            case GAME_STATE.GAME_OVER:
                this._updateGameOver(dt);
                break;
            case GAME_STATE.VICTORY:
                this._updateVictory(dt);
                break;
            case GAME_STATE.PAUSED:
                this._updatePaused(dt);
                break;
        }

        // Always update background
        this.background.update(dt);
    }

    _setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
    }

    // ---- State Updates ----

    _updateTitle(dt) {
        if (this.input.start) {
            this.audio.init();
            this.audio.menuSelect();
            this._startGame();
        }
    }

    _updateStageIntro(dt) {
        this.player.update(dt, this.input);
        this.particles.update(dt);
        this._emitThruster();

        if (this.stateTimer >= CONFIG.STAGE_TRANSITION_TIME) {
            this._setState(GAME_STATE.PLAYING);
            this.enemyManager.loadWaves(STAGES[this.currentStage] || STAGES[0]);
            this.audio.startMusic(this.currentStage);
        }
    }

    _updatePlaying(dt) {
        // Pause
        if (this.input.pause) {
            this._setState(GAME_STATE.PAUSED);
            this.audio.stopMusic();
            return;
        }

        this._updateGameplay(dt);

        // Check if all waves complete
        if (this.enemyManager.isAllClear()) {
            this._setState(GAME_STATE.BOSS_WARNING);
            this.audio.stopMusic();
            this.audio.bossWarning();
        }
    }

    _updateBossWarning(dt) {
        this.player.update(dt, this.input);
        this.particles.update(dt);
        this.bullets.update(dt, [], this.player.x, this.player.y);
        this._emitThruster();

        if (this.stateTimer >= CONFIG.BOSS_WARNING_TIME) {
            this._setState(GAME_STATE.BOSS_FIGHT);
            this.boss = new Boss(this.scene, this.currentStage);
            this.audio.startMusic(this.currentStage);
        }
    }

    _updateBossFight(dt) {
        if (this.input.pause) {
            this._setState(GAME_STATE.PAUSED);
            this.audio.stopMusic();
            return;
        }

        // Update player
        this.player.update(dt, this.input);
        this._emitThruster();

        // Player shooting
        if (this.input.fire && this.player.canFire() && this.player.alive) {
            this.player.fire();
            this.bullets.firePlayer(this.player.x, this.player.y, this.player.weaponType, this.player.weaponLevel);
            if (this.player.weaponType !== WEAPON_TYPES.LASER) {
                this.audio.playerShoot();
            }
        }

        // Update boss
        if (this.boss && this.boss.active) {
            this.boss.update(dt, this.player.x, this.player.y, this.bullets);
        }

        // Update bullets
        const activeEnemies = this.boss ? [this.boss] : [];
        this.bullets.update(dt, activeEnemies, this.player.x, this.player.y);

        // Update particles and powerups
        this.particles.update(dt);
        this.powerups.update(dt);

        // Collision detection
        this._checkBossCollisions();
        this._checkPlayerCollisions();

        // Check boss death
        if (this.boss && !this.boss.active) {
            this.score += CONFIG.SCORE_BOSS * (this.currentStage + 1);
            this.particles.bigExplosion(this.boss.x, this.boss.y);
            this.audio.bossExplosion();
            this.hud.flash();
            this.hud.shake(10, 0.8);
            this.boss.destroy();
            this.boss = null;
            this.bullets.clearEnemyBullets();

            if (this.currentStage >= 4) {
                // Game complete!
                this._setState(GAME_STATE.VICTORY);
                this.audio.stopMusic();
                this.audio.stageComplete();
            } else {
                this._setState(GAME_STATE.STAGE_CLEAR);
                this.score += (this.currentStage + 1) * 1000;
                this.audio.stopMusic();
                this.audio.stageComplete();
            }
        }

        // Player respawn
        this._handlePlayerRespawn(dt);
    }

    _updateStageClear(dt) {
        this.player.update(dt, this.input);
        this.particles.update(dt);
        this._emitThruster();

        if (this.stateTimer >= 3) {
            this.currentStage++;
            if (this.currentStage >= 5) {
                this._setState(GAME_STATE.VICTORY);
            } else {
                this._setState(GAME_STATE.STAGE_INTRO);
                this.background.setStageTheme(this.currentStage);
                this.bullets.clearAll();
            }
        }
    }

    _updateGameOver(dt) {
        this.particles.update(dt);
        this.background.update(dt);

        if (this.stateTimer > 2 && this.input.start) {
            this.audio.menuSelect();
            this._setState(GAME_STATE.TITLE);
            this._cleanup();
        }
    }

    _updateVictory(dt) {
        this.particles.update(dt);

        // Victory particle fireworks
        if (Math.random() < 0.1) {
            this.particles.explode(
                (Math.random() - 0.5) * CONFIG.GAME_WIDTH,
                (Math.random() - 0.5) * CONFIG.GAME_HEIGHT,
                15, 1.5
            );
        }

        if (this.stateTimer > 3 && this.input.start) {
            this.audio.menuSelect();
            this._setState(GAME_STATE.TITLE);
            this._cleanup();
        }
    }

    _updatePaused(dt) {
        if (this.input.pause) {
            // Determine which state to return to
            if (this.boss && this.boss.active) {
                this._setState(GAME_STATE.BOSS_FIGHT);
            } else {
                this._setState(GAME_STATE.PLAYING);
            }
            this.audio.startMusic(this.currentStage);
        }
    }

    // ---- Core Gameplay ----

    _updateGameplay(dt) {
        // Update player
        this.player.update(dt, this.input);
        this._emitThruster();

        // Player shooting
        if (this.input.fire && this.player.canFire() && this.player.alive) {
            this.player.fire();
            this.bullets.firePlayer(this.player.x, this.player.y, this.player.weaponType, this.player.weaponLevel);
            if (this.player.weaponType !== WEAPON_TYPES.LASER) {
                this.audio.playerShoot();
            }
        }

        // Update enemies
        this.enemyManager.update(dt, this.player.x, this.player.y, this.bullets);

        // Update bullets
        const activeEnemies = this.enemyManager.getActiveEnemies();
        this.bullets.update(dt, activeEnemies, this.player.x, this.player.y);

        // Update particles and powerups
        this.particles.update(dt);
        this.powerups.update(dt);

        // Collision detection
        this._checkEnemyCollisions();
        this._checkPlayerCollisions();
        this._checkPowerUpCollisions();

        // Player respawn
        this._handlePlayerRespawn(dt);
    }

    _emitThruster() {
        if (this.player.alive) {
            this.particles.thruster(this.player.x, this.player.y - 0.6);
        }
    }

    _handlePlayerRespawn(dt) {
        if (!this.player.alive && this.player.respawnTimer <= 0) {
            if (this.lives > 0) {
                this.lives--;
                this.player.respawn();
            } else {
                // Game over
                this._setState(GAME_STATE.GAME_OVER);
                this.audio.stopMusic();
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('voidStriker_highScore', this.highScore.toString());
                }
            }
        }
    }

    // ---- Collisions ----

    _aabb(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }

    _checkEnemyCollisions() {
        const enemies = this.enemyManager.getActiveEnemies();
        const playerBullets = this.bullets.getActivePlayerBullets();

        // Player bullets vs enemies
        for (const bullet of playerBullets) {
            const bb = {
                x: bullet.x - bullet.size,
                y: bullet.y - bullet.size,
                w: bullet.size * 2,
                h: bullet.size * 2,
            };

            for (const enemy of enemies) {
                if (!enemy.active) continue;
                const eb = enemy.getBounds();

                if (this._aabb(bb, eb)) {
                    this.bullets.deactivateBullet(bullet);
                    const destroyed = enemy.takeDamage(bullet.damage);
                    if (destroyed) {
                        this._onEnemyDestroyed(enemy);
                    } else {
                        this.particles.explode(bullet.x, bullet.y, 3, 0.3);
                    }
                    break;
                }
            }
        }

        // Laser vs enemies
        if (this.bullets.isLaserActive()) {
            const laserX = this.bullets.getLaserX();
            const laserWidth = 0.4 * this.player.weaponLevel;

            for (const enemy of enemies) {
                if (!enemy.active) continue;
                const eb = enemy.getBounds();

                if (Math.abs(enemy.x - laserX) < laserWidth + eb.w / 2 &&
                    enemy.y > this.player.y) {
                    const destroyed = enemy.takeDamage(CONFIG.LASER_DPS * this.frameDt);
                    if (destroyed) {
                        this._onEnemyDestroyed(enemy);
                    }
                }
            }
        }
    }

    _checkBossCollisions() {
        if (!this.boss || !this.boss.active) return;

        const playerBullets = this.bullets.getActivePlayerBullets();
        const bb = this.boss.getBounds();

        for (const bullet of playerBullets) {
            const bulletBounds = {
                x: bullet.x - bullet.size,
                y: bullet.y - bullet.size,
                w: bullet.size * 2,
                h: bullet.size * 2,
            };

            if (this._aabb(bulletBounds, bb)) {
                this.bullets.deactivateBullet(bullet);
                this.boss.takeDamage(bullet.damage);
                this.particles.explode(bullet.x, bullet.y, 3, 0.3);
            }
        }

        // Laser vs boss
        if (this.bullets.isLaserActive()) {
            const laserX = this.bullets.getLaserX();
            const laserWidth = 0.4 * this.player.weaponLevel;

            if (Math.abs(this.boss.x - laserX) < laserWidth + bb.w / 2 &&
                this.boss.y > this.player.y) {
                this.boss.takeDamage(CONFIG.LASER_DPS * this.frameDt);
            }
        }
    }

    _checkPlayerCollisions() {
        if (!this.player.alive || this.player.invincibleTimer > 0) return;

        const pb = this.player.getBounds();
        const enemyBullets = this.bullets.getActiveEnemyBullets();

        // Enemy bullets vs player
        for (const bullet of enemyBullets) {
            const bb = {
                x: bullet.x - 0.15,
                y: bullet.y - 0.15,
                w: 0.3,
                h: 0.3,
            };

            if (this._aabb(pb, bb)) {
                this.bullets.deactivateBullet(bullet);
                this._onPlayerHit();
                return;
            }
        }

        // Enemy ships vs player (collision)
        const enemies = this.enemyManager.getActiveEnemies();
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            if (this._aabb(pb, enemy.getBounds())) {
                this._onPlayerHit();
                // Also damage the enemy
                enemy.takeDamage(5);
                if (!enemy.active) this._onEnemyDestroyed(enemy);
                return;
            }
        }

        // Boss collision
        if (this.boss && this.boss.active && !this.boss.entering) {
            if (this._aabb(pb, this.boss.getBounds())) {
                this._onPlayerHit();
            }
        }
    }

    _checkPowerUpCollisions() {
        if (!this.player.alive) return;
        const pb = this.player.getBounds();
        // Expand pickup range
        pb.x -= 0.5;
        pb.y -= 0.5;
        pb.w += 1.0;
        pb.h += 1.0;

        for (const powerup of this.powerups.getActive()) {
            if (this._aabb(pb, powerup.getBounds())) {
                this._onPowerUpCollected(powerup);
            }
        }
    }

    // ---- Events ----

    _onEnemyDestroyed(enemy) {
        this.score += enemy.score;
        this.particles.explode(enemy.x, enemy.y, CONFIG.EXPLOSION_PARTICLE_COUNT, 1);
        this.audio.explosion();

        // Power-up drop
        if (Math.random() < CONFIG.POWERUP_DROP_CHANCE) {
            this.powerups.spawn(enemy.x, enemy.y);
        }
    }

    _onPlayerHit() {
        if (this.player.hit()) {
            this.particles.explode(this.player.x, this.player.y, 30, 1.5);
            this.audio.playerDeath();
            this.hud.flash();
            this.hud.shake(8, 0.5);
        }
    }

    _onPowerUpCollected(powerup) {
        const info = powerup.typeInfo;
        this.particles.sparkle(powerup.x, powerup.y, info.color);
        this.audio.powerUp();
        this.score += CONFIG.SCORE_POWERUP;

        switch (info.type) {
            case 'weapon':
                this.player.upgradeWeapon(info.weapon);
                break;
            case 'upgrade':
                if (this.player.weaponLevel < 3) {
                    this.player.weaponLevel++;
                }
                break;
            case 'life':
                this.lives = Math.min(this.lives + 1, CONFIG.MAX_LIVES + 2);
                break;
        }

        powerup.destroy();
    }

    // ---- Game Flow ----

    _startGame() {
        this._cleanup();
        this.score = 0;
        this.lives = CONFIG.MAX_LIVES;
        this.currentStage = 0;
        this.player.reset();
        this.background.setStageTheme(0);
        this._setState(GAME_STATE.STAGE_INTRO);
    }

    _cleanup() {
        this.enemyManager.clearAll();
        this.bullets.clearAll();
        this.powerups.clearAll();
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
        this.audio.stopMusic();
    }

    // ---- Rendering ----

    _render() {
        // Screen shake
        const shake = this.hud.getShakeOffset();
        this.camera.position.x = shake.x;
        this.camera.position.y = shake.y;

        this.renderer.render(this.scene, this.camera);
        this.hud.draw(this);
    }
}

// ==========================================
// Launch the game
// ==========================================
window.addEventListener('load', () => {
    new Game();
});

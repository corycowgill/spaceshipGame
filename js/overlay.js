import { CONFIG, WEAPON_NAMES, GAME_STATE, STAGE_NAMES } from './config.js';

// HUD overlay rendered on a 2D canvas
export class HUD {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hud-canvas';
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
    }

    flash() {
        this.flashTimer = 0.15;
    }

    shake(intensity = 5, duration = 0.3) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    resize(width, height) {
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    draw(game) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        switch (game.state) {
            case GAME_STATE.TITLE:
                this._drawTitle(ctx, w, h, game);
                break;
            case GAME_STATE.PLAYING:
            case GAME_STATE.BOSS_WARNING:
            case GAME_STATE.BOSS_FIGHT:
                this._drawGameHUD(ctx, w, h, game);
                if (game.input && game.input.isTouchDevice) {
                    this._drawTouchControls(ctx, w, h, game);
                }
                break;
            case GAME_STATE.STAGE_INTRO:
                this._drawGameHUD(ctx, w, h, game);
                this._drawStageIntro(ctx, w, h, game);
                break;
            case GAME_STATE.STAGE_CLEAR:
                this._drawGameHUD(ctx, w, h, game);
                this._drawStageClear(ctx, w, h, game);
                break;
            case GAME_STATE.GAME_OVER:
                this._drawGameHUD(ctx, w, h, game);
                this._drawGameOver(ctx, w, h, game);
                break;
            case GAME_STATE.VICTORY:
                this._drawGameHUD(ctx, w, h, game);
                this._drawVictory(ctx, w, h, game);
                break;
            case GAME_STATE.PAUSED:
                this._drawGameHUD(ctx, w, h, game);
                this._drawPaused(ctx, w, h);
                break;
        }

        // Screen flash effect
        if (this.flashTimer > 0) {
            const alpha = this.flashTimer / 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.fillRect(0, 0, w, h);
        }
    }

    update(dt) {
        if (this.flashTimer > 0) this.flashTimer -= dt;
        if (this.shakeTimer > 0) this.shakeTimer -= dt;
    }

    getShakeOffset() {
        if (this.shakeTimer <= 0) return { x: 0, y: 0 };
        const intensity = this.shakeIntensity * (this.shakeTimer / 0.3);
        return {
            x: (Math.random() - 0.5) * intensity * 0.1,
            y: (Math.random() - 0.5) * intensity * 0.1,
        };
    }

    _drawTitle(ctx, w, h, game) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glowing title
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#00ddff';
        ctx.font = 'bold 52px "Courier New", monospace';
        ctx.fillText('VOID STRIKER', w / 2, h * 0.3);

        ctx.shadowBlur = 0;

        // Subtitle
        ctx.fillStyle = '#ff44aa';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText('- DEFEND THE GALAXY -', w / 2, h * 0.38);

        // Blinking start text
        const isTouch = game.input && game.input.isTouchDevice;
        const isGamepad = game.input && game.input.isGamepadActive;
        if (Math.floor(game.stateTimer * 2) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px "Courier New", monospace';
            const startMsg = isGamepad ? 'PRESS START OR A'
                : isTouch ? 'TAP TO START'
                : 'PRESS ENTER OR SPACE TO START';
            ctx.fillText(startMsg, w / 2, h * 0.55);
        }

        // Controls
        ctx.fillStyle = '#888888';
        ctx.font = '14px "Courier New", monospace';
        if (isGamepad) {
            ctx.fillText('LEFT STICK / D-PAD - MOVE', w / 2, h * 0.70);
            ctx.fillText('A / X / RB / RT - FIRE', w / 2, h * 0.74);
            ctx.fillText('MENU - PAUSE', w / 2, h * 0.78);
        } else if (isTouch) {
            ctx.fillText('LEFT HALF - VIRTUAL JOYSTICK', w / 2, h * 0.70);
            ctx.fillText('RIGHT HALF - FIRE', w / 2, h * 0.74);
        } else {
            ctx.fillText('ARROW KEYS / WASD - MOVE', w / 2, h * 0.70);
            ctx.fillText('SPACE / Z - FIRE', w / 2, h * 0.74);
            ctx.fillText('P / ESC - PAUSE', w / 2, h * 0.78);
        }

        // High score
        if (game.highScore > 0) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText(`HIGH SCORE: ${game.highScore}`, w / 2, h * 0.88);
        }

        ctx.restore();
    }

    _drawGameHUD(ctx, w, h, game) {
        ctx.save();

        // Score - top left
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${game.score}`, 12, 28);

        // Stage indicator - top center
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888888';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(`STAGE ${game.currentStage + 1}`, w / 2, 28);

        // Lives - top right
        ctx.textAlign = 'right';
        ctx.fillStyle = '#00ddff';
        ctx.font = '14px "Courier New", monospace';
        const livesText = '❤'.repeat(Math.max(0, game.lives));
        ctx.fillText(livesText, w - 12, 26);

        // Weapon indicator - bottom left
        ctx.textAlign = 'left';
        const weaponName = WEAPON_NAMES[game.player?.weaponType ?? 0];
        const weaponLevel = game.player?.weaponLevel ?? 1;
        ctx.fillStyle = '#00ff88';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(`WPN: ${weaponName} LV${weaponLevel}`, 12, h - 14);

        // Boss health bar
        if (game.state === GAME_STATE.BOSS_FIGHT && game.boss) {
            const barWidth = w * 0.6;
            const barHeight = 10;
            const barX = (w - barWidth) / 2;
            const barY = 44;
            const hpRatio = Math.max(0, game.boss.hp / game.boss.maxHp);

            // Background
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health bar
            const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            gradient.addColorStop(0, '#ff0066');
            gradient.addColorStop(1, '#ff44aa');
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

            // Border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // Boss name
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff44aa';
            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.fillText(game.boss.name || 'BOSS', w / 2, barY - 4);
        }

        // Boss warning overlay
        if (game.state === GAME_STATE.BOSS_WARNING) {
            if (Math.floor(game.stateTimer * 4) % 2 === 0) {
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ff0044';
                ctx.font = 'bold 32px "Courier New", monospace';
                ctx.shadowColor = '#ff0044';
                ctx.shadowBlur = 20;
                ctx.fillText('WARNING', w / 2, h / 2 - 20);
                ctx.font = '18px "Courier New", monospace';
                ctx.fillText('BOSS APPROACHING', w / 2, h / 2 + 15);
                ctx.shadowBlur = 0;
            }
        }

        ctx.restore();
    }

    _drawStageIntro(ctx, w, h, game) {
        const alpha = Math.min(1, game.stateTimer * 2) * Math.min(1, (CONFIG.STAGE_TRANSITION_TIME - game.stateTimer) * 2);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0, 0, 20, 0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#00ddff';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 20;
        ctx.fillText(`STAGE ${game.currentStage + 1}`, w / 2, h / 2 - 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Courier New", monospace';
        ctx.shadowBlur = 0;
        ctx.fillText(STAGE_NAMES[game.currentStage] || '', w / 2, h / 2 + 10);

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    _drawStageClear(ctx, w, h, game) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.fillText('STAGE CLEAR!', w / 2, h / 2 - 20);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText(`BONUS: ${(game.currentStage + 1) * 1000}`, w / 2, h / 2 + 20);

        ctx.restore();
    }

    _drawGameOver(ctx, w, h, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#ff0044';
        ctx.font = 'bold 42px "Courier New", monospace';
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur = 20;
        ctx.fillText('GAME OVER', w / 2, h / 2 - 40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText(`FINAL SCORE: ${game.score}`, w / 2, h / 2 + 10);

        if (game.stateTimer > 2) {
            if (Math.floor(game.stateTimer * 2) % 2 === 0) {
                ctx.fillStyle = '#888888';
                ctx.font = '16px "Courier New", monospace';
                ctx.fillText('PRESS ENTER TO CONTINUE', w / 2, h / 2 + 60);
            }
        }

        ctx.restore();
    }

    _drawVictory(ctx, w, h, game) {
        ctx.save();
        const alpha = Math.min(1, game.stateTimer);
        ctx.fillStyle = `rgba(0, 0, 20, ${0.6 * alpha})`;
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#ffdd00';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.shadowColor = '#ffdd00';
        ctx.shadowBlur = 30;
        ctx.fillText('VICTORY!', w / 2, h / 2 - 50);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText('THE GALAXY IS SAVED!', w / 2, h / 2);
        ctx.fillText(`FINAL SCORE: ${game.score}`, w / 2, h / 2 + 30);

        if (game.stateTimer > 3) {
            if (Math.floor(game.stateTimer * 2) % 2 === 0) {
                ctx.fillStyle = '#888888';
                ctx.font = '16px "Courier New", monospace';
                ctx.fillText('PRESS ENTER TO CONTINUE', w / 2, h / 2 + 80);
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    _drawTouchControls(ctx, w, h, game) {
        ctx.save();

        // Virtual joystick - bottom left
        const jx = w * 0.18;
        const jy = h * 0.82;
        const outerR = w * 0.09;
        const innerR = w * 0.04;

        ctx.strokeStyle = 'rgba(0, 221, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(jx, jy, outerR, 0, Math.PI * 2);
        ctx.stroke();

        // Joystick knob position
        let kx = jx, ky = jy;
        if (game.input.touchActive) {
            kx = jx + game.input.touchDx * outerR * 0.8;
            ky = jy - game.input.touchDy * outerR * 0.8;
        }
        ctx.fillStyle = 'rgba(0, 221, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(kx, ky, innerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(kx, ky, innerR, 0, Math.PI * 2);
        ctx.stroke();

        // Fire button - bottom right
        const bx = w * 0.82;
        const by = h * 0.82;
        const br = w * 0.075;
        ctx.fillStyle = game.input.touchFire
            ? 'rgba(255, 68, 170, 0.6)'
            : 'rgba(255, 68, 170, 0.3)';
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 0, 170, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FIRE', bx, by);

        ctx.restore();
    }

    _drawPaused(ctx, w, h) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.fillText('PAUSED', w / 2, h / 2);
        ctx.restore();
    }
}

// Keyboard input manager
export class Input {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this._previousKeys = {};

        this._onKeyDown = (e) => {
            e.preventDefault();
            this.keys[e.code] = true;
        };
        this._onKeyUp = (e) => {
            e.preventDefault();
            this.keys[e.code] = false;
        };

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    update() {
        // Calculate just-pressed keys (pressed this frame, not last)
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this._previousKeys[key];
        }
        // Copy current state
        Object.assign(this._previousKeys, this.keys);
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    // Directional helpers
    get left() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); }
    get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); }
    get up() { return this.isDown('ArrowUp') || this.isDown('KeyW'); }
    get down() { return this.isDown('ArrowDown') || this.isDown('KeyS'); }
    get fire() { return this.isDown('Space') || this.isDown('KeyZ'); }
    get start() { return this.wasPressed('Enter') || this.wasPressed('Space'); }
    get pause() { return this.wasPressed('KeyP') || this.wasPressed('Escape'); }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}

// Keyboard + touch input manager with virtual joystick for iOS/mobile
export class Input {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this._previousKeys = {};

        // Touch state
        this.touchActive = false;
        this.touchFire = false;
        this.touchDx = 0;
        this.touchDy = 0;
        this._joystickTouchId = null;
        this._joystickStartX = 0;
        this._joystickStartY = 0;
        this._fireTouchId = null;
        this._startTouchTriggered = false;

        this._onKeyDown = (e) => {
            // Allow devtools shortcuts
            if (e.code === 'F12' || (e.ctrlKey && e.shiftKey)) return;
            e.preventDefault();
            this.keys[e.code] = true;
        };
        this._onKeyUp = (e) => {
            if (e.code === 'F12' || (e.ctrlKey && e.shiftKey)) return;
            e.preventDefault();
            this.keys[e.code] = false;
        };

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        // Detect touch device and set up touch handlers
        this.isTouchDevice = (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia('(pointer: coarse)').matches
        );

        if (this.isTouchDevice) {
            this._setupTouch();
        }
    }

    _setupTouch() {
        const opts = { passive: false };
        window.addEventListener('touchstart', (e) => this._onTouchStart(e), opts);
        window.addEventListener('touchmove', (e) => this._onTouchMove(e), opts);
        window.addEventListener('touchend', (e) => this._onTouchEnd(e), opts);
        window.addEventListener('touchcancel', (e) => this._onTouchEnd(e), opts);

        // Prevent iOS Safari rubber-band scroll and zoom
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.body.style.touchAction = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitTapHighlightColor = 'transparent';
    }

    _onTouchStart(e) {
        e.preventDefault();
        const halfW = window.innerWidth / 2;
        for (const touch of e.changedTouches) {
            // Left half = joystick, right half = fire
            if (touch.clientX < halfW) {
                if (this._joystickTouchId === null) {
                    this._joystickTouchId = touch.identifier;
                    this._joystickStartX = touch.clientX;
                    this._joystickStartY = touch.clientY;
                    this.touchActive = true;
                    this.touchDx = 0;
                    this.touchDy = 0;
                }
            } else {
                if (this._fireTouchId === null) {
                    this._fireTouchId = touch.identifier;
                    this.touchFire = true;
                    this._startTouchTriggered = true;
                }
            }
        }
    }

    _onTouchMove(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                const dx = touch.clientX - this._joystickStartX;
                const dy = touch.clientY - this._joystickStartY;
                const dead = 8;
                const maxRadius = 60;

                if (Math.abs(dx) < dead && Math.abs(dy) < dead) {
                    this.touchDx = 0;
                    this.touchDy = 0;
                } else {
                    const len = Math.min(maxRadius, Math.sqrt(dx * dx + dy * dy));
                    const angle = Math.atan2(dy, dx);
                    this.touchDx = Math.cos(angle) * (len / maxRadius);
                    this.touchDy = -Math.sin(angle) * (len / maxRadius); // invert Y for game coords
                }
            }
        }
    }

    _onTouchEnd(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            if (touch.identifier === this._joystickTouchId) {
                this._joystickTouchId = null;
                this.touchActive = false;
                this.touchDx = 0;
                this.touchDy = 0;
            }
            if (touch.identifier === this._fireTouchId) {
                this._fireTouchId = null;
                this.touchFire = false;
            }
        }
    }

    update() {
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this._previousKeys[key];
        }
        Object.assign(this._previousKeys, this.keys);
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    // Directional helpers — keyboard OR touch joystick
    get left() {
        if (this.touchActive && this.touchDx < -0.2) return true;
        return this.isDown('ArrowLeft') || this.isDown('KeyA');
    }
    get right() {
        if (this.touchActive && this.touchDx > 0.2) return true;
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
    get up() {
        if (this.touchActive && this.touchDy > 0.2) return true;
        return this.isDown('ArrowUp') || this.isDown('KeyW');
    }
    get down() {
        if (this.touchActive && this.touchDy < -0.2) return true;
        return this.isDown('ArrowDown') || this.isDown('KeyS');
    }
    // Analog magnitude for touch (0..1)
    get axisX() {
        if (this.touchActive) return this.touchDx;
        return (this.right ? 1 : 0) - (this.left ? 1 : 0);
    }
    get axisY() {
        if (this.touchActive) return this.touchDy;
        return (this.up ? 1 : 0) - (this.down ? 1 : 0);
    }
    get fire() {
        return this.touchFire || this.isDown('Space') || this.isDown('KeyZ');
    }
    get start() {
        // Any tap also starts the game on touch devices
        if (this._startTouchTriggered) {
            this._startTouchTriggered = false;
            return true;
        }
        return this.wasPressed('Enter') || this.wasPressed('Space');
    }
    get pause() {
        return this.wasPressed('KeyP') || this.wasPressed('Escape');
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}

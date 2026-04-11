// Keyboard + touch + gamepad input manager
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

        // Gamepad state
        this._gpAxisX = 0;
        this._gpAxisY = 0;
        this._gpButtons = {};
        this._gpPrevButtons = {};
        this._gpConnected = false;
        this._gpIndex = null;

        this._onKeyDown = (e) => {
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

        // Gamepad connection listeners
        this._onGamepadConnected = (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this._gpIndex = e.gamepad.index;
            this._gpConnected = true;
        };
        this._onGamepadDisconnected = (e) => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            if (this._gpIndex === e.gamepad.index) {
                this._gpConnected = false;
                this._gpIndex = null;
                this._gpAxisX = 0;
                this._gpAxisY = 0;
                this._gpButtons = {};
            }
        };
        window.addEventListener('gamepadconnected', this._onGamepadConnected);
        window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected);
    }

    _setupTouch() {
        const opts = { passive: false };
        window.addEventListener('touchstart', (e) => this._onTouchStart(e), opts);
        window.addEventListener('touchmove', (e) => this._onTouchMove(e), opts);
        window.addEventListener('touchend', (e) => this._onTouchEnd(e), opts);
        window.addEventListener('touchcancel', (e) => this._onTouchEnd(e), opts);

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
                    this.touchDy = -Math.sin(angle) * (len / maxRadius);
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

    // ---- Gamepad polling (called every frame) ----
    _pollGamepad() {
        // Gamepad API requires polling — no events for buttons/axes
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gp = null;

        if (this._gpIndex !== null && gamepads[this._gpIndex]) {
            gp = gamepads[this._gpIndex];
        } else {
            // Find any connected gamepad
            for (const pad of gamepads) {
                if (pad && pad.connected) {
                    gp = pad;
                    this._gpIndex = pad.index;
                    this._gpConnected = true;
                    break;
                }
            }
        }

        if (!gp) {
            this._gpConnected = false;
            this._gpAxisX = 0;
            this._gpAxisY = 0;
            return;
        }

        // Standard gamepad mapping (Xbox layout):
        // Axes: 0 = left stick X, 1 = left stick Y
        // Buttons: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT,
        //          8=Back/View, 9=Start/Menu, 10=L3, 11=R3,
        //          12=DPad Up, 13=DPad Down, 14=DPad Left, 15=DPad Right

        // Apply dead zone to stick axes
        const DEAD_ZONE = 0.15;
        const rawX = gp.axes[0] || 0;
        const rawY = gp.axes[1] || 0;
        this._gpAxisX = Math.abs(rawX) > DEAD_ZONE ? rawX : 0;
        this._gpAxisY = Math.abs(rawY) > DEAD_ZONE ? -rawY : 0; // invert Y (stick down = negative in game)

        // Save previous buttons for just-pressed detection
        Object.assign(this._gpPrevButtons, this._gpButtons);

        // Read buttons — pressed if value > 0.5 (handles analog triggers)
        for (let i = 0; i < gp.buttons.length; i++) {
            this._gpButtons[i] = gp.buttons[i].pressed || gp.buttons[i].value > 0.5;
        }
    }

    _gpButtonDown(idx) {
        return !!this._gpButtons[idx];
    }

    _gpButtonJustPressed(idx) {
        return !!this._gpButtons[idx] && !this._gpPrevButtons[idx];
    }

    update() {
        // Keyboard just-pressed
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this._previousKeys[key];
        }
        Object.assign(this._previousKeys, this.keys);

        // Poll gamepad
        this._pollGamepad();
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    // ---- Unified directional helpers (keyboard | touch | gamepad) ----
    get left() {
        if (this.touchActive && this.touchDx < -0.2) return true;
        if (this._gpAxisX < -0.2 || this._gpButtonDown(14)) return true; // DPad Left
        return this.isDown('ArrowLeft') || this.isDown('KeyA');
    }
    get right() {
        if (this.touchActive && this.touchDx > 0.2) return true;
        if (this._gpAxisX > 0.2 || this._gpButtonDown(15)) return true; // DPad Right
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
    get up() {
        if (this.touchActive && this.touchDy > 0.2) return true;
        if (this._gpAxisY > 0.2 || this._gpButtonDown(12)) return true; // DPad Up
        return this.isDown('ArrowUp') || this.isDown('KeyW');
    }
    get down() {
        if (this.touchActive && this.touchDy < -0.2) return true;
        if (this._gpAxisY < -0.2 || this._gpButtonDown(13)) return true; // DPad Down
        return this.isDown('ArrowDown') || this.isDown('KeyS');
    }

    // Analog magnitude — prioritizes touch > gamepad > keyboard
    get axisX() {
        if (this.touchActive) return this.touchDx;
        if (this._gpConnected && (Math.abs(this._gpAxisX) > 0.1 || this._gpButtonDown(14) || this._gpButtonDown(15))) {
            if (this._gpButtonDown(14)) return -1;
            if (this._gpButtonDown(15)) return 1;
            return this._gpAxisX;
        }
        return (this.right ? 1 : 0) - (this.left ? 1 : 0);
    }
    get axisY() {
        if (this.touchActive) return this.touchDy;
        if (this._gpConnected && (Math.abs(this._gpAxisY) > 0.1 || this._gpButtonDown(12) || this._gpButtonDown(13))) {
            if (this._gpButtonDown(12)) return 1;
            if (this._gpButtonDown(13)) return -1;
            return this._gpAxisY;
        }
        return (this.up ? 1 : 0) - (this.down ? 1 : 0);
    }

    get fire() {
        // A, X, RB, RT
        if (this._gpButtonDown(0) || this._gpButtonDown(2) ||
            this._gpButtonDown(5) || this._gpButtonDown(7)) return true;
        return this.touchFire || this.isDown('Space') || this.isDown('KeyZ');
    }

    get bomb() {
        // B, Y, LB on gamepad; X or C on keyboard
        if (this._gpButtonJustPressed(1) || this._gpButtonJustPressed(3) ||
            this._gpButtonJustPressed(4)) return true;
        return this.wasPressed('KeyX') || this.wasPressed('KeyC');
    }

    get focus() {
        // LT on gamepad; Shift on keyboard
        if (this._gpButtonDown(6)) return true;
        return this.isDown('ShiftLeft') || this.isDown('ShiftRight');
    }

    get start() {
        if (this._gpButtonJustPressed(0)) return true;
        if (this._startTouchTriggered) {
            this._startTouchTriggered = false;
            return true;
        }
        return this.wasPressed('Enter') || this.wasPressed('Space');
    }

    get pause() {
        if (this._gpButtonJustPressed(9) || this._gpButtonJustPressed(8)) return true;
        return this.wasPressed('KeyP') || this.wasPressed('Escape');
    }

    get isGamepadActive() {
        return this._gpConnected;
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('gamepadconnected', this._onGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected);
    }
}

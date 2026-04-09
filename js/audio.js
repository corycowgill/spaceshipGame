// Web Audio API synthesizer for game sounds and music
export class Audio {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.musicPlaying = false;
        this.musicNodes = [];
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.25;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Audio not available:', e);
        }
    }

    _playTone(freq, duration, type = 'square', gainValue = 0.3, dest = null) {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(dest || this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _playNoise(duration, gainValue = 0.3) {
        if (!this.initialized) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(this.ctx.currentTime);
    }

    playerShoot() {
        this._playTone(880, 0.06, 'square', 0.15);
        this._playTone(1200, 0.04, 'square', 0.1);
    }

    enemyShoot() {
        this._playTone(300, 0.1, 'sawtooth', 0.1);
    }

    explosion() {
        this._playNoise(0.3, 0.4);
        this._playTone(120, 0.3, 'sawtooth', 0.2);
    }

    bigExplosion() {
        this._playNoise(0.8, 0.5);
        this._playTone(60, 0.6, 'sawtooth', 0.3);
        this._playTone(80, 0.5, 'square', 0.2);
    }

    bossExplosion() {
        this._playNoise(1.5, 0.6);
        this._playTone(40, 1.2, 'sawtooth', 0.4);
        this._playTone(55, 1.0, 'square', 0.3);
        this._playTone(30, 1.5, 'triangle', 0.3);
    }

    powerUp() {
        if (!this.initialized) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.06);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(this.ctx.currentTime + i * 0.06);
            osc.stop(this.ctx.currentTime + i * 0.06 + 0.15);
        });
    }

    playerDeath() {
        this._playNoise(0.5, 0.5);
        this._playTone(200, 0.3, 'sawtooth', 0.3);
        this._playTone(150, 0.4, 'square', 0.2);
        this._playTone(80, 0.6, 'sawtooth', 0.3);
    }

    bossWarning() {
        if (!this.initialized) return;
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = i % 2 === 0 ? 220 : 180;
            const start = this.ctx.currentTime + i * 0.4;
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.35);
        }
    }

    stageComplete() {
        if (!this.initialized) return;
        const notes = [523, 659, 784, 1047, 1319, 1568];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const start = this.ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    menuSelect() {
        this._playTone(660, 0.08, 'square', 0.15);
    }

    // Background music - driving chiptune loop
    startMusic(stage = 0) {
        if (!this.initialized) return;
        this.stopMusic();
        this.musicPlaying = true;
        this._playMusicLoop(stage);
    }

    _playMusicLoop(stage) {
        if (!this.musicPlaying || !this.initialized) return;

        // Different bass patterns per stage
        const bassPatterns = [
            [65, 65, 82, 82, 73, 73, 98, 98],   // Stage 1 - E minor feel
            [73, 73, 98, 98, 82, 82, 110, 110],   // Stage 2
            [55, 55, 65, 65, 82, 82, 73, 73],     // Stage 3
            [82, 82, 98, 98, 110, 110, 82, 82],   // Stage 4
            [55, 55, 73, 73, 65, 65, 82, 82],     // Stage 5
        ];

        const melodyPatterns = [
            [330, 0, 392, 330, 294, 0, 330, 262],
            [392, 0, 440, 392, 330, 0, 392, 294],
            [262, 0, 330, 294, 392, 0, 330, 262],
            [440, 0, 392, 440, 523, 0, 440, 392],
            [330, 0, 294, 330, 262, 0, 294, 220],
        ];

        const pattern = bassPatterns[stage % 5];
        const melody = melodyPatterns[stage % 5];
        const stepTime = 0.18;
        const loopDuration = pattern.length * stepTime;

        // Bass line
        pattern.forEach((freq, i) => {
            if (freq === 0) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            const start = this.ctx.currentTime + i * stepTime;
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + stepTime * 0.9);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(start);
            osc.stop(start + stepTime);
            this.musicNodes.push(osc);
        });

        // Melody line
        melody.forEach((freq, i) => {
            if (freq === 0) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            const start = this.ctx.currentTime + i * stepTime;
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + stepTime * 0.8);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(start);
            osc.stop(start + stepTime);
            this.musicNodes.push(osc);
        });

        // Kick drum on beats 0, 2, 4, 6
        for (let i = 0; i < 8; i += 2) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime + i * stepTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + i * stepTime + 0.1);
            const start = this.ctx.currentTime + i * stepTime;
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(start);
            osc.stop(start + 0.12);
            this.musicNodes.push(osc);
        }

        // Hi-hat on off-beats
        for (let i = 1; i < 8; i += 2) {
            const bufferSize = this.ctx.sampleRate * 0.05;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            const start = this.ctx.currentTime + i * stepTime;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            source.start(start);
            this.musicNodes.push(source);
        }

        // Schedule next loop
        this._musicTimer = setTimeout(() => {
            this.musicNodes = [];
            this._playMusicLoop(stage);
        }, loopDuration * 1000 - 20);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this._musicTimer) {
            clearTimeout(this._musicTimer);
            this._musicTimer = null;
        }
        this.musicNodes.forEach(node => {
            try { node.stop(); } catch (e) { /* already stopped */ }
        });
        this.musicNodes = [];
    }
}

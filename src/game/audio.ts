// Procedural audio — no assets, Web Audio API only.
// All sounds and ambient music are synthesized at runtime.

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _sfxBus: GainNode | null = null;
let _musicBus: GainNode | null = null;
let _muteSfx = false;
let _muteMusic = false;
let _ambientStarted = false;

function ac(): AudioContext {
    if (!_ctx) {
        try {
            _ctx = new AudioContext();
        } catch {
            // AudioContext not supported — all sounds silently no-op
            _ctx = null as unknown as AudioContext;
            return _ctx;
        }
        _master = _ctx.createGain();
        _master.gain.value = 0.65;
        _master.connect(_ctx.destination);

        _sfxBus = _ctx.createGain();
        _sfxBus.gain.value = _muteSfx ? 0 : 1;
        _sfxBus.connect(_master);

        _musicBus = _ctx.createGain();
        _musicBus.gain.value = _muteMusic ? 0 : 0.22;
        _musicBus.connect(_master);
    }
    if (_ctx && _ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return _ctx;
}

export function applyMuteState(muteSfx: boolean, muteMusic: boolean): void {
    _muteSfx = muteSfx;
    _muteMusic = muteMusic;
    if (_sfxBus) _sfxBus.gain.value = muteSfx ? 0 : 1;
    if (_musicBus) _musicBus.gain.value = muteMusic ? 0 : 0.22;
}

// Schedule one oscillator note with an ADSR-like envelope.
// t = AudioContext start time (seconds). Durations in ms.
function osc(
    c: AudioContext,
    freq: number,
    type: OscillatorType,
    vol: number,
    t: number,
    attackMs: number,
    sustainMs: number,
    releaseMs: number,
    out: AudioNode,
    freqEnd?: number,
): void {
    const node = c.createOscillator();
    const gain = c.createGain();
    node.type = type;
    node.frequency.setValueAtTime(freq, t);
    if (freqEnd !== undefined) {
        node.frequency.exponentialRampToValueAtTime(Math.max(0.01, freqEnd), t + (attackMs + sustainMs + releaseMs) / 1000);
    }
    const a = attackMs / 1000, s = sustainMs / 1000, r = releaseMs / 1000;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + a);
    gain.gain.setValueAtTime(vol, t + a + s);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + s + r);
    node.connect(gain);
    gain.connect(out);
    node.start(t);
    node.stop(t + a + s + r + 0.02);
}

// Short band-pass noise burst.
function nburst(c: AudioContext, vol: number, freq: number, q: number, durMs: number, t: number, out: AudioNode): void {
    const dur = durMs / 1000;
    const samples = Math.max(1, Math.ceil(c.sampleRate * dur));
    const buf = c.createBuffer(1, samples, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq;
    filt.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt); filt.connect(g); g.connect(out);
    src.start(t); src.stop(t + dur + 0.02);
}

// ---------- SFX ----------

export function playClick(): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const bus = _sfxBus!;
    osc(c, 200, 'square', 0.07, t, 2, 8, 30, bus);
    nburst(c, 0.04, 1500, 6, 40, t, bus);
}

export function playScavenge(): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const bus = _sfxBus!;
    nburst(c, 0.18, 150, 3, 120, t, bus);
    osc(c, 75, 'sine', 0.12, t, 8, 40, 80, bus);
}

export function playItemFound(rarity: string): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const bus = _sfxBus!;
    switch (rarity) {
        case 'common':
            osc(c, 880, 'sine', 0.16, t, 8, 40, 100, bus);
            break;
        case 'uncommon':
            osc(c, 660, 'sine', 0.13, t, 8, 30, 80, bus);
            osc(c, 880, 'sine', 0.16, t + 0.13, 8, 40, 120, bus);
            break;
        case 'rare':
            osc(c, 660, 'sine', 0.12, t, 6, 25, 80, bus);
            osc(c, 880, 'sine', 0.14, t + 0.12, 6, 30, 80, bus);
            osc(c, 1320, 'sine', 0.17, t + 0.24, 6, 40, 150, bus);
            break;
        case 'epic':
        case 'legendary':
            osc(c, 440, 'sine', 0.11, t, 6, 20, 80, bus);
            osc(c, 660, 'sine', 0.13, t + 0.10, 6, 25, 80, bus);
            osc(c, 880, 'sine', 0.15, t + 0.20, 6, 30, 100, bus);
            osc(c, 1320, 'sine', 0.18, t + 0.30, 6, 40, 180, bus);
            nburst(c, 0.10, 2200, 8, 250, t + 0.28, bus);
            break;
        case 'unique':
            // Four-note ascending chime + sparkle
            [440, 660, 880, 1320].forEach((f, i) => {
                osc(c, f, 'sine', 0.18, t + i * 0.14, 10, 50, 220, bus);
                osc(c, f * 2, 'sine', 0.07, t + i * 0.14, 10, 30, 200, bus);
            });
            nburst(c, 0.14, 3000, 10, 500, t + 0.42, bus);
            break;
        default:
            osc(c, 880, 'sine', 0.12, t, 8, 30, 80, bus);
    }
}

export function playBattleWin(): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const bus = _sfxBus!;
    nburst(c, 0.22, 300, 4, 150, t, bus);
    osc(c, 200, 'sawtooth', 0.10, t, 5, 20, 60, bus);
    osc(c, 400, 'sawtooth', 0.12, t + 0.08, 5, 30, 80, bus);
    osc(c, 600, 'sine', 0.15, t + 0.18, 8, 40, 140, bus);
}

export function playBattleLoss(): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const bus = _sfxBus!;
    osc(c, 320, 'sawtooth', 0.10, t, 10, 80, 180, bus, 180);
    osc(c, 200, 'sawtooth', 0.12, t + 0.22, 10, 100, 250, bus, 100);
    osc(c, 110, 'sine', 0.10, t + 0.46, 10, 120, 300, bus);
}

export function playBuy(): void {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    osc(c, 1200, 'sine', 0.10, t, 3, 8, 45, _sfxBus!);
    osc(c, 800, 'sine', 0.07, t + 0.02, 3, 8, 55, _sfxBus!);
}

// ---------- Ambient music ----------

export function startAmbient(): void {
    if (_ambientStarted) return;
    _ambientStarted = true;
    const c = ac(); if (!c) return;
    const bus = _musicBus!;

    // Sub bass drone: 55 Hz A1, triangle wave
    const d1 = c.createOscillator();
    const g1 = c.createGain();
    d1.type = 'triangle';
    d1.frequency.value = 55;
    g1.gain.value = 0.55;
    d1.connect(g1); g1.connect(bus); d1.start();

    // Perfect fifth: 82.5 Hz E2, sine
    const d2 = c.createOscillator();
    const g2 = c.createGain();
    d2.type = 'sine';
    d2.frequency.value = 82.5;
    g2.gain.value = 0.28;
    d2.connect(g2); g2.connect(bus); d2.start();

    // Slow LFO (0.05 Hz) modulates d1 gain — subtle breathing effect
    const lfo = c.createOscillator();
    const lfoAmp = c.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;
    lfoAmp.gain.value = 0.22;
    lfo.connect(lfoAmp);
    lfoAmp.connect(g1.gain);
    lfo.start();

    // Filtered noise floor for texture (lowpass at 180 Hz)
    const nbuf = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
    const nd = nbuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const nsrc = c.createBufferSource();
    nsrc.buffer = nbuf; nsrc.loop = true;
    const nfilt = c.createBiquadFilter();
    nfilt.type = 'lowpass'; nfilt.frequency.value = 180;
    const ngain = c.createGain(); ngain.gain.value = 0.07;
    nsrc.connect(nfilt); nfilt.connect(ngain); ngain.connect(bus); nsrc.start();

    // Occasional distant metallic pings
    const pingFreqs = [1320, 1760, 2200, 2640];
    function schedulePing() {
        setTimeout(() => {
            if (!_ambientStarted) return;
            const f = pingFreqs[Math.floor(Math.random() * pingFreqs.length)];
            osc(c, f, 'sine', 0.045, c.currentTime, 15, 30, 900, bus);
            schedulePing();
        }, 8000 + Math.random() * 10000);
    }
    schedulePing();
}

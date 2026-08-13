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

// ---------- Ambient music: 8-bit chiptune ----------
// Fallout-style: A minor, ~86 BPM, square wave melody + triangle bass

export function startAmbient(): void {
    if (_ambientStarted) return;
    _ambientStarted = true;
    const c = ac(); if (!c) return;
    const bus = _musicBus!;

    const BPM = 86;
    const B = 60 / BPM; // seconds per beat

    // [freq_hz, duration_beats] — freq 0 = rest
    // A minor pentatonic: A3=220, C4=262, D4=294, E4=330, G4=392, A4=440
    const MELODY: [number, number][] = [
        // Phrase A (8 beats)
        [330, 1], [294, 0.5], [262, 1.5], [220, 1], [247, 0.5], [262, 0.5], [0, 3],
        // Phrase B (8 beats)
        [330, 0.5], [392, 0.5], [330, 1], [294, 1], [262, 0.5], [247, 0.5], [220, 2], [0, 2],
        // Phrase C (8 beats)
        [196, 0.5], [220, 0.5], [262, 1], [294, 0.5], [330, 0.5], [294, 0.5], [262, 0.5], [220, 0.5], [196, 0.5], [0, 3],
        // Phrase D — descending resolution (8 beats)
        [220, 1], [247, 0.5], [220, 0.5], [196, 1], [175, 1], [220, 2], [0, 2],
    ];

    // Bass line: [freq_hz, duration_beats] — triangle, lower octave roots
    const BASS: [number, number][] = [
        [110, 2], [110, 2], [131, 2], [131, 2],   // phrase A: A2, C3
        [110, 2], [110, 2], [98, 2], [110, 2],    // phrase B: A2, G2
        [98, 2], [110, 2], [131, 2], [147, 2],    // phrase C: G2, A2, C3, D3
        [110, 2], [98, 2], [110, 4],               // phrase D: A2, G2, A2
    ];

    const totalBeats = MELODY.reduce((s, [, d]) => s + d, 0);
    const loopS = totalBeats * B;

    function scheduleLoop(startT: number) {
        // Melody — square wave, staccato
        let t = startT;
        for (const [freq, dur] of MELODY) {
            const durS = dur * B;
            if (freq > 0) {
                const atkMs = 4;
                const relMs = 35;
                const susMs = Math.max(10, durS * 1000 * 0.78 - atkMs - relMs);
                osc(c, freq, 'square', 0.28, t, atkMs, susMs, relMs, bus);
            }
            t += durS;
        }
        // Bass — triangle wave, held longer
        let bt = startT;
        for (const [freq, dur] of BASS) {
            const durS = dur * B;
            if (freq > 0) {
                osc(c, freq, 'triangle', 0.38, bt, 8, durS * 1000 * 0.88, 50, bus);
            }
            bt += durS;
        }
        // Schedule repeat
        const delayMs = Math.max(50, (startT + loopS - c.currentTime - 0.12) * 1000);
        setTimeout(() => {
            if (_ambientStarted) scheduleLoop(startT + loopS);
        }, delayMs);
    }

    scheduleLoop(c.currentTime + 0.1);
}

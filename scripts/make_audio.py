"""Generates the reel soundtrack (music + SFX) procedurally -> public/soundtrack.wav.

No samples, no licences. Timings mirror the scene constants in src/scenes.tsx.
Run: python3 scripts/make_audio.py
"""
import math
import struct
import wave
from pathlib import Path

import numpy as np

SR = 44100
FPS = 30
TOTAL_F = 1185
N = int(TOTAL_F / FPS * SR) + SR // 2
rng = np.random.default_rng(7)

# scene starts (frames) – keep in sync with src/Reel.tsx / scenes.tsx
HOOK, OVER, REPS, PROB, SOL, CTA = 0, 225, 405, 645, 750, 1005
HOOK_CUT = 120
OVERLOAD_PINGS = [10, 22, 34, 46, 58, 70, 82]
OVERLOAD_FAIL = 112
REPS_SPLIT = 120
STEP_FRAMES = [REPS_SPLIT + 30, REPS_SPLIT + 48, REPS_SPLIT + 66, REPS_SPLIT + 84, REPS_SPLIT + 102]
PROBLEM_Q = 22
SOL_B, SOL_C = 90, 172
SOL_CHECKS = [SOL_C + 22, SOL_C + 36, SOL_C + 50]
CTA_STOP, CTA_BTN = 40, 66

BPM = 120
BEAT = 60 / BPM


def t2i(sec):
    return int(round(sec * SR))


def fr(frame):
    return frame / FPS


music = np.zeros(N)
sfx = np.zeros(N)


def add(buf, start_sec, sig, gain=1.0):
    i = t2i(start_sec)
    if i >= N:
        return
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def env(n, a=0.005, d=None, curve=6.0):
    t = np.arange(n) / SR
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    if d is not None:
        e *= np.exp(-curve * t / d)
    return e


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def highpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def saw(freq, n, harmonics=12, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, harmonics + 1):
        if freq * k > 12000:
            break
        out += np.sin(2 * np.pi * freq * (1 + detune) * k * t) / k
    return out * 0.6


# ---------------- instruments ----------------
def kick(strength=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s += 0.25 * rng.standard_normal(n) * np.exp(-t * 180)
    return np.tanh(s * 1.6 * strength)


def clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = highpass(rng.standard_normal(n), 900)
    e = np.exp(-t * 22)
    for d in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(t - d, 0) * 120) * (t >= d)
    return noise * e * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7000) * np.exp(-t * (18 if open_ else 90)) * 0.25


def bass_note(freq, dur):
    n = int(dur * SR)
    s = saw(freq, n, 8) + 0.5 * np.sin(2 * np.pi * freq / 2 * np.arange(n) / SR)
    s = lowpass(s, 420)
    e = env(n, 0.004)
    e *= np.minimum(1, (n - np.arange(n)) / (0.03 * SR))
    return np.tanh(s * e * 1.4) * 0.5


def pad_chord(freqs, dur):
    n = int(dur * SR)
    s = np.zeros(n)
    for fq in freqs:
        for dt in (-0.004, 0.004):
            s += saw(fq, n, 10, dt)
    s = lowpass(s, 1400)
    a = int(0.25 * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    r = int(0.3 * SR)
    e[-r:] *= np.linspace(1, 0, r)
    return s * e * 0.08


def pluck(freq, dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = saw(freq, n, 14) * np.exp(-t * 9)
    return lowpass(s, 3200) * 0.22


# ---------------- music ----------------
# A minor: Am – F – C – G (one chord per bar = 2 s)
CHORDS = [
    (110.0, [220.0, 261.63, 329.63]),
    (87.31, [174.61, 220.0, 261.63]),
    (130.81, [261.63, 329.63, 392.0]),
    (98.0, [196.0, 246.94, 293.66]),
]
LEAD = [440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.0, 440.0]

total_sec = N / SR
nbeats = int(total_sec / BEAT)

SEC = {k: fr(v) for k, v in dict(HOOK=HOOK, OVER=OVER, REPS=REPS, PROB=PROB, SOL=SOL, CTA=CTA, END=TOTAL_F).items()}
CUT = fr(HOOK_CUT)


def section(t):
    if t < CUT:
        return 'hook'
    if t < SEC['OVER']:
        return 'reveal'
    if t < SEC['REPS']:
        return 'over'
    if t < SEC['PROB']:
        return 'reps'
    if t < SEC['SOL']:
        return 'prob'
    if t < SEC['CTA']:
        return 'sol'
    if t < SEC['END'] - 2.6:
        return 'cta'
    return 'outro'


for b in range(nbeats):
    t = b * BEAT
    sec = section(t)
    bar = b // 4
    root, chord = CHORDS[bar % 4]
    beat_in_bar = b % 4
    full = sec in ('hook', 'reps', 'sol', 'cta')

    # kick
    if sec in ('hook', 'reps', 'sol', 'cta', 'over'):
        add(music, t, kick(1.0 if sec != 'over' else 0.8), 0.9)
    # clap on 2 & 4
    if full and beat_in_bar in (1, 3):
        add(music, t, clap(), 0.8)
    # hats
    if sec in ('hook', 'reps', 'sol', 'cta', 'over', 'reveal'):
        sub = 4 if sec == 'over' else 2
        for k in range(sub):
            add(music, t + k * BEAT / sub, hat(open_=(k == sub // 2 and sec != 'over')), 0.6 if sec != 'reveal' else 0.35)
    # bass (8ths)
    if sec in ('hook', 'reps', 'sol', 'cta'):
        for k in range(2):
            fq = root * (2 if (k == 1 and beat_in_bar == 3) else 1)
            add(music, t + k * BEAT / 2, bass_note(fq, BEAT / 2 * 0.9), 0.75)
    if sec == 'over' and beat_in_bar in (0, 2):
        add(music, t, bass_note(root, BEAT * 0.9), 0.5)
    # pad once per bar
    if beat_in_bar == 0 and sec in ('reveal', 'over', 'prob', 'sol', 'cta', 'reps', 'hook'):
        g = {'prob': 1.3, 'reveal': 1.0, 'over': 0.7}.get(sec, 0.6)
        add(music, t, pad_chord(chord, BEAT * 4), g)
    # lead plucks in solution & cta
    if sec in ('sol', 'cta'):
        for k in range(2):
            idx = (b * 2 + k) % len(LEAD)
            add(music, t + k * BEAT / 2, pluck(LEAD[idx]), 0.7)

# outro: final chord + kick hit
add(music, SEC['END'] - 2.6, kick(1.2), 1.0)
add(music, SEC['END'] - 2.6, pad_chord([220.0, 261.63, 329.63, 440.0], 2.6), 1.6)

# reveal: hard stop of music right at the scratch for a beat
i0, i1 = t2i(CUT), t2i(CUT + 0.35)
music[i0:i1] *= np.linspace(0.0, 0.2, i1 - i0)

# ---------------- SFX ----------------

def whoosh(dur=0.6, up=True, gain=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    lo = lowpass(noise, 1800)
    hi = highpass(noise, 1800)
    mix = np.linspace(0, 1, n) if up else np.linspace(1, 0, n)
    s = lo * (1 - mix) + hi * mix * 0.7
    e = np.sin(np.pi * np.minimum(t / dur, 1)) ** 2
    return s * e * 0.35 * gain


def scratch():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 900 * (1 - t / t[-1]) ** 2 + 120
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.3 + 0.4 * highpass(rng.standard_normal(n), 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t))
    return lowpass(s, 4500) * np.exp(-t * 3) * 0.45


def ping(freq=1320, dur=0.28):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t)
    return s * np.exp(-t * 16) * 0.22


def fail_tone():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, fq in enumerate((392.0, 369.99, 349.23, 311.13)):
        st = int(k * 0.16 * SR)
        m = n - st
        tt = np.arange(m) / SR
        out[st:] += saw(fq, m, 6) * np.exp(-tt * (4 if k == 3 else 10)) * (1.4 if k == 3 else 1)
    return lowpass(out, 1500) * 0.22


def tick(freq=2400):
    n = int(0.04 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 120) * 0.25


def thud():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 80 + 120 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16) * 0.6


def impact():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 14)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8)
    s += lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 9) * 0.35
    return np.tanh(s * 1.4) * 0.7


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 200 * (8 ** (t / dur))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * 0.4 + np.sin(ph * 1.5) * 0.2
    noise = highpass(rng.standard_normal(n), 2000) * (t / dur) ** 2 * 0.5
    return (tone * (t / dur) ** 1.5 + noise) * 0.35


def engine(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 55 + 70 * np.sin(np.pi * np.minimum(t / dur, 1)) ** 0.7
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.5 + np.sin(ph * 2) * 0.3
    s = lowpass(s, 700)
    e = np.sin(np.pi * np.minimum(t / dur, 1)) ** 0.6
    return s * e * 0.45


def pop():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 500 + 900 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.4


# hook
add(sfx, 0, impact(), 0.9)
add(sfx, 0.05, engine(3.9), 0.9)
for k in range(8):
    add(sfx, 0.3 + k * 0.45, whoosh(0.4, True, 0.6), 1)
add(sfx, CUT, scratch(), 1.0)
add(sfx, fr(HOOK_CUT + 8), whoosh(1.4, False, 1.0), 1)
add(sfx, fr(158), pop(), 1)

# overload
for p in OVERLOAD_PINGS:
    add(sfx, fr(OVER + p), ping(1320 + (p % 3) * 160), 1)
add(sfx, fr(OVER + OVERLOAD_FAIL), fail_tone(), 1)

# reps: tick at the bottom of each squat (phase crosses pi + 2πk)
def rep_phase(f):
    t = max(0.0, f - 8)
    return t * 0.28 + t * t * 0.0042


last_k = -1
for f in range(0, REPS_SPLIT - 6):
    k = int((rep_phase(f) - math.pi) // (2 * math.pi))
    if k > last_k and rep_phase(f) >= math.pi:
        add(sfx, fr(REPS + f), tick(1800 + min(k, 20) * 40), 1)
        last_k = k
add(sfx, fr(REPS + 50), riser(fr(REPS_SPLIT - 50)), 0.9)
add(sfx, fr(REPS + REPS_SPLIT), impact(), 0.9)
for i, sf in enumerate(STEP_FRAMES):
    add(sfx, fr(REPS + sf), thud(), 0.9)
    add(sfx, fr(REPS + sf), ping(660 * 2 ** (i * 2 / 12)), 0.8)

# problem
add(sfx, fr(PROB + PROBLEM_Q), pop(), 1.1)
add(sfx, fr(SOL - 52), riser(fr(52)), 0.9)

# solution
add(sfx, fr(SOL), impact(), 1.0)
add(sfx, fr(SOL + SOL_B), whoosh(0.5, True), 1)
for k in range(12):
    add(sfx, fr(SOL + SOL_B + 6 + k * 3), tick(2600), 0.7)
add(sfx, fr(SOL + SOL_C), whoosh(0.5, True), 1)
for c in SOL_CHECKS:
    add(sfx, fr(SOL + c), ping(1760), 1)

# cta
add(sfx, fr(CTA), engine(fr(CTA_STOP) + 0.2), 1.0)
add(sfx, fr(CTA + CTA_STOP), thud(), 1)
add(sfx, fr(CTA + CTA_BTN), pop(), 1.1)
add(sfx, fr(CTA + CTA_BTN), ping(1980), 0.8)

# ---------------- mix ----------------
mix = music * 0.55 + sfx * 0.9
# gentle fade out
fade = t2i(1.0)
end = t2i(TOTAL_F / FPS)
mix[end - fade:end] *= np.linspace(1, 0, fade)
mix[end:] = 0
mix = np.tanh(mix * 1.2)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

stereo = np.stack([mix, mix], axis=1)
out = Path(__file__).resolve().parent.parent / 'public' / 'soundtrack.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('wrote', out, f'{len(mix) / SR:.2f}s')

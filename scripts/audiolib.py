"""Shared synth instruments and SFX for the reel soundtracks."""
import wave

import numpy as np

SR = 44100
FPS = 30
rng = np.random.default_rng(7)


def t2i(sec):
    return int(round(sec * SR))


def fr(frame):
    return frame / FPS


def add(buf, start_sec, sig, gain=1.0):
    N = len(buf)
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



def write_wav(path, mono, peak=0.89):
    m = np.tanh(mono * 1.2)
    m = m / (np.max(np.abs(m)) + 1e-9) * peak
    st = np.stack([m, m], axis=1)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

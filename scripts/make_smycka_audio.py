"""SFX-only track for SmyckaReel -> public/smycka-sfx.wav. Frames mirror src/smycka/reel.tsx."""
from pathlib import Path

import numpy as np

from audiolib import (
    SR, add, bulb_buzz, chime, fr, highpass, impact, kaching, lowpass, ping, pop, riser, rng, sub_boom, t2i,
    tape_stop, thud, tick, whoosh, write_wav,
)

HOOK, LOOP, TIME, VAC, MONEY, PENS, REW, IDEA, GAINS, CTA, END = 0, 75, 318, 453, 528, 648, 723, 773, 863, 1028, 1193
STEPS = [0, 18, 34, 50, 64, 78, 88, 97, 106, 114, 122, 128, 134, 139, 144, 149, 153, 157, 161, 165, 169, 172, 175, 178, 181, 184, 187, 190, 193, 196]
OPAKUJ = 203

n = int(END / 30 * SR) + SR // 2
sfx = np.zeros(n)


def alarm(dur):
    m = int(dur * SR)
    t = np.arange(m) / SR
    gate = ((t * 8) % 1 < 0.5).astype(float) * (((t * 1.5) % 1) < 0.75)
    s = np.sign(np.sin(2 * np.pi * 2300 * t)) * 0.5 + np.sin(2 * np.pi * 4600 * t) * 0.2
    return lowpass(s * gate, 6000) * 0.22


def tram_bell():
    m = int(0.6 * SR)
    t = np.arange(m) / SR
    s = np.zeros(m)
    for st in (0.0, 0.14):
        i = int(st * SR)
        tt = t[: m - i]
        for r, a in ((1, 1), (2.4, 0.5), (3.9, 0.3)):
            s[i:] += np.sin(2 * np.pi * 1250 * r * tt) * np.exp(-tt * 9) * a
    return s * 0.12


def keyboard(dur):
    m = int(dur * SR)
    s = np.zeros(m)
    for k in range(int(dur * 14)):
        i = int((k / 14 + rng.uniform(0, 0.03)) * SR)
        if i >= m - 400:
            break
        c = highpass(rng.standard_normal(400), 2500) * np.exp(-np.arange(400) / 40)
        s[i:i + 400] += c * rng.uniform(0.4, 0.8)
    return s * 0.35


def rewind(dur):
    m = int(dur * SR)
    t = np.arange(m) / SR
    f = 600 + 500 * np.sin(2 * np.pi * 7 * t) + 1500 * (t / dur)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + highpass(rng.standard_normal(m), 3000) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t))
    return lowpass(s, 7000) * 0.6


def plane(dur):
    m = int(dur * SR)
    t = np.arange(m) / SR
    s = lowpass(rng.standard_normal(m), 900) * np.sin(np.pi * t / dur) ** 1.5
    return s * 0.8


# hook
add(sfx, 0, alarm(1.9), 1.0)
add(sfx, 0, impact(), 0.9)
add(sfx, fr(22), impact(), 1.0)
add(sfx, fr(22), sub_boom(), 0.7)

# loop
for i, s in enumerate(STEPS):
    t = fr(LOOP + s)
    kind = i % 5
    g = 1.0 if i < 10 else 0.7
    if kind == 0:
        add(sfx, t, alarm(min(0.25, fr(6))), g)
    elif kind == 1:
        add(sfx, t, tram_bell(), g)
    elif kind == 2:
        add(sfx, t, keyboard(0.3 if i < 10 else 0.12), g)
    elif kind == 3:
        add(sfx, t, thud(), g * 0.8)
    else:
        add(sfx, t, whoosh(0.2, False, 0.5), g)
    add(sfx, t, tick(1800 + i * 40), 0.4)
add(sfx, fr(LOOP + 150) - 1.5, riser(1.5), 0.5)
add(sfx, fr(LOOP + OPAKUJ), impact(), 1.1)
add(sfx, fr(LOOP + OPAKUJ), sub_boom(), 0.8)
add(sfx, fr(LOOP + OPAKUJ + 8), pop(), 0.9)

# time
add(sfx, fr(TIME), whoosh(0.4, True), 1)
for k in range(15):
    add(sfx, fr(TIME + 30 + k * 3), tick(2200 + k * 50), 0.6)
add(sfx, fr(TIME + 84), impact(), 1.1)
add(sfx, fr(TIME + 84), sub_boom(), 0.8)

# vacation
add(sfx, fr(VAC), plane(1.4), 1.0)
add(sfx, fr(VAC + 40), impact(), 1.0)
add(sfx, fr(VAC + 40), thud(), 1.0)

# money
add(sfx, fr(MONEY + 4), kaching(), 1.0)
for i in range(6):
    add(sfx, fr(MONEY + 26 + i * 9), ping(1400 * 0.88 ** i, 0.2), 0.9)
    add(sfx, fr(MONEY + 26 + i * 9), whoosh(0.18, False, 0.4), 1)
add(sfx, fr(MONEY + 80), tape_stop(0.6, 300), 0.9)
add(sfx, fr(MONEY + 90), thud(), 0.8)

# pension
add(sfx, fr(PENS), whoosh(0.4, True), 1)
add(sfx, fr(PENS + 16), impact(), 1.1)
add(sfx, fr(PENS + 16), thud(), 1.0)
add(sfx, fr(PENS + 16), sub_boom(), 0.8)

# rewind
add(sfx, fr(REW), rewind(fr(48)), 1.0)

# idea
add(sfx, fr(IDEA), pop(), 0.8)
add(sfx, fr(IDEA + 26), bulb_buzz(fr(14)), 1.2)
add(sfx, fr(IDEA + 40), impact(), 1.1)
add(sfx, fr(IDEA + 40), sub_boom(), 0.8)
add(sfx, fr(IDEA + 40), chime([1046.5, 1318.5, 1568.0, 2093.0]), 1.0)

# gains
add(sfx, fr(GAINS), impact(), 0.7)
for i in range(6):
    t = fr(GAINS + 18 + i * 18)
    add(sfx, t, whoosh(0.22, True, 0.6), 1)
    add(sfx, t + 0.04, ping(1320 * 2 ** (i * 2 / 12), 0.22), 0.9)
add(sfx, fr(GAINS + 18 + 5 * 18 + 8), kaching(), 0.8)

# cta
add(sfx, fr(CTA) - 0.8, riser(0.8), 0.7)
add(sfx, fr(CTA + 18), impact(), 1.1)
add(sfx, fr(CTA + 18), sub_boom(), 0.8)
add(sfx, fr(CTA + 28), pop(), 0.8)
for t in (40, 45, 50, 55, 60):
    add(sfx, fr(CTA + t), tick(3000), 0.9)
add(sfx, fr(CTA + 70), kaching(), 1.0)
add(sfx, fr(CTA + 70), chime([1318.5, 1568.0, 2093.0], 1.2), 0.8)

sfx[t2i(fr(END)):] = 0
write_wav(Path(__file__).resolve().parent.parent / 'public' / 'smycka-sfx.wav', sfx)
print('wrote smycka-sfx.wav')

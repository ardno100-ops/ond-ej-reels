"""Soundtrack for the KarieraPecka reel -> public/pecka-soundtrack.wav.

Frame constants mirror src/pecka/*.tsx. Run: python3 scripts/make_pecka_audio.py
"""
from pathlib import Path

import numpy as np

from audiolib import (
    SR, add, bass_note, clap, fr, hat, highpass, impact, kick, lowpass, pad_chord, ping, pluck, pop, riser, rng, saw,
    t2i, thud, tick, whoosh, write_wav,
)

TOTAL_F = 1350
N = int(TOTAL_F / 30 * SR) + SR // 2

HOOK, CHART, CROWD, IDEA, LADDER, MARKET, CTA = 0, 165, 465, 630, 795, 945, 1170
COIN_FIRST, COIN_EVERY, COIN_COUNT, COIN_FLIGHT, PAY_DROP = 12, 4, 14, 18, 92
SHATTER = 122
CROWD_NO = 86
IDEA_ON, IDEA_PILLS = 26, [62, 76, 90]
L_FIRST, L_EVERY, L_FIVE = 12, 9, 100
M_COUNT1, M_COUNT2 = 60, 120
PCTA_SMILE, PCTA_BTN = 26, 50

BEAT = 0.5
music = np.zeros(N)
sfx = np.zeros(N)


# ---------------- extra sound design ----------------
def sub_boom(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 32 + 60 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    return np.tanh(s * 2.2) * 0.75


def shatter():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    out = highpass(rng.standard_normal(n), 3500) * np.exp(-t * 7) * 0.45
    for _ in range(70):
        st = int(rng.uniform(0, 0.6) * SR)
        fq = rng.uniform(2500, 9500)
        m = int(rng.uniform(0.05, 0.35) * SR)
        m = min(m, n - st)
        tt = np.arange(m) / SR
        out[st:st + m] += np.sin(2 * np.pi * fq * tt) * np.exp(-tt * rng.uniform(15, 45)) * rng.uniform(0.04, 0.12)
    return out * 0.9


def kaching():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for st, base in ((0.0, 2093.0), (0.09, 2637.0)):
        i = int(st * SR)
        tt = t[: n - i]
        for ratio, amp in ((1, 1.0), (2.76, 0.5), (5.4, 0.25)):
            s[i:] += np.sin(2 * np.pi * base * ratio * tt) * np.exp(-tt * 4.5) * amp
    s += highpass(rng.standard_normal(n), 3000) * np.exp(-t * 60) * 0.6
    return s * 0.14


def bulb_buzz(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.4 + 0.3 * highpass(rng.standard_normal(n), 2000)
    gate = (np.floor(t * 22) % 3 != 1).astype(float)
    return lowpass(s, 2500) * gate * 0.18


def chime(freqs, dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 2.5) for fq in freqs)
    return s * 0.12


def tape_stop(dur=0.7, f0=220.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 - t / dur) ** 1.6 + 25
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.5 * np.sin(ph * 1.5) + 0.3 * np.sign(np.sin(ph * 0.5))
    return lowpass(s, 1800) * np.linspace(1, 0, n) * 0.35


def heartbeat():
    return np.concatenate([thud(), np.zeros(int(0.06 * SR)), thud() * 0.7])


def coin_clink(i):
    return ping(2600 + (i % 5) * 170, 0.14)


# ---------------- music ----------------
CHORDS = [
    (73.42, [293.66, 349.23, 440.0]),
    (58.27, [233.08, 293.66, 349.23]),
    (87.31, [174.61, 220.0, 261.63]),
    (65.41, [261.63, 329.63, 392.0]),
]
LEAD = [587.33, 698.46, 880.0, 783.99, 698.46, 587.33, 523.25, 587.33]
ARP = [293.66, 349.23, 440.0, 587.33]

T = {k: fr(v) for k, v in dict(CHART=CHART, CROWD=CROWD, IDEA=IDEA, LADDER=LADDER, MARKET=MARKET, CTA=CTA, END=TOTAL_F).items()}
T_PAY = fr(PAY_DROP)
T_SHAT = fr(CHART + SHATTER)
T_NO = fr(CROWD + CROWD_NO)
T_ON = fr(IDEA + IDEA_ON)


def section(t):
    if t < T_PAY:
        return 'pulse'
    if t < T['CHART']:
        return 'heart'
    if t < T_SHAT:
        return 'build'
    if t < T['CROWD']:
        return 'drop'
    if t < T_NO:
        return 'half'
    if t < T_ON:
        return 'silence'
    if t < T['END'] - 2.6:
        return 'drop'
    return 'outro'


for b in range(int(N / SR / BEAT)):
    t = b * BEAT
    sec = section(t)
    root, chord = CHORDS[(b // 4) % 4]
    bb = b % 4
    if sec in ('pulse', 'build', 'drop'):
        add(music, t, kick(0.9 if sec != 'drop' else 1.1), 0.9)
    if sec == 'half' and bb == 0:
        add(music, t, kick(1.0), 0.9)
    if (sec == 'drop' and bb in (1, 3)) or (sec == 'half' and bb == 2):
        add(music, t, clap(), 0.85)
    if sec in ('pulse', 'build', 'drop', 'half'):
        sub = 4 if sec == 'build' else 2
        for k in range(sub):
            add(music, t + k * BEAT / sub, hat(open_=(k == sub // 2 and sec == 'drop')), 0.55)
    if sec in ('pulse', 'drop'):
        for k in range(2):
            add(music, t + k * BEAT / 2, bass_note(root * (2 if (k == 1 and bb == 3) else 1), BEAT / 2 * 0.9), 0.75 if sec == 'drop' else 0.5)
    if sec == 'build':
        add(music, t, bass_note(root, BEAT * 0.9), 0.6)
        for k in range(4):
            prog_ = (t - T['CHART']) / (T_SHAT - T['CHART'])
            add(music, t + k * BEAT / 4, pluck(ARP[(b * 4 + k) % 4] * (1 + (prog_ > 0.5))), 0.35 + 0.35 * prog_)
    if sec == 'half' and bb == 0:
        add(music, t, bass_note(root, BEAT * 3.6), 0.6)
    if bb == 0 and sec not in ('silence', 'outro'):
        add(music, t, pad_chord(chord, BEAT * 4), {'heart': 1.3, 'half': 1.2}.get(sec, 0.55))
    if sec == 'drop' and t >= T['MARKET']:
        for k in range(2):
            add(music, t + k * BEAT / 2, pluck(LEAD[(b * 2 + k) % len(LEAD)]), 0.75)

END = T['END']
add(music, END - 2.6, kick(1.3), 1.0)
add(music, END - 2.6, pad_chord([293.66, 349.23, 440.0, 587.33], 2.6), 1.7)

# ---------------- SFX ----------------
# hook
add(sfx, 0, sub_boom(), 0.9)
for i in range(COIN_COUNT):
    add(sfx, fr(COIN_FIRST + i * COIN_EVERY + COIN_FLIGHT), coin_clink(i), 0.75)
add(sfx, T_PAY, whoosh(0.7, False, 0.7), 1)
add(sfx, fr(PAY_DROP + 26), ping(990, 0.7), 1.2)
add(sfx, fr(PAY_DROP + 26), thud(), 0.5)
for k in range(3):
    add(sfx, fr(PAY_DROP + 40) + k * 0.8, heartbeat(), 0.8)

# chart
add(sfx, T['CHART'], whoosh(0.5, True), 1)
add(sfx, T['CHART'], sub_boom(1.0), 0.5)
add(sfx, T_SHAT - 2.0, riser(2.0), 1.0)
add(sfx, T_SHAT, shatter(), 1.0)
add(sfx, T_SHAT, impact(), 1.0)
add(sfx, T_SHAT, sub_boom(), 0.8)
add(sfx, fr(CHART + 200), pop(), 0.6)

# crowd
add(sfx, T['CROWD'], whoosh(0.5, True), 1)
for i in range(20):
    if (i * 7) % 20 < 11:
        add(sfx, fr(CROWD + 22 + i * 2), ping(1760 + (i % 4) * 220, 0.12), 0.45)
add(sfx, T_NO - 0.05, tape_stop(), 1.0)
add(sfx, T_NO, bulb_buzz(0.4), 1)

# idea
add(sfx, fr(IDEA + 12), bulb_buzz(fr(IDEA_ON - 12)), 1.2)
add(sfx, T_ON, impact(), 1.1)
add(sfx, T_ON, sub_boom(), 0.9)
add(sfx, T_ON, chime([1046.5, 1318.5, 1568.0, 2093.0]), 1.0)
add(sfx, fr(IDEA + IDEA_ON + 14), pop(), 1.0)
for p in IDEA_PILLS:
    add(sfx, fr(IDEA + p), pop(), 0.9)
    add(sfx, fr(IDEA + p), ping(1568, 0.2), 0.6)

# ladder
add(sfx, T['LADDER'], whoosh(0.5, True), 1)
SCALE = [293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25, 587.33, 659.25]
for k in range(1, 9):
    add(sfx, fr(LADDER + L_FIRST + k * L_EVERY), ping(SCALE[k] * 2, 0.25), 0.9)
add(sfx, fr(LADDER + L_FIRST + 8 * L_EVERY + 4), kaching(), 1.0)
add(sfx, fr(LADDER + L_FIVE), pop(), 1.0)

# market
add(sfx, T['MARKET'], whoosh(0.5, True), 1)
add(sfx, T['MARKET'], sub_boom(1.2), 0.6)
for k in range(14):
    add(sfx, fr(MARKET + M_COUNT1 + k * 3), tick(2400 + k * 60), 0.6)
add(sfx, fr(MARKET + M_COUNT1 + 40), kaching(), 1.1)
for k in range(10):
    add(sfx, fr(MARKET + M_COUNT2 + k * 3), tick(2800), 0.5)
add(sfx, fr(MARKET + M_COUNT2 + 34), kaching(), 0.9)

# cta
add(sfx, T['CTA'], whoosh(0.6, True), 1)
add(sfx, fr(CTA + PCTA_SMILE), pop(), 1.2)
add(sfx, fr(CTA + PCTA_SMILE), chime([1318.5, 1568.0, 1975.5], 1.0), 0.9)
add(sfx, fr(CTA + PCTA_BTN), pop(), 1.1)
add(sfx, fr(CTA + PCTA_BTN), kaching(), 0.8)

# transition whooshes are covered per scene; mix
mix = music * 0.52 + sfx * 0.95
fade, end = t2i(1.0), t2i(END)
mix[end - fade:end] *= np.linspace(1, 0, fade)
mix[end:] = 0

out = Path(__file__).resolve().parent.parent / 'public' / 'pecka-soundtrack.wav'
write_wav(out, mix)
print('wrote', out)

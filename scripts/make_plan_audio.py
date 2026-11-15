"""Soundtrack for the KarieraPlan reel -> public/plan-soundtrack.wav.

Frame constants mirror src/plan/scenes.tsx. Run: python3 scripts/make_plan_audio.py
"""
from pathlib import Path

import numpy as np

from audiolib import (
    SR, add, bass_note, clap, fr, hat, impact, kick, pad_chord, ping, pluck, pop, riser, t2i, thud, tick, whoosh,
)

TOTAL_F = 1200
N = int(TOTAL_F / 30 * SR) + SR // 2

# scene starts (frames)
HOOK, SAME, LADDER, TIME, TEAM, CTA = 0, 240, 390, 690, 870, 1020
COIN_FIRST, COIN_EVERY, COIN_COUNT, COIN_FLIGHT = 12, 6, 17, 18
PAY_DROP = 138
MONTH_FIRST, MONTH_EVERY, SAME_NOTICE = 8, 13, 100
CLIMB_FIRST, CLIMB_EVERY = 40, 22
TIME_FIRST, TIME_EVERY, TIME_TOTAL = 16, 13, 100
TEAM_SPAWNS = [20, 28, 36, 52, 56, 60, 64, 68, 72, 76, 80, 84]
CTA_BTN = 40

BEAT = 0.5  # 120 BPM
music = np.zeros(N)
sfx = np.zeros(N)

# D minor: Dm – Bb – F – C
CHORDS = [
    (73.42, [293.66, 349.23, 440.0]),
    (58.27, [233.08, 293.66, 349.23]),
    (87.31, [174.61, 220.0, 261.63]),
    (65.41, [261.63, 329.63, 392.0]),
]
LEAD = [587.33, 698.46, 880.0, 783.99, 698.46, 587.33, 523.25, 587.33]


def section(t):
    if t < fr(PAY_DROP):
        return 'hook'
    if t < fr(SAME):
        return 'drop'
    if t < fr(LADDER):
        return 'same'
    if t < fr(TEAM):
        return 'build'
    if t < fr(TOTAL_F) - 2.6:
        return 'full'
    return 'outro'


for b in range(int(N / SR / BEAT)):
    t = b * BEAT
    sec = section(t)
    root, chord = CHORDS[(b // 4) % 4]
    bb = b % 4
    if sec in ('hook', 'same', 'build', 'full'):
        add(music, t, kick(0.85 if sec in ('hook', 'same') else 1.0), 0.9)
    if sec in ('build', 'full') and bb in (1, 3):
        add(music, t, clap(), 0.8)
    if sec in ('hook', 'same', 'build', 'full'):
        sub = 4 if sec == 'same' else 2
        for k in range(sub):
            add(music, t + k * BEAT / sub, hat(open_=(k == sub // 2 and sec != 'same')), 0.55)
    if sec in ('build', 'full'):
        for k in range(2):
            add(music, t + k * BEAT / 2, bass_note(root * (2 if (k == 1 and bb == 3) else 1), BEAT / 2 * 0.9), 0.75)
    if sec in ('hook', 'same') and bb in (0, 2):
        add(music, t, bass_note(root, BEAT * 0.9), 0.45)
    if bb == 0 and sec != 'outro':
        add(music, t, pad_chord(chord, BEAT * 4), {'drop': 1.4, 'same': 0.8}.get(sec, 0.6))
    if sec == 'full':
        for k in range(2):
            add(music, t + k * BEAT / 2, pluck(LEAD[(b * 2 + k) % len(LEAD)]), 0.7)

END = fr(TOTAL_F)
add(music, END - 2.6, kick(1.2), 1.0)
add(music, END - 2.6, pad_chord([293.66, 349.23, 440.0, 587.33], 2.6), 1.6)

# duck music at the "a kolik z toho vidíš ty" moment
i0, i1 = t2i(fr(PAY_DROP)), t2i(fr(PAY_DROP) + 0.3)
music[i0:i1] *= np.linspace(1, 0.25, i1 - i0)

# ---------------- SFX ----------------
add(sfx, 0, impact(), 0.8)
for i in range(COIN_COUNT):
    add(sfx, fr(COIN_FIRST + i * COIN_EVERY + COIN_FLIGHT), ping(2400 + (i % 4) * 180, 0.18), 0.8)
add(sfx, fr(PAY_DROP), whoosh(0.8, False, 0.6), 1)
add(sfx, fr(PAY_DROP + 26), ping(1180, 0.5), 1.1)
add(sfx, fr(PAY_DROP + 26), thud(), 0.6)
add(sfx, fr(PAY_DROP + 28), pop(), 0.8)

add(sfx, fr(SAME), whoosh(0.5, True), 1)
for k in range(7):
    add(sfx, fr(SAME + MONTH_FIRST + k * MONTH_EVERY), tick(1600 + k * 120), 1.2)
add(sfx, fr(SAME + SAME_NOTICE), pop(), 0.9)
add(sfx, fr(LADDER) - 1.6, riser(1.6), 0.8)

add(sfx, fr(LADDER), impact(), 0.9)
SCALE = [293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25, 587.33, 659.25]
for k in range(1, 9):
    t = fr(LADDER + CLIMB_FIRST + k * CLIMB_EVERY)
    add(sfx, t, ping(SCALE[k] * 2, 0.3), 0.9)
    add(sfx, t, thud(), 0.35)
add(sfx, fr(LADDER + CLIMB_FIRST + 8 * CLIMB_EVERY + 4), impact(), 0.6)

add(sfx, fr(TIME), whoosh(0.5, True), 1)
for k in range(6):
    add(sfx, fr(TIME + TIME_FIRST + k * TIME_EVERY), pop(), 0.9)
add(sfx, fr(TIME + TIME_TOTAL), impact(), 0.8)

add(sfx, fr(TEAM), whoosh(0.5, True), 1)
for k, s in enumerate(TEAM_SPAWNS):
    add(sfx, fr(TEAM + s + 6), ping(1320 + (k % 3) * 220, 0.18), 0.7)

add(sfx, fr(CTA), whoosh(0.6, True), 1)
add(sfx, fr(CTA + CTA_BTN), pop(), 1.1)
add(sfx, fr(CTA + CTA_BTN), ping(1980), 0.8)

mix = music * 0.55 + sfx * 0.9
fade, end = t2i(1.0), t2i(END)
mix[end - fade:end] *= np.linspace(1, 0, fade)
mix[end:] = 0

from audiolib import write_wav  # noqa: E402

out = Path(__file__).resolve().parent.parent / 'public' / 'plan-soundtrack.wav'
write_wav(out, mix)
print('wrote', out)

"""Soundtrack for the EnvReel (prostředí) -> public/env-soundtrack.wav. Frames mirror src/env/reel.tsx."""
import numpy as np

from audiolib import add, chime, fr, heartbeat, impact, kaching, ping, pop, riser, scratch, sub_boom, thud, tick, whoosh
from make_week_audio import build, finish

H, STORY, S1, S2, PT, SELL, CTA, END = 0, 150, 360, 585, 765, 885, 1125, 1305
H_STRIKES, H_REVEAL = [26, 42, 58], 82

music, n, end = build(END, [(H, 'pulse'), (H + H_REVEAL, 'drop'), (STORY, 'half'), (S1, 'build'), (PT, 'drop')], 'em')
sfx = np.zeros(n)

# hook
add(sfx, 0, sub_boom(), 0.8)
add(sfx, fr(12), whoosh(0.4, True, 0.6), 1)
for i in range(3):
    add(sfx, fr(14 + i * 6), pop(), 0.7)
for s in H_STRIKES:
    add(sfx, fr(s), scratch(), 0.55)
    add(sfx, fr(s), thud(), 0.5)
add(sfx, fr(H_REVEAL) - 0.8, riser(0.8), 0.7)
add(sfx, fr(H_REVEAL), impact(), 1.1)
add(sfx, fr(H_REVEAL), sub_boom(), 0.8)
for i in range(4):
    add(sfx, fr(H_REVEAL + 10 + i * 4), pop(), 0.6)

# story
add(sfx, fr(STORY), whoosh(0.5, True), 1)
for b in (40, 56, 72):
    add(sfx, fr(STORY + b), pop(), 0.7)
    add(sfx, fr(STORY + b + 6), ping(1568, 0.18), 0.7)
add(sfx, fr(STORY + 120), thud(), 0.7)
add(sfx, fr(STORY + 126), chime([1318.5, 1568.0, 1975.5], 1.0), 0.8)

# study 1
add(sfx, fr(S1), whoosh(0.5, True), 1)
add(sfx, fr(S1 + 30), impact(), 0.6)
for d in range(4):
    add(sfx, fr(S1 + 30 + d * 26), ping(1320 / (1.25 ** d), 0.35), 0.9)
for k in range(11):
    add(sfx, fr(S1 + 40 + k * 3), tick(2200 + k * 40), 0.6)
add(sfx, fr(S1 + 74), thud(), 0.8)

# study 2
add(sfx, fr(S2), whoosh(0.5, True), 1)
for b in (20, 28, 36):
    add(sfx, fr(S2 + b), pop(), 1.0)
add(sfx, fr(S2 + 64), impact(), 0.7)
add(sfx, fr(S2 + 64), chime([1046.5, 1318.5, 1568.0]), 0.9)
add(sfx, fr(S2 + 74), pop(), 0.9)

# point
add(sfx, fr(PT), sub_boom(), 0.8)
add(sfx, fr(PT + 20), whoosh(1.2, True, 0.8), 1)
add(sfx, fr(PT + 60), chime([1318.5, 1568.0, 2093.0], 1.2), 0.9)

# sell
add(sfx, fr(SELL) - 1.2, riser(1.2), 0.7)
add(sfx, fr(SELL), impact(), 1.0)
for k, st in enumerate((16, 50, 84)):
    add(sfx, fr(SELL + st), pop(), 1.0)
    add(sfx, fr(SELL + st), ping(880 * 2 ** (k * 4 / 12), 0.4), 0.9)
add(sfx, fr(SELL + 124), impact(), 0.8)
add(sfx, fr(SELL + 124), kaching(), 0.9)

# cta
add(sfx, fr(CTA), whoosh(0.6, True), 1)
add(sfx, fr(CTA + 34), pop(), 1.1)
add(sfx, fr(CTA + 34), kaching(), 0.8)

finish('env-soundtrack.wav', music, sfx, end)

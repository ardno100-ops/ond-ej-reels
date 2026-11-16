"""Soundtrack for the EnvReel (prostředí) -> public/env-soundtrack.wav. Frames mirror src/env/reel.tsx."""
import numpy as np

from audiolib import add, chime, fr, heartbeat, impact, kaching, ping, pop, riser, sub_boom, thud, tick, whoosh
from make_week_audio import build, finish

H, S1, S2, S3, PT, SELL, CTA, END = 0, 135, 375, 585, 795, 915, 1125, 1305

music, n, end = build(END, [(H, 'half'), (S1, 'build'), (S3, 'pulse'), (PT, 'drop')], 'em')
sfx = np.zeros(n)

add(sfx, 0, sub_boom(), 0.8)
for i in range(5):
    add(sfx, fr(6 + i * 5), pop(), 0.8)
for k in range(2):
    add(sfx, fr(50) + k * 0.8, heartbeat(), 0.7)

add(sfx, fr(S1), whoosh(0.5, True), 1)
add(sfx, fr(S1 + 30), impact(), 0.6)
for d in range(4):
    add(sfx, fr(S1 + 30 + d * 26), ping(1320 / (1.25 ** d), 0.35), 0.9)
for k in range(11):
    add(sfx, fr(S1 + 40 + k * 3), tick(2200 + k * 40), 0.6)
add(sfx, fr(S1 + 74), thud(), 0.8)

add(sfx, fr(S2), whoosh(0.5, True), 1)
for b in (20, 28, 36):
    add(sfx, fr(S2 + b), pop(), 1.0)
add(sfx, fr(S2 + 64), impact(), 0.7)
add(sfx, fr(S2 + 64), chime([1046.5, 1318.5, 1568.0]), 0.9)
add(sfx, fr(S2 + 74), pop(), 0.9)

add(sfx, fr(S3), whoosh(0.5, True), 1)
add(sfx, fr(S3 + 30), pop(), 0.8)
for i in range(4):
    add(sfx, fr(S3 + 40 + i * 8), ping(1568 + i * 200, 0.2), 0.7)
add(sfx, fr(S3 + 120), impact(), 0.8)
add(sfx, fr(S3 + 120), chime([987.77, 1318.5, 1975.5]), 0.8)

add(sfx, fr(PT), sub_boom(), 0.8)
add(sfx, fr(PT + 20), whoosh(1.2, True, 0.8), 1)
add(sfx, fr(PT + 60), chime([1318.5, 1568.0, 2093.0], 1.2), 0.9)

add(sfx, fr(SELL) - 1.2, riser(1.2), 0.7)
add(sfx, fr(SELL), impact(), 1.0)
for c in (26, 38, 50, 62, 74):
    add(sfx, fr(SELL + c), ping(1760), 0.9)
for i in range(7):
    add(sfx, fr(SELL + 90 + i * 4), pop(), 0.6)

add(sfx, fr(CTA), whoosh(0.6, True), 1)
add(sfx, fr(CTA + 34), pop(), 1.1)
add(sfx, fr(CTA + 34), kaching(), 0.8)

finish('env-soundtrack.wav', music, sfx, end)

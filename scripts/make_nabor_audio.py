"""SFX-only track for NaborReel -> public/nabor-sfx.wav. Frames mirror src/nabor/reel.tsx."""
import numpy as np

from audiolib import SR, add, chime, fr, impact, kaching, ping, pop, riser, sub_boom, thud, tick, whoosh, write_wav, t2i

HOOK, OFFER, GET, WHO, TRUST, CTA, END = 0, 90, 240, 450, 630, 780, 990
n = int(END / 30 * SR) + SR // 2
sfx = np.zeros(n)

# hook: three slams
for i, h in enumerate((0, 20, 44)):
    add(sfx, fr(HOOK + h), impact(), 1.0 if i != 1 else 0.7)
    add(sfx, fr(HOOK + h), sub_boom(0.9), 0.6)
add(sfx, fr(OFFER) - 0.5, whoosh(0.5, True), 1)

# offer
add(sfx, fr(OFFER + 4), impact(), 1.0)
for k, s in enumerate((40, 56, 72)):
    add(sfx, fr(OFFER + s), pop(), 1.0)
    add(sfx, fr(OFFER + s), ping(880 * 2 ** (k * 4 / 12), 0.3), 0.8)
add(sfx, fr(OFFER + 100), whoosh(0.4, True, 0.7), 1)

# get: rapid fire
add(sfx, fr(GET), impact(), 0.8)
for i in range(5):
    t = fr(GET + 22 + i * 26)
    add(sfx, t, whoosh(0.25, True, 0.6), 1)
    add(sfx, t + 0.05, ping(1320 * 2 ** (i * 2 / 12), 0.25), 0.9)
add(sfx, fr(GET + 22 + 4 * 26 + 6), kaching(), 0.8)

# who
add(sfx, fr(WHO), impact(), 0.8)
for i in range(3):
    add(sfx, fr(WHO + 20 + i * 22), pop(), 1.0)
add(sfx, fr(WHO + 100) - 0.6, riser(0.6), 0.6)
add(sfx, fr(WHO + 100), impact(), 1.0)
add(sfx, fr(WHO + 100), thud(), 0.8)

# trust
add(sfx, fr(TRUST), sub_boom(), 0.9)
add(sfx, fr(TRUST + 6), impact(), 0.9)
for i in range(3):
    add(sfx, fr(TRUST + 34 + i * 20), pop(), 1.0)
    add(sfx, fr(TRUST + 34 + i * 20), ping(1760, 0.2), 0.6)

# cta
add(sfx, fr(CTA) - 0.8, riser(0.8), 0.7)
add(sfx, fr(CTA + 20), impact(), 1.1)
add(sfx, fr(CTA + 20), sub_boom(), 0.8)
add(sfx, fr(CTA + 30), pop(), 0.8)
for t in (44, 50, 56, 62, 68):
    add(sfx, fr(CTA + t), tick(3000), 0.9)
add(sfx, fr(CTA + 80), kaching(), 1.0)
add(sfx, fr(CTA + 80), chime([1318.5, 1568.0, 2093.0], 1.2), 0.8)
add(sfx, fr(CTA + 120), pop(), 0.8)

e = t2i(fr(END))
sfx[e:] = 0
from pathlib import Path  # noqa: E402

write_wav(Path(__file__).resolve().parent.parent / 'public' / 'nabor-sfx.wav', sfx)
print('wrote nabor-sfx.wav')

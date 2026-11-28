"""SFX for CartoonReel. Usage: python3 scripts/cartoon_audio.py <spec.json>"""
import json, sys
from pathlib import Path
import numpy as np
from audiolib import SR, add, chime, fr, impact, kaching, ping, pop, riser, sub_boom, t2i, thud, tick, whoosh, write_wav

spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
sc = spec['scenes']
total = sum(s['dur'] for s in sc)
sfx = np.zeros(int(total / 30 * SR) + SR // 2)
t0 = 0
for i, s in enumerate(sc):
    k = s['set']['k']; d = s['dur']; st = s['set']
    if i == 0:
        add(sfx, 0.0, impact(), 1.0); add(sfx, 0.0, sub_boom(), 0.7)
        for j in range(len(st.get('title', []))):
            add(sfx, fr(j * 7), pop(), 0.6)
    else:
        add(sfx, fr(t0), whoosh(0.5, True, 0.6), 1)
    if s.get('badge'):
        add(sfx, fr(t0 + 3), pop(), 0.7)
        add(sfx, fr(t0 + 4), ping(1320, 0.25), 0.4)
    if k == 'office' and st.get('stamps'):
        for j in range(7):
            yes = j in (3, 6)
            add(sfx, fr(t0 + 10 + j * 8), ping(1568, 0.3) if yes else thud(), 0.7 if yes else 0.55)
    elif k == 'cafe':
        b = st.get('bubbles', [])
        for j in range(len(b)):
            add(sfx, fr(t0 + 8 + j * ((d - 20) // max(1, len(b)))), pop(), 0.7)
    elif k == 'calendar':
        for j in range(15):
            add(sfx, fr(t0 + 6 + j * 4), tick(2400 + j * 40), 0.4)
    elif k == 'team':
        for j in range(1, st.get('n', 3)):
            add(sfx, fr(t0 + 6 + j * 12), pop(), 0.8)
    elif k == 'gym':
        for j in range(d // 38):
            add(sfx, fr(t0 + 10 + j * 38), thud(), 0.45)
    elif k == 'split':
        add(sfx, fr(t0 + 14), chime([880.0, 1318.5], 1.0), 0.5)
    elif k == 'home':
        add(sfx, fr(t0 + 6), chime([659.3, 987.8], 1.2), 0.35)
    elif k == 'big':
        if t0 > 0: add(sfx, fr(t0) - 0.5, riser(0.5), 0.5)
        for j in range(len(st['lines'])):
            add(sfx, fr(t0 + 4 + j * 10), impact(), 0.8 if j < len(st['lines']) - 1 else 1.0)
    elif k == 'myth':
        add(sfx, fr(t0 + 30), impact(), 0.9); add(sfx, fr(t0 + 30), thud(), 0.6)
        add(sfx, fr(t0 + 52), whoosh(0.4, True, 0.7), 1)
        add(sfx, fr(t0 + 60), chime([987.8, 1318.5, 1568.0], 1.0), 0.6)
    elif k == 'board':
        n = len(st['items']); g = (d - 24) // max(1, n)
        for j in range(n):
            add(sfx, fr(t0 + 12 + j * g), pop(), 0.7); add(sfx, fr(t0 + 13 + j * g), ping(1175 + j * 120, 0.25), 0.35)
    elif k == 'ladder':
        n = len(st['steps']); g = (d - 24) // max(1, n)
        for j in range(n):
            add(sfx, fr(t0 + 10 + j * g), ping(784 * (1.12 ** j), 0.3), 0.55); add(sfx, fr(t0 + 10 + j * g), thud(), 0.35)
    elif k == 'cta':
        add(sfx, fr(t0 + 12), impact(), 1.0); add(sfx, fr(t0 + 12), sub_boom(), 0.7)
        add(sfx, fr(t0 + 26), kaching(), 0.8)
    t0 += d
sfx[t2i(fr(total)):] = 0
out = Path(__file__).resolve().parent.parent / 'public' / spec['audio']
out.parent.mkdir(parents=True, exist_ok=True)
write_wav(out, sfx)
print('wrote', out)

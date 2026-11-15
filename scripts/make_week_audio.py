"""Soundtracks for the 5 week reels -> public/week-*.wav.

Frame numbers mirror src/week/reels.tsx. Run: python3 scripts/make_week_audio.py
"""
from pathlib import Path

import numpy as np

from audiolib import (
    SR, add, bass_note, chime, clap, fr, hat, heartbeat, highpass, impact, kaching, kick, lowpass, pad_chord, ping,
    pluck, pop, riser, rng, sub_boom, t2i, tape_stop, thud, tick, whoosh, write_wav,
)

OUT = Path(__file__).resolve().parent.parent / 'public'
BEAT = 0.5

KEYS = {
    'dm': ([(73.42, [293.66, 349.23, 440.0]), (58.27, [233.08, 293.66, 349.23]), (87.31, [174.61, 220.0, 261.63]), (65.41, [261.63, 329.63, 392.0])],
           [587.33, 698.46, 880.0, 783.99, 698.46, 587.33, 523.25, 587.33]),
    'am': ([(110.0, [220.0, 261.63, 329.63]), (87.31, [174.61, 220.0, 261.63]), (130.81, [261.63, 329.63, 392.0]), (98.0, [196.0, 246.94, 293.66])],
           [440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.0, 440.0]),
    'em': ([(82.41, [329.63, 392.0, 493.88]), (65.41, [261.63, 329.63, 392.0]), (98.0, [196.0, 246.94, 293.66]), (73.42, [293.66, 369.99, 440.0])],
           [659.25, 783.99, 987.77, 880.0, 783.99, 659.25, 587.33, 659.25]),
}


def build(total_f, sections, key):
    """sections: list of (start_frame, kind). kinds: pulse, half, build, drop, silence."""
    n = int(total_f / 30 * SR) + SR // 2
    music = np.zeros(n)
    chords, lead = KEYS[key]
    end = fr(total_f)

    def kind_at(t):
        if t >= end - 2.6:
            return 'outro'
        k = sections[0][1]
        for sf, kd in sections:
            if t >= fr(sf):
                k = kd
        return k

    for b in range(int(n / SR / BEAT)):
        t = b * BEAT
        sec = kind_at(t)
        root, chord = chords[(b // 4) % 4]
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
                add(music, t + k * BEAT / 4, pluck(chord[(b * 4 + k) % 3] * 2), 0.45)
        if sec == 'half' and bb == 0:
            add(music, t, bass_note(root, BEAT * 3.6), 0.6)
        if bb == 0 and sec not in ('silence', 'outro'):
            add(music, t, pad_chord(chord, BEAT * 4), {'half': 1.2, 'pulse': 0.8}.get(sec, 0.55))
        if sec == 'drop':
            for k in range(2):
                add(music, t + k * BEAT / 2, pluck(lead[(b * 2 + k) % len(lead)]), 0.6)
    add(music, end - 2.6, kick(1.3), 1.0)
    add(music, end - 2.6, pad_chord([c * 1 for c in chords[0][1]] + [chords[0][1][0] * 2], 2.6), 1.7)
    return music, n, end


def finish(name, music, sfx, end):
    mix = music * 0.5 + sfx * 0.95
    fade, e = t2i(1.0), t2i(end)
    mix[e - fade:e] *= np.linspace(1, 0, fade)
    mix[e:] = 0
    write_wav(OUT / name, mix)
    print('wrote', name)


def rumble(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = lowpass(rng.standard_normal(n), 180) * (0.3 + 0.7 * t / dur)
    return s * 0.9


# ---------------- PONDĚLÍ ----------------
def po():
    total = 705
    music, n, end = build(total, [(0, 'pulse'), (120, 'build'), (390, 'drop'), (540, 'drop')], 'am')
    sfx = np.zeros(n)
    add(sfx, 0, sub_boom(), 0.9)
    add(sfx, fr(8), pop(), 1.0)
    add(sfx, fr(120), whoosh(0.5, True), 1)
    add(sfx, fr(126), ping(1760, 0.3), 0.9)
    for age in (23, 27, 30, 34):
        f = round(20 + (age - 20) / 15 * 180)
        add(sfx, fr(120 + f), pop(), 1.0)
        add(sfx, fr(120 + f), ping(660 + (age - 20) * 60, 0.2), 0.6)
    add(sfx, fr(390) - 1.5, riser(1.5), 0.8)
    add(sfx, fr(390), impact(), 1.0)
    for c in (30, 44, 58):
        add(sfx, fr(390 + c), ping(1760), 0.9)
    add(sfx, fr(540), whoosh(0.6, True), 1)
    add(sfx, fr(540 + 34), pop(), 1.1)
    add(sfx, fr(540 + 34), kaching(), 0.8)
    finish('week-po.wav', music, sfx, end)


# ---------------- STŘEDA ----------------
def st():
    total = 795
    music, n, end = build(total, [(0, 'pulse'), (120, 'half'), (375, 'drop'), (630, 'drop')], 'dm')
    sfx = np.zeros(n)
    add(sfx, 0, impact(), 0.8)
    add(sfx, fr(14), pop(), 1)
    add(sfx, fr(26), pop(), 1)
    add(sfx, fr(120), whoosh(0.5, True), 1)
    for k in range(0, 180, 15):
        add(sfx, fr(120 + k), tick(1400 if (k // 15) % 2 else 1100), 0.8)
    for h in (30, 60, 90, 120, 150):
        add(sfx, fr(120 + h), ping(2600, 0.15), 0.8)
    add(sfx, fr(120 + 180), tape_stop(), 1.0)
    add(sfx, fr(120 + 184), thud(), 0.8)
    add(sfx, fr(375), impact(), 1.0)
    add(sfx, fr(375 + 10), rumble(fr(210)), 0.6)
    for k, at in enumerate((40, 80, 120, 160)):
        add(sfx, fr(375 + at), pop(), 1.0)
        add(sfx, fr(375 + at), ping(880 * 2 ** (k * 3 / 12), 0.25), 0.7)
    add(sfx, fr(630), whoosh(0.6, True), 1)
    add(sfx, fr(630 + 34), pop(), 1.1)
    add(sfx, fr(630 + 34), kaching(), 0.8)
    finish('week-st.wav', music, sfx, end)


# ---------------- ČTVRTEK ----------------
def ct():
    total = 720
    dip = round(10 + 0.55 * 250)
    music, n, end = build(total, [(0, 'pulse'), (105, 'half'), (105 + dip, 'build'), (405, 'drop'), (555, 'drop')], 'em')
    sfx = np.zeros(n)
    add(sfx, 0, sub_boom(), 0.8)
    add(sfx, fr(30), pop(), 1.0)
    for k in range(3):
        add(sfx, fr(40) + k * 0.8, heartbeat(), 0.6)
    add(sfx, fr(105), whoosh(0.5, True), 1)
    for t in (0.12, 0.47, 0.86):
        f = round(10 + t * 250)
        add(sfx, fr(105 + f), ping(1320 if t != 0.47 else 660, 0.4), 0.9)
    for i in range(7):
        add(sfx, fr(105 + dip - 30 + i * 6 + 12), whoosh(0.35, False, 0.5), 1)
    add(sfx, fr(105 + dip + 14), pop(), 1.0)
    add(sfx, fr(405) - 1.5, riser(1.5), 0.8)
    add(sfx, fr(405), impact(), 1.0)
    add(sfx, fr(405), chime([987.77, 1318.5, 1567.98]), 0.8)
    for c in (40, 54, 68):
        add(sfx, fr(405 + c), ping(1760), 0.9)
    add(sfx, fr(555), whoosh(0.6, True), 1)
    add(sfx, fr(555 + 34), pop(), 1.1)
    add(sfx, fr(555 + 34), kaching(), 0.8)
    finish('week-ct.wav', music, sfx, end)


# ---------------- PÁTEK ----------------
def pa():
    total = 815
    music, n, end = build(total, [(0, 'pulse'), (105, 'drop'), (545, 'half'), (650, 'drop')], 'am')
    sfx = np.zeros(n)
    for k in range(0, 105, 15):
        add(sfx, fr(k), tick(1500 if (k // 15) % 2 else 1200), 0.9)
    add(sfx, fr(90), riser(0.5), 0.6)
    for i in range(6):
        st_ = fr(105 + i * 70)
        add(sfx, st_, whoosh(0.4, True, 0.8), 1)
        add(sfx, st_ + 0.1, chime([1046.5, 1318.5], 0.6), 0.7)
    add(sfx, fr(545), impact(), 1.0)
    add(sfx, fr(650), whoosh(0.6, True), 1)
    add(sfx, fr(650 + 34), pop(), 1.1)
    add(sfx, fr(650 + 34), kaching(), 0.8)
    finish('week-pa.wav', music, sfx, end)


# ---------------- NEDĚLE ----------------
def ne():
    total = 570
    music, n, end = build(total, [(0, 'half'), (120, 'build'), (320, 'drop'), (390, 'drop')], 'dm')
    sfx = np.zeros(n)
    for k in range(4):
        add(sfx, 0.2 + k * 0.9, heartbeat(), 0.8)
    add(sfx, fr(120), whoosh(0.5, True), 1)
    for k in range(1, 6):
        f = 10 + k * (190 / 5.99)
        add(sfx, fr(120 + f), ping(880 * 2 ** (k * 2 / 12), 0.3), 0.9)
        add(sfx, fr(120 + f), thud(), 0.4)
    add(sfx, fr(320), impact(), 1.0)
    add(sfx, fr(320), sub_boom(), 0.7)
    add(sfx, fr(390), whoosh(0.6, True), 1)
    add(sfx, fr(390 + 34), pop(), 1.1)
    add(sfx, fr(390 + 34), kaching(), 0.8)
    finish('week-ne.wav', music, sfx, end)


if __name__ == '__main__':
    po()
    st()
    ct()
    pa()
    ne()

import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote} from '../components';
import {Flash, Shake, Slam} from '../nabor/reel';
import {C, FONT, glow, prog} from '../theme';

/* Over-the-top money scenes (glow style): crash, mix (donut), race (growth lines + money rain).
   Timings are mirrored in scripts/auto_audio.py (MS dict) – keep in sync. */

export const MS = {crashHits: [36, 72, 90], mixSeg: [18, 36, 54], mixCaption: 90, raceStart: 12, raceEnd: 84, raceBadge: 90};

const RED = '#ff5d4d';
const GOLD = '#f5d36b';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const SAFE_TITLE = 400;

export type CrashScene = {type: 'crash'; dur: number; kicker: string; title: string; drops: {pct: string; label: string}[]; caption?: string; foot?: string};
export type MixScene = {type: 'mix'; dur: number; title: string; center: string; parts: {label: string; pct: number; tag: string}[]; caption?: string; foot?: string};
export type RaceScene = {type: 'race'; dur: number; title: string; years: number; base: number; lines: {label: string; rate: number}[]; badge: string; badgeSub: string; unit?: 'mil' | 'tis'; foot?: string};

const Kicker: React.FC<{text: string; color: string; at?: number}> = ({text, color, at = 0}) => {
	const f = useCurrentFrame();
	const p = prog(f, at, 8, Easing.out(Easing.back(2)));
	return (
		<div style={{display: 'inline-block', padding: '10px 26px', borderRadius: 14, background: color, color: C.dark, fontFamily: FONT, fontWeight: 900, fontSize: 36, letterSpacing: 4, transform: `scale(${p})`, boxShadow: `0 0 30px ${color}88`}}>{text}</div>
	);
};

/* ---------- CRASH: chart climbs, then plunges 3× with red flash, shake and big −% slams ---------- */
const CRASH_PTS: [number, number, number][] = [
	[90, 1010, 6],
	[170, 820, 26],
	[240, 1180, 36],
	[480, 770, 58],
	[565, 1170, 72],
	[760, 720, 84],
	[830, 930, 90],
	[935, 770, 110],
];
const CRASH_AT = [2, 4, 6]; // indexes of crash bottoms in CRASH_PTS

const visiblePath = (f: number) => {
	const pts: [number, number][] = [[CRASH_PTS[0][0], CRASH_PTS[0][1]]];
	for (let i = 1; i < CRASH_PTS.length; i++) {
		const [x0, y0, t0] = CRASH_PTS[i - 1];
		const [x1, y1, t1] = CRASH_PTS[i];
		if (f >= t1) pts.push([x1, y1]);
		else {
			const k = interpolate(f, [t0, t1], [0, 1], clamp);
			if (k > 0) pts.push([x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]);
			break;
		}
	}
	return pts;
};

export const Crash: React.FC<{s: CrashScene}> = ({s}) => {
	const f = useCurrentFrame();
	const pts = visiblePath(f);
	const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
	const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)} 1240 L ${pts[0][0]} 1240 Z`;
	const head = pts[pts.length - 1];
	const falling = MS.crashHits.some((h, i) => f > CRASH_PTS[CRASH_AT[i] - 1][2] && f <= h);
	const lineCol = falling ? RED : C.accent;
	const redPulse = Math.max(0, ...MS.crashHits.map((h) => (f >= h && f < h + 14 ? 0.55 * (1 - (f - h) / 14) : 0)));
	return (
		<Shake hits={MS.crashHits}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 60%, rgba(255,60,40,${redPulse}) 0%, transparent 70%)`}} />
			<AbsoluteFill>
				<div style={{position: 'absolute', top: SAFE_TITLE, left: 40, right: 40, textAlign: 'center'}}>
					<Kicker text={s.kicker} color={RED} />
					<div style={{marginTop: 22}}>
						<Slam at={4} size={88}>
							{s.title}
						</Slam>
					</div>
					{s.caption ? (
						<div style={{marginTop: 18, fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: 2, color: C.white, opacity: prog(f, 96, 8)}}>{s.caption}</div>
					) : null}
				</div>
				<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={lineCol} stopOpacity={0.35} />
							<stop offset="1" stopColor={lineCol} stopOpacity={0} />
						</linearGradient>
					</defs>
					{[760, 880, 1000, 1120, 1240].map((y) => (
						<line key={y} x1={80} x2={950} y1={y} y2={y} stroke={C.white} strokeOpacity={0.07} strokeWidth={2} strokeDasharray="8 10" />
					))}
					<path d={area} fill="url(#crashFill)" />
					<path d={d} fill="none" stroke={lineCol} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${lineCol})`}} />
					<circle cx={head[0]} cy={head[1]} r={14} fill={lineCol} style={{filter: `drop-shadow(0 0 18px ${lineCol})`}} />
					{s.drops.map((dr, i) => {
						const h = MS.crashHits[i];
						if (f < h) return null;
						const k = f - h;
						const sc = interpolate(k, [0, 5, 9], [2.2, 0.92, 1], clamp);
						const [x, y] = CRASH_PTS[CRASH_AT[i]];
						const lx = Math.min(840, Math.max(190, x));
						const ring = interpolate(k, [0, 18], [0, 1], clamp);
						return (
							<g key={dr.label}>
								<circle cx={x} cy={y} r={20 + ring * 130} fill="none" stroke={RED} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />
								<g transform={`translate(${lx} ${Math.min(1265, y + 82)}) scale(${sc})`}>
									<text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill={RED} style={{filter: `drop-shadow(0 0 16px ${RED})`}}>
										{dr.pct}
									</text>
									<text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} letterSpacing={2} fill={C.white}>
										{dr.label}
									</text>
								</g>
							</g>
						);
					})}
				</svg>
				{s.foot ? <Footnote bottom={540} o={prog(f, 100, 10)}>{s.foot}</Footnote> : null}
			</AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: RED, opacity: Math.max(0, ...MS.crashHits.map((h) => (f >= h && f < h + 5 ? 0.35 * (1 - (f - h) / 5) : 0))), pointerEvents: 'none'}} />
		</Shake>
	);
};

/* ---------- MIX: donut slams in segment by segment, legend + caption ---------- */
const MIX_COLORS = [C.white, GOLD, C.accent];
export const Mix: React.FC<{s: MixScene}> = ({s}) => {
	const f = useCurrentFrame();
	const cx = 540;
	const cy = 840;
	const r = 210;
	const sw = 96;
	const circ = 2 * Math.PI * r;
	const total = s.parts.reduce((a, p) => a + p.pct, 0);
	const spin = interpolate(f, [0, 30], [-200, -90], {...clamp, easing: Easing.out(Easing.back(1.4))});
	let acc = 0;
	const hits = MS.mixSeg.slice(0, s.parts.length);
	return (
		<Shake hits={[...hits, MS.mixCaption]}>
			<AbsoluteFill>
				<div style={{position: 'absolute', top: SAFE_TITLE, left: 40, right: 40, textAlign: 'center'}}>
					<Slam at={0} size={84} color={C.accent}>
						{s.title}
					</Slam>
					{s.caption && f >= MS.mixCaption ? (
						<div style={{marginTop: 10}}>
							<Slam at={MS.mixCaption} size={44}>
								{s.caption}
							</Slam>
						</div>
					) : null}
				</div>
				<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
					<circle cx={cx} cy={cy} r={r} fill="none" stroke={C.white} strokeOpacity={0.06} strokeWidth={sw} />
					<g transform={`rotate(${spin} ${cx} ${cy})`}>
						{s.parts.map((p, i) => {
							const seg = (p.pct / total) * circ;
							const pr = prog(f, hits[i], 12, Easing.out(Easing.cubic));
							const off = acc;
							acc += seg;
							const pop = interpolate(f - hits[i], [0, 4, 10], [1.12, 1.04, 1], clamp);
							return (
								<circle
									key={p.label}
									cx={cx}
									cy={cy}
									r={r}
									fill="none"
									stroke={MIX_COLORS[i % 3]}
									strokeWidth={sw * (f >= hits[i] ? pop : 1)}
									strokeDasharray={`${Math.max(0, seg * pr - 6)} ${circ}`}
									strokeDashoffset={-off}
									style={{filter: `drop-shadow(0 0 16px ${MIX_COLORS[i % 3]}99)`}}
								/>
							);
						})}
					</g>
					<text x={cx} y={cy + 6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.white} opacity={prog(f, 8, 8)}>
						{s.center}
					</text>
					<text x={cx} y={cy + 52} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} letterSpacing={3} fill={C.muted} opacity={prog(f, 12, 8)}>
						NA 5 LET
					</text>
				</svg>
				<div style={{position: 'absolute', top: 1110, left: 90, right: 140}}>
					{s.parts.map((p, i) => {
						const pr = prog(f, hits[i], 8, Easing.out(Easing.back(2)));
						return (
							<div key={p.label} style={{display: 'flex', alignItems: 'center', gap: 20, height: 66, opacity: pr > 0 ? 1 : 0, transform: `translateX(${(1 - pr) * -80}px)`}}>
								<div style={{width: 30, height: 30, borderRadius: 8, background: MIX_COLORS[i % 3], boxShadow: `0 0 14px ${MIX_COLORS[i % 3]}`}} />
								<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: MIX_COLORS[i % 3], width: 120}}>{p.pct} %</div>
								<div style={{flex: 1, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.white, lineHeight: 1.1}}>
									{p.label} <span style={{color: C.muted, fontSize: 24, letterSpacing: 2}}>· {p.tag}</span>
								</div>
							</div>
						);
					})}
				</div>
				{s.foot ? <Footnote bottom={540} o={prog(f, 70, 10)}>{s.foot}</Footnote> : null}
			</AbsoluteFill>
			<Flash at={[MS.mixCaption]} />
		</Shake>
	);
};

/* ---------- RACE: 3 growth lines race over N years, live values, then badge slam + money rain ---------- */
const RACE_COLORS = [C.accent, C.white, 'rgba(241,247,236,0.5)'];
const Bills: React.FC<{start: number}> = ({start}) => {
	const f = useCurrentFrame();
	if (f < start) return null;
	const k = f - start;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			{Array.from({length: 26}).map((_, i) => {
				const seed = (i * 73) % 97;
				const x = (i * 157) % 1000 + 20;
				const delay = (seed % 12) * 1.5;
				const t = Math.max(0, k - delay);
				const y = -140 + t * (16 + (seed % 7) * 2.2);
				const rot = Math.sin((t + seed) / 6) * 40 + seed * 3;
				const sway = Math.sin((t + seed) / 8) * 40;
				return (
					<div key={i} style={{position: 'absolute', left: x + sway, top: y, width: 130, height: 64, borderRadius: 8, background: 'linear-gradient(135deg, #b9e88c, #6fae4a)', border: '3px solid #e6ffd0', transform: `rotate(${rot}deg) rotateX(${(t * 9 + seed) % 360}deg)`, opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#2d5a1c'}}>
						Kč
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

export const Race: React.FC<{s: RaceScene}> = ({s}) => {
	const f = useCurrentFrame();
	const x0 = 120;
	const x1 = 740;
	const yB = 1250;
	const maxV = Math.max(...s.lines.map((l) => s.base * (1 + l.rate) ** s.years));
	const vTop = maxV * 1.03;
	const yOf = (v: number) => yB - ((v - s.base) / (vTop - s.base)) * 520;
	const t = interpolate(f, [MS.raceStart, MS.raceEnd], [0, s.years], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const fmtM = (v: number) => (s.unit === 'tis' ? Math.round(v / 1000) + ' TIS.' : (v / 1e6).toFixed(2).replace('.', ',') + ' MIL.');
	const badge = prog(f, MS.raceBadge, 8, Easing.out(Easing.back(2.2)));
	return (
		<Shake hits={[MS.raceBadge]}>
			<AbsoluteFill>
				<div style={{position: 'absolute', top: SAFE_TITLE, left: 40, right: 40, textAlign: 'center'}}>
					<Slam at={0} size={84} color={C.accent}>
						{s.title}
					</Slam>
				</div>
				<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
					<line x1={x0} x2={x1} y1={yB} y2={yB} stroke={C.white} strokeOpacity={0.4} strokeWidth={3} />
					{Array.from({length: s.years + 1}).map((_, y) => (
						<text key={y} x={x0 + ((x1 - x0) * y) / s.years} y={yB + 44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.muted}>
							{y === s.years ? `${y} LET` : y}
						</text>
					))}
					{s.lines.map((l, i) => {
						const steps = 40;
						const pts: string[] = [];
						for (let k = 0; k <= steps; k++) {
							const tt = (t * k) / steps;
							pts.push(`${k ? 'L' : 'M'} ${(x0 + ((x1 - x0) * tt) / s.years).toFixed(1)} ${yOf(s.base * (1 + l.rate) ** tt).toFixed(1)}`);
						}
						const v = s.base * (1 + l.rate) ** t;
						const hx = x0 + ((x1 - x0) * t) / s.years;
						const hy = yOf(v);
						const col = RACE_COLORS[i % 3];
						const dy = i === 0 ? -30 : i === 1 ? 26 : l.rate === 0 ? -44 : 0;
						return (
							<g key={l.label}>
								<path d={pts.join(' ')} fill="none" stroke={col} strokeWidth={i === 0 ? 10 : 7} strokeDasharray={i === 2 ? '4 14' : undefined} strokeLinecap="round" style={{filter: i === 0 ? `drop-shadow(0 0 14px ${col})` : undefined}} />
								<circle cx={hx} cy={hy} r={i === 0 ? 16 : 12} fill={col} />
								<text x={hx + 28} y={hy + 4 + dy} fontFamily={FONT} fontWeight={900} fontSize={i === 0 ? 42 : 36} fill={col} opacity={prog(f, MS.raceStart, 6)}>
									{fmtM(v)}
								</text>
								<text x={hx + 28} y={hy + 34 + dy} fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={2} fill={C.muted} opacity={prog(f, MS.raceStart, 6)}>
									{l.label}
								</text>
							</g>
						);
					})}
				</svg>
				<Bills start={MS.raceBadge} />
				{f >= MS.raceBadge ? (
					<div style={{position: 'absolute', top: 545, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<div style={{transform: `scale(${badge}) rotate(${-3 * badge}deg)`, background: C.accent, borderRadius: 26, padding: '18px 40px', textAlign: 'center', boxShadow: `0 0 60px ${C.accent}aa`}}>
							<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 82, color: C.dark, lineHeight: 1}}>{s.badge}</div>
							<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: C.dark, marginTop: 8}}>{s.badgeSub}</div>
						</div>
					</div>
				) : null}
				{s.foot ? <Footnote bottom={540} o={prog(f, 40, 10)}>{s.foot}</Footnote> : null}
			</AbsoluteFill>
			<Flash at={[MS.raceBadge]} />
		</Shake>
	);
};

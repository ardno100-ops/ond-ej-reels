import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote, Person, Pill} from '../components';
import {Slam} from '../nabor/reel';
import {useMono} from '../style';
import {C, FONT, prog} from '../theme';

/* Minimal monochrome scene types (inspired by black/white pictogram explainers).
   Timing constants are mirrored in scripts/auto_audio.py (MONO_T) – keep in sync. */
export const MT = {
	kicker: 2,
	itemFirst: 18,
	itemEvery: 9,
	muteAfter: 18,
	shieldFly: 16,
	arrowsLen: 30,
	mainArrow: 40,
	progressStart: 16,
};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const GRAY = '#7a7a7a';

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

const Kicker: React.FC<{text?: string; top?: number}> = ({text, top = 560}) => {
	const f = useCurrentFrame();
	if (!text) return null;
	const p = prog(f, MT.kicker, 12);
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity: p, filter: `blur(${(1 - p) * 6}px)`}}>
			<Pill light size={24} style={{letterSpacing: 4}}>
				{text}
			</Pill>
		</div>
	);
};

const Title: React.FC<{text?: string; sub?: string; top?: number; size?: number}> = ({text, sub, top = 360, size = 96}) => {
	const f = useCurrentFrame();
	const mono = useMono();
	if (!text) return null;
	return (
		<div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center'}}>
			<Slam at={0} size={size} color={mono ? C.white : C.accent}>
				{text}
			</Slam>
			{sub ? (
				<div style={{marginTop: 18, fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: C.muted, opacity: prog(f, 14, 12)}}>{sub}</div>
			) : null}
		</div>
	);
};

const Bubble: React.FC<{x: number; y: number; text: string; o: number; s?: number}> = ({x, y, text, o, s = 1}) => {
	const w = Math.max(110, text.length * 15 + 40);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
			<rect x={-w / 2} y={-30} width={w} height={52} rx={18} fill="#0b0b0b" stroke="#d9d9d9" strokeWidth={2.5} />
			<path d="M -14 21 L -24 40 L 0 21 Z" fill="#0b0b0b" stroke="#d9d9d9" strokeWidth={2.5} strokeLinejoin="round" />
			<rect x={-16} y={18} width={20} height={6} fill="#0b0b0b" />
			<text y={4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={19} letterSpacing={2} fill="#e8e8e8">
				{text}
			</text>
		</g>
	);
};

const caption = (text: string | undefined, at: number, top: number, f: number) =>
	text ? (
		<div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '0.24em', color: C.muted, opacity: prog(f, at, 14)}}>{text}</div>
	) : null;

/* ---------- bubbles: ty vs. řeči ostatních ---------- */
export type BubblesScene = {type: 'bubbles'; dur: number; kicker?: string; title?: string; center?: string; words: string[]; mute?: boolean; caption?: string; foot?: string};
const SPOTS = [
	{x: 150, y: 1090},
	{x: 265, y: 1030},
	{x: 380, y: 1090},
	{x: 700, y: 1090},
	{x: 815, y: 1030},
	{x: 930, y: 1090},
];
export const Bubbles: React.FC<{s: BubblesScene}> = ({s}) => {
	const f = useCurrentFrame();
	const n = Math.min(SPOTS.length, s.words.length);
	const muteAt = MT.itemFirst + n * MT.itemEvery + MT.muteAfter;
	const muted = s.mute ? prog(f, muteAt, 14) : 0;
	return (
		<AbsoluteFill>
			<Title text={s.title} top={330} size={84} />
			<Kicker text={s.kicker} top={s.title ? 560 : 600} />
			<Svg>
				{SPOTS.slice(0, n).map((p, i) => {
					const o = prog(f, MT.itemFirst + i * MT.itemEvery, 10);
					return (
						<g key={i}>
							<g opacity={o * (1 - muted * 0.6)}>
								<Person x={p.x} y={p.y} s={0.75} color={GRAY} glowOn={false} />
							</g>
							<Bubble x={p.x} y={p.y - 150} text={s.words[i]} o={o * (1 - muted * 0.8)} s={0.9 + 0.1 * o} />
						</g>
					);
				})}
				<Person x={540} y={1110} s={1.35} color="#ffffff" />
				{s.mute && muted > 0 ? (
					<g transform="translate(540 870)" opacity={muted}>
						<path d="M -46 -22 L -22 -22 L 6 -48 L 6 48 L -22 22 L -46 22 Z" fill="#ffffff" style={{filter: 'drop-shadow(0 0 12px #ffffff88)'}} />
						<path d="M 26 -22 L 66 18 M 66 -22 L 26 18" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
					</g>
				) : null}
				<text x={540} y={1170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} letterSpacing={6} fill="#ffffff">
					{s.center ?? 'TY'}
				</text>
			</Svg>
			{caption(s.caption, s.mute ? muteAt + 6 : MT.itemFirst + n * MT.itemEvery + 6, 1270, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

/* ---------- spotlight: jen ty ---------- */
export type SpotlightScene = {type: 'spotlight'; dur: number; title: string; sub?: string; caption?: string; foot?: string};
export const Spotlight: React.FC<{s: SpotlightScene}> = ({s}) => {
	const f = useCurrentFrame();
	const cone = prog(f, 12, 20);
	return (
		<AbsoluteFill>
			<Title text={s.title} sub={s.sub} top={420} size={92} />
			<Svg>
				<defs>
					<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#ffffff" stopOpacity={0.05} />
						<stop offset="1" stopColor="#ffffff" stopOpacity={0.28} />
					</linearGradient>
				</defs>
				{Array.from({length: 14}).map((_, i) => {
					const x = 140 + ((i * 197) % 800);
					const y = 760 + ((i * 131) % 520);
					if (Math.abs(x - 540) < 170 && y > 820) return null;
					return (
						<g key={i} opacity={0.18 * (1 - cone * 0.4)}>
							<Person x={x} y={y} s={0.55} color={GRAY} glowOn={false} />
						</g>
					);
				})}
				<path d={`M 505 760 L 575 760 L ${700} 1210 L ${380} 1210 Z`} fill="url(#cone)" opacity={cone} />
				<ellipse cx={540} cy={1212} rx={170} ry={26} fill="#ffffff" opacity={0.2 * cone} />
				<rect x={490} y={740} width={100} height={22} rx={8} fill="#cfcfcf" opacity={cone} />
				<Person x={540} y={1205} s={1.5} color="#ffffff" glowOn={cone > 0.5} />
			</Svg>
			{caption(s.caption, 34, 1290, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

/* ---------- shield: názory se odrazí ---------- */
export type ShieldScene = {type: 'shield'; dur: number; kicker?: string; words: string[]; caption?: string; foot?: string};
export const Shield: React.FC<{s: ShieldScene}> = ({s}) => {
	const f = useCurrentFrame();
	const ring = prog(f, 6, 18, Easing.inOut(Easing.cubic));
	const R = 200;
	const cx = 540;
	const cy = 1080;
	return (
		<AbsoluteFill>
			<Kicker text={s.kicker} />
			<Svg>
				<circle cx={cx} cy={cy} r={R} fill="none" stroke="#ffffff" strokeWidth={5} strokeDasharray={`${2 * Math.PI * R * ring} 9999`} transform={`rotate(-90 ${cx} ${cy})`} style={{filter: 'drop-shadow(0 0 14px #ffffff66)'}} />
				<Person x={cx} y={cy + 60} s={1.3} color="#ffffff" />
				{s.words.map((w, i) => {
					const st = MT.itemFirst + i * MT.itemEvery;
					const k = f - st;
					if (k < 0) return null;
					const a = (-150 + i * (300 / Math.max(1, s.words.length - 1)) + (i % 2 ? 180 : 0)) * (Math.PI / 180);
					const fly = interpolate(k, [0, MT.shieldFly], [620, R + 70], {...clamp, easing: Easing.in(Easing.quad)});
					const back = k > MT.shieldFly ? interpolate(k, [MT.shieldFly, MT.shieldFly + 20], [0, 160], {...clamp, easing: Easing.out(Easing.cubic)}) : 0;
					const r = fly + back;
					const o = interpolate(k, [0, 6, MT.shieldFly + 10, MT.shieldFly + 24], [0, 1, 0.8, 0.25], clamp);
					return <Bubble key={i} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r * 0.85} text={w} o={o} s={0.9} />;
				})}
			</Svg>
			{caption(s.caption, MT.itemFirst + s.words.length * MT.itemEvery + 10, 1340, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

/* ---------- arrows: všichni radí, ty jdeš svou cestou ---------- */
export type ArrowsScene = {type: 'arrows'; dur: number; kicker?: string; label: string; caption?: string; foot?: string};
const arrowPath = (x1: number, y1: number, x2: number, y2: number, head = 18) => {
	const a = Math.atan2(y2 - y1, x2 - x1);
	const h1 = `${x2 - head * Math.cos(a - 0.45)},${y2 - head * Math.sin(a - 0.45)}`;
	const h2 = `${x2 - head * Math.cos(a + 0.45)},${y2 - head * Math.sin(a + 0.45)}`;
	return `M ${x1} ${y1} L ${x2} ${y2} M ${h1} L ${x2} ${y2} L ${h2}`;
};
export const Arrows: React.FC<{s: ArrowsScene}> = ({s}) => {
	const f = useCurrentFrame();
	const px = 400;
	const py = 1060;
	const main = prog(f, MT.mainArrow, 18, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<Kicker text={s.kicker} />
			<Svg>
				{Array.from({length: 9}).map((_, i) => {
					const ang = (115 + i * 16) * (Math.PI / 180);
					const p = prog(f, 8 + i * 2, MT.arrowsLen - 10, Easing.out(Easing.cubic));
					const len = 120 + (i % 3) * 50;
					return <path key={i} d={arrowPath(px - 30, py - 40, px - 30 + Math.cos(ang) * len * p, py - 40 + Math.sin(ang) * len * p, 14)} stroke={GRAY} strokeWidth={3} fill="none" opacity={(1 - main * 0.5) * (p > 0.05 ? 1 : 0)} />;
				})}
				<Person x={px} y={py} s={1.2} color="#ffffff" />
				{main > 0 ? <path d={arrowPath(px + 50, py - 40, px + 50 + 420 * main, py - 40, 26)} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #ffffff88)'}} /> : null}
				<text x={px + 260} y={py + 20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing={7} fill={C.muted} opacity={prog(f, MT.mainArrow + 14, 12)}>
					{s.label}
				</text>
			</Svg>
			{caption(s.caption, MT.mainArrow + 26, 1290, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

/* ---------- countdown: přesýpací hodiny + kalendář ---------- */
export type CountdownScene = {type: 'countdown'; dur: number; kicker?: string; head?: string; from: number; to: number; caption?: string; foot?: string};
const Glass: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
	const sand = (f % 45) / 45;
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d="M -46 -70 L 46 -70 L 8 0 L 46 70 L -46 70 L -8 0 Z" fill="none" stroke="#e6e6e6" strokeWidth={5} strokeLinejoin="round" />
			<rect x={-56} y={-78} width={112} height={9} rx={4} fill="#e6e6e6" />
			<rect x={-56} y={69} width={112} height={9} rx={4} fill="#e6e6e6" />
			<path d={`M ${-36 * (1 - sand)} ${-60 + 58 * sand} L ${36 * (1 - sand)} ${-60 + 58 * sand} L 0 -4 Z`} fill="#bdbdbd" />
			<path d={`M -38 64 L 38 64 L ${38 - 30 * sand} ${64 - 48 * sand} L ${-38 + 30 * sand} ${64 - 48 * sand} Z`} fill="#bdbdbd" />
		</g>
	);
};
export const Countdown: React.FC<{s: CountdownScene}> = ({s}) => {
	const f = useCurrentFrame();
	const v = Math.round(interpolate(f, [MT.itemFirst, s.dur - 34], [s.from, s.to], {...clamp, easing: Easing.inOut(Easing.quad)}));
	const card = prog(f, 6, 14, Easing.out(Easing.back(1.6)));
	return (
		<AbsoluteFill>
			<Kicker text={s.kicker} />
			<Svg>
				<Glass x={290} y={1070} f={f} />
				<Glass x={790} y={1070} f={f + 20} />
				<g transform={`translate(540 1060) scale(${card})`}>
					<rect x={-120} y={-140} width={240} height={280} rx={22} fill="#0d0d0d" stroke="#ffffff" strokeWidth={5} style={{filter: 'drop-shadow(0 0 16px #ffffff55)'}} />
					<rect x={-120} y={-140} width={240} height={60} rx={22} fill="#ffffff" />
					<rect x={-120} y={-100} width={240} height={20} fill="#ffffff" />
					<text y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} letterSpacing={5} fill="#000000">
						{s.head ?? 'DEN'}
					</text>
					<text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill="#ffffff" style={{fontVariantNumeric: 'tabular-nums'}}>
						{v}
					</text>
				</g>
			</Svg>
			{caption(s.caption, s.dur - 30, 1290, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

/* ---------- progress: cesta k cíli ---------- */
export type ProgressScene = {type: 'progress'; dur: number; title: string; sub?: string; steps: string[]; goal: string; caption?: string; foot?: string};
export const Progress: React.FC<{s: ProgressScene}> = ({s}) => {
	const f = useCurrentFrame();
	const n = s.steps.length;
	const end = s.dur - 30;
	const p = interpolate(f, [MT.progressStart, end], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const x0 = 150;
	const x1 = 860;
	const px = x0 + (x1 - x0) * p;
	const reached = p >= 0.999;
	const bw = (x1 - x0 + 70) / n - 14;
	return (
		<AbsoluteFill>
			<Title text={s.title} sub={s.sub} top={420} size={88} />
			<Svg>
				<line x1={x0 - 30} y1={1150} x2={960} y2={1150} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} />
				{[0, 1, 2].map((k) => (
					<line key={k} x1={px - 70 - k * 18} y1={1100 + k * 14} x2={px - 30 - k * 18} y2={1100 + k * 14} stroke="#ffffff" strokeOpacity={0.35 * (p > 0 && !reached ? 1 : 0)} strokeWidth={3} />
				))}
				<Person x={px} y={1150} s={1.05} color="#ffffff" />
				<g transform={`translate(940 1040) scale(${reached ? 1 + 0.15 * Math.exp(-(f - end) / 6) : 0.9}) rotate(${f * 0.6})`} opacity={reached ? 1 : 0.55}>
					<path d="M 0 -50 L 14 -16 L 50 -14 L 22 9 L 31 45 L 0 25 L -31 45 L -22 9 L -50 -14 L -14 -16 Z" fill="#ffffff" style={reached ? {filter: 'drop-shadow(0 0 18px #ffffff)'} : {}} />
				</g>
				<text x={930} y={968} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={4} fill="#ffffff" opacity={0.85}>
					{s.goal}
				</text>
				{s.steps.map((st, i) => {
					const bx = x0 - 30 + i * (bw + 14);
					const fill = Math.max(0, Math.min(1, p * n - i));
					return (
						<g key={st}>
							<rect x={bx} y={1200} width={bw} height={30} rx={8} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2.5} />
							<rect x={bx + 4} y={1204} width={(bw - 8) * fill} height={22} rx={6} fill="#ffffff" />
							<text x={bx + bw / 2} y={1266} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} letterSpacing={2} fill={C.muted}>
								{st}
							</text>
						</g>
					);
				})}
			</Svg>
			{caption(s.caption, end + 4, 1330, f)}
			{s.foot ? <Footnote bottom={150} o={prog(f, 30, 12)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};


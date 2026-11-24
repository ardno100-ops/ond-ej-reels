import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT, prog} from '../theme';

/* STORY look – black & white line-art explainer told sentence by sentence:
   word-by-word captions at the bottom, one pictogram per sentence in the middle,
   small pill label on top, grey figures with a white glow on what matters, starfield background.
   Timing constants mirrored in scripts/story_audio.py (ST) – keep in sync. */

export const ST = {wordStart: 3, wordMax: 7, visIn: 2};

const W = '#f2f2f2';
const G = '#8d8d8d';
const DIM = '#4a4a4a';
const GROUND = 1000;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const wglow = (r = 22) => `drop-shadow(0 0 ${r}px rgba(255,255,255,0.75))`;

type IconK = 'phone' | 'nodes' | 'people' | 'chart' | 'clock' | 'dumbbell' | 'house' | 'globe' | 'book' | 'coin';
export type StoryVisual =
	| {k: 'lift'}
	| {k: 'checklist'; items: string[]}
	| {k: 'chart'; down?: boolean; flat?: boolean; label?: string}
	| {k: 'think'; mark?: string}
	| {k: 'week'; on: number[]; onLabel?: string; offLabel?: string}
	| {k: 'crosses'; items: string[]}
	| {k: 'clock'; label?: string}
	| {k: 'shrink'}
	| {k: 'big'; lines: {t: string; big?: boolean}[]}
	| {k: 'equation'; left: string; right: string}
	| {k: 'icons'; items: {icon: IconK; label: string}[]}
	| {k: 'doors'; n: number}
	| {k: 'future'; left?: string; right?: string}
	| {k: 'crowd'; n?: number; pick?: number}
	| {k: 'bell'}
	| {k: 'cta'; word: string; sub: string; foot?: string};

export type StoryBeat = {dur: number; say?: string; label?: string; v: StoryVisual};
export type StorySpec = {id: string; audio: string; debugSafe?: boolean; beats: StoryBeat[]};

/* ---------------- primitives ---------------- */
const Stars: React.FC = () => {
	const f = useCurrentFrame();
	const dots = React.useMemo(
		() =>
			Array.from({length: 140}).map((_, i) => {
				const a = Math.sin(i * 12.9898) * 43758.5453;
				const b = Math.sin(i * 78.233) * 12345.678;
				return {x: (a - Math.floor(a)) * 1080, y: (b - Math.floor(b)) * 1920, r: 0.8 + ((i * 37) % 10) / 9, p: i * 0.7};
			}),
		[],
	);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{dots.map((d, i) => (
				<circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={0.08 + 0.1 * (0.5 + 0.5 * Math.sin(f / 18 + d.p))} />
			))}
		</svg>
	);
};

const Person: React.FC<{x: number; y?: number; s?: number; lit?: boolean; o?: number}> = ({x, y = GROUND, s = 1, lit, o = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={lit ? {filter: wglow()} : undefined}>
		<circle cx={0} cy={-150} r={30} fill={lit ? W : G} />
		<path d="M -46 0 L -46 -70 Q -46 -108 0 -108 Q 46 -108 46 -70 L 46 0 Z" fill={lit ? W : G} />
	</g>
);

const Ground: React.FC<{o?: number}> = ({o = 1}) => <line x1={40} x2={1040} y1={GROUND} y2={GROUND} stroke={G} strokeWidth={2} opacity={0.6 * o} />;

const Pill: React.FC<{text: string}> = ({text}) => {
	const f = useCurrentFrame();
	const p = prog(f, 0, 10, Easing.out(Easing.back(2)));
	return (
		<div style={{position: 'absolute', top: 390, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{transform: `scale(${p})`, background: W, color: '#0a0a0a', borderRadius: 40, padding: '12px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 4}}>{text}</div>
		</div>
	);
};

/** Word-by-word caption; *word* = emphasis (glowing white), others light grey. */
const Caption: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	const every = Math.min(ST.wordMax, Math.max(3, Math.floor((dur * 0.62) / Math.max(1, words.length))));
	let emph = false;
	return (
		<div style={{position: 'absolute', top: 1110, left: 90, right: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.22}}>
			{words.map((w, i) => {
				const start = w.startsWith('*');
				if (start) emph = true;
				const isEm = emph;
				if (w.endsWith('*')) emph = false;
				const t = w.replace(/\*/g, '');
				const at = ST.wordStart + i * every;
				const p = prog(f, at, 5);
				if (p <= 0) return null;
				return (
					<span key={i} style={{display: 'inline-block', marginRight: 16, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, color: isEm ? W : '#cfcfcf', textShadow: isEm ? '0 0 22px rgba(255,255,255,0.7)' : 'none', fontSize: isEm ? 66 : 60}}>
						{t}
					</span>
				);
			})}
		</div>
	);
};

const Label: React.FC<{x: number; y: number; text: string; o?: number; lit?: boolean; size?: number}> = ({x, y, text, o = 1, lit, size = 26}) => (
	<text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} letterSpacing={4} fill={lit ? W : G} opacity={o}>
		{text}
	</text>
);

const Icon: React.FC<{k: IconK; x: number; y: number; lit?: boolean}> = ({k, x, y, lit}) => {
	const c = lit ? W : G;
	const sw = 6;
	const common = {fill: 'none', stroke: c, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return (
		<g transform={`translate(${x} ${y})`} style={lit ? {filter: wglow(14)} : undefined}>
			{k === 'phone' && (
				<>
					<rect x={-30} y={-52} width={60} height={104} rx={12} {...common} />
					<line x1={-10} y1={38} x2={10} y2={38} {...common} />
				</>
			)}
			{k === 'nodes' && (
				<>
					<line x1={-40} y1={30} x2={0} y2={-30} {...common} />
					<line x1={40} y1={30} x2={0} y2={-30} {...common} />
					<line x1={-40} y1={30} x2={40} y2={30} {...common} />
					{[[-40, 30], [40, 30], [0, -30]].map(([a, b], i) => (
						<circle key={i} cx={a} cy={b} r={14} fill={c} />
					))}
				</>
			)}
			{k === 'people' && (
				<>
					<circle cx={-26} cy={-22} r={14} fill={c} />
					<circle cx={26} cy={-22} r={14} fill={c} />
					<path d="M -50 40 Q -50 0 -26 0 Q -2 0 -2 40 Z" fill={c} />
					<path d="M 2 40 Q 2 0 26 0 Q 50 0 50 40 Z" fill={c} />
				</>
			)}
			{k === 'chart' && <polyline points="-50,40 -20,10 5,22 50,-40" {...common} />}
			{k === 'clock' && (
				<>
					<circle r={46} {...common} />
					<line x1={0} y1={0} x2={0} y2={-28} {...common} />
					<line x1={0} y1={0} x2={20} y2={8} {...common} />
				</>
			)}
			{k === 'dumbbell' && (
				<>
					<line x1={-40} y1={0} x2={40} y2={0} {...common} />
					<rect x={-58} y={-26} width={16} height={52} rx={4} fill={c} />
					<rect x={42} y={-26} width={16} height={52} rx={4} fill={c} />
				</>
			)}
			{k === 'house' && <path d="M -50 40 L -50 -6 L 0 -46 L 50 -6 L 50 40 Z" {...common} />}
			{k === 'globe' && (
				<>
					<circle r={46} {...common} />
					<ellipse rx={20} ry={46} {...common} />
					<line x1={-46} y1={0} x2={46} y2={0} {...common} />
				</>
			)}
			{k === 'book' && <path d="M -48 -36 L 0 -24 L 48 -36 L 48 36 L 0 48 L -48 36 Z M 0 -24 L 0 48" {...common} />}
			{k === 'coin' && (
				<>
					<circle r={44} {...common} />
					<text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={c}>
						Kč
					</text>
				</>
			)}
		</g>
	);
};

/* ---------------- visuals ---------------- */
const Visual: React.FC<{v: StoryVisual; dur: number}> = ({v, dur}) => {
	const f = useCurrentFrame();
	const appear = prog(f, ST.visIn, 12);
	switch (v.k) {
		case 'lift': {
			const rep = Math.max(0, Math.floor((f - 6) / 18));
			const ph = Math.max(0, f - 6) % 18;
			const up = ph < 9 ? interpolate(ph, [0, 9], [0, 1], {easing: Easing.out(Easing.cubic)}) : interpolate(ph, [9, 18], [1, 0], {easing: Easing.in(Easing.quad)});
			const barY = 860 - up * 130;
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<Person x={540} lit />
					<line x1={500} y1={barY + 40} x2={500} y2={870} stroke={W} strokeWidth={14} strokeLinecap="round" />
					<line x1={580} y1={barY + 40} x2={580} y2={870} stroke={W} strokeWidth={14} strokeLinecap="round" />
					<line x1={360} y1={barY} x2={720} y2={barY} stroke={W} strokeWidth={10} strokeLinecap="round" />
					<rect x={340} y={barY - 50} width={30} height={100} rx={6} fill={W} />
					<rect x={710} y={barY - 50} width={30} height={100} rx={6} fill={W} />
					<Label x={540} y={590} text={`REP ${Math.min(rep + 1, 9)}`} lit size={34} />
				</svg>
			);
		}
		case 'checklist':
			return (
				<div style={{position: 'absolute', top: 560, left: 250, right: 200, opacity: appear}}>
					{v.items.map((t, i) => {
						const p = prog(f, 10 + i * 12, 8, Easing.out(Easing.back(2)));
						return (
							<div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 46}}>
								<div style={{width: 74, height: 74, borderRadius: 14, border: `5px solid ${p > 0 ? W : G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: p > 0 ? '0 0 24px rgba(255,255,255,0.5)' : 'none'}}>
									<svg width={46} height={46} viewBox="0 0 46 46">
										<path d="M 8 24 L 19 35 L 39 11" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} />
									</svg>
								</div>
								<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: 3, color: p > 0 ? W : G}}>{t}</div>
							</div>
						);
					})}
				</div>
			);
		case 'chart': {
			const p = prog(f, 6, Math.max(20, dur - 30), Easing.inOut(Easing.cubic));
			const pts = Array.from({length: 30}).map((_, i) => {
				const t = (i / 29) * p;
				const x = 160 + t * 760;
				const base = v.flat ? 0.45 - Math.min(t, 0.3) * 0.6 : v.down ? 0.15 + t * 0.85 : 1 - t * 0.85;
				const y = 980 - (1 - base) * 380 + Math.sin(t * 18) * 14;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			});
			const last = pts[pts.length - 1].split(',').map(Number);
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<line x1={160} y1={990} x2={940} y2={990} stroke={G} strokeWidth={3} />
					<line x1={160} y1={560} x2={160} y2={990} stroke={G} strokeWidth={3} />
					<polyline points={pts.join(' ')} fill="none" stroke={W} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" style={{filter: wglow(14)}} />
					<circle cx={last[0]} cy={last[1]} r={14} fill={W} style={{filter: wglow()}} />
					{v.label ? <Label x={last[0]} y={last[1] - 34} text={v.label} lit size={30} o={prog(f, dur - 30, 8)} /> : null}
				</svg>
			);
		}
		case 'think': {
			const b1 = prog(f, 8, 6);
			const b2 = prog(f, 14, 6);
			const q = prog(f, 20, 8, Easing.out(Easing.back(2.5)));
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<Person x={540} />
					<circle cx={600} cy={790} r={10} fill="none" stroke={G} strokeWidth={4} opacity={b1} />
					<circle cx={630} cy={750} r={16} fill="none" stroke={G} strokeWidth={4} opacity={b2} />
					<text x={690} y={720} fontFamily={FONT} fontWeight={900} fontSize={130} fill={W} transform={`translate(690 680) scale(${q}) translate(-690 -680)`} style={{filter: wglow()}}>
						{v.mark ?? '?'}
					</text>
				</svg>
			);
		}
		case 'week': {
			const days = ['PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO', 'NE'];
			return (
				<div style={{position: 'absolute', top: 640, left: 40, right: 40, display: 'flex', gap: 12, justifyContent: 'center', opacity: appear}}>
					{days.map((d, i) => {
						const on = v.on.includes(i);
						const p = prog(f, 6 + i * 4, 8);
						return (
							<div key={d} style={{width: 104, height: 170, borderRadius: 16, border: `4px solid ${on ? W : DIM}`, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', boxShadow: on ? '0 0 26px rgba(255,255,255,0.45)' : 'none'}}>
								<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: on ? W : G}}>{d}</div>
								<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 24, color: on ? W : DIM, letterSpacing: 1}}>{on ? (v.onLabel ?? '✓') : (v.offLabel ?? '–')}</div>
							</div>
						);
					})}
				</div>
			);
		}
		case 'crosses':
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					{v.items.map((t, i) => {
						const x = 230 + i * 310;
						const p = prog(f, 8 + i * 14, 8);
						const xp = prog(f, 14 + i * 14, 6);
						return (
							<g key={t} opacity={p}>
								<rect x={x - 110} y={640} width={220} height={220} rx={24} fill="none" stroke={G} strokeWidth={5} />
								<Label x={x} y={910} text={t} size={30} />
								<path d={`M ${x - 80} 670 L ${x + 80} 830 M ${x + 80} 670 L ${x - 80} 830`} stroke={W} strokeWidth={10} strokeLinecap="round" strokeDasharray={460} strokeDashoffset={460 * (1 - xp)} style={{filter: wglow(10)}} />
							</g>
						);
					})}
				</svg>
			);
		case 'clock': {
			const ang = f * 14;
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<rect x={370} y={860} width={340} height={14} rx={6} fill={G} />
					<rect x={560} y={760} width={120} height={84} rx={8} fill="none" stroke={G} strokeWidth={5} />
					<Person x={460} y={1000} s={0.85} />
					<g transform="translate(800 620)">
						<circle r={70} fill="none" stroke={W} strokeWidth={6} style={{filter: wglow(10)}} />
						<line x1={0} y1={0} x2={0} y2={-48} stroke={W} strokeWidth={6} strokeLinecap="round" transform={`rotate(${ang})`} />
						<line x1={0} y1={0} x2={30} y2={0} stroke={W} strokeWidth={6} strokeLinecap="round" transform={`rotate(${ang / 12})`} />
					</g>
					{v.label ? <Label x={800} y={740} text={v.label} lit /> : null}
				</svg>
			);
		}
		case 'shrink': {
			const s = interpolate(f, [8, dur - 10], [1.15, 0.45], {...clamp, easing: Easing.inOut(Easing.cubic)});
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<Person x={540} s={s} />
					<Label x={540} y={1050} text="PROGRES: 0" size={30} />
				</svg>
			);
		}
		case 'big':
			return (
				<div style={{position: 'absolute', top: 640, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
					{v.lines.map((l, i) => {
						const at = 4 + i * 12;
						if (f < at) return null;
						const k = f - at;
						const s = interpolate(k, [0, 5, 9], [1.7, 0.95, 1], clamp);
						return (
							<div key={i} style={{fontSize: l.big ? 150 : 76, lineHeight: 1.08, color: W, transform: `scale(${s})`, opacity: interpolate(k, [0, 3], [0, 1], clamp), textShadow: l.big ? '0 0 40px rgba(255,255,255,0.6)' : '0 0 18px rgba(255,255,255,0.35)'}}>
								{l.t}
							</div>
						);
					})}
				</div>
			);
		case 'equation': {
			const l = v.left.slice(0, Math.floor(prog(f, 6, 18, Easing.linear) * v.left.length));
			const eq = prog(f, 26, 6);
			const r = v.right.slice(0, Math.floor(prog(f, 32, 18, Easing.linear) * v.right.length));
			return (
				<div style={{position: 'absolute', top: 620, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
					<div style={{fontSize: 74, color: G, letterSpacing: 3, minHeight: 90}}>{l}</div>
					<div style={{fontSize: 90, color: W, opacity: eq}}>=</div>
					<div style={{fontSize: 84, color: W, letterSpacing: 3, minHeight: 100, textShadow: '0 0 30px rgba(255,255,255,0.6)'}}>{r}</div>
				</div>
			);
		}
		case 'icons':
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					{v.items.map((it, i) => {
						const n = v.items.length;
						const x = 540 + (i - (n - 1) / 2) * 290;
						const p = prog(f, 6 + i * 14, 8, Easing.out(Easing.back(2)));
						return (
							<g key={it.label} opacity={p} transform={`translate(${x} 760) scale(${0.6 + 0.4 * p}) translate(${-x} -760)`}>
								<circle cx={x} cy={760} r={110} fill="none" stroke={W} strokeWidth={4} opacity={0.5} />
								<Icon k={it.icon} x={x} y={760} lit />
								<Label x={x} y={930} text={it.label} lit size={30} />
							</g>
						);
					})}
				</svg>
			);
		case 'doors': {
			const n = v.n;
			const gap = 880 / n;
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					{Array.from({length: n}).map((_, i) => {
						const x = 100 + i * gap + gap / 2;
						const last = i === n - 1;
						const p = prog(f, 4 + i * 3, 8);
						return (
							<g key={i} opacity={p} style={last ? {filter: wglow()} : undefined}>
								<rect x={x - gap * 0.34} y={820} width={gap * 0.68} height={180} fill="none" stroke={last ? W : G} strokeWidth={5} />
								<circle cx={x + gap * 0.2} cy={915} r={5} fill={last ? W : G} />
								<Label x={x} y={800} text={String(i + 1)} lit={last} />
							</g>
						);
					})}
					<Person x={100 + gap / 2} s={0.55} />
					<Label x={100 + gap / 2} y={1040} text="TY" />
				</svg>
			);
		}
		case 'future': {
			const p2 = prog(f, 14, 14);
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<Person x={340} />
					<Label x={340} y={1050} text={v.left ?? 'TY DNES'} />
					<g opacity={p2}>
						<Person x={740} s={1.15} lit />
						<Label x={740} y={1050} text={v.right ?? 'TY ZA ROK'} lit />
					</g>
				</svg>
			);
		}
		case 'crowd': {
			const n = v.n ?? 9;
			const pick = v.pick ?? 4;
			const step = prog(f, 20, 24, Easing.inOut(Easing.cubic));
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					{Array.from({length: n}).map((_, i) => {
						const x = 110 + i * (860 / (n - 1));
						const me = i === pick;
						return <Person key={i} x={x} y={me ? GROUND - step * 0 : GROUND} s={me ? 0.62 + step * 0.25 : 0.55} lit={me && step > 0.05} o={me ? 1 : 1 - step * 0.5} />;
					})}
				</svg>
			);
		}
		case 'bell': {
			const p = prog(f, 4, 26, Easing.inOut(Easing.cubic));
			const pts = Array.from({length: 60}).map((_, i) => {
				const t = (i / 59) * p;
				const x = 120 + t * 840;
				const z = (t - 0.5) / 0.14;
				const y = 1000 - Math.exp(-0.5 * z * z) * 380;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			});
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear}}>
					<Ground />
					<polyline points={pts.join(' ')} fill="none" stroke={W} strokeWidth={6} />
					<g opacity={prog(f, 30, 8)}>
						<Person x={540} y={640} s={0.4} lit />
						<Label x={540} y={1050} text="PRŮMĚR" />
					</g>
				</svg>
			);
		}
		case 'cta': {
			const w = prog(f, 14, 8, Easing.out(Easing.back(2.2)));
			const typed = v.word.slice(0, Math.max(0, Math.min(v.word.length, Math.floor((f - 34) / 4) + 1)));
			const sent = f > 34 + v.word.length * 4 + 10;
			return (
				<div style={{position: 'absolute', top: 470, left: 60, right: 60, textAlign: 'center', fontFamily: FONT}}>
					<div style={{fontWeight: 800, fontSize: 46, letterSpacing: 4, color: G, opacity: prog(f, 0, 8)}}>NAPIŠ DO KOMENTÁŘE</div>
					<div style={{marginTop: 20, fontWeight: 900, fontSize: v.word.length > 6 ? 150 : 190, color: W, transform: `scale(${w})`, textShadow: '0 0 50px rgba(255,255,255,0.7)'}}>{v.word}</div>
					<div style={{margin: '50px 40px 0', display: 'flex', alignItems: 'center', gap: 22, padding: '24px 30px', borderRadius: 999, border: `3px solid ${sent ? W : DIM}`, opacity: prog(f, 24, 8), boxShadow: sent ? '0 0 30px rgba(255,255,255,0.4)' : 'none'}}>
						<div style={{width: 60, height: 60, borderRadius: 30, background: G}} />
						<div style={{flex: 1, textAlign: 'left', fontWeight: 800, fontSize: 44, color: f >= 34 ? W : DIM}}>{f >= 34 ? typed : 'Přidat komentář…'}</div>
						<div style={{fontWeight: 900, fontSize: 34, color: W}}>{sent ? '✓' : '↑'}</div>
					</div>
					<div style={{marginTop: 40, fontWeight: 700, fontSize: 38, color: '#d0d0d0', opacity: prog(f, 60, 10)}}>{v.sub}</div>
					{v.foot ? <div style={{position: 'absolute', top: 800, left: 60, right: 60, fontWeight: 500, fontSize: 22, color: G, opacity: prog(f, 70, 10)}}>{v.foot}</div> : null}
				</div>
			);
		}
		default:
			return null;
	}
};

const BeatView: React.FC<{b: StoryBeat; last: boolean}> = ({b, last}) => {
	const f = useCurrentFrame();
	const fadeOut = last ? 1 : interpolate(f, [b.dur - 4, b.dur], [1, 0], clamp);
	const showCaption = b.say && b.v.k !== 'big' && b.v.k !== 'cta';
	return (
		<AbsoluteFill style={{opacity: fadeOut}}>
			{b.label ? <Pill text={b.label} /> : null}
			<Visual v={b.v} dur={b.dur} />
			{showCaption ? <Caption text={b.say!} dur={b.dur} /> : null}
		</AbsoluteFill>
	);
};

export const StoryReel: React.FC<StorySpec> = ({beats, audio, debugSafe}) => {
	let from = 0;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, #1a1a1a 0%, #070707 70%)'}}>
			<Stars />
			{beats.map((b, i) => {
				const el = (
					<Sequence key={i} from={from} durationInFrames={b.dur} name={`${i + 1}. ${b.v.k}`}>
						<BeatView b={b} last={i === beats.length - 1} />
					</Sequence>
				);
				from += b.dur;
				return el;
			})}
			<Img src={staticFile('brand/logo.png')} style={{position: 'absolute', top: 280, right: 70, width: 90, height: 90, borderRadius: 45, filter: 'grayscale(1) brightness(1.3)', opacity: 0.9}} />
			{debugSafe ? (
				<AbsoluteFill style={{pointerEvents: 'none'}}>
					<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 250, background: 'rgba(255,0,80,0.28)'}} />
					<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 560, background: 'rgba(255,0,80,0.28)'}} />
					<div style={{position: 'absolute', top: 1000, right: 0, width: 130, bottom: 560, background: 'rgba(255,0,80,0.28)'}} />
				</AbsoluteFill>
			) : null}
			{audio ? <Audio src={staticFile(audio)} /> : null}
		</AbsoluteFill>
	);
};

export const calcStoryMeta: CalculateMetadataFunction<StorySpec> = ({props}) => ({durationInFrames: Math.max(30, props.beats.reduce((a, b) => a + b.dur, 0))});

export const STORY_DEFAULT: StorySpec = {id: 'ukazka', audio: '', beats: [{dur: 72, say: 'Do fitka chodíš *4× týdně.*', label: 'TY', v: {k: 'lift'}}]};

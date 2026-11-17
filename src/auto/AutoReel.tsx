import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background, Footnote, SceneFade} from '../components';
import {Flash, Shake, Slam} from '../nabor/reel';
import {PunchIn} from '../pecka/scenes';
import {C, FONT, fmt, glow, prog} from '../theme';
import {MonoCtx} from '../style';
import {Arrows, ArrowsScene, Bubbles, BubblesScene, Countdown, CountdownScene, Progress, ProgressScene, Shield, ShieldScene, Spotlight, SpotlightScene} from './monoScenes';

/* =====================================================================
   Data-driven reel. A spec (JSON) describes scenes; this renders them.
   Timing constants below are mirrored in scripts/auto_audio.py – keep in sync.
   ===================================================================== */

export const T = {
	itemFirst: 16,
	itemEvery: 16,
	counterStart: 18,
	counterLen: 40,
	afterCounter: 66,
	ctaWord: 18,
	ctaBox: 28,
	ctaType: 40,
	ctaTypeEvery: 5,
	ctaSend: 72,
	slamEvery: 8,
};

type Tone = 'white' | 'accent' | 'red' | 'muted';
type Line = {t: string; size?: number; tone?: Tone};
export type AutoScene =
	| {type: 'slam'; dur: number; emoji?: string; lines: Line[]; foot?: string}
	| {type: 'counter'; dur: number; kicker?: string; value: number; prefix?: string; suffix?: string; label: string; after?: Line[]; tone?: Tone; foot?: string}
	| {type: 'list'; dur: number; title: string; title2?: string; items: string[]; mark?: 'check' | 'x'; foot?: string}
	| {type: 'compare'; dur: number; title: string; left: {head: string; items: string[]}; right: {head: string; items: string[]}; foot?: string}
	| {type: 'bars'; dur: number; title: string; bars: {label: string; value: number; display: string}[]; foot?: string}
	| {type: 'cta'; dur: number; pre: string; word: string; sub: string; foot?: string}
	| BubblesScene
	| SpotlightScene
	| ShieldScene
	| ArrowsScene
	| CountdownScene
	| ProgressScene;

/** style: 'glow' = zelený glow (default), 'mono' = černobílý minimalistický styl. */
export type AutoSpec = {id: string; audio: string; style?: 'glow' | 'mono'; scenes: AutoScene[]};

const RED = '#ff8a7a';
const toneColor = (t?: Tone) => (t === 'accent' ? C.accent : t === 'red' ? RED : t === 'muted' ? C.muted : C.white);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Lines: React.FC<{lines: Line[]; start: number; top: number}> = ({lines, start, top}) => (
	<div style={{position: 'absolute', top, left: 50, right: 50, textAlign: 'center'}}>
		{lines.map((l, i) => (
			<Slam key={i} at={start + i * T.slamEvery} size={l.size ?? 90} color={toneColor(l.tone)}>
				{l.t}
			</Slam>
		))}
	</div>
);

/* ---------- scene renderers ---------- */
/** `instant`: hook scene – full text visible already on frame 0 (strong first frame / cover, lower skip rate). */
const SlamScene: React.FC<{s: Extract<AutoScene, {type: 'slam'}>; instant?: boolean}> = ({s, instant}) => {
	const f = useCurrentFrame();
	const hits = s.lines.map((_, i) => i * T.slamEvery);
	return (
		<Shake hits={[0]}>
			<AbsoluteFill>
				{s.emoji ? (
					<div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontSize: 300, transform: `scale(${instant ? 1 + 0.04 * Math.sin(f / 3) : interpolate(f, [0, 6], [1.4, 1], clamp)}) rotate(${Math.sin(f / 4) * 4}deg)`}}>{s.emoji}</div>
				) : null}
				<Lines lines={s.lines} start={instant ? -40 : 0} top={s.emoji ? 820 : 560} />
				{s.foot ? <Footnote bottom={150} o={prog(f, 20, 10)}>{s.foot}</Footnote> : null}
			</AbsoluteFill>
			<Flash at={hits.slice(1, 2)} />
		</Shake>
	);
};

const CounterScene: React.FC<{s: Extract<AutoScene, {type: 'counter'}>}> = ({s}) => {
	const f = useCurrentFrame();
	const v = interpolate(f, [T.counterStart, T.counterStart + T.counterLen], [0, s.value], {...clamp, easing: Easing.out(Easing.cubic)});
	const decimals = Math.abs(s.value % 1) > 0 ? 1 : 0;
	const shown = decimals ? v.toFixed(1).replace('.', ',') : fmt(v);
	const col = toneColor(s.tone ?? 'accent');
	return (
		<Shake hits={[T.afterCounter]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				{s.kicker ? (
					<div style={{position: 'absolute', top: 300, left: 50, right: 50}}>
						<Slam at={0} size={60}>
							{s.kicker}
						</Slam>
					</div>
				) : null}
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, fontFamily: FONT, opacity: prog(f, T.counterStart, 6)}}>
					<div style={{fontSize: 180, fontWeight: 900, color: col, textShadow: glow(col, 32), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
						{s.prefix ?? ''}
						{shown}
						{s.suffix ?? ''}
					</div>
					<div style={{fontSize: 38, fontWeight: 800, letterSpacing: 3, color: C.white, marginTop: 20, padding: '0 70px', lineHeight: 1.3}}>{s.label}</div>
				</div>
				{s.after ? <Lines lines={s.after} start={T.afterCounter} top={1150} /> : null}
				{s.foot ? <Footnote bottom={150} o={prog(f, T.counterStart + 10, 10)}>{s.foot}</Footnote> : null}
			</AbsoluteFill>
			<Flash at={s.after ? [T.afterCounter] : []} />
		</Shake>
	);
};

const Mark: React.FC<{x: boolean; active: boolean}> = ({x, active}) => (
	<div style={{width: 58, height: 58, borderRadius: 29, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? (x ? RED : C.accent) : x ? 'rgba(255,138,122,0.15)' : 'rgba(197,242,155,0.15)', boxShadow: active ? `0 0 22px ${x ? RED : C.accent}` : 'none'}}>
		<svg width={30} height={30} viewBox="0 0 34 34">
			{x ? (
				<path d="M 10 10 L 24 24 M 24 10 L 10 24" stroke={active ? C.dark : RED} strokeWidth={5} strokeLinecap="round" />
			) : (
				<path d="M 7 17.5 L 14 24.5 L 27 10" fill="none" stroke={active ? C.dark : C.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
			)}
		</svg>
	</div>
);

const ListScene: React.FC<{s: Extract<AutoScene, {type: 'list'}>}> = ({s}) => {
	const f = useCurrentFrame();
	const cur = Math.min(s.items.length - 1, Math.floor((f - T.itemFirst) / T.itemEvery));
	const x = s.mark === 'x';
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 250, left: 40, right: 40, textAlign: 'center'}}>
				<Slam at={0} size={s.title2 ? 60 : 96} color={s.title2 ? C.white : C.accent}>
					{s.title}
				</Slam>
				{s.title2 ? (
					<Slam at={4} size={96} color={x ? RED : C.accent}>
						{s.title2}
					</Slam>
				) : null}
			</div>
			<div style={{position: 'absolute', top: 650, left: 80, right: 60}}>
				{s.items.map((t, i) => {
					const p = prog(f, T.itemFirst + i * T.itemEvery, 7, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					const active = i === cur;
					return (
						<div key={t} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34, transform: `translateX(${(1 - p) * -60}px) scale(${active ? 1.04 : 1})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.3)}}>
							<Mark x={x} active={active} />
							<div style={{fontFamily: FONT, fontWeight: 900, fontSize: active ? 48 : 42, lineHeight: 1.12, color: active ? C.white : 'rgba(241,247,236,0.78)', textShadow: active ? glow(C.white, 14) : 'none'}}>{t}</div>
						</div>
					);
				})}
			</div>
			{s.foot ? <Footnote bottom={150} o={prog(f, T.itemFirst + s.items.length * T.itemEvery, 10)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

const CompareScene: React.FC<{s: Extract<AutoScene, {type: 'compare'}>}> = ({s}) => {
	const f = useCurrentFrame();
	const col = (side: 'left' | 'right') => {
		const d = s[side];
		const isL = side === 'left';
		const color = isL ? RED : C.accent;
		return (
			<div style={{flex: 1, padding: '0 18px'}}>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color, textShadow: glow(color, 16), textAlign: 'center', marginBottom: 34, opacity: prog(f, isL ? 8 : 14, 8)}}>{d.head}</div>
				{d.items.map((t, i) => {
					const p = prog(f, T.itemFirst + i * T.itemEvery + (isL ? 0 : 8), 8, Easing.out(Easing.back(2)));
					return (
						<div key={t} style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, lineHeight: 1.2, color: isL ? 'rgba(241,247,236,0.6)' : C.white, textAlign: 'center', marginBottom: 30, transform: `scale(${p})`, opacity: p > 0 ? 1 : 0}}>
							{isL ? '✕ ' : '✓ '}
							{t}
						</div>
					);
				})}
			</div>
		);
	};
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 260, left: 40, right: 40, textAlign: 'center'}}>
				<Slam at={0} size={84} color={C.accent}>
					{s.title}
				</Slam>
			</div>
			<div style={{position: 'absolute', top: 640, left: 40, right: 40, display: 'flex'}}>
				{col('left')}
				<div style={{width: 3, background: C.faint, alignSelf: 'stretch'}} />
				{col('right')}
			</div>
			{s.foot ? <Footnote bottom={150} o={prog(f, 40, 10)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

const BarsScene: React.FC<{s: Extract<AutoScene, {type: 'bars'}>}> = ({s}) => {
	const f = useCurrentFrame();
	const max = Math.max(...s.bars.map((b) => b.value));
	const n = s.bars.length;
	const w = Math.min(220, 760 / n - 30);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 260, left: 40, right: 40, textAlign: 'center'}}>
				<Slam at={0} size={80} color={C.accent}>
					{s.title}
				</Slam>
			</div>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
				<line x1={120} y1={1480} x2={960} y2={1480} stroke={C.white} strokeOpacity={0.5} strokeWidth={4} />
				{s.bars.map((b, i) => {
					const p = prog(f, T.itemFirst + i * T.itemEvery, 26, Easing.out(Easing.cubic));
					const h = (b.value / max) * 640 * p;
					const cx = 120 + (840 / n) * (i + 0.5);
					const last = i === n - 1;
					const color = last ? C.accent : i === 0 ? C.gray : C.white;
					return (
						<g key={b.label}>
							<rect x={cx - w / 2} y={1480 - h} width={w} height={h} rx={14} fill={color} style={last ? {filter: `drop-shadow(0 0 18px ${C.accent})`} : {}} />
							<text x={cx} y={1480 - h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={color} opacity={p}>
								{b.display}
							</text>
							<text x={cx} y={1530} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing={2} fill={C.muted}>
								{b.label}
							</text>
						</g>
					);
				})}
			</svg>
			{s.foot ? <Footnote bottom={150} o={prog(f, 40, 10)}>{s.foot}</Footnote> : null}
		</AbsoluteFill>
	);
};

const CtaScene: React.FC<{s: Extract<AutoScene, {type: 'cta'}>}> = ({s}) => {
	const f = useCurrentFrame();
	const word = s.word.toUpperCase();
	const typed = Math.max(0, Math.min(word.length, Math.floor((f - T.ctaType) / T.ctaTypeEvery) + 1));
	const sent = f >= T.ctaSend;
	const box = prog(f, T.ctaBox, 10, Easing.out(Easing.back(2)));
	return (
		<Shake hits={[T.ctaWord]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 230, left: 40, right: 40}}>
					<Slam at={0} size={s.pre.length > 22 ? 46 : 54}>
						{s.pre}
					</Slam>
					<Slam at={6} size={50} style={{marginTop: 22}} color={C.muted}>
						NAPIŠ DO KOMENTÁŘE
					</Slam>
					<Slam at={T.ctaWord} size={word.length > 6 ? 170 : 230} color={C.accent} style={{marginTop: 36}}>
						{word}
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 960, left: 90, right: 90, transform: `scale(${box})`, opacity: box > 0 ? 1 : 0}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 999, border: `3px solid ${sent ? C.accent : C.faint}`, background: 'rgba(241,247,236,0.05)', boxShadow: sent ? `0 0 30px ${C.accent}66` : 'none'}}>
						<div style={{width: 64, height: 64, borderRadius: 32, background: `conic-gradient(${C.accent}, #f5d36b, #ff7a7a, ${C.accent})`, flexShrink: 0}} />
						<div style={{flex: 1, textAlign: 'left', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: f >= T.ctaType ? C.white : C.muted}}>
							{f >= T.ctaType ? word.slice(0, typed) : 'Přidat komentář…'}
						</div>
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.accent}}>{sent ? '✓' : 'ODESLAT'}</div>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1180, left: 80, right: 80, opacity: prog(f, T.ctaSend + 8, 10), fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: 1.4, color: C.white}}>{s.sub}</div>
				{s.foot ? <Footnote bottom={230} o={prog(f, T.ctaSend + 16, 12)}>{s.foot}</Footnote> : null}
				<div style={{position: 'absolute', bottom: 150, left: 0, right: 0, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: C.white, opacity: prog(f, T.ctaSend + 16, 12)}}>
					ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
				</div>
			</AbsoluteFill>
			<Flash at={[T.ctaWord]} />
		</Shake>
	);
};

const SceneSwitch: React.FC<{s: AutoScene; first?: boolean}> = ({s, first}) => {
	switch (s.type) {
		case 'slam':
			return <SlamScene s={s} instant={first} />;
		case 'counter':
			return <CounterScene s={s} />;
		case 'list':
			return <ListScene s={s} />;
		case 'compare':
			return <CompareScene s={s} />;
		case 'bars':
			return <BarsScene s={s} />;
		case 'cta':
			return <CtaScene s={s} />;
		case 'bubbles':
			return <Bubbles s={s} />;
		case 'spotlight':
			return <Spotlight s={s} />;
		case 'shield':
			return <Shield s={s} />;
		case 'arrows':
			return <Arrows s={s} />;
		case 'countdown':
			return <Countdown s={s} />;
		case 'progress':
			return <Progress s={s} />;
		default:
			return null;
	}
};

export const AutoReel: React.FC<AutoSpec> = ({scenes, audio, style}) => {
	const mono = style === 'mono';
	let from = 0;
	return (
		<MonoCtx.Provider value={mono}>
			<AbsoluteFill style={{backgroundColor: mono ? '#000' : C.bg}}>
				{mono ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 50% at 50% 50%, #161616 0%, #000 70%)'}} /> : <Background />}
				<AbsoluteFill style={mono ? {filter: 'grayscale(1) contrast(1.05)'} : undefined}>
					{scenes.map((s, i) => {
						const seq = (
							<Sequence key={i} name={`${i + 1}. ${s.type}`} from={from} durationInFrames={s.dur}>
								<SceneFade dur={s.dur} inF={i === 0 ? 0 : mono ? 8 : 4} outF={i === scenes.length - 1 ? 14 : mono ? 8 : 4}>
									{mono ? (
										<SceneSwitch s={s} first={i === 0} />
									) : (
										<PunchIn>
											<SceneSwitch s={s} first={i === 0} />
										</PunchIn>
									)}
								</SceneFade>
							</Sequence>
						);
						from += s.dur;
						return seq;
					})}
				</AbsoluteFill>
				{audio ? <Audio src={staticFile(audio)} /> : null}
			</AbsoluteFill>
		</MonoCtx.Provider>
	);
};

export const calcAutoMeta: CalculateMetadataFunction<AutoSpec> = ({props}) => ({
	durationInFrames: Math.max(30, props.scenes.reduce((a, s) => a + s.dur, 0)),
});

export const AUTO_DEFAULT: AutoSpec = {
	id: 'ukazka',
	audio: '',
	scenes: [
		{type: 'slam', dur: 75, emoji: '⏰', lines: [{t: 'UKÁZKA', size: 120, tone: 'accent'}, {t: 'AUTOMATICKÉHO REELU'}]},
		{type: 'cta', dur: 150, pre: 'ZAJÍMÁ TĚ TO?', word: 'START', sub: 'POŠLU TI VÍC INFO.'},
	],
};


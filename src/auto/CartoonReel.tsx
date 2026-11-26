import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT, prog} from '../theme';
import {Desk, Guy, Laptop} from './FloorsReel';

/* CARTOON look – universal illustrated template (own style, same family as „Patro po patru“).
   A reel = list of scenes; each scene = one set (place) + badge on top + 1–3 caption pills.
   Timing for SFX mirrored in scripts/cartoon_audio.py. */

const GREEN = '#9fe870';
const INK = '#1b1b1f';
const PAPER = '#f6f1e7';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ROOM_TOP = 400;
const FLOOR = 1000;

export type CartoonSet =
	| {k: 'street'; title?: string[]}
	| {k: 'office'; stamps?: boolean; phone?: boolean}
	| {k: 'cafe'; bubbles?: string[]}
	| {k: 'calendar'; label?: string}
	| {k: 'team'; n?: number}
	| {k: 'gym'}
	| {k: 'home'}
	| {k: 'think'; text: string}
	| {k: 'split'; left: string; right: string}
	| {k: 'big'; lines: {t: string; green?: boolean}[]}
	| {k: 'cta'; word: string; sub: string; foot?: string};

export type CartoonScene = {dur: number; badge?: string; time?: string; caps?: string[]; set: CartoonSet};
export type CartoonSpec = {id: string; audio: string; debugSafe?: boolean; scenes: CartoonScene[]};

/* ---------- helpers ---------- */
const Room: React.FC<{wall: string; children?: React.ReactNode; window?: 'day' | 'night'; brick?: boolean}> = ({wall, children, window = 'day', brick}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
		<rect x={0} y={ROOM_TOP} width={1080} height={FLOOR - ROOM_TOP} fill={wall} />
		{brick ? Array.from({length: 15}).map((_, r) => <line key={r} x1={0} x2={1080} y1={ROOM_TOP + 40 + r * 40} y2={ROOM_TOP + 40 + r * 40} stroke="#00000020" strokeWidth={3} />) : null}
		<rect x={640} y={ROOM_TOP + 50} width={260} height={180} fill={window === 'day' ? '#bfe3ff' : '#1b2340'} stroke={INK} strokeWidth={6} />
		{window === 'night' ? [0, 1, 2].map((i) => <rect key={i} x={660 + i * 80} y={ROOM_TOP + 120 - i * 20} width={50} height={110 + i * 20} fill="#2a3352" />) : <circle cx={850} cy={ROOM_TOP + 95} r={26} fill="#ffe08a" />}
		<line x1={770} x2={770} y1={ROOM_TOP + 50} y2={ROOM_TOP + 230} stroke={INK} strokeWidth={5} />
		<rect x={0} y={FLOOR} width={1080} height={70} fill="#6b4a36" stroke={INK} strokeWidth={5} />
		{children}
	</svg>
);

const Bubble: React.FC<{x: number; y: number; text: string; p: number; right?: boolean; green?: boolean}> = ({x, y, text, p, right, green}) => {
	const w = Math.max(180, text.length * 22 + 50);
	return (
		<g transform={`translate(${x} ${y}) scale(${p})`} opacity={p > 0 ? 1 : 0}>
			<rect x={right ? 0 : -w} y={-60} width={w} height={74} rx={22} fill={green ? GREEN : '#fff'} stroke={INK} strokeWidth={5} />
			<path d={right ? 'M 20 14 L 0 44 L 50 14 Z' : 'M -20 14 L 0 44 L -50 14 Z'} fill={green ? GREEN : '#fff'} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			<text x={right ? w / 2 : -w / 2} y={-11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>
				{text}
			</text>
		</g>
	);
};

/* ---------- sets ---------- */
const SetView: React.FC<{s: CartoonSet; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const bob = Math.sin(f / 5) * 4;
	switch (s.k) {
		case 'street': {
			const zoom = interpolate(f, [0, dur], [1.08, 1], clamp);
			return (
				<AbsoluteFill style={{transform: `scale(${zoom})`}}>
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						<rect x={0} y={0} width={1080} height={1920} fill="#0b1020" />
						{Array.from({length: 9}).map((_, i) => {
							const w = 110 + ((i * 47) % 70);
							const h = 380 + ((i * 131) % 420);
							const x = -20 + i * 125;
							return (
								<g key={i}>
									<rect x={x} y={FLOOR - h} width={w} height={h} fill={i % 2 ? '#141a2e' : '#1b2340'} />
									{Array.from({length: Math.floor(h / 70)}).map((_, r) =>
										[0, 1].map((c) => {
											const on = Math.sin(i * 7 + r * 3 + c * 11 + Math.floor(f / 30)) > 0.2;
											return <rect key={`${r}${c}`} x={x + 18 + c * (w / 2.2)} y={FLOOR - h + 24 + r * 70} width={22} height={30} fill={on ? '#ffd682' : '#2a3352'} />;
										}),
									)}
								</g>
							);
						})}
						<rect x={0} y={FLOOR} width={1080} height={300} fill="#2a2d36" />
						<Guy x={540 + interpolate(f, [0, dur], [-60, 60])} y={FLOOR + bob * 0.5} mood="ok" s={1.25} />
					</svg>
					{s.title ? (
						<div style={{position: 'absolute', top: 430, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
							{s.title.map((t, i) => {
								const k = f - i * 7;
								const sc = interpolate(k, [0, 5, 9], [1.5, 0.96, 1], clamp);
								return (
									<div key={i} style={{fontSize: i === 0 ? 64 : 84, color: i === 0 ? '#fff' : GREEN, textShadow: '0 5px 0 #000', transform: `scale(${sc})`, opacity: k >= 0 ? 1 : 0}}>
										{t}
									</div>
								);
							})}
						</div>
					) : null}
				</AbsoluteFill>
			);
		}
		case 'office':
			return (
				<Room wall="#b5553e" brick>
					<Desk x={600} y={FLOOR - 130} w={320} />
					<Laptop x={660} y={FLOOR - 130} />
					<Guy x={360} y={FLOOR + bob * 0.3} phone={s.phone} mood={f > dur / 2 ? 'happy' : 'ok'} s={1.2} />
					{s.stamps
						? Array.from({length: 7}).map((_, i) => {
								const yes = i === 3 || i === 6;
								const p = prog(f, 10 + i * 8, 6, Easing.out(Easing.back(2)));
								const x = 560 + (i % 4) * 110;
								const y = ROOM_TOP + 290 + Math.floor(i / 4) * 90;
								return (
									<g key={i} transform={`translate(${x} ${y}) scale(${p}) rotate(${yes ? -6 : 8})`} opacity={p > 0 ? 1 : 0}>
										<rect x={-46} y={-30} width={92} height={58} rx={10} fill={yes ? GREEN : '#e04848'} stroke={INK} strokeWidth={5} />
										<text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={INK}>
											{yes ? 'ANO' : 'NE'}
										</text>
									</g>
								);
							})
						: null}
				</Room>
			);
		case 'cafe': {
			const bubbles = s.bubbles ?? [];
			return (
				<Room wall="#d9a35b">
					<ellipse cx={540} cy={FLOOR - 120} rx={190} ry={26} fill="#8a5a3c" stroke={INK} strokeWidth={5} />
					<rect x={530} y={FLOOR - 96} width={20} height={96} fill="#6c442c" stroke={INK} strokeWidth={3} />
					<rect x={470} y={FLOOR - 172} width={40} height={44} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
					<rect x={570} y={FLOOR - 172} width={40} height={44} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
					<Guy x={290} y={FLOOR + bob * 0.3} mood="happy" s={1.15} />
					<Guy x={790} y={FLOOR - bob * 0.3} mood={f > dur * 0.6 ? 'happy' : 'ok'} tie="#3a7bd5" hair="#7a4a2a" s={1.15} />
					{bubbles.map((b, i) => {
						const at = 8 + i * Math.floor((dur - 20) / Math.max(1, bubbles.length));
						const p = prog(f, at, 8, Easing.out(Easing.back(2)));
						const left = i % 2 === 0;
						return <Bubble key={i} x={left ? 260 : 820} y={ROOM_TOP + 250 + (i % 2) * 120} text={b} p={p} right={left} green={left} />;
					})}
				</Room>
			);
		}
		case 'calendar':
			return (
				<Room wall="#3e6e63">
					<g transform={`translate(150 ${ROOM_TOP + 70})`}>
						<rect width={440} height={330} rx={16} fill={PAPER} stroke={INK} strokeWidth={6} />
						<rect width={440} height={56} rx={16} fill={INK} />
						<text x={220} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={GREEN}>
							{s.label ?? 'TENTO TÝDEN'}
						</text>
						{Array.from({length: 15}).map((_, i) => {
							const p = prog(f, 6 + i * 4, 4);
							return <rect key={i} x={18 + (i % 5) * 84} y={74 + Math.floor(i / 5) * 84} width={72} height={70} rx={8} fill={p > 0 ? GREEN : '#ddd'} stroke={INK} strokeWidth={3} />;
						})}
					</g>
					<Guy x={800} y={FLOOR + bob * 0.3} mood="happy" s={1.2} />
				</Room>
			);
		case 'team':
			return (
				<Room wall="#5a6c8e" window="day">
					{Array.from({length: s.n ?? 3}).map((_, i) => {
						const p = prog(f, 6 + i * 12, 10, Easing.out(Easing.back(1.6)));
						const x = 200 + i * 320;
						return (
							<g key={i} opacity={i === 0 ? 1 : p}>
								<Desk x={x + 40} y={FLOOR - 120} w={220} />
								<Laptop x={x + 70} y={FLOOR - 120} />
								<Guy x={x - 30} y={FLOOR} s={0.95} tie={['#9fe870', '#3a7bd5', '#e0a030'][i % 3]} hair={i === 2 ? '#7a4a2a' : INK} mood="happy" />
							</g>
						);
					})}
				</Room>
			);
		case 'gym': {
			const up = (Math.sin(f / 6) + 1) / 2;
			const barY = FLOOR - 330 - up * 70;
			return (
				<Room wall="#2f4f3f" window="night">
					{[0, 1, 2, 3].map((i) => (
						<g key={i}>
							<rect x={80 + i * 60} y={FLOOR - 140} width={14} height={140} fill="#444" />
							<circle cx={87 + i * 60} cy={FLOOR - 150} r={22} fill="#333" stroke={INK} strokeWidth={4} />
						</g>
					))}
					<Guy x={620} y={FLOOR} s={1.2} mood="happy" />
					<line x1={430} x2={810} y1={barY} y2={barY} stroke="#ccc" strokeWidth={12} strokeLinecap="round" />
					<rect x={410} y={barY - 50} width={30} height={100} rx={6} fill="#333" stroke={INK} strokeWidth={4} />
					<rect x={800} y={barY - 50} width={30} height={100} rx={6} fill="#333" stroke={INK} strokeWidth={4} />
				</Room>
			);
		}
		case 'home':
			return (
				<Room wall="#4a3f5c" window="night">
					<rect x={180} y={FLOOR - 160} width={460} height={110} rx={30} fill="#7a5a9a" stroke={INK} strokeWidth={6} />
					<rect x={160} y={FLOOR - 220} width={60} height={170} rx={20} fill="#7a5a9a" stroke={INK} strokeWidth={6} />
					<rect x={600} y={FLOOR - 220} width={60} height={170} rx={20} fill="#7a5a9a" stroke={INK} strokeWidth={6} />
					<Guy x={410} y={FLOOR - 80} s={1.05} mood="happy" />
					<line x1={820} x2={820} y1={FLOOR - 300} y2={FLOOR} stroke={INK} strokeWidth={6} />
					<path d="M 770 690 L 870 690 L 850 620 L 790 620 Z" fill="#ffe08a" stroke={INK} strokeWidth={5} />
				</Room>
			);
		case 'think': {
			const p = prog(f, 8, 10, Easing.out(Easing.back(2)));
			return (
				<Room wall="#3b4a5c">
					<Guy x={540} y={FLOOR} s={1.3} mood="wow" />
					<circle cx={640} cy={FLOOR - 330} r={14} fill="#fff" stroke={INK} strokeWidth={4} opacity={prog(f, 2, 4)} />
					<circle cx={680} cy={FLOOR - 380} r={22} fill="#fff" stroke={INK} strokeWidth={4} opacity={prog(f, 5, 4)} />
					<g transform={`translate(540 ${ROOM_TOP + 130}) scale(${p})`}>
						<ellipse rx={380} ry={110} fill="#fff" stroke={INK} strokeWidth={6} />
						<text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(50, 900 / Math.max(10, s.text.length) * 1.6)} fill={INK}>
							{s.text}
						</text>
					</g>
				</Room>
			);
		}
		case 'split': {
			const p = prog(f, 14, 12, Easing.inOut(Easing.cubic));
			return (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<rect x={0} y={ROOM_TOP} width={540} height={FLOOR - ROOM_TOP} fill="#55585f" />
					<rect x={540} y={ROOM_TOP} width={540} height={FLOOR - ROOM_TOP} fill="#3e6e63" />
					<line x1={540} x2={540} y1={ROOM_TOP} y2={FLOOR + 70} stroke={INK} strokeWidth={8} />
					<rect x={0} y={FLOOR} width={1080} height={70} fill="#6b4a36" stroke={INK} strokeWidth={5} />
					<g opacity={0.85}>
						<Guy x={200} y={FLOOR} s={0.95} mood="ok" tie="#888" />
						<Guy x={380} y={FLOOR} s={1.1} mood="ok" tie="#d23b3b" hair="#555" />
						<g transform="translate(270 520)">
							<circle r={50} fill="#fff" stroke={INK} strokeWidth={5} />
							<line x1={0} y1={0} x2={0} y2={-32} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 6})`} />
						</g>
					</g>
					<g opacity={p}>
						<Guy x={800} y={FLOOR} s={1.15} mood="happy" />
						<Laptop x={930} y={FLOOR - 120} />
						<Desk x={900} y={FLOOR - 120} w={220} />
					</g>
					<text x={270} y={ROOM_TOP + 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">
						{s.left}
					</text>
					<text x={810} y={ROOM_TOP + 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={GREEN} opacity={p}>
						{s.right}
					</text>
				</svg>
			);
		}
		case 'big':
			return (
				<AbsoluteFill style={{background: '#0b1020'}}>
					<div style={{position: 'absolute', top: 560, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
						{s.lines.map((l, i) => {
							const k = f - 4 - i * 10;
							const sc = interpolate(k, [0, 5, 9], [1.6, 0.96, 1], clamp);
							return (
								<div key={i} style={{fontSize: 92, lineHeight: 1.1, color: l.green ? GREEN : '#fff', textShadow: '0 6px 0 #000', transform: `scale(${sc})`, opacity: k >= 0 ? 1 : 0}}>
									{l.t}
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			);
		case 'cta': {
			const w = prog(f, 12, 8, Easing.out(Easing.back(2)));
			return (
				<AbsoluteFill style={{background: '#0b1020'}}>
					<div style={{position: 'absolute', top: 430, left: 60, right: 60, textAlign: 'center', fontFamily: FONT}}>
						<div style={{fontWeight: 800, fontSize: 42, color: '#bbb'}}>NAPIŠ DO KOMENTÁŘE</div>
						<div style={{marginTop: 20, display: 'inline-block', transform: `scale(${w}) rotate(-2deg)`, background: GREEN, color: INK, fontWeight: 900, fontSize: s.word.length > 6 ? 120 : 150, padding: '6px 40px', borderRadius: 24, border: `6px solid ${INK}`, boxShadow: `0 0 50px ${GREEN}88`}}>{s.word}</div>
						<div style={{marginTop: 40, fontWeight: 700, fontSize: 38, color: '#ddd', opacity: prog(f, 26, 10)}}>{s.sub}</div>
						{s.foot ? <div style={{position: 'absolute', top: 560, left: 30, right: 30, fontWeight: 500, fontSize: 22, color: '#999', opacity: prog(f, 36, 10)}}>{s.foot}</div> : null}
					</div>
				</AbsoluteFill>
			);
		}
		default:
			return null;
	}
};

const Badge: React.FC<{text: string; time?: string}> = ({text, time}) => {
	const f = useCurrentFrame();
	const p = prog(f, 3, 10, Easing.out(Easing.back(2)));
	return (
		<div style={{position: 'absolute', top: 280, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{transform: `scale(${p}) rotate(-2deg)`, textAlign: 'center', fontFamily: FONT}}>
				{time ? <div style={{display: 'inline-block', background: GREEN, color: INK, fontWeight: 900, fontSize: 28, letterSpacing: 3, padding: '6px 18px', borderRadius: '10px 10px 0 0', border: `4px solid ${INK}`, borderBottom: 'none'}}>🕒 {time}</div> : null}
				<div style={{background: INK, color: '#fff', fontWeight: 900, fontSize: 56, letterSpacing: 2, padding: '10px 30px', borderRadius: 14, border: '4px solid #fff'}}>{text}</div>
			</div>
		</div>
	);
};

const Caps: React.FC<{caps: string[]; dur: number}> = ({caps, dur}) => {
	const f = useCurrentFrame();
	const each = dur / caps.length;
	const i = Math.min(caps.length - 1, Math.floor(f / each));
	const p = prog(f, i * each, 6);
	return (
		<div style={{position: 'absolute', top: 1150, left: 80, right: 150, display: 'flex', justifyContent: 'center'}}>
			<div style={{opacity: p, transform: `translateY(${(1 - p) * 10}px)`, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.25, padding: '14px 26px', borderRadius: 16, textAlign: 'center', border: '3px solid rgba(255,255,255,0.15)'}}>{caps[i]}</div>
		</div>
	);
};

const SceneView: React.FC<{s: CartoonScene; last: boolean}> = ({s, last}) => {
	const f = useCurrentFrame();
	const fade = last ? 1 : interpolate(f, [s.dur - 5, s.dur], [1, 0], clamp);
	const inn = interpolate(f, [0, 5], [0, 1], clamp);
	return (
		<AbsoluteFill style={{opacity: Math.min(fade, s.set.k === 'street' ? 1 : inn), background: '#0b1020'}}>
			<SetView s={s.set} dur={s.dur} />
			{s.badge ? <Badge text={s.badge} time={s.time} /> : null}
			{s.caps && s.caps.length ? <Caps caps={s.caps} dur={s.dur} /> : null}
		</AbsoluteFill>
	);
};

export const CartoonReel: React.FC<CartoonSpec> = ({scenes, audio, debugSafe}) => {
	let from = 0;
	return (
		<AbsoluteFill style={{background: '#0b1020', overflow: 'hidden'}}>
			{scenes.map((s, i) => {
				const el = (
					<Sequence key={i} from={from} durationInFrames={s.dur} name={`${i + 1}. ${s.set.k}`}>
						<SceneView s={s} last={i === scenes.length - 1} />
					</Sequence>
				);
				from += s.dur;
				return el;
			})}
			<Img src={staticFile('brand/logo.png')} style={{position: 'absolute', top: 280, right: 50, width: 84, height: 84, borderRadius: 42}} />
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

export const calcCartoonMeta: CalculateMetadataFunction<CartoonSpec> = ({props}) => ({durationInFrames: Math.max(30, props.scenes.reduce((a, s) => a + s.dur, 0))});
export const CARTOON_DEFAULT: CartoonSpec = {id: 'cartoon', audio: '', scenes: [{dur: 90, set: {k: 'street', title: ['DEN', 'FINANČNÍHO PORADCE']}}]};

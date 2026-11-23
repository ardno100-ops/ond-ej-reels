import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, Img} from 'remotion';
import {FONT, prog} from '../theme';

/* CARTOON-FLOORS look – a career told as a building, floor by floor.
   Own illustrated style: night city, warm windows, a guy with a green tie climbing levels.
   Timeline is fixed (FL) and mirrored in scripts/floors_audio.py. */

export const FL = {
	hook: [0, 90],
	l1: [90, 330],
	l2: [330, 540],
	l3: [540, 750],
	l4: [750, 960],
	later: [960, 1110],
	twist: [1110, 1230],
	cta: [1230, 1380],
};
export const FLOORS_DUR = 1380;

const GREEN = '#9fe870';
const GREEN_D = '#2f6b3a';
const INK = '#1b1b1f';
const PAPER = '#f6f1e7';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* ---- world geometry ---- */
const BX = 140;
const BW = 800;
const FH = 480;
const GROUND_Y = 1880;
const floorTop = (k: number) => GROUND_Y - (k + 1) * FH; // k = 0..3
const floorMid = (k: number) => floorTop(k) + FH / 2;

type Cam = {cx: number; cy: number; s: number; sy: number};
const OVERVIEW: Cam = {cx: 540, cy: 900, s: 0.46, sy: 860};
const FLOOR = (k: number): Cam => ({cx: 540, cy: floorMid(k), s: 1.2, sy: 760});
const KEYS: [number, Cam][] = [
	[0, OVERVIEW],
	[70, OVERVIEW],
	[100, FLOOR(0)],
	[320, FLOOR(0)],
	[350, FLOOR(1)],
	[530, FLOOR(1)],
	[560, FLOOR(2)],
	[740, FLOOR(2)],
	[770, FLOOR(3)],
	[950, FLOOR(3)],
	[985, OVERVIEW],
	[1100, OVERVIEW],
	[1130, FLOOR(0)],
	[1380, FLOOR(0)],
];
const camAt = (f: number): Cam => {
	for (let i = 0; i < KEYS.length - 1; i++) {
		const [a, ca] = KEYS[i];
		const [b, cb] = KEYS[i + 1];
		if (f >= a && f <= b) {
			const t = interpolate(f, [a, b], [0, 1], {easing: Easing.inOut(Easing.cubic)});
			return {cx: ca.cx + (cb.cx - ca.cx) * t, cy: ca.cy + (cb.cy - ca.cy) * t, s: ca.s + (cb.s - ca.s) * t, sy: ca.sy + (cb.sy - ca.sy) * t};
		}
	}
	return KEYS[KEYS.length - 1][1];
};
const levelAt = (f: number) => (f < FL.l1[0] ? -1 : f < FL.l2[0] ? 0 : f < FL.l3[0] ? 1 : f < FL.l4[0] ? 2 : f < FL.later[0] ? 3 : f < FL.twist[0] ? 4 : 0);

/* ---- character ---- */
const Guy: React.FC<{x: number; y: number; s?: number; mood?: 'ok' | 'wow' | 'happy'; phone?: boolean; tie?: string; hair?: string}> = ({x, y, s = 1, mood = 'ok', phone, tie = GREEN, hair = INK}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{/* body */}
		<path d="M -46 0 L -40 -78 Q -36 -98 0 -98 Q 36 -98 40 -78 L 46 0 Z" fill="#fff" stroke={INK} strokeWidth={4} />
		<path d="M 0 -96 L -8 -84 L 0 -40 L 8 -84 Z" fill={tie} stroke={INK} strokeWidth={2} />
		{/* head */}
		<circle cx={0} cy={-140} r={40} fill="#fff" stroke={INK} strokeWidth={4} />
		<path d="M -40 -150 Q -36 -186 0 -184 Q 30 -186 42 -160 Q 22 -170 8 -168 Q 0 -160 -14 -166 Q -28 -160 -40 -150 Z" fill={hair} />
		{mood === 'wow' ? (
			<>
				<circle cx={-14} cy={-140} r={7} fill="#fff" stroke={INK} strokeWidth={3} />
				<circle cx={14} cy={-140} r={7} fill="#fff" stroke={INK} strokeWidth={3} />
				<ellipse cx={0} cy={-117} rx={7} ry={9} fill={INK} />
			</>
		) : (
			<>
				<circle cx={-14} cy={-142} r={4.5} fill={INK} />
				<circle cx={14} cy={-142} r={4.5} fill={INK} />
				<path d={mood === 'happy' ? 'M -16 -124 Q 0 -104 16 -124 Z' : 'M -12 -122 Q 0 -114 12 -122'} fill={mood === 'happy' ? INK : 'none'} stroke={INK} strokeWidth={3} strokeLinecap="round" />
			</>
		)}
		{phone ? (
			<g transform="translate(36 -150) rotate(20)">
				<rect x={-10} y={-26} width={20} height={52} rx={6} fill="#d23b3b" stroke={INK} strokeWidth={3} />
			</g>
		) : null}
	</g>
);

const Desk: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 260}) => (
	<g>
		<rect x={x - w / 2} y={y} width={w} height={22} rx={4} fill="#8a5a3c" stroke={INK} strokeWidth={4} />
		<rect x={x - w / 2 + 16} y={y + 22} width={14} height={90} fill="#6c442c" stroke={INK} strokeWidth={3} />
		<rect x={x + w / 2 - 30} y={y + 22} width={14} height={90} fill="#6c442c" stroke={INK} strokeWidth={3} />
	</g>
);

const Laptop: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 46} y={y - 62} width={92} height={60} rx={6} fill="#3b6b8f" stroke={INK} strokeWidth={4} />
		<rect x={x - 58} y={y - 4} width={116} height={8} rx={3} fill="#bbb" stroke={INK} strokeWidth={3} />
	</g>
);

/* ---- floor interiors (world coords) ---- */
const Floor: React.FC<{k: number; f: number; lit: number}> = ({k, f, lit}) => {
	const top = floorTop(k);
	const walls = ['#b5553e', '#3e6e63', '#5a6c8e', '#2f4f3f'];
	const floorY = top + FH - 40;
	const local = (a: number) => f - a;
	return (
		<g>
			<rect x={BX} y={top} width={BW} height={FH} fill={walls[k]} stroke={INK} strokeWidth={6} />
			{k === 0 &&
				Array.from({length: 10}).map((_, r) => <line key={r} x1={BX} x2={BX + BW} y1={top + 40 + r * 40} y2={top + 40 + r * 40} stroke="#00000022" strokeWidth={3} />)}
			<rect x={BX} y={floorY} width={BW} height={40} fill="#6b4a36" stroke={INK} strokeWidth={4} />
			{/* window */}
			<rect x={BX + 520} y={top + 50} width={220} height={150} fill={`rgba(255,214,130,${0.25 + 0.6 * lit})`} stroke={INK} strokeWidth={5} />
			<line x1={BX + 630} x2={BX + 630} y1={top + 50} y2={top + 200} stroke={INK} strokeWidth={4} />
			{/* floor content */}
			{k === 0 ? (
				<g>
					<Desk x={BX + 330} y={floorY - 130} />
					<Guy x={BX + 230} y={floorY - 4} phone mood={f > FL.l1[0] + 175 ? 'happy' : 'ok'} />
					{/* NO / YES stamps */}
					{Array.from({length: 7}).map((_, i) => {
						const at = FL.l1[0] + 100 + i * 9;
						const yes = i === 3 || i === 6;
						const p = prog(f, at, 6, Easing.out(Easing.back(2)));
						if (p <= 0 || f > FL.l1[1] + 10) return null;
						const x = BX + 470 + (i % 4) * 82;
						const y = top + 250 + Math.floor(i / 4) * 70;
						return (
							<g key={i} transform={`translate(${x} ${y}) scale(${p}) rotate(${yes ? -6 : 8})`}>
								<rect x={-36} y={-24} width={72} height={46} rx={8} fill={yes ? GREEN : '#e04848'} stroke={INK} strokeWidth={4} />
								<text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={INK}>
									{yes ? 'ANO' : 'NE'}
								</text>
							</g>
						);
					})}
				</g>
			) : null}
			{k === 1 ? (
				<g>
					<Desk x={BX + 300} y={floorY - 130} />
					<Laptop x={BX + 330} y={floorY - 130} />
					<Guy x={BX + 190} y={floorY - 4} mood="happy" />
					{/* calendar */}
					<g transform={`translate(${BX + 470} ${top + 230})`}>
						<rect width={280} height={170} rx={10} fill={PAPER} stroke={INK} strokeWidth={4} />
						{Array.from({length: 15}).map((_, i) => {
							const p = prog(f, FL.l2[0] + 60 + i * 7, 5);
							const cx = 14 + (i % 5) * 52;
							const cy = 20 + Math.floor(i / 5) * 48;
							return <rect key={i} x={cx} y={cy} width={44} height={38} rx={6} fill={p > 0 ? GREEN : '#ddd'} stroke={INK} strokeWidth={2} opacity={0.4 + 0.6 * Math.max(p, 0.2)} />;
						})}
					</g>
				</g>
			) : null}
			{k === 2 ? (
				<g>
					{[0, 1, 2].map((i) => {
						const p = prog(f, FL.l3[0] + 40 + i * 30, 10, Easing.out(Easing.back(1.6)));
						const x = BX + 150 + i * 250;
						return (
							<g key={i} opacity={i === 0 ? 1 : p}>
								<Desk x={x} y={floorY - 120} w={200} />
								<Laptop x={x + 30} y={floorY - 120} />
								<Guy x={x - 50} y={floorY - 4} s={i === 0 ? 1 : 0.92} tie={i === 0 ? GREEN : ['#3a7bd5', '#e0a030'][i - 1]} hair={i === 2 ? '#7a4a2a' : INK} mood="happy" />
							</g>
						);
					})}
				</g>
			) : null}
			{k === 3 ? (
				<g>
					{/* shelves with client folders */}
					{[0, 1, 2].map((r) => (
						<g key={r}>
							<rect x={BX + 40} y={top + 90 + r * 90} width={420} height={10} fill="#6b4a36" />
							{Array.from({length: 12}).map((_, i) => {
								const p = prog(f, FL.l4[0] + 40 + (r * 12 + i) * 3, 4);
								return <rect key={i} x={BX + 50 + i * 34} y={top + 30 + r * 90} width={26} height={60} rx={3} fill={['#9fe870', '#f2c14e', '#7fb3ff'][(i + r) % 3]} stroke={INK} strokeWidth={2} opacity={p} />;
							})}
						</g>
					))}
					<Desk x={BX + 620} y={floorY - 130} w={220} />
					<Guy x={BX + 560} y={floorY - 4} mood="happy" />
				</g>
			) : null}
			{/* darkness until reached */}
			<rect x={BX} y={top} width={BW} height={FH} fill="#05070d" opacity={0.72 * (1 - lit)} />
		</g>
	);
};

const City: React.FC<{f: number}> = ({f}) => (
	<g>
		{Array.from({length: 14}).map((_, i) => {
			const w = 120 + ((i * 53) % 80);
			const h = 500 + ((i * 97) % 900);
			const x = -300 + i * 130;
			return (
				<g key={i}>
					<rect x={x} y={GROUND_Y - h} width={w} height={h} fill={i % 2 ? '#141a2e' : '#1b2340'} />
					{Array.from({length: Math.floor(h / 70)}).map((_, r) =>
						[0, 1, 2].map((c) => {
							const on = Math.sin(i * 7 + r * 3 + c * 11 + Math.floor(f / 40)) > 0.35;
							return <rect key={`${r}-${c}`} x={x + 14 + c * (w / 3.2)} y={GROUND_Y - h + 20 + r * 70} width={18} height={26} fill={on ? '#ffd682' : '#2a3352'} opacity={on ? 0.8 : 1} />;
						}),
					)}
				</g>
			);
		})}
	</g>
);

const World: React.FC<{f: number}> = ({f}) => {
	const lvl = levelAt(f);
	const lit = (k: number) => {
		if (f >= FL.later[0] && f < FL.twist[0]) return 1;
		if (f >= FL.twist[0]) return k === 0 ? 1 : 0.4;
		return lvl >= k ? 1 : 0;
	};
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{overflow: 'visible'}}>
			<rect x={-2000} y={-2000} width={5080} height={6000} fill="#0b1020" />
			<City f={f} />
			{/* roof + sign */}
			<rect x={BX - 20} y={floorTop(3) - 40} width={BW + 40} height={40} fill={INK} />
			<rect x={BX + 250} y={floorTop(3) - 120} width={300} height={70} rx={8} fill={INK} stroke={GREEN} strokeWidth={4} />
			<text x={BX + 400} y={floorTop(3) - 72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={GREEN} letterSpacing={3}>
				TVOJE FIRMA
			</text>
			{[0, 1, 2, 3].map((k) => (
				<Floor key={k} k={k} f={f} lit={lit(k)} />
			))}
			<rect x={-2000} y={GROUND_Y} width={5080} height={400} fill="#2a2d36" />
		</svg>
	);
};

/* ---- overlays ---- */
const LEVELS = ['PRODEJ', 'SYSTÉM', 'TÝM', 'KMEN KLIENTŮ'];

const Indicator: React.FC<{f: number}> = ({f}) => {
	const lvl = levelAt(f);
	const o = prog(f, 4, 10);
	return (
		<div style={{position: 'absolute', left: 26, top: 520, height: 560, width: 40, opacity: o}}>
			<div style={{position: 'absolute', left: 17, top: 0, bottom: 0, width: 4, background: 'rgba(255,255,255,0.35)', borderRadius: 2}} />
			{[3, 2, 1, 0].map((k, i) => {
				const on = lvl === k || (f >= FL.later[0] && f < FL.twist[0]);
				return (
					<div key={k} style={{position: 'absolute', top: i * 170, left: 6, width: 26, height: 26, borderRadius: 13, background: on ? GREEN : '#1b1b1f', border: '4px solid #fff', boxShadow: on ? `0 0 16px ${GREEN}` : 'none'}} />
				);
			})}
		</div>
	);
};

const Badge: React.FC<{f: number}> = ({f}) => {
	const lvl = levelAt(f);
	const starts = [FL.l1[0], FL.l2[0], FL.l3[0], FL.l4[0]];
	if (lvl < 0 || lvl > 3 || f >= FL.later[0]) return null;
	const p = prog(f, starts[lvl] + 8, 10, Easing.out(Easing.back(2)));
	return (
		<div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{transform: `scale(${p}) rotate(-2deg)`, textAlign: 'center', fontFamily: FONT}}>
				<div style={{display: 'inline-block', background: GREEN, color: INK, fontWeight: 900, fontSize: 26, letterSpacing: 4, padding: '6px 18px', borderRadius: '10px 10px 0 0', border: `4px solid ${INK}`, borderBottom: 'none'}}>PATRO {lvl + 1}</div>
				<div style={{background: INK, color: '#fff', fontWeight: 900, fontSize: 64, letterSpacing: 3, padding: '10px 34px', borderRadius: 14, border: '4px solid #fff'}}>{LEVELS[lvl]}</div>
			</div>
		</div>
	);
};

type Cap = [number, number, string];
const CAPS: Cap[] = [
	[0, 90, 'Jak se staví kariéra ve financích? Patro po patru.'],
	[95, 185, 'Začíná od nuly. Bez kontaktů, bez zkušeností.'],
	[185, 260, 'Naučí se prodávat. Stovky hovorů.'],
	[260, 330, 'Hodně NE. Pár ANO. Každé ANO je klient.'],
	[335, 410, 'Pak přijde systém.'],
	[410, 540, 'Kalendář se plní. Spokojení klienti ho doporučují dál.'],
	[545, 630, 'Začne učit ostatní.'],
	[630, 750, 'Postaví tým – a roste spolu s ním.'],
	[755, 850, 'Klienti s ním zůstávají roky.'],
	[850, 960, 'Kmen klientů roste s každým rokem.'],
	[965, 1040, 'Roky potom: vlastní kancelář, tým a klienti, kteří se vracejí.'],
	[1040, 1110, 'Žádný strop daný tabulkou.'],
	[1115, 1170, 'Nezačal s nápadem.'],
	[1170, 1230, 'Začal jedním hovorem.'],
];

const Captions: React.FC<{f: number}> = ({f}) => {
	const c = CAPS.find(([a, b]) => f >= a && f < b);
	if (!c) return null;
	const p = prog(f, c[0], 6);
	return (
		<div style={{position: 'absolute', top: 1170, left: 90, right: 150, display: 'flex', justifyContent: 'center'}}>
			<div style={{opacity: p, transform: `translateY(${(1 - p) * 10}px)`, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.25, padding: '14px 26px', borderRadius: 16, textAlign: 'center', border: '3px solid rgba(255,255,255,0.15)'}}>{c[2]}</div>
		</div>
	);
};

const Hook: React.FC<{f: number}> = ({f}) => {
	if (f >= FL.hook[1]) return null;
	const s = interpolate(f, [0, 6, 10], [1.4, 0.97, 1], clamp);
	const o = interpolate(f, [70, 90], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', top: 300, left: 50, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, opacity: o, transform: `scale(${s})`}}>
			<div style={{fontSize: 62, color: '#fff', textShadow: '0 4px 0 #000'}}>JAK SE STAVÍ KARIÉRA</div>
			<div style={{fontSize: 86, color: GREEN, textShadow: '0 4px 0 #000'}}>PATRO PO PATRU</div>
		</div>
	);
};

const Later: React.FC<{f: number}> = ({f}) => {
	if (f < FL.later[0] || f >= FL.later[1]) return null;
	const p = prog(f, FL.later[0] + 20, 10, Easing.out(Easing.back(2)));
	return (
		<div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{transform: `scale(${p})`, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 54, letterSpacing: 4, padding: '12px 30px', borderRadius: 14, border: '4px solid #fff'}}>ROKY POTOM</div>
		</div>
	);
};

const Ring: React.FC<{f: number}> = ({f}) => {
	if (f < FL.twist[0] + 50 || f >= FL.twist[1]) return null;
	const k = f - (FL.twist[0] + 50);
	const shake = Math.sin(k * 2.2) * 8;
	return (
		<div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#fff', transform: `translateX(${shake}px)`, textShadow: '0 4px 0 #000'}}>
			📞 JEDEN HOVOR.
		</div>
	);
};

const Cta: React.FC<{f: number}> = ({f}) => {
	if (f < FL.cta[0]) return null;
	const k = f - FL.cta[0];
	const bg = prog(k, 0, 10);
	const w = prog(k, 12, 8, Easing.out(Easing.back(2)));
	return (
		<AbsoluteFill style={{background: `rgba(8,10,18,${0.82 * bg})`}}>
			<div style={{position: 'absolute', top: 430, left: 60, right: 60, textAlign: 'center', fontFamily: FONT}}>
				<div style={{fontWeight: 900, fontSize: 64, color: '#fff', opacity: bg}}>CHCEŠ VIDĚT</div>
				<div style={{fontWeight: 900, fontSize: 64, color: '#fff', opacity: bg}}>PRVNÍ PATRO?</div>
				<div style={{marginTop: 30, fontWeight: 800, fontSize: 40, color: '#bbb', opacity: prog(k, 8, 8)}}>NAPIŠ DO KOMENTÁŘE</div>
				<div style={{marginTop: 10, display: 'inline-block', transform: `scale(${w}) rotate(-2deg)`, background: GREEN, color: INK, fontWeight: 900, fontSize: 150, padding: '6px 40px', borderRadius: 24, border: `6px solid ${INK}`, boxShadow: `0 0 50px ${GREEN}88`}}>PATRO</div>
				<div style={{marginTop: 40, fontWeight: 700, fontSize: 36, color: '#ddd', opacity: prog(k, 30, 10)}}>Pošlu ti, jak vypadá začátek.</div>
				<div style={{position: 'absolute', top: 640, left: 30, right: 30, fontWeight: 500, fontSize: 22, color: '#999', opacity: prog(k, 40, 10)}}>Ilustrativní příběh. Spolupráce na živnostenský list. Příjem závisí na výkonu a není zaručen.</div>
			</div>
		</AbsoluteFill>
	);
};

export type FloorsSpec = {id: string; audio: string; debugSafe?: boolean};

export const FloorsReel: React.FC<FloorsSpec> = ({audio, debugSafe}) => {
	const f = useCurrentFrame();
	const c = camAt(f);
	return (
		<AbsoluteFill style={{background: '#0b1020', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${540 - c.cx * c.s}px, ${c.sy - c.cy * c.s}px) scale(${c.s})`}}>
				<World f={f} />
			</div>
			<Indicator f={f} />
			<Hook f={f} />
			<Badge f={f} />
			<Later f={f} />
			<Ring f={f} />
			<Captions f={f} />
			<Cta f={f} />
			<Img src={staticFile('brand/logo.png')} style={{position: 'absolute', top: 280, right: 70, width: 90, height: 90, borderRadius: 45}} />
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

export const FLOORS_DEFAULT: FloorsSpec = {id: 'floors', audio: ''};

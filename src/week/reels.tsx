import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Check, Footnote, Headline, Person, Pill} from '../components';
import {C, FONT, fmt, glow, prog} from '../theme';
import {FullSvg, PopPill, SceneDef, makeCta, makeReel, rnd, sumDur} from './common';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* #####################################################################
   PONDĚLÍ — Ve 20 máš výhodu (cena rizika)
   ##################################################################### */
const PoHook: React.FC = () => {
	const f = useCurrentFrame();
	const aura = 0.5 + 0.5 * Math.sin(f / 6);
	return (
		<AbsoluteFill>
			<FullSvg>
				<circle cx={540} cy={1180} r={230 + aura * 20} fill={C.accent} opacity={0.07 + aura * 0.05} />
				<circle cx={540} cy={1180} r={170} fill="none" stroke={C.accent} strokeOpacity={0.4} strokeWidth={3} />
				<Person x={540} y={1300} s={2.4} color={C.accent} />
			</FullSvg>
			<PopPill at={8} x={540} y={1430} light size={30}>
				VĚK: 20
			</PopPill>
			<Headline small="VE 20 MÁŠ JEDNU VÝHODU." big="VE 30 UŽ" big2="JI MÍT NEBUDEŠ." at={2} top={270} bigSize={104} />
		</AbsoluteFill>
	);
};

const PO_EVENTS = [
	{age: 23, t: 'NÁJEM'},
	{age: 27, t: 'HYPOTÉKA'},
	{age: 30, t: 'DĚTI'},
	{age: 34, t: 'ZÁVAZKY'},
];
export const PO_RISK_START = 20;
export const PO_RISK_END = 200;
const ageAt = (f: number) => interpolate(f, [PO_RISK_START, PO_RISK_END], [20, 35], clamp);
const rx = (a: number) => 150 + ((a - 20) / 15) * 780;
const risk = (a: number) => 0.06 + 0.9 * Math.pow((a - 20) / 15, 1.6);
const ry = (v: number) => 1480 - v * 700;
export const poEventFrame = (age: number) => Math.round(PO_RISK_START + ((age - 20) / 15) * (PO_RISK_END - PO_RISK_START));

const PoRisk: React.FC = () => {
	const f = useCurrentFrame();
	const a = ageAt(f);
	const pts: string[] = [];
	for (let x = 20; x <= a + 1e-6; x += 0.1) pts.push(`${rx(x)},${ry(risk(x))}`);
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={150} y1={1480} x2={930} y2={1480} stroke={C.white} strokeOpacity={0.5} strokeWidth={4} />
				{[20, 25, 30, 35].map((v) => (
					<text key={v} x={rx(v)} y={1526} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={C.muted}>
						{v} LET
					</text>
				))}
				<polyline points={pts.join(' ')} fill="none" stroke="#ff8a7a" strokeWidth={9} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #ff8a7a)'}} />
				<circle cx={rx(a)} cy={ry(risk(a))} r={12} fill="#ff8a7a" />
				{/* TEĎ marker */}
				<g opacity={prog(f, 6, 10)}>
					<circle cx={rx(20)} cy={ry(risk(20))} r={20} fill={C.accent} style={{filter: `drop-shadow(0 0 12px ${C.accent})`}} />
					<text x={rx(20) + 6} y={ry(risk(20)) - 40} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.accent}>
						TY TEĎ
					</text>
				</g>
				{PO_EVENTS.map((e, i) => {
					const p = prog(f, poEventFrame(e.age), 12, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					const x = rx(e.age);
					const y = ry(risk(e.age));
					return (
						<g key={e.t} transform={`translate(${x} ${y}) scale(${p})`}>
							<line x1={0} y1={0} x2={0} y2={i % 2 ? -150 : -64} stroke={C.muted} strokeWidth={2} />
							<rect x={-120} y={(i % 2 ? -150 : -64) - 48} width={240} height={52} rx={26} fill={C.white} />
							<text x={0} y={(i % 2 ? -150 : -64) - 13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={1} fill={C.dark}>
								{e.t}
							</text>
						</g>
					);
				})}
			</FullSvg>
			<Headline small="CENA RIZIKA" big="S VĚKEM" big2="ROSTE." at={2} top={250} bigSize={108} />
			<Footnote bottom={260} o={prog(f, PO_RISK_END, 14)}>
				Co tě stojí, když pokus nevyjde? Ve 20 hlavně čas. Ve 35 mnohem víc.
			</Footnote>
		</AbsoluteFill>
	);
};

export const PO_CHECKS = [30, 44, 58];
const PoNow: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Headline small="NEJLEVNĚJŠÍ DOBA" big="NĚCO ZKUSIT" big2="JE TEĎ." at={2} top={300} bigSize={110} />
			<div style={{position: 'absolute', top: 900, left: 150}}>
				{['NIKDO NEZÁVISÍ NA TVÉ VÝPLATĚ', 'MŮŽEŠ ZAČÍT PŘI ŠKOLE', 'NEJHORŠÍ VARIANTA: NAUČÍŠ SE'].map((t, i) => {
					const p = prog(f, PO_CHECKS[i], 12);
					return <Check key={t} text={t} o={p} dx={(1 - p) * -40} />;
				})}
			</div>
		</AbsoluteFill>
	);
};

const PO_SCENES: SceneDef[] = [
	{name: 'Hook – výhoda ve 20', dur: 120, C: PoHook},
	{name: 'Cena rizika', dur: 270, C: PoRisk},
	{name: 'Nejlevnější doba je teď', dur: 150, C: PoNow},
	{name: 'CTA ZKUSIT', dur: 165, C: makeCta({small: 'CHCEŠ TO', big: 'ZKUSIT?', word: 'ZKUSIT', sub: 'UKÁŽU TI, JAK ZAČÍT PŘI ŠKOLE.'})},
];
export const PO_DUR = sumDur(PO_SCENES);
export const PoReel = makeReel(PO_SCENES, 'week-po.wav');

/* #####################################################################
   STŘEDA — Brigáda vs. první byznys (přesýpací hodiny vs. sněhová koule)
   ##################################################################### */
const StHook: React.FC = () => {
	const f = useCurrentFrame();
	const l = prog(f, 14, 14, Easing.out(Easing.back(2)));
	const r = prog(f, 26, 14, Easing.out(Easing.back(2)));
	return (
		<AbsoluteFill>
			<FullSvg>
				<g transform={`translate(300 1150) scale(${l})`}>
					<Hourglass sand={0.6} t={f} />
				</g>
				<g transform={`translate(780 1150) scale(${r})`}>
					<circle r={120} fill={C.accent} style={{filter: `drop-shadow(0 0 30px ${C.accent})`}} />
				</g>
			</FullSvg>
			<Headline small="BRIGÁDA" big="VS." big2="PRVNÍ BYZNYS" at={2} top={270} bigSize={116} />
		</AbsoluteFill>
	);
};

const Hourglass: React.FC<{sand: number; t: number}> = ({sand, t}) => (
	<g>
		<path d="M -110 -170 L 110 -170 L 18 0 L 110 170 L -110 170 L -18 0 Z" fill="none" stroke={C.white} strokeWidth={8} strokeLinejoin="round" />
		<rect x={-130} y={-186} width={260} height={18} rx={8} fill={C.white} />
		<rect x={-130} y={168} width={260} height={18} rx={8} fill={C.white} />
		{/* top sand */}
		<path d={`M ${-90 * (1 - sand)} ${-150 + 150 * sand} L ${90 * (1 - sand)} ${-150 + 150 * sand} L 0 -10 Z`} fill={C.accent} opacity={sand < 1 ? 1 : 0} />
		{/* bottom sand */}
		<path d={`M -96 160 L 96 160 L ${96 - 80 * sand} ${160 - 120 * sand} L ${-96 + 80 * sand} ${160 - 120 * sand} Z`} fill={C.accent} />
		{sand < 1 ? <line x1={0} y1={-6} x2={0} y2={160 - 120 * sand} stroke={C.accent} strokeWidth={4} strokeDasharray={`6 ${6 + (t % 4)}`} /> : null}
	</g>
);

export const ST_HOURS = [30, 60, 90, 120, 150];
export const ST_STOP = 180;
const StBrigada: React.FC = () => {
	const f = useCurrentFrame();
	const hours = ST_HOURS.filter((h) => f >= h).length;
	const sandP = f < ST_STOP ? ((f % 30) / 30) : 1;
	const stopped = f >= ST_STOP;
	return (
		<AbsoluteFill>
			<FullSvg>
				<g transform="translate(540 1050) scale(1.25)" opacity={stopped ? 0.45 : 1}>
					<Hourglass sand={stopped ? 1 : sandP} t={f} />
				</g>
			</FullSvg>
			<div style={{position: 'absolute', top: 1340, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
				<div style={{fontSize: 140, fontWeight: 900, color: stopped ? C.muted : C.white, textShadow: stopped ? 'none' : glow(C.white, 24)}}>{fmt(hours * 150)} Kč</div>
				<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 4, color: C.muted}}>{hours} {hours === 1 ? 'HODINA' : hours >= 2 && hours <= 4 ? 'HODINY' : 'HODIN'} × 150 Kč</div>
			</div>
			<PopPill at={ST_STOP + 4} x={540} y={1620} size={30}>
				PŘESTANEŠ PRACOVAT → PŘESTANE PŘÍJEM
			</PopPill>
			<Headline small="BRIGÁDA:" big="PRODÁVÁŠ" big2="SVŮJ ČAS." at={2} top={270} bigSize={112} />
			<Footnote bottom={140} o={prog(f, 40, 14)}>
				Ilustrativní sazba brigády. Minimální mzda 2026: 134,40 Kč/h (MPSV).
			</Footnote>
		</AbsoluteFill>
	);
};

const ST_LABELS = [
	{at: 40, t: '1. KLIENT'},
	{at: 80, t: 'DOPORUČENÍ'},
	{at: 120, t: 'DALŠÍ KLIENTI'},
	{at: 160, t: 'VLASTNÍ TÝM'},
];
export const ST_LABEL_FRAMES = ST_LABELS.map((l) => l.at);
const StKoule: React.FC = () => {
	const f = useCurrentFrame();
	const p = interpolate(f, [10, 220], [0, 1], clamp);
	const x = 160 + p * 700;
	const y = 900 + p * 560;
	const r = 22 + Math.pow(p, 1.3) * 150;
	const grow = ST_LABELS.filter((l) => f >= l.at).length;
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={100} y1={900 + 22} x2={1000} y2={1460 + 120 + 30} stroke={C.white} strokeOpacity={0.35} strokeWidth={5} />
				<g transform={`translate(${x} ${y + 22 - r}) rotate(${f * 6})`} style={{filter: `drop-shadow(0 0 ${10 + r / 4}px ${C.accent})`}}>
					<circle r={r} fill={C.accent} />
					<circle cx={r * 0.35} cy={-r * 0.2} r={r * 0.12} fill={C.dark} opacity={0.2} />
					<circle cx={-r * 0.3} cy={r * 0.3} r={r * 0.09} fill={C.dark} opacity={0.2} />
				</g>
			</FullSvg>
			{ST_LABELS.map((l, i) => (
				<PopPill key={l.t} at={l.at} x={i % 2 ? 760 : 320} y={700 + i * 120} light={i === grow - 1}>
					{l.t}
				</PopPill>
			))}
			<Headline small="BYZNYS:" big="STAVÍŠ" big2="SNĚHOVOU KOULI." at={2} top={250} bigSize={100} />
			<Footnote bottom={140} o={prog(f, 170, 14)}>
				Každý spokojený klient tě může doporučit dál.
			</Footnote>
		</AbsoluteFill>
	);
};

const ST_SCENES: SceneDef[] = [
	{name: 'Hook – brigáda vs byznys', dur: 120, C: StHook},
	{name: 'Brigáda – přesýpací hodiny', dur: 255, C: StBrigada},
	{name: 'Byznys – sněhová koule', dur: 255, C: StKoule},
	{name: 'CTA KOULE', dur: 165, C: makeCta({small: 'CHCEŠ ROZJET', big: 'SVOJI', big2: 'KOULI?', word: 'KOULE', sub: 'UKÁŽU TI PRVNÍ KROKY.'})},
];
export const ST_DUR = sumDur(ST_SCENES);
export const StReel = makeReel(ST_SCENES, 'week-st.wav');

/* #####################################################################
   ČTVRTEK — Údolí zklamání
   ##################################################################### */
const vx = (t: number) => 120 + t * 840; // t 0..1
const vCurve = (t: number) => {
	// rise to peak (0.25), dip (0.55), long rise
	if (t < 0.25) return 0.25 + 1.3 * t;
	if (t < 0.55) return 0.575 - 0.42 * Math.sin(((t - 0.25) / 0.3) * (Math.PI / 2));
	return 0.155 + Math.pow((t - 0.55) / 0.45, 1.7) * 0.85;
};
const vy = (v: number) => 1500 - v * 650;
const DIP_T = 0.55;

const CtHook: React.FC = () => {
	const f = useCurrentFrame();
	const pts: string[] = [];
	for (let t = 0; t <= 1.0001; t += 0.01) pts.push(`${vx(t)},${vy(vCurve(t))}`);
	const arrow = prog(f, 30, 14, Easing.out(Easing.back(2)));
	const bob = Math.sin(f / 4) * 10;
	return (
		<AbsoluteFill>
			<FullSvg>
				<polyline points={pts.join(' ')} fill="none" stroke={C.white} strokeOpacity={0.25} strokeWidth={8} strokeDasharray="4 16" strokeLinecap="round" />
				<g transform={`translate(${vx(DIP_T)} ${vy(vCurve(DIP_T)) - 70 + bob}) scale(${arrow})`}>
					<path d="M 0 0 L -30 -50 L -12 -50 L -12 -120 L 12 -120 L 12 -50 L 30 -50 Z" fill="#ff8a7a" style={{filter: 'drop-shadow(0 0 12px #ff8a7a)'}} />
				</g>
			</FullSvg>
			<Headline small="PROČ VĚTŠINA LIDÍ TO VZDÁ" big="PŘESNĚ" big2="TADY." at={2} top={270} bigSize={124} />
		</AbsoluteFill>
	);
};

export const CT_WALK_END = 260;
const CT_PHASES = [
	{t: 0.12, label: 'NADŠENÍ', color: C.accent},
	{t: 0.47, label: 'ÚDOLÍ ZKLAMÁNÍ', color: '#ff8a7a'},
	{t: 0.86, label: 'VÝSLEDKY', color: C.accent},
];
export const ctPhaseFrame = (t: number) => Math.round(10 + t * (CT_WALK_END - 10));
const CtCurve: React.FC = () => {
	const f = useCurrentFrame();
	const T = interpolate(f, [10, CT_WALK_END], [0, 1], clamp);
	const pts: string[] = [];
	for (let t = 0; t <= T + 1e-6; t += 0.01) pts.push(`${vx(t)},${vy(vCurve(t))}`);
	const dipF = ctPhaseFrame(DIP_T);
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={120} y1={1520} x2={960} y2={1520} stroke={C.white} strokeOpacity={0.3} strokeWidth={3} />
				<polyline points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth={9} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${C.accent})`}} />
				{CT_PHASES.map((p) => {
					const o = prog(f, ctPhaseFrame(p.t), 12);
					return (
						<text key={p.label} x={vx(p.t)} y={vy(vCurve(p.t)) + (p.t > 0.4 && p.t < 0.6 ? 120 : -60)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} letterSpacing={2} fill={p.color} opacity={o}>
							{p.label}
						</text>
					);
				})}
				{/* quitters falling out at the dip */}
				{Array.from({length: 7}).map((_, i) => {
					const st = dipF - 30 + i * 6;
					const k = f - st;
					if (k < 0) return null;
					const x0 = vx(DIP_T - 0.08 + i * 0.02);
					const y0 = vy(vCurve(DIP_T - 0.08 + i * 0.02));
					const fall = k > 12 ? (k - 12) * (k - 12) * 0.8 : 0;
					const o = Math.max(0, 1 - Math.max(0, k - 12) / 24);
					return (
						<g key={i} opacity={o}>
							<Person x={x0 + (i - 3) * 6} y={y0 + fall} s={0.75} color={C.gray} glowOn={false} headTilt={k > 6 ? 30 : 0} />
						</g>
					);
				})}
				<Person x={vx(T)} y={vy(vCurve(T)) - 4} s={1} color={T > 0.9 ? C.accent : C.white} armsUp={T > 0.95 ? 1 : 0} />
			</FullSvg>
			<Headline small="KAŽDÁ CESTA" big="MÁ SVOJE" big2="ÚDOLÍ." at={2} top={270} bigSize={112} />
			<PopPill at={dipF + 14} x={540} y={1640} size={28}>
				TADY VĚTŠINA LIDÍ KONČÍ
			</PopPill>
		</AbsoluteFill>
	);
};

export const CT_CHECKS = [40, 54, 68];
const CtTeam: React.FC = () => {
	const f = useCurrentFrame();
	const pull = prog(f, 10, 40);
	return (
		<AbsoluteFill>
			<FullSvg>
				<g transform={`translate(0 ${-pull * 40})`}>
					<Person x={540} y={1180} s={1.6} color={C.white} />
					<Person x={380} y={1160} s={1.4} color={C.accent} armsUp={pull} />
					<Person x={700} y={1160} s={1.4} color={C.accent} armsUp={pull} />
				</g>
			</FullSvg>
			<Headline small="ROZDÍL?" big="NEJSI NA TO" big2="SÁM." at={2} top={270} bigSize={112} />
			<div style={{position: 'absolute', top: 1260, left: 150}}>
				{['MENTOR, KTERÝ ÚDOLÍM PROŠEL', 'TÝM, KTERÝ TĚ TÁHNE', 'SYSTÉM, KTERÝ FUNGUJE'].map((t, i) => {
					const p = prog(f, CT_CHECKS[i], 12);
					return <Check key={t} text={t} o={p} dx={(1 - p) * -40} />;
				})}
			</div>
		</AbsoluteFill>
	);
};

const CT_SCENES: SceneDef[] = [
	{name: 'Hook – tady to vzdáš', dur: 105, C: CtHook},
	{name: 'Křivka motivace', dur: 300, C: CtCurve},
	{name: 'Nejsi na to sám', dur: 150, C: CtTeam},
	{name: 'CTA MENTOR', dur: 165, C: makeCta({small: 'HLEDÁŠ', big: 'MENTORA?', word: 'MENTOR', sub: 'PROVEDU TĚ ÚDOLÍM.'})},
];
export const CT_DUR = sumDur(CT_SCENES);
export const CtReel = makeReel(CT_SCENES, 'week-ct.wav');

/* #####################################################################
   PÁTEK — Den 22letého poradce
   ##################################################################### */
const DAY = [
	{h: 8, m: 0, t: 'ŠKOLA', d: 'PŘEDNÁŠKA NA VŠ'},
	{h: 12, m: 0, t: 'PŘÍPRAVA', d: 'ANALÝZA PRO KLIENTA'},
	{h: 14, m: 0, t: 'SCHŮZKA', d: 'FINANČNÍ PLÁN S KLIENTEM'},
	{h: 16, m: 30, t: 'TRÉNINK', d: 'ROZVOJ S TÝMEM'},
	{h: 18, m: 30, t: 'FITKO', d: 'HLAVA POTŘEBUJE PAUZU'},
	{h: 20, m: 0, t: 'VEČER', d: 'ČAS PRO SEBE'},
];
export const PA_STEP = 70;
const PaHook: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<FullSvg>
				<g transform="translate(540 1150)">
					<circle r={200} fill="none" stroke={C.white} strokeWidth={8} />
					{Array.from({length: 12}).map((_, i) => (
						<line key={i} x1={0} y1={-170} x2={0} y2={-188} stroke={C.white} strokeWidth={6} transform={`rotate(${i * 30})`} />
					))}
					<line x1={0} y1={0} x2={0} y2={-110} stroke={C.white} strokeWidth={10} strokeLinecap="round" transform={`rotate(${f * 2})`} />
					<line x1={0} y1={0} x2={0} y2={-160} stroke={C.accent} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 24})`} />
					<circle r={12} fill={C.accent} />
				</g>
			</FullSvg>
			<Headline small="TAKHLE VYPADÁ" big="DEN 22LETÉHO" big2="PORADCE." at={2} top={270} bigSize={104} />
		</AbsoluteFill>
	);
};

const PaDay: React.FC = () => {
	const f = useCurrentFrame();
	const idx = Math.min(DAY.length - 1, Math.floor(f / PA_STEP));
	const local = f - idx * PA_STEP;
	const p = prog(local, 0, 14, Easing.out(Easing.back(1.8)));
	const it = DAY[idx];
	return (
		<AbsoluteFill>
			{/* timeline on the left */}
			<FullSvg>
				<line x1={110} y1={560} x2={110} y2={1560} stroke={C.white} strokeOpacity={0.25} strokeWidth={4} />
				{DAY.map((d, i) => {
					const y = 560 + i * 200;
					const done = i <= idx;
					return (
						<g key={d.t}>
							<circle cx={110} cy={y} r={done ? 16 : 10} fill={done ? C.accent : C.gray} style={done ? {filter: `drop-shadow(0 0 8px ${C.accent})`} : {}} />
							<text x={146} y={y + 9} fontFamily={FONT} fontWeight={800} fontSize={24} fill={done ? C.white : C.muted}>
								{`${String(d.h).padStart(2, '0')}:${String(d.m).padStart(2, '0')}`}
							</text>
						</g>
					);
				})}
			</FullSvg>
			<div style={{position: 'absolute', top: 760, left: 300, right: 60, fontFamily: FONT, transform: `translateY(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.2)}}>
				<div style={{fontSize: 170, fontWeight: 900, color: C.accent, textShadow: glow(C.accent, 34), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
					{`${String(it.h).padStart(2, '0')}:${String(it.m).padStart(2, '0')}`}
				</div>
				<div style={{fontSize: 84, fontWeight: 900, color: C.white, marginTop: 20, textShadow: glow(C.white, 18)}}>{it.t}</div>
				<div style={{fontSize: 34, fontWeight: 800, letterSpacing: 3, color: C.muted, marginTop: 12}}>{it.d}</div>
			</div>
			<Headline small="PÁTEK" big="MŮJ ROZVRH" at={2} top={250} bigSize={96} />
			<Footnote bottom={150} o={prog(f, 30, 14)}>
				Ilustrativní den. Rozvrh si skládáš sám podle školy a klientů.
			</Footnote>
		</AbsoluteFill>
	);
};

const PaPoint: React.FC = () => (
	<AbsoluteFill>
		<Headline small="ŽÁDNÉ JACHTY. ŽÁDNÉ KECY." big="FLEXIBILITA" big2="+ REÁLNÁ PRÁCE." at={2} top={560} bigSize={100} />
	</AbsoluteFill>
);

const PA_SCENES: SceneDef[] = [
	{name: 'Hook – den poradce', dur: 105, C: PaHook},
	{name: 'Rozvrh dne', dur: DAY.length * PA_STEP + 20, C: PaDay},
	{name: 'Pointa', dur: 105, C: PaPoint},
	{name: 'CTA DEN', dur: 165, C: makeCta({small: 'JAK BY VYPADAL', big: 'TVŮJ DEN?', word: 'DEN', sub: 'PROBEREME TO SPOLU.'})},
];
export const PA_DUR = sumDur(PA_SCENES);
export const PaReel = makeReel(PA_SCENES, 'week-pa.wav');

/* #####################################################################
   NEDĚLE — Za 5 let budeš někde
   ##################################################################### */
const NeHook: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<FullSvg>
				<Person x={540} y={1300} s={2.3} headTilt={Math.sin(f / 10) * 10} />
				<line x1={540} y1={1330} x2={300} y2={1600} stroke={C.white} strokeOpacity={0.3} strokeWidth={4} strokeDasharray="10 12" />
				<line x1={540} y1={1330} x2={780} y2={1600} stroke={C.accent} strokeOpacity={0.6} strokeWidth={4} strokeDasharray="10 12" />
			</FullSvg>
			<Headline small="ZA 5 LET BUDEŠ NĚKDE." big="OTÁZKA JE" big2="KDE." at={2} top={270} bigSize={120} />
		</AbsoluteFill>
	);
};

export const NE_YEARS_END = 200;
const NeSplit: React.FC = () => {
	const f = useCurrentFrame();
	const yr = Math.min(2031, 2026 + Math.floor(interpolate(f, [10, NE_YEARS_END], [0, 5.99], clamp)));
	const prog5 = interpolate(f, [10, NE_YEARS_END], [0, 1], clamp);
	const steps = Math.floor(prog5 * 5 + 0.001);
	const end = f > NE_YEARS_END;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 500, left: 0, right: 0, textAlign: 'center'}}>
				<Pill light size={34}>
					{yr}
				</Pill>
			</div>
			<FullSvg>
				<line x1={540} y1={620} x2={540} y2={1620} stroke={C.white} strokeOpacity={0.15} strokeWidth={3} />
				{/* left: scrolling, same place */}
				<g opacity={end ? 0.5 : 1}>
					<Person x={270} y={1450} s={1.6} color={end ? C.gray : C.white} glowOn={!end} headTilt={18} />
					<rect x={300} y={1290} width={36} height={60} rx={8} fill={C.dark} stroke={C.white} strokeWidth={3} />
					{!end
						? Array.from({length: 4}).map((_, i) => {
								const k = (f + i * 12) % 48;
								return (
									<text key={i} x={318 + (rnd(i) - 0.5) * 40} y={1280 - k * 4} textAnchor="middle" fontSize={30} opacity={1 - k / 48}>
										❤️
									</text>
								);
							})
						: null}
				</g>
				{/* right: stairs */}
				{Array.from({length: 5}).map((_, i) => (
					<path
						key={i}
						d={`M ${620 + i * 70} ${1450 - i * 90} L ${620 + i * 70} ${1450 - (i + 1) * 90} L ${690 + i * 70} ${1450 - (i + 1) * 90}`}
						fill="none"
						stroke={i < steps ? C.accent : C.white}
						strokeOpacity={i < steps ? 1 : 0.25}
						strokeWidth={5}
					/>
				))}
				<Person x={620 + Math.max(0, steps - 1) * 70 + (steps ? 35 : -30)} y={1450 - steps * 90} s={1.2} color={steps >= 5 ? C.accent : C.white} armsUp={steps >= 5 ? 1 : 0} />
			</FullSvg>
			<div style={{position: 'absolute', top: 1520, left: 0, width: 540, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 2, color: C.muted}}>
				{end ? 'ZAČÍNÁ OD NULY' : 'ČEKÁ NA LEPŠÍ CHVÍLI'}
			</div>
			<div style={{position: 'absolute', top: 1520, left: 540, width: 540, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 2, color: C.accent}}>
				{end ? '5 LET NÁSKOKU' : 'STAVÍ KROK ZA KROKEM'}
			</div>
			<Headline small="STEJNÝ START." big="JINÉ" big2="ROZHODNUTÍ." at={2} top={230} bigSize={100} />
		</AbsoluteFill>
	);
};

const NE_SCENES: SceneDef[] = [
	{name: 'Hook – za 5 let', dur: 120, C: NeHook},
	{name: 'Dvě cesty', dur: 270, C: NeSplit},
	{name: 'CTA START', dur: 180, C: makeCta({small: 'KTEROU CESTOU', big: 'PŮJDEŠ TY?', word: 'START', sub: 'PRVNÍ KROK UDĚLÁME SPOLU.'})},
];
export const NE_DUR = sumDur(NE_SCENES);
export const NeReel = makeReel(NE_SCENES, 'week-ne.wav');

export const WEEK_REELS = [
	{id: 'Tyden-Po-Vyhoda', C: PoReel, dur: PO_DUR},
	{id: 'Tyden-St-Koule', C: StReel, dur: ST_DUR},
	{id: 'Tyden-Ct-Udoli', C: CtReel, dur: CT_DUR},
	{id: 'Tyden-Pa-Den', C: PaReel, dur: PA_DUR},
	{id: 'Tyden-Ne-5let', C: NeReel, dur: NE_DUR},
];

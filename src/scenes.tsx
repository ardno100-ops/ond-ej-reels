import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Car, Check, Dumpster, Footnote, Headline, Person, Pill, TrashBag} from './components';
import {C, FONT, H, W, easeInOut, easeOut, fmt, glow, prog} from './theme';

const FullSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

/* =====================================================================
   1) HOOK + REVEAL  (225 f)  — "Takhle vypadá úspěch… na Instagramu"
   ===================================================================== */
export const HOOK_DUR = 225;
export const HOOK_CUT = 120; // record scratch

export const HookReveal: React.FC = () => {
	const f = useCurrentFrame();
	const driving = f < HOOK_CUT;
	const z = prog(f, HOOK_CUT + 8, 44, easeInOut);
	const sc = interpolate(z, [0, 1], [1.8, 1]);
	const fx = interpolate(z, [0, 1], [400, 540]);
	const fy = interpolate(z, [0, 1], [1150, 1080]);
	const cy = interpolate(z, [0, 1], [1020, 1080]);
	const bob = driving ? Math.sin(f / 2.2) * 3 : 0;
	const jolt = f >= HOOK_CUT && f < HOOK_CUT + 8 ? Math.sin((f - HOOK_CUT) * 2) * 10 * (1 - (f - HOOK_CUT) / 8) : 0;
	const wheelRot = (Math.min(f, HOOK_CUT) * 38) % 360;
	const insta = 1 - prog(f, HOOK_CUT - 2, 8);
	const likes = interpolate(f, [8, 112], [0, 48213], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const tag = prog(f, 158, 14, Easing.out(Easing.back(2)));
	const rec = Math.floor(f / 12) % 2 === 0;

	return (
		<AbsoluteFill>
			{/* speed lines */}
			<FullSvg>
				{driving
					? Array.from({length: 22}).map((_, i) => {
							const y = 300 + ((i * 397) % 1400);
							const len = 120 + ((i * 53) % 260);
							const speed = 60 + ((i * 17) % 50);
							const x = W + 300 - ((f * speed + i * 211) % (W + 700));
							return (
								<line
									key={i}
									x1={x}
									y1={y}
									x2={x + len}
									y2={y}
									stroke={i % 3 === 0 ? C.accent : C.white}
									strokeOpacity={0.18 + (i % 4) * 0.08}
									strokeWidth={i % 5 === 0 ? 5 : 3}
									strokeLinecap="round"
								/>
							);
						})
					: null}
			</FullSvg>

			{/* world */}
			<FullSvg>
				<g transform={`translate(540 ${cy}) scale(${sc}) translate(${-fx} ${-fy})`}>
					{/* ground */}
					<line x1={-200} y1={1250} x2={1280} y2={1250} stroke={C.faint} strokeWidth={4} />
					{/* tripod + phone */}
					<g transform="translate(70 1250)">
						<line x1={0} y1={-150} x2={-34} y2={0} stroke={C.gray} strokeWidth={6} />
						<line x1={0} y1={-150} x2={34} y2={0} stroke={C.gray} strokeWidth={6} />
						<line x1={0} y1={-150} x2={0} y2={0} stroke={C.gray} strokeWidth={6} />
						<rect x={-22} y={-205} width={44} height={70} rx={8} fill={C.dark} stroke={C.white} strokeWidth={4} />
						{rec ? <circle cx={0} cy={-190} r={6} fill="#ff5b4d" /> : null}
					</g>
					{/* dumpsters + bags */}
					<Dumpster x={800} y={1250} s={0.95} lid={f > 150 ? 18 : 6} />
					<TrashBag x={960} y={1250} s={1} />
					<TrashBag x={1010} y={1250} s={0.8} />
					{/* flies */}
					{[0, 1, 2].map((i) => (
						<circle
							key={i}
							cx={800 + Math.sin(f / 5 + i * 2) * 60}
							cy={1020 + Math.cos(f / 4 + i) * 30}
							r={4}
							fill={C.muted}
						/>
					))}
					{/* car */}
					<g transform={`translate(${jolt} ${bob})`}>
						<Car x={400} y={1250} s={0.9} wheelRot={wheelRot} />
					</g>
					{/* rental tag */}
					{tag > 0 ? (
						<g transform={`translate(400 ${1068 - 40}) scale(${tag})`}>
							<line x1={0} y1={0} x2={0} y2={-40} stroke={C.muted} strokeWidth={3} />
							<rect x={-160} y={-112} width={320} height={72} rx={36} fill={C.white} />
							<text x={0} y={-66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} letterSpacing={2} fill={C.dark}>
								PŮJČOVNA · 2 HOD
							</text>
						</g>
					) : null}
				</g>
			</FullSvg>

			{/* Instagram overlay */}
			{insta > 0 ? (
				<AbsoluteFill style={{opacity: insta}}>
					<div
						style={{
							position: 'absolute',
							left: 60,
							right: 60,
							top: 600,
							height: 880,
							borderRadius: 40,
							border: `3px solid ${C.faint}`,
						}}
					/>
					<div style={{position: 'absolute', left: 90, top: 620, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT}}>
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: 99,
								background: `conic-gradient(${C.accent}, #f5d36b, #ff7a7a, ${C.accent})`,
								padding: 4,
							}}
						>
							<div style={{width: '100%', height: '100%', borderRadius: 99, background: C.dark}} />
						</div>
						<div style={{color: C.white, fontSize: 30, fontWeight: 800}}>uspesny.zivot</div>
						<div style={{color: C.accent, fontSize: 28, fontWeight: 900}}>✓</div>
					</div>
					<div
						style={{
							position: 'absolute',
							left: 90,
							top: 1400,
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							fontFamily: FONT,
							color: C.white,
							fontSize: 34,
							fontWeight: 800,
						}}
					>
						<span style={{color: '#ff6b7a', fontSize: 44, transform: `scale(${1 + 0.25 * Math.max(0, Math.sin(f / 3))})`}}>♥</span>
						{fmt(likes)}
						<span style={{color: C.muted, fontWeight: 600, fontSize: 26, marginLeft: 12}}>#lifestyle #mindset</span>
					</div>
				</AbsoluteFill>
			) : null}

			<Headline small="TAKHLE VYPADÁ" big="ÚSPĚCH." at={4} until={HOOK_CUT - 4} />
			<Headline small="TAKHLE VYPADÁ ÚSPĚCH" big="…NA INSTAGRAMU." at={HOOK_CUT + 14} bigSize={96} />
			{f > 176 ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 1420,
						textAlign: 'center',
						opacity: prog(f, 176, 12),
						transform: `translateY(${(1 - prog(f, 176, 12)) * 20}px)`,
					}}
				>
					<Pill light={false} size={30}>
						REALITA: PŮJČENÉ AUTO A FOTKA U POPELNIC
					</Pill>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* =====================================================================
   2) OVERLOAD (180 f) — new idea every week, result zero
   ===================================================================== */
export const OVERLOAD_DUR = 180;
export const OVERLOAD_PINGS = [10, 22, 34, 46, 58, 70, 82];
export const OVERLOAD_FAIL = 112;

const IDEAS: {t: string; x: number; y: number}[] = [
	{t: 'KRYPTO', x: 270, y: 760},
	{t: 'DROPSHIPPING', x: 770, y: 700},
	{t: 'E-SHOP', x: 220, y: 990},
	{t: 'COACHING', x: 850, y: 960},
	{t: 'TRADING', x: 250, y: 1430},
	{t: 'AI BYZNYS', x: 830, y: 1400},
	{t: 'DALŠÍ KURZ', x: 540, y: 1600},
];

export const Overload: React.FC = () => {
	const f = useCurrentFrame();
	const fail = prog(f, OVERLOAD_FAIL, 22, Easing.in(Easing.quad));
	const year = 2026 + Math.min(8, Math.floor(Math.max(0, f - 6) / 20));
	const last = OVERLOAD_PINGS.filter((p) => p <= f).length - 1;
	const target = last >= 0 ? IDEAS[last] : null;
	const tilt = target ? Math.max(-22, Math.min(22, (target.x - 540) / 14)) + Math.sin(f / 2) * 3 : 0;
	const shake = f < OVERLOAD_FAIL ? Math.sin(f * 1.7) * (last >= 0 ? 3 : 0) : 0;
	const slump = prog(f, OVERLOAD_FAIL, 20);

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center'}}>
				<Pill light size={26}>
					ROK {year}
				</Pill>
			</div>
			<FullSvg>
				<line x1={140} y1={1250} x2={940} y2={1250} stroke={C.faint} strokeWidth={4} />
				<g transform={`translate(${shake} 0)`}>
					<Person x={540} y={1250} s={2.3 - slump * 0.15} headTilt={tilt + slump * 25} color={f > OVERLOAD_FAIL ? C.gray : C.white} glowOn={f <= OVERLOAD_FAIL} />
				</g>
				{/* lines from head to ideas */}
				{IDEAS.map((idea, i) => {
					const p = prog(f, OVERLOAD_PINGS[i], 10);
					if (p <= 0) return null;
					return (
						<line
							key={idea.t}
							x1={540}
							y1={1040}
							x2={540 + (idea.x - 540) * p}
							y2={1040 + (idea.y - 1040) * p}
							stroke={C.accent}
							strokeOpacity={0.25 * (1 - fail)}
							strokeWidth={2}
							strokeDasharray="6 10"
						/>
					);
				})}
			</FullSvg>
			{IDEAS.map((idea, i) => {
				const p = prog(f, OVERLOAD_PINGS[i], 12, Easing.out(Easing.back(2.2)));
				if (p <= 0) return null;
				const wob = Math.sin((f + i * 23) / 7) * 8;
				const fall = fail * (500 + i * 60);
				const active = i === last && f < OVERLOAD_FAIL;
				return (
					<div
						key={idea.t}
						style={{
							position: 'absolute',
							left: idea.x,
							top: idea.y + wob + fall,
							transform: `translate(-50%, -50%) scale(${p}) rotate(${fail * (i % 2 ? 25 : -25)}deg)`,
							opacity: 1 - fail,
						}}
					>
						<Pill
							light={active}
							size={30}
							style={{
								filter: f > OVERLOAD_FAIL ? 'grayscale(1)' : undefined,
							}}
						>
							● {idea.t}
						</Pill>
					</div>
				);
			})}
			<Headline small="KAŽDÝ TÝDEN" big="NOVÝ NÁPAD." at={4} until={OVERLOAD_FAIL - 6} top={290} />
			<Headline small="ROZJETO: 7 · DOKONČENO: 0" big="VÝSLEDEK:" big2="NULA." at={OVERLOAD_FAIL + 6} top={290} />
		</AbsoluteFill>
	);
};

/* =====================================================================
   3) REPS (240 f) — like the gym: 1 000 reps, then step by step
   ===================================================================== */
export const REPS_DUR = 240;
export const REPS_SPLIT = 120;
const STEP_LABELS = ['NÁPAD', '1. KLIENT', '10 KLIENTŮ', 'TÝM', 'FIRMA'];
export const STEP_FRAMES = [REPS_SPLIT + 30, REPS_SPLIT + 48, REPS_SPLIT + 66, REPS_SPLIT + 84, REPS_SPLIT + 102];

/** phase of the squat animation — accelerates. Exported for audio sync. */
export const repPhase = (f: number) => {
	const t = Math.max(0, f - 8);
	return t * 0.28 + t * t * 0.0042;
};

export const Reps: React.FC = () => {
	const f = useCurrentFrame();
	const partA = f < REPS_SPLIT;
	const reps = Math.round(
		interpolate(f, [8, 112], [1, 1000], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.in(Easing.poly(3)),
		}),
	);
	const squat = (1 - Math.cos(repPhase(f))) / 2;
	const grow = interpolate(f, [8, 112], [1.9, 2.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const aOut = prog(f, REPS_SPLIT - 8, 8);
	const bIn = prog(f, REPS_SPLIT, 14);

	// staircase
	const x0 = 130;
	const y0 = 1560;
	const sw = 164;
	const sh = 125;
	const stepsShown = interpolate(f, [REPS_SPLIT + 4, REPS_SPLIT + 28], [0, 5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	let climbIdx = -1;
	STEP_FRAMES.forEach((sf, i) => {
		if (f >= sf) climbIdx = i;
	});
	const sinceStep = climbIdx >= 0 ? f - STEP_FRAMES[climbIdx] : 0;
	const hopP = Math.min(1, sinceStep / 10);
	const fromI = climbIdx - 1;
	const pos = (i: number) => ({
		x: i < 0 ? x0 - 40 : x0 + sw * i + sw / 2,
		y: i < 0 ? y0 : y0 - sh * (i + 1),
	});
	const a = pos(fromI);
	const b = pos(climbIdx);
	const px = climbIdx < 0 ? a.x : a.x + (b.x - a.x) * easeOut(hopP);
	const py = climbIdx < 0 ? a.y : a.y + (b.y - a.y) * hopP - Math.sin(hopP * Math.PI) * 50;

	return (
		<AbsoluteFill>
			{partA ? (
				<AbsoluteFill style={{opacity: 1 - aOut}}>
					<FullSvg>
						<line x1={140} y1={1300} x2={940} y2={1300} stroke={C.faint} strokeWidth={4} />
						<Person x={540} y={1300} s={grow} squat={squat} barbell />
					</FullSvg>
					<div
						style={{
							position: 'absolute',
							top: 1360,
							left: 0,
							right: 0,
							textAlign: 'center',
							fontFamily: FONT,
						}}
					>
						<div
							style={{
								fontSize: 170,
								fontWeight: 900,
								color: reps >= 1000 ? C.accent : C.white,
								textShadow: glow(reps >= 1000 ? C.accent : C.white, 30),
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{fmt(reps)}×
						</div>
						<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.muted}}>OPAKOVÁNÍ</div>
					</div>
					<Headline small="ÚSPĚCH NENÍ PŘES NOC." big="JE TO" big2="1 000 OPÁČEK." at={4} until={REPS_SPLIT - 8} top={290} />
				</AbsoluteFill>
			) : (
				<AbsoluteFill style={{opacity: bIn}}>
					<FullSvg>
						<line x1={60} y1={y0} x2={x0} y2={y0} stroke={C.white} strokeWidth={5} />
						{STEP_LABELS.map((label, i) => {
							const p = Math.max(0, Math.min(1, stepsShown - i));
							if (p <= 0) return null;
							const sx = x0 + sw * i;
							const sy = y0 - sh * i;
							const reached = i <= climbIdx;
							return (
								<g key={label} opacity={p}>
									<path
										d={`M ${sx} ${sy} L ${sx} ${sy - sh} L ${sx + sw} ${sy - sh}`}
										fill="none"
										stroke={reached ? C.accent : C.white}
										strokeWidth={5}
										style={reached ? {filter: `drop-shadow(0 0 8px ${C.accent})`} : {}}
									/>
									<text
										x={sx + sw / 2}
										y={sy - sh + 46}
										textAnchor="middle"
										fontFamily={FONT}
										fontWeight={800}
										fontSize={24}
										letterSpacing={1.5}
										fill={reached ? C.accent : C.muted}
									>
										{label}
									</text>
									<text x={sx + sw / 2} y={sy - sh + 78} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={20} fill={C.muted}>
										{`ROK ${i + 1}`}
									</text>
								</g>
							);
						})}
						<Person x={px} y={py} s={1.15} color={climbIdx >= 4 ? C.accent : C.white} armsUp={climbIdx >= 4 ? prog(f, STEP_FRAMES[4] + 8, 10) : 0} />
					</FullSvg>
					<Headline small="JAKO VE FITKU:" big="KROK" big2="ZA KROKEM." at={REPS_SPLIT + 4} top={290} />
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

/* =====================================================================
   4) PROBLEM (105 f) — but what if you don't have the idea?
   ===================================================================== */
export const PROBLEM_DUR = 105;
export const PROBLEM_Q = 22;

export const Problem: React.FC = () => {
	const f = useCurrentFrame();
	const q = prog(f, PROBLEM_Q, 14, Easing.out(Easing.back(2.5)));
	const dash = prog(f, 6, 40);
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={140} y1={1300} x2={940} y2={1300} stroke={C.faint} strokeWidth={4} />
				{/* start line */}
				<line x1={300} y1={1240} x2={300} y2={1360} stroke={C.white} strokeWidth={6} />
				<text x={300} y={1400} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={3} fill={C.muted}>
					START
				</text>
				{/* empty path */}
				<line x1={320} y1={1300} x2={320 + 600 * dash} y2={1300} stroke={C.accent} strokeOpacity={0.5} strokeWidth={5} strokeDasharray="14 18" />
				<Person x={230} y={1300} s={2.1} headTilt={Math.sin(f / 9) * 8} />
				{q > 0 ? (
					<text
						x={230}
						y={1020}
						textAnchor="middle"
						fontFamily={FONT}
						fontWeight={900}
						fontSize={130}
						fill={C.accent}
						transform={`rotate(${Math.sin(f / 6) * 8} 230 980) scale(1)`}
						style={{filter: `drop-shadow(0 0 18px ${C.accent})`}}
						opacity={q}
					>
						?
					</text>
				) : null}
				{[0, 1, 2].map((i) => {
					const p = prog(f, 40 + i * 10, 12);
					return (
						<text key={i} x={520 + i * 140} y={1250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.faint} opacity={p}>
							?
						</text>
					);
				})}
			</FullSvg>
			<Headline small="JENŽE CO KDYŽ" big="NEMÁŠ TEN" big2="NÁPAD?" at={4} top={290} />
		</AbsoluteFill>
	);
};

/* =====================================================================
   5) SOLUTION (255 f) — finance business, market, system
   ===================================================================== */
export const SOLUTION_DUR = 255;
export const SOL_B = 90;
export const SOL_C = 172;
export const SOL_CHECKS = [SOL_C + 22, SOL_C + 36, SOL_C + 50];

const Stat: React.FC<{value: string; label: string; o: number; y: number}> = ({value, label, o, y}) => (
	<div
		style={{
			position: 'absolute',
			top: y,
			left: 0,
			right: 0,
			textAlign: 'center',
			fontFamily: FONT,
			opacity: o,
			transform: `translateY(${(1 - o) * 30}px)`,
		}}
	>
		<div style={{fontSize: 150, fontWeight: 900, color: C.accent, textShadow: glow(C.accent, 32), fontVariantNumeric: 'tabular-nums'}}>{value}</div>
		<div style={{fontSize: 32, fontWeight: 800, letterSpacing: 4, color: C.white, marginTop: -6}}>{label}</div>
	</div>
);

export const Solution: React.FC = () => {
	const f = useCurrentFrame();
	const aOut = prog(f, SOL_B - 8, 8);
	const bOut = prog(f, SOL_C - 8, 8);
	const tagP = prog(f, 4, 14);

	// part B counters
	const c1 = interpolate(f, [SOL_B + 6, SOL_B + 40], [0, 2.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
	const c2 = interpolate(f, [SOL_B + 26, SOL_B + 60], [0, 20800], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});

	return (
		<AbsoluteFill>
			{f < SOL_B ? (
				<AbsoluteFill style={{opacity: 1 - aOut}}>
					<div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', opacity: tagP}}>
						<Pill light size={26}>
							ŘEŠENÍ
						</Pill>
					</div>
					<Headline small="NEMUSÍŠ VYMÝŠLET KOLO." big="PODNIKÁNÍ" big2="VE FINANCÍCH." at={6} top={300} bigSize={104} />
					<FullSvg>
						{Array.from({length: 40}).map((_, i) => {
							const col = i % 8;
							const row = Math.floor(i / 8);
							const p = prog(f, 20 + i * 1.1, 10);
							const lit = (i * 7) % 5 === 0;
							return (
								<g key={i} opacity={p}>
									<Person
										x={190 + col * 100}
										y={900 + row * 150}
										s={0.7}
										color={lit && f > 55 ? C.accent : C.gray}
										glowOn={lit && f > 55}
									/>
								</g>
							);
						})}
					</FullSvg>
				</AbsoluteFill>
			) : null}

			{f >= SOL_B && f < SOL_C ? (
				<AbsoluteFill style={{opacity: prog(f, SOL_B, 10) * (1 - bOut)}}>
					<Headline small="NÁPAD NEPOTŘEBUJEŠ." big="TRH UŽ TU JE." at={SOL_B} top={260} bigSize={100} />
					<Stat value={`${c1.toFixed(1).replace('.', ',')} MIL.`} label="POTENCIÁLNÍCH KLIENTŮ" o={prog(f, SOL_B + 4, 14)} y={640} />
					<Stat value={fmt(c2)} label="VOLNÝCH PORADENSKÝCH MÍST" o={prog(f, SOL_B + 24, 14)} y={1000} />
					<Footnote bottom={330} o={prog(f, SOL_B + 30, 14)}>
						Odhad skupiny Partners pro ČR, 2025.
					</Footnote>
				</AbsoluteFill>
			) : null}

			{f >= SOL_C ? (
				<AbsoluteFill style={{opacity: prog(f, SOL_C, 10)}}>
					<Headline small="A K TOMU" big="HOTOVÝ SYSTÉM." at={SOL_C} top={300} bigSize={100} />
					<div style={{position: 'absolute', top: 760, left: 150}}>
						{['ZAŠKOLENÍ 6–8 TÝDNŮ ZDARMA', 'MENTOR, KTERÝ TÍM UŽ PROŠEL', 'START I PŘI ŠKOLE NEBO PRÁCI'].map((t, i) => {
							const p = prog(f, SOL_CHECKS[i], 12);
							return <Check key={t} text={t} o={p} dx={(1 - p) * -40} />;
						})}
					</div>
					<Footnote bottom={330} o={prog(f, SOL_C + 60, 14)}>
						Výsledky závisí na tvé práci a nasazení.
					</Footnote>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

/* =====================================================================
   6) CTA (180 f)
   ===================================================================== */
export const CTA_DUR = 180;
export const CTA_STOP = 40;
export const CTA_BTN = 66;

export const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const drive = prog(f, 0, CTA_STOP, Easing.out(Easing.cubic));
	const carX = interpolate(drive, [0, 1], [-420, 540]);
	const settle = f > CTA_STOP && f < CTA_STOP + 12 ? Math.sin((f - CTA_STOP) * 1.4) * 6 * (1 - (f - CTA_STOP) / 12) : 0;
	const wheelRot = drive * 1400;
	const btn = prog(f, CTA_BTN, 14, Easing.out(Easing.back(2)));
	const pulse = f > CTA_BTN + 14 ? 1 + Math.sin((f - CTA_BTN) / 6) * 0.025 : 1;
	return (
		<AbsoluteFill>
			<FullSvg>
				<ellipse cx={540} cy={1200} rx={420} ry={40} fill={C.accent} opacity={0.08 * drive} />
				<line x1={60} y1={1200} x2={1020} y2={1200} stroke={C.faint} strokeWidth={4} />
				<g transform={`translate(0 ${settle})`}>
					<Car x={carX} y={1200} s={0.95} wheelRot={wheelRot} />
				</g>
			</FullSvg>
			<Headline small="ZAJÍMÁ TĚ" big="PODNIKÁNÍ?" at={CTA_STOP - 18} top={300} bigSize={120} />
			<div
				style={{
					position: 'absolute',
					top: 600,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 32,
					letterSpacing: 2,
					color: C.muted,
					opacity: prog(f, CTA_STOP, 14),
				}}
			>
				NE PŘES NOC. ALE KROK ZA KROKEM.
			</div>
			<div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', opacity: btn > 0 ? 1 : 0}}>
				<div style={{display: 'inline-block', transform: `scale(${btn * pulse})`}}>
					<Pill light size={46}>
						NAPIŠ MI „START“
					</Pill>
				</div>
				<div
					style={{
						marginTop: 34,
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 28,
						letterSpacing: 4,
						color: C.muted,
						opacity: prog(f, CTA_BTN + 12, 12),
					}}
				>
					UKÁŽU TI, JAK ZAČÍT.
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 150,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 24,
					letterSpacing: 4,
					color: C.white,
					opacity: prog(f, CTA_BTN + 20, 14),
				}}
			>
				ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
			</div>
		</AbsoluteFill>
	);
};

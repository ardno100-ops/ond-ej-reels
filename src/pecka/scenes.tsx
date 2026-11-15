import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote, Headline, Person, Pill} from '../components';
import {Ladder, rungY} from '../plan/scenes';
import {C, FONT, H, W, fmt, glow, prog} from '../theme';

const FullSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

/** Deterministic pseudo-random in [0,1). */
const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

/* =====================================================================
   CHART (300 f) — příjem v čase: zaměstnání vs. podnikání, rozbitý strop
   ===================================================================== */
export const CHART_DUR = 300;
const CH_L = 150;
const CH_R = 950;
const CH_B = 1480;
const CH_T = 760;
const CEIL = 0.52;
const T_START = 20;
const T_END = 230;
const yearAt = (f: number) => interpolate(f, [T_START, T_END], [0, 10], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const px = (t: number) => CH_L + (t / 10) * (CH_R - CH_L);
const py = (v: number) => CH_B - v * (CH_B - CH_T);
const emp = (t: number) => 0.3 + 0.2 * (1 - Math.exp(-t / 4));
const biz = (t: number) => 0.14 * Math.exp(0.27 * t) - (t < 2.5 ? 0.07 * Math.sin((Math.PI * t) / 2.5) : 0);
const BIZ_MAX_V = 1.12;
// year in which business hits the ceiling
const T_CEIL = (() => {
	let t = 0;
	while (biz(t) < CEIL) t += 0.01;
	return t;
})();
export const SHATTER = Math.round(T_START + (T_CEIL / 10) * (T_END - T_START));
const T_TOP = (() => {
	let t = 0;
	while (biz(t) < BIZ_MAX_V) t += 0.01;
	return t;
})();

const curve = (fn: (t: number) => number, tMax: number, clampV = 99) => {
	const pts: string[] = [];
	for (let t = 0; t <= tMax + 1e-6; t += 0.05) pts.push(`${px(t).toFixed(1)},${py(Math.min(clampV, fn(t))).toFixed(1)}`);
	return pts.join(' ');
};

export const Chart: React.FC = () => {
	const f = useCurrentFrame();
	const t = yearAt(f);
	const axes = prog(f, 0, 16);
	const shook = f >= SHATTER && f < SHATTER + 12 ? (1 - (f - SHATTER) / 12) * 14 : 0;
	const sx = Math.sin(f * 3.1) * shook;
	const sy = Math.cos(f * 2.3) * shook;
	const flash = f >= SHATTER && f < SHATTER + 5 ? 0.35 * (1 - (f - SHATTER) / 5) : 0;
	const gap = f >= SHATTER ? prog(f, SHATTER, 10) * 70 : 0;
	const cx = px(T_CEIL);
	const cy = py(CEIL);
	const tb = Math.min(t, T_TOP);
	const endB = {x: px(tb), y: py(Math.min(BIZ_MAX_V, biz(tb)))};
	const endE = {x: px(t), y: py(emp(t))};
	const ceilPulse = f < SHATTER && f > SHATTER - 30 ? 0.5 + 0.5 * Math.sin(f * 0.9) : 0;

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
				<FullSvg>
					<g opacity={axes}>
						<line x1={CH_L} y1={CH_B} x2={CH_R} y2={CH_B} stroke={C.white} strokeOpacity={0.5} strokeWidth={4} />
						<line x1={CH_L} y1={CH_B} x2={CH_L} y2={CH_T - 60} stroke={C.white} strokeOpacity={0.3} strokeWidth={3} />
						{[0, 2, 4, 6, 8, 10].map((y) => (
							<text key={y} x={px(y)} y={CH_B + 44} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.muted}>
								{y === 0 ? 'START' : `${y}. ROK`}
							</text>
						))}
						<text x={CH_L - 18} y={CH_T - 74} fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={3} fill={C.muted}>
							PŘÍJEM
						</text>
					</g>
					{/* ceiling */}
					<g opacity={prog(f, 14, 12)}>
						<line x1={CH_L} y1={cy} x2={cx - gap} y2={cy} stroke="#ff8a7a" strokeWidth={5} strokeDasharray="18 12" strokeOpacity={0.8 + ceilPulse * 0.2} />
						<line x1={cx + gap} y1={cy} x2={CH_R} y2={cy} stroke="#ff8a7a" strokeWidth={5} strokeDasharray="18 12" strokeOpacity={0.8 + ceilPulse * 0.2} />
						<text x={CH_R} y={cy - 18} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={30} letterSpacing={4} fill="#ff8a7a">
							STROP
						</text>
					</g>
					{/* employment */}
					{t > 0 ? (
						<g>
							<polyline points={curve(emp, t)} fill="none" stroke={C.white} strokeOpacity={0.75} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
							<circle cx={endE.x} cy={endE.y} r={11} fill={C.white} />
						</g>
					) : null}
					{/* business */}
					{t > 0 ? (
						<g style={{filter: `drop-shadow(0 0 14px ${C.accent})`}}>
							<polyline points={curve(biz, tb, BIZ_MAX_V)} fill="none" stroke={C.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
							{t >= T_TOP ? (
								<path d={`M ${endB.x - 26} ${endB.y + 20} L ${endB.x} ${endB.y - 14} L ${endB.x + 26} ${endB.y + 20}`} fill="none" stroke={C.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
							) : (
								<circle cx={endB.x} cy={endB.y} r={13} fill={C.accent} />
							)}
						</g>
					) : null}
					{/* shards */}
					{f >= SHATTER
						? Array.from({length: 26}).map((_, i) => {
								const a = rnd(i) * Math.PI * 2;
								const sp = 8 + rnd(i + 50) * 16;
								const k = f - SHATTER;
								const x = cx + Math.cos(a) * sp * k;
								const y = cy + Math.sin(a) * sp * k + 0.9 * k * k;
								const o = Math.max(0, 1 - k / 34);
								const s = 6 + rnd(i + 99) * 14;
								return (
									<polygon
										key={i}
										points={`0,${-s} ${s * 0.7},${s * 0.6} ${-s * 0.6},${s * 0.4}`}
										transform={`translate(${x} ${y}) rotate(${k * 18 * (rnd(i + 7) - 0.5)})`}
										fill="#ffb3a8"
										opacity={o}
									/>
								);
							})
						: null}
					{/* labels */}
					{f > 40 && f < SHATTER ? (
						<g opacity={prog(f, 40, 10) * (1 - prog(f, SHATTER - 12, 10))}>
							<text x={px(1.2)} y={py(biz(1.2)) + 64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={2} fill={C.accent}>
								START JE TĚŽŠÍ
							</text>
						</g>
					) : null}
					{f > 200 ? (
						<g opacity={prog(f, 200, 12)}>
							<text x={CH_R} y={py(emp(10)) + 52} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing={3} fill={C.white}>
								ZAMĚSTNÁNÍ
							</text>
							<text x={endB.x - 40} y={endB.y + 10} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={32} letterSpacing={3} fill={C.accent}>
								PODNIKÁNÍ
							</text>
						</g>
					) : null}
				</FullSvg>
			</AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: '#ffffff', opacity: flash}} />
			<Headline small="PŘÍJEM V ČASE" big="ZAMĚSTNÁNÍ" big2="VS. PODNIKÁNÍ" at={2} until={SHATTER - 4} top={230} bigSize={92} />
			<Headline small="ZAMĚSTNÁNÍ MÁ STROP." big="PODNIKÁNÍ" big2="NEMÁ." at={SHATTER + 4} top={230} bigSize={110} />
			<Footnote bottom={150} o={prog(f, 210, 14)}>
				Ilustrativní srovnání, ne garance příjmu. Podnikání nese i vlastní riziko.
			</Footnote>
		</AbsoluteFill>
	);
};

/* =====================================================================
   CROWD (165 f) — víc než polovina chce podnikat… ale nemá nápad
   ===================================================================== */
export const CROWD_DUR = 165;
export const CROWD_NO = 86;
const COLS = 5;
const ROWS = 4;
const wants = (i: number) => (i * 7) % 20 < 11;

const Bulb: React.FC<{x: number; y: number; s?: number; on: number; q?: boolean}> = ({x, y, s = 1, on, q = false}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<circle cx={0} cy={-16} r={16} fill={on > 0.5 ? C.accent : 'none'} stroke={on > 0.5 ? C.accent : C.gray} strokeWidth={3.5} style={on > 0.5 ? {filter: `drop-shadow(0 0 8px ${C.accent})`} : {}} />
		<rect x={-7} y={1} width={14} height={9} rx={2} fill={on > 0.5 ? C.accent : C.gray} />
		{q ? (
			<text x={0} y={-7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.muted}>
				?
			</text>
		) : null}
	</g>
);

export const Crowd: React.FC = () => {
	const f = useCurrentFrame();
	const no = f >= CROWD_NO;
	return (
		<AbsoluteFill>
			<FullSvg>
				{Array.from({length: COLS * ROWS}).map((_, i) => {
					const c = i % COLS;
					const r = Math.floor(i / COLS);
					const x = 190 + c * 175;
					const y = 1000 + r * 205;
					const appear = prog(f, 4 + (c + r) * 2, 10);
					const w = wants(i);
					const lit = w && f >= 22 + i * 2;
					const flick = no ? (f < CROWD_NO + 12 ? (Math.floor((f + i) / 2) % 2 === 0 ? 1 : 0) : 0) : 1;
					const color = lit && !no ? C.accent : no && w ? '#8aa392' : C.gray;
					return (
						<g key={i} opacity={appear}>
							<Person x={x} y={y} s={0.9} color={color} glowOn={lit && !no} headTilt={no && w ? 14 : 0} />
							{lit ? <Bulb x={x} y={y - 128} s={1.1} on={no ? flick : 1} q={no && f >= CROWD_NO + 12} /> : null}
						</g>
					);
				})}
			</FullSvg>
			<Headline small="VÍC NEŽ POLOVINA LIDÍ" big="CHCE PODNIKAT." at={2} until={CROWD_NO - 6} top={260} bigSize={100} />
			<Headline small="JENŽE VĚTŠINA" big="NEMÁ NÁPAD." at={CROWD_NO} top={260} bigSize={110} />
			<Footnote bottom={150} o={prog(f, 30, 14)}>
				Randstad Workmonitor: podnikání by lákalo 56 % českých zaměstnanců.
			</Footnote>
		</AbsoluteFill>
	);
};

/* =====================================================================
   IDEA (165 f) — ten já mám
   ===================================================================== */
export const IDEA_DUR = 165;
export const IDEA_ON = 26;
export const IDEA_PILLS = [62, 76, 90];

export const Idea: React.FC = () => {
	const f = useCurrentFrame();
	const flicker = f >= 12 && f < IDEA_ON ? [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0][f - 12] ?? 0 : 0;
	const on = f >= IDEA_ON ? 1 : flicker;
	const punch = f >= IDEA_ON ? 1 + 0.18 * Math.exp(-(f - IDEA_ON) / 5) : 1;
	const smile = prog(f, IDEA_ON + 14, 14, Easing.out(Easing.back(2.5)));
	const rays = f >= IDEA_ON ? prog(f, IDEA_ON, 14) : 0;
	return (
		<AbsoluteFill>
			<FullSvg>
				<g transform={`translate(540 1010) scale(${punch})`}>
					{/* rays */}
					<g opacity={rays} transform={`rotate(${f * 0.8})`}>
						{Array.from({length: 16}).map((_, i) => (
							<line key={i} x1={0} y1={-220} x2={0} y2={-300 - (i % 2) * 50} stroke={C.accent} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 22.5})`} opacity={0.7} />
						))}
					</g>
					{on ? <circle r={260} fill={C.accent} opacity={0.1} /> : null}
					<g style={on ? {filter: `drop-shadow(0 0 40px ${C.accent})`} : {}}>
						<path
							d="M 0 -170 C 100 -170 160 -95 160 -15 C 160 50 120 85 92 120 C 76 140 72 160 72 180 L -72 180 C -72 160 -76 140 -92 120 C -120 85 -160 50 -160 -15 C -160 -95 -100 -170 0 -170 Z"
							fill={on ? C.accent : C.dark}
							stroke={on ? C.accent : C.gray}
							strokeWidth={8}
						/>
						<path d="M -40 180 L -40 100 Q -40 60 0 60 Q 40 60 40 100 L 40 180" fill="none" stroke={on ? C.dark : C.gray} strokeWidth={8} strokeOpacity={0.6} />
						<rect x={-78} y={192} width={156} height={30} rx={10} fill={on ? C.white : C.gray} />
						<rect x={-68} y={230} width={136} height={30} rx={10} fill={on ? C.white : C.gray} />
						<rect x={-40} y={268} width={80} height={22} rx={10} fill={on ? C.white : C.gray} />
					</g>
				</g>
			</FullSvg>
			{smile > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: 790,
						top: 640,
						fontSize: 150,
						transform: `scale(${smile}) rotate(${Math.sin(f / 5) * 10}deg)`,
						filter: `drop-shadow(0 0 24px ${C.accent}88)`,
					}}
				>
					😃
				</div>
			) : null}
			<Headline small="NÁPAD?" big="TEN JÁ MÁM." at={IDEA_ON - 2} top={260} bigSize={124} />
			<div style={{position: 'absolute', top: 1360, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
				{['20 LET PROVĚŘENÉ KNOW-HOW', 'ZAŠKOLENÍ ZA 100 000 Kč ZDARMA', 'MENTOR, TÝM A ZÁZEMÍ'].map((t, i) => {
					const p = prog(f, IDEA_PILLS[i], 12, Easing.out(Easing.back(2)));
					return (
						<div key={t} style={{transform: `scale(${p})`, opacity: p > 0 ? 1 : 0}}>
							<Pill light={i === 1} size={30}>
								{t}
							</Pill>
						</div>
					);
				})}
			</div>
			<Footnote bottom={150} o={prog(f, IDEA_PILLS[2] + 10, 14)}>
				Vzdělávání hradí firma – neplatíš nic, i kdyby ke spolupráci nedošlo.
			</Footnote>
		</AbsoluteFill>
	);
};

/* =====================================================================
   LADDER (150 f) — fast climb, podíl roste
   ===================================================================== */
export const LADDER_DUR = 150;
export const L_FIRST = 12;
export const L_EVERY = 9;
export const L_FIVE = 100;

export const FastLadder: React.FC = () => {
	const f = useCurrentFrame();
	const climb = Math.max(0, Math.min(8, (f - L_FIRST) / L_EVERY));
	const reached = Math.floor(climb + 0.001);
	const top = L_FIRST + 8 * L_EVERY;
	const five = prog(f, L_FIVE, 12, Easing.out(Easing.back(2)));
	return (
		<AbsoluteFill>
			<FullSvg>
				<Ladder reached={reached} climb={climb} showShare shareLabel={prog(f, top + 4, 10)} />
			</FullSvg>
			<Headline small="9 STUPŇŮ. JASNÁ PRAVIDLA." big="ČÍM VÝŠ," big2="TÍM VĚTŠÍ PODÍL." at={2} top={230} bigSize={88} />
			{five > 0 ? (
				<div style={{position: 'absolute', left: 540, top: rungY(8) - 150, transform: `translate(-30%, 0) scale(${five})`}}>
					<Pill light size={28}>
						PARTNER NEJRYCHLEJI ZA 5 LET
					</Pill>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* =====================================================================
   MARKET (225 f) — jediný strop je potenciál trhu
   ===================================================================== */
export const MARKET_DUR = 225;
export const M_COUNT1 = 60;
export const M_COUNT2 = 120;
const DOT_COLS = 12;
const DOT_ROWS = 9;
const LIT = 18; // ~516 200 / 3 016 200 of 108 dots

export const Market: React.FC = () => {
	const f = useCurrentFrame();
	const c1 = interpolate(f, [M_COUNT1, M_COUNT1 + 40], [0, 2500000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const c2 = interpolate(f, [M_COUNT2, M_COUNT2 + 34], [0, 20800], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill>
			<FullSvg>
				{Array.from({length: DOT_COLS * DOT_ROWS}).map((_, i) => {
					const c = i % DOT_COLS;
					const r = Math.floor(i / DOT_COLS);
					const lit = i < LIT;
					const p = prog(f, 6 + i * 0.4, 8);
					const free = !lit && f > M_COUNT1;
					const tw = free ? 0.55 + 0.45 * Math.sin(f / 6 + i) : 1;
					return (
						<circle
							key={i}
							cx={170 + c * 67}
							cy={690 + r * 54}
							r={lit ? 15 : 13}
							fill={lit ? C.accent : C.white}
							opacity={p * (lit ? 1 : 0.28 * tw + (free ? 0.15 : 0))}
							style={lit ? {filter: `drop-shadow(0 0 6px ${C.accent})`} : {}}
						/>
					);
				})}
			</FullSvg>
			<div
				style={{
					position: 'absolute',
					top: 1180,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'center',
					gap: 40,
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 24,
					letterSpacing: 2,
					opacity: prog(f, 30, 12),
				}}
			>
				<span style={{color: C.accent}}>● KLIENTI DNES 516 200</span>
				<span style={{color: C.muted}}>● VOLNÝ TRH</span>
			</div>
			<div style={{position: 'absolute', top: 1260, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, opacity: prog(f, M_COUNT1, 10)}}>
				<div style={{fontSize: 136, fontWeight: 900, color: C.accent, textShadow: glow(C.accent, 32), fontVariantNumeric: 'tabular-nums'}}>{fmt(c1)}</div>
				<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 4, color: C.white, marginTop: -4}}>VOLNÝCH KLIENTŮ</div>
			</div>
			<div style={{position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, opacity: prog(f, M_COUNT2, 10)}}>
				<div style={{fontSize: 104, fontWeight: 900, color: C.white, textShadow: glow(C.white, 22), fontVariantNumeric: 'tabular-nums'}}>{fmt(c2)}</div>
				<div style={{fontSize: 28, fontWeight: 800, letterSpacing: 4, color: C.muted, marginTop: -4}}>VOLNÝCH MÍST PRO PORADCE</div>
			</div>
			<Headline small="JEDINÝ STROP?" big="POTENCIÁL" big2="TRHU." at={2} top={230} bigSize={110} />
			<Footnote bottom={110} o={prog(f, M_COUNT2 + 20, 14)}>
				Zdroj: karierajinak.cz – odhad trhu pro ČR, 2025.
			</Footnote>
		</AbsoluteFill>
	);
};

/* =====================================================================
   CTA (180 f)
   ===================================================================== */
export const PCTA_DUR = 180;
export const PCTA_SMILE = 26;
export const PCTA_BTN = 50;

export const PeckaCta: React.FC = () => {
	const f = useCurrentFrame();
	const smile = prog(f, PCTA_SMILE, 16, Easing.out(Easing.back(3)));
	const btn = prog(f, PCTA_BTN, 14, Easing.out(Easing.back(2)));
	const pulse = f > PCTA_BTN + 14 ? 1 + Math.sin((f - PCTA_BTN) / 6) * 0.03 : 1;
	return (
		<AbsoluteFill>
			<FullSvg>
				<circle cx={540} cy={1000} r={190 + Math.sin(f / 8) * 8} fill="none" stroke={C.accent} strokeWidth={4} opacity={0.4 * smile} />
				<circle cx={540} cy={1000} r={240 + Math.sin(f / 10) * 10} fill="none" stroke={C.accent} strokeWidth={2} opacity={0.2 * smile} />
			</FullSvg>
			{smile > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 1000,
						fontSize: 250,
						lineHeight: 1,
						transform: `translate(-50%,-50%) scale(${smile}) rotate(${Math.sin(f / 7) * 8}deg)`,
						filter: `drop-shadow(0 0 40px ${C.accent}88)`,
					}}
				>
					😃
				</div>
			) : null}
			<Headline small="CHCEŠ PODNIKAT," big="ALE NEMÁŠ" big2="NÁPAD?" at={2} top={260} bigSize={118} />
			<div style={{position: 'absolute', top: 1310, left: 0, right: 0, textAlign: 'center', opacity: btn > 0 ? 1 : 0}}>
				<div style={{display: 'inline-block', transform: `scale(${btn * pulse})`}}>
					<Pill light size={48}>
						NAPIŠ MI „NÁPAD“
					</Pill>
				</div>
				<div style={{marginTop: 34, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.accent, opacity: prog(f, PCTA_BTN + 12, 12)}}>
					TEN UŽ MÁM PŘIPRAVENÝ.
				</div>
				<div style={{marginTop: 18, fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.muted, opacity: prog(f, PCTA_BTN + 22, 12)}}>
					VÍC NA KARIERAJINAK.CZ
				</div>
			</div>
			<Footnote bottom={220} o={prog(f, PCTA_BTN + 26, 14)}>
				Spolupráce na živnostenský list. Výsledky závisí na tvé práci.
			</Footnote>
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
					opacity: prog(f, PCTA_BTN + 26, 14),
				}}
			>
				ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
			</div>
		</AbsoluteFill>
	);
};

/* small helper used by the reel: punch-in on scene start */
export const PunchIn: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	const s = 1 + 0.06 * Math.exp(-f / 5);
	return <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};


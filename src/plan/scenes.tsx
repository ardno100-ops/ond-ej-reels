import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote, Headline, Person, Pill} from '../components';
import {C, FONT, H, W, easeInOut, glow, prog} from '../theme';

const FullSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

const Coin: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 22, o = 1}) => (
	<g transform={`translate(${x} ${y})`} opacity={o} style={{filter: `drop-shadow(0 0 8px ${C.accent}aa)`}}>
		<circle r={r} fill={C.accent} />
		<circle r={r * 0.72} fill="none" stroke={C.dark} strokeOpacity={0.35} strokeWidth={3} />
		<text y={r * 0.32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.85} fill={C.dark}>
			Kč
		</text>
	</g>
);

/* =====================================================================
   1) HOOK (240 f) — kolik vyděláš firmě a kolik z toho vidíš ty
   ===================================================================== */
export const HOOK_DUR = 240;
export const COIN_EVERY = 6;
export const COIN_FIRST = 12;
export const COIN_COUNT = 17;
export const COIN_FLIGHT = 18;
export const PAY_DROP = 138;
const DESK_X = 320;
const BASE = 1360;
const TOWER_X = 790;

const towerH = (landed: number) => 260 + landed * 26;

export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const landed = Array.from({length: COIN_COUNT}).filter((_, i) => f >= COIN_FIRST + i * COIN_EVERY + COIN_FLIGHT).length;
	const th = towerH(landed);
	const top = BASE - th;
	const pay = prog(f, PAY_DROP, 26, Easing.in(Easing.quad));
	const payLabel = prog(f, PAY_DROP + 28, 12, Easing.out(Easing.back(2)));
	const typing = f < 120 ? Math.sin(f / 2) * 3 : 0;

	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={80} y1={BASE} x2={1000} y2={BASE} stroke={C.faint} strokeWidth={4} />
				{/* tower FIRMA */}
				<g style={{filter: `drop-shadow(0 0 22px ${C.accent}44)`}}>
					<rect x={TOWER_X - 120} y={top} width={240} height={th} rx={10} fill={C.white} />
					{Array.from({length: Math.floor((th - 70) / 56)}).map((_, r) =>
						[0, 1, 2].map((c) => (
							<rect key={`${r}-${c}`} x={TOWER_X - 90 + c * 64} y={top + 64 + r * 56} width={44} height={30} rx={5} fill={C.dark} opacity={0.85} />
						)),
					)}
				</g>
				<text x={TOWER_X} y={top - 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} letterSpacing={6} fill={C.accent} style={{filter: `drop-shadow(0 0 12px ${C.accent})`}}>
					FIRMA
				</text>
				{/* person at desk */}
				<g transform={`translate(0 ${typing * 0.3})`}>
					<Person x={DESK_X} y={BASE} s={1.9} headTilt={f < 120 ? 8 : Math.sin(f / 10) * 4} />
				</g>
				<rect x={DESK_X - 150} y={BASE - 120} width={300} height={22} rx={8} fill={C.gray} />
				<rect x={DESK_X - 130} y={BASE - 98} width={14} height={98} fill={C.gray} />
				<rect x={DESK_X + 116} y={BASE - 98} width={14} height={98} fill={C.gray} />
				<path d={`M ${DESK_X - 20} ${BASE - 120} L ${DESK_X + 70} ${BASE - 120} L ${DESK_X + 54} ${BASE - 186} L ${DESK_X - 36} ${BASE - 186} Z`} fill={C.dark} stroke={C.white} strokeWidth={4} />
				{/* flying coins */}
				{Array.from({length: COIN_COUNT}).map((_, i) => {
					const start = COIN_FIRST + i * COIN_EVERY;
					const p = (f - start) / COIN_FLIGHT;
					if (p < 0 || p > 1) return null;
					const tgtY = BASE - towerH(i) - 10;
					const x = DESK_X + (TOWER_X - DESK_X) * p;
					const y = BASE - 230 + (tgtY - (BASE - 230)) * p - Math.sin(p * Math.PI) * 260;
					return <Coin key={i} x={x} y={y} />;
				})}
				{/* the one coin coming back */}
				{f >= PAY_DROP ? (
					<Coin
						x={TOWER_X + (DESK_X - TOWER_X) * pay}
						y={top - 10 + (BASE - 300 - (top - 10)) * pay - Math.sin(pay * Math.PI) * 120}
						r={16}
					/>
				) : null}
			</FullSvg>
			{payLabel > 0 ? (
				<div style={{position: 'absolute', left: DESK_X, top: BASE - 420, transform: `translate(-50%,0) scale(${payLabel})`}}>
					<Pill light size={28}>
						TVOJE VÝPLATA
					</Pill>
				</div>
			) : null}
			<Headline small="KOLIK VYDĚLÁŠ" big="FIRMĚ?" at={2} until={PAY_DROP - 10} top={270} bigSize={128} />
			<Headline small="…A KOLIK Z TOHO" big="VIDÍŠ TY?" at={PAY_DROP} top={270} bigSize={128} />
		</AbsoluteFill>
	);
};

/* =====================================================================
   2) SAME PAY (150 f) — makáš víc, dostaneš stejně
   ===================================================================== */
export const SAME_DUR = 150;
export const MONTH_EVERY = 13;
export const MONTH_FIRST = 8;
const MONTHS = ['LEDEN', 'ÚNOR', 'BŘEZEN', 'DUBEN', 'KVĚTEN', 'ČERVEN', 'ČERVENEC'];
export const SAME_NOTICE = 100;

export const SamePay: React.FC = () => {
	const f = useCurrentFrame();
	const m = Math.max(0, Math.min(MONTHS.length - 1, Math.floor((f - MONTH_FIRST) / MONTH_EVERY)));
	const work = interpolate(f, [MONTH_FIRST, MONTH_FIRST + MONTH_EVERY * (MONTHS.length - 1) + 8], [140, 560], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.quad),
	});
	const base = 1420;
	const barW = 200;
	const notice = prog(f, SAME_NOTICE, 12);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center'}}>
				<Pill light={false} size={28}>
					{MONTHS[m]}
				</Pill>
			</div>
			<FullSvg>
				<line x1={140} y1={base} x2={940} y2={base} stroke={C.white} strokeOpacity={0.5} strokeWidth={4} />
				<rect x={330 - barW / 2} y={base - work} width={barW} height={work} rx={12} fill={C.white} style={{filter: `drop-shadow(0 0 14px ${C.white}66)`}} />
				<rect x={750 - barW / 2} y={base - 140} width={barW} height={140} rx={12} fill={C.gray} />
				<text x={330} y={base + 56} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing={3} fill={C.white}>
					TVOJE PRÁCE
				</text>
				<text x={750} y={base + 56} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing={3} fill={C.muted}>
					TVOJE VÝPLATA
				</text>
				<text x={750} y={base - 166} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.muted}>
					= STEJNĚ
				</text>
			</FullSvg>
			<Headline small="MAKÁŠ VÍC." big="DOSTANEŠ" big2="STEJNĚ." at={2} top={270} bigSize={118} />
			<div
				style={{
					position: 'absolute',
					top: 1580,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: notice,
					transform: `translateY(${(1 - notice) * 20}px)`,
				}}
			>
				<Pill light={false} size={28}>
					POVÝŠENÍ? AŽ SI TĚ NĚKDO VŠIMNE.
				</Pill>
			</div>
		</AbsoluteFill>
	);
};

/* =====================================================================
   Ladder (shared by LADDER and TIMELINE scenes)
   ===================================================================== */
const RUNGS: {code: string; name: string}[] = [
	{code: 'C', name: 'CONSULTANT'},
	{code: 'SC I', name: 'SENIOR CONSULTANT'},
	{code: 'SC II', name: 'SENIOR CONSULTANT'},
	{code: 'M1', name: 'TEAM MANAGER'},
	{code: 'M2', name: 'EXECUTIVE MANAGER'},
	{code: 'M3', name: 'SENIOR MANAGER'},
	{code: 'D1', name: 'DIRECTOR'},
	{code: 'D2', name: 'SENIOR DIRECTOR'},
	{code: 'D3', name: 'PARTNER'},
];
// relative commission share per position (ratio only, no rates shown)
const SHARE = [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];
const L_LEFT = 250;
const L_RIGHT = 400;
const L_BOTTOM = 1700;
const rungY = (i: number) => 1630 - i * 106;
const BAR_X = 920;
const BAR_W = 84;

const Ladder: React.FC<{reached: number; climb: number; showShare: boolean; shareLabel: number}> = ({reached, climb, showShare, shareLabel}) => {
	const share = SHARE[Math.max(0, Math.min(8, Math.floor(climb)))] + (SHARE[Math.min(8, Math.floor(climb) + 1)] - SHARE[Math.max(0, Math.min(8, Math.floor(climb)))]) * (climb % 1);
	const barH = (share / 7.5) * 860;
	const ci = Math.max(0, Math.min(8, climb));
	const i0 = Math.floor(ci);
	const frac = ci - i0;
	const py = rungY(i0) + (rungY(Math.min(8, i0 + 1)) - rungY(i0)) * easeInOut(frac);
	return (
		<g>
			<line x1={L_LEFT} y1={L_BOTTOM} x2={L_LEFT} y2={rungY(8) - 70} stroke={C.white} strokeOpacity={0.6} strokeWidth={6} />
			<line x1={L_RIGHT} y1={L_BOTTOM} x2={L_RIGHT} y2={rungY(8) - 70} stroke={C.white} strokeOpacity={0.6} strokeWidth={6} />
			{RUNGS.map((r, i) => {
				const lit = i <= reached;
				const top = i === 8;
				return (
					<g key={r.code}>
						<line
							x1={L_LEFT}
							y1={rungY(i)}
							x2={L_RIGHT}
							y2={rungY(i)}
							stroke={lit ? C.accent : C.white}
							strokeOpacity={lit ? 1 : 0.45}
							strokeWidth={7}
							strokeLinecap="round"
							style={lit ? {filter: `drop-shadow(0 0 8px ${C.accent})`} : {}}
						/>
						<text x={L_RIGHT + 30} y={rungY(i) + 2} fontFamily={FONT} fontWeight={900} fontSize={top ? 40 : 32} fill={lit ? C.accent : C.muted}>
							{r.code}
						</text>
						<text x={L_RIGHT + 30} y={rungY(i) + 32} fontFamily={FONT} fontWeight={700} fontSize={top ? 24 : 20} letterSpacing={2} fill={lit ? C.white : C.muted} opacity={lit ? 0.95 : 0.6}>
							{r.name}
						</text>
					</g>
				);
			})}
			<Person x={(L_LEFT + L_RIGHT) / 2} y={py - 6} s={0.95} color={reached >= 8 ? C.accent : C.white} armsUp={reached >= 8 ? 1 : 0} />
			{showShare ? (
				<g>
					<rect x={BAR_X - BAR_W / 2} y={L_BOTTOM - 860} width={BAR_W} height={860} rx={14} fill="none" stroke={C.faint} strokeWidth={3} />
					<rect x={BAR_X - BAR_W / 2} y={L_BOTTOM - barH} width={BAR_W} height={barH} rx={14} fill={C.accent} style={{filter: `drop-shadow(0 0 16px ${C.accent}88)`}} />
					<text x={BAR_X} y={L_BOTTOM + 44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={2} fill={C.white}>
						TVŮJ PODÍL
					</text>
					{shareLabel > 0 ? (
						<text
							x={BAR_X}
							y={L_BOTTOM - 860 - 26}
							textAnchor="middle"
							fontFamily={FONT}
							fontWeight={900}
							fontSize={40}
							fill={C.accent}
							opacity={shareLabel}
							style={{filter: `drop-shadow(0 0 10px ${C.accent})`}}
						>
							2×+
						</text>
					) : null}
				</g>
			) : null}
		</g>
	);
};

/* =====================================================================
   3) LADDER (300 f) — čím výš, tím větší podíl
   ===================================================================== */
export const LADDER_DUR = 300;
export const CLIMB_FIRST = 40;
export const CLIMB_EVERY = 22;
export const climbAt = (f: number) => Math.max(0, Math.min(8, (f - CLIMB_FIRST) / CLIMB_EVERY));

export const LadderScene: React.FC = () => {
	const f = useCurrentFrame();
	const climb = climbAt(f);
	const reached = Math.floor(climb + 0.001);
	const appear = prog(f, 0, 24);
	const topAt = CLIMB_FIRST + 8 * CLIMB_EVERY;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`}}>
				<FullSvg>
					<Ladder reached={reached} climb={climb} showShare shareLabel={prog(f, topAt + 4, 12)} />
				</FullSvg>
			</AbsoluteFill>
			<Headline small="JINÝ MODEL:" big="ČÍM VÝŠ," big2="TÍM VĚTŠÍ PODÍL." at={4} top={230} bigSize={92} />
			<Footnote bottom={110} o={prog(f, topAt, 14)}>
				Podíl = provize z každé jednotky produkce dle kariérního plánu. Příjem závisí na vlastním výkonu.
			</Footnote>
		</AbsoluteFill>
	);
};

/* =====================================================================
   4) TIMELINE (180 f) — pravidla znáš dopředu, nejrychleji 5 let
   ===================================================================== */
export const TIME_DUR = 180;
const TIMES: {i: number; t: string}[] = [
	{i: 3, t: '6 MĚS.'},
	{i: 4, t: '+9 MĚS.'},
	{i: 5, t: '+9 MĚS.'},
	{i: 6, t: '+9 MĚS.'},
	{i: 7, t: '+9 MĚS.'},
	{i: 8, t: '+18 MĚS.'},
];
export const TIME_FIRST = 16;
export const TIME_EVERY = 13;
export const TIME_TOTAL = 100;

export const Timeline: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<FullSvg>
				<g opacity={0.9}>
					<Ladder reached={8} climb={8} showShare={false} shareLabel={0} />
				</g>
				{TIMES.map(({i, t}, k) => {
					const p = prog(f, TIME_FIRST + k * TIME_EVERY, 12, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					return (
						<g key={i} transform={`translate(${L_LEFT - 24} ${rungY(i)}) scale(${p})`}>
							<rect x={-150} y={-24} width={150} height={48} rx={24} fill={C.white} />
							<text x={-75} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={1} fill={C.dark}>
								{t}
							</text>
						</g>
					);
				})}
				{f > TIME_TOTAL ? (
					<g opacity={prog(f, TIME_TOTAL, 12)}>
						<path d={`M 60 ${rungY(3) + 40} L 60 ${rungY(8) - 30}`} stroke={C.accent} strokeWidth={4} strokeDasharray="8 10" />
					</g>
				) : null}
			</FullSvg>
			<Headline small="PRAVIDLA ZNÁŠ DOPŘEDU." big="ŽÁDNÉ ČEKÁNÍ," big2="AŽ SI TĚ VŠIMNOU." at={2} until={TIME_TOTAL - 8} top={230} bigSize={84} />
			<Headline small="NA VRCHOL NEJRYCHLEJI ZA" big="5 LET." big2="NE PŘES NOC." at={TIME_TOTAL} top={230} bigSize={92} />
		</AbsoluteFill>
	);
};

/* =====================================================================
   5) TEAM (150 f) — nestavíš cizí firmu, stavíš svoji
   ===================================================================== */
export const TEAM_DUR = 150;
const KIDS = [300, 540, 780];
export const TEAM_SPAWNS = [20, 28, 36, 52, 56, 60, 64, 68, 72, 76, 80, 84];

export const Team: React.FC = () => {
	const f = useCurrentFrame();
	const root = {x: 540, y: 900};
	const lvl1 = KIDS.map((x) => ({x, y: 1200}));
	const lvl2 = KIDS.flatMap((x) => [-90, 0, 90].map((d) => ({x: x + d, y: 1480})));
	const nodes = [...lvl1, ...lvl2];
	const parentOf = (k: number) => (k < 3 ? root : lvl1[Math.floor((k - 3) / 3)]);
	return (
		<AbsoluteFill>
			<FullSvg>
				{nodes.map((n, k) => {
					const p = prog(f, TEAM_SPAWNS[k], 12);
					if (p <= 0) return null;
					const par = parentOf(k);
					return (
						<line
							key={`l${k}`}
							x1={par.x}
							y1={par.y + 10}
							x2={par.x + (n.x - par.x) * p}
							y2={par.y + 10 + (n.y - 150 - par.y) * p}
							stroke={C.accent}
							strokeOpacity={0.5}
							strokeWidth={3}
						/>
					);
				})}
				<Person x={root.x} y={root.y} s={1.6} color={C.accent} />
				{nodes.map((n, k) => {
					const p = prog(f, TEAM_SPAWNS[k] + 6, 12, Easing.out(Easing.back(2.2)));
					if (p <= 0) return null;
					return (
						<g key={`n${k}`} transform={`translate(${n.x} ${n.y}) scale(${p}) translate(${-n.x} ${-n.y})`}>
							<Person x={n.x} y={n.y} s={k < 3 ? 1.15 : 0.8} color={C.white} />
						</g>
					);
				})}
			</FullSvg>
			<Headline small="NESTAVÍŠ CIZÍ FIRMU." big="STAVÍŠ" big2="SVOJI." at={4} top={260} bigSize={118} />
		</AbsoluteFill>
	);
};

/* =====================================================================
   6) CTA (180 f)
   ===================================================================== */
export const CTA_DUR = 180;
export const CTA_BTN = 40;

export const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const btn = prog(f, CTA_BTN, 14, Easing.out(Easing.back(2)));
	const pulse = f > CTA_BTN + 14 ? 1 + Math.sin((f - CTA_BTN) / 6) * 0.025 : 1;
	const mini = prog(f, 6, 30);
	return (
		<AbsoluteFill>
			<FullSvg>
				{/* mini ladder icon */}
				<g transform="translate(540 1180)" opacity={mini}>
					<line x1={-60} y1={0} x2={-60} y2={-300} stroke={C.white} strokeOpacity={0.6} strokeWidth={5} />
					<line x1={60} y1={0} x2={60} y2={-300} stroke={C.white} strokeOpacity={0.6} strokeWidth={5} />
					{Array.from({length: 6}).map((_, i) => (
						<line
							key={i}
							x1={-60}
							y1={-24 - i * 52}
							x2={60}
							y2={-24 - i * 52}
							stroke={C.accent}
							strokeWidth={6}
							strokeOpacity={prog(f, 8 + i * 4, 8)}
							style={{filter: `drop-shadow(0 0 6px ${C.accent})`}}
						/>
					))}
					<Person x={0} y={-284} s={0.9} color={C.accent} armsUp={prog(f, 34, 10)} />
				</g>
			</FullSvg>
			<Headline small="CHCEŠ VIDĚT" big="CELÝ KARIÉRNÍ" big2="PLÁN?" at={2} top={270} bigSize={104} />
			<div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', opacity: btn > 0 ? 1 : 0}}>
				<div style={{display: 'inline-block', transform: `scale(${btn * pulse})`}}>
					<Pill light size={46}>
						NAPIŠ MI „PLÁN“
					</Pill>
				</div>
				<div style={{marginTop: 34, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: C.muted, opacity: prog(f, CTA_BTN + 12, 12)}}>
					PROJDEME HO SPOLU.
				</div>
			</div>
			<Footnote bottom={230} o={prog(f, CTA_BTN + 20, 14)}>
				Spolupráce na živnostenský list. Postup závisí na splnění kritérií kariérního plánu.
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
					opacity: prog(f, CTA_BTN + 20, 14),
					textShadow: glow(C.white, 10),
				}}
			>
				ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
			</div>
		</AbsoluteFill>
	);
};


import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Check, Footnote, Headline, Person} from '../components';
import {C, FONT, glow, prog} from '../theme';
import {FullSvg, PopPill, SceneDef, makeCta, makeReel, rnd, sumDur} from '../week/common';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const RED = '#ff8a7a';

/* ---------- 1) HOOK: kde budeš za 5 let? ---------- */
export const H_STRIKES = [26, 42, 58];
export const H_REVEAL = 82;
const HOOK_ITEMS = ['TALENT', 'ŠKOLA', 'ŠTĚSTÍ'];
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const outItems = prog(f, H_REVEAL - 6, 8);
	const reveal = prog(f, H_REVEAL, 14, Easing.out(Easing.back(1.6)));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
				<div style={{fontSize: 40, fontWeight: 800, letterSpacing: 5, color: C.white, opacity: prog(f, 2, 10)}}>KDE BUDEŠ ZA 5 LET?</div>
				<div style={{fontSize: 40, fontWeight: 800, letterSpacing: 5, color: C.muted, marginTop: 12, opacity: prog(f, 12, 10)}}>NEROZHODNE O TOM…</div>
			</div>
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: 1 - outItems}}>
				{HOOK_ITEMS.map((t, i) => {
					const inP = prog(f, 14 + i * 6, 10, Easing.out(Easing.back(2)));
					const strike = prog(f, H_STRIKES[i], 8);
					return (
						<div key={t} style={{position: 'relative', fontFamily: FONT, fontSize: 130, fontWeight: 900, color: strike > 0.5 ? C.gray : C.white, transform: `scale(${inP})`, textShadow: strike > 0.5 ? 'none' : glow(C.white, 20)}}>
							{t}
							{strike > 0 ? (
								<div style={{position: 'absolute', left: -20, top: '52%', height: 14, width: `calc(${strike} * (100% + 40px))`, background: RED, borderRadius: 7, boxShadow: `0 0 16px ${RED}`, transform: 'rotate(-3deg)'}} />
							) : null}
						</div>
					);
				})}
			</div>
			{reveal > 0 ? (
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, transform: `scale(${reveal})`}}>
					<div style={{fontSize: 46, fontWeight: 800, letterSpacing: 5, color: C.white}}>ROZHODNOU O TOM</div>
					<div style={{fontSize: 150, fontWeight: 900, lineHeight: 1.0, color: C.accent, textShadow: glow(C.accent, 40), marginTop: 20}}>LIDI</div>
					<div style={{fontSize: 120, fontWeight: 900, lineHeight: 1.05, color: C.white, textShadow: glow(C.white, 24)}}>KOLEM TEBE.</div>
				</div>
			) : null}
			{reveal > 0 ? (
				<FullSvg>
					{[-260, -130, 130, 260].map((dx, i) => (
						<g key={i} opacity={prog(f, H_REVEAL + 10 + i * 4, 10)}>
							<Person x={540 + dx} y={1400 + Math.abs(dx) * 0.1} s={1} color={C.accent} />
						</g>
					))}
					<Person x={540} y={1400} s={1.35} color={C.white} />
				</FullSvg>
			) : null}
		</AbsoluteFill>
	);
};

/* ---------- 1b) STORY: dva kamarádi ---------- */
export const ST_BUBBLES = [40, 56, 72];
export const ST_RESULT = 120;
const STORY_L = ['TO NEMÁ CENU', 'BUĎ RÁD ZA JISTOTU', 'TO JE RISKANTNÍ'];
const STORY_R = ['JDEME NA TO', 'UKÁŽU TI JAK', 'ZVLÁDNEŠ TO'];
const Story: React.FC = () => {
	const f = useCurrentFrame();
	const res = f >= ST_RESULT;
	const crowd = prog(f, 20, 16);
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={540} y1={740} x2={540} y2={1620} stroke={C.white} strokeOpacity={0.12} strokeWidth={3} />
				{[0, 1, 2].map((i) => (
					<g key={`gl${i}`} opacity={crowd}>
						<Person x={140 + i * 130} y={1560} s={0.8} color={C.gray} glowOn={false} />
					</g>
				))}
				{[0, 1, 2].map((i) => (
					<g key={`gr${i}`} opacity={crowd}>
						<Person x={680 + i * 130} y={1560} s={0.8} color={C.accent} />
					</g>
				))}
				<Person x={270} y={1330} s={1.5} color={res ? C.gray : C.white} glowOn={!res} headTilt={res ? 20 : 0} />
				<Person x={810} y={1330} s={1.5} color={res ? C.accent : C.white} armsUp={res ? 1 : 0} />
			</FullSvg>
			{STORY_L.map((t, i) => (
				<PopPill key={t} at={ST_BUBBLES[i]} x={270} y={820 + i * 92} size={22}>
					„{t}“
				</PopPill>
			))}
			{STORY_R.map((t, i) => (
				<PopPill key={t} at={ST_BUBBLES[i] + 6} x={810} y={820 + i * 92} light size={22}>
					„{t}“
				</PopPill>
			))}
			{res ? (
				<>
					<PopPill at={ST_RESULT} x={270} y={1700} size={26}>
						ZŮSTAL STEJNÝ
					</PopPill>
					<PopPill at={ST_RESULT + 6} x={810} y={1700} light size={26}>
						VYRŮSTL
					</PopPill>
				</>
			) : null}
			<Headline small="DVA KAMARÁDI. STEJNÁ ŠKOLA." big="JINÉ OKOLÍ." big2="JINÝ ŽIVOT." at={2} top={260} bigSize={104} />
		</AbsoluteFill>
	);
};

/* ---------- 2) STUDY 1: síť – Christakis & Fowler ---------- */
const NODES = Array.from({length: 26}).map((_, i) => {
	const col = i % 6;
	const row = Math.floor(i / 6);
	return {x: 150 + col * 156 + (rnd(i) - 0.5) * 70, y: 760 + row * 150 + (rnd(i + 40) - 0.5) * 60};
});
const EDGES: [number, number][] = [];
NODES.forEach((a, i) => {
	const d = NODES.map((b, j) => ({j, d: Math.hypot(a.x - b.x, a.y - b.y)}))
		.filter((x) => x.j !== i)
		.sort((p, q) => p.d - q.d)
		.slice(0, 2);
	d.forEach(({j}) => {
		if (!EDGES.some(([p, q]) => (p === i && q === j) || (p === j && q === i))) EDGES.push([i, j]);
	});
});
const SEED = 14;
const DIST = (() => {
	const dist = NODES.map(() => 99);
	dist[SEED] = 0;
	const q = [SEED];
	while (q.length) {
		const u = q.shift() as number;
		EDGES.forEach(([a, b]) => {
			const v = a === u ? b : b === u ? a : -1;
			if (v >= 0 && dist[v] > dist[u] + 1) {
				dist[v] = dist[u] + 1;
				q.push(v);
			}
		});
	}
	return dist;
})();
export const S1_SEED = 30;
export const S1_WAVE = 26;
export const S1_STAT = 40;
const Study1: React.FC = () => {
	const f = useCurrentFrame();
	const stat = Math.round(interpolate(f, [S1_STAT, S1_STAT + 34], [0, 57], {...clamp, easing: Easing.out(Easing.cubic)}));
	return (
		<AbsoluteFill>
			<FullSvg>
				{EDGES.map(([a, b], k) => (
					<line key={k} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={C.white} strokeOpacity={0.16 * prog(f, 2, 14)} strokeWidth={3} />
				))}
				{NODES.map((n, i) => {
					const d = DIST[i];
					const hit = d <= 3 && f >= S1_SEED + d * S1_WAVE;
					const p = hit ? prog(f, S1_SEED + d * S1_WAVE, 10) : 0;
					const pulse = hit ? 1 + 0.25 * Math.exp(-(f - (S1_SEED + d * S1_WAVE)) / 6) : 1;
					const strength = d === 0 ? 1 : d === 1 ? 0.85 : d === 2 ? 0.6 : 0.4;
					return (
						<g key={i} opacity={prog(f, 2 + i * 0.6, 10)}>
							{hit ? <circle cx={n.x} cy={n.y} r={(40 + 30 * p) * pulse} fill={RED} opacity={0.12 * strength} /> : null}
							<circle cx={n.x} cy={n.y} r={18 * pulse} fill={hit ? RED : C.white} opacity={hit ? 0.35 + 0.65 * strength : 0.55} style={hit ? {filter: `drop-shadow(0 0 10px ${RED})`} : {}} />
						</g>
					);
				})}
			</FullSvg>
			<div style={{position: 'absolute', top: 1400, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, opacity: prog(f, S1_STAT, 10)}}>
				<div style={{fontSize: 150, fontWeight: 900, color: RED, textShadow: glow(RED, 30), lineHeight: 1}}>+{stat} %</div>
				<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 3, color: C.white, marginTop: 14, padding: '0 80px', lineHeight: 1.35}}>ŠANCE, ŽE PŘIBEREŠ, KDYŽ PŘIBERE TVŮJ KAMARÁD</div>
			</div>
			<Headline small="STUDIE · 12 067 LIDÍ · 32 LET" big="ZVYKY SE ŠÍŘÍ" big2="JAKO VIRUS." at={2} top={250} bigSize={100} />
			<Footnote bottom={110} o={prog(f, S1_STAT + 20, 14)}>
				Christakis &amp; Fowler, New England Journal of Medicine, 2007 (Framingham, 1971–2003).
			</Footnote>
		</AbsoluteFill>
	);
};

/* ---------- 3) STUDY 2: kolegové podnikatelé – Nanda & Sørensen ---------- */
export const S2_BADGES = [20, 28, 36];
export const S2_LIGHT = 64;
const Study2: React.FC = () => {
	const f = useCurrentFrame();
	const desk = [
		{x: 230, y: 1150, ent: true},
		{x: 540, y: 930, ent: false},
		{x: 850, y: 1150, ent: true},
		{x: 330, y: 1420, ent: false},
		{x: 750, y: 1420, ent: true},
	];
	const me = {x: 540, y: 1330};
	const lit = f >= S2_LIGHT;
	let k = 0;
	return (
		<AbsoluteFill>
			<FullSvg>
				{desk.map((d, i) => {
					const badge = d.ent ? S2_BADGES[k++] : -1;
					const bp = badge >= 0 ? prog(f, badge, 12, Easing.out(Easing.back(2.4))) : 0;
					return (
						<g key={i}>
							{d.ent && bp > 0 ? (
								<line x1={d.x} y1={d.y - 60} x2={me.x} y2={me.y - 80} stroke={C.accent} strokeOpacity={0.4 * bp} strokeWidth={3} strokeDasharray="6 8" />
							) : null}
							<Person x={d.x} y={d.y} s={1.1} color={d.ent ? C.white : C.gray} glowOn={d.ent} />
							{bp > 0 ? (
								<g transform={`translate(${d.x} ${d.y - 170}) scale(${bp})`}>
									<rect x={-110} y={-26} width={220} height={52} rx={26} fill={C.accent} />
									<text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={1} fill={C.dark}>
										EX-PODNIKATEL
									</text>
								</g>
							) : null}
						</g>
					);
				})}
				<Person x={me.x} y={me.y} s={1.5} color={lit ? C.accent : C.white} />
				{lit ? (
					<g transform={`translate(${me.x} ${me.y - 255}) scale(${prog(f, S2_LIGHT, 12, Easing.out(Easing.back(2.5)))})`}>
						<circle r={30} fill={C.accent} style={{filter: `drop-shadow(0 0 14px ${C.accent})`}} />
						<rect x={-12} y={28} width={24} height={14} rx={3} fill={C.accent} />
					</g>
				) : null}
			</FullSvg>
			<PopPill at={S2_LIGHT + 10} x={540} y={1600} light size={28}>
				→ VYŠŠÍ ŠANCE, ŽE ZAČNEŠ PODNIKAT TAKY
			</PopPill>
			<Headline small="STUDIE · MANAGEMENT SCIENCE" big="KOLEGOVÉ" big2="PODNIKATELÉ?" at={2} top={250} bigSize={110} />
			<Footnote bottom={150} o={prog(f, S2_LIGHT + 20, 14)}>
				Nejsilnější efekt u lidí, kteří podnikatele jinde kolem sebe neměli. Nanda &amp; Sørensen, Management Science, 2010.
			</Footnote>
		</AbsoluteFill>
	);
};

/* ---------- 5) POINT: prostředí > motivace ---------- */
export const P_MOVE = 20;
const Point: React.FC = () => {
	const f = useCurrentFrame();
	const mv = prog(f, P_MOVE, 40, Easing.inOut(Easing.cubic));
	const x = 280 + mv * 520;
	const lit = mv > 0.9;
	return (
		<AbsoluteFill>
			<FullSvg>
				<circle cx={280} cy={1200} r={190} fill={C.gray} opacity={0.12} stroke={C.gray} strokeWidth={3} />
				<circle cx={800} cy={1200} r={190} fill={C.accent} opacity={0.1} stroke={C.accent} strokeWidth={3} style={{filter: `drop-shadow(0 0 16px ${C.accent}66)`}} />
				<text x={280} y={1440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={2} fill={C.muted}>
					„TO NEMÁ CENU“
				</text>
				<text x={800} y={1440} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing={2} fill={C.accent}>
					„JDEME NA TO“
				</text>
				{[0, 1, 2].map((i) => (
					<Person key={`g${i}`} x={200 + i * 80} y={1290} s={0.75} color={C.gray} glowOn={false} />
				))}
				{[0, 1, 2].map((i) => (
					<Person key={`a${i}`} x={720 + i * 80} y={1290} s={0.75} color={C.accent} armsUp={lit ? 1 : 0} />
				))}
				<Person x={x} y={1180} s={1.2} color={lit ? C.accent : C.white} armsUp={lit ? 1 : 0} />
			</FullSvg>
			<Headline small="MOTIVACE VYPRCHÁ." big="PROSTŘEDÍ" big2="ZŮSTANE." at={2} top={300} bigSize={120} />
		</AbsoluteFill>
	);
};

/* ---------- 6) SELL: z nuly k vlastnímu byznysu ---------- */
export const SELL_STAGES = [16, 50, 84];
export const SELL_FINAL = 124;
const STAGES = [
	{title: 'PŘIŠLI BEZ ZKUŠENOSTÍ', sub: 'bez know-how, bez kontaktů', color: C.gray, team: 0},
	{title: 'DALI JSME JIM ZÁZEMÍ', sub: 'prostředí, mentora a know-how', color: C.white, team: 2},
	{title: 'DNES BUDUJÍ BYZNYS', sub: 'vlastní klienty a vlastní tým', color: C.accent, team: 4},
];
const Sell: React.FC = () => {
	const f = useCurrentFrame();
	const fin = prog(f, SELL_FINAL, 14, Easing.out(Easing.back(1.8)));
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={200} y1={800} x2={200} y2={800 + 600 * prog(f, SELL_STAGES[0], SELL_STAGES[2] - SELL_STAGES[0] + 10)} stroke={C.accent} strokeOpacity={0.5} strokeWidth={5} strokeDasharray="10 12" />
				{STAGES.map((s, i) => {
					const p = prog(f, SELL_STAGES[i], 12, Easing.out(Easing.back(2)));
					const y = 860 + i * 290;
					return (
						<g key={s.title} opacity={p}>
							{Array.from({length: s.team}).map((_, k) => (
								<Person key={k} x={200 + (k % 2 ? 1 : -1) * (60 + Math.floor(k / 2) * 46)} y={y + 10} s={0.55} color={s.color} glowOn={false} />
							))}
							<Person x={200} y={y} s={1.1} color={s.color} glowOn={i > 0} armsUp={i === 2 ? 1 : 0} />
						</g>
					);
				})}
			</FullSvg>
			{STAGES.map((s, i) => {
				const p = prog(f, SELL_STAGES[i], 12);
				return (
					<div key={s.title} style={{position: 'absolute', left: 360, right: 50, top: 860 + i * 290 - 150, fontFamily: FONT, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
						<div style={{fontSize: 52, fontWeight: 900, color: i === 2 ? C.accent : C.white, textShadow: glow(i === 2 ? C.accent : C.white, 16), lineHeight: 1.05}}>{s.title}</div>
						<div style={{fontSize: 30, fontWeight: 700, color: C.muted, marginTop: 10, letterSpacing: 1}}>{s.sub}</div>
					</div>
				);
			})}
			{fin > 0 ? (
				<div style={{position: 'absolute', top: 1560, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, transform: `scale(${fin})`}}>
					<div style={{fontSize: 40, fontWeight: 900, color: C.white, letterSpacing: 2}}>ZA PÁR LET: ÚSPĚŠNÍ PODNIKATELÉ.</div>
					<div style={{fontSize: 52, fontWeight: 900, color: C.accent, textShadow: glow(C.accent, 24), marginTop: 10}}>KDYŽ MAKAJÍ.</div>
				</div>
			) : null}
			<Headline small="TAKOVÉ PROSTŘEDÍ MÁME MY:" big="Z NULY" big2="K VLASTNÍMU BYZNYSU." at={2} top={250} bigSize={92} />
		</AbsoluteFill>
	);
};

const CtaVisual: React.FC = () => {
	const f = useCurrentFrame();
	const xs = [-300, -200, -100, 100, 200, 300];
	return (
		<FullSvg>
			{xs.map((dx, i) => {
				const p = prog(f, 10 + i * 4, 12, Easing.out(Easing.back(2)));
				return (
					<g key={i} opacity={p}>
						<Person x={540 + dx} y={1130 + Math.abs(dx) * 0.12} s={0.95} color={C.accent} armsUp={f > 40 ? 1 : 0} />
					</g>
				);
			})}
			<Person x={540} y={1130} s={1.3} color={C.white} />
		</FullSvg>
	);
};

const SCENES: SceneDef[] = [
	{name: 'Hook – kde budeš za 5 let', dur: 150, C: Hook},
	{name: 'Příběh – dva kamarádi', dur: 210, C: Story},
	{name: 'Studie 1 – síť (Christakis & Fowler)', dur: 225, C: Study1},
	{name: 'Studie 2 – kolegové (Nanda & Sørensen)', dur: 180, C: Study2},
	{name: 'Motivace vyprchá, prostředí zůstane', dur: 120, C: Point},
	{name: 'Naše prostředí – z nuly k byznysu', dur: 240, C: Sell},
	{name: 'CTA TÝM', dur: 180, C: makeCta({small: 'CHCEŠ BÝT MEZI LIDMI,', big: 'KTEŘÍ TĚ', big2: 'TÁHNOU VÝŠ?', word: 'TÝM', sub: 'POZVU TĚ MEZI NÁS.', visual: CtaVisual})},
];
export const ENV_DUR = sumDur(SCENES);
export const EnvReel = makeReel(SCENES, 'env-soundtrack.wav');

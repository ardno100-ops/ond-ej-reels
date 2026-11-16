import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Check, Footnote, Headline, Person} from '../components';
import {C, FONT, glow, prog} from '../theme';
import {FullSvg, PopPill, SceneDef, makeCta, makeReel, rnd, sumDur} from '../week/common';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const RED = '#ff8a7a';

/* ---------- 1) HOOK: 5 lidí kolem tebe ---------- */
export const H_ABSORB = 50;
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const cx = 540;
	const cy = 1180;
	const absorb = prog(f, H_ABSORB, 40);
	const ring = [0, 1, 2, 3, 4].map((i) => {
		const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
		return {x: cx + Math.cos(a) * 300, y: cy + 60 + Math.sin(a) * 300};
	});
	const mix = (a: number) => {
		// white -> gray as absorb grows
		const c1 = [241, 247, 236];
		const c2 = [93, 107, 98];
		return `rgb(${c1.map((v, i) => Math.round(v + (c2[i] - v) * a)).join(',')})`;
	};
	return (
		<AbsoluteFill>
			<FullSvg>
				{ring.map((p, i) => {
					const o = prog(f, 6 + i * 5, 10);
					return <line key={`l${i}`} x1={cx} y1={cy - 40} x2={p.x} y2={p.y - 40} stroke={C.white} strokeOpacity={0.18 * o} strokeWidth={3} strokeDasharray="6 10" />;
				})}
				{ring.map((p, i) => {
					const o = prog(f, 6 + i * 5, 12, Easing.out(Easing.back(2)));
					return (
						<g key={i} opacity={o}>
							<Person x={p.x} y={p.y} s={1.05} color={C.gray} glowOn={false} />
						</g>
					);
				})}
				<Person x={cx} y={cy} s={1.7} color={mix(absorb)} glowOn={absorb < 0.5} />
			</FullSvg>
			<Headline small="UKAŽ MI 5 LIDÍ, SE KTERÝMI TRÁVÍŠ ČAS," big="A ŘEKNU TI," big2="KÝM BUDEŠ." at={2} top={260} bigSize={112} />
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

/* ---------- 4) STUDY 3: talent nestačí – Bell, Chetty a kol. ---------- */
export const S3_SPLIT = 40;
export const S3_RESULT = 120;
const Study3: React.FC = () => {
	const f = useCurrentFrame();
	const bars = prog(f, 6, 24);
	const split = prog(f, S3_SPLIT, 30);
	const res = prog(f, S3_RESULT, 14, Easing.out(Easing.back(2)));
	const kid = (x: number, inventors: boolean) => (
		<g>
			{/* math score bar */}
			<rect x={x - 30} y={1500 - 200 * bars} width={60} height={200 * bars} rx={10} fill={C.white} opacity={0.8} />
			<text x={x} y={1545} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={2} fill={C.muted}>
				MATIKA
			</text>
			<Person x={x} y={1260} s={1.3 - 0.2 * (1 - split)} color={inventors && res > 0 ? C.accent : C.white} />
			{inventors
				? [0, 1, 2, 3].map((i) => {
						const a = -Math.PI / 2 + (i - 1.5) * 0.7;
						const p = prog(f, S3_SPLIT + i * 8, 12);
						return (
							<g key={i} opacity={p} transform={`translate(${x + Math.cos(a) * 190} ${1160 + Math.sin(a) * 120})`}>
								<circle r={16} fill={C.accent} style={{filter: `drop-shadow(0 0 8px ${C.accent})`}} />
								<rect x={-7} y={14} width={14} height={9} rx={2} fill={C.accent} />
							</g>
						);
					})
				: [0, 1, 2].map((i) => (
						<g key={i} opacity={split * 0.6} transform={`translate(${x + (i - 1) * 120} 1050)`}>
							<circle r={16} fill="none" stroke={C.gray} strokeWidth={3} />
						</g>
					))}
			{res > 0 ? (
				<g transform={`translate(${x} 960) scale(${res})`}>
					<rect x={-150} y={-30} width={300} height={60} rx={30} fill={inventors ? C.accent : C.gray} />
					<text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} letterSpacing={2} fill={C.dark}>
						{inventors ? 'STANE SE VYNÁLEZCEM' : 'TALENT ZŮSTANE LEŽET'}
					</text>
				</g>
			) : null}
		</g>
	);
	return (
		<AbsoluteFill>
			<FullSvg>
				<line x1={540} y1={900} x2={540} y2={1560} stroke={C.white} strokeOpacity={0.12} strokeWidth={3} />
				{kid(290, false)}
				{kid(790, true)}
			</FullSvg>
			<PopPill at={S3_SPLIT - 10} x={540} y={1640} size={26}>
				STEJNÉ VÝSLEDKY Z MATIKY · JINÉ OKOLÍ
			</PopPill>
			<Headline small="STUDIE · 1,2 MILIONU VYNÁLEZCŮ" big="TALENT" big2="NESTAČÍ." at={2} top={250} bigSize={120} />
			<Footnote bottom={110} o={prog(f, S3_RESULT + 10, 14)}>
				Děti vyrůstající mezi vynálezci se jimi stávají častěji. Bell, Chetty a kol., Quarterly Journal of Economics, 2019.
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

/* ---------- 6) SELL: naše prostředí ---------- */
export const SELL_CHECKS = [26, 38, 50, 62, 74];
const Sell: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Headline small="TAKOVÉ PROSTŘEDÍ MÁME MY:" big="LIDI, KTEŘÍ" big2="TĚ POSOUVAJÍ." at={2} top={260} bigSize={104} />
			<div style={{position: 'absolute', top: 760, left: 110, right: 60}}>
				{[
					'LÍDŘI, KTEŘÍ ZAČÍNALI JAKO STUDENTI',
					'KONFERENCE A DVOUDENNÍ LIVE AKCE',
					'BYZNYS TRIPY: LAS VEGAS, SRÍ LANKA',
					'KANCELÁŘE A TÝM KAŽDÝ DEN',
					'ZAŠKOLENÍ ZA 100 000 Kč ZDARMA',
				].map((t, i) => {
					const p = prog(f, SELL_CHECKS[i], 12);
					return <Check key={t} text={t} o={p} dx={(1 - p) * -40} />;
				})}
			</div>
			<FullSvg>
				{Array.from({length: 7}).map((_, i) => {
					const p = prog(f, 90 + i * 4, 12, Easing.out(Easing.back(2)));
					return (
						<g key={i} opacity={p}>
							<Person x={240 + i * 100} y={1560} s={0.85 + (i === 3 ? 0.25 : 0)} color={C.accent} armsUp={f > 120 ? 1 : 0} />
						</g>
					);
				})}
			</FullSvg>
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
	{name: 'Hook – 5 lidí kolem tebe', dur: 135, C: Hook},
	{name: 'Studie 1 – síť (Christakis & Fowler)', dur: 240, C: Study1},
	{name: 'Studie 2 – kolegové (Nanda & Sørensen)', dur: 210, C: Study2},
	{name: 'Studie 3 – talent nestačí (Chetty)', dur: 210, C: Study3},
	{name: 'Prostředí > motivace', dur: 120, C: Point},
	{name: 'Naše prostředí', dur: 210, C: Sell},
	{name: 'CTA TÝM', dur: 180, C: makeCta({small: 'CHCEŠ BÝT MEZI LIDMI,', big: 'KTEŘÍ TĚ', big2: 'TÁHNOU VÝŠ?', word: 'TÝM', sub: 'POZVU TĚ MEZI NÁS.', visual: CtaVisual})},
];
export const ENV_DUR = sumDur(SCENES);
export const EnvReel = makeReel(SCENES, 'env-soundtrack.wav');

import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote, Person, Pill} from '../components';
import {C, FONT, glow, prog} from '../theme';
import {FullSvg, SceneDef, makeReel, sumDur} from '../week/common';

const RED = '#ff8a7a';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/** Text that slams in (scale 1.5 -> 1) at frame `at`. */
export const Slam: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; color?: string; size: number}> = ({at, children, style, color = C.white, size}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const k = f - at;
	const s = interpolate(k, [0, 5, 9], [1.6, 0.96, 1], clamp);
	const o = interpolate(k, [0, 3], [0, 1], clamp);
	return (
		<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, textShadow: glow(color, 30), transform: `scale(${s})`, opacity: o, ...style}}>{children}</div>
	);
};

export const Shake: React.FC<{hits: number[]; children: React.ReactNode}> = ({hits, children}) => {
	const f = useCurrentFrame();
	let dx = 0;
	let dy = 0;
	hits.forEach((h) => {
		const k = f - h;
		if (k >= 0 && k < 10) {
			const a = (1 - k / 10) * 16;
			dx += Math.sin(k * 3.3) * a;
			dy += Math.cos(k * 2.7) * a;
		}
	});
	return <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px)`}}>{children}</AbsoluteFill>;
};

export const Flash: React.FC<{at: number[]}> = ({at}) => {
	const f = useCurrentFrame();
	const o = Math.max(0, ...at.map((a) => (f >= a && f < a + 4 ? 0.3 * (1 - (f - a) / 4) : 0)));
	return <AbsoluteFill style={{backgroundColor: '#fff', opacity: o, pointerEvents: 'none'}} />;
};

/* ---------- 1) HOOK (90 f) ---------- */
export const HK_HITS = [0, 20, 44];
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const pulse = 1 + 0.03 * Math.sin(f / 3);
	return (
		<Shake hits={HK_HITS}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
				<div style={{transform: `scale(${pulse})`, marginTop: -260}}>
					<Slam at={HK_HITS[0]} size={70} color={C.white}>
						JE TI
					</Slam>
					<Slam at={HK_HITS[0]} size={260} color={C.accent}>
						20–25?
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 1180, left: 60, right: 60}}>
					<Slam at={HK_HITS[1]} size={64}>
						A NECHCEŠ 40 LET
					</Slam>
					<Slam at={HK_HITS[2]} size={82} color={RED}>
						MAKAT NA CIZÍ SEN?
					</Slam>
				</div>
			</AbsoluteFill>
			<Flash at={HK_HITS.slice(1)} />
		</Shake>
	);
};

/* ---------- 2) OFFER (150 f): hledám 3 lidi ---------- */
export const OF_HIT = 4;
export const OF_SLOTS = [40, 56, 72];
export const OF_SUB = 100;
const Offer: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Shake hits={[OF_HIT]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 300, left: 0, right: 0}}>
					<Slam at={OF_HIT} size={54}>
						HLEDÁM DO TÝMU
					</Slam>
					<Slam at={OF_HIT + 6} size={190} color={C.accent}>
						3 LIDI.
					</Slam>
				</div>
				<FullSvg>
					{[285, 540, 795].map((x, i) => {
						const on = f >= OF_SLOTS[i];
						const p = prog(f, OF_SLOTS[i], 10, Easing.out(Easing.back(2.5)));
						return (
							<g key={x}>
								<circle cx={x} cy={1120} r={108} fill="none" stroke={on ? C.accent : C.white} strokeOpacity={on ? 1 : 0.3} strokeWidth={5} strokeDasharray={on ? '0' : '14 12'} style={on ? {filter: `drop-shadow(0 0 14px ${C.accent})`} : {}} />
								<g opacity={on ? 1 : 0.25} transform={`translate(${x} 1190) scale(${on ? 0.8 + 0.2 * p : 0.8}) translate(${-x} -1190)`}>
									<Person x={x} y={1190} s={1.2} color={on ? C.accent : C.white} glowOn={on} />
								</g>
								<text x={x} y={1290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} letterSpacing={4} fill={on ? C.accent : C.muted}>
									{on ? 'TY?' : 'VOLNO'}
								</text>
							</g>
						);
					})}
				</FullSvg>
				<div style={{position: 'absolute', top: 1420, left: 60, right: 60, opacity: prog(f, OF_SUB, 10), transform: `translateY(${(1 - prog(f, OF_SUB, 10)) * 20}px)`}}>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.white}}>NE ZAMĚSTNANCE.</div>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.accent, textShadow: glow(C.accent, 24), marginTop: 8}}>BUDOUCÍ PODNIKATELE.</div>
				</div>
			</AbsoluteFill>
		</Shake>
	);
};

/* ---------- 3) GET (210 f): co dostaneš – rapid fire ---------- */
const GETS = ['ZAŠKOLENÍ ZA 100 000 Kč ZDARMA', 'MENTORA, KTERÝ TÍM UŽ PROŠEL', 'PROSTŘEDÍ LIDÍ, CO MAKAJÍ', 'JASNÝ PLÁN: 9 KARIÉRNÍCH STUPŇŮ', 'PODNIKÁNÍ BEZ STROPU'];
export const GET_FIRST = 22;
export const GET_EVERY = 26;
const Get: React.FC = () => {
	const f = useCurrentFrame();
	const cur = Math.min(GETS.length - 1, Math.floor((f - GET_FIRST) / GET_EVERY));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
				<Slam at={0} size={110} color={C.accent}>
					CO DOSTANEŠ:
				</Slam>
			</div>
			<div style={{position: 'absolute', top: 640, left: 90, right: 70}}>
				{GETS.map((t, i) => {
					const at = GET_FIRST + i * GET_EVERY;
					const p = prog(f, at, 8, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					const active = i === cur;
					return (
						<div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 40, transform: `translateX(${(1 - p) * -60}px) scale(${active ? 1.04 : 1})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.3)}}>
							<div style={{width: 64, height: 64, borderRadius: 32, background: active ? C.accent : 'rgba(197,242,155,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? `0 0 24px ${C.accent}` : 'none', flexShrink: 0}}>
								<svg width={34} height={34} viewBox="0 0 34 34">
									<path d="M 7 17.5 L 14 24.5 L 27 10" fill="none" stroke={active ? C.dark : C.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<div style={{fontFamily: FONT, fontWeight: 900, fontSize: active ? 50 : 44, lineHeight: 1.1, color: active ? C.white : 'rgba(241,247,236,0.75)', textShadow: active ? glow(C.white, 16) : 'none'}}>{t}</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/* ---------- 4) WHO (180 f): koho hledám ---------- */
const WHO_YES = ['JE TI 20–25 (KLIDNĚ STUDUJEŠ)', 'CHCEŠ VÍC NEŽ PRŮMĚR', 'MAKÁŠ, I KDYŽ SE NECHCE'];
export const WHO_FIRST = 20;
export const WHO_EVERY = 22;
export const WHO_NO = 100;
const Who: React.FC = () => {
	const f = useCurrentFrame();
	const no = prog(f, WHO_NO, 10, Easing.out(Easing.back(2)));
	return (
		<Shake hits={[WHO_NO]}>
			<AbsoluteFill>
				<div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center'}}>
					<Slam at={0} size={110} color={C.white}>
						KOHO HLEDÁM:
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 640, left: 90, right: 60}}>
					{WHO_YES.map((t, i) => {
						const p = prog(f, WHO_FIRST + i * WHO_EVERY, 8, Easing.out(Easing.back(2)));
						if (p <= 0) return null;
						return (
							<div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 44, transform: `translateX(${(1 - p) * -60}px)`}}>
								<div style={{fontSize: 56}}>✅</div>
								<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.white}}>{t}</div>
							</div>
						);
					})}
				</div>
				{no > 0 ? (
					<div style={{position: 'absolute', top: 1220, left: 70, right: 70, padding: '34px 40px', borderRadius: 32, border: `4px solid ${RED}`, background: 'rgba(255,138,122,0.08)', transform: `scale(${no})`, boxShadow: `0 0 40px ${RED}55`}}>
						<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: RED}}>NEHLEDÁM:</div>
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.white, marginTop: 10}}>❌ RYCHLÉ ZBOHATNUTÍ</div>
					</div>
				) : null}
			</AbsoluteFill>
			<Flash at={[WHO_NO]} />
		</Shake>
	);
};

/* ---------- 5) TRUST (150 f): není to pyramida ---------- */
const TRUST = ['ŽÁDNÝ VSTUPNÍ POPLATEK', 'REGISTRACE U ČNB', '20 LET PROVĚŘENÉ KNOW-HOW'];
export const TR_FIRST = 34;
export const TR_EVERY = 20;
const Trust: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Shake hits={[0]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 300, left: 40, right: 40}}>
					<Slam at={0} size={60}>
						A NE,
					</Slam>
					<Slam at={6} size={124} color={C.accent}>
						NENÍ TO
					</Slam>
					<Slam at={6} size={124} color={C.accent}>
						PYRAMIDA.
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 980, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
					{TRUST.map((t, i) => {
						const p = prog(f, TR_FIRST + i * TR_EVERY, 10, Easing.out(Easing.back(2.2)));
						return (
							<div key={t} style={{transform: `scale(${p})`, opacity: p > 0 ? 1 : 0}}>
								<Pill light={i === 0} size={36}>
									{t}
								</Pill>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
		</Shake>
	);
};

/* ---------- 6) CTA (210 f): napiš do komentáře START ---------- */
export const CTA_WORD = 20;
export const CTA_TYPE = [44, 50, 56, 62, 68];
export const CTA_SEND = 80;
export const CTA_SUB = 100;
const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const typed = CTA_TYPE.filter((t) => f >= t).length;
	const sent = f >= CTA_SEND;
	const bubble = prog(f, 30, 12, Easing.out(Easing.back(2)));
	const sendP = prog(f, CTA_SEND, 10, Easing.out(Easing.back(2.5)));
	return (
		<Shake hits={[CTA_WORD]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 250, left: 0, right: 0}}>
					<Slam at={2} size={58}>
						NAPIŠ DO KOMENTÁŘE
					</Slam>
					<Slam at={CTA_WORD} size={250} color={C.accent}>
						START
					</Slam>
				</div>
				{/* fake comment box */}
				<div style={{position: 'absolute', top: 900, left: 90, right: 90, transform: `scale(${bubble})`, opacity: bubble > 0 ? 1 : 0}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 999, border: `3px solid ${sent ? C.accent : C.faint}`, background: 'rgba(241,247,236,0.05)', boxShadow: sent ? `0 0 30px ${C.accent}66` : 'none'}}>
						<div style={{width: 64, height: 64, borderRadius: 32, background: `conic-gradient(${C.accent}, #f5d36b, #ff7a7a, ${C.accent})`, flexShrink: 0}} />
						<div style={{flex: 1, textAlign: 'left', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: typed ? C.white : C.muted}}>
							{typed ? 'START'.slice(0, typed) : 'Přidat komentář…'}
							{!sent && typed < 5 && Math.floor(f / 8) % 2 === 0 ? <span style={{color: C.accent}}>|</span> : null}
						</div>
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.accent, transform: `scale(${sent ? 1 + 0.3 * (1 - sendP) : 1})`}}>{sent ? '✓' : 'ODESLAT'}</div>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1120, left: 80, right: 80, opacity: prog(f, CTA_SUB, 12), transform: `translateY(${(1 - prog(f, CTA_SUB, 12)) * 20}px)`}}>
					<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: 1.4, color: C.white}}>
						POŠLU TI 3 OTÁZKY
						<br />
						+ POZVÁNKU NA <span style={{color: C.accent}}>30MIN ONLINE INFO</span>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1400, left: 0, right: 0, opacity: prog(f, CTA_SUB + 20, 12)}}>
					<Pill light size={34}>
						VOLNÁ MÍSTA: 3
					</Pill>
				</div>
				<Footnote bottom={220} o={prog(f, CTA_SUB + 30, 14)}>
					Spolupráce na živnostenský list. Příjem závisí na tvém výkonu a není zaručen.
				</Footnote>
				<div style={{position: 'absolute', bottom: 150, left: 0, right: 0, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: C.white, opacity: prog(f, CTA_SUB + 30, 14)}}>
					ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
				</div>
			</AbsoluteFill>
		</Shake>
	);
};

const SCENES: SceneDef[] = [
	{name: 'Hook – je ti 20–25?', dur: 90, C: Hook},
	{name: 'Nabídka – hledám 3 lidi', dur: 150, C: Offer},
	{name: 'Co dostaneš', dur: 210, C: Get},
	{name: 'Koho hledám', dur: 180, C: Who},
	{name: 'Není to pyramida', dur: 150, C: Trust},
	{name: 'CTA komentář START', dur: 210, C: Cta},
];
export const NABOR_DUR = sumDur(SCENES);
export const NaborReel = makeReel(SCENES, 'nabor-sfx.wav');

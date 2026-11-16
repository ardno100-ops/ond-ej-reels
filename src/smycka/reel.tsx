import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Footnote, Pill} from '../components';
import {Flash, Shake, Slam} from '../nabor/reel';
import {C, FONT, fmt, glow, prog} from '../theme';
import {SceneDef, makeReel, rnd, sumDur} from '../week/common';

const RED = '#ff8a7a';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* ---------- 1) HOOK (75 f): budík ---------- */
export const HK_TEXT = 22;
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const ring = f < 60 ? Math.sin(f * 2.2) * 9 : 0;
	return (
		<Shake hits={[0, HK_TEXT]}>
			<AbsoluteFill style={{alignItems: 'center', textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 330, fontSize: 300, transform: `rotate(${ring}deg)`}}>⏰</div>
				<div style={{position: 'absolute', top: 720}}>
					<Slam at={0} size={190} color={RED}>
						06:30
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 1060, left: 50, right: 50}}>
					<Slam at={HK_TEXT} size={60}>
						TAKHLE VYPADÁ
					</Slam>
					<Slam at={HK_TEXT + 6} size={104} color={C.accent}>
						40 LET TVÉHO
					</Slam>
					<Slam at={HK_TEXT + 6} size={104} color={C.accent}>
						ŽIVOTA.
					</Slam>
				</div>
			</AbsoluteFill>
			<Flash at={[HK_TEXT]} />
		</Shake>
	);
};

/* ---------- 2) LOOP (210 f): vstaneš, jedeš, makáš, spíš, opakuj ---------- */
const STEPS = [
	{e: '⏰', t: 'VSTANEŠ.'},
	{e: '🚋', t: 'JEDEŠ.'},
	{e: '💻', t: 'MAKÁŠ 9–17.'},
	{e: '🛋️', t: 'PADNEŠ.'},
	{e: '😴', t: 'SPÍŠ.'},
];
// step lengths accelerate
const STEP_LENS = [18, 16, 16, 14, 14, 10, 9, 9, 8, 8, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
export const LOOP_STEP_STARTS = STEP_LENS.reduce<number[]>((acc, l, i) => [...acc, i === 0 ? 0 : acc[i - 1] + STEP_LENS[i - 1]], []);
const LOOP_END = LOOP_STEP_STARTS[LOOP_STEP_STARTS.length - 1] + STEP_LENS[STEP_LENS.length - 1];
export const LOOP_OPAKUJ = LOOP_END + 4;
const Loop: React.FC = () => {
	const f = useCurrentFrame();
	let idx = 0;
	LOOP_STEP_STARTS.forEach((s, i) => {
		if (f >= s) idx = i;
	});
	const st = STEPS[idx % STEPS.length];
	const local = f - LOOP_STEP_STARTS[idx];
	const pop = interpolate(local, [0, 3], [1.25, 1], clamp);
	const age = Math.round(interpolate(f, [0, LOOP_END], [20, 60], {...clamp, easing: Easing.in(Easing.quad)}));
	const opakuj = f >= LOOP_OPAKUJ;
	const blur = idx > 14 && !opakuj ? 3 : 0;
	return (
		<AbsoluteFill style={{alignItems: 'center', textAlign: 'center'}}>
			<div style={{position: 'absolute', top: 210, fontFamily: FONT}}>
				<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.muted}}>VĚK</div>
				<div style={{fontSize: 130, fontWeight: 900, color: C.white, textShadow: glow(C.white, 20), fontVariantNumeric: 'tabular-nums'}}>{age}</div>
			</div>
			<div style={{position: 'absolute', top: 470, left: 140, right: 140, height: 14, borderRadius: 7, background: C.faint}}>
				<div style={{width: `${((age - 20) / 45) * 100}%`, height: '100%', borderRadius: 7, background: RED, boxShadow: `0 0 12px ${RED}`}} />
			</div>
			{!opakuj ? (
				<>
					<div style={{position: 'absolute', top: 640, fontSize: 320, transform: `scale(${pop})`, filter: `blur(${blur}px)`}}>{st.e}</div>
					<div style={{position: 'absolute', top: 1120, left: 40, right: 40, fontFamily: FONT, fontWeight: 900, fontSize: 120, color: C.white, textShadow: glow(C.white, 24), transform: `scale(${pop})`, filter: `blur(${blur}px)`}}>{st.t}</div>
				</>
			) : (
				<div style={{position: 'absolute', top: 760}}>
					<Slam at={LOOP_OPAKUJ} size={170} color={RED}>
						OPAKUJ.
					</Slam>
					<Slam at={LOOP_OPAKUJ + 8} size={64} style={{marginTop: 30}}>
						× 9 000 DNÍ.
					</Slam>
				</div>
			)}
		</AbsoluteFill>
	);
};

/* ---------- 3) TIME (135 f): 81 720 hodin = 9 let ---------- */
export const TM_COUNT = 30;
export const TM_SLAM = 84;
const Time: React.FC = () => {
	const f = useCurrentFrame();
	const hours = interpolate(f, [TM_COUNT, TM_COUNT + 44], [0, 81720], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<Shake hits={[TM_SLAM]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 260, left: 40, right: 40}}>
					<Slam at={0} size={56}>
						ČAS JE TO NEJCENNĚJŠÍ,
					</Slam>
					<Slam at={6} size={56}>
						CO V ŽIVOTĚ MÁŠ.
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, fontFamily: FONT, opacity: prog(f, TM_COUNT, 6)}}>
					<div style={{fontSize: 190, fontWeight: 900, color: C.white, textShadow: glow(C.white, 30), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{fmt(hours)}</div>
					<div style={{fontSize: 40, fontWeight: 800, letterSpacing: 4, color: C.muted, marginTop: 16}}>HODIN V PRÁCI A CESTOU</div>
				</div>
				<div style={{position: 'absolute', top: 1100, left: 40, right: 40}}>
					<Slam at={TM_SLAM} size={70}>
						TO JE
					</Slam>
					<Slam at={TM_SLAM} size={150} color={RED}>
						9 LET
					</Slam>
					<Slam at={TM_SLAM + 6} size={70}>
						ŽIVOTA V KUSE.
					</Slam>
				</div>
				<Footnote bottom={150} o={prog(f, TM_SLAM, 10)}>
					8 h práce + 1 h cesta, 227 pracovních dní ročně, 40 let. Třetina času, kdy jsi vzhůru.
				</Footnote>
			</AbsoluteFill>
			<Flash at={[TM_SLAM]} />
		</Shake>
	);
};

/* ---------- 4) VACATION (75 f): měsíc na Bali? zamítnuto ---------- */
export const VC_STAMP = 40;
const Vacation: React.FC = () => {
	const f = useCurrentFrame();
	const fly = interpolate(f, [0, VC_STAMP], [-300, 640], {...clamp, easing: Easing.out(Easing.quad)});
	const st = interpolate(f - VC_STAMP, [0, 5], [2.4, 1], clamp);
	return (
		<Shake hits={[VC_STAMP]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 300, left: 40, right: 40}}>
					<Slam at={0} size={66}>
						MĚSÍC NA BALI,
					</Slam>
					<Slam at={6} size={66} color={C.accent}>
						KDY SE TI ZACHCE?
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 820, left: fly, fontSize: 260, transform: 'rotate(-10deg)'}}>✈️</div>
				{f >= VC_STAMP ? (
					<div style={{position: 'absolute', top: 900, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<div style={{transform: `rotate(-12deg) scale(${st})`, border: `10px solid ${RED}`, borderRadius: 20, padding: '20px 50px', fontFamily: FONT, fontWeight: 900, fontSize: 120, color: RED, letterSpacing: 6, textShadow: glow(RED, 20), background: 'rgba(6,17,12,0.6)'}}>
							ZAMÍTNUTO
						</div>
					</div>
				) : null}
			</AbsoluteFill>
		</Shake>
	);
};

/* ---------- 5) MONEY (120 f): 40 000 odteče ---------- */
const BILLS = [
	{t: 'NÁJEM', v: 18000},
	{t: 'JÍDLO', v: 8000},
	{t: 'AUTO / MHD', v: 4000},
	{t: 'TELEFON, NETFLIX…', v: 1500},
	{t: 'VÍKENDY VEN', v: 5000},
	{t: 'NEČEKANÉ VÝDAJE', v: 3500},
];
export const MN_IN = 4;
export const MN_BILL_FIRST = 26;
export const MN_BILL_EVERY = 9;
export const MN_ZERO = MN_BILL_FIRST + BILLS.length * MN_BILL_EVERY + 4;
const Money: React.FC = () => {
	const f = useCurrentFrame();
	const paid = BILLS.filter((_, i) => f >= MN_BILL_FIRST + i * MN_BILL_EVERY).reduce((a, b) => a + b.v, 0);
	const bal = 40000 - paid;
	return (
		<AbsoluteFill style={{textAlign: 'center'}}>
			<div style={{position: 'absolute', top: 220, left: 0, right: 0}}>
				<Slam at={MN_IN} size={50}>
					VÝPLATA PŘIJDE…
				</Slam>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, color: bal > 5000 ? C.accent : RED, textShadow: glow(bal > 5000 ? C.accent : RED, 30), fontVariantNumeric: 'tabular-nums', opacity: prog(f, MN_IN, 6)}}>
					{fmt(bal)} Kč
				</div>
			</div>
			<div style={{position: 'absolute', top: 640, left: 140, right: 140}}>
				{BILLS.map((b, i) => {
					const p = prog(f, MN_BILL_FIRST + i * MN_BILL_EVERY, 6, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					return (
						<div key={b.t} style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white, marginBottom: 20, transform: `translateX(${(1 - p) * 80}px)`, opacity: p}}>
							<span>{b.t}</span>
							<span style={{color: RED}}>−{fmt(b.v)}</span>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 1260, left: 40, right: 40}}>
				<Slam at={MN_ZERO} size={58}>
					ŽÍT SE DÁ.
				</Slam>
				<Slam at={MN_ZERO + 10} size={86} color={RED}>
					UŽÍT SI MOC NE.
				</Slam>
				<Slam at={MN_ZERO + 22} size={44} style={{marginTop: 26, color: C.muted}}>
					ODLOŽENO: 0 Kč
				</Slam>
			</div>
		</AbsoluteFill>
	);
};

/* ---------- 6) PENSION (75 f): důchod 21 803 Kč ---------- */
export const PN_STAMP = 16;
const Pension: React.FC = () => {
	const f = useCurrentFrame();
	const st = interpolate(f - PN_STAMP, [0, 5], [2.4, 1], clamp);
	return (
		<Shake hits={[PN_STAMP]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 260, left: 0, right: 0}}>
					<Slam at={0} size={56} style={{color: C.muted}}>
						VĚK 65.
					</Slam>
					<Slam at={4} size={80}>
						SPOLÉHÁŠ NA STÁT.
					</Slam>
				</div>
				{f >= PN_STAMP ? (
					<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
						<div style={{transform: `rotate(-6deg) scale(${st})`, border: `10px solid ${RED}`, borderRadius: 24, padding: '30px 50px', fontFamily: FONT, background: 'rgba(6,17,12,0.6)'}}>
							<div style={{fontWeight: 900, fontSize: 52, letterSpacing: 6, color: RED}}>DŮCHOD</div>
							<div style={{fontWeight: 900, fontSize: 150, color: RED, textShadow: glow(RED, 24), fontVariantNumeric: 'tabular-nums'}}>21 803 Kč</div>
						</div>
					</div>
				) : null}
				<div style={{position: 'absolute', top: 1260, left: 40, right: 40}}>
					<Slam at={PN_STAMP + 18} size={64}>
						A NIC SIS NEVYBUDOVAL.
					</Slam>
				</div>
				<Footnote bottom={150} o={prog(f, PN_STAMP + 10, 10)}>
					Průměrný starobní důchod, ČSSZ, červen 2026.
				</Footnote>
			</AbsoluteFill>
		</Shake>
	);
};

/* ---------- 7) REWIND (50 f): VHS převíjení ---------- */
const Rewind: React.FC = () => {
	const f = useCurrentFrame();
	const age = Math.round(interpolate(f, [0, 34], [65, 20], clamp));
	const split = 10 + Math.sin(f * 1.7) * 6;
	const txt = (color: string, dx: number) => (
		<div style={{position: 'absolute', top: 720, left: dx, right: -dx, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 230, color, mixBlendMode: 'screen', fontVariantNumeric: 'tabular-nums'}}>
			⏪ {age}
		</div>
	);
	return (
		<AbsoluteFill>
			{/* scanlines + noise bars */}
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)'}} />
			{Array.from({length: 6}).map((_, i) => {
				const y = ((f * 90 + i * 337) % 2100) - 100;
				return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: 20 + rnd(i) * 60, background: 'rgba(241,247,236,0.10)'}} />;
			})}
			{txt('#ff3b6b', -split)}
			{txt('#3bfff0', split)}
			{txt(C.white, 0)}
			<div style={{position: 'absolute', top: 1120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.accent, textShadow: glow(C.accent, 20), opacity: prog(f, 22, 8)}}>
				…A CO KDYBY JINAK?
			</div>
			<div style={{position: 'absolute', top: 120, left: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 44, color: C.white, opacity: Math.floor(f / 6) % 2 ? 1 : 0.4}}>◀◀ REW</div>
		</AbsoluteFill>
	);
};

/* ---------- 8) IDEA (90 f): chceš víc, nemáš nápad → ten mám já ---------- */
export const ID_ON = 40;
const Idea: React.FC = () => {
	const f = useCurrentFrame();
	const flick = f >= 26 && f < ID_ON ? (Math.floor(f / 2) % 2 === 0 ? 1 : 0) : f >= ID_ON ? 1 : 0;
	const punch = f >= ID_ON ? 1 + 0.25 * Math.exp(-(f - ID_ON) / 4) : 1;
	return (
		<Shake hits={[ID_ON]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 260, left: 40, right: 40}}>
					<Slam at={0} size={84}>
						CHCEŠ VÍC.
					</Slam>
					<Slam at={10} size={84} color={C.muted}>
						ALE NEMÁŠ NÁPAD?
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 640, left: 0, right: 0, fontSize: 340, transform: `scale(${punch})`, filter: flick ? `drop-shadow(0 0 60px ${C.accent})` : 'grayscale(1) brightness(0.4)'}}>💡</div>
				<div style={{position: 'absolute', top: 1180, left: 40, right: 40}}>
					<Slam at={ID_ON} size={128} color={C.accent}>
						TEN MÁM JÁ.
					</Slam>
				</div>
			</AbsoluteFill>
			<Flash at={[ID_ON]} />
		</Shake>
	);
};

/* ---------- 9) GAINS (165 f): u mě získáš ---------- */
const GAINS = ['OBCHODNÍ ZKUŠENOSTI', 'VLASTNÍ PODNIKÁNÍ', 'ZAŠKOLENÍ ZA 100 000 Kč ZDARMA', 'MENTOR, TÝM A KANCELÁŘE', 'TVŮJ ČAS, TVŮJ ROZVRH', 'PŘÍJEM PODLE VÝSLEDKŮ, NE TABULKY'];
export const GN_FIRST = 18;
export const GN_EVERY = 18;
const Gains: React.FC = () => {
	const f = useCurrentFrame();
	const cur = Math.min(GAINS.length - 1, Math.floor((f - GN_FIRST) / GN_EVERY));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center'}}>
				<Slam at={0} size={60}>
					KARIÉRA, KTERÁ TĚ
				</Slam>
				<Slam at={4} size={100} color={C.accent}>
					NEBUDE NUDIT:
				</Slam>
			</div>
			<div style={{position: 'absolute', top: 640, left: 80, right: 60}}>
				{GAINS.map((t, i) => {
					const p = prog(f, GN_FIRST + i * GN_EVERY, 7, Easing.out(Easing.back(2)));
					if (p <= 0) return null;
					const active = i === cur;
					return (
						<div key={t} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, transform: `translateX(${(1 - p) * -60}px) scale(${active ? 1.04 : 1})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.3)}}>
							<div style={{width: 58, height: 58, borderRadius: 29, background: active ? C.accent : 'rgba(197,242,155,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? `0 0 24px ${C.accent}` : 'none', flexShrink: 0}}>
								<svg width={30} height={30} viewBox="0 0 34 34">
									<path d="M 7 17.5 L 14 24.5 L 27 10" fill="none" stroke={active ? C.dark : C.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<div style={{fontFamily: FONT, fontWeight: 900, fontSize: active ? 48 : 42, lineHeight: 1.1, color: active ? C.white : 'rgba(241,247,236,0.75)', textShadow: active ? glow(C.white, 14) : 'none'}}>{t}</div>
						</div>
					);
				})}
			</div>
			<Footnote bottom={150} o={prog(f, GN_FIRST + 5 * GN_EVERY, 12)}>
				Spolupráce na živnostenský list. Příjem závisí na tvém výkonu a není zaručen.
			</Footnote>
		</AbsoluteFill>
	);
};

/* ---------- 10) CTA (165 f): komentář START ---------- */
export const CT_WORD = 18;
export const CT_TYPE = [40, 45, 50, 55, 60];
export const CT_SEND = 70;
const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const typed = CT_TYPE.filter((t) => f >= t).length;
	const sent = f >= CT_SEND;
	const bubble = prog(f, 28, 10, Easing.out(Easing.back(2)));
	return (
		<Shake hits={[CT_WORD]}>
			<AbsoluteFill style={{textAlign: 'center'}}>
				<div style={{position: 'absolute', top: 230, left: 0, right: 0}}>
					<Slam at={0} size={54}>
						MAKÁŠ A ZAJÍMÁ TĚ TO?
					</Slam>
					<Slam at={6} size={54} style={{marginTop: 10}}>
						NAPIŠ DO KOMENTÁŘE
					</Slam>
					<Slam at={CT_WORD} size={250} color={C.accent}>
						START
					</Slam>
				</div>
				<div style={{position: 'absolute', top: 960, left: 90, right: 90, transform: `scale(${bubble})`, opacity: bubble > 0 ? 1 : 0}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 999, border: `3px solid ${sent ? C.accent : C.faint}`, background: 'rgba(241,247,236,0.05)', boxShadow: sent ? `0 0 30px ${C.accent}66` : 'none'}}>
						<div style={{width: 64, height: 64, borderRadius: 32, background: `conic-gradient(${C.accent}, #f5d36b, #ff7a7a, ${C.accent})`, flexShrink: 0}} />
						<div style={{flex: 1, textAlign: 'left', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: typed ? C.white : C.muted}}>
							{typed ? 'START'.slice(0, typed) : 'Přidat komentář…'}
							{!sent && typed < 5 && Math.floor(f / 8) % 2 === 0 ? <span style={{color: C.accent}}>|</span> : null}
						</div>
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.accent}}>{sent ? '✓' : 'ODESLAT'}</div>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1180, left: 80, right: 80, opacity: prog(f, CT_SEND + 10, 10)}}>
					<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: 1.4, color: C.white}}>
						POŠLU TI, JAK TO U NÁS FUNGUJE
						<br />+ POZVÁNKU NA <span style={{color: C.accent}}>30MIN ONLINE INFO</span>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1420, left: 0, right: 0, opacity: prog(f, CT_SEND + 22, 10)}}>
					<Pill light size={30}>
						TVŮJ ČAS JE TO NEJCENNĚJŠÍ ⏳
					</Pill>
				</div>
				<div style={{position: 'absolute', bottom: 150, left: 0, right: 0, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: C.white, opacity: prog(f, CT_SEND + 22, 12)}}>
					ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
				</div>
			</AbsoluteFill>
			<Flash at={[CT_WORD]} />
		</Shake>
	);
};

const SCENES: SceneDef[] = [
	{name: 'Hook – budík 06:30', dur: 75, C: Hook},
	{name: 'Smyčka dne', dur: LOOP_OPAKUJ + 40, C: Loop},
	{name: 'Čas – 9 let v kuse', dur: 135, C: Time},
	{name: 'Dovolená – zamítnuto', dur: 75, C: Vacation},
	{name: 'Výplata odteče', dur: 120, C: Money},
	{name: 'Důchod 21 803 Kč', dur: 75, C: Pension},
	{name: 'Převinutí VHS', dur: 50, C: Rewind},
	{name: 'Nápad – ten mám já', dur: 90, C: Idea},
	{name: 'Co získáš', dur: 165, C: Gains},
	{name: 'CTA komentář START', dur: 165, C: Cta},
];
export const SMYCKA_DUR = sumDur(SCENES);
export const SMYCKA_STARTS = SCENES.reduce<number[]>((a, s, i) => [...a, i === 0 ? 0 : a[i - 1] + SCENES[i - 1].dur], []);
export const SmyckaReel = makeReel(SCENES, 'smycka-sfx.wav');

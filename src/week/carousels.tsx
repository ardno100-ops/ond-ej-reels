import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Check, Pill} from '../components';
import {C, FONT, glow} from '../theme';

export const CW = 1080;
export const CH = 1350;

type Slide =
	| {kind: 'cover'; kicker: string; big: string; big2: string; note?: string}
	| {kind: 'point'; num: string; title: string; body: string; flag?: boolean}
	| {kind: 'checks'; title: string; items: string[]; cta: string}
	| {kind: 'end'; title: string; big: string; body: string};

const Frame: React.FC<{i: number; n: number; children: React.ReactNode}> = ({i, n, children}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 45%, ${C.bgGlow} 0%, ${C.bg} 72%)`, fontFamily: FONT}}>
		{children}
		<div style={{position: 'absolute', bottom: 56, left: 72, right: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
			<div style={{fontSize: 22, fontWeight: 800, letterSpacing: 4, color: C.white, opacity: 0.85}}>ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA</div>
			<div style={{display: 'flex', gap: 10}}>
				{Array.from({length: n}).map((_, k) => (
					<div key={k} style={{width: k === i ? 28 : 10, height: 10, borderRadius: 5, background: k === i ? C.accent : C.faint}} />
				))}
			</div>
		</div>
		{i < n - 1 ? (
			<div style={{position: 'absolute', right: 72, top: 70, fontSize: 26, fontWeight: 800, letterSpacing: 3, color: C.accent}}>SWIPE →</div>
		) : null}
	</AbsoluteFill>
);

const SlideView: React.FC<{s: Slide}> = ({s}) => {
	if (s.kind === 'cover') {
		return (
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 80}}>
				<Pill light size={28}>
					{s.kicker}
				</Pill>
				<div style={{marginTop: 50, fontSize: 124, fontWeight: 900, lineHeight: 1.0, color: C.accent, textShadow: glow(C.accent, 36)}}>{s.big}</div>
				<div style={{fontSize: 104, fontWeight: 900, lineHeight: 1.05, color: C.white, textShadow: glow(C.white, 24)}}>{s.big2}</div>
				{s.note ? <div style={{marginTop: 46, fontSize: 32, fontWeight: 700, letterSpacing: 3, color: C.muted}}>{s.note}</div> : null}
			</AbsoluteFill>
		);
	}
	if (s.kind === 'point') {
		return (
			<AbsoluteFill style={{justifyContent: 'center', padding: '0 96px'}}>
				<div style={{fontSize: 200, fontWeight: 900, color: s.flag ? '#ff8a7a' : C.accent, opacity: 0.9, lineHeight: 1, textShadow: glow(s.flag ? '#ff8a7a' : C.accent, 30)}}>
					{s.flag ? '🚩 ' : ''}
					{s.num}
				</div>
				<div style={{marginTop: 36, fontSize: 84, fontWeight: 900, lineHeight: 1.04, color: C.white, textShadow: glow(C.white, 18)}}>{s.title}</div>
				<div style={{marginTop: 40, fontSize: 40, fontWeight: 600, lineHeight: 1.4, color: C.muted}}>{s.body}</div>
			</AbsoluteFill>
		);
	}
	if (s.kind === 'checks') {
		return (
			<AbsoluteFill style={{justifyContent: 'center', padding: '0 96px'}}>
				<div style={{fontSize: 76, fontWeight: 900, lineHeight: 1.05, color: C.accent, textShadow: glow(C.accent, 30), marginBottom: 60}}>{s.title}</div>
				{s.items.map((t) => (
					<Check key={t} text={t} o={1} dx={0} />
				))}
				<div style={{marginTop: 50}}>
					<Pill light size={34}>
						{s.cta}
					</Pill>
				</div>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 90}}>
			<div style={{fontSize: 40, fontWeight: 800, letterSpacing: 5, color: C.white}}>{s.title}</div>
			<div style={{marginTop: 24, fontSize: 110, fontWeight: 900, lineHeight: 1.02, color: C.accent, textShadow: glow(C.accent, 34)}}>{s.big}</div>
			<div style={{marginTop: 44, fontSize: 38, fontWeight: 700, lineHeight: 1.45, color: C.muted}}>{s.body}</div>
		</AbsoluteFill>
	);
};

const makeCarousel = (slides: Slide[]): React.FC => {
	const Car: React.FC = () => {
		const i = Math.min(slides.length - 1, useCurrentFrame());
		return (
			<Frame i={i} n={slides.length}>
				<SlideView s={slides[i]} />
			</Frame>
		);
	};
	return Car;
};

export const UT_SLIDES: Slide[] = [
	{kind: 'cover', kicker: '17. LISTOPAD · DEN STUDENTSTVA', big: 'CO TI ŠKOLA', big2: 'NEŘEKNE O KARIÉŘE', note: '5 VĚCÍ, KTERÉ BYCH CHTĚL VĚDĚT VE 20'},
	{kind: 'point', num: '01', title: 'ZNÁMKY ≠ PŘÍJEM.', body: 'Červený diplom ti nezaplatí nájem. Rozhoduje, jakou hodnotu umíš přinést lidem.'},
	{kind: 'point', num: '02', title: 'KONTAKTY > CV.', body: 'Spousta příležitostí nepřijde přes inzerát, ale přes lidi, kteří tě znají a věří ti.'},
	{kind: 'point', num: '03', title: 'PRODEJ JE DOVEDNOST. NE SPROSTÉ SLOVO.', body: 'Prodáváš pořád: sebe na pohovoru, nápad šéfovi, projekt týmu. Kdo to umí, má náskok.'},
	{kind: 'point', num: '04', title: 'PLATÍ SE ZA HODNOTU, NE ZA ČAS.', body: 'Hodinová mzda má strop. Čím větší problém vyřešíš, tím víc si řekneš.'},
	{kind: 'point', num: '05', title: 'NEJLEVNĚJŠÍ DOBA ZKOUŠET JE TEĎ.', body: 'Ve 20 tě pokus stojí hlavně čas. Ve 35 hypotéku, rodinu a nervy.'},
	{kind: 'end', title: 'KTERÝ BOD TĚ TREFIL?', big: 'NAPIŠ ČÍSLO DO KOMENTU', body: 'Ulož si to na později a pošli kamarádovi, který to potřebuje slyšet.'},
];

export const SO_SLIDES: Slide[] = [
	{kind: 'cover', kicker: 'NEŽ NĚKDE PODEPÍŠEŠ', big: '6 RED FLAGS', big2: 'PRACOVNÍ NABÍDKY', note: 'PODLE TOHO POZNÁŠ, ŽE MÁŠ UTÉCT'},
	{kind: 'point', flag: true, num: '01', title: 'SLIBUJÍ RYCHLÉ ZBOHATNUTÍ.', body: 'Seriózní firma mluví o práci a růstu, ne o Lambě za 3 měsíce.'},
	{kind: 'point', flag: true, num: '02', title: 'PLATÍŠ ZA VSTUP.', body: 'Startovací balíček, povinný kurz nebo zboží za tvoje peníze? Pryč.'},
	{kind: 'point', flag: true, num: '03', title: 'ŽÁDNÉ ZAŠKOLENÍ.', body: '„Prostě to zkus“ není systém. Kdo tě nic nenaučí, ten s tebou nepočítá.'},
	{kind: 'point', flag: true, num: '04', title: 'TLAK NA RODINU A KAMARÁDY.', body: 'Když je jediný plán „obvolej všechny známé“, něco je špatně.'},
	{kind: 'point', flag: true, num: '05', title: 'NEJASNÁ PRAVIDLA.', body: 'Nevíš, co splnit pro postup? Nevíš, za co dostaneš zaplaceno? Red flag.'},
	{kind: 'point', flag: true, num: '06', title: 'ŽÁDNÁ REGULACE.', body: 'Ve financích musí mít poradce registraci u ČNB. Bez ní nesmí radit.'},
	{kind: 'checks', title: 'JAK POZNÁŠ SERIÓZNÍ PŘÍLEŽITOST:', items: ['ZAŠKOLENÍ ZDARMA', 'JASNÝ KARIÉRNÍ PLÁN', 'REGISTRACE U ČNB', 'ZA VSTUP NEPLATÍŠ NIC'], cta: 'NAPIŠ MI – UKÁŽU, JAK TO MÁME MY'},
];

export const UtCarousel = makeCarousel(UT_SLIDES);
export const SoCarousel = makeCarousel(SO_SLIDES);

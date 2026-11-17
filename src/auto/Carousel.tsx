import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Img, staticFile, useCurrentFrame} from 'remotion';

/* Weekly carousel in the owner's best-performing style (1080×1350):
   kicker „03 / PRVNÍCH PĚT LET“, logo top-right, two-tone headline (white + green),
   body / two columns / CTA pill, engraved green illustration at the bottom fading in,
   footer „ONDŘEJ ZEMÁNEK / KARIÉRA & PODNIKÁNÍ“ + page counter. One frame = one slide. */

export const CW = 1080;
export const CH = 1350;
const GREEN = '#c5f29b';
const WHITE = '#f4f7f1';
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

export type CarouselSlide = {
	kicker: string; // e.g. "PRVNÍCH PĚT LET" (number is added automatically)
	title?: string[]; // white lines
	accent?: string[]; // green lines (after white)
	accentFirst?: boolean; // green lines first
	body?: string;
	columns?: {head: string; text: string}[];
	cta?: string; // pill text, e.g. 'Napiš mi „KARIÉRA“'
	ctaNote?: string;
	image?: string; // path under public/, e.g. "carousel/lib/student-vs-podnikatel.png"
	bigNumber?: string; // fallback visual when no illustration: huge outlined number in the lower half
	imageHeight?: number; // default 680
	titleSize?: number; // default 84
};

export type CarouselSpec = {id: string; footer?: string; slides: CarouselSlide[]};

const Slide: React.FC<{s: CarouselSlide; i: number; n: number; footer: string}> = ({s, i, n, footer}) => {
	const num = String(i + 1).padStart(2, '0');
	const total = String(n).padStart(2, '0');
	const titleSize = s.titleSize ?? 84;
	const imgH = s.imageHeight ?? 680;
	const lines = (arr: string[] | undefined, color: string) =>
		(arr ?? []).map((t, k) => (
			<div key={color + k} style={{color}}>
				{t}
			</div>
		));
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #1c3a2b 0%, #10261b 45%, #0a1a12 100%)', fontFamily: FONT, overflow: 'hidden'}}>
			{/* faint decorative arc */}
			<div style={{position: 'absolute', top: -520, right: -420, width: 1100, height: 1100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)'}} />
			{s.image ? (
				<Img
					src={staticFile(s.image)}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 98,
						width: CW,
						height: imgH,
						objectFit: 'cover',
						objectPosition: 'center bottom',
						WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 14%, #000 32%)',
						maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 14%, #000 32%)',
					}}
				/>
			) : null}
			{!s.image && s.bigNumber ? (
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontSize: 520, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: 'rgba(197,242,155,0.06)', WebkitTextStroke: `3px ${GREEN}66`, textShadow: `0 0 60px ${GREEN}33`}}>
					{s.bigNumber}
				</div>
			) : null}
			<div style={{position: 'absolute', top: 56, left: 66, fontSize: 25, fontWeight: 500, letterSpacing: 3.2, color: 'rgba(244,247,241,0.78)'}}>
				{num} / {s.kicker.toUpperCase()}
			</div>
			<Img src={staticFile('brand/logo-carousel.png')} style={{position: 'absolute', top: 20, right: 40, width: 110, height: 110, borderRadius: 55}} />
			<div style={{position: 'absolute', top: 128, left: 66, right: 66}}>
				<div style={{fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em'}}>
					{s.accentFirst ? lines(s.accent, GREEN) : lines(s.title, WHITE)}
					{s.accentFirst ? lines(s.title, WHITE) : lines(s.accent, GREEN)}
				</div>
				{s.cta ? (
					<div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 22, padding: '16px 30px', borderRadius: 40, border: `2px solid ${GREEN}88`, color: GREEN, fontSize: 34, fontWeight: 700}}>
						{s.cta} <span style={{fontSize: 36}}>→</span>
					</div>
				) : null}
				{s.body ? <div style={{marginTop: s.cta ? 30 : 26, fontSize: 31, fontWeight: 500, lineHeight: 1.36, color: WHITE}}>{s.body}</div> : null}
				{s.ctaNote ? <div style={{marginTop: 18, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: 'rgba(244,247,241,0.85)'}}>{s.ctaNote}</div> : null}
				{s.columns ? (
					<div style={{marginTop: 30, display: 'flex', gap: 36}}>
						{s.columns.map((c) => (
							<div key={c.head} style={{flex: 1, borderTop: '1.5px solid rgba(255,255,255,0.16)', paddingTop: 22}}>
								<div style={{fontSize: 29, fontWeight: 700, color: GREEN, marginBottom: 12}}>{c.head}</div>
								<div style={{fontSize: 28, fontWeight: 500, lineHeight: 1.36, color: WHITE}}>{c.text}</div>
							</div>
						))}
					</div>
				) : null}
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, bottom: 97, height: 1.5, background: 'rgba(255,255,255,0.14)'}} />
			<div style={{position: 'absolute', left: 58, right: 58, bottom: 38, display: 'flex', justifyContent: 'space-between', fontSize: 21, fontWeight: 600, letterSpacing: 2, color: 'rgba(244,247,241,0.92)'}}>
				<span>{footer}</span>
				<span>
					{num} / {total}
				</span>
			</div>
		</AbsoluteFill>
	);
};

export const Carousel: React.FC<CarouselSpec> = ({slides, footer}) => {
	const f = useCurrentFrame();
	const i = Math.min(slides.length - 1, f);
	return <Slide s={slides[i]} i={i} n={slides.length} footer={footer ?? 'ONDŘEJ ZEMÁNEK / KARIÉRA & PODNIKÁNÍ'} />;
};

export const calcCarouselMeta: CalculateMetadataFunction<CarouselSpec> = ({props}) => ({durationInFrames: Math.max(1, props.slides.length)});

export const CAROUSEL_DEFAULT: CarouselSpec = {
	id: 'ukazka',
	slides: [
		{kicker: 'Kariéra · Podnikání', title: ['Dva lidé. Oběma je 20.'], accent: ['Oba chtějí podnikat.'], body: 'Kdo bude mít za pět let náskok?', image: 'carousel/lib/student-vs-podnikatel.png'},
	],
};

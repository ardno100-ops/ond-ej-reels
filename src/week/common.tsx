import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background, Footnote, Headline, Pill, SceneFade} from '../components';
import {PunchIn} from '../pecka/scenes';
import {C, FONT, H, W, glow, prog} from '../theme';

export const FullSvg: React.FC<{children: React.ReactNode; h?: number}> = ({children, h = H}) => (
	<svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

export const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

export type SceneDef = {name: string; dur: number; C: React.FC};

export const sumDur = (s: SceneDef[]) => s.reduce((a, x) => a + x.dur, 0);

/** Generic reel: background + scenes with punch-in + soundtrack. */
export const makeReel = (scenes: SceneDef[], audio: string): React.FC => {
	const Reel: React.FC = () => {
		let from = 0;
		return (
			<AbsoluteFill style={{backgroundColor: C.bg}}>
				<Background />
				{scenes.map(({name, dur, C: Scene}, i) => {
					const seq = (
						<Sequence key={name} name={name} from={from} durationInFrames={dur}>
							<SceneFade dur={dur} inF={i === 0 ? 0 : 4} outF={i === scenes.length - 1 ? 14 : 4}>
								<PunchIn>
									<Scene />
								</PunchIn>
							</SceneFade>
						</Sequence>
					);
					from += dur;
					return seq;
				})}
				<Audio src={staticFile(audio)} />
			</AbsoluteFill>
		);
	};
	return Reel;
};

/** Standard CTA scene. Button pops at `btnAt` frames. */
export const CTA_BTN_AT = 34;
export const makeCta = (o: {small: string; big: string; big2?: string; word: string; sub: string; foot?: string; visual?: React.FC}): React.FC => {
	const Cta: React.FC = () => {
		const f = useCurrentFrame();
		const btn = prog(f, CTA_BTN_AT, 14, Easing.out(Easing.back(2)));
		const pulse = f > CTA_BTN_AT + 14 ? 1 + Math.sin((f - CTA_BTN_AT) / 6) * 0.03 : 1;
		const V = o.visual;
		return (
			<AbsoluteFill>
				{V ? <V /> : null}
				<Headline small={o.small} big={o.big} big2={o.big2} at={2} top={270} bigSize={112} />
				<div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', opacity: btn > 0 ? 1 : 0}}>
					<div style={{display: 'inline-block', transform: `scale(${btn * pulse})`}}>
						<Pill light size={48}>
							NAPIŠ MI „{o.word}“
						</Pill>
					</div>
					<div style={{marginTop: 34, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.accent, opacity: prog(f, CTA_BTN_AT + 12, 12)}}>
						{o.sub}
					</div>
				</div>
				{o.foot ? (
					<Footnote bottom={220} o={prog(f, CTA_BTN_AT + 22, 14)}>
						{o.foot}
					</Footnote>
				) : null}
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
						opacity: prog(f, CTA_BTN_AT + 22, 14),
						textShadow: glow(C.white, 10),
					}}
				>
					ONDŘEJ ZEMÁNEK · FINANCE &amp; KARIÉRA
				</div>
			</AbsoluteFill>
		);
	};
	return Cta;
};

/** Pill that pops in at `at`. */
export const PopPill: React.FC<{at: number; x: number; y: number; light?: boolean; size?: number; children: React.ReactNode}> = ({
	at,
	x,
	y,
	light = false,
	size = 28,
	children,
}) => {
	const f = useCurrentFrame();
	const p = prog(f, at, 12, Easing.out(Easing.back(2.2)));
	if (p <= 0) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`}}>
			<Pill light={light} size={size}>
				{children}
			</Pill>
		</div>
	);
};

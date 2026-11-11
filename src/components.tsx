import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT, glow, prog} from './theme';

/* ---------- background ---------- */
export const Background: React.FC<{hue?: string}> = ({hue = C.bgGlow}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 70% 45% at 50% 48%, ${hue} 0%, ${C.bg} 70%)`,
		}}
	/>
);

/* ---------- scene fade wrapper ---------- */
export const SceneFade: React.FC<{dur: number; inF?: number; outF?: number; children: React.ReactNode}> = ({
	dur,
	inF = 8,
	outF = 8,
	children,
}) => {
	const f = useCurrentFrame();
	const fin = inF > 0 ? Math.min(1, f / inF) : 1;
	const fout = outF > 0 ? Math.min(1, Math.max(0, (dur - f) / outF)) : 1;
	const o = Math.min(fin, fout);
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/* ---------- headline: small line + big line, blur-in ---------- */
export const Headline: React.FC<{
	small?: string;
	big: React.ReactNode;
	big2?: React.ReactNode;
	at: number;
	until?: number;
	top?: number;
	bigSize?: number;
}> = ({small, big, big2, at, until = 1e9, top = 250, bigSize = 112}) => {
	const f = useCurrentFrame();
	const p = prog(f, at, 16);
	const out = prog(f, until, 8);
	const o = p * (1 - out);
	if (o <= 0.001) return null;
	const blur = (1 - p) * 18 + out * 10;
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: FONT,
				opacity: o,
				filter: `blur(${blur}px)`,
				transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
			}}
		>
			{small ? (
				<div
					style={{
						color: C.white,
						fontSize: 34,
						fontWeight: 800,
						letterSpacing: 5,
						marginBottom: 14,
					}}
				>
					{small}
				</div>
			) : null}
			<div
				style={{
					color: C.accent,
					fontSize: bigSize,
					fontWeight: 900,
					lineHeight: 1.02,
					letterSpacing: 1,
					textShadow: glow(C.accent, 34),
				}}
			>
				{big}
			</div>
			{big2 ? (
				<div
					style={{
						color: C.white,
						fontSize: bigSize,
						fontWeight: 900,
						lineHeight: 1.02,
						textShadow: glow(C.white, 26),
					}}
				>
					{big2}
				</div>
			) : null}
		</div>
	);
};

/* ---------- pill tag ---------- */
export const Pill: React.FC<{children: React.ReactNode; light?: boolean; size?: number; style?: React.CSSProperties}> = ({
	children,
	light = true,
	size = 28,
	style,
}) => (
	<div
		style={{
			display: 'inline-block',
			fontFamily: FONT,
			fontWeight: 800,
			fontSize: size,
			letterSpacing: 2,
			padding: `${size * 0.42}px ${size * 0.9}px`,
			borderRadius: 999,
			background: light ? C.white : 'rgba(197,242,155,0.12)',
			color: light ? C.dark : C.accent,
			border: light ? 'none' : `2px solid ${C.accentDim}`,
			boxShadow: light ? `0 0 30px rgba(241,247,236,0.35)` : 'none',
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{children}
	</div>
);

/* ---------- small footnote ---------- */
export const Footnote: React.FC<{children: React.ReactNode; bottom?: number; o?: number}> = ({
	children,
	bottom = 150,
	o = 1,
}) => (
	<div
		style={{
			position: 'absolute',
			bottom,
			left: 110,
			right: 110,
			textAlign: 'center',
			fontFamily: FONT,
			fontSize: 22,
			fontWeight: 500,
			color: C.muted,
			lineHeight: 1.4,
			opacity: o,
		}}
	>
		{children}
	</div>
);

/* ---------- person (SVG group, origin = feet center) ---------- */
export const Person: React.FC<{
	x: number;
	y: number;
	s?: number;
	color?: string;
	glowOn?: boolean;
	headTilt?: number;
	squat?: number; // 0..1
	barbell?: boolean;
	armsUp?: number; // 0..1
}> = ({x, y, s = 1, color = C.white, glowOn = true, headTilt = 0, squat = 0, barbell = false, armsUp = 0}) => {
	const bodyH = 64 - squat * 16;
	const bodyY = -bodyH - 6;
	const headY = bodyY - 26;
	const shoulderY = bodyY + 12;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} style={glowOn ? {filter: `drop-shadow(0 0 10px ${color}aa)`} : {}}>
			{/* legs */}
			<rect x={-17} y={-14} width={13} height={14} rx={5} fill={color} />
			<rect x={4} y={-14} width={13} height={14} rx={5} fill={color} />
			{/* body */}
			<rect x={-22} y={bodyY} width={44} height={bodyH} rx={16} fill={color} />
			{/* head */}
			<g transform={`rotate(${headTilt} 0 ${headY})`}>
				<circle cx={0} cy={headY} r={19} fill={color} />
			</g>
			{/* arms */}
			{barbell ? (
				<g>
					<line x1={-20} y1={shoulderY} x2={-34} y2={headY + 2} stroke={color} strokeWidth={10} strokeLinecap="round" />
					<line x1={20} y1={shoulderY} x2={34} y2={headY + 2} stroke={color} strokeWidth={10} strokeLinecap="round" />
					<rect x={-110} y={headY - 2} width={220} height={8} rx={4} fill={color} />
					<rect x={-104} y={headY - 26} width={18} height={56} rx={6} fill={color} />
					<rect x={86} y={headY - 26} width={18} height={56} rx={6} fill={color} />
					<rect x={-126} y={headY - 16} width={14} height={36} rx={5} fill={color} />
					<rect x={112} y={headY - 16} width={14} height={36} rx={5} fill={color} />
				</g>
			) : armsUp > 0 ? (
				<g>
					<line x1={-18} y1={shoulderY} x2={-30 - 10 * armsUp} y2={shoulderY - 50 * armsUp + 30 * (1 - armsUp)} stroke={color} strokeWidth={10} strokeLinecap="round" />
					<line x1={18} y1={shoulderY} x2={30 + 10 * armsUp} y2={shoulderY - 50 * armsUp + 30 * (1 - armsUp)} stroke={color} strokeWidth={10} strokeLinecap="round" />
				</g>
			) : null}
		</g>
	);
};

/* ---------- car (side view, facing right). origin = ground under car center ---------- */
export const Car: React.FC<{
	x: number;
	y: number;
	s?: number;
	wheelRot?: number;
	driver?: boolean;
	color?: string;
	bodyGlow?: number;
}> = ({x, y, s = 1, wheelRot = 0, driver = true, color = C.white, bodyGlow = 1}) => {
	const wheel = (cx: number) => (
		<g transform={`translate(${cx} -42)`}>
			<circle r={44} fill={C.dark} stroke={color} strokeWidth={6} />
			<circle r={26} fill="none" stroke={C.accent} strokeWidth={4} />
			<g transform={`rotate(${wheelRot})`}>
				{[0, 72, 144, 216, 288].map((a) => (
					<line key={a} x1={0} y1={0} x2={0} y2={-24} stroke={C.accent} strokeWidth={5} strokeLinecap="round" transform={`rotate(${a})`} />
				))}
			</g>
			<circle r={7} fill={color} />
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<g style={{filter: `drop-shadow(0 0 ${18 * bodyGlow}px ${C.accent}66)`}}>
				{/* body */}
				<path
					d="M -300 -40 L -298 -66 Q -294 -84 -262 -88 L -130 -104 Q -70 -146 0 -150 L 40 -150 Q 110 -146 190 -100 L 280 -88 Q 304 -82 304 -60 L 302 -44 Q 300 -34 286 -34 L -286 -34 Q -300 -34 -300 -40 Z"
					fill={color}
				/>
				{/* window */}
				<path d="M -112 -104 Q -64 -138 0 -140 L 36 -140 Q 92 -136 150 -104 Z" fill={C.dark} />
				<line x1={20} y1={-140} x2={14} y2={-104} stroke={color} strokeWidth={8} />
				{/* accent stripe */}
				<path d="M -280 -64 L 290 -72" stroke={C.accent} strokeWidth={6} strokeLinecap="round" />
				{/* lights */}
				<rect x={276} y={-92} width={22} height={12} rx={5} fill={C.accent} />
				<rect x={-300} y={-86} width={14} height={12} rx={4} fill="#ff6b5b" />
			</g>
			{driver ? (
				<g>
					<circle cx={-30} cy={-118} r={15} fill={color} />
				</g>
			) : null}
			{wheel(-170)}
			{wheel(178)}
		</g>
	);
};

/* ---------- dumpster. origin = ground center ---------- */
export const Dumpster: React.FC<{x: number; y: number; s?: number; lid?: number; color?: string}> = ({
	x,
	y,
	s = 1,
	lid = 0,
	color = '#3b4d42',
}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -110 -200 L 110 -200 L 96 -22 L -96 -22 Z" fill={color} stroke="#56695c" strokeWidth={4} />
		<rect x={-80} y={-170} width={12} height={120} rx={5} fill="#2c3a31" />
		<rect x={-30} y={-170} width={12} height={120} rx={5} fill="#2c3a31" />
		<rect x={20} y={-170} width={12} height={120} rx={5} fill="#2c3a31" />
		<rect x={70} y={-170} width={12} height={120} rx={5} fill="#2c3a31" />
		<g transform={`rotate(${-lid} -118 -204)`}>
			<rect x={-122} y={-216} width={244} height={18} rx={6} fill="#2a362e" stroke="#56695c" strokeWidth={3} />
		</g>
		<circle cx={-70} cy={-12} r={12} fill="#1b241e" stroke="#56695c" strokeWidth={3} />
		<circle cx={70} cy={-12} r={12} fill="#1b241e" stroke="#56695c" strokeWidth={3} />
	</g>
);

/* ---------- trash bag ---------- */
export const TrashBag: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M -46 0 Q -58 -50 -26 -74 L -12 -86 L 0 -76 L 12 -88 L 22 -72 Q 56 -48 46 0 Z" fill="#26322b" stroke="#4b5d51" strokeWidth={3} />
	</g>
);

/* ---------- checkmark row ---------- */
export const Check: React.FC<{text: string; o: number; dx: number}> = ({text, o, dx}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 22,
			opacity: o,
			transform: `translateX(${dx}px)`,
			fontFamily: FONT,
			fontWeight: 800,
			fontSize: 38,
			letterSpacing: 2,
			color: C.white,
			marginBottom: 26,
		}}
	>
		<svg width={44} height={44} viewBox="0 0 44 44">
			<circle cx={22} cy={22} r={19} fill="none" stroke={C.accent} strokeWidth={3.5} />
			<path d="M 13 22.5 L 19.5 29 L 31 16" fill="none" stroke={C.accent} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
		{text}
	</div>
);

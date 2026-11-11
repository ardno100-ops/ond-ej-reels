import {Easing, interpolate} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
	bg: '#06110c',
	bgGlow: '#123323',
	accent: '#c5f29b',
	accentDim: 'rgba(197,242,155,0.35)',
	white: '#f1f7ec',
	muted: 'rgba(241,247,236,0.45)',
	faint: 'rgba(241,247,236,0.14)',
	gray: '#5d6b62',
	dark: '#0c1c14',
};

export const FONT = 'Inter, "Inter Display", sans-serif';

export const glow = (color = C.accent, r = 28) =>
	`0 0 ${r}px ${color}88, 0 0 ${Math.round(r / 3)}px ${color}55`;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 progress between start and start+dur, clamped, eased. */
export const prog = (f: number, start: number, dur: number, easing = easeOut) =>
	interpolate(f, [start, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

export const fmt = (n: number) =>
	Math.round(n)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

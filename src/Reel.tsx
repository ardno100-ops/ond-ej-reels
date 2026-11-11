import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, SceneFade} from './components';
import {CTA_DUR, Cta, HOOK_DUR, HookReveal, OVERLOAD_DUR, Overload, PROBLEM_DUR, Problem, REPS_DUR, Reps, SOLUTION_DUR, Solution} from './scenes';

export const SCENES = [
	{name: 'Hook – Instagram vs realita', dur: HOOK_DUR, C: HookReveal},
	{name: 'Přehlcení nápady', dur: OVERLOAD_DUR, C: Overload},
	{name: 'Opáčka a schody', dur: REPS_DUR, C: Reps},
	{name: 'Nemáš nápad?', dur: PROBLEM_DUR, C: Problem},
	{name: 'Podnikání ve financích', dur: SOLUTION_DUR, C: Solution},
	{name: 'CTA', dur: CTA_DUR, C: Cta},
];

export const REEL_DUR = SCENES.reduce((a, s) => a + s.dur, 0);

export const KarieraReel: React.FC = () => {
	let from = 0;
	return (
		<AbsoluteFill style={{backgroundColor: '#06110c'}}>
			<Background />
			{SCENES.map(({name, dur, C}, i) => {
				const seq = (
					<Sequence key={name} name={name} from={from} durationInFrames={dur}>
						<SceneFade dur={dur} inF={i === 0 ? 0 : 6} outF={i === SCENES.length - 1 ? 14 : 6}>
							<C />
						</SceneFade>
					</Sequence>
				);
				from += dur;
				return seq;
			})}
			<Audio src={staticFile('soundtrack.wav')} />
		</AbsoluteFill>
	);
};

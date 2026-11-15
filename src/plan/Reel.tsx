import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, SceneFade} from '../components';
import {CTA_DUR, Cta, HOOK_DUR, Hook, LADDER_DUR, LadderScene, SAME_DUR, SamePay, TEAM_DUR, TIME_DUR, Team, Timeline} from './scenes';

export const PLAN_SCENES = [
	{name: 'Hook – kolik vyděláš firmě', dur: HOOK_DUR, C: Hook},
	{name: 'Makáš víc, dostaneš stejně', dur: SAME_DUR, C: SamePay},
	{name: 'Žebříček – čím výš, tím větší podíl', dur: LADDER_DUR, C: LadderScene},
	{name: 'Časová osa – 5 let', dur: TIME_DUR, C: Timeline},
	{name: 'Tým – stavíš svoji firmu', dur: TEAM_DUR, C: Team},
	{name: 'CTA – napiš PLÁN', dur: CTA_DUR, C: Cta},
];

export const PLAN_DUR = PLAN_SCENES.reduce((a, s) => a + s.dur, 0);

export const PlanReel: React.FC = () => {
	let from = 0;
	return (
		<AbsoluteFill style={{backgroundColor: '#06110c'}}>
			<Background />
			{PLAN_SCENES.map(({name, dur, C}, i) => {
				const seq = (
					<Sequence key={name} name={name} from={from} durationInFrames={dur}>
						<SceneFade dur={dur} inF={i === 0 ? 0 : 6} outF={i === PLAN_SCENES.length - 1 ? 14 : 6}>
							<C />
						</SceneFade>
					</Sequence>
				);
				from += dur;
				return seq;
			})}
			<Audio src={staticFile('plan-soundtrack.wav')} />
		</AbsoluteFill>
	);
};

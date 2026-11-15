import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, SceneFade} from '../components';
import {Hook} from '../plan/scenes';
import {CHART_DUR, CROWD_DUR, Chart, Crowd, FastLadder, IDEA_DUR, Idea, LADDER_DUR, MARKET_DUR, Market, PCTA_DUR, PeckaCta, PunchIn} from './scenes';

export const PECKA_HOOK = {dur: 165, coinEvery: 4, coinCount: 14, payDrop: 92};

const HookFast: React.FC = () => <Hook coinEvery={PECKA_HOOK.coinEvery} coinCount={PECKA_HOOK.coinCount} payDrop={PECKA_HOOK.payDrop} />;

export const PECKA_SCENES = [
	{name: 'Hook – kolik vyděláš firmě', dur: PECKA_HOOK.dur, C: HookFast},
	{name: 'Příjem v čase – rozbitý strop', dur: CHART_DUR, C: Chart},
	{name: 'Většina chce podnikat, nemá nápad', dur: CROWD_DUR, C: Crowd},
	{name: 'Ten já mám', dur: IDEA_DUR, C: Idea},
	{name: 'Žebříček', dur: LADDER_DUR, C: FastLadder},
	{name: 'Potenciál trhu', dur: MARKET_DUR, C: Market},
	{name: 'CTA – napiš NÁPAD', dur: PCTA_DUR, C: PeckaCta},
];

export const PECKA_DUR = PECKA_SCENES.reduce((a, s) => a + s.dur, 0);

export const PeckaReel: React.FC = () => {
	let from = 0;
	return (
		<AbsoluteFill style={{backgroundColor: '#06110c'}}>
			<Background />
			{PECKA_SCENES.map(({name, dur, C}, i) => {
				const seq = (
					<Sequence key={name} name={name} from={from} durationInFrames={dur}>
						<SceneFade dur={dur} inF={i === 0 ? 0 : 4} outF={i === PECKA_SCENES.length - 1 ? 14 : 4}>
							<PunchIn>
								<C />
							</PunchIn>
						</SceneFade>
					</Sequence>
				);
				from += dur;
				return seq;
			})}
			<Audio src={staticFile('pecka-soundtrack.wav')} />
		</AbsoluteFill>
	);
};

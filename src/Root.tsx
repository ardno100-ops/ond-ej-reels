import React from 'react';
import {Composition} from 'remotion';
import {KarieraReel, REEL_DUR} from './Reel';
import {PLAN_DUR, PlanReel} from './plan/Reel';
import {PECKA_DUR, PeckaReel} from './pecka/Reel';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="KarieraReel" component={KarieraReel} durationInFrames={REEL_DUR} fps={FPS} width={W} height={H} />
		<Composition id="KarieraPlan" component={PlanReel} durationInFrames={PLAN_DUR} fps={FPS} width={W} height={H} />
		<Composition id="KarieraPecka" component={PeckaReel} durationInFrames={PECKA_DUR} fps={FPS} width={W} height={H} />
	</>
);

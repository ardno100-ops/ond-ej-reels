import React from 'react';
import {Composition} from 'remotion';
import {KarieraReel, REEL_DUR} from './Reel';
import {PLAN_DUR, PlanReel} from './plan/Reel';
import {PECKA_DUR, PeckaReel} from './pecka/Reel';
import {FPS, H, W} from './theme';
import {WEEK_REELS} from './week/reels';
import {ENV_DUR, EnvReel} from './env/reel';
import {NABOR_DUR, NaborReel} from './nabor/reel';
import {SMYCKA_DUR, SmyckaReel} from './smycka/reel';
import {AUTO_DEFAULT, AutoReel, calcAutoMeta} from './auto/AutoReel';
import {CAROUSEL_DEFAULT, Carousel as AutoCarouselComp, CH as ACH, CW as ACW, calcCarouselMeta} from './auto/Carousel';
import {CH, CW, SO_SLIDES, SoCarousel, UT_SLIDES, UtCarousel} from './week/carousels';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="KarieraReel" component={KarieraReel} durationInFrames={REEL_DUR} fps={FPS} width={W} height={H} />
		<Composition id="KarieraPlan" component={PlanReel} durationInFrames={PLAN_DUR} fps={FPS} width={W} height={H} />
		<Composition id="KarieraPecka" component={PeckaReel} durationInFrames={PECKA_DUR} fps={FPS} width={W} height={H} />
		{WEEK_REELS.map((r) => (
			<Composition key={r.id} id={r.id} component={r.C} durationInFrames={r.dur} fps={FPS} width={W} height={H} />
		))}
		<Composition id="Tyden-Ut-Skola" component={UtCarousel} durationInFrames={UT_SLIDES.length} fps={FPS} width={CW} height={CH} />
		<Composition id="Tyden-So-RedFlags" component={SoCarousel} durationInFrames={SO_SLIDES.length} fps={FPS} width={CW} height={CH} />
		<Composition id="Prostredi" component={EnvReel} durationInFrames={ENV_DUR} fps={FPS} width={W} height={H} />
		<Composition id="Nabor" component={NaborReel} durationInFrames={NABOR_DUR} fps={FPS} width={W} height={H} />
		<Composition id="Smycka" component={SmyckaReel} durationInFrames={SMYCKA_DUR} fps={FPS} width={W} height={H} />
		<Composition id="AutoReel" component={AutoReel} defaultProps={AUTO_DEFAULT} calculateMetadata={calcAutoMeta} durationInFrames={225} fps={FPS} width={W} height={H} />
		<Composition id="AutoCarousel" component={AutoCarouselComp} defaultProps={CAROUSEL_DEFAULT} calculateMetadata={calcCarouselMeta} durationInFrames={1} fps={FPS} width={ACW} height={ACH} />
	</>
);

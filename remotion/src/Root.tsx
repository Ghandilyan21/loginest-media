import React, {useEffect, useState} from 'react';
import {Composition, Still, continueRender, delayRender} from 'remotion';
import {FPS, W, H} from './kit/theme';
import {Ep07, EP07_FRAMES, Cover07} from './episodes/Ep07';
import {Ep08, EP08_FRAMES, Cover08} from './episodes/Ep08';
import {Ep09, EP09_FRAMES, Cover09} from './episodes/Ep09';
import {Ep10, EP10_FRAMES, Cover10} from './episodes/Ep10';

/** wait for the bundled fonts before any frame is captured */
const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      '400 30px Inter', '500 30px Inter', '600 30px Inter',
      '500 30px "Space Grotesk"', '700 30px "Space Grotesk"',
      '400 30px "JetBrains Mono"', '700 30px "JetBrains Mono"',
    ].map((f) => document.fonts.load(f))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  // children mount only after fonts load, so canvas textures can use them
  return ready ? <>{children}</> : null;
};

const withFonts = (C: React.FC) => () => <FontGate><C /></FontGate>;

// Register every episode here: one <Still id="coverNN"> and one <Composition id="epNN"> per episode.
export const Root: React.FC = () => (
  <>
    <Still id="cover07" component={withFonts(Cover07)} width={W} height={H} />
    <Composition id="ep07" component={withFonts(Ep07)} durationInFrames={EP07_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="cover08" component={withFonts(Cover08)} width={W} height={H} />
    <Composition id="ep08" component={withFonts(Ep08)} durationInFrames={EP08_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="cover09" component={withFonts(Cover09)} width={W} height={H} />
    <Composition id="ep09" component={withFonts(Ep09)} durationInFrames={EP09_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="cover10" component={withFonts(Cover10)} width={W} height={H} />
    <Composition id="ep10" component={withFonts(Ep10)} durationInFrames={EP10_FRAMES} fps={FPS} width={W} height={H} />
  </>
);

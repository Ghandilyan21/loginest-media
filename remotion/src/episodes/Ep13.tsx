import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep13.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 13;

/** fastOutSlowIn-like curve, the Hero flight's default feel */
const fly = (u: number) => {
  const x = clamp01(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type R = {x: number; y: number; w: number; h: number};
const lerpR = (a: R, b: R, t: number): R => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t)});

/** invented movie posters: abstract art, no real films */
const POSTERS = [
  {title: 'Night Orbit', a: '#2B1B6B', b: '#FF4D8D', sun: '#FFC857'},
  {title: 'Paper Tide', a: '#0E3B55', b: '#2FD3F0', sun: '#F4F2FF'},
  {title: 'Low Signal', a: '#3A0F2E', b: '#7C5CFF', sun: '#3DDC97'},
  {title: 'Glass City', a: '#13253F', b: '#FFC857', sun: '#FF4D8D'},
  {title: 'Red Static', a: '#2A0E10', b: '#FF453A', sun: '#FFC857'},
  {title: 'Kite Hours', a: '#0D2B25', b: '#3DDC97', sun: '#F4F2FF'},
];

const Poster: React.FC<{r: R; i?: number; radius?: number; glow?: number}> = ({r, i = 0, radius = 18, glow = 0}) => {
  const p = POSTERS[i];
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, overflow: 'hidden',
      background: `linear-gradient(170deg, ${p.a} 0%, ${p.b} 120%)`,
      boxShadow: `0 ${10 + glow * 30}px ${30 + glow * 60}px rgba(0,0,0,0.55)${glow ? `, 0 0 ${glow * 60}px ${p.b}66` : ''}`}}>
      <div style={{position: 'absolute', left: '22%', top: '16%', width: '56%', height: '39%', borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, ${p.sun}, ${p.sun}00 70%)`, opacity: 0.9}} />
      <div style={{position: 'absolute', inset: 0, background: `${p.a}`, clipPath: 'polygon(0 72%, 35% 52%, 62% 66%, 100% 48%, 100% 100%, 0 100%)', opacity: 0.85}} />
      <div style={{position: 'absolute', inset: 0, background: '#00000066', clipPath: 'polygon(0 86%, 45% 70%, 100% 82%, 100% 100%, 0 100%)'}} />
    </div>
  );
};

/* phone screen: grid -> details (inner screen 568 x 1148) */
const SLOT = (i: number): R => ({x: 32 + (i % 2) * 266, y: 230 + Math.floor(i / 2) * 400, w: 238, h: 340});
const BIG: R = {x: 134, y: 120, w: 300, h: 430};
const TITLE_S = {x: 32, y: 584, fs: 28};
const TITLE_B = {x: 0, y: 590, fs: 54};

const MovieScreen: React.FC<{t: number}> = ({t}) => {
  // t: 0 = grid, 1 = details
  const k = fly(t);
  const r = lerpR(SLOT(0), BIG, k);
  const grid = 1 - clamp01(t * 2.2);
  const det = clamp01((t - 0.55) / 0.45);
  const ty = lerp(TITLE_S.y, TITLE_B.y, k);
  const tfs = lerp(TITLE_S.fs, TITLE_B.fs, k);
  return (
    <AbsoluteFill style={{fontFamily: F.ui, color: 'white'}}>
      <div style={{opacity: grid}}>
        <div style={{position: 'absolute', top: 120, left: 32, fontFamily: F.display, fontWeight: 700, fontSize: 56}}>Discover</div>
        {POSTERS.map((p, i) => i === 0 ? null : (
          <React.Fragment key={i}>
            <Poster r={SLOT(i)} i={i} />
            <div style={{position: 'absolute', left: SLOT(i).x, top: SLOT(i).y + 354, fontSize: 28, fontWeight: 600}}>{p.title}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: det, background: 'radial-gradient(circle at 50% 20%, #FF4D8D33, transparent 60%)'}} />
      {/* back arrow + details content */}
      <div style={{opacity: det}}>
        <div style={{position: 'absolute', top: 120, left: 36, fontSize: 44, color: C.dim}}>&larr;</div>
        <div style={{position: 'absolute', top: 680, width: '100%', display: 'flex', justifyContent: 'center', gap: 14, transform: `translateY(${(1 - det) * 30}px)`}}>
          {['Sci-fi', '2h 04m', '8.4'].map((c) => (
            <div key={c} style={{padding: '8px 22px', borderRadius: 999, border: `1.5px solid ${C.glassBorder}`, background: 'rgba(255,255,255,0.08)', fontSize: 24, color: C.dim}}>{c}</div>
          ))}
        </div>
        <div style={{position: 'absolute', top: 770, left: 60, right: 60, height: 84, borderRadius: 24, background: C.pink, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 32, transform: `translateY(${(1 - det) * 40}px)`, boxShadow: `0 14px 40px ${C.pink}66`}}>&#9654;&nbsp; Play</div>
        {[0.92, 0.8, 0.86, 0.5].map((w, i) => (
          <div key={i} style={{position: 'absolute', top: 900 + i * 40, left: 60, width: `${w * 448}px`, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.14)',
            transform: `translateY(${(1 - det) * (50 + i * 10)}px)`}} />
        ))}
      </div>
      <Poster r={r} i={0} radius={lerp(18, 26, k)} glow={Math.sin(Math.PI * clamp01(t)) * 0.8} />
      <div style={{position: 'absolute', top: ty, left: lerp(TITLE_S.x, TITLE_B.x, k), width: lerp(238, 568, k), textAlign: k > 0.5 ? 'center' : 'left',
        fontFamily: k > 0.5 ? F.display : F.ui, fontWeight: 700, fontSize: tfs, whiteSpace: 'nowrap'}}>{POSTERS[0].title}</div>
    </AbsoluteFill>
  );
};
const MOVIE_BG = 'linear-gradient(170deg,#121026 0%,#0A0A1A 60%,#0B1324 100%)';

const Tap: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (p <= 0 || p >= 1 ? null : (
  <div style={{position: 'absolute', left: x - 60 * p, top: y - 60 * p, width: 120 * p, height: 120 * p, borderRadius: '50%',
    border: '4px solid rgba(255,255,255,0.8)', opacity: 1 - p}} />
));

const Readout: React.FC<{label: string; value: string; col?: string; size?: number}> = ({label, value, col = C.text, size = 44}) => (
  <div style={{marginBottom: 16}}>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>{label}</div>
    <div style={{fontFamily: F.mono, fontSize: size, color: col, marginTop: 4}}>{value}</div>
  </div>
);

/** tiny screen outline used in the demos */
const Mini: React.FC<{x: number; y: number; w: number; h: number; label: string}> = ({x, y, w, h, label}) => (
  <>
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, border: `2px solid ${C.glassBorder}`, background: 'rgba(0,0,0,0.25)'}} />
    <div style={{position: 'absolute', left: x, top: y + h + 6, width: w, textAlign: 'center', fontFamily: F.mono, fontSize: 20, color: C.dim}}>{label}</div>
  </>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const ft = clamp01((t - 1.5) / 0.9);
  const tap = clamp01((t - 1.15) / 0.5);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.amber]} />
      <SeriesPill num={NUM} />
      <Title text="Hero poster" accent="Hero" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen={MOVIE_BG}>
          <MovieScreen t={ft} />
          <Tap x={151} y={400} p={tap} />
        </Phone>
      </div>
      <Caption words={['Tap.', 'The', 'poster', 'flies.']} hi={[3]} start={14} y={1450} />
      <Widgy x={920} y={1330} size={160} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

/** poster flying between two mini screens, same math as the hook */
const FlightDemo: React.FC<{t: number; withTitle?: 'bad' | 'good'}> = ({t, withTitle}) => {
  const k = fly(t);
  const a: R = {x: 40, y: 50, w: 56, h: 80};
  const b: R = {x: 302, y: 36, w: 110, h: 158};
  const r = lerpR(a, b, k);
  return (
    <>
      <Mini x={24} y={20} w={170} h={210} label="grid" />
      <Mini x={272} y={20} w={170} h={210} label="details" />
      <div style={{position: 'absolute', left: 104, top: 50, width: 70, height: 80, borderRadius: 8, background: 'rgba(255,255,255,0.08)'}} />
      <div style={{position: 'absolute', left: 40, top: 140, width: 56, height: 80, borderRadius: 8, background: 'rgba(255,255,255,0.08)'}} />
      <Poster r={r} i={0} radius={8} glow={Math.sin(Math.PI * t) * 0.6} />
    </>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.8 ? (t - 2.8) % 1.6 : 0;
  const ft = t > 2.8 ? clamp01((lt - 0.2) / 0.9) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.violet]} />
      <Title text="1. Same tag" accent="tag" y={150} size={80} />
      <CodeCard tokens={T.code1} y={270} hl={[5, 11]} file="movies.dart" fs={30} step={2} />
      <Glass x={70} y={1125} w={940} h={285} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 30, top: 10}}><FlightDemo t={ft} /></div>
        <div style={{position: 'absolute', left: 560, top: 40}}>
          <Readout label="tag" value="'poster-7'" col={C.green} />
          <Readout label="flight" value={`${Math.round(fly(ft) * 100)}%`} />
        </div>
      </Glass>
      <Caption words={['Same', 'tag', 'on', 'both', 'screens.']} hi={[1]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

/** the flying title text: broken (error text style) vs fixed (Material + FittedBox) */
const FlyingTitle: React.FC<{k: number; bad: boolean; w0: number; w1: number; h0: number; h1: number}> = ({k, bad, w0, w1, h0, h1}) => {
  const w = lerp(w0, w1, k);
  const h = lerp(h0, h1, k);
  return (
    <div style={{position: 'relative', width: w, height: h, border: `2px dashed ${bad ? C.red : C.green}88`, borderRadius: 8}}>
      {bad ? (
        <div style={{position: 'absolute', left: 6, top: (h - 60) / 2, whiteSpace: 'nowrap', fontFamily: F.mono, fontSize: 46, color: '#E00000',
          textDecoration: 'underline double #FFFF00', textUnderlineOffset: 8, textDecorationThickness: 3}}>Night Orbit</div>
      ) : (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{whiteSpace: 'nowrap', fontFamily: F.display, fontWeight: 700, fontSize: 54, color: 'white', transform: `scale(${Math.min(w / 330, h / 72)})`}}>Night Orbit</div>
        </div>
      )}
    </div>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const lt = t > 1.0 ? (t - 1.0) % 2.2 : 0;
  const k = t > 1.0 ? fly(clamp01(lt / 1.4)) * 0.6 + 0.2 : 0.2;
  const badge = pop(f, sec(2.6), 10);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[3]} file="details.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={805} w={940} h={420} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <div style={{position: 'absolute', left: 50, top: 30, fontFamily: F.mono, fontSize: 26, color: C.dim}}>mid-flight frame</div>
        <Poster r={{x: lerp(60, 330, k), y: lerp(90, 60, k), w: lerp(120, 180, k), h: lerp(172, 258, k)}} i={0} radius={12} glow={0.4} />
        <div style={{position: "absolute", left: 50, top: 360, width: 860}}>
          <div style={{position: 'absolute', left: lerp(10, 240, k), top: -40}}>
            <FlyingTitle k={k} bad w0={160} w1={390} h0={40} h1={64} />
          </div>
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1270, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          YELLOW UNDERLINES
        </div>
      </div>
      <Caption words={['Text', 'loses', 'its', 'Material.']} hi={[3]} start={sec(3.0)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.7 ? (t - 2.7) % 2.0 : 0;
  const k = t > 2.7 ? fly(clamp01((lt - 0.2) / 1.2)) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.cyan]} />
      <Title text="2. Fix the shuttle" accent="shuttle" y={150} size={80} />
      <CodeCard tokens={T.code2} y={270} hl={[2, 5, 6, 7]} file="details.dart" fs={30} step={2} />
      <Glass x={70} y={1125} w={940} h={285} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 50, top: 40, width: 440, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <FlyingTitle k={k} bad={false} w0={150} w1={400} h0={34} h1={90} />
        </div>
        <div style={{position: 'absolute', left: 570, top: 40}}>
          <Readout label="flight" value={`${Math.round(k * 100)}%`} />
          <Readout label="text" value="clean, fits" col={C.green} size={36} />
        </div>
      </Glass>
      <Caption words={['Material', '+', 'FittedBox', 'shuttle.']} hi={[2]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP13_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep13: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP13_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP13_FRAMES = EP13_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover13: React.FC = () => (
  <Cover num={NUM} line1="Hero" accent="poster flight" badge="flightShuttleBuilder">
    <div style={{position: 'absolute', top: 700, left: 0, width: W, height: 700}}>
      <Poster r={{x: 150, y: 330, w: 170, h: 244}} i={0} radius={14} />
      {[0.3, 0.55].map((s, i) => (
        <div key={i} style={{opacity: 0.18 + i * 0.12}}>
          <Poster r={{x: lerp(150, 470, s), y: lerp(330, 20, s), w: lerp(170, 420, s), h: lerp(244, 600, s)}} i={0} radius={18} />
        </div>
      ))}
      <Poster r={{x: 470, y: 20, w: 420, h: 600}} i={0} radius={26} glow={0.7} />
    </div>
  </Cover>
);

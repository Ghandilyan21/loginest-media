import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W, grad} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep11.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 11;

/** the same three points as the Dart path (fractions of the box) */
const PTS: [number, number][] = [[0.27, 0.54], [0.44, 0.70], [0.75, 0.36]];

/** points of the path cut at length * t, like PathMetric.extractPath(0, length * t) */
const partial = (t: number, size: number): [number, number][] => {
  const p = PTS.map(([x, y]) => [x * size, y * size] as [number, number]);
  const segs = [Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), Math.hypot(p[2][0] - p[1][0], p[2][1] - p[1][1])];
  let left = (segs[0] + segs[1]) * clamp01(t);
  const out: [number, number][] = [p[0]];
  for (let i = 0; i < 2; i++) {
    if (left <= 0) break;
    const k = Math.min(1, left / segs[i]);
    out.push([p[i][0] + (p[i + 1][0] - p[i][0]) * k, p[i][1] + (p[i + 1][1] - p[i][1]) * k]);
    left -= segs[i];
  }
  return out;
};
const d = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

/** green disc with the check drawn up to t. fill=true shows the default-Paint (fill) mistake */
const Check: React.FC<{t: number; size: number; disc?: number; fill?: boolean; cap?: 'round' | 'butt'}> = ({t, size, disc = 1, fill = false, cap = 'round'}) => {
  const pts = partial(t, size);
  const sw = size * 0.075;
  return (
    <svg width={size} height={size} style={{overflow: 'visible'}}>
      <circle cx={size / 2} cy={size / 2} r={(size / 2) * disc} fill={C.green} style={{filter: `drop-shadow(0 0 ${size * 0.12}px ${C.green}88)`}} />
      {pts.length > 1 && (fill
        ? <path d={d(pts) + ' Z'} fill="white" />
        : <path d={d(pts)} stroke="white" strokeWidth={sw} fill="none" strokeLinecap={cap} strokeLinejoin={cap === 'round' ? 'round' : 'miter'} />)}
    </svg>
  );
};

/** draw progress: 0 before t0, eased 0..1 over dur seconds */
const drawT = (t: number, t0: number, dur: number) => {
  const u = clamp01((t - t0) / dur);
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
};

/** generic payment screen (invented merchant) */
const PayScreen: React.FC<{press: number; disc: number; t: number; done: number}> = ({press, disc, t, done}) => (
  <AbsoluteFill style={{fontFamily: F.ui, color: 'white', alignItems: 'center'}}>
    <div style={{position: 'absolute', top: 120, fontSize: 26, color: 'rgba(255,255,255,0.55)', letterSpacing: 2}}>NOVA COFFEE</div>
    <div style={{position: 'absolute', top: 168, fontSize: 92, fontWeight: 600, fontFamily: F.display}}>$4.80</div>
    <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: clamp01(disc * 2)}}>
      <div style={{transform: `scale(${disc})`}}><Check t={t} size={300} /></div>
    </div>
    <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', opacity: done, transform: `translateY(${(1 - done) * 30}px)`}}>
      <div style={{fontSize: 48, fontWeight: 600, fontFamily: F.display}}>Payment sent</div>
      <div style={{fontSize: 26, color: 'rgba(255,255,255,0.55)', marginTop: 10}}>Today, 08:42</div>
    </div>
    <div style={{position: 'absolute', bottom: 70, left: 50, right: 50, height: 100, borderRadius: 50, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 34, fontWeight: 600, transform: `scale(${1 - 0.06 * press})`, opacity: 1 - 0.25 * done}}>
      {done > 0.5 ? 'Done' : 'Pay $4.80'}
    </div>
  </AbsoluteFill>
);
const PAY_BG = 'linear-gradient(170deg,#141A3A 0%,#0E1230 55%,#0A2230 100%)';

/** t meter: progress bar + value */
const Meter: React.FC<{t: number; w: number}> = ({t, w}) => (
  <div style={{width: w}}>
    <div style={{fontFamily: F.mono, fontSize: 30, color: C.text, marginBottom: 16}}>t: {t.toFixed(2)}</div>
    <div style={{position: 'relative', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.12)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 12, borderRadius: 6, width: w * t, background: C.green}} />
    </div>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim, marginTop: 16}}>length × t</div>
  </div>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const press = t > 0.7 && t < 1.0 ? Math.sin(((t - 0.7) / 0.3) * Math.PI) : 0;
  const disc = pop(f, sec(1.0), 11, 170);
  const ct = drawT(t, 1.35, 0.6);
  const done = ease(f, sec(2.0), 12);
  return (
    <SceneIn>
      <Backdrop tint={[C.green, C.violet, C.cyan]} />
      <SeriesPill num={NUM} />
      <Title text="Draw the checkmark" accent="checkmark" y={225} size={96} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen={PAY_BG}>
          <PayScreen press={press} disc={disc} t={ct} done={done} />
        </Phone>
      </div>
      <Caption words={['Paid.', 'Tick', 'draws', 'itself.']} hi={[2]} start={14} y={1450} />
      <Widgy x={900} y={1330} size={170} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.8 ? (t - 2.8) % 1.6 : 0;
  const ct = t > 2.8 ? drawT(lt, 0.1, 1.0) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.violet]} />
      <Title text="1. Cut the path" accent="Cut" y={150} size={74} />
      <CodeCard tokens={T.code1} y={270} hl={[7, 9]} file="check_painter.dart" fs={32} />
      <Glass x={70} y={1100} w={940} h={300} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 90, top: 30}}><Check t={ct} size={240} /></div>
        <div style={{position: 'absolute', left: 440, top: 80}}><Meter t={ct} w={420} /></div>
      </Glass>
      <Caption words={['Draw', 'only', 'length', '×', 't.']} hi={[2]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const ct = t > 1.0 ? drawT((t - 1.0) % 2.0, 0.05, 0.9) : 0;
  const badge = pop(f, sec(2.6), 10);
  const label = (txt: string, col: string) => (
    <div style={{fontFamily: F.mono, fontSize: 30, color: col, textAlign: 'center', marginTop: 22}}>{txt}</div>
  );
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[3]} file="check_painter.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={720} w={940} h={480} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <div style={{position: 'absolute', left: 80, top: 50, width: 340}}>
          <Check t={ct} size={300} fill />
          {label('fill (default)', C.red)}
        </div>
        <div style={{position: 'absolute', right: 80, top: 50, width: 340, opacity: 0.8}}>
          <Check t={ct} size={300} />
          {label('what you wanted', C.dim)}
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1260, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          A TRIANGLE, NOT A TICK
        </div>
      </div>
      <Caption words={['Paint', 'fills', 'by', 'default.']} hi={[1]} start={sec(3.0)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.7 ? (t - 2.7) % 1.6 : 0;
  const ct = t > 2.7 ? drawT(lt, 0.05, 1.0) : 0;
  const reps = t > 2.7 ? Math.min(30, Math.round(ct * 30)) + Math.floor((t - 2.7) / 1.6) * 30 : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.cyan]} />
      <Title text="2. Stroke + repaint" accent="Stroke" y={150} size={74} />
      <CodeCard tokens={T.code2} y={270} hl={[3, 4, 9]} file="check_painter.dart" />
      <Glass x={70} y={1010} w={940} h={390} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 60, top: 40, width: 260, textAlign: 'center'}}>
          <Check t={ct} size={220} cap="butt" />
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.dim, marginTop: 16}}>butt cap</div>
        </div>
        <div style={{position: 'absolute', left: 360, top: 40, width: 260, textAlign: 'center'}}>
          <Check t={ct} size={220} />
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.green, marginTop: 16}}>round cap</div>
        </div>
        <div style={{position: 'absolute', left: 660, top: 110, width: 240}}>
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.dim}}>repaints</div>
          <div style={{fontFamily: F.mono, fontSize: 64, color: C.text, marginTop: 6}}>{reps}</div>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.dim, marginTop: 6}}>only when t changes</div>
        </div>
      </Glass>
      <Caption words={['Stroke,', 'round', 'caps,', 'repaint.']} hi={[1]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP11_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep11: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP11_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP11_FRAMES = EP11_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover11: React.FC = () => (
  <Cover num={NUM} line1="Draw the" accent="checkmark" badge="PathMetric.extractPath">
    <div style={{position: 'absolute', top: 740, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: 'rotate(-6deg)'}}><Check t={1} size={560} /></div>
    </div>
  </Cover>
);

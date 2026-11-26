import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep12.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 12;

/**
 * One activity ring, same math as the Dart painter.
 * fixed=false shows the trap: a sweep above 2*pi is drawn as one plain full circle.
 * fixed=true: full circle for each lap, blurred shadow under the tip, then the rest arc on top.
 */
const Ring: React.FC<{id: string; size: number; sw: number; p: number; col: string; fixed?: boolean; track?: boolean}> = ({
  id, size, sw, p, col, fixed = true, track = true,
}) => {
  const r = (size - sw) / 2;
  const cx = size / 2;
  const L = 2 * Math.PI * r;
  const base = {cx, cy: cx, r, fill: 'none', strokeWidth: sw, transform: `rotate(-90 ${cx} ${cx})`};
  const arc = (frac: number, start = 0, extra: React.SVGProps<SVGCircleElement> = {}) => (
    <circle {...base} stroke={col} strokeLinecap="round" strokeDasharray={`${frac * L} ${L * 2}`} strokeDashoffset={-start * L} {...extra} />
  );
  const laps = fixed ? Math.floor(p) : 0;
  const rest = fixed ? p - laps : Math.min(1, p);
  return (
    <svg width={size} height={size} style={{overflow: 'visible', filter: `drop-shadow(0 0 ${sw * 0.5}px ${col}55)`}}>
      <defs><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={sw * 0.22} /></filter></defs>
      {track && <circle {...base} stroke={col} opacity={0.2} />}
      {laps > 0 && <circle {...base} stroke={col} />}
      {laps > 0 && rest > 0.01 && arc(0.35 / (2 * Math.PI), rest - 0.1 / (2 * Math.PI), {stroke: 'black', opacity: 0.85, strokeLinecap: 'butt', filter: `url(#${id})`})}
      {rest > 0.004 && arc(rest)}
    </svg>
  );
};

/** three nested rings */
const Rings: React.FC<{id: string; size: number; sw: number; v: [number, number, number]; fixed?: boolean}> = ({id, size, sw, v, fixed = true}) => {
  const cols = [C.pink, C.green, C.cyan];
  const gap = sw * 1.12;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      {v.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: gap * i, top: gap * i}}>
          <Ring id={`${id}${i}`} size={size - 2 * gap * i} sw={sw} p={p} col={cols[i]} fixed={fixed} />
        </div>
      ))}
    </div>
  );
};

/** eased 0..1 over dur seconds starting at t0 */
const grow = (t: number, t0: number, dur: number) => {
  const u = clamp01((t - t0) / dur);
  return 1 - Math.pow(1 - u, 3);
};

/** generic fitness screen (invented app) */
const FitScreen: React.FC<{g: number; stats: number}> = ({g, stats}) => {
  const rows: [string, string, string, string][] = [
    ['Move', `${Math.round(520 * g)}/400`, 'KCAL', C.pink],
    ['Exercise', `${Math.round(24 * g)}/30`, 'MIN', C.green],
    ['Stand', `${Math.round(9 * g)}/12`, 'HRS', C.cyan],
  ];
  return (
    <AbsoluteFill style={{fontFamily: F.ui, color: 'white'}}>
      <div style={{position: 'absolute', top: 110, left: 56, fontSize: 26, color: 'rgba(255,255,255,0.55)', letterSpacing: 2}}>THURSDAY</div>
      <div style={{position: 'absolute', top: 146, left: 56, fontSize: 64, fontWeight: 700, fontFamily: F.display}}>Summary</div>
      <div style={{position: 'absolute', top: 270, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Rings id="hk" size={440} sw={52} v={[1.3 * g, 0.8 * g, 0.75 * g]} />
      </div>
      <div style={{position: 'absolute', top: 770, left: 56, right: 56, opacity: stats, transform: `translateY(${(1 - stats) * 30}px)`}}>
        {rows.map(([name, val, unit, col]) => (
          <div key={name} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
            <span style={{fontSize: 32, fontWeight: 600}}>{name}</span>
            <span style={{fontFamily: F.display, fontSize: 40, fontWeight: 700, color: col}}>{val}<span style={{fontSize: 22, marginLeft: 8}}>{unit}</span></span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const FIT_BG = 'linear-gradient(170deg,#12102A 0%,#0B0A1E 60%,#0A1426 100%)';

const Readout: React.FC<{label: string; value: string; col?: string; size?: number}> = ({label, value, col = C.text, size = 56}) => (
  <div style={{marginBottom: 18}}>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>{label}</div>
    <div style={{fontFamily: F.mono, fontSize: size, color: col, marginTop: 4}}>{value}</div>
  </div>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const g = grow(t, 0.7, 2.0);
  const stats = ease(f, sec(1.2), 14);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.green, C.cyan]} />
      <SeriesPill num={NUM} />
      <Title text="Activity rings" accent="rings" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen={FIT_BG}>
          <FitScreen g={g} stats={stats} />
        </Phone>
      </div>
      <Caption words={['Close', 'all', 'three', 'rings.']} hi={[0]} start={14} y={1450} />
      <Widgy x={920} y={1330} size={160} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.8 ? (t - 2.8) % 1.6 : 0;
  const pr = t > 2.8 ? 0.75 * grow(lt, 0.05, 1.1) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.violet]} />
      <Title text="1. drawArc" accent="drawArc" y={150} size={80} />
      <CodeCard tokens={T.code1} y={270} hl={[9, 10, 11]} file="ring_painter.dart" fs={32} />
      <Glass x={70} y={1120} w={940} h={290} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 110, top: 25}}><Ring id="c1" size={240} sw={34} p={pr} col={C.pink} /></div>
        <div style={{position: 'absolute', left: 470, top: 50}}>
          <Readout label="progress" value={pr.toFixed(2)} />
          <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>start -pi/2 = 12 o'clock</div>
        </div>
      </Glass>
      <Caption words={['Sweep', '=', '2π', '×', 'progress.']} hi={[2]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const lt = t > 1.0 ? (t - 1.0) % 2.2 : 0;
  const g = t > 1.0 ? grow(lt, 0.05, 1.2) : 0;
  const badge = pop(f, sec(2.6), 10);
  const label = (txt: string, col: string) => (
    <div style={{fontFamily: F.mono, fontSize: 32, color: col, textAlign: 'center', marginTop: 24}}>{txt}</div>
  );
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[2, 3]} file="ring_painter.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={720} w={940} h={480} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <div style={{position: 'absolute', left: 90, top: 50, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Ring id="t1" size={300} sw={42} p={1.0 * g} col={C.pink} fixed={false} />
          {label('goal 100%', C.dim)}
        </div>
        <div style={{position: 'absolute', right: 90, top: 50, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Ring id="t2" size={300} sw={42} p={1.3 * g} col={C.pink} fixed={false} />
          {label('goal 130%', C.red)}
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1260, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          130% LOOKS LIKE 100%
        </div>
      </div>
      <Caption words={['The', 'extra', 'lap', 'vanishes.']} hi={[3]} start={sec(3.0)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.7 ? (t - 2.7) % 2.0 : 0;
  const pr = t > 2.7 ? 1.3 * grow(lt, 0.05, 1.4) : 0;
  const laps = Math.floor(pr);
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.cyan]} />
      <Title text="2. Draw lap two" accent="lap two" y={150} size={80} />
      <CodeCard tokens={T.code2} y={270} hl={[0, 1, 9, 10]} file="ring_painter.dart" fs={30} step={2} />
      <Glass x={70} y={1125} w={940} h={285} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 110, top: 25}}><Ring id="c2" size={235} sw={34} p={pr} col={C.pink} /></div>
        <div style={{position: 'absolute', left: 450, top: 40, display: 'flex', gap: 60}}>
          <Readout label="progress" value={pr.toFixed(2)} />
          <Readout label="laps" value={String(laps)} col={laps > 0 ? C.pink : C.text} />
        </div>
        <div style={{position: 'absolute', left: 450, top: 200, fontFamily: F.mono, fontSize: 24, color: C.dim}}>shadow shows the overlap</div>
      </Glass>
      <Caption words={['Full', 'circle,', 'then', 'the', 'rest.']} hi={[1]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP12_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep12: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP12_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP12_FRAMES = EP12_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover12: React.FC = () => (
  <Cover num={NUM} line1="Activity" accent="rings" badge="drawArc + 2nd lap">
    <div style={{position: 'absolute', top: 730, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
      <Rings id="cv" size={620} sw={74} v={[1.3, 0.8, 0.75]} />
    </div>
  </Cover>
);

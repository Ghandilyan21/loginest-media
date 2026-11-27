import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep14.tokens.json';

/** tokyo-night comments (#51597D) are too dim on a phone; this episode's key lines are comments, so lift them */
const T = Object.fromEntries(Object.entries(tokens as unknown as Record<string, Tok[][]>).map(([k, block]) =>
  [k, block.map((line) => line.map((t) => (t.k === '#51597D' ? {...t, k: '#A9B1D6'} : t)))])) as Record<string, Tok[][]>;
const NUM = 14;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const outCubic = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);
/** settle with a small overshoot, like the sheet's snap spring */
const outBack = (u: number) => {
  const x = clamp01(u);
  const c1 = 1.3;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** sheet extent over time: drag, release, snap to 0.45; drag, release, snap to 0.9 */
const snapRun = (t: number): {e: number; drag: boolean; target: number} => {
  if (t < 0.5) return {e: 0.12, drag: false, target: 0.12};
  if (t < 1.1) return {e: lerp(0.12, 0.31, outCubic(seg(t, 0.5, 1.1))), drag: true, target: 0.45};
  if (t < 1.5) return {e: lerp(0.31, 0.45, outBack(seg(t, 1.1, 1.5))), drag: false, target: 0.45};
  if (t < 2.0) return {e: 0.45, drag: false, target: 0.45};
  if (t < 2.55) return {e: lerp(0.45, 0.68, outCubic(seg(t, 2.0, 2.55))), drag: true, target: 0.9};
  if (t < 2.95) return {e: lerp(0.68, 0.9, outBack(seg(t, 2.55, 2.95))), drag: false, target: 0.9};
  return {e: 0.9, drag: false, target: 0.9};
};

/* ---------- generic map + sheet mockup, drawn at phone-screen size 568 x 1148 ---------- */
const SW = 568;
const SH = 1148;
const PLACES = [
  {name: 'Blue Fern Cafe', kind: 'Coffee', dist: '0.3 km', col: C.green},
  {name: 'Orbit Books', kind: 'Bookshop', dist: '0.6 km', col: C.violet},
  {name: 'Kite Park', kind: 'Park', dist: '0.9 km', col: C.cyan},
  {name: 'Little Noodle', kind: 'Noodles', dist: '1.1 km', col: C.amber},
  {name: 'Pixel Gym', kind: 'Fitness', dist: '1.4 km', col: C.pink},
  {name: 'Moon Bakery', kind: 'Bakery', dist: '1.8 km', col: C.green},
  {name: 'Harbor Deli', kind: 'Deli', dist: '2.0 km', col: C.violet},
  {name: 'Vinyl Corner', kind: 'Music', dist: '2.3 km', col: C.cyan},
];

const MapBase: React.FC<{pin?: number}> = ({pin = 0}) => (
  <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0}}>
    <rect width={SW} height={SH} fill="#121A2B" />
    <path d="M -20 820 C 120 760 220 900 360 840 S 560 760 620 800 L 620 1200 L -20 1200 Z" fill="#14324A" />
    <rect x="300" y="300" width="190" height="150" rx="26" fill="#173A30" />
    <rect x="40" y="560" width="140" height="120" rx="22" fill="#173A30" />
    {[180, 380, 620].map((y) => <line key={y} x1={-20} y1={y} x2={600} y2={y - 60} stroke="#26324A" strokeWidth={22} />)}
    {[130, 280, 470].map((x) => <line key={x} x1={x} y1={-20} x2={x + 40} y2={1200} stroke="#26324A" strokeWidth={18} />)}
    <path d="M -20 470 C 160 430 260 560 600 500" stroke="#3A4A6E" strokeWidth={30} fill="none" />
    <path d="M -20 470 C 160 430 260 560 600 500" stroke="#FFC85755" strokeWidth={6} fill="none" />
    {[[200, 260, C.pink], [420, 560, C.cyan], [110, 740, C.green]].map(([x, y, c], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${i === 0 ? 1 + pin * 0.35 : 1})`}>
        <path d="M 0 0 C -26 -30 -26 -62 0 -62 C 26 -62 26 -30 0 0 Z" fill={c as string} />
        <circle cx={0} cy={-40} r={9} fill="#0B0A18" />
      </g>
    ))}
    <circle cx={300} cy={420} r={34} fill="#2FD3F033" />
    <circle cx={300} cy={420} r={13} fill="#2FD3F0" stroke="white" strokeWidth={4} />
  </svg>
);

const Sheet: React.FC<{e: number; listOff?: number}> = ({e, listOff = 0}) => {
  const top = SH * (1 - e);
  return (
    <div style={{position: 'absolute', left: 0, top, width: SW, height: SH, borderRadius: '40px 40px 0 0', background: '#1B1A2E',
      boxShadow: '0 -20px 60px rgba(0,0,0,0.55)', borderTop: `1.5px solid ${C.glassBorder}`, overflow: 'hidden', fontFamily: F.ui, color: C.text}}>
      <div style={{position: 'absolute', top: 16, left: SW / 2 - 40, width: 80, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.35)'}} />
      <div style={{position: 'absolute', top: 44, left: 28, right: 28, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.09)',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, fontSize: 28, color: C.dim}}>
        <span style={{width: 22, height: 22, borderRadius: 11, border: `4px solid ${C.dim}`}} />Search nearby
      </div>
      <div style={{position: 'absolute', top: 140, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>
        <div style={{transform: `translateY(${-listOff}px)`}}>
          <div style={{display: 'flex', gap: 12, padding: '0 28px', marginBottom: 22}}>
            {['Coffee', 'Parks', 'Books'].map((c) => (
              <div key={c} style={{padding: '10px 22px', borderRadius: 999, border: `1.5px solid ${C.glassBorder}`, fontSize: 24, color: C.dim}}>{c}</div>
            ))}
          </div>
          {[...PLACES, ...PLACES].map((p, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '0 28px', height: 104, borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
              <div style={{width: 64, height: 64, borderRadius: 18, background: `linear-gradient(150deg, ${p.col}, ${p.col}44)`}} />
              <div style={{flex: 1}}>
                <div style={{fontSize: 30, fontWeight: 600}}>{p.name}</div>
                <div style={{fontSize: 22, color: C.dim, marginTop: 4}}>{p.kind} &middot; {p.dist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MapScreen: React.FC<{e: number; listOff?: number; pin?: number}> = ({e, listOff, pin}) => (
  <AbsoluteFill>
    <MapBase pin={pin} />
    <Sheet e={e} listOff={listOff} />
  </AbsoluteFill>
);

const Finger: React.FC<{x: number; y: number; on: number}> = ({x, y, on}) => (on <= 0 ? null : (
  <div style={{position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: '50%', opacity: on,
    background: 'rgba(255,255,255,0.35)', border: '4px solid rgba(255,255,255,0.85)', boxShadow: '0 0 30px rgba(255,255,255,0.4)'}} />
));

const Tap: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (p <= 0 || p >= 1 ? null : (
  <div style={{position: 'absolute', left: x - 70 * p, top: y - 70 * p, width: 140 * p, height: 140 * p, borderRadius: '50%',
    border: '5px solid rgba(255,255,255,0.85)', opacity: 1 - p}} />
));

/** small phone outline with the same mockup, scaled down; snap marks on the side */
const MiniPhone: React.FC<{x: number; y: number; s: number; e: number; listOff?: number; pin?: number; marks?: boolean; drag?: boolean; tap?: number}> = ({
  x, y, s, e, listOff, pin, marks = true, drag = false, tap = 0,
}) => {
  const w = SW * s;
  const h = SH * s;
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, overflow: 'hidden', border: `3px solid #3a3946`}}>
        <div style={{width: SW, height: SH, transform: `scale(${s})`, transformOrigin: '0 0', position: 'relative'}}>
          <MapScreen e={e} listOff={listOff} pin={pin} />
          <Finger x={SW / 2} y={SH * (1 - e) + (listOff !== undefined ? 360 : 40)} on={drag ? 1 : 0} />
          <Tap x={200} y={230} p={tap} />
        </div>
      </div>
      {marks && [0.12, 0.45, 0.9].map((m) => (
        <div key={m} style={{position: 'absolute', left: x + w + 10, top: y + h * (1 - m) - 14, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: F.mono, fontSize: 20, color: Math.abs(e - m) < 0.01 ? C.green : C.dim}}>
          <span style={{width: 18, height: 3, background: Math.abs(e - m) < 0.01 ? C.green : C.dim}} />{m}
        </div>
      ))}
    </>
  );
};

const Readout: React.FC<{label: string; value: string; col?: string; size?: number}> = ({label, value, col = C.text, size = 44}) => (
  <div style={{marginBottom: 16}}>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>{label}</div>
    <div style={{fontFamily: F.mono, fontSize: size, color: col, marginTop: 4, whiteSpace: 'nowrap'}}>{value}</div>
  </div>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const s = snapRun(t - 0.6);
  return (
    <SceneIn>
      <Backdrop tint={[C.cyan, C.violet, C.green]} />
      <SeriesPill num={NUM} />
      <Title text="Snapping sheet" accent="Snapping" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="#121A2B">
          <MapScreen e={s.e} />
          <Finger x={SW / 2} y={SH * (1 - s.e) + 40} on={s.drag ? 1 : 0} />
        </Phone>
      </div>
      <Caption words={['Drag.', 'It', 'snaps', 'into', 'place.']} hi={[2]} start={14} y={1450} />
      <Widgy x={920} y={1330} size={160} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const s = snapRun(t - 2.6);
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.violet]} />
      <Title text="1. Snap sizes" accent="Snap" y={150} size={80} />
      <CodeCard tokens={T.code1} y={270} hl={[4, 5]} file="map_page.dart" fs={30} step={2} />
      <Glass x={70} y={1090} w={940} h={320} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <MiniPhone x={60} y={22} s={0.24} e={s.e} drag={s.drag} />
        <div style={{position: 'absolute', left: 330, top: 50}}>
          <Readout label="extent" value={s.e.toFixed(2)} />
          <Readout label="on release" value={s.drag ? `snap to ${s.target}` : 'resting'} col={s.drag ? C.amber : C.green} size={38} />
        </div>
      </Glass>
      <Caption words={['Release', 'and', 'it', 'snaps.']} hi={[3]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const lt = t > 1.0 ? (t - 1.0) % 1.4 : 0;
  const dragging = t > 1.0 && lt < 1.0;
  // the list scrolls on its own, the sheet never moves
  const cycles = t > 1.0 ? Math.floor((t - 1.0) / 1.4) : 0;
  const off = cycles * 320 + (t > 1.0 ? outCubic(clamp01(lt / 1.0)) * 320 : 0);
  const badge = pop(f, sec(2.6), 10);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[2]} file="map_page.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={805} w={940} h={420} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <MiniPhone x={70} y={36} s={0.3} e={0.45} listOff={off % 960} drag={dragging} marks={false} />
        <div style={{position: 'absolute', left: 360, top: 70}}>
          <Readout label="list offset" value={`${Math.round(off)} px`} col={C.amber} />
          <Readout label="sheet extent" value="0.45  stuck" col={C.red} />
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1270, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          SHEET WON'T MOVE
        </div>
      </div>
      <Caption words={['List', 'scrolls.', 'Sheet', 'stuck.']} hi={[3]} start={sec(3.0)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const lt = t > 2.6 ? (t - 2.6) % 1.7 : 0;
  // tap the pin, then animateTo(0.45) over 300 ms with easeOutCubic
  const tap = t > 2.6 ? seg(lt, 0.15, 0.6) : 0;
  const up = outCubic(seg(lt, 0.25, 0.55));
  const down = seg(lt, 1.45, 1.7);
  const e = t > 2.6 ? lerp(0.12, 0.45, up) - (0.45 - 0.12) * outCubic(down) : 0.12;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.green]} />
      <Title text="2. Pass the controller" accent="controller" y={150} size={76} />
      <CodeCard tokens={T.code2} y={260} hl={[3, 7, 12]} file="map_page.dart" fs={29} step={2} />
      <Glass x={70} y={1150} w={940} h={270} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <MiniPhone x={60} y={18} s={0.2} e={e} pin={Math.sin(Math.PI * tap)} tap={tap} />
        <div style={{position: 'absolute', left: 330, top: 36}}>
          <Readout label="sheet.animateTo" value={e.toFixed(2)} />
          <Readout label="duration" value="300 ms, easeOutCubic" col={C.green} size={32} />
        </div>
      </Glass>
      <Caption words={['Then', 'snap', 'it', 'from', 'code.']} hi={[4]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP14_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep14: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP14_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP14_FRAMES = EP14_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover14: React.FC = () => (
  <Cover num={NUM} line1="Snapping" accent="bottom sheet" badge="snapSizes">
    <div style={{position: 'absolute', top: 690, left: W / 2 - 175, width: 350, height: 708, borderRadius: 54, padding: 10,
      background: 'linear-gradient(140deg,#5d5b6a,#1d1c24 30%,#2c2b35 70%,#6c6a78)', boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}}>
      <div style={{position: 'relative', width: 330, height: 688, borderRadius: 46, overflow: 'hidden'}}>
        <div style={{width: SW, height: SH, transform: `scale(${330 / SW})`, transformOrigin: '0 0', position: 'relative'}}>
          <MapScreen e={0.45} />
          <Finger x={SW / 2} y={SH * 0.55 + 40} on={1} />
        </div>
      </div>
    </div>
    {[0.12, 0.45, 0.9].map((m) => (
      <div key={m} style={{position: 'absolute', left: W / 2 + 195, top: 700 + 688 * (1 - m) - 18, display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: F.mono, fontSize: 30, color: m === 0.45 ? C.green : C.dim}}>
        <span style={{width: 34, height: 4, background: m === 0.45 ? C.green : C.dim}} />{m}
      </div>
    ))}
  </Cover>
);

import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep07.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 7;
const SHAKE = 0.5; // seconds — same as the controller on screen

/** same math as the code: sin(v*pi*8) * amp * (1 - v) */
const shakeDx = (v: number, amp: number) => (v <= 0 || v >= 1 ? 0 : Math.sin(v * Math.PI * 8) * amp * (1 - v));

const PinDots: React.FC<{filled: number; dx?: number; red?: boolean; r?: number; gap?: number}> = ({filled, dx = 0, red = false, r = 17, gap = 62}) => (
  <div style={{display: 'flex', gap: gap - r * 2, transform: `translateX(${dx}px)`, justifyContent: 'center'}}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{width: r * 2, height: r * 2, borderRadius: r, border: `3.5px solid ${red ? C.red : 'white'}`,
        background: i < filled ? (red ? C.red : 'white') : 'transparent',
        boxShadow: i < filled && red ? `0 0 22px ${C.red}` : 'none'}} />
    ))}
  </div>
);

/** iOS-style lock screen; events: [fillStart, shakeAt] in seconds (scene-local) */
export const LockScreen: React.FC<{events: [number, number][]}> = ({events}) => {
  const t = useCurrentFrame() / 30;
  let filled = 0, dx = 0, red = false, pressed = -1;
  for (const [tf, ts] of events) {
    if (t < tf) continue;
    const n = Math.min(4, Math.floor((t - tf) / 0.2) + 1);
    if (t < ts + SHAKE) {
      filled = n; red = t >= ts;
      if (t < ts) { const k = Math.floor((t - tf) / 0.2); if ((t - tf) / 0.2 - k < 0.5 && k < 4) pressed = [1, 5, 9, 2][k]; }
      if (t >= ts) dx = shakeDx((t - ts) / SHAKE, 30);
    } else filled = 0;
  }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  const sub: Record<string, string> = {'2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL', '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ'};
  return (
    <AbsoluteFill style={{alignItems: 'center', fontFamily: F.ui, color: 'white'}}>
      <svg width="44" height="58" viewBox="0 0 44 58" style={{marginTop: 120}}>
        <path d="M10 26 V17 a12 12 0 0 1 24 0 V26" stroke="white" strokeWidth="5" fill="none" />
        <rect x="3" y="24" width="38" height="31" rx="8" fill="white" />
      </svg>
      <div style={{marginTop: 26, fontSize: 36, fontWeight: 500}}>Enter Passcode</div>
      <div style={{marginTop: 44}}><PinDots filled={filled} dx={dx} red={red} /></div>
      <div style={{height: 40, marginTop: 18, fontSize: 28, color: '#FFB3AD', transform: `translateX(${dx}px)`, opacity: red ? 1 : 0}}>Wrong passcode</div>
      <div style={{marginTop: 70, display: 'grid', gridTemplateColumns: 'repeat(3, 150px)', rowGap: 34, columnGap: 34}}>
        {keys.map((k, i) => (
          <div key={i} style={{width: 150, height: 150, borderRadius: 75, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: k ? (pressed === Number(k) ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.14)') : 'transparent',
            backdropFilter: 'blur(10px)'}}>
            <span style={{fontSize: 60, fontWeight: 400, lineHeight: 1}}>{k}</span>
            {sub[k] && <span style={{fontSize: 17, fontWeight: 600, letterSpacing: 3, marginTop: 4}}>{sub[k]}</span>}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 2, 15);
  return (
    <SceneIn>
      <Backdrop />
      <SeriesPill num={NUM} />
      <Title text="Wrong PIN shake" accent="shake" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="linear-gradient(165deg,#5B3FD9 0%,#2A1E7A 45%,#0B2546 100%)">
          <LockScreen events={[[0.5, 1.4], [2.3, 3.2]]} />
        </Phone>
      </div>
      <Caption words={['Wrong', 'PIN?', 'Make', 'it', 'shake.']} hi={[4]} start={14} y={1450} />
      <Widgy x={900} y={1330} size={170} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Envelope: React.FC<{v: number}> = ({v}) => {
  const pts = Array.from({length: 121}, (_, k) => {
    const u = k / 120;
    return `${u * 260},${60 - Math.sin(u * Math.PI * 8) * 52 * (1 - u)}`;
  }).join(' ');
  const on = v > 0 && v < 1;
  return (
    <svg width="260" height="120" style={{overflow: 'visible'}}>
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinejoin="round" />
      <polyline points={`0,8 260,60`} stroke={`${C.pink}66`} strokeWidth="2" strokeDasharray="8 8" />
      {on && <circle cx={v * 260} cy={60 - Math.sin(v * Math.PI * 8) * 52 * (1 - v)} r="11" fill={C.amber} style={{filter: `drop-shadow(0 0 10px ${C.amber})`}} />}
    </svg>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.3));
  const lt = t > 2.7 ? (t - 2.7) % 1.2 : -1;
  const v = lt >= 0 ? clamp01(lt / SHAKE) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.violet]} />
      <Title text="1. Sin wave × decay" accent="decay" y={150} size={74} />
      <CodeCard tokens={T.code1} y={270} hl={[5, 6]} file="pin_shake.dart" />
      <Glass x={70} y={1215} w={940} h={190} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`, display: 'flex', alignItems: 'center', padding: '0 60px', gap: 70}}>
        <PinDots filled={4} dx={shakeDx(v, 50)} red={v > 0 && v < 1} r={24} gap={84} />
        <div style={{marginLeft: 'auto'}}><Envelope v={v} /></div>
      </Glass>
      <Caption words={['The', 'decay', 'makes', 'it', 'settle.']} hi={[1]} start={sec(2.9)} y={1460} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const tries: [number, string, boolean][] = [[0.9, 'TRY 1', true], [2.4, 'TRY 2', false]];
  const badge = pop(f, sec(2.85), 10);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[]} file="pin_shake.dart" start={4} step={4} fs={34} />
      {tries.map(([ts, lab, ok], i) => {
        const a = pop(f, sec(ts - 0.6));
        const v = ok ? clamp01((t - ts) / SHAKE) : 0;
        const val = ok ? Math.min(1, Math.max(0, (t - ts) / SHAKE)) : 1;
        return (
          <Glass key={i} x={110} y={620 + i * 330} w={860} h={280} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
            <div style={{position: 'absolute', top: 30, left: 44, fontFamily: F.ui, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.dim}}>{lab}</div>
            <div style={{position: 'absolute', top: 30, right: 44, fontFamily: F.mono, fontSize: 30, color: ok ? C.dim : C.amber}}>value: {val.toFixed(1)}</div>
            <div style={{position: 'absolute', top: 140, width: '100%'}}>
              <PinDots filled={4} dx={shakeDx(v, 56)} red={t >= ts} r={28} gap={96} />
            </div>
          </Glass>
        );
      })}
      <div style={{position: 'absolute', top: 1300, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          NO SHAKE AT ALL
        </div>
      </div>
      <Caption words={['value', 'is', 'stuck', 'at', '1.0']} hi={[4]} start={sec(3.0)} y={1470} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.2));
  let n = 0, dx = 0, red = false, hapticU = -1, k = 0;
  if (t > 2.5) {
    const lt = (t - 2.5) % 1.1; k = Math.floor((t - 2.5) / 1.1);
    if (lt < 0.4) n = Math.floor(lt / 0.1) + 1;
    else { const v = clamp01((lt - 0.4) / SHAKE); n = v < 1 ? 4 : 0; red = v < 1; dx = shakeDx(v, 56); hapticU = (lt - 0.4) / 0.45; }
  }
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.cyan]} />
      <Title text="2. The fix: from: 0" accent="0" y={150} size={74} />
      <CodeCard tokens={T.code2} y={270} hl={[8, 9]} file="pin_shake.dart" fs={32} />
      <Glass x={70} y={1120} w={940} h={250} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', top: 80, width: '100%'}}><PinDots filled={Math.min(n, 4)} dx={dx} red={red} r={28} gap={96} /></div>
        {hapticU >= 0 && hapticU <= 1 && [-1, 1].map((s) => [0, 1, 2].map((j) => (
          <div key={`${s}${j}`} style={{position: 'absolute', top: 108 - (30 + j * 20 + hapticU * 24), left: 470 + s * (250 + j * 22 + hapticU * 30) - (30 + j * 20 + hapticU * 24),
            width: 2 * (30 + j * 20 + hapticU * 24), height: 2 * (30 + j * 20 + hapticU * 24), borderRadius: '50%',
            border: `6px solid ${C.amber}`, opacity: (1 - hapticU) * (1 - j * 0.25),
            clipPath: s > 0 ? 'inset(0 0 0 70%)' : 'inset(0 70% 0 0)'}} />
        )))}
        {t > 2.5 && <div style={{position: 'absolute', bottom: 22, width: '100%', textAlign: 'center', fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: C.dim}}>try {k + 1}</div>}
      </Glass>
      <Caption words={['Every', 'try', 'shakes', '+', 'buzzes.']} hi={[4]} start={sec(2.6)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP07_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 5.8], [() => <Ending num={NUM} />, 3.4]];

export const Ep07: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP07_SCENES.map(([S, d], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(d)}><S /></Sequence>;
        from += sec(d);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP07_FRAMES = EP07_SCENES.reduce((a, [, d]) => a + sec(d), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover07: React.FC = () => (
  <Cover num={NUM} line1="Wrong PIN" accent="shake" badge="sin() × decay = shake">
    <div style={{position: 'absolute', inset: 0, transform: 'scale(0.6) rotate(-6deg)', transformOrigin: '50% 760px'}}>
      <Phone x={W / 2 - 300} y={560} screen="linear-gradient(165deg,#5B3FD9 0%,#2A1E7A 45%,#0B2546 100%)">
        <LockScreen events={[[-1, 0]]} />
      </Phone>
    </div>
  </Cover>
);

import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep08.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 8;
const FLIP = 0.6; // seconds — the controller on screen

/** Curves.easeInOut-like 0→1 */
const io = (x: number) => { const v = clamp01(x); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
/** controller value at time t for a list of [start, toBack] flips */
const flipValue = (t: number, flips: [number, boolean][]) => {
  let v = 0;
  for (const [ts, toBack] of flips) {
    if (t < ts) break;
    const p = io((t - ts) / FLIP);
    v = toBack ? p : 1 - p;
  }
  return v;
};

const CARD_BG = 'linear-gradient(135deg,#1C1650 0%,#4B33D6 48%,#C2367F 100%)';

const Chip: React.FC<{u: number}> = ({u}) => (
  <div style={{width: u * 2.6, height: u * 2, borderRadius: u * 0.4, background: 'linear-gradient(135deg,#F6E3A1,#C9A24B 55%,#F2D88A)', position: 'relative', overflow: 'hidden'}}>
    {[0.33, 0.66].map((k) => <div key={k} style={{position: 'absolute', top: `${k * 100}%`, left: 0, right: 0, height: Math.max(1, u * 0.08), background: 'rgba(90,60,10,0.45)'}} />)}
    <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: Math.max(1, u * 0.08), background: 'rgba(90,60,10,0.45)'}} />
  </div>
);

const CardFront: React.FC<{w: number}> = ({w}) => {
  const u = w / 20;
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: u * 1.3, background: CARD_BG, padding: `${u * 1.3}px ${u * 1.5}px`, boxSizing: 'border-box', color: 'white', overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -u * 4, top: -u * 6, width: u * 14, height: u * 14, borderRadius: '50%', background: 'rgba(255,255,255,0.08)'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: F.display, fontWeight: 700, fontSize: u * 1.5, letterSpacing: u * 0.12}}>NOVA</span>
        <svg width={u * 1.6} height={u * 1.6} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <path d="M8 6 a9 9 0 0 1 0 12" /><path d="M12 3.5 a13 13 0 0 1 0 17" /><path d="M16 1.5 a16 16 0 0 1 0 21" />
        </svg>
      </div>
      <div style={{marginTop: u * 1.1}}><Chip u={u} /></div>
      <div style={{marginTop: u * 1.1, fontFamily: F.mono, fontSize: u * 1.28, letterSpacing: u * 0.08}}>4821 7390 1156 0937</div>
      <div style={{position: 'absolute', left: u * 1.5, right: u * 1.5, bottom: u * 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: F.ui, fontWeight: 600, fontSize: u * 0.85, letterSpacing: u * 0.08}}>
        <span>ALEX RIVERS</span>
        <span style={{opacity: 0.85}}>12/29</span>
        <span style={{fontFamily: F.display, fontSize: u * 1.0, fontStyle: 'italic'}}>DEBIT</span>
      </div>
    </div>
  );
};

const CardBack: React.FC<{w: number}> = ({w}) => {
  const u = w / 20;
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: u * 1.3, background: 'linear-gradient(135deg,#C2367F 0%,#4B33D6 52%,#1C1650 100%)', overflow: 'hidden', color: 'white'}}>
      <div style={{position: 'absolute', top: u * 1.6, left: 0, right: 0, height: u * 2.6, background: '#0B0A14'}} />
      <div style={{position: 'absolute', top: u * 5.4, left: u * 1.5, width: u * 11, height: u * 2.1, borderRadius: u * 0.3, background: 'repeating-linear-gradient(-45deg,#F4F2FF 0 6px,#DCD8F0 6px 12px)'}} />
      <div style={{position: 'absolute', top: u * 5.4, left: u * 13, width: u * 4, height: u * 2.1, borderRadius: u * 0.3, background: 'white', color: '#1C1650', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 700, fontStyle: 'italic', fontSize: u * 1.15}}>382</div>
      <div style={{position: 'absolute', top: u * 8.1, left: u * 13, width: u * 4, textAlign: 'center', fontFamily: F.ui, fontWeight: 600, fontSize: u * 0.6, letterSpacing: u * 0.1, opacity: 0.8}}>CVV</div>
      <div style={{position: 'absolute', right: u * 1.5, bottom: u * 1.1, fontFamily: F.display, fontWeight: 700, fontSize: u * 1.1, letterSpacing: u * 0.12, opacity: 0.9}}>NOVA</div>
    </div>
  );
};

/** the card under Transform(rotateY(angle)).  mode: fix = Transform.flip on the back, mirror = always the front, flat = no perspective */
const FlipCard: React.FC<{w: number; v: number; mode?: 'fix' | 'mirror' | 'flat'; tilt?: number}> = ({w, v, mode = 'fix', tilt = 0}) => {
  const h = w / 1.586;
  const angle = v * Math.PI;
  const back = mode === 'fix' && angle > Math.PI / 2;
  const shade = 0.32 * Math.abs(Math.sin(angle));
  return (
    <div style={{width: w, height: h, perspective: mode === 'flat' ? 'none' : w * 2.4}}>
      <div style={{position: 'relative', width: w, height: h, transform: `rotateX(${tilt}deg) rotateY(${angle * 180 / Math.PI}deg)`,
        filter: `drop-shadow(0 ${w / 18}px ${w / 10}px rgba(0,0,0,0.5))`}}>
        {back
          ? <div style={{position: 'absolute', inset: 0, transform: 'scaleX(-1)'}}><CardBack w={w} /></div>
          : <CardFront w={w} />}
        <div style={{position: 'absolute', inset: 0, borderRadius: w / 15.4, background: `rgba(0,0,0,${shade})`}} />
      </div>
    </div>
  );
};

/* ---------- wallet app screen (generic) ---------- */
export const WalletScreen: React.FC<{v: number; tap?: number}> = ({v, tap = -1}) => (
  <AbsoluteFill style={{fontFamily: F.ui, color: 'white', padding: '120px 40px 0'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 46}}>My cards</span>
      <span style={{width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 400}}>+</span>
    </div>
    <div style={{marginTop: 50, position: 'relative'}}>
      <FlipCard w={488} v={v} />
      {tap >= 0 && tap <= 1 && (
        <div style={{position: 'absolute', left: 244 - 40 - tap * 60, top: 154 - 40 - tap * 60, width: 80 + tap * 120, height: 80 + tap * 120, borderRadius: '50%',
          border: '5px solid white', opacity: 1 - tap}} />
      )}
    </div>
    <div style={{marginTop: 26, textAlign: 'center', fontSize: 26, color: 'rgba(255,255,255,0.6)'}}>Tap the card to see the back</div>
    <div style={{marginTop: 44, fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 2}}>RECENT</div>
    {[['Coffee bar', '-4.20'], ['Groceries', '-32.10'], ['Salary', '+2,400.00'], ['Cinema', '-12.00']].map(([n, a], i) => (
      <div key={i} style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 22, padding: '18px 22px', borderRadius: 26, background: 'rgba(255,255,255,0.08)'}}>
        <span style={{width: 56, height: 56, borderRadius: 18, background: ['#FF9F43', '#3DDC97', '#7C5CFF', '#FF4D8D'][i], opacity: 0.85}} />
        <span style={{fontSize: 30, fontWeight: 500}}>{n}</span>
        <span style={{marginLeft: 'auto', fontSize: 30, fontWeight: 600, color: a.startsWith('+') ? C.green : 'white'}}>{a}</span>
      </div>
    ))}
  </AbsoluteFill>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const v = flipValue(t, [[1.1, true], [2.9, false]]);
  const tap = t > 0.85 && t < 1.4 ? (t - 0.85) / 0.55 : t > 2.65 && t < 3.2 ? (t - 2.65) / 0.55 : -1;
  return (
    <SceneIn>
      <Backdrop />
      <SeriesPill num={NUM} />
      <Title text="Bank card flip" accent="flip" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="linear-gradient(170deg,#1E1846 0%,#0E1030 55%,#081A33 100%)">
          <WalletScreen v={v} tap={tap} />
        </Phone>
      </div>
      <Caption words={['Tap', 'the', 'card.', 'It', 'flips', 'in', '3D.']} hi={[4]} start={14} y={1450} />
      <Widgy x={900} y={1330} size={170} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.3));
  // ping-pong between 0 and 0.42 so only the front side is in view
  const v = t > 2.6 ? 0.42 * (0.5 - 0.5 * Math.cos((t - 2.6) * Math.PI / 0.9)) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.violet]} />
      <Title text="1. rotateY + depth" accent="depth" y={150} size={74} />
      <CodeCard tokens={T.code1} y={270} hl={[8, 9]} file="card_flip.dart" fs={31} />
      <Glass x={70} y={1200} w={940} h={210} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`, display: 'flex', alignItems: 'center', padding: '0 70px', gap: 60}}>
        <FlipCard w={250} v={v} />
        <div style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 34, lineHeight: 1.6, color: C.dim, textAlign: 'right'}}>
          <div>value <span style={{color: C.text}}>{v.toFixed(2)}</span></div>
          <div>angle <span style={{color: C.amber}}>{(v * Math.PI).toFixed(2)}</span></div>
        </div>
      </Glass>
      <Caption words={['setEntry', 'adds', 'real', 'depth.']} hi={[0]} start={sec(2.9)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const badge = pop(f, sec(2.9), 10);
  const a1 = pop(f, sec(0.4));
  const a2 = pop(f, sec(1.5));
  const vFlat = t > 0.8 ? 0.42 * (0.5 - 0.5 * Math.cos((t - 0.8) * Math.PI / 0.8)) : 0;
  const vMir = flipValue(t, [[2.0, true]]);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[]} file="card_flip.dart" start={4} step={4} fs={34} />
      <Glass x={110} y={620} w={860} h={280} style={{opacity: a1, transform: `translateY(${(1 - a1) * 60}px)`}}>
        <div style={{position: 'absolute', top: 30, left: 44, fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.dim}}>NO setEntry</div>
        <div style={{position: 'absolute', bottom: 30, left: 44, fontFamily: F.mono, fontSize: 30, color: C.amber}}>flat squish</div>
        <div style={{position: 'absolute', top: 58, right: 70}}><FlipCard w={260} v={vFlat} mode="flat" /></div>
      </Glass>
      <Glass x={110} y={950} w={860} h={280} style={{opacity: a2, transform: `translateY(${(1 - a2) * 60}px)`}}>
        <div style={{position: 'absolute', top: 30, left: 44, fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.dim}}>PAST pi / 2</div>
        <div style={{position: 'absolute', bottom: 30, left: 44, fontFamily: F.mono, fontSize: 30, color: vMir > 0.5 ? C.amber : C.dim}}>angle {(vMir * Math.PI).toFixed(2)}</div>
        <div style={{position: 'absolute', top: 58, right: 70}}><FlipCard w={260} v={vMir} mode="mirror" /></div>
      </Glass>
      <div style={{position: 'absolute', top: 1300, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          NO BACK, JUST MIRRORED
        </div>
      </div>
      <Caption words={['Flat', 'and', 'backwards.']} hi={[2]} start={sec(3.0)} y={1470} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.2));
  const v = flipValue(t, [[2.6, true], [3.9, false], [5.0, true]]);
  const isBack = v * Math.PI > Math.PI / 2;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.cyan]} />
      <Title text="2. The fix: flip the back" accent="back" y={150} size={70} />
      <CodeCard tokens={T.code2} y={270} hl={[1, 8, 9]} file="card_flip.dart" fs={31} />
      <Glass x={70} y={1160} w={940} h={250} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`, display: 'flex', alignItems: 'center', padding: '0 70px', gap: 60}}>
        <FlipCard w={280} v={v} />
        <div style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 34, lineHeight: 1.6, color: C.dim, textAlign: 'right'}}>
          <div>angle <span style={{color: C.text}}>{(v * Math.PI).toFixed(2)}</span></div>
          <div>isBack <span style={{color: isBack ? C.green : C.amber}}>{String(isBack)}</span></div>
        </div>
      </Glass>
      <Caption words={['A', 'real,', 'readable', 'back.']} hi={[2]} start={sec(2.6)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP08_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep08: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP08_SCENES.map(([S, d], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(d)}><S /></Sequence>;
        from += sec(d);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP08_FRAMES = EP08_SCENES.reduce((a, [, d]) => a + sec(d), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover08: React.FC = () => (
  <Cover num={NUM} line1="Bank card" accent="3D flip" badge="rotateY + perspective">
    <div style={{position: 'absolute', left: 250, top: 760, opacity: 0.9}}><FlipCard w={620} v={0.82} tilt={8} /></div>
    <div style={{position: 'absolute', left: 150, top: 900}}><FlipCard w={680} v={0.13} tilt={8} /></div>
  </Cover>
);

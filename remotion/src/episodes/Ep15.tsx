import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep15.tokens.json';

/** tokyo-night comments (#51597D) are too dim on a phone; lift them */
const T = Object.fromEntries(Object.entries(tokens as unknown as Record<string, Tok[][]>).map(([k, block]) =>
  [k, block.map((line) => line.map((t) => (t.k === '#51597D' ? {...t, k: '#A9B1D6'} : t)))])) as Record<string, Tok[][]>;
const NUM = 15;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const inOut = (u: number) => {
  const x = clamp01(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** badge bounce 0..1 -> extra scale */
const bounce = (u: number) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) * 0.55);

/* ---------- generic food-delivery screen, drawn at phone-screen size 568 x 1148 ---------- */
const SW = 568;
const SH = 1148;
const FOODS = [
  {name: 'Green Bowl', price: '$8.50', a: '#6BE6A8', b: '#1E6B4A'},
  {name: 'Tomato Soup', price: '$6.00', a: '#FF8A65', b: '#A6321C'},
  {name: 'Mango Lassi', price: '$4.20', a: '#FFD36B', b: '#C77A12'},
  {name: 'Berry Tart', price: '$5.80', a: '#FF7FB0', b: '#8E1F52'},
  {name: 'Noodle Box', price: '$9.10', a: '#FFC48A', b: '#9A5A1E'},
  {name: 'Blue Shake', price: '$4.90', a: '#7FE6FF', b: '#1C5E9A'},
];
const card = (i: number) => {
  const c = i % 2;
  const r = Math.floor(i / 2);
  const x = 28 + c * 268;
  const y = 190 + r * 324;
  return {x, y, img: {x: x + 122, y: y + 110}, plus: {x: x + 200, y: y + 256}};
};
const CART = {x: 464, y: 76, s: 72};
const CART_CENTER = {x: CART.x + CART.s / 2, y: CART.y + CART.s / 2};
const CART_CORNER = {x: CART.x, y: CART.y};

const FoodArt: React.FC<{a: string; b: string; r: number}> = ({a, b, r}) => (
  <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <radialGradient id={`fa${a.slice(1)}`} cx="0.35" cy="0.3"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
    </defs>
    <circle r="100" fill="#2C2B44" />
    <circle r="96" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
    <circle r="74" fill={`url(#fa${a.slice(1)})`} />
    <circle cx="-26" cy="-18" r="14" fill="rgba(255,255,255,0.55)" />
    <circle cx="22" cy="16" r="10" fill="rgba(255,255,255,0.35)" />
    <circle cx="-6" cy="30" r="7" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const CartIcon: React.FC<{count: number; bump: number}> = ({count, bump}) => (
  <>
    <div style={{position: 'absolute', left: CART.x, top: CART.y, width: CART.s, height: CART.s, borderRadius: 22,
      background: 'rgba(255,255,255,0.1)', border: `1.5px solid ${C.glassBorder}`, transform: `scale(${1 + bump * 0.25})`}}>
      <svg width={CART.s} height={CART.s} viewBox="0 0 72 72">
        <path d="M 14 20 L 22 20 L 28 44 L 52 44 L 57 27 L 25 27" stroke="white" strokeWidth="4.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="31" cy="53" r="4.5" fill="white" />
        <circle cx="49" cy="53" r="4.5" fill="white" />
      </svg>
    </div>
    {count > 0 && (
      <div style={{position: 'absolute', left: CART.x + 50, top: CART.y - 14, width: 38, height: 38, borderRadius: 19, background: C.pink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: 22, color: 'white',
        transform: `scale(${1 + bump})`, boxShadow: `0 4px 16px ${C.pink}99`}}>{count}</div>
    )}
  </>
);

type Fly = {card: number; t: number; aim?: 'center' | 'corner'; shrink?: boolean; trail?: boolean};
const flyPos = (fl: Fly, t = fl.t) => {
  const from = card(fl.card).img;
  const to = fl.aim === 'corner' ? CART_CORNER : CART_CENTER;
  return {x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t)};
};

const Thumb: React.FC<{fl: Fly}> = ({fl}) => {
  if (fl.t <= 0) return null;
  const f = FOODS[fl.card];
  const r = 34;
  const draw = (t: number, o: number, k: number) => {
    const p = flyPos(fl, t);
    const s = fl.shrink ? 1 - 0.35 * t : 1;
    return (
      <div key={k} style={{position: 'absolute', left: p.x - r * s, top: p.y - r * s, opacity: o,
        filter: `drop-shadow(0 10px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 16px ${f.a}88)`}}>
        <FoodArt a={f.a} b={f.b} r={r * s} />
      </div>
    );
  };
  return (
    <>
      {fl.trail && fl.t < 1 && [0.24, 0.16, 0.08].map((d, k) => (fl.t - d > 0 ? draw(fl.t - d, 0.12 + k * 0.1, k) : null))}
      {draw(fl.t, 1, 9)}
    </>
  );
};

const Tap: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (p <= 0 || p >= 1 ? null : (
  <div style={{position: 'absolute', left: x - 60 * p, top: y - 60 * p, width: 120 * p, height: 120 * p, borderRadius: '50%',
    border: '5px solid rgba(255,255,255,0.85)', opacity: 1 - p}} />
));

const Cross: React.FC<{x: number; y: number; col: string; o: number}> = ({x, y, col, o}) => (o <= 0 ? null : (
  <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, opacity: o}}>
    <div style={{position: 'absolute', left: 20, top: 0, width: 4, height: 44, background: col}} />
    <div style={{position: 'absolute', left: 0, top: 20, width: 44, height: 4, background: col}} />
    <div style={{position: 'absolute', left: 8, top: 8, width: 28, height: 28, borderRadius: 14, border: `4px solid ${col}`}} />
  </div>
));

const FoodScreen: React.FC<{fly?: Fly; count: number; bump?: number; tap?: {card: number; p: number}; marks?: number}> = ({
  fly, count, bump = 0, tap, marks = 0,
}) => (
  <AbsoluteFill style={{background: '#14132A', fontFamily: F.ui, color: C.text}}>
    <div style={{position: 'absolute', left: 32, top: 78, fontFamily: F.display, fontWeight: 700, fontSize: 36}}>Fresh Kitchen</div>
    <div style={{position: 'absolute', left: 32, top: 124, fontSize: 22, color: C.dim}}>Lunch near you</div>
    <CartIcon count={count} bump={bump} />
    {FOODS.map((fd, i) => {
      const c = card(i);
      const pressed = tap && tap.card === i && tap.p > 0 && tap.p < 0.5;
      return (
        <div key={i} style={{position: 'absolute', left: c.x, top: c.y, width: 244, height: 300, borderRadius: 30,
          background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)'}}>
          <div style={{position: 'absolute', left: 42, top: 30}}><FoodArt a={fd.a} b={fd.b} r={80} /></div>
          <div style={{position: 'absolute', left: 22, top: 212, fontSize: 25, fontWeight: 600}}>{fd.name}</div>
          <div style={{position: 'absolute', left: 22, top: 250, fontSize: 23, color: C.dim}}>{fd.price}</div>
          <div style={{position: 'absolute', left: 200 - 26, top: 256 - 26, width: 52, height: 52, borderRadius: 26, background: grad2,
            transform: `scale(${pressed ? 0.85 : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{position: 'absolute', width: 24, height: 5, borderRadius: 3, background: 'white'}} />
            <div style={{position: 'absolute', width: 5, height: 24, borderRadius: 3, background: 'white'}} />
          </div>
        </div>
      );
    })}
    {marks > 0 && fly && (
      <>
        <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0, opacity: marks}}>
          <line x1={card(fly.card).img.x} y1={card(fly.card).img.y} x2={CART_CENTER.x} y2={CART_CENTER.y}
            stroke={C.amber} strokeWidth={5} strokeDasharray="14 12" />
        </svg>
        <Cross x={card(fly.card).img.x} y={card(fly.card).img.y} col={C.amber} o={marks} />
        <Cross x={CART_CENTER.x} y={CART_CENTER.y} col={C.green} o={marks} />
      </>
    )}
    {tap && <Tap x={card(tap.card).plus.x} y={card(tap.card).plus.y} p={tap.p} />}
    {fly && <Thumb fl={fly} />}
  </AbsoluteFill>
);
const grad2 = `linear-gradient(135deg, ${C.violet}, ${C.pink})`;

/** small phone outline with the same mockup, scaled down */
const MiniPhone: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: SW * s, height: SH * s, borderRadius: 26, overflow: 'hidden', border: '3px solid #3a3946'}}>
    <div style={{width: SW, height: SH, transform: `scale(${s})`, transformOrigin: '0 0', position: 'relative'}}>{children}</div>
  </div>
);

const Readout: React.FC<{label: string; value: string; col?: string; size?: number}> = ({label, value, col = C.text, size = 40}) => (
  <div style={{marginBottom: 16}}>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>{label}</div>
    <div style={{fontFamily: F.mono, fontSize: size, color: col, marginTop: 4, whiteSpace: 'nowrap'}}>{value}</div>
  </div>
);
const fmt = (p: {x: number; y: number}) => `Offset(${Math.round(p.x)}, ${Math.round(p.y)})`;

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const first = t < 2.3;
  const c = first ? 2 : 1;
  const t0 = first ? 1.0 : 2.3;
  const ft = inOut(seg(t, t0 + 0.15, t0 + 0.85));
  const land = t0 + 0.85;
  const count = (t > 1.85 ? 1 : 0) + (t > 3.15 ? 1 : 0);
  const bump = Math.max(bounce(seg(t, 1.85, 2.2)), bounce(seg(t, 3.15, 3.5)));
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.amber]} />
      <SeriesPill num={NUM} />
      <Title text="Fly to cart" accent="Fly" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="#14132A">
          <FoodScreen count={count} bump={bump} tap={{card: c, p: seg(t, t0, t0 + 0.4)}}
            fly={{card: c, t: t > land + 0.05 ? 0 : ft, shrink: true, trail: true}} />
        </Phone>
      </div>
      <Caption words={['Tap.', 'It', 'flies', 'to', 'the', 'cart.']} hi={[2]} start={14} y={1450} />
      <Widgy x={920} y={1330} size={160} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const marks = ease(f, sec(2.7), 12);
  const lt = t > 3.4 ? (t - 3.4) % 1.3 : 0;
  const ft = t > 3.4 ? seg(lt, 0, 0.7) : 0;
  const from = card(2).img;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.amber, C.violet]} />
      <Title text="1. Find both points" accent="points" y={150} size={80} />
      <CodeCard tokens={T.code1} y={270} hl={[6, 7]} file="menu_page.dart" fs={30} step={2} />
      <Glass x={70} y={1090} w={940} h={320} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <MiniPhone x={60} y={22} s={0.24}>
          <FoodScreen count={1} marks={marks} bump={bounce(seg(lt, 0.7, 1.0))} fly={{card: 2, t: ft >= 1 ? 0 : ft}} />
        </MiniPhone>
        <div style={{position: 'absolute', left: 330, top: 50, opacity: marks}}>
          <Readout label="from (product center)" value={fmt(from)} col={C.amber} />
          <Readout label="to (cart center)" value={fmt(CART_CENTER)} col={C.green} />
        </div>
      </Glass>
      <Caption words={['Ask', 'the', 'RenderBox.']} hi={[2]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const ZS = 2.4;
const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const lt = t > 1.1 ? (t - 1.1) % 1.7 : 0;
  const ft = t > 1.1 ? seg(lt, 0, 0.8) : 0;
  const fl: Fly = {card: 2, t: ft, aim: 'corner'};
  const badge = pop(f, sec(2.4), 10);
  const zx = 330;
  const zy = 40;
  const zw = 560;
  const zh = 380;
  const toZ = (p: {x: number; y: number}) => ({x: zw / 2 + (p.x - CART_CENTER.x) * ZS, y: zh / 2 + (p.y - CART_CENTER.y) * ZS});
  const corner = toZ(CART_CORNER);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[1]} file="menu_page.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={660} w={940} h={560} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <MiniPhone x={50} y={40} s={0.42}>
          <FoodScreen count={1} fly={fl} />
        </MiniPhone>
        <div style={{position: 'absolute', left: zx, top: zy, width: zw, height: zh, borderRadius: 26, overflow: 'hidden', border: `3px solid ${C.glassBorder}`, background: '#14132A'}}>
          <div style={{position: 'absolute', left: zw / 2 - CART_CENTER.x * ZS, top: zh / 2 - CART_CENTER.y * ZS, width: SW, height: SH, transform: `scale(${ZS})`, transformOrigin: '0 0'}}>
            <FoodScreen count={1} fly={fl} />
          </div>
          <div style={{position: 'absolute', left: zw / 2 - 48, top: zh / 2 - 48, width: 96, height: 96, borderRadius: 48, border: `5px dashed ${C.green}`}} />
          <div style={{position: 'absolute', left: corner.x - 12, top: corner.y - 12, width: 24, height: 24, borderRadius: 12, background: C.red, boxShadow: `0 0 20px ${C.red}`}} />
          <div style={{position: 'absolute', left: zw / 2 + 70, top: zh / 2 - 20, fontFamily: F.mono, fontSize: 26, color: C.green}}>center</div>
          <div style={{position: 'absolute', left: 24, top: zh - 50, fontFamily: F.mono, fontSize: 26, color: C.red}}>red dot = Offset.zero</div>
        </div>
        <div style={{position: 'absolute', left: zx, top: zy + zh + 30, fontFamily: F.mono, fontSize: 30, color: C.dim}}>
          lands at <span style={{color: C.red}}>{fmt(CART_CORNER)}</span>
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1270, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          MISSES THE CART
        </div>
      </div>
      <Caption words={['Use', 'size.center,', 'not', 'zero.']} hi={[1]} start={sec(2.9)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const run = t > 2.6 ? t - 2.6 : 0;
  const lt = run % 1.7;
  const cycles = Math.floor(run / 1.7);
  // fly.forward(): 0 -> 1, linear, then entry.remove()
  const v = t > 2.6 ? seg(lt, 0.2, 0.9) : 0;
  const flying = t > 2.6 && v > 0 && v < 1;
  const landed = t > 2.6 && lt >= 0.9;
  const count = 1 + cycles + (landed ? 1 : 0);
  const p = flyPos({card: 2, t: v});
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.green]} />
      <Title text="2. Fly in an Overlay" accent="Overlay" y={150} size={76} />
      <CodeCard tokens={T.code2} y={260} hl={[3, 4, 12, 14]} file="menu_page.dart" fs={29} step={2} />
      <Glass x={70} y={1150} w={940} h={270} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <MiniPhone x={60} y={18} s={0.2}>
          <FoodScreen count={count} bump={bounce(seg(lt, 0.9, 1.25))} tap={{card: 2, p: t > 2.6 ? seg(lt, 0, 0.35) : 0}} fly={{card: 2, t: flying ? v : 0}} />
        </MiniPhone>
        <div style={{position: 'absolute', left: 330, top: 36}}>
          <Readout label="fly.value" value={v.toFixed(2)} />
          <Readout label="Offset.lerp(from, to, v)" value={fmt(p)} col={flying ? C.amber : C.green} size={34} />
        </div>
      </Glass>
      <Caption words={['Then', 'remove', 'the', 'entry.']} hi={[1]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP15_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep15: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP15_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP15_FRAMES = EP15_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover15: React.FC = () => (
  <Cover num={NUM} line1="Add to cart" accent="fly-in" badge="localToGlobal">
    <div style={{position: 'absolute', top: 690, left: W / 2 - 175, width: 350, height: 708, borderRadius: 54, padding: 10,
      background: 'linear-gradient(140deg,#5d5b6a,#1d1c24 30%,#2c2b35 70%,#6c6a78)', boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}}>
      <div style={{position: 'relative', width: 330, height: 688, borderRadius: 46, overflow: 'hidden'}}>
        <div style={{width: SW, height: SH, transform: `scale(${330 / SW})`, transformOrigin: '0 0', position: 'relative'}}>
          <FoodScreen count={2} fly={{card: 2, t: 0.62, shrink: true, trail: true}} />
        </div>
      </div>
    </div>
  </Cover>
);

import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W, grad} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep10.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 10;
const MAX = 80;   // clamp(0.0, 80.0) — same as the code
const HIT = 64;   // reply threshold — same as the code

const outCubic = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);

/** one swipe starting at t0 (s): drag out 0.6 s, hold 0.2 s, snap back 0.25 s. Returns dx in code units (0..80). */
const swipe = (t: number, t0: number) => {
  const u = t - t0;
  if (u < 0) return 0;
  if (u < 0.6) return MAX * outCubic(u / 0.6);
  if (u < 0.8) return MAX;
  if (u < 1.05) return MAX * (1 - outCubic((u - 0.8) / 0.25));
  return 0;
};

/** generic reply arrow */
const ReplyIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M10 5 L3 11.5 L10 18 M3.6 11.5 H14 a6.5 6.5 0 0 1 6.5 6.5 V20" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** a bubble that moves by dx*k px, reply icon fading in behind it */
const SwipeRow: React.FC<{dx: number; k: number; text: string; fs?: number; maxW?: number; time?: string}> = ({dx, k, text, fs = 27, maxW = 380, time = '09:12'}) => {
  const r = clamp01(dx / HIT);
  const hit = dx >= HIT;
  const ic0 = fs * 2;
  const ic = ic0 * (0.4 + 0.6 * r + (hit ? 0.12 : 0));
  return (
    <div style={{position: 'relative', height: fs * 3.4}}>
      <div style={{position: 'absolute', left: 18 + (dx * k) / 2 - ic / 2, top: fs * 1.7 - ic / 2, width: ic, height: ic, borderRadius: ic / 2,
        background: hit ? C.violet : 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: r, backgroundImage: hit ? `radial-gradient(circle, #9B82FF 0%, ${C.violet} 70%)` : 'none', outline: hit ? '3px solid rgba(255,255,255,0.35)' : 'none', outlineOffset: 3}}>
        <ReplyIcon size={ic * 0.58} color="white" />
      </div>
      <div style={{position: 'absolute', left: 22, top: fs * 0.3, transform: `translateX(${dx * k}px)`, maxWidth: maxW, padding: `${fs * 0.55}px ${fs * 0.8}px`,
        borderRadius: `${fs * 0.9}px ${fs * 0.9}px ${fs * 0.9}px ${fs * 0.25}px`, background: '#2A2840', color: 'white', fontFamily: F.ui, fontSize: fs, lineHeight: 1.3}}>
        {text}<span style={{marginLeft: 14, fontSize: fs * 0.62, color: 'rgba(255,255,255,0.5)'}}>{time}</span>
      </div>
    </div>
  );
};

const Out: React.FC<{text: string; fs?: number}> = ({text, fs = 27}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', padding: '6px 22px'}}>
    <div style={{maxWidth: 380, padding: `${fs * 0.55}px ${fs * 0.8}px`, borderRadius: `${fs * 0.9}px ${fs * 0.9}px ${fs * 0.25}px ${fs * 0.9}px`,
      background: grad, color: 'white', fontFamily: F.ui, fontSize: fs, lineHeight: 1.3}}>{text}</div>
  </div>
);

/** generic chat screen (invented contact) */
const ChatScreen: React.FC<{dx: number; reply: number; typed: string}> = ({dx, reply, typed}) => (
  <AbsoluteFill style={{fontFamily: F.ui, color: 'white'}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 190, background: 'rgba(10,9,24,0.75)', display: 'flex', alignItems: 'flex-end', padding: '0 28px 22px', gap: 18, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
      <div style={{width: 72, height: 72, borderRadius: 36, background: `linear-gradient(135deg, ${C.amber}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 600}}>M</div>
      <div>
        <div style={{fontSize: 32, fontWeight: 600}}>Mira</div>
        <div style={{fontSize: 22, color: C.cyan}}>online</div>
      </div>
    </div>
    <div style={{position: 'absolute', top: 230, left: 0, right: 0}}>
      <Out text="Are we still on for Friday?" />
      <SwipeRow dx={0} k={1.8} text="Yes! 7 pm works" time="09:10" />
      <SwipeRow dx={dx} k={1.8} text="Can you bring the slides?" maxW={470} />
      <Out text="Sure, on it" />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(10,9,24,0.85)', padding: '18px 22px 46px', borderTop: '1px solid rgba(255,255,255,0.08)'}}>
      {reply > 0.01 && (
        <div style={{height: 96 * reply, overflow: 'hidden', opacity: reply}}>
          <div style={{borderLeft: `6px solid ${C.violet}`, borderRadius: 10, background: 'rgba(124,92,255,0.18)', padding: '10px 18px', marginBottom: 14}}>
            <div style={{fontSize: 22, fontWeight: 600, color: '#B9A8FF'}}>Replying to Mira</div>
            <div style={{fontSize: 24, color: 'rgba(255,255,255,0.75)'}}>Can you bring the slides?</div>
          </div>
        </div>
      )}
      <div style={{height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 27, color: typed ? 'white' : 'rgba(255,255,255,0.4)'}}>
        {typed || 'Message'}
      </div>
    </div>
  </AbsoluteFill>
);

const CHAT_BG = 'linear-gradient(170deg,#1B1640 0%,#121033 50%,#0A1A33 100%)';

/** a track showing dx, the 64 threshold and the 80 clamp */
const Meter: React.FC<{dx: number; w: number}> = ({dx, w}) => (
  <div style={{position: 'relative', width: w, height: 70}}>
    <div style={{position: 'absolute', top: 30, left: 0, width: w, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.12)'}} />
    <div style={{position: 'absolute', top: 30, left: 0, width: (dx / MAX) * w, height: 10, borderRadius: 5, background: dx >= HIT ? C.violet : C.cyan}} />
    <div style={{position: 'absolute', top: 14, left: (HIT / MAX) * w - 2, width: 4, height: 42, background: C.pink, borderRadius: 2}} />
    <div style={{position: 'absolute', top: -22, left: (HIT / MAX) * w - 30, width: 60, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.pink}}>64</div>
    <div style={{position: 'absolute', top: -22, left: w - 50, width: 60, textAlign: 'right', fontFamily: F.mono, fontSize: 22, color: C.dim}}>80</div>
  </div>
);

/** amber buzz rings around a point */
const Buzz: React.FC<{u: number; x: number; y: number}> = ({u, x, y}) => (u < 0 || u > 1 ? null : (
  <>
    {[0, 1].map((j) => {
      const r = 30 + j * 22 + u * 30;
      return <div key={j} style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `5px solid ${C.amber}`, opacity: (1 - u) * (1 - j * 0.3)}} />;
    })}
  </>
));

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const dx = swipe(t, 1.0);
  const reply = pop(f, sec(1.85), 14);
  const msg = 'Bringing them!';
  const typed = t > 2.7 ? msg.slice(0, Math.floor((t - 2.7) / 0.06)) : '';
  return (
    <SceneIn>
      <Backdrop />
      <SeriesPill num={NUM} />
      <Title text="Swipe to reply" accent="reply" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen={CHAT_BG}>
          <ChatScreen dx={dx} reply={reply} typed={typed} />
        </Phone>
      </div>
      <Caption words={['Swipe', 'a', 'message.', 'Reply.']} hi={[3]} start={14} y={1450} />
      <Widgy x={900} y={1330} size={170} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.3));
  const dx = t > 2.7 ? swipe((t - 2.7) % 1.5, 0) : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.violet]} />
      <Title text="1. Drag + clamp" accent="clamp" y={150} size={74} />
      <CodeCard tokens={T.code1} y={270} hl={[3, 4, 8]} file="swipe_reply.dart" fs={32} />
      <Glass x={70} y={1228} w={940} h={190} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 10, top: 34, width: 520}}><SwipeRow dx={dx} k={2} text="Can you bring the slides?" fs={30} maxW={460} time="" /></div>
        <div style={{position: 'absolute', right: 50, top: 70}}><Meter dx={dx} w={240} /></div>
        <div style={{position: 'absolute', right: 50, top: 132, width: 240, textAlign: 'right', fontFamily: F.mono, fontSize: 26, color: dx >= HIT ? C.text : C.dim}}>_dx: {dx.toFixed(0)}</div>
      </Glass>
      <Caption words={['Past', '64', 'it', 'replies.']} hi={[1]} start={sec(2.9)} y={1460} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.6));
  // finger drags past 64 at ~1.2 s and keeps wiggling there
  const u = t - 1.0;
  const dx = u < 0 ? 0 : Math.min(MAX, u < 0.5 ? MAX * outCubic(u / 0.5) : 72 + 7 * Math.sin(u * 9));
  let calls = 0;
  for (let k = 0; k <= f; k++) {
    const uk = k / 30 - 1.0;
    const d = uk < 0 ? 0 : Math.min(MAX, uk < 0.5 ? MAX * outCubic(uk / 0.5) : 72 + 7 * Math.sin(uk * 9));
    if (d >= HIT) calls += 2; // ~60 drag updates per second
  }
  const on = dx >= HIT;
  const shake = on ? Math.sin(f * 2.6) * 9 : 0;
  const badge = pop(f, sec(2.8), 10);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[2, 3]} file="swipe_reply.dart" start={4} step={4} fs={34} />
      <Glass x={70} y={830} w={940} h={380} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <div style={{position: 'absolute', left: 10, top: 40, width: 560}}><SwipeRow dx={dx} k={2} text="Can you bring the slides?" fs={30} maxW={460} time="" /></div>
        <div style={{position: 'absolute', left: 60, top: 230, display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{position: 'relative', width: 70, height: 110, transform: `translateX(${shake}px)`}}>
            <div style={{width: 70, height: 110, borderRadius: 16, border: `5px solid ${on ? C.amber : C.dim}`}} />
            {on && <Buzz u={(f % 6) / 6} x={35} y={55} />}
          </div>
          <div style={{fontFamily: F.mono, fontSize: 36, color: on ? C.amber : C.dim}}>mediumImpact() × {calls}</div>
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1290, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          BUZZ ON EVERY FRAME
        </div>
      </div>
      <Caption words={['Your', 'phone', 'goes', 'brrrr.']} hi={[3]} start={sec(3.0)} y={1470} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.2));
  const lt = t > 2.4 ? (t - 2.4) % 1.6 : -1;
  const dx = lt >= 0 ? swipe(lt, 0) : 0;
  // threshold crossing time inside one swipe: MAX*outCubic(u/0.6) = 64
  const tCross = 0.6 * (1 - Math.cbrt(1 - HIT / MAX));
  const bu = lt >= 0 ? (lt - tCross) / 0.4 : -1;
  const calls = t > 2.4 ? Math.floor((t - 2.4 - tCross) / 1.6) + 1 : 0;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.cyan]} />
      <Title text="2. Buzz once" accent="once" y={150} size={74} />
      <CodeCard tokens={T.code2} y={270} hl={[1, 7]} file="swipe_reply.dart" />
      <Glass x={70} y={1020} w={940} h={340} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 10, top: 34, width: 560}}><SwipeRow dx={dx} k={2} text="Can you bring the slides?" fs={30} maxW={460} time="" /></div>
        <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{position: 'relative', width: 70, height: 110}}>
            <div style={{width: 70, height: 110, borderRadius: 16, border: `5px solid ${bu >= 0 && bu <= 1 ? C.amber : C.dim}`}} />
            <Buzz u={bu} x={35} y={55} />
          </div>
          <div style={{fontFamily: F.mono, fontSize: 36, color: C.green}}>1 buzz per swipe</div>
        </div>
        <div style={{position: 'absolute', right: 50, top: 230, fontFamily: F.mono, fontSize: 26, color: C.dim}}>{calls > 0 ? `swipe ${calls}` : ''}</div>
      </Glass>
      <Caption words={['One', 'crossing,', 'one', 'buzz.']} hi={[3]} start={sec(2.6)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP10_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 5.8], [() => <Ending num={NUM} />, 3.4]];

export const Ep10: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP10_SCENES.map(([S, d], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(d)}><S /></Sequence>;
        from += sec(d);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP10_FRAMES = EP10_SCENES.reduce((a, [, d]) => a + sec(d), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover10: React.FC = () => (
  <Cover num={NUM} line1="Swipe to" accent="reply" badge="Buzz once, not 60×">
    <div style={{position: 'absolute', inset: 0, transform: 'scale(0.6) rotate(-6deg)', transformOrigin: '50% 760px'}}>
      <Phone x={W / 2 - 300} y={560} screen={CHAT_BG}>
        <ChatScreen dx={72} reply={1} typed="" />
      </Phone>
    </div>
  </Cover>
);

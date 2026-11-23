import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {C, F, W, H, grad} from './theme';
import {pop, ease, clamp01} from './anim';

/* ---------- background: deep navy, drifting colour orbs, dotted grid, grain ---------- */
export const Backdrop: React.FC<{tint?: [string, string, string]}> = ({tint = [C.violet, C.cyan, C.pink]}) => {
  const f = useCurrentFrame();
  const orb = (color: string, x: number, y: number, r: number, sp: number, ph: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + Math.sin(f / sp + ph) * 60 - r,
        top: y + Math.cos(f / (sp * 1.3) + ph) * 50 - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}AA 0%, ${color}55 35%, ${color}00 70%)`,
        opacity: 0.9,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {orb(tint[0], 180, 360, 560, 70, 0)}
      {orb(tint[1], 940, 980, 520, 85, 2)}
      {orb(tint[2], 300, 1650, 500, 95, 4)}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.6px, transparent 1.6px)',
          backgroundSize: '44px 44px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
        }}
      />
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}>
        <svg width={W} height={H}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 8} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene entrance: zoom + blur in ---------- */
export const SceneIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const p = ease(f, 0, 14);
  return (
    <AbsoluteFill style={{transform: `scale(${1.06 - 0.06 * p})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : 'none', opacity: p}}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- glass panel ---------- */
export const Glass: React.FC<{
  x: number; y: number; w: number; h: number; r?: number; children?: React.ReactNode; style?: React.CSSProperties;
}> = ({x, y, w, h, r = 40, children, style}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r,
      background: `linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.035) 40%, rgba(255,255,255,0.05))`,
      border: `1.5px solid ${C.glassBorder}`,
      boxShadow: '0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- series pill + big title ---------- */
export const SeriesPill: React.FC<{num: number; y?: number; start?: number}> = ({num, y = 150, start = 0}) => {
  const f = useCurrentFrame();
  const p = pop(f, start);
  return (
    <div style={{position: 'absolute', top: y, left: 0, width: W, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, background: C.glass, border: `1.5px solid ${C.glassBorder}`, fontFamily: F.ui, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: C.dim}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.cyan, boxShadow: `0 0 16px ${C.cyan}`}} />
        REBUILD IT IN FLUTTER
        <span style={{color: C.text}}>#{String(num).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export const Title: React.FC<{text: string; accent?: string; y: number; start?: number; size?: number; color?: string}> = ({
  text, accent, y, start = 0, size = 92, color = C.text,
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top: y, left: 60, width: W - 120, textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: -2, color}}>
      {words.map((w, i) => {
        const p = pop(f, start + i * 3);
        const isAcc = accent && w.replace(/[^\w]/g, '') === accent;
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 40}px)`,
            ...(isAcc ? {backgroundImage: grad, WebkitBackgroundClip: 'text', color: 'transparent'} : {})}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- captions: word pops, highlight in gradient pill ---------- */
export const Caption: React.FC<{words: string[]; hi?: number[]; start?: number; y?: number}> = ({words, hi = [], start = 6, y = 1440}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: y, left: 70, width: W - 140, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 18px', fontFamily: F.display, fontWeight: 700, fontSize: 64, letterSpacing: -1}}>
      {words.map((w, i) => {
        const p = pop(f, start + i * 3, 11, 170);
        const h = hi.includes(i);
        return (
          <span key={i} style={{
            display: 'inline-block', opacity: clamp01(p * 1.5), transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 20}px)`,
            color: C.text, padding: h ? '2px 20px 6px' : 0, borderRadius: 18,
            background: h ? grad : 'none', boxShadow: h ? `0 10px 40px ${C.pink}66` : 'none',
            textShadow: h ? 'none' : '0 4px 24px rgba(0,0,0,0.6)',
          }}>{w}</span>
        );
      })}
    </div>
  );
};

/* ---------- code card (Shiki tokens) ---------- */
export type Tok = {c: string; k: string; i: boolean};
export const CodeCard: React.FC<{
  tokens: Tok[][]; x?: number; y: number; w?: number; fs?: number; start?: number; step?: number; hl?: number[]; file: string;
}> = ({tokens, x = 70, y, w = 940, fs = 33, start = 6, step = 3, hl = [], file}) => {
  const f = useCurrentFrame();
  const lh = fs * 1.62;
  const h = 120 + tokens.length * lh + 40;
  const allIn = start + tokens.length * step + 8;
  const glow = ease(f, allIn, 12);
  const p = pop(f, start - 4, 16);
  return (
    <Glass x={x} y={y} w={w} h={h} r={36} style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{height: 84, display: 'flex', alignItems: 'center', padding: '0 34px', gap: 14, borderBottom: `1px solid ${C.glassBorder}`}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}
        <span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 26, color: C.dim}}>{file}</span>
      </div>
      <div style={{padding: '26px 0', fontFamily: F.mono, fontSize: fs}}>
        {tokens.map((line, li) => {
          const lp = ease(f, start + li * step, 10);
          const isHl = hl.includes(li);
          return (
            <div key={li} style={{position: 'relative', height: lh, display: 'flex', alignItems: 'center', opacity: lp, transform: `translateX(${(1 - lp) * 30}px)`}}>
              {isHl && (
                <div style={{position: 'absolute', inset: '2px 16px', borderRadius: 12, opacity: glow,
                  background: `linear-gradient(90deg, ${C.violet}55, ${C.pink}22 60%, transparent)`,
                  borderLeft: `5px solid ${C.pink}`}} />
              )}
              <span style={{width: 70, textAlign: 'right', paddingRight: 22, color: 'rgba(255,255,255,0.22)', fontSize: fs * 0.78, position: 'relative'}}>{li + 1}</span>
              <span style={{whiteSpace: 'pre', position: 'relative'}}>
                {line.map((t, ti) => <span key={ti} style={{color: t.k, fontStyle: t.i ? 'italic' : 'normal'}}>{t.c}</span>)}
              </span>
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

/* ---------- realistic phone frame ---------- */
export const Phone: React.FC<{x: number; y: number; w?: number; h?: number; children?: React.ReactNode; screen?: string; style?: React.CSSProperties}> = ({
  x, y, w = 600, h = 1180, children, screen = 'linear-gradient(170deg,#2B1F7A,#0C1F3F)', style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 96, padding: 16,
    background: 'linear-gradient(140deg,#5d5b6a,#1d1c24 30%,#2c2b35 70%,#6c6a78)',
    boxShadow: '0 60px 120px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 3px #0b0b10', ...style}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 82, overflow: 'hidden', background: screen}}>
      {children}
      <div style={{position: 'absolute', top: 22, left: '50%', marginLeft: -78, width: 156, height: 44, borderRadius: 22, background: '#000'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.10), transparent 35%)', pointerEvents: 'none'}} />
    </div>
  </div>
);

/* ---------- Widgy, the mascot (glossy) ---------- */
export const Widgy: React.FC<{x: number; y: number; size?: number; look?: number; mood?: 'smile' | 'o'; rot?: number}> = ({
  x, y, size = 170, look = 0, mood = 'smile', rot = 0,
}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 7) * 8;
  const blink = (f % 95) < 4;
  return (
    <svg width={size * 1.3} height={size * 1.6} viewBox="-65 -120 130 160"
      style={{position: 'absolute', left: x - size * 0.65, top: y - size * 1.45 + bob, transform: `rotate(${rot}rad)`, overflow: 'visible', filter: `drop-shadow(0 18px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 30px ${C.cyan}44)`}}>
      <defs>
        <linearGradient id="wb" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#6FE3FF" /><stop offset="1" stopColor="#3D5BFF" /></linearGradient>
        <radialGradient id="wa" cx="0.35" cy="0.3"><stop offset="0" stopColor="#FFF3B0" /><stop offset="1" stopColor={C.amber} /></radialGradient>
      </defs>
      <line x1="0" y1="-78" x2="6" y2="-104" stroke="#2B3FB8" strokeWidth="5" strokeLinecap="round" />
      <circle cx="6" cy="-108" r="9" fill="url(#wa)" />
      <rect x="-26" y="-6" width="10" height="16" rx="5" fill="#2B3FB8" />
      <rect x="16" y="-6" width="10" height="16" rx="5" fill="#2B3FB8" />
      <rect x="-55" y="-80" width="110" height="80" rx="24" fill="url(#wb)" />
      <rect x="-45" y="-72" width="40" height="10" rx="5" fill="white" opacity="0.45" />
      {[-20, 20].map((ex) => blink
        ? <line key={ex} x1={ex - 8} y1={-40} x2={ex + 8} y2={-40} stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
        : <g key={ex}><ellipse cx={ex} cy={-42} rx="10" ry="12" fill="white" /><circle cx={ex + look * 3} cy={-41} r="5.5" fill={C.ink} /></g>)}
      {mood === 'o'
        ? <ellipse cx="0" cy="-18" rx="6" ry="7" fill={C.ink} />
        : <path d="M -12 -22 Q 0 -10 12 -22" stroke={C.ink} strokeWidth="4.5" fill="none" strokeLinecap="round" />}
    </svg>
  );
};

/* ---------- shared ending ---------- */
export const Ending: React.FC<{num: number}> = ({num}) => {
  const f = useCurrentFrame();
  const p = pop(f, 0);
  const dots = [0, 1, 2].map((i) => {
    const t = ((f / 30) / 1.2 - i * 0.2) % 1;
    const tt = t < 0 ? t + 1 : t;
    return tt < 0.5 ? -18 * Math.sin(tt * 2 * Math.PI) : 0;
  });
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.cyan]} />
      <SeriesPill num={num} y={330} />
      <Title text="Which app is next?" accent="next" y={420} size={104} />
      <Widgy x={W / 2 - 110} y={1170} size={250} look={1} />
      <div style={{position: 'absolute', left: W / 2 + 40, top: 820, transform: `scale(${p})`, transformOrigin: 'left bottom'}}>
        <Glass x={0} y={0} w={240} h={120} r={60} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          {dots.map((d, i) => <span key={i} style={{width: 30, height: 30, borderRadius: 15, background: C.cyan, transform: `translateY(${d}px)`, boxShadow: `0 0 18px ${C.cyan}`}} />)}
        </Glass>
      </div>
      <Caption words={['Comment', 'the', 'next', 'app']} hi={[0]} start={10} y={1300} />
      <div style={{position: 'absolute', top: 1430, width: W, textAlign: 'center', fontFamily: F.ui, fontWeight: 600, fontSize: 36, color: C.dim, opacity: ease(f, 24, 12)}}>
        follow @loginest_dev
      </div>
    </SceneIn>
  );
};

/* ---------- shared Instagram cover (static; frame 0) ----------
   Title lines sit at y 380-620, the visual between y 700 and 1380, Widgy + badge near 1450.
   Everything important stays inside the 3:4 profile-grid crop (y 240-1680). */
export const Cover: React.FC<{num: number; line1: string; accent: string; badge: string; children?: React.ReactNode}> = ({num, line1, accent, badge, children}) => (
  <AbsoluteFill>
    <Backdrop />
    <SeriesPill num={num} y={300} start={-60} />
    <div style={{position: 'absolute', top: 380, width: W, textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 124, lineHeight: 1, letterSpacing: -4, color: C.text}}>
      {line1}<br />
      <span style={{backgroundImage: grad, WebkitBackgroundClip: 'text', color: 'transparent'}}>{accent}</span>
    </div>
    {children}
    <Widgy x={880} y={1530} size={190} look={-1} rot={-0.08} />
    <div style={{position: 'absolute', top: 1450, left: 0, width: W - 260, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '18px 34px', borderRadius: 999, background: grad, fontFamily: F.display, fontWeight: 700, fontSize: 46, color: 'white', boxShadow: `0 14px 50px ${C.pink}77`, transform: 'rotate(-3deg)'}}>{badge}</div>
    </div>
  </AbsoluteFill>
);

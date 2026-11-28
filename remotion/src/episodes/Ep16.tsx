import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep16.tokens.json';

/** tokyo-night comments (#51597D) are too dim on a phone; lift them */
const T = Object.fromEntries(Object.entries(tokens as unknown as Record<string, Tok[][]>).map(([k, block]) =>
  [k, block.map((line) => line.map((t) => (t.k === '#51597D' ? {...t, k: '#A9B1D6'} : t)))])) as Record<string, Tok[][]>;
const NUM = 16;

const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const SPIN = 1; // seconds per turn, same as the controller on screen

/* Flutter colours used on screen: amber, pink, purple */
const AMBER = '#FFC107';
const PINK = '#E91E63';
const PURPLE = '#9C27B0';
const RING4 = [AMBER, PINK, PURPLE, AMBER];
const RING3 = [AMBER, PINK, PURPLE];

/** generic avatar: coloured disc, silhouette, a small sun so rotation is obvious */
const PALETTES: [string, string][] = [['#4FD1C5', '#1E4E8C'], ['#FFB36B', '#B8325A'], ['#9F8CFF', '#3A2A8C'], ['#7CE38B', '#1F6B53'], ['#FF8FB1', '#7A2A6B']];
const Avatar: React.FC<{d: number; pal?: number; rot?: number}> = ({d, pal = 0, rot = 0}) => {
  const [a, b] = PALETTES[pal % PALETTES.length];
  const id = `av${pal}`;
  return (
    <svg width={d} height={d} viewBox="-50 -50 100 100" style={{display: 'block', transform: `rotate(${rot}deg)`}}>
      <defs>
        <radialGradient id={id} cx="0.3" cy="0.25"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
        <clipPath id={`${id}c`}><circle r="50" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <circle r="50" fill={`url(#${id})`} />
        <circle cx="24" cy="-26" r="8" fill="#FFE9A8" />
        <circle cx="0" cy="-6" r="17" fill="rgba(255,255,255,0.9)" />
        <ellipse cx="0" cy="42" rx="32" ry="26" fill="rgba(255,255,255,0.9)" />
      </g>
    </svg>
  );
};

/** story ring: conic = SweepGradient (Flutter 0 rad = 3 o'clock, CSS 0deg = 12 o'clock) */
const StoryRing: React.FC<{d: number; turn?: number; colors?: string[]; gap?: string; seen?: number; pal?: number; photoRot?: number; whole?: number}> = ({
  d, turn = 0, colors = RING4, gap = '#0E0D1C', seen = 0, pal = 0, photoRot = 0, whole = 0,
}) => {
  const th = Math.max(4, d * 0.055);
  const gp = Math.max(3, d * 0.035);
  const inner = d - 2 * (th + gp);
  return (
    <div style={{position: 'relative', width: d, height: d, transform: `rotate(${whole}deg)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${90 + turn * 360}deg, ${colors.join(', ')})`}} />
      {seen > 0 && <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#4A4960', opacity: seen}} />}
      <div style={{position: 'absolute', inset: th, borderRadius: '50%', background: gap}} />
      <div style={{position: 'absolute', left: th + gp, top: th + gp}}><Avatar d={inner} pal={pal} rot={photoRot} /></div>
    </div>
  );
};

/* ---------- generic social app screen (568 x 1148) ---------- */
const NAMES = ['you', 'mila.k', 'tom_dev', 'ani.art'];
const SocialScreen: React.FC<{t: number}> = ({t}) => {
  const tapAt = 1.0;
  const spinning = t > tapAt + 0.15 && t < 3.6;
  const turn = spinning ? (t - tapAt - 0.15) / SPIN : 0;
  const seen = ease(t * 30, 3.6 * 30, 8);
  const press = t > tapAt && t < tapAt + 0.25 ? 0.9 : 1;
  const tapP = seg(t, tapAt, tapAt + 0.45);
  return (
    <AbsoluteFill style={{background: '#0E0D1C', fontFamily: F.ui, color: C.text}}>
      <div style={{position: 'absolute', left: 32, top: 88, fontFamily: F.display, fontWeight: 700, fontSize: 40}}>Moments</div>
      <div style={{position: 'absolute', right: 34, top: 92, width: 40, height: 40, borderRadius: 12, border: '4px solid white'}} />
      {NAMES.map((n, i) => {
        const x = 20 + i * 136;
        const me = i === 1;
        return (
          <div key={n} style={{position: 'absolute', left: x, top: 170, width: 120, textAlign: 'center'}}>
            <div style={{transform: `scale(${me ? press : 1})`}}>
              <StoryRing d={120} pal={i} turn={me ? turn : 0.08 * i} seen={i === 0 ? 1 : me ? seen : 0} />
            </div>
            <div style={{marginTop: 10, fontSize: 21, color: me && spinning ? C.text : C.dim, fontWeight: me ? 600 : 400}}>{n}</div>
            {me && tapP > 0 && tapP < 1 && (
              <div style={{position: 'absolute', left: 60 - 70 * tapP, top: 60 - 70 * tapP, width: 140 * tapP, height: 140 * tapP, borderRadius: '50%',
                border: '5px solid rgba(255,255,255,0.85)', opacity: 1 - tapP}} />
            )}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 352, height: 1.5, background: 'rgba(255,255,255,0.1)'}} />
      {/* post */}
      <div style={{position: 'absolute', left: 28, top: 378, display: 'flex', alignItems: 'center', gap: 16}}>
        <StoryRing d={62} pal={3} />
        <div>
          <div style={{fontSize: 23, fontWeight: 600}}>ani.art</div>
          <div style={{fontSize: 19, color: C.dim}}>2 h</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 466, height: 520, overflow: 'hidden',
        background: 'linear-gradient(160deg,#3B2A7A 0%,#8E3A7A 55%,#F28D5A 100%)'}}>
        <div style={{position: 'absolute', left: 330, top: 70, width: 120, height: 120, borderRadius: 60, background: '#FFE3A3', boxShadow: '0 0 80px #FFD27A'}} />
        <div style={{position: 'absolute', left: -60, top: 330, width: 420, height: 300, borderRadius: '50%', background: '#2A1B55'}} />
        <div style={{position: 'absolute', left: 240, top: 370, width: 460, height: 300, borderRadius: '50%', background: '#1C1240'}} />
      </div>
      <div style={{position: 'absolute', left: 32, top: 1010, display: 'flex', gap: 26}}>
        {[0, 1, 2].map((k) => <div key={k} style={{width: 42, height: 42, borderRadius: 14, border: '4px solid white'}} />)}
      </div>
      <div style={{position: 'absolute', left: 32, top: 1076, width: 380, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.18)'}} />
    </AbsoluteFill>
  );
};

const Readout: React.FC<{label: string; value: string; col?: string; size?: number}> = ({label, value, col = C.text, size = 40}) => (
  <div style={{marginBottom: 14}}>
    <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim}}>{label}</div>
    <div style={{fontFamily: F.mono, fontSize: size, color: col, marginTop: 4, whiteSpace: 'nowrap'}}>{value}</div>
  </div>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 2, 15);
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.amber]} />
      <SeriesPill num={NUM} />
      <Title text="Story ring spin" accent="spin" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="#0E0D1C">
          <SocialScreen t={f / 30} />
        </Phone>
      </div>
      <Caption words={['Loading?', 'Spin', 'the', 'ring.']} hi={[1]} start={14} y={1450} />
      <Widgy x={920} y={1330} size={160} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const q = pop(f, sec(2.4));
  const marks = ease(f, sec(2.9), 12);
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.amber, C.pink]} />
      <Title text="1. Paint the ring" accent="ring" y={150} size={82} />
      <CodeCard tokens={T.code1} y={270} hl={[3, 9, 10]} file="story_ring.dart" fs={30} step={2} />
      <Glass x={70} y={1180} w={940} h={240} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 40, top: 30}}><StoryRing d={180} colors={RING3} gap="#16152A" pal={2} /></div>
        <div style={{position: 'absolute', left: 214, top: 104, width: 34, height: 6, borderRadius: 3, background: C.red, opacity: marks, boxShadow: `0 0 14px ${C.red}`}} />
        <div style={{position: 'absolute', left: 258, top: 60}}>
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.dim}}>3 colours</div>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.red, opacity: marks}}>seam</div>
        </div>
        <div style={{position: 'absolute', left: 500, top: 30}}><StoryRing d={180} colors={RING4} gap="#16152A" pal={2} /></div>
        <div style={{position: 'absolute', left: 718, top: 60}}>
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.dim}}>4 colours</div>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.green, opacity: marks}}>smooth</div>
        </div>
      </Glass>
      <Caption words={['End', 'where', 'you', 'start.']} hi={[3]} start={sec(3.0)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = pop(f, sec(0.8));
  const ang = t > 1.0 ? ((t - 1.0) / SPIN) * 360 : 0;
  const badge = pop(f, sec(2.4), 10);
  const shown = Math.round(ang % 360);
  const upside = shown > 120 && shown < 240;
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[0, 2]} file="story_ring.dart" start={4} step={4} fs={33} />
      <Glass x={70} y={700} w={940} h={520} style={{opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        <div style={{position: 'absolute', left: 50, top: 50}}><StoryRing d={420} gap="#16152A" pal={1} whole={ang} /></div>
        <div style={{position: 'absolute', left: 540, top: 120}}>
          <Readout label="ring angle" value={`${shown}°`} col={C.amber} />
          <Readout label="photo angle" value={`${shown}°`} col={C.red} />
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 36, color: upside ? C.red : C.dim, marginTop: 10}}>{upside ? 'upside down!' : 'spinning...'}</div>
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1270, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          THE PHOTO SPINS TOO
        </div>
      </div>
      <Caption words={['Spin', 'the', 'paint', 'only.']} hi={[2]} start={sec(2.9)} y={1440} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.4));
  const run = t > 2.6 ? t - 2.6 : 0;
  const v = (run / SPIN) % 1;
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.pink, C.green]} />
      <Title text="2. GradientRotation" accent="GradientRotation" y={150} size={76} />
      <CodeCard tokens={T.code2} y={260} hl={[8, 9, 12]} file="story_ring.dart" fs={30} step={2} />
      <Glass x={70} y={1170} w={940} h={250} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 50, top: 25}}><StoryRing d={200} gap="#16152A" pal={1} turn={v} /></div>
        <div style={{position: 'absolute', left: 310, top: 28}}>
          <Readout label="_spin.value" value={v.toFixed(2)} size={36} />
          <Readout label="GradientRotation" value={`${(v * 2 * Math.PI).toFixed(2)} rad`} col={C.amber} size={36} />
        </div>
        <div style={{position: 'absolute', left: 690, top: 28}}>
          <Readout label="photo angle" value="0°" col={C.green} size={36} />
        </div>
      </Glass>
      <Caption words={['Only', 'the', 'colours', 'move.']} hi={[2]} start={sec(2.8)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP16_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep16: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP16_SCENES.map(([S, dur], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(dur)}><S /></Sequence>;
        from += sec(dur);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP16_FRAMES = EP16_SCENES.reduce((a, [, dur]) => a + sec(dur), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover16: React.FC = () => (
  <Cover num={NUM} line1="Story ring" accent="spin" badge="GradientRotation">
    <div style={{position: 'absolute', top: 720, left: W / 2 - 300}}>
      <div style={{position: 'absolute', inset: -30, borderRadius: '50%', background: `conic-gradient(from 150deg, ${RING4.join(', ')})`, filter: 'blur(50px)', opacity: 0.55}} />
      <StoryRing d={600} gap="#0B0A18" pal={1} turn={0.17} />
    </div>
  </Cover>
);

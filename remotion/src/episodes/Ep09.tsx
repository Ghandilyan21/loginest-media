import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, F, W} from '../kit/theme';
import {pop, ease, clamp01, sec} from '../kit/anim';
import {Backdrop, SceneIn, SeriesPill, Title, Caption, CodeCard, Glass, Phone, Widgy, Ending, Cover, Tok} from '../kit/components';
import tokens from './ep09.tokens.json';

const T = tokens as unknown as Record<string, Tok[][]>;
const NUM = 9;
const PERIOD = 1.3; // seconds — controller duration on screen
const BASE = '#3B3973';
const LIGHT = '#C9C4FF';

/** controller value (repeat) */
const cv = (t: number, phase = 0) => (((t / PERIOD + phase) % 1) + 1) % 1;

type B = {x: number; y: number; w: number; h: number; r?: number};

/**
 * Bones painted like ShaderMask(srcATop) with LinearGradient(begin: Alignment(x,0), end: Alignment(x+2,0), stops .35/.5/.65)
 * one: one mask whose bounds = the whole area (width bw). each: every bone is its own mask (own bounds, own controller phase).
 */
const Bones: React.FC<{bones: B[]; bw: number; t: number; each?: boolean; opacity?: number}> = ({bones, bw, t, each = false, opacity = 1}) => (
  <>
    {bones.map((b, i) => {
      const v = each ? cv(t, i * 0.37) : cv(t);
      const x = v * 4 - 3;
      const BW = each ? b.w : bw;
      const ox = each ? 0 : b.x;
      const c = ((x + 2) / 2) * BW - ox;
      const half = 0.15 * BW;
      return (
        <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: b.r ?? Math.min(12, b.h / 2), opacity,
          background: `linear-gradient(90deg, ${BASE} ${c - half}px, ${LIGHT} ${c}px, ${BASE} ${c + half}px)`}} />
      );
    })}
  </>
);

/** one list row: avatar + two lines */
const rowBones = (y: number, w: number, s = 72, k = 0): B[] => [
  {x: 0, y, w: s, h: s, r: s / 2},
  {x: s + 24, y: y + 8, w: w * [0.62, 0.5, 0.7, 0.55][k % 4], h: 22},
  {x: s + 24, y: y + 44, w: w * [0.38, 0.45, 0.3, 0.42][k % 4], h: 18},
];

/** feed post: avatar, name, sub, image */
const postBones = (y: number, w: number): B[] => [
  {x: 0, y, w: 64, h: 64, r: 32},
  {x: 84, y: y + 8, w: 220, h: 20},
  {x: 84, y: y + 40, w: 140, h: 16},
  {x: 0, y: y + 88, w, h: 190, r: 22},
];

const POSTS = [
  {n: 'Mira Lane', s: '2 min ago', a: '#FF9F43', img: 'linear-gradient(135deg,#FF7A59,#FFC857)'},
  {n: 'Theo Park', s: '14 min ago', a: '#3DDC97', img: 'linear-gradient(135deg,#2FD3F0,#7C5CFF)'},
  {n: 'Juno Cole', s: '1 h ago', a: '#FF4D8D', img: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)'},
];

const RealPost: React.FC<{p: typeof POSTS[number]; y: number; w: number}> = ({p, y, w}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: w, fontFamily: F.ui, color: 'white'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <span style={{width: 64, height: 64, borderRadius: 32, background: p.a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 28, color: C.ink}}>{p.n[0]}</span>
      <div>
        <div style={{fontWeight: 600, fontSize: 28}}>{p.n}</div>
        <div style={{fontSize: 22, color: 'rgba(255,255,255,0.55)'}}>{p.s}</div>
      </div>
    </div>
    <div style={{marginTop: 18, width: w, height: 190, borderRadius: 22, background: p.img, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -40, bottom: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.16)'}} />
    </div>
  </div>
);

const FEED_W = 496;
const FeedScreen: React.FC<{t: number; show: number}> = ({t, show}) => {
  const bones = [0, 1, 2].flatMap((i) => postBones(i * 310, FEED_W));
  return (
    <AbsoluteFill style={{fontFamily: F.ui, color: 'white', padding: '120px 36px 0'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 46}}>Feed</span>
        <span style={{width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.14)'}} />
      </div>
      <div style={{position: 'relative', marginTop: 46}}>
        <Bones bones={bones} bw={FEED_W} t={t} opacity={1 - show} />
        <div style={{opacity: show}}>
          {POSTS.map((p, i) => <RealPost key={i} p={p} y={i * 310} w={FEED_W} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = pop(f, 2, 15);
  const show = ease(f, sec(3.2), 10);
  return (
    <SceneIn>
      <Backdrop />
      <SeriesPill num={NUM} />
      <Title text="Skeleton shimmer" accent="shimmer" y={225} size={100} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 300}px) scale(${0.74 + 0.03 * ease(f, 0, 130)})`, transformOrigin: '50% 400px', opacity: p}}>
        <Phone x={W / 2 - 300} y={400} screen="linear-gradient(170deg,#1E1846 0%,#0E1030 55%,#081A33 100%)">
          <FeedScreen t={t} show={show} />
        </Phone>
      </div>
      <Caption words={['Still', 'loading.', 'Already', 'alive.']} hi={[3]} start={14} y={1450} />
      <Widgy x={900} y={1330} size={170} look={-1} rot={-0.08} />
    </SceneIn>
  );
};

const Code1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.3));
  const tt = Math.max(0, t - 2.5);
  const v = cv(tt);
  const bones = rowBones(0, 360, 80, 0).concat(rowBones(104, 360, 80, 1));
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.cyan, C.violet]} />
      <Title text="1. ShaderMask + srcATop" accent="srcATop" y={150} size={72} />
      <CodeCard tokens={T.code1} y={270} hl={[3, 6, 7]} file="shimmer.dart" fs={31} />
      <Glass x={70} y={1170} w={940} h={250} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 50, top: 33, width: 360, height: 184}}>
          <Bones bones={bones} bw={360} t={tt} />
        </div>
        <div style={{position: 'absolute', right: 56, top: 62, fontFamily: F.mono, fontSize: 34, lineHeight: 1.6, color: C.dim, textAlign: 'right'}}>
          <div>value <span style={{color: C.text}}>{v.toFixed(2)}</span></div>
          <div>x <span style={{color: C.amber}}>{(v * 4 - 3).toFixed(2)}</span></div>
        </div>
      </Glass>
      <Caption words={['Only', 'the', 'bones', 'shine.']} hi={[2]} start={sec(2.9)} y={1460} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

const Trap: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const badge = pop(f, sec(2.6), 10);
  const a1 = pop(f, sec(0.5));
  const bones = [0, 1, 2, 3].flatMap((i) => rowBones(i * 128, 560, 80, i));
  return (
    <SceneIn>
      <Backdrop tint={[C.pink, C.violet, C.red]} />
      <Title text="The trap" accent="trap" y={150} size={96} />
      <CodeCard tokens={T.trap} y={290} hl={[]} file="shimmer.dart" start={4} step={4} fs={34} />
      <Glass x={110} y={660} w={860} h={600} style={{opacity: a1, transform: `translateY(${(1 - a1) * 60}px)`}}>
        <div style={{position: 'absolute', top: 30, left: 44, fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.dim}}>SHIMMER PER BONE</div>
        <div style={{position: 'absolute', left: 60, top: 96, width: 740, height: 480}}>
          <Bones bones={bones} bw={740} t={t} each />
        </div>
      </Glass>
      <div style={{position: 'absolute', top: 1300, width: W, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${badge}) rotate(-3deg)`, padding: '18px 40px', borderRadius: 999, background: C.red, fontFamily: F.display, fontWeight: 700, fontSize: 50, color: 'white', boxShadow: `0 16px 50px ${C.red}88`}}>
          BANDS OUT OF SYNC
        </div>
      </div>
      <Caption words={['Every', 'bone', 'shines', 'alone.']} hi={[3]} start={sec(3.0)} y={1470} />
      <Widgy x={150} y={1760} size={140} mood="o" look={1} rot={0.1} />
    </SceneIn>
  );
};

const Code2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = pop(f, sec(2.0));
  const tt = Math.max(0, t - 2.2);
  const show = ease(f, sec(4.6), 12);
  const LW = 640;
  const bones = [0, 1, 2].flatMap((i) => rowBones(i * 112, LW, 80, i));
  const rows = [['Mira Lane', 'New photo from the lake', '#FF9F43'], ['Theo Park', 'Shipped v2.0 today', '#3DDC97'], ['Juno Cole', 'Coffee later?', '#FF4D8D']];
  return (
    <SceneIn>
      <Backdrop tint={[C.violet, C.green, C.cyan]} />
      <Title text="2. One mask, whole list" accent="One" y={150} size={72} />
      <CodeCard tokens={T.code2} y={270} hl={[6, 7]} file="feed_page.dart" fs={31} />
      <Glass x={70} y={1010} w={940} h={410} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>
        <div style={{position: 'absolute', left: 60, top: 40, width: LW, height: 330}}>
          <Bones bones={bones} bw={LW} t={tt} opacity={1 - show} />
          {rows.map(([n, s, c], i) => (
            <div key={i} style={{position: 'absolute', left: 0, top: i * 112, display: 'flex', alignItems: 'center', gap: 24, opacity: show, fontFamily: F.ui, color: 'white'}}>
              <span style={{width: 80, height: 80, borderRadius: 40, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 34, color: C.ink}}>{n[0]}</span>
              <div>
                <div style={{fontWeight: 600, fontSize: 32}}>{n}</div>
                <div style={{fontSize: 26, color: C.dim}}>{s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', right: 50, top: 40, fontFamily: F.mono, fontSize: 30, color: C.dim, textAlign: 'right'}}>
          _loading<br /><span style={{color: show > 0.5 ? C.amber : C.green}}>{String(show <= 0.5)}</span>
        </div>
      </Glass>
      <Caption words={['One', 'band', 'for', 'every', 'bone.']} hi={[0]} start={sec(2.4)} y={1450} />
      <Widgy x={150} y={1760} size={130} look={1} />
    </SceneIn>
  );
};

export const EP09_SCENES: [React.FC, number][] = [[Hook, 4.4], [Code1, 6.0], [Trap, 4.6], [Code2, 6.0], [() => <Ending num={NUM} />, 3.4]];

export const Ep09: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {EP09_SCENES.map(([S, d], i) => {
        const el = <Sequence key={i} from={from} durationInFrames={sec(d)}><S /></Sequence>;
        from += sec(d);
        return el;
      })}
    </AbsoluteFill>
  );
};
export const EP09_FRAMES = EP09_SCENES.reduce((a, [, d]) => a + sec(d), 0);

/** Instagram cover (1080x1920, key content inside the 3:4 grid crop) */
export const Cover09: React.FC = () => {
  const w = 780;
  const bones = postBones(0, w).map((b) => (b.h === 190 ? {...b, h: 250} : b)).concat(rowBones(380, w, 80, 2));
  return (
    <Cover num={NUM} line1="Skeleton" accent="shimmer" badge="ShaderMask + srcATop">
      <Glass x={110} y={700} w={860} h={560}>
        <div style={{position: 'absolute', left: 40, top: 40, width: w, height: 480}}>
          {/* frozen at the moment the band is mid-card */}
          <Bones bones={bones} bw={w} t={PERIOD * 0.52} />
        </div>
      </Glass>
    </Cover>
  );
};

import {interpolate, spring, Easing} from 'remotion';
import {FPS} from './theme';

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** springy 0→1 starting at frame `start` */
export const pop = (frame: number, start: number, damping = 13, stiffness = 140) =>
  spring({frame: frame - start, fps: FPS, config: {damping, stiffness, mass: 0.8}});

/** eased 0→1 between frames */
export const ease = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

export const sec = (s: number) => Math.round(s * FPS);

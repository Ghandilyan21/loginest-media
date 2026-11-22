import sys, math, random
import cairo
import render as R
import ep_typing as E
import ep_stories as ST
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, font, text_w, draw_text, limb,
                    caption, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

HEART_RED = "#FF3040"
LIFE = 0.9

def elastic_out(x, period=0.4):
    if x <= 0: return 0.0
    if x >= 1: return 1.0
    s = period / 4
    return 2 ** (-10 * x) * math.sin((x - s) * 2 * math.pi / period) + 1

def heart_path(ctx, x, y, s):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    ctx.move_to(0, 0.38)
    ctx.curve_to(-0.06, 0.32, -0.5, 0.06, -0.5, -0.18)
    ctx.curve_to(-0.5, -0.45, -0.18, -0.56, 0, -0.3)
    ctx.curve_to(0.18, -0.56, 0.5, -0.45, 0.5, -0.18)
    ctx.curve_to(0.5, 0.06, 0.06, 0.32, 0, 0.38)
    ctx.close_path(); ctx.restore()

def heart(ctx, x, y, size, v, c=HEART_RED):
    """v: 0..1 life of the heart (pop, float up, fade)."""
    if v < 0 or v > 1: return
    pop = elastic_out(min(1, v * 2))
    a = 1 if v < 0.5 else 2 - v * 2
    yy = y - v * size * 0.75
    ctx.save(); ctx.translate(x, yy); ctx.scale(max(pop, 0.001), max(pop, 0.001))
    heart_path(ctx, 0, 6, size); col(ctx, INK, 0.35 * a); ctx.fill()
    heart_path(ctx, 0, 0, size); col(ctx, c, a); ctx.fill()
    ctx.restore()

def tap(ctx, x, y, t, tt):
    """double-tap ripple: two pulses at tt-0.16 and tt."""
    for t0 in (tt - 0.16, tt):
        u = (t - t0) / 0.3
        if 0 <= u <= 1:
            circle(ctx, x, y, 30 + 40 * u); col(ctx, WHITE, 0.6 * (1 - u)); ctx.set_line_width(6); ctx.stroke()
            circle(ctx, x, y, 26); col(ctx, WHITE, 0.85 * (1 - u)); ctx.fill()

def photo(ctx, x, y, w, h, t, idx=0):
    ctx.save(); rrect(ctx, x, y, w, h, 0); ctx.clip()
    ST.story_bg(ctx, x, y, w, h, idx, t)
    ctx.restore()

def hearts_at(ctx, t, taps, size):
    for (tt, hx, hy) in taps:
        heart(ctx, hx, hy, size, (t - tt) / LIFE)
    for (tt, hx, hy) in taps:
        tap(ctx, hx, hy, t, tt)

def post_phone(ctx, t, x, y, s, taps):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2 + 12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2 + 18, 18, pw - 36, ph - 36, 54); ctx.clip()
    ctx.rectangle(-pw/2, 0, pw, ph); col(ctx, WHITE); ctx.fill()
    rrect(ctx, -60, 30, 120, 24, 12); col(ctx, "#111111"); ctx.fill()
    circle(ctx, -210, 130, 30); col(ctx, CORAL); ctx.fill()
    font(ctx, 30); draw_text(ctx, "mira.codes", -165, 141, INK, anchor="l")
    px, py, pw2, ph2 = -pw/2 + 18, 180, pw - 36, 520
    photo(ctx, px, py, pw2, ph2, t, 1)
    ctx.save(); ctx.rectangle(px, py, pw2, ph2); ctx.clip()
    hearts_at(ctx, t, [(tt, hx, hy) for (tt, hx, hy) in taps], 170)
    ctx.restore()
    liked = any(t >= tt for (tt, _, _) in taps)
    lp = eob(prog(t, min([tt for (tt, _, _) in taps] or [99]), 0.3))
    ctx.save(); ctx.translate(-215, 760); ctx.scale(1 + 0.25 * math.sin(lp * math.pi), 1 + 0.25 * math.sin(lp * math.pi))
    heart_path(ctx, 0, 0, 64)
    if liked: col(ctx, HEART_RED); ctx.fill()
    else: col(ctx, INK); ctx.set_line_width(5); ctx.stroke()
    ctx.restore()
    circle(ctx, -125, 760, 24); col(ctx, INK); ctx.set_line_width(5); ctx.stroke()
    ctx.move_to(-55, 740); ctx.line_to(-5, 760); ctx.line_to(-55, 780); ctx.close_path(); col(ctx, INK); ctx.stroke()
    font(ctx, 30); draw_text(ctx, f"{1204 + (1 if liked else 0):,} likes", -240, 840, INK, anchor="l")
    font(ctx, 28, bold=False); draw_text(ctx, "sunset over the lake", -240, 885, "#555555", anchor="l")
    ctx.restore(); ctx.restore()

# ---------- scenes ----------
def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #6", W/2, 200, "#C3B8FF")
    title(ctx, t, "DOUBLE-TAP HEART", y=290, c=WHITE, size=72)
    taps = [(1.0, -120, 330), (2.1, 130, 520), (3.1, -30, 420)]
    post_phone(ctx, t, W/2, 380, eob(prog(t, 0, 0.5)) * 0.98, taps)
    caption(ctx, t, ["The", "heart", "pops", "right", "where", "you", "tap"], {4}, y=1560, t0=0.6)

def s2(ctx, t):  # the trap
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "THE TRAP", y=260, c=RED, size=72)
    font(ctx, 38, "DejaVu Sans Mono", True)
    rrect(ctx, 90, 330, 900, 150, 26); col(ctx, "#221B52"); ctx.fill()
    draw_text(ctx, "onDoubleTap: () => _showHeart(),", 125, 395, WHITE, anchor="l")
    font(ctx, 32, "DejaVu Sans Mono", False)
    draw_text(ctx, "// ...but where was the finger?", 125, 448, "#7C74B0", anchor="l")
    x0, y0, w, h = 140, 560, 800, 800
    rrect(ctx, x0 + 12, y0 + 14, w, h, 40); col(ctx, "#07051A"); ctx.fill()
    ctx.save(); rrect(ctx, x0, y0, w, h, 40); ctx.clip()
    photo(ctx, x0, y0, w, h, t, 2)
    for (tt, fx, fy) in ((0.8, x0 + 170, y0 + 190), (2.2, x0 + 620, y0 + 600)):
        heart(ctx, x0 + w/2, y0 + h/2, 230, (t - tt) / LIFE)
        tap(ctx, fx, fy, t, tt)
    ctx.restore()
    q = eob(prog(t, 1.4, 0.35))
    if q > 0:
        ctx.save(); ctx.translate(W/2, y0 + h + 10); ctx.rotate(-0.03); ctx.scale(q, q)
        font(ctx, 46); bw = text_w(ctx, "ALWAYS IN THE CENTER") + 60
        rrect(ctx, -bw/2, -46, bw, 92, 46); col(ctx, RED); ctx.fill()
        draw_text(ctx, "ALWAYS IN THE CENTER", 0, 16, WHITE)
        ctx.restore()
    caption(ctx, t, ["onDoubleTap", "has", "no", "position"], {3}, y=1600, t0=1.8)

CODE1 = [
    "GestureDetector(",
    "  onDoubleTapDown: (d) =>",
    "      _tapPos = d.localPosition,",
    "  onDoubleTap: () => setState(",
    "    () => _hearts.add(_tapPos),",
    "  ),",
    "  child: Stack(children: [",
    "    photo,",
    "    for (final p in _hearts) Heart(p),",
    "  ]),",
    ")",
]
CODE2 = [
    "// v: controller value, 0 -> 1",
    "final pop = Curves.elasticOut",
    "    .transform(min(1, v * 2));",
    "return Positioned(",
    "  left: at.dx - 40,",
    "  top: at.dy - 40 - v * 60,",
    "  child: Opacity(",
    "    opacity: v < .5 ? 1 : 2 - v * 2,",
    "    child: Transform.scale(",
    "      scale: pop,",
    "      child: const Icon(",
    "        Icons.favorite,",
    "        color: Colors.red,",
    "        size: 80,",
    "      ),",
    "    ),",
    "  ),",
    ");",
]

def s3(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. THE FIX: onDoubleTapDown", y=220, size=52)
    code_card(ctx, t, CODE1, 280, 860, "heart_photo.dart", t0=0.3, step=0.15, fs=36, hl=(1, 2))
    q = eob(prog(t, 2.2, 0.4))
    if q > 0:
        x0, y0, w, h = 240, 1190, 600, 380
        ctx.save(); ctx.translate(W/2, y0 + h/2); ctx.scale(q, q); ctx.translate(-W/2, -(y0 + h/2))
        ctx.save(); rrect(ctx, x0, y0, w, h, 30); ctx.clip()
        photo(ctx, x0, y0, w, h, t, 2)
        hearts_at(ctx, t, [(2.9, x0 + 130, y0 + 120), (3.8, x0 + 450, y0 + 260), (4.6, x0 + 300, y0 + 160)], 130)
        ctx.restore(); ctx.restore()
    caption(ctx, t, ["Now", "it", "lands", "under", "the", "finger"], {2}, y=1680, t0=2.6)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. POP, FLOAT, FADE", y=190, size=58)
    code_card(ctx, t, CODE2, 240, 1240, "heart.dart", t0=0.3, step=0.11, fs=34, hl=(1, 2))
    # big demo heart on the right, looping
    if t > 2.4:
        v = ((t - 2.4) % 1.3) / LIFE
        heart(ctx, 840, 1260, 220, v)
    caption(ctx, t, ["elasticOut", "=", "the", "pop"], {3}, y=1650, t0=2.6)

def s5(ctx, t):  # spam montage
    punch(ctx, t)
    bg_grid(ctx)
    x0, y0, w, h = 90, 380, 900, 1000
    rrect(ctx, x0 + 12, y0 + 14, w, h, 44); col(ctx, "#07051A"); ctx.fill()
    ctx.save(); rrect(ctx, x0, y0, w, h, 44); ctx.clip()
    photo(ctx, x0, y0, w, h, t, 0)
    r = random.Random(11)
    taps = [(0.3 + i * 0.13, x0 + r.uniform(120, w - 120), y0 + r.uniform(150, h - 150)) for i in range(18)]
    hearts_at(ctx, t, taps, r.choice([150]))
    ctx.restore()
    title(ctx, t, "NOW GO SPAM IT", y=280, c=YEL, size=72)
    caption(ctx, t, ["Every", "tap,", "its", "own", "heart"], {4}, y=1560, t0=0.4)

def s6(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 4.4), (s2, 4.4), (s3, 5.6), (s4, 5.2), (s5, 3.0), (s6, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

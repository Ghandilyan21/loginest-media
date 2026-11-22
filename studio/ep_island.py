import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, font, text_w, draw_text, limb,
                    caption, office, desk, laptop, dev, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

SMALL = (120, 36, 18)
MUSIC = (360, 84, 32)
TIMER = (300, 70, 30)
ORANGE = "#FF9F0A"

def lerp3(a, b, x): return tuple(a[i] + (b[i] - a[i]) * x for i in range(3))

def music_content(ctx, t, a):
    # laid out in a fixed 360x84 box centred at 0,0
    if a <= 0: return
    ctx.push_group()
    rrect(ctx, -165, -30, 60, 60, 14); col(ctx, CORAL); ctx.fill()
    circle(ctx, -135, 0, 14); col(ctx, YEL); ctx.fill()
    font(ctx, 17, bold=False); draw_text(ctx, "Now playing", -90, -6, "#9A9A9A", anchor="l")
    font(ctx, 22); draw_text(ctx, "Midnight Code", -90, 20, WHITE, anchor="l")
    for i in range(6):
        hgt = 10 + 22 * abs(math.sin(t * 5 + i * 1.3))
        rrect(ctx, 100 + i * 12, -hgt/2, 7, hgt, 3.5); col(ctx, GREEN); ctx.fill()
    ctx.pop_group_to_source(); ctx.paint_with_alpha(a)

def timer_content(ctx, t, a):
    if a <= 0: return
    ctx.push_group()
    ctx.set_line_width(6)
    circle(ctx, -115, 0, 20); col(ctx, ORANGE, 0.3); ctx.stroke()
    ctx.new_sub_path(); ctx.arc(-115, 0, 20, -math.pi/2, -math.pi/2 + 2*math.pi*0.72)
    col(ctx, ORANGE); ctx.stroke()
    secs = max(0, 299 - int(t))
    font(ctx, 30); draw_text(ctx, f"{secs//60:02d}:{secs%60:02d}", 90, 11, ORANGE, anchor="r")
    ctx.pop_group_to_source(); ctx.paint_with_alpha(a)

def island(ctx, cx, cy, S, dims, t, music_a=0.0, timer_a=0.0, clip=True, overflow=False):
    w, h, r = dims
    ctx.save(); ctx.translate(cx, cy); ctx.scale(S, S)
    rrect(ctx, -w/2, -h/2, w, h, r); col(ctx, "#000000"); ctx.fill()
    if clip:
        ctx.save(); rrect(ctx, -w/2, -h/2, w, h, r); ctx.clip()
    if not clip: ctx.save(); ctx.translate(-w/2 + 180, 0)
    music_content(ctx, t, music_a); timer_content(ctx, t, timer_a)
    if not clip: ctx.restore()
    if clip: ctx.restore()
    if overflow:
        sx = w/2 - 2
        ctx.save(); ctx.rectangle(sx, -h/2, 16, h); ctx.clip()
        col(ctx, YEL); ctx.paint()
        for k in range(-6, 12):
            ctx.move_to(sx + k*10, -h/2); ctx.line_to(sx + k*10 + h, h/2); col(ctx, "#000000"); ctx.set_line_width(5); ctx.stroke()
        ctx.restore()
    ctx.restore()

def seq_state(t):
    """small -> music -> small -> timer -> small ... returns dims, music_a, timer_a"""
    keys = [(0.0, SMALL, 0, 0), (0.6, MUSIC, 1, 0), (2.0, SMALL, 0, 0), (2.6, TIMER, 0, 1), (3.9, SMALL, 0, 0)]
    cur = keys[0]
    for k in keys:
        if t >= k[0]: cur_i = keys.index(k)
    i = cur_i
    t0, dims, ma, ta = keys[i]
    prev = keys[i-1] if i > 0 else keys[0]
    p = eob(clamp((t - t0) / 0.45))
    d = lerp3(prev[1], dims, p)
    fade = clamp((t - t0 - 0.12) / 0.2)
    m = ma * fade + prev[2] * (1 - clamp((t - t0) / 0.12))
    tm = ta * fade + prev[3] * (1 - clamp((t - t0) / 0.12))
    return d, max(0, m), max(0, tm)

def phone(ctx, t, x, y, s):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2+12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2+18, 18, pw-36, ph-36, 54); ctx.clip()
    g = cairo.LinearGradient(0, 0, 0, ph)
    g.add_color_stop_rgba(0, *hexc("#3A5BD9")); g.add_color_stop_rgba(1, *hexc("#B04ACB"))
    ctx.rectangle(-pw/2, 0, pw, ph); ctx.set_source(g); ctx.fill()
    font(ctx, 150, bold=True); draw_text(ctx, "9:41", 0, 400, WHITE)
    font(ctx, 34, bold=False); draw_text(ctx, "Sunday, 22 November", 0, 200, WHITE)
    d, m, tm = seq_state(t)
    island(ctx, 0, 70, 1.2, d, t, m, tm)
    ctx.restore(); ctx.restore()

# ---------- scenes ----------
def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #5", W/2, 200, "#C3B8FF")
    title(ctx, t, "DYNAMIC ISLAND", y=290, c=WHITE, size=72)
    phone(ctx, t, W/2, 380, eob(prog(t, 0, 0.5)) * 0.98)
    caption(ctx, t, ["The", "pill", "that", "grows.", "In Flutter."], {4}, y=1560, t0=0.6)

CODE1 = [
    "AnimatedContainer(",
    "  duration: Durations.medium4,",
    "  curve: Curves.easeOutBack,",
    "  width: _open ? 360 : 120,",
    "  height: _open ? 84 : 36,",
    "  decoration: BoxDecoration(",
    "    color: Colors.black,",
    "    borderRadius: BorderRadius.circular(",
    "      _open ? 32 : 18,",
    "    ),",
    "  ),",
    "  child: content,",
    ")",
]
CODE2 = [
    "AnimatedContainer(",
    "  // ...size + radius from step 1",
    "  clipBehavior: Clip.antiAlias,",
    "  child: OverflowBox(",
    "    maxWidth: 360,",
    "    maxHeight: 84,",
    "    child: AnimatedSwitcher(",
    "      duration: Durations.short4,",
    "      child: _open",
    "          ? const MusicRow()",
    "          : const SizedBox(),",
    "    ),",
    "  ),",
    ")",
]

def toggle_state(t, start, period=1.6):
    """alternates small <-> music, with easeOutBack"""
    if t < start: return SMALL, 0.0
    u = t - start; n = int(u // period); f = u % period
    opening = n % 2 == 0
    a, b = (SMALL, MUSIC) if opening else (MUSIC, SMALL)
    d = lerp3(a, b, eob(clamp(f / 0.45)))
    m = clamp((f - 0.12) / 0.2) if opening else 1 - clamp(f / 0.12)
    return d, m

def s2(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. ONE MORPHING CONTAINER", y=220, size=54)
    code_card(ctx, t, CODE1, 280, 940, "island.dart", t0=0.3, step=0.14, fs=36, hl=(2,))
    q = eob(prog(t, 2.3, 0.4))
    if q > 0:
        d, m = toggle_state(t, 2.6)
        island(ctx, W/2, 1390, 2.4 * q, d, t, m, 0)
    caption(ctx, t, ["easeOutBack", "gives", "the", "bounce"], {3}, y=1660, t0=2.5)

def s3(ctx, t):  # the bug
    punch(ctx, t, 0.08)
    bg_grid(ctx)
    title(ctx, t, "BUT THEN...", y=380, c=RED, size=80)
    # stuck mid-animation: narrow box, wide content, no clip
    p = eob(prog(t, 0.3, 0.6))
    d = lerp3(SMALL, (230, 70, 28), p)
    shake = math.sin(t * 50) * 6 if t > 0.9 else 0
    island(ctx, W/2 - 60 + shake, 900, 2.6, d, t, music_a=1.0 if t > 0.5 else 0, clip=False, overflow=t > 0.9)
    q = eob(prog(t, 1.1, 0.35))
    if q > 0:
        ctx.save(); ctx.translate(W/2, 1180); ctx.scale(q, q)
        font(ctx, 36, "DejaVu Sans Mono", True)
        s = "RIGHT OVERFLOWED BY 130 PIXELS"
        w = text_w(ctx, s) + 50
        rrect(ctx, -w/2, -40, w, 80, 16); col(ctx, YEL); ctx.fill()
        draw_text(ctx, s, 0, 12, "#000000")
        ctx.restore()
    caption(ctx, t, ["The", "content", "overflows", "mid-animation"], {2}, y=1560, t0=1.3)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. THE FIX", y=220, size=58)
    code_card(ctx, t, CODE2, 280, 990, "island.dart", t0=0.3, step=0.13, fs=36, hl=(2, 3))
    q = eob(prog(t, 2.6, 0.4))
    if q > 0:
        d, m = toggle_state(t, 2.9)
        island(ctx, W/2, 1430, 2.4 * q, d, t, m, 0)
    caption(ctx, t, ["OverflowBox", "+", "clip", "=", "clean"], {4}, y=1680, t0=2.8)

def s5(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 4.6), (s2, 5.8), (s3, 3.6), (s4, 6.4), (s5, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, ellipse, font, text_w, draw_text, limb,
                    caption, office, desk, laptop, dev, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

# album palettes: (main, accent, derived background)
ALB = [("#E2483D", "#FFB74D", "#B8322A"), ("#2D6CDF", "#7FD3FF", "#1F4FAE"),
       ("#1FA37A", "#C8F560", "#15805E"), ("#8E44AD", "#FF7EB6", "#6E2F8C")]
TITLES = [("Sunset Drive", "The Lanterns"), ("Deep Blue", "Nova Kid"),
          ("Green Light", "Paper Moons"), ("Velvet", "Mira Lune")]

def rgb(h): return hexc(h)[:3]
def mix(a, b, x): return tuple(a[i] + (b[i]-a[i])*x for i in range(3))

def art(ctx, x, y, s, k):
    a, b, _ = ALB[k % 4]
    rrect(ctx, x, y, s, s, s*0.05); col(ctx, a); ctx.fill()
    ctx.save(); rrect(ctx, x, y, s, s, s*0.05); ctx.clip()
    if k % 4 == 0:
        circle(ctx, x+s*0.5, y+s*0.62, s*0.32); col(ctx, b); ctx.fill()
        for i in range(4): ctx.rectangle(x, y+s*(0.66+i*0.08), s, s*0.035); col(ctx, a); ctx.fill()
    elif k % 4 == 1:
        for i in range(5):
            circle(ctx, x+s*0.5, y+s*0.5, s*(0.45-i*0.09)); col(ctx, b if i % 2 == 0 else a); ctx.fill()
    elif k % 4 == 2:
        for i in range(6):
            ctx.move_to(x+s*i/5-s*0.2, y+s); ctx.line_to(x+s*i/5+s*0.2, y); ctx.set_line_width(s*0.06)
            col(ctx, b); ctx.stroke()
    else:
        ellipse(ctx, x+s*0.35, y+s*0.4, s*0.28, s*0.2); col(ctx, b); ctx.fill()
        ellipse(ctx, x+s*0.65, y+s*0.65, s*0.25, s*0.3); col(ctx, b, 0.6); ctx.fill()
    ctx.restore()

def player(ctx, t, x, y, s, k, sw, bgc):
    """k: current album idx, sw: 0..1 swipe to next, bgc: current bg rgb."""
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2+12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2+18, 18, pw-36, ph-36, 54); ctx.clip()
    g = cairo.LinearGradient(0, 0, 0, ph)
    g.add_color_stop_rgb(0, *bgc); g.add_color_stop_rgb(0.75, 0.07, 0.07, 0.07)
    ctx.rectangle(-pw/2, 0, pw, ph); ctx.set_source(g); ctx.fill()
    rrect(ctx, -60, 30, 120, 24, 12); col(ctx, "#111111"); ctx.fill()
    font(ctx, 26); draw_text(ctx, "NOW PLAYING", 0, 110, WHITE)
    A = 400
    for j, kk in ((0, k), (1, k+1)):
        ax = -A/2 + (j - eo(sw)) * (A + 80)
        rrect(ctx, ax+8, 170+14, A, A, 20); ctx.set_source_rgba(0, 0, 0, 0.35); ctx.fill()
        art(ctx, ax, 170, A, kk)
    ti, ar = TITLES[(k + (1 if sw > 0.5 else 0)) % 4]
    font(ctx, 40); draw_text(ctx, ti, -A/2, 660, WHITE, anchor="l")
    font(ctx, 30, bold=False); draw_text(ctx, ar, -A/2, 705, WHITE, anchor="l")
    rrect(ctx, -A/2, 760, A, 8, 4); col(ctx, WHITE, 0.3); ctx.fill()
    rrect(ctx, -A/2, 760, A*((t*0.15) % 1), 8, 4); col(ctx, WHITE); ctx.fill()
    circle(ctx, 0, 870, 56); col(ctx, WHITE); ctx.fill()
    ctx.move_to(-16, 845); ctx.line_to(26, 870); ctx.line_to(-16, 895); ctx.close_path(); col(ctx, INK); ctx.fill()
    for sx in (-1, 1):
        ctx.move_to(sx*130, 850); ctx.line_to(sx*160, 870); ctx.line_to(sx*130, 890); ctx.close_path()
        col(ctx, WHITE); ctx.fill()
    ctx.restore(); ctx.restore()

def song_state(t, start=0.6, period=1.5, swipe=0.35, fade=0.6):
    """returns k, swipe progress, bg color (fades after swipe)"""
    if t < start: return 0, 0.0, rgb(ALB[0][2])
    u = t - start
    n = int(u // period); f = u % period
    k = n
    sw = clamp((f - (period - swipe)) / swipe)
    # bg fades towards the new album during the first `fade` seconds after a switch
    prev, cur = rgb(ALB[(k-1) % 4][2]) if n > 0 else rgb(ALB[0][2]), rgb(ALB[k % 4][2])
    c = mix(prev, cur, eo(clamp(f / fade))) if n > 0 else cur
    return k, sw, c

# ---------- scenes ----------
def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #3", W/2, 200, "#C3B8FF")
    title(ctx, t, "COLORS FROM THE COVER", y=290, c=WHITE, size=66)
    k, sw, c = song_state(t, start=0.3, period=1.3)
    player(ctx, t, W/2, 380, eob(prog(t, 0, 0.5))*0.98, k, sw, c)
    caption(ctx, t, ["The", "background", "matches", "the", "cover.", "How?"], {5}, y=1560, t0=0.6)

def s2(ctx, t):  # reveal: built-in
    punch(ctx, t)
    bg_grid(ctx)
    title(ctx, t, "NO PACKAGE NEEDED", y=330, size=64)
    a = eob(prog(t, 0.2, 0.5))
    ctx.save(); ctx.translate(W/2, 760); ctx.scale(a, a)
    art(ctx, -190, -190, 380, 0)
    ctx.restore()
    # swatches pulled out of the cover
    for i, h in enumerate(("#B8322A", "#E2483D", "#FFB74D")):
        p = eob(prog(t, 0.9 + i*0.2, 0.45))
        if p <= 0: continue
        x = W/2 + (i-1)*230; y = 760 + 340*p
        rrect(ctx, x-80+8, y-60+10, 160, 120, 28); col(ctx, INK); ctx.fill()
        rrect(ctx, x-80, y-60, 160, 120, 28); col(ctx, h); ctx.fill()
    q = eob(prog(t, 1.8, 0.45))
    if q > 0:
        ctx.save(); ctx.translate(W/2, 1300); ctx.scale(q, q)
        font(ctx, 40, "DejaVu Sans Mono", True)
        s = "ColorScheme.fromImageProvider()"
        w = text_w(ctx, s) + 60
        rrect(ctx, -w/2+8, -50+10, w, 100, 24); col(ctx, INK); ctx.fill()
        rrect(ctx, -w/2, -50, w, 100, 24); col(ctx, "#221B52"); ctx.fill()
        draw_text(ctx, s, 0, 14, BLUE)
        ctx.restore()
    caption(ctx, t, ["Flutter", "has", "it", "built in"], {3}, y=1560, t0=2.2)

CODE1 = [
    "Future<void> _load(",
    "  ImageProvider img,",
    ") async {",
    "  final s = await ColorScheme",
    "      .fromImageProvider(provider: img);",
    "  setState(() => _bg = s.primary);",
    "}",
]
CODE2 = [
    "AnimatedContainer(",
    "  duration: Durations.long2,",
    "  decoration: BoxDecoration(",
    "    gradient: LinearGradient(",
    "      begin: Alignment.topCenter,",
    "      end: Alignment.bottomCenter,",
    "      colors: [_bg, Colors.black],",
    "    ),",
    "  ),",
    "  child: player,",
    ")",
]

def s3(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. READ THE COVER", y=300, size=58)
    code_card(ctx, t, CODE1, 380, 640, "player_page.dart", fs=36, hl=(3, 4))
    # cover -> color chip
    p = eob(prog(t, 2.4, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(W/2, 1200); ctx.scale(p, p)
        art(ctx, -260, -90, 180, 1)
        ctx.move_to(-50, 0); ctx.line_to(30, 0); ctx.move_to(5, -25); ctx.line_to(30, 0); ctx.line_to(5, 25)
        col(ctx, WHITE); ctx.set_line_width(10); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke()
        rrect(ctx, 80+8, -90+10, 180, 180, 30); col(ctx, INK); ctx.fill()
        rrect(ctx, 80, -90, 180, 180, 30); col(ctx, ALB[1][2]); ctx.fill()
        ctx.restore()
    caption(ctx, t, ["Image", "in,", "color out"], {2}, y=1560, t0=2.6)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. FADE, DON'T JUMP", y=230, size=58)
    code_card(ctx, t, CODE2, 290, 860, "player_page.dart", t0=0.3, step=0.17, fs=36, hl=(1,))
    q = eob(prog(t, 2.4, 0.4))
    if q > 0:
        k, sw, c = song_state(t, start=2.8, period=1.6)
        ctx.save(); ctx.translate(W/2, 1290); ctx.scale(q, q)
        g = cairo.LinearGradient(0, -120, 0, 120)
        g.add_color_stop_rgb(0, *c); g.add_color_stop_rgb(1, 0.07, 0.07, 0.07)
        rrect(ctx, -420, -110, 840, 220, 36); ctx.set_source(g); ctx.fill()
        ctx.save(); rrect(ctx, -420, -110, 840, 220, 36); ctx.clip()
        for j, kk in ((0, k), (1, k+1)):
            art(ctx, -380 + (j - eo(sw))*860, -80, 160, kk)
        ctx.restore()
        ti, ar = TITLES[(k + (1 if sw > 0.5 else 0)) % 4]
        font(ctx, 40); draw_text(ctx, ti, -180, -6, WHITE, anchor="l")
        font(ctx, 30, bold=False); draw_text(ctx, ar, -180, 40, WHITE, anchor="l")
        ctx.restore()
    caption(ctx, t, ["Smooth", "fade", "on", "every", "song"], {1}, y=1560, t0=2.6)

def s5(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 3.8), (s2, 4.0), (s3, 5.0), (s4, 6.6), (s5, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, ellipse, font, text_w, draw_text,
                    caption, office, desk, laptop, dev, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

N = 4
PALS = [("#FF9A62", "#C2366B"), ("#5EC8F2", "#3B4CCA"), ("#7EE0A1", "#1C8C6E"), ("#FFD45E", "#E2683C")]

def bars(ctx, x, y, w, idx, val, h=10, gap=10, track=(1, 1, 1, 0.35), fill=WHITE):
    sw = (w - gap*(N-1)) / N
    for i in range(N):
        v = 1 if i < idx else (val if i == idx else 0)
        bx = x + i*(sw+gap)
        rrect(ctx, bx, y, sw, h, h/2); ctx.set_source_rgba(*track); ctx.fill()
        if v > 0:
            rrect(ctx, bx, y, max(h, sw*v), h, h/2); col(ctx, fill); ctx.fill()

def story_bg(ctx, x, y, w, h, idx, t):
    a, b = PALS[idx % 4]
    g = cairo.LinearGradient(x, y, x, y+h)
    g.add_color_stop_rgba(0, *hexc(a)); g.add_color_stop_rgba(1, *hexc(b))
    ctx.rectangle(x, y, w, h); ctx.set_source(g); ctx.fill()
    circle(ctx, x + w*0.68, y + h*0.36 + math.sin(t*1.5)*8, w*0.14); col(ctx, "#FFF3C4", 0.9); ctx.fill()
    for k, (hh, c) in enumerate(((0.62, 0.25), (0.72, 0.4))):
        ctx.move_to(x, y+h)
        ctx.line_to(x, y+h*hh)
        ctx.curve_to(x+w*0.3, y+h*(hh-0.12), x+w*0.6, y+h*(hh+0.08), x+w, y+h*(hh-0.06))
        ctx.line_to(x+w, y+h); ctx.close_path(); col(ctx, INK, c); ctx.fill()

def story_phone(ctx, t, x, y, s, idx, val, extra=None):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2+12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2+18, 18, pw-36, ph-36, 54); ctx.clip()
    story_bg(ctx, -pw/2+18, 18, pw-36, ph-36, idx, t)
    bars(ctx, -pw/2+44, 70, pw-88, idx, val, h=9)
    circle(ctx, -pw/2+76, 132, 28); col(ctx, WHITE); ctx.fill()
    circle(ctx, -pw/2+76, 132, 23); col(ctx, CORAL); ctx.fill()
    font(ctx, 30); draw_text(ctx, "anna", -pw/2+118, 142, WHITE, anchor="l")
    font(ctx, 28, bold=False); draw_text(ctx, "2h", -pw/2+205, 142, WHITE, anchor="l")
    rrect(ctx, -60, 30, 120, 24, 12); col(ctx, "#111111"); ctx.fill()
    if extra: extra(ctx)
    ctx.restore(); ctx.restore()

# ---------- scenes ----------
def s1(ctx, t):  # hook: stories auto-advancing
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #2", W/2, 200, "#C3B8FF")
    title(ctx, t, "THOSE STORY BARS", y=290, c=WHITE, size=72)
    st = t * 1.2
    story_phone(ctx, t, W/2, 380, eob(prog(t, 0, 0.5))*0.98, int(st) % N, st % 1)
    caption(ctx, t, ["How", "do", "stories", "skip", "by", "themselves?"], {5}, y=1560, t0=0.6)

def s2(ctx, t):
    punch(ctx, t)
    office(ctx, t); dev(ctx, t, "happy"); desk(ctx); laptop(ctx)
    b = abs(math.sin(t*5))
    widgy(ctx, 860, 1212 - b*50, t=t, squash=(0.5 if b < 0.15 else -0.15), look=-1)
    p = eob(prog(t, 0.3, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(780, 540); ctx.scale(p, p)
        rrect(ctx, -170, -70, 340, 140, 40); col(ctx, INK); ctx.fill()
        rrect(ctx, -178, -78, 340, 140, 40); col(ctx, WHITE); ctx.fill()
        st = t*1.5
        bars(ctx, -150, -16, 284, int(st) % N, st % 1, h=16, gap=12, track=hexc("#D7DCE6"), fill=CORAL)
        ctx.restore()
    caption(ctx, t, ["One", "controller.", "One", "listener.", "Done."], {4})

CODE1 = [
    "_c = AnimationController(",
    "  vsync: this,",
    "  duration: const Duration(seconds: 5),",
    ")..addStatusListener((s) {",
    "  if (s == AnimationStatus.completed) {",
    "    _next(); // index++, forward(from: 0)",
    "  }",
    "});",
]
CODE2 = [
    "// inside AnimatedBuilder",
    "Row(children: [",
    "  for (var i = 0; i < count; i++)",
    "    Expanded(",
    "      child: LinearProgressIndicator(",
    "        value: i < index ? 1",
    "             : i == index ? _c.value",
    "             : 0,",
    "      ),",
    "    ),",
    "])",
]
CODE3 = [
    "GestureDetector(",
    "  onLongPressStart: (_) => _c.stop(),",
    "  onLongPressEnd: (_) => _c.forward(),",
    "  child: story,",
    ")",
]

def s3(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. ONE CONTROLLER = ONE STORY", y=300, size=50)
    code_card(ctx, t, CODE1, 380, 660, "stories_page.dart", fs=36, hl=(4, 5))
    widgy(ctx, 900, 1400 - abs(math.sin(t*5))*25, s=0.8, t=t, look=-1)
    caption(ctx, t, ["Finished?", "Jump", "to", "the", "next", "story"], {4}, y=1640, t0=2.2)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. EACH BAR IS JUST MATH", y=230, size=54)
    code_card(ctx, t, CODE2, 290, 900, "stories_page.dart", t0=0.3, step=0.2, fs=36, hl=(5, 6, 7))
    p = eob(prog(t, 2.8, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(W/2, 1350); ctx.scale(p, p)
        rrect(ctx, -400, -90, 800, 180, 40); col(ctx, WHITE); ctx.fill()
        st = max(0, t - 2.8) * 0.9
        idx, val = int(st) % N, st % 1
        bars(ctx, -350, -30, 700, idx, val, h=22, gap=16, track=hexc("#D7DCE6"), fill=CORAL)
        font(ctx, 28)
        sw = (700 - 16*3) / N
        for i in range(N):
            lab, c = ("1", GREEN) if i < idx else ((f"{val:.2f}", CORAL) if i == idx else ("0", "#8A93A6"))
            draw_text(ctx, lab, -350 + i*(sw+16) + sw/2, 50, c)
        ctx.restore()
    caption(ctx, t, ["Past", "=", "full,", "current = live,", "next", "=", "empty"], {3}, y=1650, t0=3.2, size=60)

def s5(ctx, t):  # bonus: hold to pause
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "BONUS: HOLD TO PAUSE", y=260, size=58)
    code_card(ctx, t, CODE3, 330, 520, "stories_page.dart", t0=0.2, step=0.15, fs=36, hl=(1, 2))
    # live demo: progress frozen while holding
    hold0, hold1 = 1.6, 3.2
    def st_of(tt):
        if tt < hold0: return tt
        if tt < hold1: return hold0
        return tt - (hold1 - hold0)
    st = st_of(t) * 0.5 + 0.2
    holding = hold0 <= t < hold1
    p = eob(prog(t, 0.8, 0.4))
    if p > 0:
        def extra(c):
            if holding:
                font(c, 44); draw_text(c, "PAUSED", 0, 330, WHITE, stroke=INK, sw=10)
        ctx.save(); ctx.translate(W/2, 930); ctx.scale(p*0.62, p*0.62); ctx.translate(-W/2, -930)
        story_phone(ctx, t, W/2, 930, 1.0, int(st) % N, st % 1, extra)
        ctx.restore()
        if holding:
            q = eob(prog(t, hold0, 0.25))
            circle(ctx, W/2 + 60, 1250, 60*q); col(ctx, WHITE, 0.45); ctx.fill()
            circle(ctx, W/2 + 60, 1250, 34*q); col(ctx, WHITE, 0.9); ctx.fill()
    caption(ctx, t, ["Hold", "=", "pause.", "Release", "=", "resume."], {2, 5}, y=1660, t0=0.6)

def s6(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 3.8), (s2, 3.2), (s3, 5.4), (s4, 7.2), (s5, 4.8), (s6, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

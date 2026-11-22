import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, font, text_w, draw_text, limb,
                    caption, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

CARDS = [
    ("Xamarin", "X", "support ended in 2024", ("#7D5BD0", "#3B2A7A")),
    ("jQuery Mobile", "jQ", "deprecated since 2021", ("#6B7A99", "#2F3A55")),
    ("Flutter", "F", "60 FPS + hot reload", ("#42B6F5", "#1B5FC9")),
]
LIKE_C, NOPE_C = "#3DDC84", "#FF4D6D"

def ein(x): return x ** 3

def swipe(t, t0, d, drag=0.6, fly=0.35, dist=260):
    """returns dx, dy for a card being dragged then flung in direction d."""
    if t < t0: return 0.0, 0.0
    u = t - t0
    if u < drag:
        x = d * dist * eo(u / drag)
    else:
        x = d * (dist + 1300 * ein(clamp((u - drag) / fly)))
    return x, -abs(x) * 0.06

def stamp(ctx, txt, c, x, y, a, rot):
    if a <= 0: return
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    font(ctx, 64); w = text_w(ctx, txt) + 50
    rrect(ctx, -w/2, -50, w, 100, 16); ctx.set_source_rgba(*hexc(c, a)); ctx.set_line_width(9); ctx.stroke()
    ctx.move_to(-w/2 + 25, 23); ctx.set_source_rgba(*hexc(c, a)); ctx.show_text(txt)
    ctx.restore()

def card(ctx, cx, cy, data, dx=0.0, dy=0.0, s=1.0, sign=1, pivot_y=0.0, ms=None):
    name, mono, bio, (c1, c2) = data
    w, h = 620, 860
    ang = dx / 600 * sign
    m = s if ms is None else ms
    ctx.save(); ctx.translate(cx + dx*m, cy + dy*m); ctx.scale(s, s)
    ctx.translate(0, pivot_y); ctx.rotate(ang); ctx.translate(0, -pivot_y)
    rrect(ctx, -w/2 + 10, -h/2 + 14, w, h, 44); ctx.set_source_rgba(0, 0, 0, 0.35); ctx.fill()
    g = cairo.LinearGradient(0, -h/2, 0, h/2)
    g.add_color_stop_rgba(0, *hexc(c1)); g.add_color_stop_rgba(1, *hexc(c2))
    rrect(ctx, -w/2, -h/2, w, h, 44); ctx.set_source(g); ctx.fill()
    circle(ctx, 0, -110, 170); col(ctx, WHITE, 0.18); ctx.fill()
    circle(ctx, 0, -110, 130); col(ctx, WHITE, 0.92); ctx.fill()
    font(ctx, 120 if len(mono) == 1 else 96); draw_text(ctx, mono, 0, -110 + 42, c2)
    font(ctx, 58); draw_text(ctx, name, -w/2 + 44, h/2 - 140, WHITE, anchor="l")
    font(ctx, 34, bold=False); draw_text(ctx, bio, -w/2 + 44, h/2 - 82, WHITE, anchor="l")
    stamp(ctx, "LIKE", LIKE_C, -150, -330, clamp(dx / 120), -0.3)
    stamp(ctx, "NOPE", NOPE_C, 150, -330, clamp(-dx / 120), 0.3)
    ctx.restore()

def finger(ctx, x, y, a=1.0):
    if a <= 0: return
    circle(ctx, x, y, 62); col(ctx, WHITE, 0.3*a); ctx.fill()
    circle(ctx, x, y, 34); col(ctx, WHITE, 0.9*a); ctx.fill()

# ---------- scenes ----------
SW = [(0.5, -1), (1.55, -1), (2.6, 1)]

def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #4", W/2, 200, "#C3B8FF")
    title(ctx, t, "SWIPE CARDS", y=290, c=WHITE, size=72)
    a = eob(prog(t, 0, 0.5))
    cy = 860
    # draw back-to-front: only cards not yet gone
    for i in reversed(range(3)):
        t0, d = SW[i]
        dx, dy = swipe(t, t0, d)
        if abs(dx) > 1500: continue
        depth = i - sum(1 for (tt, _) in SW[:i] if t > tt + 0.6)   # cards move up as top ones leave
        sc = (1 - 0.05 * depth) * 0.9 * a
        card(ctx, W/2, cy + 30 * depth, CARDS[i], dx, dy, s=sc)
        if depth == 0 and t >= t0 and t < t0 + 0.65:
            finger(ctx, W/2 + (dx + 170)*sc, cy + (dy + 120)*sc)
    # bottom buttons
    for x, c, lab in ((W/2 - 150, NOPE_C, "x"), (W/2 + 150, LIKE_C, "<3")):
        circle(ctx, x, 1360, 66*a); col(ctx, WHITE); ctx.fill()
        font(ctx, 52); draw_text(ctx, lab, x, 1378, c)
    m = eob(prog(t, 3.35, 0.4))
    if m > 0:
        card(ctx, W/2, 860, CARDS[2], 0, 0, s=0.6*m)
        ctx.save(); ctx.translate(W/2, 1100); ctx.rotate(-0.06); ctx.scale(m, m)
        font(ctx, 96); w = text_w(ctx, "IT'S A MATCH!") + 80
        rrect(ctx, -w/2 + 10, -80 + 12, w, 160, 40); col(ctx, INK); ctx.fill()
        rrect(ctx, -w/2, -80, w, 160, 40); col(ctx, YEL); ctx.fill()
        draw_text(ctx, "IT'S A MATCH!", 0, 34, INK)
        ctx.restore()
    caption(ctx, t, ["Swiping", "frameworks,", "dating-app", "style"], {2}, y=1590, t0=0.5)

CODE1 = [
    "GestureDetector(",
    "  onPanUpdate: (d) => setState(",
    "    () => _pos += d.delta,",
    "  ),",
    "  onPanEnd: _onRelease,",
    "  child: Transform.translate(",
    "    offset: _pos,",
    "    child: Transform.rotate(",
    "      angle: _pos.dx / 600,",
    "      child: card,",
    "    ),",
    "  ),",
    ")",
]
CODE2 = [
    "void _onRelease(DragEndDetails d) {",
    "  if (_pos.dx.abs() > 120) {",
    "    _flyOut(_pos.dx.sign);",
    "  } else {",
    "    _snapBack(); // to Offset.zero",
    "  }",
    "}",
]
CODE3 = [
    "onPanStart: (d) => _top =",
    "    d.localPosition.dy < cardH / 2,",
    "",
    "angle: _pos.dx / 600 * (_top ? 1 : -1),",
]

def s2(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. DRAG + TILT", y=220, size=58)
    code_card(ctx, t, CODE1, 280, 960, "swipe_card.dart", t0=0.3, step=0.14, fs=36, hl=(2, 8))
    q = eob(prog(t, 2.4, 0.4))
    if q > 0:
        dx = math.sin((t - 2.4) * 2.6) * 200
        card(ctx, W/2, 1440, CARDS[2], dx, -abs(dx)*0.05, s=0.3*q)
        finger(ctx, W/2 + dx*0.3, 1440 + 60, q)
    caption(ctx, t, ["Move", "it,", "tilt", "it", "by", "dx"], {2}, y=1720, t0=2.6)

def s3(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. FLY AWAY OR SNAP BACK", y=260, size=54)
    code_card(ctx, t, CODE2, 330, 620, "swipe_card.dart", t0=0.3, step=0.18, fs=36, hl=(1,))
    q = eob(prog(t, 1.8, 0.4))
    if q > 0:
        cy, s = 1250, 0.32
        # threshold lines
        for sx in (-1, 1):
            x = W/2 + sx * 120 * 1.6
            ctx.move_to(x, cy - 200); ctx.line_to(x, cy + 200)
            col(ctx, YEL, 0.8*q); ctx.set_line_width(5); ctx.set_dash([14, 10]); ctx.stroke(); ctx.set_dash([])
        font(ctx, 28); draw_text(ctx, "120", W/2 + 192, cy - 215, YEL); draw_text(ctx, "-120", W/2 - 192, cy - 215, YEL)
        u = t - 2.2
        if u < 0: dx = 0
        elif u < 0.6: dx = 70 * eo(u / 0.6)                  # short drag
        elif u < 1.0: dx = 70 * (1 - eob(clamp((u - 0.6) / 0.4)))  # snaps back
        elif u < 1.6: dx = 200 * eo((u - 1.0) / 0.6) * 1.0       # long drag
        else: dx = 200 + 1300 * ein(clamp((u - 1.6) / 0.35))
        card(ctx, W/2, cy, CARDS[2], dx, 0, s=s*q, ms=1.6)
        lab = ("snap back", NOPE_C) if 0.5 < u < 1.0 else (("fly out!", LIKE_C) if u > 1.45 else None)
        if lab:
            font(ctx, 44); draw_text(ctx, lab[0], W/2, cy + 220, lab[1], stroke=INK, sw=10)
    caption(ctx, t, ["Past", "the", "line?", "It's", "gone"], {4}, y=1620, t0=2.4)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "PRO TIP: WHERE YOU GRAB", y=260, size=54)
    code_card(ctx, t, CODE3, 330, 470, "swipe_card.dart", t0=0.3, step=0.2, fs=36, hl=(3,))
    q = eob(prog(t, 1.4, 0.4))
    if q > 0:
        dx = math.sin((t - 1.4) * 2.4) * 180
        s = 0.42
        for i, (x, top) in enumerate(((W/2 - 230, True), (W/2 + 230, False))):
            py = -230 if top else 230      # pivot near the finger
            sign = 1 if top else -1
            card(ctx, x, 1180, CARDS[2], dx, 0, s=s*q, sign=sign, pivot_y=py*0)
            finger(ctx, x + dx*s, 1180 + py*s, q)
            if q > 0.6: font(ctx, 38); draw_text(ctx, "grab top" if top else "grab bottom", x, 1450, WHITE, stroke=INK, sw=10)
    caption(ctx, t, ["Grab", "the", "bottom?", "Tilt", "flips"], {4}, y=1620, t0=1.8)

def s5(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 4.8), (s2, 5.8), (s3, 6.0), (s4, 5.4), (s5, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

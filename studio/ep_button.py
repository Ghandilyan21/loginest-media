import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, font, text_w, draw_text, limb,
                    caption, office, desk, laptop, dev, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

G_TOP, G_LIP = "#58CC02", "#46A302"

def press_at(t, period=1.1, start=0.4):
    """0 = up, 1 = fully pressed; repeated taps."""
    if t < start: return 0.0
    u = (t - start) % period
    if u < 0.08: return eo(u / 0.08)
    if u < 0.24: return 1.0
    if u < 0.40: return 1 - eo((u - 0.24) / 0.16)
    return 0.0

def chunky(ctx, cx, cy, w, h, press, label, lip=14, top=G_TOP, dark=G_LIP, r=22, fs=46, tc=WHITE):
    y0 = cy - h/2
    off = press * lip
    rrect(ctx, cx - w/2, y0 + lip, w, h, r); col(ctx, dark); ctx.fill()          # shadow (blur 0)
    rrect(ctx, cx - w/2, y0 + off, w, h, r); col(ctx, top); ctx.fill()          # button face
    rrect(ctx, cx - w/2 + 18, y0 + off + 10, w - 36, 10, 5); col(ctx, WHITE, 0.25); ctx.fill()
    font(ctx, fs); draw_text(ctx, label, cx, y0 + off + h/2 + fs*0.36, tc)

def finger(ctx, x, y, press):
    if press <= 0.02: return
    circle(ctx, x, y, 70*press); col(ctx, WHITE, 0.35); ctx.fill()
    circle(ctx, x, y, 38*press); col(ctx, WHITE, 0.85); ctx.fill()

def quiz_phone(ctx, t, x, y, s):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2+12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2+18, 18, pw-36, ph-36, 54); ctx.clip()
    ctx.rectangle(-pw/2, 0, pw, ph); col(ctx, WHITE); ctx.fill()
    rrect(ctx, -60, 30, 120, 24, 12); col(ctx, "#111111"); ctx.fill()
    # progress
    rrect(ctx, -200, 100, 420, 26, 13); col(ctx, "#E5E5E5"); ctx.fill()
    rrect(ctx, -200, 100, 290, 26, 13); col(ctx, G_TOP); ctx.fill()
    limb(ctx, -240, 102, -220, 124, 6, "#AFAFAF"); limb(ctx, -220, 102, -240, 124, 6, "#AFAFAF")
    font(ctx, 38); draw_text(ctx, "Pick the right word", -220, 210, "#3C3C3C", anchor="l")
    # answer tiles (chunky too)
    opts = [("hello", True), ("thanks", False), ("goodbye", False), ("please", False)]
    for i, (o, sel) in enumerate(opts):
        bx = -120 + (i % 2) * 250; by = 330 + (i // 2) * 160
        if sel: chunky(ctx, bx, by, 220, 110, 0, o, lip=8, top="#DDF4FF", dark="#84D8FF", r=20, fs=34, tc="#1899D6")
        else: chunky(ctx, bx, by, 220, 110, 0, o, lip=8, top=WHITE, dark="#E5E5E5", r=20, fs=34, tc="#4B4B4B")
    # feedback banner
    ctx.rectangle(-pw/2, 690, pw, 300); col(ctx, "#D7FFB8"); ctx.fill()
    font(ctx, 40); draw_text(ctx, "Nice!", -220, 760, G_LIP, anchor="l")
    p = press_at(t, start=0.7)
    chunky(ctx, 0, 860, 470, 100, p, "CONTINUE", lip=12, fs=40)
    ctx.restore(); ctx.restore()
    return p

# ---------- scenes ----------
def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #3", W/2, 200, "#C3B8FF")
    title(ctx, t, "THAT CHUNKY BUTTON", y=290, c=WHITE, size=72)
    s = eob(prog(t, 0, 0.5)) * 0.98
    p = quiz_phone(ctx, t, W/2, 380, s)
    finger(ctx, W/2 + 170*s, 380 + 860*s + 6, p)
    caption(ctx, t, ["Why", "does", "this", "button", "feel", "SO", "good?"], {5, 6}, y=1560, t0=0.6)

def label(ctx, txt, x, y, ax, ay, c=YEL, anchor="l"):
    font(ctx, 38); draw_text(ctx, txt, x, y, c, anchor=anchor, stroke=INK, sw=10)
    ctx.move_to(ax[0], ax[1]); ctx.line_to(ay[0], ay[1])
    col(ctx, c); ctx.set_line_width(5); ctx.set_dash([12, 10]); ctx.stroke(); ctx.set_dash([])
    circle(ctx, ay[0], ay[1], 9); col(ctx, c); ctx.fill()

def s2(ctx, t):  # anatomy
    punch(ctx, t)
    bg_grid(ctx)
    title(ctx, t, "THE SECRET", y=300, size=64)
    p = press_at(t, period=1.6, start=2.4)
    a = eob(prog(t, 0.2, 0.5))
    ctx.save(); ctx.translate(W/2, 900); ctx.scale(a, a); ctx.translate(-W/2, -900)
    chunky(ctx, W/2, 860, 720, 220, p, "CONTINUE", lip=60, r=50, fs=80)
    ctx.restore()
    if t > 0.8:
        label(ctx, "Container", 150, 640, (330, 655), (420, 770 + p*60))
    if t > 1.4:
        label(ctx, "BoxShadow, blur 0", 930, 1160, (760, 1120), (700, 1010), c="#9CFF6B", anchor="r")
    finger(ctx, W/2 + 260, 880 + p*60, p)
    caption(ctx, t, ["The", "3D", "part", "is", "just", "a", "shadow"], {6}, y=1520, t0=0.4)

CODE1 = [
    "AnimatedContainer(",
    "  duration: Durations.short2,",
    "  transform: Matrix4.translationValues(",
    "    0, _down ? 6 : 0, 0,",
    "  ),",
    "  decoration: BoxDecoration(",
    "    color: green,",
    "    borderRadius: BorderRadius.circular(16),",
    "    boxShadow: [",
    "      BoxShadow(",
    "        color: darkGreen,",
    "        offset: Offset(0, _down ? 0 : 6),",
    "      ),",
    "    ],",
    "  ),",
    ")",
]
CODE2 = [
    "GestureDetector(",
    "  onTapDown: (_) => _set(true),",
    "  onTapUp: (_) => _set(false),",
    "  onTapCancel: () => _set(false),",
    "  child: chunkyButton,",
    ")",
    "",
    "void _set(bool v) =>",
    "    setState(() => _down = v);",
]

def s3(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. PRESSED = SLIDE DOWN", y=200, size=54)
    code_card(ctx, t, CODE1, 250, 1180, "chunky_button.dart", t0=0.3, step=0.14, fs=34, hl=(3, 11))
    caption(ctx, t, ["Move", "down", "6,", "shadow", "shrinks", "6"], {1, 4}, y=1640, t0=2.6)

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. TRACK THE FINGER", y=260, size=58)
    code_card(ctx, t, CODE2, 320, 760, "chunky_button.dart", t0=0.3, step=0.18, fs=36, hl=(3,))
    q = eob(prog(t, 2.0, 0.4))
    if q > 0:
        p = press_at(t, period=1.0, start=2.4)
        ctx.save(); ctx.translate(W/2, 1250); ctx.scale(q, q); ctx.translate(-W/2, -1250)
        chunky(ctx, W/2, 1240, 560, 120, p, "CHECK", lip=16, fs=48)
        ctx.restore()
        finger(ctx, W/2 + 200, 1250 + p*16, p)
    caption(ctx, t, ["Forget", "onTapCancel", "and", "it", "gets", "stuck"], {5}, y=1580, t0=2.2, size=60)

def s5(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 3.6), (s2, 5.0), (s3, 6.0), (s4, 5.6), (s5, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

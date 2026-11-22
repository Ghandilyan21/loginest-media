import re, sys, math, random
import cairo
import render as R
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, ellipse, font, text_w, draw_text,
                    caption, office, desk, laptop, dev, widgy, badge, punch, limb,
                    YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)

PERIOD = 1.2
def dot_y(time, i, amp):
    t = (time / PERIOD - i * 0.2) % 1
    return -amp * math.sin(t * 2 * math.pi) if t < 0.5 else 0.0

def typing_dots(ctx, cx, cy, t, r=13, gap=40, amp=16, c="#8A93A6"):
    for i in range(3):
        circle(ctx, cx + (i - 1) * gap, cy + dot_y(t, i, amp), r); col(ctx, c); ctx.fill()

def bg_grid(ctx):
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgba(0, *hexc("#1B1546")); g.add_color_stop_rgba(1, *hexc("#0E0B26"))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    ctx.set_line_width(2); col(ctx, WHITE, 0.04)
    for gx in range(0, W, 60): ctx.move_to(gx, 0); ctx.line_to(gx, H)
    for gy in range(0, H, 60): ctx.move_to(0, gy); ctx.line_to(W, gy)
    ctx.stroke()

# ---------- phone chat mockup (generic, no brand) ----------
def phone(ctx, t, x, y, s=1.0):
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2 + 12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    rrect(ctx, -pw/2 + 18, 18, pw - 36, ph - 36, 54); col(ctx, "#EEF1F6"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2 + 18, 18, pw - 36, ph - 36, 54); ctx.clip()
    # header
    ctx.rectangle(-pw/2, 0, pw, 190); col(ctx, WHITE); ctx.fill()
    circle(ctx, -170, 120, 44); col(ctx, CORAL); ctx.fill()
    font(ctx, 44); draw_text(ctx, "A", -170, 136, WHITE)
    font(ctx, 38); draw_text(ctx, "Anna", -105, 112, INK, anchor="l")
    font(ctx, 30, bold=False)
    dots = "." * (int(t * 3) % 4)
    draw_text(ctx, "typing" + dots, -105, 156, BLUE, anchor="l")
    rrect(ctx, -60, 34, 120, 26, 13); col(ctx, "#111111"); ctx.fill()  # notch
    # bubbles
    def bubble(bx, by, w, h, c, txt, tc, left=True):
        rrect(ctx, bx, by, w, h, 34); col(ctx, c); ctx.fill()
        font(ctx, 32, bold=False); draw_text(ctx, txt, bx + 30, by + h/2 + 11, tc, anchor="l")
    bubble(-240, 250, 380, 84, WHITE, "coming tonight?", INK)
    bubble(-80, 360, 320, 84, BLUE, "yes! what time?", WHITE)
    bubble(-240, 470, 300, 84, WHITE, "let me check", INK)
    # typing bubble
    p = eob(prog(t, 0.3, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(-150, 640); ctx.scale(p*1.4, p*1.4)
        rrect(ctx, -70, -42, 160, 84, 42); col(ctx, WHITE); ctx.fill()
        typing_dots(ctx, 10, 6, t)
        ctx.restore()
    # input bar
    rrect(ctx, -240, 860, 400, 70, 35); col(ctx, WHITE); ctx.fill()
    circle(ctx, 210, 895, 36); col(ctx, BLUE); ctx.fill()
    ctx.restore(); ctx.restore()

# ---------- code card with Dart highlighting ----------
KW = {"late", "final", "const", "return", "this"}
TOK = re.compile(r"(//.*$|'[^']*'|\d+\.?\d*|\.\d+|[A-Za-z_]\w*|\s+|.)")
def dart_tokens(line):
    out = []
    for m in TOK.finditer(line):
        s = m.group(0)
        if s.startswith("//"): c = "#7C74B0"
        elif s.startswith("'"): c = "#A5E07A"
        elif re.match(r"^(\d|\.\d)", s): c = "#FFB86C"
        elif s in KW: c = "#FF79C6"
        elif s[0].isupper(): c = BLUE
        elif s in ("sin", "pi", "generate", "translate", "repeat"): c = "#C3B8FF"
        else: c = WHITE
        out.append((s, c))
    return out

def code_card(ctx, t, lines, y, h, fname, t0=0.4, step=0.22, fs=40, hl=()):
    rrect(ctx, 70, y + 12, 960, h, 36); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, 60, y, 960, h, 36); col(ctx, "#221B52"); ctx.fill()
    for i, c in enumerate((RED, YEL, GREEN)):
        circle(ctx, 120 + i*44, y + 52, 13); col(ctx, c); ctx.fill()
    font(ctx, 30, "DejaVu Sans Mono", False); draw_text(ctx, fname, 980, y + 62, "#8E86C9", anchor="r")
    font(ctx, fs, "DejaVu Sans Mono", True)
    ly = y + 150; lh = fs * 1.75
    for i, line in enumerate(lines):
        p = eo(prog(t, t0 + i*step, 0.3))
        if p <= 0: break
        if i in hl and t > t0 + len(lines)*step + 0.3:
            glow = 0.5 + 0.5*math.sin(t*6)
            rrect(ctx, 80, ly - fs*1.1, 920, fs*1.55, 12); col(ctx, YEL, 0.10 + 0.12*glow); ctx.fill()
        x = 100 + (1 - p) * 40
        ctx.save(); ctx.push_group()
        for (s, c) in dart_tokens(line):
            draw_text(ctx, s, x, ly, c, anchor="l"); x += text_w(ctx, s)
        ctx.pop_group_to_source(); ctx.paint_with_alpha(p); ctx.restore()
        ly += lh

def title(ctx, t, s, y=300, c=YEL, size=56):
    p = eob(prog(t, 0.05, 0.35))
    ctx.save(); ctx.translate(W/2, y - size*0.3); ctx.scale(p, p); ctx.translate(-W/2, -(y - size*0.3))
    font(ctx, size); draw_text(ctx, s, W/2, y, c, stroke=INK, sw=12)
    ctx.restore()

# ---------- scenes ----------
def s1(ctx, t):  # hook
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #1", W/2, 200, "#C3B8FF")
    title(ctx, t, "THOSE TYPING DOTS", y=290, c=WHITE, size=72)
    phone(ctx, t, W/2, 380, s=eob(prog(t, 0.0, 0.5)) * 0.98)
    caption(ctx, t, ["How", "do", "chat", "apps", "make", "typing dots?"], {5}, y=1560, t0=0.6)

CODE1 = [
    "late final c = AnimationController(",
    "  vsync: this,",
    "  duration: const Duration(",
    "    milliseconds: 1200,",
    "  ),",
    ")..repeat();",
]
CODE2 = [
    "// inside AnimatedBuilder > Row",
    "List.generate(3, (i) {",
    "  final t = (c.value - i * .2) % 1;",
    "  final y = t < .5",
    "      ? -10 * sin(t * 2 * pi)",
    "      : 0.0;",
    "  return Transform.translate(",
    "    offset: Offset(0, y),",
    "    child: const Dot(),",
    "  );",
    "})",
]

def s2(ctx, t):  # dev reaction
    punch(ctx, t)
    office(ctx, t); dev(ctx, t, "happy", wave=0.0); desk(ctx); laptop(ctx)
    b = abs(math.sin(t*5))
    widgy(ctx, 860, 1212 - b*50, t=t, squash=(0.5 if b < 0.15 else -0.15), look=-1)
    p = eob(prog(t, 0.3, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(790, 560); ctx.scale(p, p)
        rrect(ctx, -150, -70, 300, 140, 70); col(ctx, INK); ctx.fill()
        rrect(ctx, -158, -78, 300, 140, 70); col(ctx, WHITE); ctx.fill()
        ctx.move_to(-90, 58); ctx.line_to(-130, 110); ctx.line_to(-30, 60); ctx.fill()
        typing_dots(ctx, -8, -4, t, r=20, gap=62, amp=26, c=BLUE)
        ctx.restore()
    caption(ctx, t, ["Just", "ONE", "controller", "and", "a", "bit", "of", "math"], {1})

def s3(ctx, t):  # code 1
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. ONE LOOPING CONTROLLER", y=300, size=54)
    code_card(ctx, t, CODE1, 400, 560, "typing_dots.dart", hl=(5,))
    p = eob(prog(t, 3.2, 0.35))
    if p > 0:
        ctx.save(); ctx.translate(540, 1070); ctx.rotate(-0.04); ctx.scale(p, p)
        font(ctx, 40); w = text_w(ctx, "+ dispose() it later!") + 60
        rrect(ctx, -w/2, -44, w, 88, 44); col(ctx, RED); ctx.fill()
        draw_text(ctx, "+ dispose() it later!", 0, 14, WHITE)
        ctx.restore()
    widgy(ctx, 900, 1430 - abs(math.sin(t*5))*25, s=0.8, t=t, look=-1)
    caption(ctx, t, ["Loop", "it", "forever"], {2}, y=1650, t0=0.5)

def s4(ctx, t):  # code 2 + live preview
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. DELAY EACH DOT BY 0.2", y=230, size=54)
    code_card(ctx, t, CODE2, 300, 900, "typing_dots.dart", t0=0.3, step=0.2, fs=38, hl=(2,))
    # live preview strip
    py = 1370
    p = eob(prog(t, 2.6, 0.4))
    if p > 0:
        ctx.save(); ctx.translate(W/2, py); ctx.scale(p, p)
        rrect(ctx, -330, -95, 660, 190, 95); col(ctx, WHITE); ctx.fill()
        for i in range(3):
            x = (i - 1) * 140
            circle(ctx, x, 20 + dot_y(t, i, 40), 30); col(ctx, BLUE); ctx.fill()
        font(ctx, 26, "DejaVu Sans Mono", True)
        for i in range(3):
            draw_text(ctx, f"i={i}", (i - 1) * 140, 82, "#8A93A6")
        ctx.restore()
    caption(ctx, t, ["Same", "loop,", "shifted", "=", "a", "wave"], {5}, y=1670, t0=3.0)

def s5(ctx, t):  # CTA
    punch(ctx, t)
    g = cairo.RadialGradient(W/2, 820, 50, W/2, 820, 1100)
    g.add_color_stop_rgba(0, *hexc("#4B3AA8")); g.add_color_stop_rgba(1, *hexc("#15103A"))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    for i in range(14):
        a = i/14*2*math.pi + t*0.4
        ctx.move_to(W/2, 820); ctx.arc(W/2, 820, 1400, a, a+0.12); ctx.close_path()
        col(ctx, WHITE, 0.035); ctx.fill()
    font(ctx, 50); draw_text(ctx, "REBUILD IT IN FLUTTER", W/2, 330, "#C3B8FF")
    font(ctx, 76); draw_text(ctx, "WHICH APP IS NEXT?", W/2, 440, WHITE, stroke=INK, sw=14)
    b = abs(math.sin(t*5)); p = eob(prog(t, 0, 0.5))
    widgy(ctx, W/2 - 120, 1050 - b*50, s=1.6*p, t=t, squash=(0.5 if b < 0.15 else -0.15))
    q = eob(prog(t, 0.3, 0.4))
    if q > 0:
        ctx.save(); ctx.translate(W/2 + 230, 700); ctx.scale(q, q)
        rrect(ctx, -130, -60, 260, 120, 60); col(ctx, WHITE); ctx.fill()
        ctx.move_to(-80, 50); ctx.line_to(-130, 100); ctx.line_to(-20, 55); ctx.fill()
        typing_dots(ctx, 0, 0, t, r=17, gap=54, amp=22, c=BLUE)
        ctx.restore()
    caption(ctx, t, ["Comment", "an", "app,", "I'll", "rebuild", "it"], {0}, y=1380, t0=0.4)

R.SCENES = [(s1, 3.8), (s2, 3.4), (s3, 5.2), (s4, 7.6), (s5, 3.4)]

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

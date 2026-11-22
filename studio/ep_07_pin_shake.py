import sys, math
import cairo
import render as R
import ep_typing as E
from render import (W, H, col, hexc, clamp, prog, eo, eob, rrect, circle, font, text_w, draw_text, limb,
                    caption, widgy, punch, YEL, INK, BLUE, CORAL, RED, GREEN, WHITE)
from ep_typing import bg_grid, code_card, title

SHAKE_D = 0.5          # controller duration, seconds
PIN_RED = "#FF453A"

def shake_dx(v, amp=24):
    """Same math as the code on screen: sin(v*pi*8) * 24 * (1 - v)."""
    if v <= 0 or v >= 1: return 0.0
    return math.sin(v * math.pi * 8) * amp * (1 - v)

def shake_v(t, t0):
    return clamp((t - t0) / SHAKE_D)

def pin_dots(ctx, cx, cy, filled, dx=0.0, r=20, gap=74, c=WHITE, red=False):
    ctx.save(); ctx.translate(cx + dx, cy)
    for i in range(4):
        x = (i - 1.5) * gap
        circle(ctx, x, 0, r)
        if i < filled:
            col(ctx, PIN_RED if red else c); ctx.fill()
        else:
            col(ctx, c, 0.9); ctx.set_line_width(4); ctx.stroke()
    ctx.restore()

def haptic(ctx, cx, cy, t, t0, w=180):
    """little vibration arcs either side of the dots."""
    u = (t - t0) / 0.45
    if not (0 <= u <= 1): return
    a = 1 - u
    ctx.set_line_width(7); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    for side in (-1, 1):
        for k in range(3):
            rr = 30 + k * 22 + u * 30
            x = cx + side * w
            ctx.new_sub_path()
            if side > 0: ctx.arc(x, cy, rr, -0.6, 0.6)
            else: ctx.arc(x, cy, rr, math.pi - 0.6, math.pi + 0.6)
            col(ctx, YEL, a * (1 - k * 0.25)); ctx.stroke()

KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""]

def lock_phone(ctx, t, x, y, s, events):
    """events: list of (t_fill_start, t_shake). Dots fill over 0.8s, then shake & clear."""
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    pw, ph = 560, 980
    rrect(ctx, -pw/2 + 12, 14, pw, ph, 70); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, -pw/2, 0, pw, ph, 70); col(ctx, "#111111"); ctx.fill()
    ctx.save(); rrect(ctx, -pw/2 + 18, 18, pw - 36, ph - 36, 54); ctx.clip()
    g = cairo.LinearGradient(0, 0, 0, ph)
    g.add_color_stop_rgba(0, *hexc("#3B2C8F")); g.add_color_stop_rgba(1, *hexc("#0F2A4A"))
    ctx.rectangle(-pw/2, 0, pw, ph); ctx.set_source(g); ctx.fill()
    rrect(ctx, -60, 34, 120, 26, 13); col(ctx, "#111111"); ctx.fill()
    # padlock
    rrect(ctx, -22, 100, 44, 36, 8); col(ctx, WHITE); ctx.fill()
    ctx.new_sub_path(); ctx.arc(0, 100, 14, math.pi, 0); col(ctx, WHITE); ctx.set_line_width(6); ctx.stroke()
    font(ctx, 34, bold=False); draw_text(ctx, "Enter Passcode", 0, 200, WHITE)
    # state
    filled, dx, red, pressed = 0, 0.0, False, None
    for (tf, ts) in events:
        if t >= tf:
            n = min(4, int((t - tf) / 0.2) + 1)
            if t < ts + SHAKE_D:
                filled = n; red = t >= ts
                if t < ts:
                    k = int((t - tf) / 0.2); fr = (t - tf) / 0.2 - k
                    if fr < 0.5 and k < 4: pressed = [1, 5, 9, 2][k]
            else:
                filled = 0
            dx = shake_dx(shake_v(t, ts), 34) if ts <= t < ts + SHAKE_D else dx
    pin_dots(ctx, 0, 290, filled, dx, r=16, gap=58, red=red)
    if red:
        font(ctx, 26, bold=False); draw_text(ctx, "Wrong passcode", dx, 352, "#FFB3AD")
    # keypad
    for i, k in enumerate(KEYS):
        if not k: continue
        kx = (i % 3 - 1) * 150; ky = 470 + (i // 3) * 125
        circle(ctx, kx, ky, 52)
        col(ctx, WHITE, 0.55 if pressed == int(k) else 0.16); ctx.fill()
        font(ctx, 46, bold=False); draw_text(ctx, k, kx, ky + 16, WHITE)
    ctx.restore(); ctx.restore()

# ---------- scenes ----------
def s1(ctx, t):
    punch(ctx, t)
    bg_grid(ctx)
    font(ctx, 40); draw_text(ctx, "REBUILD IT IN FLUTTER  #7", W/2, 200, "#C3B8FF")
    title(ctx, t, "WRONG PIN SHAKE", y=290, c=WHITE, size=72)
    a = eob(prog(t, 0, 0.5))
    lock_phone(ctx, t, W/2, 370, 0.98 * a, [(0.5, 1.4), (2.3, 3.2)])
    caption(ctx, t, ["Wrong", "PIN?", "Make", "it", "SHAKE"], {4}, y=1560, t0=0.6)

CODE1 = [
    "// _shake: 500 ms controller",
    "AnimatedBuilder(",
    "  animation: _shake,",
    "  builder: (context, child) {",
    "    final v = _shake.value;",
    "    final dx = sin(v * pi * 8)",
    "        * 24 * (1 - v);",
    "    return Transform.translate(",
    "      offset: Offset(dx, 0),",
    "      child: child,",
    "    );",
    "  },",
    "  child: const PinDots(),",
    ")",
]

def s2(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "1. SIN WAVE x DECAY", y=200, size=58)
    code_card(ctx, t, CODE1, 260, 1050, "pin_shake.dart", t0=0.3, step=0.13, fs=36, hl=(5, 6))
    q = eob(prog(t, 2.3, 0.4))
    if q > 0:
        x0, y0, w, h = 140, 1350, 800, 200
        ctx.save(); ctx.translate(W/2, y0 + h/2); ctx.scale(q, q); ctx.translate(-W/2, -(y0 + h/2))
        rrect(ctx, x0 + 10, y0 + 12, w, h, 34); col(ctx, "#07051A"); ctx.fill()
        rrect(ctx, x0, y0, w, h, 34); col(ctx, "#2E2470"); ctx.fill()
        # loop: shake every 1.2 s
        lt = (t - 2.7) % 1.2 if t > 2.7 else -1
        v = clamp(lt / SHAKE_D) if lt >= 0 else 0
        dx = shake_dx(v, 24 * 2.2)
        pin_dots(ctx, W/2 - 90, y0 + 100, 4, dx, r=24, gap=80, red=(0 < v < 1))
        # amplitude envelope graph on the right
        gx, gy, gw, gh = x0 + 560, y0 + 40, 200, 120
        ctx.set_line_width(4)
        for k in range(101):
            u = k / 100
            (ctx.move_to if k == 0 else ctx.line_to)(gx + u * gw, gy + gh/2 - math.sin(u*math.pi*8)*(gh*0.45)*(1-u))
        col(ctx, "#8E86C9"); ctx.stroke()
        if 0 < v < 1:
            circle(ctx, gx + v * gw, gy + gh/2 - math.sin(v*math.pi*8)*(gh*0.45)*(1-v), 9); col(ctx, YEL); ctx.fill()
        ctx.restore()
    caption(ctx, t, ["The", "decay", "makes", "it", "settle"], {1}, y=1700, t0=3.0)

def s3(ctx, t):  # the trap
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "THE TRAP", y=250, c=RED, size=72)
    rrect(ctx, 90, 320, 900, 160, 26); col(ctx, "#221B52"); ctx.fill()
    font(ctx, 40, "DejaVu Sans Mono", True)
    x = 130
    for (s_, c) in E.dart_tokens("_shake.forward();"):
        draw_text(ctx, s_, x, 390, c, anchor="l"); x += text_w(ctx, s_)
    font(ctx, 32, "DejaVu Sans Mono", False)
    draw_text(ctx, "// works once... then never", 130, 448, "#7C74B0", anchor="l")
    # two attempts, stacked
    for i, (ts, lab, ok) in enumerate(((0.9, "TRY 1", True), (2.4, "TRY 2", False))):
        y0 = 560 + i * 380
        a = eob(prog(t, ts - 0.6, 0.35))
        if a <= 0: continue
        ctx.save(); ctx.translate(W/2, y0 + 150); ctx.scale(a, a); ctx.translate(-W/2, -(y0 + 150))
        rrect(ctx, 150, y0 + 12, 800, 300, 36); col(ctx, "#07051A"); ctx.fill()
        rrect(ctx, 140, y0, 800, 300, 36); col(ctx, "#2E2470"); ctx.fill()
        font(ctx, 34); draw_text(ctx, lab, 190, y0 + 64, "#C3B8FF", anchor="l")
        v = shake_v(t, ts) if ok else 0
        dx = shake_dx(v, 24 * 2.4)
        red = t >= ts
        pin_dots(ctx, W/2 - 10, y0 + 170, 4, dx, r=26, gap=86, red=red)
        font(ctx, 32, "DejaVu Sans Mono", False)
        val = f"value: {min(1, max(0, (t - ts) / SHAKE_D)):.1f}" if ok else "value: 1.0"
        draw_text(ctx, val, 900, y0 + 64, "#8E86C9", anchor="r")
        ctx.restore()
    q = eob(prog(t, 2.8, 0.35))
    if q > 0:
        ctx.save(); ctx.translate(W/2, 1380); ctx.rotate(-0.03); ctx.scale(q, q)
        font(ctx, 46); bw = text_w(ctx, "NO SHAKE AT ALL") + 60
        rrect(ctx, -bw/2, -46, bw, 92, 46); col(ctx, RED); ctx.fill()
        draw_text(ctx, "NO SHAKE AT ALL", 0, 16, WHITE)
        ctx.restore()
    caption(ctx, t, ["Value", "is", "stuck", "at", "1.0"], {4}, y=1600, t0=3.0)

CODE2 = [
    "late final _shake = AnimationController(",
    "  vsync: this,",
    "  duration: const Duration(",
    "    milliseconds: 500,",
    "  ),",
    ");",
    "",
    "Future<void> _onWrongPin() async {",
    "  HapticFeedback.heavyImpact();",
    "  await _shake.forward(from: 0);",
    "  setState(() => _pin = '');",
    "}",
]

def s4(ctx, t):
    punch(ctx, t, 0.05)
    bg_grid(ctx)
    title(ctx, t, "2. THE FIX: from: 0", y=200, size=58)
    code_card(ctx, t, CODE2, 260, 900, "pin_shake.dart", t0=0.3, step=0.12, fs=34, hl=(8, 9))
    q = eob(prog(t, 2.2, 0.4))
    if q > 0:
        x0, y0, w, h = 140, 1220, 800, 260
        ctx.save(); ctx.translate(W/2, y0 + h/2); ctx.scale(q, q); ctx.translate(-W/2, -(y0 + h/2))
        rrect(ctx, x0 + 10, y0 + 12, w, h, 34); col(ctx, "#07051A"); ctx.fill()
        rrect(ctx, x0, y0, w, h, 34); col(ctx, "#2E2470"); ctx.fill()
        # every 1.1 s: fill 4 dots, shake from 0, clear
        n = 0; dx = 0.0; red = False
        if t > 2.5:
            lt = (t - 2.5) % 1.1; k = int((t - 2.5) // 1.1)
            if lt < 0.4: n = int(lt / 0.1) + 1
            else:
                v = clamp((lt - 0.4) / SHAKE_D)
                n = 4 if v < 1 else 0; red = v < 1
                dx = shake_dx(v, 24 * 2.4)
                haptic(ctx, W/2, y0 + 110, t, 2.5 + k * 1.1 + 0.4, w=250)
            font(ctx, 30); draw_text(ctx, f"try {k + 1}", W/2, y0 + 220, "#C3B8FF")
        pin_dots(ctx, W/2, y0 + 110, min(n, 4), dx, r=26, gap=86, red=red)
        ctx.restore()
    caption(ctx, t, ["Every", "try", "shakes", "+", "buzz"], {4}, y=1650, t0=2.6)

def s5(ctx, t):
    E.s5(ctx, t)

R.SCENES = [(s1, 4.4), (s2, 6.0), (s3, 4.6), (s4, 5.8), (s5, 3.4)]

if __name__ == "__main__":
    if sys.argv[1] == "still":
        R.render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        R.render_scene(int(sys.argv[2]), sys.argv[3])

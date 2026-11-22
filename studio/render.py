import cairo, math, random, subprocess, sys, os

W, H, FPS = 1080, 1920, 30

# ---------- helpers ----------
def hexc(h, a=1.0):
    h = h.lstrip('#')
    return (int(h[0:2], 16)/255, int(h[2:4], 16)/255, int(h[4:6], 16)/255, a)

def col(ctx, h, a=1.0):
    ctx.set_source_rgba(*hexc(h, a))

def clamp(x, a=0, b=1): return max(a, min(b, x))
def prog(t, t0, d): return clamp((t - t0) / d)
def eo(x): return 1 - (1 - x) ** 3
def eob(x):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def lerp(a, b, x): return a + (b - a) * x

def rrect(ctx, x, y, w, h, r):
    r = min(r, w/2, h/2)
    ctx.new_sub_path()
    ctx.arc(x+w-r, y+r, r, -math.pi/2, 0)
    ctx.arc(x+w-r, y+h-r, r, 0, math.pi/2)
    ctx.arc(x+r, y+h-r, r, math.pi/2, math.pi)
    ctx.arc(x+r, y+r, r, math.pi, 3*math.pi/2)
    ctx.close_path()

def circle(ctx, x, y, r):
    ctx.new_sub_path(); ctx.arc(x, y, r, 0, 2*math.pi)

def ellipse(ctx, x, y, rx, ry):
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.new_sub_path(); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore()

def font(ctx, size, family="Poppins", bold=True):
    ctx.select_font_face(family, cairo.FONT_SLANT_NORMAL,
                         cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size)

def text_w(ctx, s):
    return ctx.text_extents(s).x_advance

def draw_text(ctx, s, x, y, h, anchor="c", stroke=None, sw=0):
    w = text_w(ctx, s)
    if anchor == "c": x -= w/2
    elif anchor == "r": x -= w
    ctx.move_to(x, y)
    if stroke:
        ctx.text_path(s)
        col(ctx, stroke); ctx.set_line_width(sw); ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.stroke_preserve()
        col(ctx, h); ctx.fill()
    else:
        col(ctx, h); ctx.show_text(s)

# palette
YEL = "#FFE14D"; INK = "#1A1438"; BLUE = "#3FA9F5"; CORAL = "#FF7A59"
RED = "#FF4D6D"; GREEN = "#3DDC84"; WHITE = "#FFFFFF"

# ---------- captions ----------
def caption(ctx, t, words, hi, y=1560, t0=0.15, size=66):
    """words: list; hi: set of indices highlighted. Words pop in one by one."""
    font(ctx, size)
    words_u = [w if any(a.islower() and b.isupper() for a, b in zip(w, w[1:])) else w.upper() for w in words]
    space = size * 0.32
    widths = [text_w(ctx, w) + (34 if i in hi else 0) for i, w in enumerate(words_u)]
    # wrap
    lines, cur, cw = [], [], 0
    for i, w in enumerate(widths):
        if cur and cw + space + w > 960:
            lines.append(cur); cur, cw = [], 0
        cw += (space if cur else 0) + w; cur.append(i)
    lines.append(cur)
    lh = size * 1.32
    y0 = y - (len(lines)-1) * lh / 2
    for li, line in enumerate(lines):
        total = sum(widths[i] for i in line) + space * (len(line)-1)
        x = W/2 - total/2
        yy = y0 + li * lh
        for i in line:
            p = prog(t, t0 + i * 0.11, 0.28)
            if p <= 0: x += widths[i] + space; continue
            s = eob(p)
            ctx.save()
            cx = x + widths[i]/2
            ctx.translate(cx, yy - size*0.35); ctx.scale(s, s); ctx.translate(-cx, -(yy - size*0.35))
            if i in hi:
                rrect(ctx, x, yy - size*0.92, widths[i], size*1.18, 14)
                col(ctx, INK); ctx.fill()
                rrect(ctx, x - 4, yy - size*0.98, widths[i], size*1.18, 14)
                col(ctx, YEL); ctx.fill()
                draw_text(ctx, words_u[i], x + 13, yy, INK, anchor="l")
            else:
                draw_text(ctx, words_u[i], x, yy, WHITE, anchor="l", stroke=INK, sw=14)
            ctx.restore()
            x += widths[i] + space

# ---------- background: office ----------
rng = random.Random(7)
BUILDINGS = []
x = 150
while x < 940:
    bw = rng.randint(50, 110); bh = rng.randint(120, 380)
    lit = [(rng.randint(0, 3), rng.randint(0, 9)) for _ in range(rng.randint(2, 6))]
    BUILDINGS.append((x, bw, bh, lit)); x += bw + rng.randint(4, 14)

def office(ctx, t):
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgba(0, *hexc("#2B2063")); g.add_color_stop_rgba(1, *hexc("#15103A"))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    # window
    wx, wy, ww, wh = 130, 220, 820, 700
    rrect(ctx, wx-18, wy-18, ww+36, wh+36, 24); col(ctx, "#3A2E80"); ctx.fill()
    g = cairo.LinearGradient(0, wy, 0, wy+wh)
    g.add_color_stop_rgba(0, *hexc("#3D3290")); g.add_color_stop_rgba(1, *hexc("#6A4FC0"))
    ctx.rectangle(wx, wy, ww, wh); ctx.set_source(g); ctx.fill()
    circle(ctx, 800, 340, 46); col(ctx, "#FFF3C4", 0.9); ctx.fill()
    ctx.save(); ctx.rectangle(wx, wy, ww, wh); ctx.clip()
    for (bx, bw, bh, lit) in BUILDINGS:
        ctx.rectangle(bx, wy+wh-bh, bw, bh); col(ctx, "#211A55"); ctx.fill()
        for (cx, cy) in lit:
            if cy*34+30 < bh:
                ctx.rectangle(bx+10+cx*22, wy+wh-bh+20+cy*34, 12, 18); col(ctx, YEL, 0.75); ctx.fill()
    ctx.restore()
    ctx.rectangle(wx+ww/2-8, wy, 16, wh); col(ctx, "#3A2E80"); ctx.fill()
    # floor
    ctx.rectangle(0, 1500, W, H-1500); col(ctx, "#120D30"); ctx.fill()

def desk(ctx):
    ctx.rectangle(40, 1210, 1000, 46); col(ctx, "#9A6A48"); ctx.fill()
    ctx.rectangle(40, 1256, 1000, 22); col(ctx, "#6E4630"); ctx.fill()
    ctx.rectangle(660, 1278, 340, 420); col(ctx, "#8A5C3E"); ctx.fill()
    for yy in (1330, 1660):
        rrect(ctx, 790, yy, 90, 18, 9); col(ctx, YEL); ctx.fill()
    ctx.rectangle(660, 1450, 340, 6); col(ctx, "#6E4630"); ctx.fill()
    ctx.rectangle(80, 1278, 40, 420); col(ctx, "#6E4630"); ctx.fill()

def laptop(ctx, x=330, y=1000):
    # back of laptop facing viewer
    rrect(ctx, x, y, 330, 215, 18); col(ctx, "#D9DDE8"); ctx.fill()
    rrect(ctx, x, y+195, 330, 20, 6); col(ctx, "#B8BDCC"); ctx.fill()
    # generic logo: small blue chevron
    ctx.move_to(x+150, y+80); ctx.line_to(x+180, y+108); ctx.line_to(x+150, y+136)
    col(ctx, BLUE); ctx.set_line_width(14); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke()

# ---------- characters ----------
SKIN = "#F6C7A1"; HAIR = "#3A2418"

def limb(ctx, x1, y1, x2, y2, w, c):
    ctx.move_to(x1, y1); ctx.line_to(x2, y2)
    col(ctx, c); ctx.set_line_width(w); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.stroke()

def dev(ctx, t, mood, wave=0.0):
    """Seated developer behind desk. mood: sad|shock|happy"""
    cx = 495
    bob = math.sin(t*3.2)*4
    # chair
    rrect(ctx, cx-200, 640, 400, 620, 90); col(ctx, "#1D1747"); ctx.fill()
    rrect(ctx, cx-170, 670, 340, 560, 70); col(ctx, "#27205C"); ctx.fill()
    # body (hoodie)
    hy = 930 + bob
    rrect(ctx, cx-150, hy, 300, 340, 90); col(ctx, CORAL); ctx.fill()
    ctx.move_to(cx-40, hy+10); ctx.line_to(cx, hy+70); ctx.line_to(cx+40, hy+10); col(ctx, "#E5603F"); ctx.set_line_width(10); ctx.stroke()
    # arms
    if mood == "shock":
        limb(ctx, cx-120, hy+60, cx-125, hy-90, 48, CORAL); circle(ctx, cx-118, hy-110, 30); col(ctx, SKIN); ctx.fill()
        limb(ctx, cx+120, hy+60, cx+125, hy-90, 48, CORAL); circle(ctx, cx+118, hy-110, 30); col(ctx, SKIN); ctx.fill()
    elif mood == "happy":
        a = -1.2 + math.sin(t*9)*0.25*wave
        ex, ey = cx+125 + math.cos(a)*230, hy+50 + math.sin(a)*230
        limb(ctx, cx+120, hy+60, ex, ey, 48, CORAL); circle(ctx, ex, ey, 32); col(ctx, SKIN); ctx.fill()
    # neck + head
    hx, hyh = cx, 800 + bob
    ctx.rectangle(hx-28, hyh+70, 56, 70); col(ctx, "#E8B48C"); ctx.fill()
    circle(ctx, hx, hyh, 118); col(ctx, SKIN); ctx.fill()
    # hair
    ctx.save(); circle(ctx, hx, hyh, 122); ctx.clip()
    ctx.move_to(hx-140, hyh-10)
    ctx.curve_to(hx-130, hyh-170, hx+150, hyh-190, hx+140, hyh-20)
    ctx.curve_to(hx+90, hyh-80, hx-20, hyh-40, hx-140, hyh-10)
    col(ctx, HAIR); ctx.fill(); ctx.restore()
    ellipse(ctx, hx+20, hyh-112, 60, 26); col(ctx, HAIR); ctx.fill()
    # ears
    circle(ctx, hx-118, hyh+10, 22); col(ctx, SKIN); ctx.fill()
    circle(ctx, hx+118, hyh+10, 22); col(ctx, SKIN); ctx.fill()
    # blush
    ellipse(ctx, hx-70, hyh+40, 24, 14); col(ctx, "#FF8FA3", 0.55); ctx.fill()
    ellipse(ctx, hx+70, hyh+40, 24, 14); col(ctx, "#FF8FA3", 0.55); ctx.fill()
    # eyes (blink)
    blink = (t % 2.7) < 0.12
    for ex in (hx-45, hx+45):
        if blink:
            limb(ctx, ex-14, hyh, ex+14, hyh, 7, INK)
        else:
            r = 17 if mood == "shock" else 13
            ellipse(ctx, ex, hyh, r, r*1.25); col(ctx, INK); ctx.fill()
            circle(ctx, ex+4, hyh-5, 4.5); col(ctx, WHITE); ctx.fill()
    # brows
    ctx.set_line_width(8); ctx.set_line_cap(cairo.LINE_CAP_ROUND); col(ctx, HAIR)
    if mood == "sad":
        ctx.move_to(hx-70, hyh-38); ctx.line_to(hx-28, hyh-52); ctx.stroke()
        ctx.move_to(hx+70, hyh-38); ctx.line_to(hx+28, hyh-52); ctx.stroke()
    elif mood == "shock":
        ctx.move_to(hx-68, hyh-58); ctx.line_to(hx-26, hyh-62); ctx.stroke()
        ctx.move_to(hx+68, hyh-58); ctx.line_to(hx+26, hyh-62); ctx.stroke()
    else:
        ctx.move_to(hx-68, hyh-42); ctx.curve_to(hx-55, hyh-56, hx-35, hyh-56, hx-24, hyh-46); ctx.stroke()
        ctx.move_to(hx+68, hyh-42); ctx.curve_to(hx+55, hyh-56, hx+35, hyh-56, hx+24, hyh-46); ctx.stroke()
    # mouth
    my = hyh + 62
    if mood == "sad":
        ctx.move_to(hx-30, my+8); ctx.curve_to(hx-12, my-10, hx+12, my-10, hx+30, my+8)
        col(ctx, INK); ctx.set_line_width(8); ctx.stroke()
    elif mood == "shock":
        ellipse(ctx, hx, my+4, 20, 26); col(ctx, "#7A1F2B"); ctx.fill()
    else:
        ctx.move_to(hx-42, my-8); ctx.curve_to(hx-30, my+44, hx+30, my+44, hx+42, my-8); ctx.close_path()
        col(ctx, "#7A1F2B"); ctx.fill()
        ctx.save(); ctx.move_to(hx-42, my-8); ctx.curve_to(hx-30, my+44, hx+30, my+44, hx+42, my-8); ctx.close_path(); ctx.clip()
        ellipse(ctx, hx, my+34, 24, 12); col(ctx, "#FF8FA3"); ctx.fill(); ctx.restore()

def widgy(ctx, x, y, s=1.0, t=0.0, mood="smile", squash=0.0, rot=0.0, look=0.0):
    """Original mascot: a blue widget-box with antenna. (x,y)=bottom center."""
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    ctx.scale(s*(1+squash*0.18), s*(1-squash*0.18))
    w, h = 170, 150
    # legs
    limb(ctx, -38, -10, -38, 10, 16, "#1E3A8A"); limb(ctx, 38, -10, 38, 10, 16, "#1E3A8A")
    # antenna
    limb(ctx, 0, -h, 8, -h-48, 8, "#1E3A8A")
    circle(ctx, 8, -h-56, 16); col(ctx, YEL); ctx.fill()
    # body
    rrect(ctx, -w/2, -h-6, w, h, 34); col(ctx, "#1E6FD9"); ctx.fill()
    rrect(ctx, -w/2, -h-14, w, h-8, 34); col(ctx, BLUE); ctx.fill()
    rrect(ctx, -w/2+18, -h+2, 40, 14, 7); col(ctx, WHITE, 0.35); ctx.fill()
    # eyes
    blink = ((t+0.6) % 3.1) < 0.12
    for ex in (-34, 34):
        if blink or mood == "smug":
            limb(ctx, ex-14, -h+62, ex+14, -h+62, 7, INK)
        else:
            ellipse(ctx, ex, -h+58, 17, 21); col(ctx, WHITE); ctx.fill()
            circle(ctx, ex+look*6, -h+60, 9); col(ctx, INK); ctx.fill()
    # mouth
    if mood == "o":
        ellipse(ctx, 0, -h+100, 12, 14); col(ctx, INK); ctx.fill()
    else:
        ctx.move_to(-22, -h+94); ctx.curve_to(-12, -h+112, 12, -h+112, 22, -h+94)
        col(ctx, INK); ctx.set_line_width(7); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.stroke()
    ctx.restore()

def badge(ctx, x, y, txt, fg, bg=WHITE, size=96, s=1.0, tail=True):
    font(ctx, size)
    w = text_w(ctx, txt) + 70; h = size*1.45
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    rrect(ctx, -w/2+8, -h/2+10, w, h, 30); col(ctx, INK); ctx.fill()
    rrect(ctx, -w/2, -h/2, w, h, 30); col(ctx, bg); ctx.fill()
    if tail:
        ctx.move_to(-30, h/2-2); ctx.line_to(-60, h/2+40); ctx.line_to(10, h/2-2); col(ctx, bg); ctx.fill()
    draw_text(ctx, txt, 0, size*0.36, fg)
    ctx.restore()

# ---------- scenes ----------
def punch(ctx, t, amt=0.07):
    p = eo(prog(t, 0, 0.3)); s = 1 + amt*(1-p)
    ctx.translate(W/2, H/2); ctx.scale(s, s); ctx.translate(-W/2, -H/2)

def s1(ctx, t):  # 3.6s: laggy app
    punch(ctx, t)
    office(ctx, t); dev(ctx, t, "sad"); desk(ctx); laptop(ctx)
    p = eob(prog(t, 0.5, 0.35))
    shake = math.sin(t*40)*6 if t > 0.9 else 0
    if p > 0: badge(ctx, 800+shake, 560, "12 FPS", RED, s=p)
    # lag glitch bars
    if 1.2 < t and int(t*6) % 3 == 0:
        ctx.rectangle(0, 300 + (int(t*13) % 9)*40, W, 18); col(ctx, RED, 0.25); ctx.fill()
    caption(ctx, t, ["My", "Flutter", "app", "was", "SO", "laggy"], {5})

def s2(ctx, t):  # 4.2s: rebuilding everything
    punch(ctx, t)
    office(ctx, t)
    # swarm of little widgets out of the laptop
    r = random.Random(3)
    for i in range(26):
        st = 0.5 + i*0.09
        p = prog(t, st, 1.6)
        if p <= 0: continue
        ang = r.uniform(-math.pi*0.95, -math.pi*0.05); dist = r.uniform(380, 900)
        x = 495 + math.cos(ang)*dist*eo(p); y = 1080 + math.sin(ang)*dist*eo(p) + 300*p*p
        widgy(ctx, x, y, s=0.34*eob(min(1, p*4)), t=t+i, mood="o", rot=p*r.uniform(-4, 4))
    dev(ctx, t, "shock"); desk(ctx); laptop(ctx)
    # mascot pops from desk
    p = prog(t, 0.15, 0.45)
    if p > 0:
        sq = math.sin(t*7)*0.5 if t > 0.6 else 0
        widgy(ctx, 860, 1212, s=eob(p)*1.0, t=t, mood="o", squash=sq, look=-1)
    n = int(lerp(3, 1248, eo(prog(t, 0.6, 2.4))))
    badge(ctx, 540, 470, f"build() x {n:,}", RED, size=84, s=eob(prog(t, 0.5, 0.35)), tail=False)
    caption(ctx, t, ["Every", "setState", "rebuilt", "EVERYTHING"], {3})

CODE = [  # (indent, tokens) ; tokens (text,color) ; const marker index
    (0, [("Column", BLUE), ("(", WHITE)], None),
    (1, [("children", "#C3B8FF"), (": [", WHITE)], None),
    (2, [("Header", BLUE), ("(),", WHITE)], 0),
    (2, [("Text", BLUE), ("(", WHITE), ("'Hello'", "#A5E07A"), ("),", WHITE)], 1),
    (2, [("Counter", BLUE), ("(", WHITE), ("count", "#FFB86C"), ("),", WHITE)], None),
    (1, [("],", WHITE)], None),
    (0, [("),", WHITE)], None),
]

def s3(ctx, t):  # 6.4s: code card
    punch(ctx, t, 0.05)
    g = cairo.LinearGradient(0, 0, 0, H)
    g.add_color_stop_rgba(0, *hexc("#1B1546")); g.add_color_stop_rgba(1, *hexc("#0E0B26"))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    ctx.set_line_width(2); col(ctx, WHITE, 0.04)
    for gx in range(0, W, 60): ctx.move_to(gx, 0); ctx.line_to(gx, H)
    for gy in range(0, H, 60): ctx.move_to(0, gy); ctx.line_to(W, gy)
    ctx.stroke()
    # title
    font(ctx, 58); draw_text(ctx, "THE FIX:", W/2, 300, YEL)
    # card
    cy = 380
    rrect(ctx, 60+10, cy+12, 960, 860, 36); col(ctx, "#07051A"); ctx.fill()
    rrect(ctx, 60, cy, 960, 860, 36); col(ctx, "#221B52"); ctx.fill()
    for i, c in enumerate((RED, YEL, GREEN)):
        circle(ctx, 120+i*44, cy+52, 13); col(ctx, c); ctx.fill()
    font(ctx, 34, "DejaVu Sans Mono", False); draw_text(ctx, "home_page.dart", 980, cy+64, "#8E86C9", anchor="r")
    # typing const
    typed = [prog(t, 1.6, 0.6), prog(t, 2.5, 0.6)]
    font(ctx, 46, "DejaVu Sans Mono", True)
    cw = text_w(ctx, "M")
    ly = cy + 170
    for li, (ind, toks, ci) in enumerate(CODE):
        x = 110 + ind*cw*2
        if ci is not None:
            k = int(round(typed[ci]*6))
            s = "const "[:k]
            if k:
                pulse = 1 + 0.08*math.sin(clamp(t-(1.6+ci*0.9), 0, 1)*math.pi*3)*(1-prog(t, 3.6, 0.5))
                ww = text_w(ctx, s.rstrip()) + 16
                ctx.save(); ctx.translate(x+ww/2, ly-16); ctx.scale(pulse, pulse); ctx.translate(-(x+ww/2), -(ly-16))
                rrect(ctx, x-8, ly-46, ww, 62, 10); col(ctx, YEL); ctx.fill()
                draw_text(ctx, s, x, ly, INK, anchor="l")
                ctx.restore()
                x += text_w(ctx, s)
        for (tx, c) in toks:
            draw_text(ctx, tx, x, ly, c, anchor="l"); x += text_w(ctx, tx)
        # rebuild / skip tags
        if li in (2, 3, 4):
            tp = eob(prog(t, 0.4 + (li-2)*0.15, 0.3))
            if tp > 0:
                skipped = (li == 2 and typed[0] >= 1) or (li == 3 and typed[1] >= 1)
                label, c = ("SKIP", GREEN) if skipped else ("REBUILD", RED)
                font(ctx, 30)
                tw = text_w(ctx, label) + 34
                ctx.save(); ctx.translate(985-tw/2, ly-16); ctx.scale(tp, tp)
                rrect(ctx, -tw/2, -24, tw, 48, 24); col(ctx, c); ctx.fill()
                draw_text(ctx, label, 0, 11, INK)
                ctx.restore()
                font(ctx, 46, "DejaVu Sans Mono", True)
        ly += 98
    # mascot pointing at code
    bp = abs(math.sin(t*5))
    widgy(ctx, 880, 1440 - bp*30, s=0.95, t=t, squash=-bp*0.4 if bp > 0.5 else 0.3, look=-1)
    caption(ctx, t, ["Add", "const", "to", "widgets", "that", "never", "change"], {1}, y=1640, t0=0.3)

def s4(ctx, t):  # 3.6s: smooth
    punch(ctx, t)
    office(ctx, t); dev(ctx, t, "happy", wave=1.0); desk(ctx); laptop(ctx)
    b = abs(math.sin(t*6))
    widgy(ctx, 860, 1212 - b*90, s=1.0, t=t, squash=(0.6 if b < 0.15 else -0.2), look=-1)
    badge(ctx, 800, 560, "60 FPS", "#14A85A", s=eob(prog(t, 0.25, 0.4)))
    # sparkles
    for i in range(10):
        p = (t*0.8 + i/10) % 1
        a = i*0.63
        x = 540 + math.cos(a)*(300+p*260); y = 760 + math.sin(a)*(200+p*200)
        circle(ctx, x, y, 10*(1-p)); col(ctx, YEL, 1-p); ctx.fill()
    caption(ctx, t, ["Flutter", "skips", "them.", "Smooth", "60 FPS"], {4})

def s5(ctx, t):  # 3.2s: CTA
    punch(ctx, t)
    g = cairo.RadialGradient(W/2, 820, 50, W/2, 820, 1100)
    g.add_color_stop_rgba(0, *hexc("#4B3AA8")); g.add_color_stop_rgba(1, *hexc("#15103A"))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    for i in range(14):
        a = i/14*2*math.pi + t*0.4
        ctx.move_to(W/2, 820); ctx.arc(W/2, 820, 1400, a, a+0.12); ctx.close_path()
        col(ctx, WHITE, 0.035); ctx.fill()
    b = abs(math.sin(t*5))
    p = eob(prog(t, 0.0, 0.5))
    widgy(ctx, W/2, 1000 - b*60, s=2.0*p, t=t, squash=(0.5 if b < 0.15 else -0.15))
    font(ctx, 54); draw_text(ctx, "FLUTTER TIP #1", W/2, 380, "#C3B8FF")
    font(ctx, 82); draw_text(ctx, "CONST WIDGETS", W/2, 480, WHITE, stroke=INK, sw=14)
    caption(ctx, t, ["Follow", "for", "a", "Flutter", "tip", "every", "day"], {0}, y=1380, t0=0.4)

SCENES = [(s1, 3.6), (s2, 4.2), (s3, 6.4), (s4, 3.6), (s5, 3.2)]

def render_scene(i, out, still_at=None):
    fn, dur = SCENES[i]
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    if still_at is not None:
        ctx = cairo.Context(surf); fn(ctx, still_at); surf.write_to_png(out); return
    tmp = out.replace(".mp4", ".part.mp4")
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                          "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
    for f in range(int(round(dur*FPS))):
        ctx = cairo.Context(surf)
        ctx.set_operator(cairo.OPERATOR_SOURCE); ctx.set_source_rgba(0, 0, 0, 1); ctx.paint()
        ctx.set_operator(cairo.OPERATOR_OVER)
        fn(ctx, f/FPS)
        surf.flush(); p.stdin.write(bytes(surf.get_data()))
    p.stdin.close()
    if p.wait() == 0: os.replace(tmp, out)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "still":
        render_scene(int(sys.argv[2]), sys.argv[4], still_at=float(sys.argv[3]))
    else:
        render_scene(int(sys.argv[2]), sys.argv[3])

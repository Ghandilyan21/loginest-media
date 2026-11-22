"""Shared Instagram cover layout (1080x1920; key content inside the 3:4 grid crop, y 240..1680).

make_cover(out_png, num, word1, word2, badge, draw_visual)
  word1: white title line, word2: yellow highlighted line, badge: coral tag text.
  draw_visual(ctx): draws the episode's visual inside the box x 120..960, y 800..1340.
Also writes a JPEG next to it (Instagram needs JPEG covers).
"""
import os, subprocess
import cairo
import ep_typing as E
from render import (W, H, col, hexc, rrect, font, draw_text, text_w, widgy, YEL, INK, WHITE, CORAL)

def make_cover(out_png, num, word1, word2, badge, draw_visual):
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); ctx = cairo.Context(surf)
    E.bg_grid(ctx)
    g = cairo.RadialGradient(W/2, 1050, 40, W/2, 1050, 900)
    g.add_color_stop_rgba(0, *hexc("#5B44D6", 0.55)); g.add_color_stop_rgba(1, *hexc("#15103A", 0))
    ctx.rectangle(0, 0, W, H); ctx.set_source(g); ctx.fill()
    font(ctx, 42); draw_text(ctx, f"REBUILD IT IN FLUTTER  #{num}", W/2, 360, "#C3B8FF")
    size = 150
    font(ctx, size)
    while text_w(ctx, word1) > 960 and size > 90:
        size -= 6; font(ctx, size)
    draw_text(ctx, word1, W/2, 530, WHITE, stroke=INK, sw=22)
    size = 150; font(ctx, size)
    while text_w(ctx, word2) + 60 > 980 and size > 90:
        size -= 6; font(ctx, size)
    w = text_w(ctx, word2) + 60
    rrect(ctx, W/2 - w/2 + 10, 560, w, 190, 28); col(ctx, INK); ctx.fill()
    rrect(ctx, W/2 - w/2, 550, w, 190, 28); col(ctx, YEL); ctx.fill()
    draw_text(ctx, word2, W/2, 645 + size*0.36, INK)
    ctx.save(); draw_visual(ctx); ctx.restore()
    widgy(ctx, 900, 1440, s=1.1, t=1.0, look=-1, rot=-0.08)
    font(ctx, 52); bw = text_w(ctx, badge) + 70
    ctx.save(); ctx.translate(W/2 - 70, 1500); ctx.rotate(-0.04)
    rrect(ctx, -bw/2 + 8, -40, bw, 100, 50); col(ctx, INK); ctx.fill()
    rrect(ctx, -bw/2, -50, bw, 100, 50); col(ctx, CORAL); ctx.fill()
    draw_text(ctx, badge, 0, 19, WHITE)
    ctx.restore()
    surf.write_to_png(out_png)
    jpg = os.path.splitext(out_png)[0] + ".jpg"
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", out_png, "-q:v", "2", jpg])
    return jpg

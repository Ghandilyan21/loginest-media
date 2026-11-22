# Episode ideas (take from the top)

1. **PIN code shake** (iOS lock screen wrong passcode): dots row shakes left-right on wrong PIN.
   Code: AnimationController + sin wave in Transform.translate, decaying amplitude. Tip: add HapticFeedback.heavyImpact().
2. **Card flip** (bank card front/back, Revolut-style): Transform with Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle).
   Trap: without setEntry(3,2,...) there is no perspective; swap front/back when angle passes pi/2.
3. **Skeleton shimmer** (LinkedIn/Facebook loading): ShaderMask + LinearGradient whose stops slide with a controller.
   Tip: blendMode: BlendMode.srcATop so only the grey shapes shine.
4. **Swipe to reply** (WhatsApp message): horizontal drag reveals a reply icon, snaps back on release.
   Tip: fire HapticFeedback once when the threshold is crossed, not every frame.
5. **Success checkmark draw** (Apple Pay done): CustomPainter + PathMetric.extractPath(0, length * t).
6. **Activity rings** (Apple Watch): CustomPainter drawArc with StrokeCap.round, three rings animating to values.
   Trap: a ring past 100% needs a second lap drawn on top.
7. **Hero poster to details** (Netflix-style): Hero widget with the same tag. Tip: flightShuttleBuilder to fix text overflow mid-flight.
8. **Bottom sheet that snaps** (Google Maps): DraggableScrollableSheet with snap: true and snapSizes.
9. **Add to cart fly-in** (food delivery apps): Overlay entry animating a product image to the cart icon,
   then the cart badge bounces. Tip: get positions with RenderBox.localToGlobal.
10. **Story ring spin** (Instagram-style gradient ring while loading): SweepGradient rotated by a controller via GradientRotation.
11. **Pull to refresh with custom indicator**: RefreshIndicator vs CupertinoSliverRefreshControl; custom builder showing a progress arc.
12. **Expanding mini player** (Spotify/YouTube): DraggableScrollableSheet or AnimatedContainer between mini and full player,
    Tip: lerp values with the sheet extent so artwork grows smoothly.
13. **Deleted message dissolves into particles** (Telegram "Thanos snap", hard mode): split into a grid of small squares
    that fly and fade; CustomPainter with a particle list.
14. **Typing text effect** (ChatGPT-style streaming answer): Timer/Stream revealing characters + blinking cursor.
    Trap: setState per character rebuilds the whole page — isolate it in its own widget.

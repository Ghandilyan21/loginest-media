# loginest-media: daily "Rebuild It in Flutter" episode

This repo holds the videos, covers and the code that makes them for Tyom's Instagram account **loginest_dev**
(faceless Flutter blog, English captions). Files in `reels/` are served publicly by GitHub Pages at
`https://ghandilyan21.github.io/loginest-media/reels/<file>` — that is the URL Instagram downloads from.

When a run is asked to make and post today's episode, follow every step below in order.

## 1. Set up
```
pip install --break-system-packages -q pycairo
fc-list | grep -qi poppins && fc-list | grep -qi "DejaVu Sans Mono" || echo "FONTS MISSING"
```
Work in `studio/`. Scripts there import each other by module name, so run them from inside `studio/`.

## 2. Pick the episode
- Read `posted.md`. The new episode number is the last number + 1.
- Rows marked `(TEST)` in posted.md are test posts that were deleted: ignore them for the episode number,
  the idea choice and the "already posted today" check.
- If `studio/ep_NN_*.py` already exists for the chosen idea (left by a test run), reuse it: check stills,
  re-render, and continue from step 4.
- Take the first idea in `ideas.md` that is not in `posted.md`. If an idea's Flutter API turns out not to exist
  or not to fit, skip it (note why in ideas.md) and take the next one.
- When fewer than 5 ideas remain, add new ones at the bottom: famous app UI features that are recognisable in
  one second, buildable in ~15–25 lines of real Flutter, with a "trap" or "pro tip" that teaches something
  most developers miss. No repeats of anything in posted.md.

## 3. Write the episode — `studio/ep_NN_slug.py`
Copy the structure of the existing episodes (`ep_island.py`, `ep_heart.py`, `ep_swipe.py` are the best models).
They use `render.py` (helpers, captions, mascot "Widgy", `punch`) and `ep_typing.py`
(`bg_grid`, `code_card`, `title`, and `E.s5` = the shared "Which app is next?" ending).

Scenes, 20–28 s total, 1080×1920, 30 fps:
1. **Hook (~4 s)**: series label `REBUILD IT IN FLUTTER  #NN`, big title, a phone/mockup showing the feature
   working, caption that makes people want the answer.
2. **Code 1 (~5–6 s)**: `code_card` + a small live demo under it driven by the same math as the code.
3. **Trap / pro tip (~4–5 s)**: the common mistake shown visually, or the detail that makes it feel right.
4. **Code 2 / fix (~5–6 s)** + live demo.
5. **Ending**: `def sN(ctx, t): E.s5(ctx, t)` (3.4 s).

Rules that protect the account's reputation:
- **Only real Flutter APIs** (stable, Flutter 3.22+). If unsure a class, constructor argument or constant
  exists, use a simpler API you are sure of or pick another idea. Code on screen must compile in a real app
  apart from obviously-named helpers (`_next()`, `MusicRow`, etc.).
- Code lines ≤ 40 characters at `fs=36` (≤ 44 at `fs=34`), ≤ 18 lines per card. Split long lines.
- Mockups are generic: invented names/usernames, **no brand logos, no real people's photos, no copied UI marks**.
  Naming the app in text ("Telegram-style") is fine.
- Caption words: use `{index}` highlight sets; merge multi-word highlights into one word string
  (e.g. `"60 FPS"`). camelCase words keep their casing automatically.
- No emoji in drawn text (fonts lack them).

## 4. Check, then render
```
cd studio
python3 ep_NN_slug.py still <scene> <time> /tmp/fN.png     # 4–6 stills at the busiest moments
python3 build.py ep_NN_slug ../reels/rebuild_it_NN_slug.mp4
```
Look at the stills (Read the PNGs). Fix overlaps, text running off cards, and anything covering code
before the full render. After the render, sample frames
(`ffmpeg -i X.mp4 -vf "fps=1/2.5,scale=270:-1,tile=5x2" -frames:v 1 /tmp/check.png`) and look again.

## 4b. Add music (required — never post a silent video)
```
cd studio && MUSIC_KEY=<key from the task prompt> sh add_music.sh NN ../reels/rebuild_it_NN_slug.mp4
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 ../reels/rebuild_it_NN_slug.mp4   # must list video AND audio
```
Tracks live encrypted in `music/` and are listed in `music/tracks.txt` (file + start second). Never commit a
decrypted track or print the key. If MUSIC_KEY is missing or decryption fails, stop and report instead of posting.

## 5. Cover
```python
import cover_template as C
C.make_cover("../reels/cover_NN_slug.png", NN, "WORD1", "WORD2", "SHORT BADGE", draw_visual)
```
`draw_visual(ctx)` draws the feature in the box x 120..960, y 800..1340. It writes the `.jpg` too.
Look at the cover before continuing. Delete the `.png` (only the `.jpg` is needed in `reels/`).

## 6. Publish the files
```
cd /path/to/loginest-media
git add reels studio && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "Episode NN: <name>"
git -c push.negotiate=true push origin main
sleep 120   # GitHub Pages needs time to deploy
```

## 7. Post to Instagram (Windsor.ai connector, connector `instagram`, account `17841467611309887`)
1. `create_video_post` with `video_url`, `cover_url` (the .jpg), `share_to_feed: true`, and the caption.
2. `create_story` with the same `video_url`.
If Instagram says it cannot fetch the media, wait 90 s and retry, at most 3 times. If the video post fails
for good, do not post the story; report the failure.

Caption template (≤ 2200 chars):
```
<one-line hook question with one emoji>

<2–4 short lines explaining the trick, each starting with →>

<the trap / pro tip in one line>

Rebuild It in Flutter #NN. Which app feature should I rebuild next? Drop it in the comments 👇

#flutter #flutterdev #dart #mobiledev #appdevelopment #flutteranimation #coding #programming #androiddev #iosdev
```

## 8. Record it
Append to `posted.md`: `| NN | YYYY-MM-DD | Name | reel media id | story ok? |`, commit and push.
Finish with a short message to Tyom: episode name, what it teaches, that the Reel and Story are live
(or exactly what failed).

Never post a video whose render or checks failed. Never post the same episode twice: if posted.md already
has today's date with a media id, stop and report.

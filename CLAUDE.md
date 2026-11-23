# loginest-media: daily "Rebuild It in Flutter" episode

This repo holds the videos, covers and the code that makes them for Tyom's Instagram account **loginest_dev**
(faceless Flutter blog, English captions). Files in `reels/` are served publicly by GitHub Pages at
`https://ghandilyan21.github.io/loginest-media/reels/<file>`, which is the URL Instagram downloads from.

**Fixed look (chosen by Tyom, do not change): style "A · Neon Glass + Widgy"**, built with Remotion in `remotion/`.
Dark navy background with drifting colour light and a dot grid, frosted-glass panels, VS Code-style Dart
highlighting (Shiki, tokyo-night), Space Grotesk titles, gradient (violet→pink) highlight words, and the
mascot **Widgy** (glossy blue box robot) as the main character in every scene.
`studio/` (old Python/cairo engine) is retired; only `studio/add_music.sh` is still used.

Schedule: **two episodes a day**, posted around **09:00 and 19:00 Yerevan time** (the runs start ~35 min earlier).
When a run is asked to make and post an episode, follow every step below in order.

## 1. Set up
```
cd remotion && npm ci --silent      # Remotion, React, Shiki, fonts
command -v google-chrome            # Remotion renders with this Chrome (render.sh passes it automatically)
```

## 2. Pick the episode
- Read `posted.md`. The new episode number is the last number + 1 (two digits, e.g. 08).
- Rows marked `(TEST)` are deleted test posts: ignore them for the number, the idea choice and the
  duplicate check below.
- Duplicate check: if the newest non-TEST row in posted.md was posted **less than 6 hours ago** (Yerevan time),
  this slot is already done: stop and report instead of posting.
- If `remotion/src/episodes/EpNN.tsx` already exists (from a test run or prepared in advance), reuse it and go to step 4.
- Otherwise take the first idea in `ideas.md` that is not in `posted.md`. If its Flutter API turns out not to
  exist or not to fit, skip it (note why in ideas.md) and take the next one.
- When fewer than 5 ideas remain, add new ones at the bottom: famous app UI features recognisable in one
  second, buildable in ~15–25 lines of real Flutter, with a "trap" or "pro tip" most developers miss.

## 3. Write the episode (copy `remotion/src/episodes/Ep07.tsx` — it is the reference)
1. `remotion/src/episodes/epNN.code.json`: the code blocks shown on screen, then
   `node scripts/tokenize.mjs src/episodes/epNN.code.json` (writes `epNN.tokens.json`).
2. `remotion/src/episodes/EpNN.tsx` with the same structure as Ep07:
   - scenes, 20–28 s total, 30 fps, 1080×1920, each wrapped in `<SceneIn>` with a `<Backdrop>`:
     1. **Hook (~4.4 s)**: `SeriesPill`, `Title` (accent word in gradient), a mockup (usually `<Phone>`) showing the
        feature working, `Caption`, Widgy at the side.
     2. **Code 1 (~6 s)**: `Title` "1. …", `CodeCard` (highlight the key lines), a `Glass` live demo driven by the
        same math as the code, `Caption`.
     3. **Trap / pro tip (~4.6 s)**: the common mistake shown visually, Widgy with `mood="o"` (surprised).
     4. **Code 2 / fix (~6 s)**: `CodeCard` + live demo, `Caption`.
     5. **Ending**: `() => <Ending num={NUM} />` (3.4 s).
   - **Widgy appears in every scene** (hook: next to the mockup; code scenes: bottom-left `x={150} y={1760}`;
     trap: `mood="o"`). Never let him cover code, captions or the demo.
   - Export `EpNN`, `EPNN_FRAMES` and `CoverNN` (use `<Cover num line1 accent badge>` with the feature as the visual).
3. Register both in `remotion/src/Root.tsx`: `<Still id="coverNN" …>` and `<Composition id="epNN" …>` (same pattern as 07).

Layout rules: title area y 150–330, content y 270–1420, captions y ≈ 1440–1560 (Instagram covers the bottom
~350 px with its own UI, so nothing important below y 1600 except Widgy). Code card lines ≤ 41 characters at
the default font size (`fs` 33), ≤ 15 lines per card; split long lines.

Rules that protect the account's reputation:
- **Only real Flutter APIs** (stable, Flutter 3.22+). If unsure a class, argument or constant exists, use a
  simpler API you are sure of or pick another idea. On-screen code must compile in a real app apart from
  obviously-named helpers (`_next()`, `MusicRow`, …).
- Mockups are generic: invented names, **no brand logos, no real people, no copied UI marks**.
  Naming the app in text ("Telegram-style") is fine.
- No emoji anywhere in the video (the fonts lack them).

## 4. Check, then render
```
cd remotion
sh render.sh NN slug stills "60 200 380 560 700"   # cover + frames into remotion/out/
```
Read the PNGs. Fix overlaps, text running off cards, Widgy covering anything, unreadable code. Then:
```
sh render.sh NN slug          # ../reels/rebuild_it_NN_slug.mp4 + ../reels/cover_NN_slug.jpg
ffmpeg -v error -y -i ../reels/rebuild_it_NN_slug.mp4 -vf "fps=1/2.4,scale=270:-1,tile=5x2" -frames:v 1 /tmp/check.png
```
Look at /tmp/check.png before continuing.

## 4b. Add music (required — never post a silent video)
```
cd ../studio && MUSIC_KEY=<key from the task prompt> sh add_music.sh NN ../reels/rebuild_it_NN_slug.mp4
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 ../reels/rebuild_it_NN_slug.mp4   # must list video AND audio
```
Tracks are encrypted in `music/`, listed in `music/tracks.txt`, and laid in unchanged (no re-encoding — Tyom
wants the original quality). Never commit a decrypted track or print the key. If the key is missing or
decryption fails, stop and report instead of posting.

## 5. Publish the files
```
cd /path/to/loginest-media
git add reels remotion/src remotion/scripts && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "Episode NN: <name>"
git -c push.negotiate=true push origin main
sleep 120   # GitHub Pages needs time to deploy
```

## 6. Post to Instagram (Windsor.ai connector, connector `instagram`, account `17841467611309887`)
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

## 7. Record it
Append to `posted.md`: `| NN | YYYY-MM-DD HH:MM | Name | reel media id | story ok? |` (date and time in Yerevan time, UTC+4), commit and push.
Finish with a short message to Tyom: episode name, what it teaches, that the Reel and Story are live
(or exactly what failed).

Never post a video whose render or checks failed. Never post the same episode twice, and never post twice in
one slot (see the 6-hour duplicate check in step 2).

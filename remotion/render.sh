#!/bin/sh
# Render episode NN: video -> ../reels/rebuild_it_NN_<slug>.mp4, cover -> ../reels/cover_NN_<slug>.jpg
# Usage (from remotion/):  sh render.sh 08 swipe_reply
#   check stills first:    sh render.sh 08 swipe_reply stills "60 200 400"
set -e
NN="$1"; SLUG="$2"; MODE="${3:-full}"; FRAMES="${4:-60 200 400 600}"
CHROME=$(command -v google-chrome || command -v chromium || true)
FLAGS="--log=error"
[ -n "$CHROME" ] && FLAGS="$FLAGS --browser-executable=$CHROME"
mkdir -p out
npx remotion bundle src/index.ts --out-dir=out/bundle --log=error
if [ "$MODE" = "stills" ]; then
  npx remotion still out/bundle "cover$NN" "out/cover$NN.png" $FLAGS
  for f in $FRAMES; do npx remotion still out/bundle "ep$NN" "out/f$f.png" --frame=$f $FLAGS; done
  echo "stills in remotion/out/"; exit 0
fi
npx remotion render out/bundle "ep$NN" "../reels/rebuild_it_${NN}_${SLUG}.mp4" $FLAGS --concurrency=2 --crf=18 --x264-preset=veryfast
npx remotion still out/bundle "cover$NN" "out/cover$NN.png" $FLAGS
ffmpeg -v error -y -i "out/cover$NN.png" -q:v 2 "../reels/cover_${NN}_${SLUG}.jpg"
echo "rendered ../reels/rebuild_it_${NN}_${SLUG}.mp4 and ../reels/cover_${NN}_${SLUG}.jpg"

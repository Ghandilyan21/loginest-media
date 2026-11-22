#!/bin/sh
# Usage: MUSIC_KEY=... sh add_music.sh <episode_number> <video.mp4>
# Picks a track from ../music/tracks.txt (rotating by episode number), decrypts it to /tmp,
# lays it under the video with a short fade-in and a 1.5 s fade-out, and replaces the video in place.
set -e
N="$1"; V="$2"; DIR="$(cd "$(dirname "$0")/../music" && pwd)"
[ -n "$MUSIC_KEY" ] || { echo "MUSIC_KEY not set"; exit 1; }
COUNT=$(grep -cv '^\s*\(#\|$\)' "$DIR/tracks.txt")
IDX=$(( (N % COUNT) + 1 ))
LINE=$(grep -v '^\s*\(#\|$\)' "$DIR/tracks.txt" | sed -n "${IDX}p")
FILE=$(echo "$LINE" | awk '{print $1}'); START=$(echo "$LINE" | awk '{print $2}')
openssl enc -d -aes-256-cbc -pbkdf2 -in "$DIR/$FILE" -out /tmp/track.m4a -pass pass:"$MUSIC_KEY"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
FO=$(echo "$D - 1.5" | bc)
ffmpeg -v error -y -i "$V" -ss "$START" -i /tmp/track.m4a -map 0:v -map 1:a -c:v copy \
  -af "afade=t=in:d=0.3,afade=t=out:st=$FO:d=1.5,volume=0.9" -c:a aac -b:a 192k -shortest /tmp/with_music.mp4
mv /tmp/with_music.mp4 "$V"; rm -f /tmp/track.m4a
echo "added $FILE to $V"

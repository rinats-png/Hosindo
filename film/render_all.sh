#!/usr/bin/env bash
# Rendert alle Fassungen und legt den Ton an. Erwartet FFMPEG (mit libx264) und optional CHROME.
set -euo pipefail
cd "$(dirname "$0")"
: "${FFMPEG:=ffmpeg}"
export FFMPEG
node render.mjs video --fmt 16x9 --out out/raw_16x9.mp4 &
node render.mjs video --fmt 9x16 --out out/raw_9x16.mp4 &
wait
node render.mjs video --fmt 1x1 --out out/raw_1x1.mp4 &
node render.mjs video --fmt 16x9 --rm 1 --out out/raw_16x9_rm.mp4 &
wait
mux () { "$FFMPEG" -hide_banner -loglevel error -y -i "$1" -i out/bed.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$2"; }
mux out/raw_16x9.mp4    out/master_16x9.mp4
mux out/raw_9x16.mp4    out/cut_9x16.mp4
mux out/raw_1x1.mp4     out/cut_1x1.mp4
mux out/raw_16x9_rm.mp4 out/master_16x9_reduced_motion.mp4
echo FERTIG

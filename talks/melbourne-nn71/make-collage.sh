#!/usr/bin/env bash
# p04-field.png — the "real classrooms" collage for slide 4.
#
# Built twice by hand before this existed; now it is reproducible. Edit the
# three source names below and rerun, then `make`.
#
# Layout: one feature image full height on the left, two stacked on the right.
# Three landscape photographs do not tile into a 2x2 without a hole, and a
# 1x3 strip makes each one too small to read at 7 cm.
#
# The KC-130 shot was dropped on his instruction 13 Oct: the flight-suit photo
# read as a credential, which is the one thing the Marine material must not do
# in this talk. The white aircraft with family on the stairs stays.
set -euo pipefail
cd "$(dirname "$0")"
BG='#002A37'                       # NNblue, so gutters vanish into the slide
FEATURE=img/real_life_classroom1.png   # family on the stairs
UPPER=img/real_life_classroom2.png     # the summit
LOWER=img/real_life_classroom4.png     # the campus
T=$(mktemp -d)
magick "$FEATURE" -resize 860x1000^ -gravity center -extent 860x1000 -strip "$T/L.png"
magick "$UPPER"   -resize 530x490^  -gravity center -extent 530x490  -strip "$T/R1.png"
magick "$LOWER"   -resize 530x490^  -gravity center -extent 530x490  -strip "$T/R2.png"
montage "$T/R1.png" "$T/R2.png" -tile 1x2 -geometry +0+10 -background "$BG" "$T/R.png"
montage "$T/L.png"  "$T/R.png"   -tile 2x1 -geometry +0+0  -background "$BG" "$T/all.png"
magick "$T/all.png" -bordercolor "$BG" -border 6 -depth 8 -strip img/p04-field.png
rm -rf "$T"
printf 'img/p04-field.png  %s\n' "$(identify -format '%wx%h' img/p04-field.png)"

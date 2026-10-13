#!/usr/bin/env bash
# slides-small.pdf — the same deck with JPEG-encoded photographs, for email.
#
# The full-quality PNG build (slides.pdf) is untouched and stays the master.
# This exists because some mail servers cap attachments at 10 MB and the PNG
# deck is well over that.
#
# How it works: \slot tries img/<name>.jpg BEFORE img/<name>.png, so a build
# directory whose img/ holds only JPEGs picks them up with no edit to body.tex.
set -euo pipefail
Q=${Q:-82}
cd "$(dirname "$0")"
rm -rf small && mkdir -p small/img small/build
for f in body.tex nnfc.tex slides.tex; do ln -sf "../$f" "small/$f"; done
ln -sfn ../assets small/assets
n=0
for f in img/*.png; do
  b=$(basename "$f" .png)
  magick "$f" -quality "$Q" -strip "small/img/$b.jpg"
  n=$((n+1))
done
cd small
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build slides.tex >/dev/null
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build slides.tex >/dev/null
cp build/slides.pdf ../slides-small.pdf
cd ..
printf 'slides-small.pdf  %s  (%d images at JPEG q%s)  vs slides.pdf %s\n' \
  "$(du -h slides-small.pdf | cut -f1)" "$n" "$Q" "$(du -h slides.pdf | cut -f1)"

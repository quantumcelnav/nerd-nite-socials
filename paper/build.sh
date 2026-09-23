#!/bin/zsh
# Render the paper to PDF. Typography aimed at reading on paper: 12pt Palatino,
# 1.15 leading, 1.1in margins, sans headings, table of contents.
#
# xelatex rather than pdflatex so the system fonts resolve. Do NOT add
# \usepackage[T1]{fontenc} to style.tex -- it overrides fontspec and silently
# drops em-dashes and curly quotes.
set -e
cd ${0:A:h}
pandoc you-had-to-be-there.md -o you-had-to-be-there.pdf \
  --pdf-engine=xelatex -V geometry:margin=1.1in -V fontsize=12pt \
  -V mainfont="Palatino" -V sansfont="Helvetica Neue" -V monofont="Menlo" \
  -V colorlinks=true -V linkcolor=Maroon -V urlcolor=Maroon \
  --toc --toc-depth=2 -H style.tex
echo "you-had-to-be-there.pdf  $(pdfinfo you-had-to-be-there.pdf | awk '/Pages/{print $2}') pages"

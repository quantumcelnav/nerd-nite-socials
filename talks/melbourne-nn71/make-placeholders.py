#!/usr/bin/env python3
"""Render meta-images: PNGs that describe the photograph that belongs in the slot.

Every image in slides.tex is one of these. Swap the PNG in img/ for the real
photograph, keep the filename, rebuild. Nothing in slides.tex has to change.

One pdflatex run produces all pages, pdftoppm converts, pages are renamed to
the slot names below. 16:9 at 200 dpi.
"""
import subprocess, pathlib, shutil, sys

SLOTS = [
    ("p01-room", "TITLE SLIDE",
     "Wide shot of the Fort Collins room mid-talk. Audience faces lit by the "
     "screen, not the stage. The point is the room, not the speaker -- if a "
     "speaker is visible at all they should be small and off to one side."),
    ("p02-justin", "ITEM 1 -- WHO IS TALKING",
     "Justin at the Nerd Nite Fort Collins mic, mid-sentence, hands moving. "
     "Not posed, not a headshot, no podium portrait. A frame grab off one of "
     "the show videos is better than anything taken on purpose."),
    ("p03-trajectories", "ITEM 1 -- TRAJECTORIES",
     "Many separate tracks arriving at one point. Hand-drawn pencil lines on "
     "a chart, or a long-exposure of light trails. Deliberately not a tidy "
     "infographic -- the lines should look flown, not plotted."),
    ("p04-donner", "ITEM 4 -- HANNAH, THE DONNER PARTY",
     "Hannah Bauer on stage at the Wolverine, her own Donner Party slide "
     "behind her. Ideally caught mid-laugh, or with the room mid-laugh. "
     "Second choice: her poster art for S2025E01."),
    ("p05-mars", "ITEM 6 -- MARS",
     "A rover alone on Mars with an empty horizon behind it. No people, no "
     "mission control, no Earth in frame. The emptiness is the whole argument, "
     "so pick the loneliest NASA/JPL public-domain frame available."),
    ("p06-john", "ITEM 7 -- JOHN ANDERSON, WORM MAJIX",
     "John at the Wolverine, dressed exactly as he dresses for any other "
     "evening there, talking with his hands. DO NOT put his abstract text on "
     "a slide. The slide is the man, not the paragraph."),
    ("p07-organ-build", "ITEM 8 -- THE ASSEMBLY",
     "Hands. Audience members at tables with organ parts spread out in front "
     "of them, mid-assembly. Faces optional, hands mandatory. If one frame "
     "shows strangers building something together, that is the one."),
    ("p08-organ-play", "ITEM 8 -- THE VOLUNTEER AND THE ORGAN",
     "Joel Bacon at the keyboard of the assembled 2-octave organ AND the "
     "volunteer working the pump handle, both in the same frame. The volunteer "
     "is not optional -- without that person there is no sound, and that is "
     "the last thing the room sees before the close."),
]

HEAD = r"""\documentclass[10pt]{article}
\usepackage[paperwidth=160mm,paperheight=90mm,margin=9mm]{geometry}
\usepackage[T1]{fontenc}
\usepackage{helvet,inconsolata,tikz,xcolor}
\renewcommand{\familydefault}{\sfdefault}
\usetikzlibrary{calc}
\definecolor{bg}{HTML}{14161A}
\definecolor{fg}{HTML}{E8E6E1}
\definecolor{dim}{HTML}{8A9199}
\definecolor{acc}{HTML}{E0A33E}
\pagecolor{bg}\color{fg}\pagestyle{empty}
\setlength{\parindent}{0pt}
\newcommand{\slot}[3]{%
  \begin{tikzpicture}[remember picture,overlay]
    \draw[dim,dashed,line width=0.4pt]
      ($(current page.north west)+(6mm,-6mm)$) rectangle
      ($(current page.south east)+(-6mm,6mm)$);
    \foreach \c/\x/\y in {north west/6/-6, north east/-6/-6,
                          south west/6/6,  south east/-6/6} {
      \draw[acc,line width=1pt]
        ($(current page.\c)+(\x mm,\y mm)$) -- ++({sign(\x)*7mm},0);
      \draw[acc,line width=1pt]
        ($(current page.\c)+(\x mm,\y mm)$) -- ++(0,{sign(\y)*7mm});
    }
  \end{tikzpicture}%
  \vspace*{2mm}
  {\ttfamily\footnotesize\color{acc} PLACEHOLDER\hfill img/#1.png}\\[1mm]
  {\color{dim}\rule{\linewidth}{0.4pt}}\\[3mm]
  {\bfseries\large #2}\\[3mm]
  {\color{dim}\small The photograph that belongs here:}\\[1.5mm]
  \begin{minipage}{0.96\linewidth}\raggedright #3\end{minipage}
  \vfill
  {\ttfamily\scriptsize\color{dim} swap this file, keep the name, rerun make}
}
\begin{document}
"""

def main():
    here = pathlib.Path(__file__).parent
    build, img = here / "build", here / "img"
    build.mkdir(exist_ok=True); img.mkdir(exist_ok=True)
    tex = [HEAD]
    for i, (name, head, desc) in enumerate(SLOTS):
        if i: tex.append(r"\newpage")
        tex.append(r"\slot{%s}{%s}{%s}" % (name, head, desc))
    tex.append(r"\end{document}")
    src = build / "placeholders.tex"
    src.write_text("\n".join(tex))

    for _ in range(2):   # tikz remember picture needs two passes
        r = subprocess.run(["pdflatex", "-interaction=nonstopmode",
                            "-halt-on-error", "placeholders.tex"],
                           cwd=build, capture_output=True, text=True)
    if r.returncode:
        sys.stderr.write(r.stdout[-3000:]); sys.exit("pdflatex failed")

    subprocess.run(["pdftoppm", "-png", "-r", "200", "placeholders.pdf", "pl"],
                   cwd=build, check=True)
    pages = sorted(build.glob("pl-*.png"))
    if len(pages) != len(SLOTS):
        sys.exit(f"expected {len(SLOTS)} pages, got {len(pages)}")
    for page, (name, _, _) in zip(pages, SLOTS):
        target = img / f"{name}.png"
        if target.exists() and target.stat().st_size and not _is_placeholder(target):
            print(f"  keep    {target.name}  (real image already in place)")
            page.unlink(); continue
        shutil.move(str(page), target)
        (img / (name + ".placeholder")).write_text(
            "generated by make-placeholders.py; delete this marker when the "
            "real photograph replaces the PNG\n")
        print(f"  wrote   {target.name}")

def _is_placeholder(p: pathlib.Path) -> bool:
    """Only overwrite PNGs this script made. A sidecar marker is written next
    to each generated placeholder; drop a real photograph in and delete the
    marker (or just overwrite the PNG and remove the .placeholder file) and
    this script will never touch it again."""
    return (p.parent / (p.stem + ".placeholder")).exists()

if __name__ == "__main__":
    main()

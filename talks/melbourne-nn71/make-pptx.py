#!/usr/bin/env python3
"""slides.pptx — the deck as PowerPoint, for a venue that wants .pptx.

NO SPEAKER NOTES, DELIBERATELY. Two reasons, and both were learned the hard
way on 13 Oct.

1. COMPATIBILITY. A build carrying notes slides opened in Google Slides and
   was refused by Keynote outright. Stripping the notes slides, the notes
   master, the notesSz element and the docProps thumbnail produced a file
   Keynote opens. (Which of those four was the actual culprit is unknown --
   they were removed together and it did not seem worth his time to bisect.)
   A Google Slides round-trip was tried as an alternative and was WORSE: the
   file Google exports does not open in Keynote at all.

2. PRIVACY, which matters independently. The notes are his stage directions --
   "do not read his abstract aloud", "one sentence then stop", "ask it and do
   not answer it". Those belong to him, not to the venue running the deck.
   notes.pdf is the lectern copy and does not leave his machine.

WHY IMAGES AND NOT TEXT BOXES. Converting LaTeX layout into native PowerPoint
shapes means PowerPoint re-flows it: fonts substitute, line breaks move, and
a slide that was checked for orphans on this machine is not the slide that
appears on theirs. One full-bleed image per slide cannot re-flow. It is not
editable, which for a deck that gets shown and not edited is the right trade.

Needs: python-pptx, pdftoppm (poppler).
"""
import re, subprocess, sys, tempfile, pathlib
from pptx import Presentation
from pptx.util import Emu

HERE = pathlib.Path(__file__).parent
PDF  = HERE / "slides.pdf"
OUT  = HERE / "slides.pptx"
DPI  = 150
W_EMU, H_EMU = 12192000, 6858000   # PowerPoint's canonical 16:9, exactly

def notes_from_body():
    """Pull each \\note{...} out of body.tex and flatten it to plain text."""
    s = (HERE / "body.tex").read_text()
    spans, i = [], 0
    while True:
        i = s.find("\\note{", i)
        if i < 0: break
        j, depth = i + 6, 1
        while depth:
            if s[j] == "{": depth += 1
            elif s[j] == "}": depth -= 1
            j += 1
        spans.append(s[i+6:j-1]); i = j
    out = []
    for n in spans:
        t = n
        t = re.sub(r'\\begin\{itemize\}\\itemsep1pt', '', t)
        t = re.sub(r'\\(?:begin|end)\{itemize\}', '', t)
        t = t.replace("\\item", "\u2022")
        t = re.sub(r'\\textbf\{([^{}]*)\}', r'\1', t)
        t = re.sub(r'\\textit\{([^{}]*)\}', r'\1', t)
        t = t.replace("\\quad", "  ").replace("\\\\", "\n")
        t = t.replace("$\\leftarrow$", "<-").replace("---", "\u2014")
        t = t.replace("``", '"').replace("''", '"')
        t = re.sub(r'\\[a-zA-Z]+', '', t)
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r'\n\s*\n+', '\n', t).strip()
        out.append(t)
    return out

def main():
    if not PDF.exists(): sys.exit("build slides.pdf first (make)")
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(["pdftoppm", "-jpeg", "-r", str(DPI), "-jpegopt", "quality=88",
                        str(PDF), f"{td}/s"], check=True)
        pages = sorted(pathlib.Path(td).glob("s-*.jpg"))
        if not pages: sys.exit("pdftoppm produced nothing")
        prs = Presentation()
        prs.slide_width, prs.slide_height = Emu(W_EMU), Emu(H_EMU)
        blank = prs.slide_layouts[6]           # 6 is the blank layout
        for img in pages:
            sl = prs.slides.add_slide(blank)
            sl.shapes.add_picture(str(img), Emu(0), Emu(0),
                                  width=prs.slide_width, height=prs.slide_height)
        prs.save(OUT)
    _keynote_fixups(OUT)
    mb = OUT.stat().st_size / 1e6
    print(f"slides.pptx  {len(pages)} slides, {mb:.1f} MB, "
          f"{W_EMU/914400:.4f}x{H_EMU/914400:.1f} in, "
          f"no notes slides (see docstring)")

def _keynote_fixups(path):
    """Make the file acceptable to Keynote as well as PowerPoint.

    Keynote rejected the first build outright -- "the file format is invalid"
    -- while the zip was intact and every XML part well-formed. Two causes,
    both inherited from python-pptx's default template:

    1. THE FATAL ONE. Setting slide_width/height changes cx and cy but leaves
       the sldSz type attribute alone, so the file declared 13.33x7.5 inches
       AND type="screen4x3" at the same time. PowerPoint tolerates the
       contradiction; Keynote does not.
    2. ppt/printerSettings/printerSettings1.bin, a binary part Keynote has no
       use for. Dropped along with its relationship and its content-type
       default.
    """
    import zipfile, re, shutil, tempfile, os
    src = zipfile.ZipFile(path)
    items = [(i, src.read(i.filename)) for i in src.infolist()]
    src.close()
    tmp = tempfile.mktemp(suffix=".pptx")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as out:
        for info, data in items:
            n = info.filename
            if any(n.startswith(d) or n == d for d in
                   ("ppt/printerSettings/", "ppt/notesSlides/",
                    "ppt/notesMasters/", "docProps/thumbnail.jpeg")):
                continue
            if n == "ppt/presentation.xml":
                t = data.decode("utf-8")
                t = re.sub(r'(<p:sldSz[^>]*?)\s*type="[^"]*"', r'\1', t)
                t = t.replace("<p:sldSz ", '<p:sldSz type="screen16x9" ', 1)
                t = re.sub(r'<p:notesSz[^>]*/>', '', t)
                data = t.encode("utf-8")
            if n.endswith(".rels"):
                t = data.decode("utf-8")
                t = re.sub(r'<Relationship[^>]*'
                           r'(printerSettings|notesSlide|notesMaster)[^>]*/>',
                           '', t)
                data = t.encode("utf-8")
            if n == "[Content_Types].xml":
                t = data.decode("utf-8")
                t = re.sub(r'<Default Extension="bin"[^>]*/>', '', t)
                t = re.sub(r'<Override[^>]*'
                           r'(notesSlide|notesMaster|thumbnail)[^>]*/>', '', t)
                data = t.encode("utf-8")
            out.writestr(info, data)
    shutil.move(tmp, path)


if __name__ == "__main__":
    main()

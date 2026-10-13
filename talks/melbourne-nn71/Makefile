# "You Had to be There" -- Nerd Nite Melbourne #71
#
#   make            slides.pdf (the deck)
#   make notes      notes.pdf  (lectern copy: the beats, timings and warnings)
#   make small      slides-small.pdf, JPEG-encoded, for email
#   make clean      drop build artefacts, keep img/ and the PDFs
#
# To add a photograph: drop img/<name>.jpg or .png in, then `make`. The slot
# picks it up automatically. Nothing in body.tex changes. Names are in README.

LATEX = xelatex -interaction=nonstopmode -halt-on-error -output-directory=build
IMGS  = $(wildcard img/*) nnfc.tex assets/NNFoCoLogo.pdf

.PHONY: all notes small clean
all: slides.pdf
notes: notes.pdf
small: slides-small.pdf

slides.pdf: slides.tex body.tex $(IMGS)
	@mkdir -p build
	@$(LATEX) slides.tex >/dev/null && $(LATEX) slides.tex >/dev/null
	@cp build/slides.pdf .
	@echo "slides.pdf  $$(pdfinfo slides.pdf | awk '/^Pages/{print $$2}') pages"

notes.pdf: notes.tex body.tex nnfc.tex
	@mkdir -p build
	@$(LATEX) notes.tex >/dev/null && $(LATEX) notes.tex >/dev/null
	@cp build/notes.pdf .
	@echo "notes.pdf   lectern copy"


slides-small.pdf: slides.tex body.tex nnfc.tex $(IMGS)
	@./make-small.sh

clean:
	@rm -rf build small

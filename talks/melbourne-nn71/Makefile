# "You Had to be There" -- Nerd Nite Melbourne #71
#
#   make            slides.pdf (the deck)
#   make notes      notes.pdf  (lectern copy: the beats, timings and warnings)
#   make images     regenerate placeholder meta-images
#   make clean      drop build artefacts, keep img/ and the PDFs
#
# To swap in a real photograph: overwrite img/<name>.png, delete the matching
# img/<name>.placeholder marker, then `make`. Nothing in body.tex changes.

LATEX = pdflatex -interaction=nonstopmode -halt-on-error -output-directory=build
IMGS  = $(wildcard img/*.png)

.PHONY: all notes images clean
all: slides.pdf
notes: notes.pdf

slides.pdf: slides.tex body.tex $(IMGS)
	@mkdir -p build
	@$(LATEX) slides.tex >/dev/null && $(LATEX) slides.tex >/dev/null
	@cp build/slides.pdf .
	@echo "slides.pdf  $$(pdfinfo slides.pdf | awk '/^Pages/{print $$2}') pages"

notes.pdf: notes.tex body.tex
	@mkdir -p build
	@$(LATEX) notes.tex >/dev/null && $(LATEX) notes.tex >/dev/null
	@cp build/notes.pdf .
	@echo "notes.pdf   lectern copy"

images:
	@python3 make-placeholders.py

clean:
	@rm -rf build

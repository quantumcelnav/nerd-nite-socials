#!/usr/bin/env python3
"""
Newsletter link checker.

Built after the October 2026 issue shipped with a dead Call For Speakers button
for the third consecutive send: it pointed at a Google Form's /edit URL, which
returns a permission error for anyone who is not an editor on the form.

That is the class of error a human cannot catch by re-reading their own copy for
the twelfth time, and a machine catches for free.

Usage:
    python3 tools/newsletter/check_links.py newsletters/2026-10-newsletter.html

Exit code 1 if anything fails, so it works as a CI gate.
"""

import re
import sys
import urllib.request
import urllib.error

# Patterns that are wrong even when they return HTTP 200.
TRAPS = [
    (r"docs\.google\.com/forms/[^\s\"']*/edit",
     "Google Form EDIT url — public users get a permission error. Use /viewform or forms.gle."),
    (r"docs\.google\.com/(document|spreadsheets|presentation)/[^\s\"']*/edit",
     "Google Doc EDIT url — grants or demands edit access. Use /view or a share link."),
    (r"eventbrite\.[^\s\"']*aff=ebdsshcopyurl",
     "Eventbrite 'copy link' url — its utm params misattribute newsletter sales as social/discovery."),
    (r"/preview\?|[?&]aff=oddtdtcreator",
     "Eventbrite creator PREVIEW url — not reachable by the public."),
    (r"https?://localhost|https?://127\.0\.0\.1",
     "localhost url left in the copy."),
    (r"example\.com|TODO|FIXME|\[DATE\]|\[LINK\]",
     "placeholder left in the copy."),
]

UA = {"User-Agent": "Mozilla/5.0 (newsletter-link-check)"}


def extract(html):
    urls = re.findall(r'href=["\'](https?://[^"\']+)["\']', html)
    urls += re.findall(r'(?<!["\'=])(https?://[^\s<>"\']+)', html)
    seen, out = set(), []
    for u in urls:
        u = u.rstrip('.,;)')
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def main(path):
    html = open(path, encoding="utf-8").read()
    urls = extract(html)
    print(f"{path}: {len(urls)} unique links\n")

    failures = []

    for pat, why in TRAPS:
        for hit in set(re.findall(pat, html, re.I)):
            failures.append(f"TRAP  {why}\n      matched: {hit}")

    for u in urls:
        try:
            req = urllib.request.Request(u, headers=UA, method="HEAD")
            code = urllib.request.urlopen(req, timeout=12).status
        except urllib.error.HTTPError as e:
            code = e.code
            if code in (403, 405):          # bot-blocked or HEAD unsupported
                try:
                    req = urllib.request.Request(u, headers=UA)
                    code = urllib.request.urlopen(req, timeout=12).status
                except Exception as e2:
                    code = getattr(e2, "code", str(e2))
        except Exception as e:
            code = str(e)

        ok = code == 200
        print(f"  {'ok ' if ok else 'FAIL'}  {code}  {u}")
        if not ok:
            failures.append(f"HTTP  {code}\n      {u}")

    print()
    if failures:
        print(f"{len(failures)} problem(s):\n")
        for f in failures:
            print(f + "\n")
        return 1
    print("all links ok")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))

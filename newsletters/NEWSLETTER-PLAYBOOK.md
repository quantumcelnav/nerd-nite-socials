# Newsletter playbook

Written 1 Oct 2026 after building the October issue. Things to fix, and how to
make next month faster than this month.

---

## ⚠ Fix now — the Call For Speakers button is broken

The **SIGN UP TO SPEAK!** button points at:

```
https://docs.google.com/forms/d/1VrFWgvGkkFF8qcUmvZ9cLCiVrptaYjAFXsN72xaokx4/edit
```

That is the **form editor** URL, not the public response URL. Anyone who is not
an editor on that form gets a "You need permission" page. It was the same link in
the September issue, so it has been dead for at least two sends to ~550 people.

**Fix:** open the form, hit Send or Share, and use the `/viewform` or `forms.gle`
link instead. Then click it from a logged-out browser before shipping.

If speaker submissions have felt thin, this is a candidate explanation and it is
cheap to rule out.

---

## Accessibility and images-off

**Every image in the October issue has `alt=""`.** That includes Jennie's poster
and all five of Joe's slides.

Many clients block images by default and some readers use screen readers. Right
now, with images off, a reader gets **nothing** about the Dark Sky Weekend — no
address, no dates, no times — because all of it lives only inside the slide
images. Same for the Singles Night poster.

**Two things for next month:**

1. Write real alt text on every image. One honest sentence: "Poster: Nerd Nite
   Singles Night, Thursday October 15, 6:30pm, Wolverine Farm."
2. **Never let an image be the only place a fact appears.** If a date, address or
   price is in a graphic, put it in the body text too. The October issue got this
   right for Singles Night and wrong for the Dark Sky Weekend.

---

## The inline-font problem, which cost an hour today

Every paragraph carries its own
`<span style="font-family: 'Courier New', …">`. That is why pasting anything new
fought the template, and why each fix had to be hand-edited block by block.

**Better:** set Courier as the template's global font once, in Mailchimp's design
settings, then text blocks inherit it and plain `<p>` paste works cleanly.

Until that is done, the body copy has to be written as styled HTML up front —
which is what `2026-10-newsletter.html` is for.

---

## What pasting markdown actually does

Pasting markdown into a Mailchimp text block converts `**text**` to
`<strong>text</strong>` **and leaves the literal asterisks in place.** So the bold
is right and there are stray `**` everywhere. Inline links written as
`text (https://url)` paste as literal text plus a bare URL.

**Don't paste the `.md`.** Use the `.html` file through the `<>` source editor.

---

## Pre-send checklist

Campaign settings
- [ ] Subject line says the right month
- [ ] Preview text updated — it defaults to last month's when a campaign is duplicated
- [ ] Preview text differs from the subject line rather than repeating it

Content
- [ ] Upcoming Schedule block lists **this** month's event, not just next month's
- [ ] Every image has alt text
- [ ] Every fact in an image also appears in body text
- [ ] No stray `**` anywhere
- [ ] Any "this morning / today / this week" phrasing still true on the send date

Links — click every one from a logged-out browser
- [ ] Ticket link resolves to the public event page, not a creator preview
- [ ] Ticket link carries a newsletter attribution, not Eventbrite's `aff=ebdsshcopyurl`
      social/discovery params, which misattribute newsletter sales
- [ ] Call For Speakers form is the **public** link, not `/edit`
- [ ] Any mailto is a real `mailto:` anchor

Compliance
- [ ] Physical mailing address present in the footer (CAN-SPAM). Not visible in the
      October HTML — verify Mailchimp is injecting it from the audience settings.

Final
- [ ] Test sent to **Senne, Jamie and Hannah**, not only to Justin. By the time the
      copy is finished the author cannot see it any more.

---

## Things that worked, keep doing

- Drafting in the repo first, so the copy is versioned and reviewable before it
  touches Mailchimp.
- Measuring voice rather than guessing at it — running the styloprobe prose
  extractor over past newsletters against the draft caught type-token ratio 17%
  high and comma rate 36% high, which is what made the first draft read as
  marketing copy instead of as Justin.
- Pulling event details from the source emails rather than retyping them.
- Keeping a contributor's details inside their own attachment instead of
  transcribing them, which is both more accurate and respects how Joe asked for
  his information to be handled.

---

## Standing constraint

Joe Izen's Dark Sky Weekend is **newsletter only**. His instruction of 30 Aug:
his name, address, email and phone are in the invitation, so no social posts.
Newsletter distribution he approved explicitly. This applies every time his event
appears.

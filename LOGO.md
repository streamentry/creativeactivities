# Creative Activities — logo and app icon prompt

**Status:** brief and prompts. The direction below was adopted on 2026-11-13 as raster art in
`brand/` (see `DESIGN.md`); the vector redraw and resemblance search below are still open.
`DESIGN.md` stays the design contract; if this file and `DESIGN.md` disagree, `DESIGN.md` wins.
Any chosen direction must be redrawn as vectors, checked against the tests at the end, and
searched for resemblance to existing marks before it ships.

## The idea in one line

**Two different pieces of paper, laid one over the other. The logo is the part they share.**

One piece is cut clean with scissors. The other is torn by hand. They are not the same shape,
not the same size, and not perfectly aligned, because the two people making something together
are not the same either. Where they overlap, a third shape appears that neither piece has alone.
That overlap is the brand.

Why this and not something safer:

- It is the product, literally: paper, on a table, two people.
- It has no letter, word, face, hand, or heart in it, so it reads the same in all 185 languages
  and right-to-left scripts.
- The torn edge is deliberately imperfect. Every other app icon in the category is a smooth
  gradient glyph. This one looks made, not rendered.
- It says "unfinished is fine", which is the product's promise: making matters more than the result.

## What the brand must feel like

Warm, capable, calm, dignified. The gentleness of a well-made children's book, the clarity of a
field guide, the usefulness of a good recipe. It is for adults. It is never a hospital portal and
never a noisy kids' app.

## Colors (use only these)

| Role | Token | Hex |
| --- | --- | --- |
| Clean-cut paper shape | ink | `#24372F` |
| Torn paper shape | clay | `#BB6C4D` |
| The overlap | sun | `#F4CD76` |
| Background | canvas | `#FAF8F2` |
| Optional quiet second background | sage | `#D9E8DA` |
| Wordmark | ink | `#24372F` |

No gradients, no glow, no glass, no drop shadow beyond one soft, short paper shadow. Sun and clay
are fills only; never set small text in them.

## Prompt 1 — the mark (start here)

> Design a logo mark for "Creative Activities", a free library of simple things two people can
> make together, used by families with older adults and children in every country.
>
> The mark is two flat pieces of paper overlapping on a warm off-white table (#FAF8F2), seen
> straight from above. The lower piece is a deep green-black (#24372F) with clean, confident,
> scissor-cut edges: a soft asymmetric shape, somewhere between a rounded square and a leaf,
> rotated about 8 degrees. The upper piece is terracotta clay (#BB6C4D) and has been torn by hand:
> its edge is irregular, with a visible pale torn-paper fibre line along one side. It sits
> off-centre, covering roughly a third of the lower piece. Where the two overlap, the area is a
> flat warm yellow (#F4CD76), as if the two colours made a third. The overlap shape is the hero:
> it should be the most memorable silhouette in the image, bold and simple enough to draw from
> memory.
>
> Style: cut-paper collage, flat colour, very slight real paper grain, one short soft shadow under
> the top sheet. Hand-made but precise, like a mid-century print or a Matisse cut-out reduced to
> three shapes. Generous empty space around the mark. Centred composition, square format.
>
> Do not include any text, letters, faces, hands, hearts, brains, paintbrushes, pencils,
> puzzle pieces, lightbulbs, medical symbols, crosses, ribbons, rainbows, confetti, stars,
> sparkles, gradients, 3D rendering, glossy effects, or mascots. No childish or cartoon style.
> No more than three colours plus the background.

## Prompt 2 — the app icon

> Design an iOS and Android app icon from this mark: two overlapping paper shapes, one
> clean-cut in deep green-black (#24372F), one hand-torn in terracotta (#BB6C4D), with their
> overlap in flat warm yellow (#F4CD76).
>
> Full-bleed square, 1024 x 1024, no rounded corners drawn in (the system masks it), no border,
> no text. Background is warm off-white (#FAF8F2). The mark fills about 70 percent of the square
> and is slightly larger and bolder than in the logo, with the torn edge simplified to five or six
> large tears so it survives at small size. The yellow overlap sits near the optical centre. Keep
> every important edge inside the central 80 percent safe area.
>
> It must be recognisable at 60 pixels on a crowded home screen next to bright gradient icons:
> the calm, flat, paper-coloured square is the differentiator. Flat colour, faint paper grain,
> one soft short shadow. No gloss, no gradient, no 3D, no letters.
>
> Also produce: a dark version on #16231D with the lower sheet in #FAF8F2, and a single-colour
> version in #24372F on transparent where the overlap is shown as a cut-out hole.

## Prompt 3 — the wordmark and lockup

> Create a horizontal logo lockup: the two-paper mark on the left, and the words
> "Creative Activities" on the right in deep green-black (#24372F) on warm off-white (#FAF8F2).
>
> Set the words in a highly legible humanist sans serif in the style of Atkinson Hyperlegible,
> bold weight, sentence case with a capital C and capital A, never all capitals, normal letter
> spacing, on one line. The x-height of the text aligns with the height of the yellow overlap
> shape. The gap between mark and text equals the width of the letter "a". One optional detail
> only: the dot of an "i" is a tiny torn-paper shape in terracotta (#BB6C4D).
>
> Also show a stacked version (mark above, words on two lines, left-aligned) and a small footer
> version with "creativeactivities.org" in regular weight beneath. No tagline, no other graphics.

## Directions worth exploring (run each as a variation of Prompt 1)

1. **The window.** Reverse it: the overlap is a hole, and you see the table through both sheets.
2. **The fold.** One sheet only, folded once so its underside (clay) crosses its face (ink);
   the fold is the shared space. Simplest, most stamp-like.
3. **The pass.** The torn sheet is clearly a piece torn *from* the cut sheet and handed across:
   the gap it left and the piece itself have matching edges.
4. **The open bracket.** The two sheets sit so the negative space between them, not the overlap,
   forms a soft open curve. Do not force it into a letter C; it should work for readers of
   Arabic, Hindi, Chinese and Vietnamese equally.
5. **Three sheets.** A third, smaller sage sheet for a grandchild. Only keep it if it is still
   legible at 24 px.

Generate at least 20 marks per direction, pick by silhouette in black first, add colour last.

## Reject on sight

- Anything with a heart, hands, brain, head profile, paintbrush, palette, puzzle piece or tree.
- Anything that looks medical, clinical, charitable-ribbon, or like a memory or brain-training app.
- Anything babyish: crayons, balloons, bubble letters, smiling objects.
- Anything that needs a gradient, an outline or a shadow to be understood.
- Anything that resembles an existing mark (check overlapping-shape marks in particular:
  payment networks, design tools, slide and document apps).

## Acceptance tests before adoption

- Reads as the same mark in one colour, as a 24 px stamp, and as a 16 px favicon.
- Yellow overlap against both neighbours and all text pairings meet the contrast rules in `DESIGN.md`.
- Recognisable when mirrored for right-to-left layouts, and with no meaning that depends on a letter.
- Shown unlabelled to caregivers and older adults: nobody says "hospital", "kids' app" or "test".
- Trademark and visual-similarity search done in the launch markets.
- Final art is hand-redrawn vector; AI output is a sketch, not the asset. Update `DESIGN.md`
  and the store art together when a mark is adopted.

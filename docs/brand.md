# Brand — Spartan Game Studios

Everything here derives from one artefact: the logo. A bronze Corinthian helmet
over a skull, ringed by a Greek meander, on true black, with a bone-white Roman
wordmark and a widely tracked "GAME STUDIOS" band beneath it.

The tokens live in [`src/styles/tokens.css`](../src/styles/tokens.css). This
document is the reasoning behind them.

## Typefaces

| Role        | Face                      | Why                                                                                                                                                                                                                                                           |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display     | **Cinzel** (variable)     | The wordmark is cut from the Trajan lineage — Roman inscriptional capitals, high stroke contrast, sharp bracketed serifs, flat-apex `A`. Cinzel is the best free face in that lineage and is a near match. Use for `h1`/`h2`, the wordmark, and nothing else. |
| Body        | **Barlow**                | A neutral grotesque with a faint mechanical, slightly squared edge — enough character to sit under Roman caps without arguing with them, and far more legible at paragraph size than any serif would be here.                                                 |
| UI / labels | **Barlow Semi Condensed** | Tracked-out uppercase for eyebrows, badges, nav, and buttons — the same treatment as the logo's "GAME STUDIOS" band. The condensation keeps long labels on one line at small sizes.                                                                           |

All three are OFL, self-hosted via `@fontsource` (no Google Fonts CDN request,
no privacy footprint, and Vite fingerprints the files for permanent caching).
Only the weights actually used are imported — see `src/styles/fonts.css`.

**Rules**

- Cinzel is **uppercase only**. Its lowercase exists but is not what the logo
  is, and mixed-case Cinzel reads as a wedding invitation.
- Cinzel always gets tracking (`--tracking-display`, 0.06em). Roman capitals set
  tight look cramped.
- Never set body copy in Cinzel. Never set a display heading in Barlow.
- Labels use `--tracking-wide` (0.14em); the smallest eyebrows use
  `--tracking-wider` (0.28em), matching the logo's subtitle band.

## Palette

Sampled from the logo's own pixels, not eyeballed. Two hues — gold and bone —
on black. That restraint is what makes a page read as the mark rather than
merely near it.

### Field

| Token                | Value     | Use                                                                                  |
| -------------------- | --------- | ------------------------------------------------------------------------------------ |
| `--sgs-black`        | `#000000` | Page background. The logo's field is true black; anything lighter breaks the lockup. |
| `--sgs-obsidian-900` | `#0c0c0d` | Cards, footer, raised surfaces.                                                      |
| `--sgs-obsidian-850` | `#121213` | Hover state for those surfaces.                                                      |

### Gold ramp

The helmet's shadow-to-highlight gradient, sampled across it.

| Token                | Value         | Use                                                           |
| -------------------- | ------------- | ------------------------------------------------------------- |
| `--sgs-gold-900`     | `#302418`     | Deepest bronze; shadow only.                                  |
| `--sgs-gold-800`     | `#483c18`     | Accent rules, quiet borders.                                  |
| `--sgs-gold-700`     | `#6b5528`     | Borders, the meander pattern stroke.                          |
| `--sgs-gold-600`     | `#8a6d33`     | Dim accent text.                                              |
| `--sgs-gold-500`     | `#a88848`     | —                                                             |
| **`--sgs-gold-400`** | **`#c9a24f`** | **Brand core.** Accent text, primary button fill, active nav. |
| `--sgs-gold-300`     | `#e0c070`     | Hover/bright accent.                                          |
| `--sgs-gold-200`     | `#f0d890`     | Highlight; the top stop of the metallic gradient.             |

### Bone & neutral

| Token            | Value     | Use                                 |
| ---------------- | --------- | ----------------------------------- |
| `--sgs-bone`     | `#f0e4d0` | Primary text. The wordmark's white. |
| `--sgs-bone-dim` | `#c4b79e` | Body copy, secondary text.          |
| `--sgs-ash`      | `#8e8778` | Metadata, captions, disabled.       |

### Reserved

`--sgs-ember` (`#8e2b20`) is deliberately unused. It exists so that if a
"danger" or "sale" state is ever needed there is one sanctioned non-gold hue
rather than an ad-hoc red picked under pressure.

### Contrast

Bone on black is ~15:1; gold-400 on black is ~8:1; ash on black is ~6:1. All
clear AA for their sizes. Do not put gold text on a gold fill — the primary
button uses `--color-on-accent` (near-black) for exactly that reason.

## Metallic lettering

Display headings use `.u-gold-text`, a `background-clip: text` sweep from
`--gradient-gold` that mirrors the logo's top-lit-to-shadowed lettering. It is
behind an `@supports` check with a flat-gold fallback, so the text is never
invisible.

Use it on `h1` and hero/section titles. Do not use it on body copy or anything
under ~1.25rem — the gradient collapses into mud at small sizes.

## Ornament

**The meander rule** (`<MeanderRule />`) is the logo's ring unrolled into a
horizontal divider — an inline SVG pattern in `--pattern-meander`, faded at both
ends so it reads as ornament rather than a hard edge. Use it once under a page
title or hero. Two on a screen is one too many.

**The lozenge** — a 45°-rotated square in gold — is the shield-boss shape from
the mark, used for list bullets and the dot on status badges. It is the only
non-rectangular shape in the system.

## Shape

Corners stay sharp: `--radius-sm` is 2px, `--radius-md` is 3px, and there is no
larger value on purpose. This is cut stone and cast bronze, not soft plastic.
Borders are 1px hairlines in `--color-border`; the accent border is bronze, not
gold, so it recedes.

## Logo usage

Files live in `public/brand/` and are offered on `/press`.

- Keep clear space of at least the helmet's width on all sides.
- Never recolour it, never place it on a light background, never stretch it.
- Minimum size 32px for the mark alone; below that use the pixel variant.
- The header lockup rebuilds the wordmark in live type (Cinzel + Barlow Semi
  Condensed) beside the mark rather than shipping the full logo image — it stays
  crisp at any DPI and costs nothing to load.

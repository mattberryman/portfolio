# One family, four sites: a unified design language

Assessment of mattberryman.com against paymentslaw.eu, 3dsspec.com and
transactionintelligence.net, with a proposal for a shared design language and
a scoped refresh of the portfolio. Written 18 September 2026 from the four
repositories at their current heads, checked against the live sites: the
production HTML of mattberryman.com is byte-identical to this branch's build
apart from Cloudflare's injected scripts, and the meta tags and OG images of
the other three were fetched from production.

## Summary

The four sites already share more than they appear to. All four set reading
text in Equity and interface text in Concourse, three of the four sit on a
warm off-white paper with a near-black ink, three of the four ship a
three-state light/dark/auto theme, and two of them (paymentslaw.eu and the
blog) already share a logo motif and a purple accent token that paymentslaw
copies verbatim from the blog's `tokens.css`. The typographic foundation of a
family exists. What is missing is a stated set of family rules, one place
where they live, and a portfolio that follows them.

The portfolio is the outlier, not the products. It is the only site without
dark mode, the only one whose accent matches nothing else, the only one with
no logo mark, and its content describes 2025 versions of the products: a
"41 legislative acts" figure against a registry of 51, a 3DS card that says
nothing about the reference library, checklists, version comparison or the
MCP servers that both products now ship, no project card for the blog at all,
six hard-coded article links, and an `og:image` that points at a file that
does not exist.

Recommendation: do not build a shared package. Adopt the blog theme's token
file as the family's reference token set, publish the family rules once in
this repository, and have each site carry its own copy of the small subset it
needs under its existing token names. Then rebuild the portfolio's content
and colour on those rules, regenerate all project artwork to one OG card
grammar, and make three small alignment changes on the product sites.

## Where each property stands

### mattberryman.com (this repository)

Vanilla HTML, one CSS file with `@layer`, Vite. Warm paper `#faf9f7`, ink
`#333`, accent `#5b4a8a` purple, Equity at a 25px body size, Concourse T6 and
Caps T3 for wayfinding. A three-slide autoplaying deck in the hero, a
featured-writing grid of six hand-coded article cards, a dark "Projects" band
with two cards, a Connect section, footer. No dark mode, no
`prefers-reduced-motion` guard on the deck or the fade-in animation, no logo
mark, portrait shipped but unused (`public/profile@2x.png`).

Content problems, all in `index.html`:

- The paymentslaw card (line 291) says "expanded to 41 legislative acts";
  the registry in `scripts/lib/document-registry.ts` holds 51 and the site's
  own README says so. The card's alt text repeats 41. The card art says "PiFA"
  where the copy says "FiDA".
- Neither product card mentions an MCP server, although paymentslaw.eu runs a
  free public one at `mcp.paymentslaw.eu` and 3dsspec.com has a private OAuth
  one with verified Claude connectivity. Neither mentions version comparison,
  the PSD2 to PSD3/PSR transition tracker, defined-term tooltips, the changes
  layer, the crawlable 3DS reference library, or the contextual checklist
  export. The 3DS copy still describes "browse message types" as the whole
  product.
- transactionintelligence.net has no project card. It appears only as six
  article links and a social button.
- The six article cards are frozen in HTML with no dates. All six are 2025
  pieces. The blog's feed shows six posts published between May and
  September 2026, including the pieces on giving an AI the source and on
  SCA in the PSR, and none of them is on the portfolio.
- `og:image` points at `/og-mattberryman.png`, which is not in `public/`
  and returns 404 in production, so every share of the profile has no card.
  The two project images that do exist are 510×320, not the 1200×630 the
  meta tags declare. The 3DS card bakes "v2.0.0 to v2.3.1.1" into pixels.
- "Thirteen years" appears in four places, `© 2026` is hard-coded, the
  sitemap `lastmod` is February, and the schema.org `sameAs` still lists a
  Mastodon address that was removed from the footer.
- `CLAUDE.md` points at a `memory/MEMORY.md` and a `wrangler.toml` that do not
  exist.

There is also a positioning question the design cannot answer. The hero
("Bringing domain depth to frontier AI") and the Connect copy ("I'm looking
for roles where AI meets regulated complexity") frame the page as a job
search. A professional profile for the person who builds and runs these three
properties would lead with the work. That is a decision for you, not a
finding; the proposal below assumes the page leads with the work and keeps a
contact section without the job-search framing, and it is easy to reverse.

### paymentslaw.eu

Astro, the most complete token system of the four
(`src-astro/css/layers/01-tokens.css`). Equity Text A for legislation (chosen
for lining figures in article citations), Concourse for chrome, Concourse
Index for markers, Equity Caps for acronyms, a system mono stack. Paper
`#fafaf9`, ink `#1a1a1a`, link accent `#2563eb`, a dark masthead in both
themes, and a separate "brand signature" of navy `#1e3a5f` and gold `#f4d03f`
reserved for marketing surfaces and the OG cards. It already carries a
"Transaction Intelligence bridge" block that mirrors the blog's purple
tokens, and its header and footer already link to the blog.

Identity: a navy rounded square holding a gold "connected network" glyph
(`public/favicon.svg`), with "paymentslaw.eu" always set as live Concourse
text. The OG pipeline (`scripts/build-og-cards.js`, satori and resvg) renders
1200×630 cards from the site's own woff2 files with a gold left spine,
eyebrow, Equity title, status dot, mark and wordmark, and a 6% watermark of
the glyph bleeding off the corner. Golden PNGs are tested. This is the
strongest artwork system in the family and the obvious template.

### 3dsspec.com

React explorer plus a generated static reference library. Concourse for UI,
Equity for reading, Triplicate for field names. Dark is the default
(`#151d24` slate), light is warm paper `#f5f4f0` with ink `#182329`. Brand
blue `#334fc4` is the constant; it is the fill of the "3" mark
(`public/icon.svg`) and the top rule on cards. The explorer is a dense 16px
data tool; the reference pages are an 18px editorial layout with an
on-this-page rail. The OG card is the odd one out: centred heavy Concourse
on a gridded dark canvas with seven colour-coded message pills and a version
range that will go stale.

Internal drift worth fixing while aligning: three parallel token sets with
the same values under different names (app, reference pages, OAuth page),
the mark rebuilt by hand with three different corner radii, no spacing or
radius tokens, and five names for the product ("3DS Reference", "3DS Protocol
Reference", "3DS Specification Reference", "3DS Ref", "EMV 3DS Specification
Explorer"). The explorer itself is the one surface that never shows the mark.

### transactionintelligence.net

Ghost theme, hand-written CSS, no build step. Paper `#FBF9F5`, ink
`#1A1814`, brand purple `#4B2E83` (dark `#A188E8`), six jewel category hues
mapped to one `--cat` variable per page, and a burnished gold reserved for
member product. Equity for display and prose with true small-caps lowercase
eyebrows tracked at `.1em`, Concourse for chrome, hairline rules instead of
shadows, 2 to 4px radii, a 68ch measure, a 1120/980/720 width ladder, two
breakpoints, three-state theme toggle with a no-flash boot script. The logo
is the same network glyph paymentslaw uses, in ink. No OG art ships in the
theme; the publication cover lives in Ghost admin.

## What is already shared and what diverges

| Dimension      | Portfolio                        | paymentslaw.eu                           | 3dsspec.com                    | Blog                   |
| -------------- | -------------------------------- | ---------------------------------------- | ------------------------------ | ---------------------- |
| Reading face   | Equity                           | Equity Text A                            | Equity                         | Equity                 |
| UI face        | Concourse T6 + Caps T3           | Concourse 4/6/7 + Caps + Index           | Concourse 4/6                  | Concourse OT 3/4/6/7   |
| Code face      | none                             | system mono (Triplicate shipped, unused) | Triplicate                     | system mono            |
| Light paper    | `#faf9f7`                        | `#fafaf9`                                | `#f5f4f0`                      | `#FBF9F5`              |
| Light ink      | `#333`                           | `#1a1a1a`                                | `#182329`                      | `#1A1814`              |
| Dark mode      | none                             | yes, three-state                         | yes, three-state, dark default | yes, three-state       |
| Accent         | `#5b4a8a`                        | `#2563eb` link; navy/gold brand          | `#334fc4`                      | `#4B2E83`              |
| Mark           | none                             | network glyph, gold on navy              | "3", white on blue             | network glyph, ink     |
| Eyebrow labels | Concourse Caps                   | Concourse Caps                           | uppercase Concourse            | Equity Caps, lowercase |
| OG card        | 510×320, two styles, one missing | generated, 1200×630, spine grammar       | static, centred, pills         | Ghost cover            |
| Cross-links    | to all three                     | to blog                                  | none                           | none                   |

The type is one family already. Paper and ink are within a few points of each
other. The real divergences are the portfolio's missing dark mode, four
unrelated accents, three unrelated OG styles, a mark on some sites and not
others, and no site telling the visitor it belongs to a family.

## The design language

The principle is one family, four members. Shared foundations make the
sites recognisably by the same hand; a per-site accent and mark keep each
product's own identity, which is an asset for paymentslaw.eu and
3dsspec.com and should not be flattened.

### Shared foundations

Typography stays exactly as the Butterick pairing already in use: Equity
for anything a person reads at length, Concourse for anything a person uses
to find their way, small caps for eyebrows, and Triplicate for code and
field names wherever code appears. The one change is to make the eyebrow
treatment uniform: Concourse Caps, tracked, on the three product-facing
sites, and the blog keeps its Equity Caps because it is editorial.

Surfaces converge on the blog's neutrals, because the blog has the most
complete and best-documented ladder and paymentslaw already copies from it:

| Token     | Light     | Dark                                        |
| --------- | --------- | ------------------------------------------- |
| paper     | `#FBF9F5` | `#0E0D14` (blog) or `#0f1419` (paymentslaw) |
| surface   | `#FFFFFF` | `#15141C`                                   |
| surface-2 | `#F4F0E9` | `#1B1A24`                                   |
| rule      | `#E5DFD4` | `#28263A`                                   |
| rule-soft | `#EFEAE0` | `#1F1E2A`                                   |
| ink       | `#1A1814` | `#ECE7DD`                                   |
| ink-2     | `#45413B` | `#C2BCAF`                                   |
| ink-3     | `#6B665C` | `#908A7E`                                   |
| ink-4     | `#94908A` | `#6A6557`                                   |

The two dark papers differ because the blog's dark is purple-warm and
paymentslaw's is slate-warm; each product keeps its own dark paper and the
portfolio takes the blog's.

Shape and depth: 1px hairline rules rather than shadows for structure, radii
of 2px for images, 4px for controls, 8px for cards, one card shadow for
floating elements only. Measure 66 to 68ch for prose, a 1120px content
width, 980 and 720px narrower steps.

Header grammar: mark and wordmark on the left, section links on the right,
theme toggle last. Footer grammar: a family strip on every site reading
"A Matt Berryman project" followed by the other three domains, then the
site's own links. This single line is the cheapest possible way to make the
family visible, and the only one of the four that has it today is
paymentslaw's link to the blog.

Status idiom: a filled dot before a status word, as paymentslaw uses for
"In force" and the blog uses for category eyebrows.

OG card grammar, adopted from paymentslaw: 1200×630, dark ground in the
site's own deep tone, a vertical spine in the site's accent down the left
edge, a Concourse Caps eyebrow, an Equity title, a secondary line in Equity,
the site's mark and wordmark bottom-left, the family line "A Matt Berryman
project" in small caps, and the mark as a 6% watermark bleeding off the
bottom-right corner. No counts and no version numbers on any card; those
are the two things that made the existing artwork stale.

### Per-site identity

| Site                        | Accent (light / dark)                           | Deep ground | Mark                                                 |
| --------------------------- | ----------------------------------------------- | ----------- | ---------------------------------------------------- |
| mattberryman.com            | `#4B2E83` / `#A188E8`                           | `#1F1A2E`   | portrait, plus the network glyph in ink as a favicon |
| paymentslaw.eu              | navy `#1e3a5f` + gold `#f4d03f`; link `#2563eb` | `#0f1c2e`   | network glyph, gold on navy                          |
| 3dsspec.com                 | `#334fc4`                                       | `#151d24`   | "3", off-white on blue                               |
| transactionintelligence.net | `#4B2E83` / `#A188E8`                           | `#0E0D14`   | network glyph, ink                                   |

The portfolio shares the blog's purple rather than keeping its own
`#5b4a8a`. The two are close enough that the current site is clearly
reaching for the same colour, and the personal voice and the personal
profile should share one accent. Navy and blue remain the property of the
two tools.

## Options

**Option A, a documented canonical with local copies (recommended).** The
family rules and the token table live in this repository under `docs/design/`.
The blog's `assets/css/tokens.css` is the reference implementation. Each
site carries its own copy of the subset it needs under its existing names:
the portfolio's `--surface` and `--ink`, paymentslaw's `--color-bg` and
`--color-text`, 3dsspec's `--bg-primary` and `--text-primary`. Nothing is
imported at build time. Trade-off: drift is possible and is caught only by
a human reading the table. In exchange there is no new package, no
cross-repository release coupling, no change to paymentslaw's CSS audit
gates or to 3dsspec's Cog-generated stylesheet, and the Ghost theme, which
has no build step, can participate at all.

**Option B, a shared tokens package.** One npm package publishing a CSS file
and a JSON token set, consumed by the three Node sites and vendored into the
Ghost theme. Trade-off: it guarantees consistency but creates a fifth
repository, a release process, and version pins in four places, for a token
set that is about forty lines. paymentslaw's rule that `01-tokens.css` owns
every font stack would need rewriting, and every token bump would trigger
its full certification path. Not worth it at this scale.

**Option C, refresh the portfolio only.** Leave the products alone and fix
the portfolio's content, dark mode and artwork. Trade-off: cheapest, and it
removes the worst problems, but the family stays invisible because none of
the products points back, and the 3dsspec OG card stays off-grammar. This is
the fallback if the product changes cannot be scheduled.

Recommendation is A, sequenced so that the portfolio lands first and the
product changes follow as three small pull requests.

## Portfolio refresh scope

This is a rework of content and colour within the existing structure, not a
rebuild. The single-file CSS, the `@layer` order, Vite and the no-framework
rule all stay.

Content. Replace the hero with name, a one-line description of the work, and
the portrait that already ships in `public/`. Retire the autoplaying slide
deck; the three slides say things the section copy can say once, and the
deck is the one moving element on the page with no reduced-motion guard.
Give the page three project cards of equal weight, in this order:
paymentslaw.eu, 3dsspec.com, transactionintelligence.net, each with a
current capability description, a "connect your AI" line where an MCP
server exists, and no numbers that a build somewhere else derives. Draft
copy for the three cards:

> **paymentslaw.eu.** EU payments law, built for people who have to use it.
> PSD2, PSD3, the PSR, FiDA, eIDAS2 and the AI Act, with the supporting acts
> around them, served as cross-linked, searchable provisions rather than
> EUR-Lex PDFs. Follow an obligation from PSD2 into PSD3 and the PSR article
> by article, hover a defined term for its in-force wording, and ground your
> AI in the corpus through a free MCP server.

> **3dsspec.com.** A source-attributed reference for EMV 3-D Secure. Every
> data element and message type in the current Core specification, with
> formats, values, inclusion conditions and the page they came from. Build a
> required-field checklist for a channel and category, compare reconstructed
> source cells across editions, and query the same reference from an MCP
> client.

> **transactionintelligence.net.** Independent essays on payments, behaviour
> and the quiet plumbing of finance. Long-form analysis of regulation, fraud,
> authentication and the systems behind them, with a members' tier for the
> pieces that go further.

Writing. Replace the six frozen cards with a build-time fetch of the blog's
RSS feed, rendered to the same card markup, so the list is current on every
deploy and needs no client-side JavaScript. This adds no runtime dependency;
Node's `fetch` and a small script in `vite.config.js` are enough. The fetch
should fail closed to the last committed snapshot so a blog outage cannot
break a deploy.

Colour. Adopt the family neutrals and the blog's purple, add a dark palette
under `prefers-color-scheme` with a `data-theme` override and the same
three-state toggle idiom as the other three sites, and add a
`prefers-reduced-motion` guard.

Artwork. Generate `og-mattberryman.png` and three project cards at 1200×630
in the shared grammar. paymentslaw's `scripts/lib/og/` is the model; the
portfolio has no build-derived data on its cards, so a one-off render
checked in as static PNGs is sufficient and keeps the no-dependency rule.

Hygiene. Fix the `sameAs` list, the sitemap date, the footer year, the
missing `knowsAbout`, and the two dangling references in `CLAUDE.md`.

## Changes on the other three sites

paymentslaw.eu: add the family strip to `SiteFooter.astro`, add the family
line to the site OG card next to the existing endorsement line, and nothing
else. Its neutrals already sit within a few points of the family values, and
a colour change to the reader would need the CSS audit runner and computed-
state checks, which is cost for no visible gain.

3dsspec.com: its live `og:title` is still "EMV 3DS Specification Explorer",
one of the five names. Regenerate `public/og-image.png` in the family grammar with the
blue spine and the "3" mark, and drop the version range from it. Add the
family strip to the explorer footer, the reference-page footer and the OAuth
page footer. Pick one product name (the README's "3DS Reference" is the
strongest candidate) and use it across the five surfaces. Collapse the three
token sets to one if it can be done in the Cog template without touching the
generated-asset parity check; otherwise leave it and record it.

transactionintelligence.net: add the family strip to `site-footer.hbs`, and
render a publication cover in the family grammar for Ghost admin so the
blog's social cards match the other three.

## Decisions needed

Whether the page leads with the work or with the job search. Whether the
portrait goes on the hero. Whether the portfolio takes the blog's purple, as
proposed, or keeps a distinct accent. Whether the product-site changes are
scheduled now or left as Option C. Everything else above is a routine
implementation choice.

## Status

The portfolio refresh described above is implemented on this branch:
family tokens with a three-state theme, portrait in the hero, three equal
project cards carrying each site's own mark and OG card, the Writing section
filled from the blog feed at build time with a committed fallback, four OG
cards in the shared grammar, monogram favicons, and the hygiene list. The
owner's decisions were: lead with the work and the skills for inbound
contacts, no job-search framing; portrait in the header; the blog's purple
as the portfolio accent; and the blog and paymentslaw.eu left as they are,
so the product-site changes above are recorded but not scheduled.

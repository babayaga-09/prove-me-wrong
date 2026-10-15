---
version: 1
slug: "web-app-thesis-page-tsx"
primary_target: "web/app/thesis/page.tsx"
related_targets: []
---

# Thesis tester (/thesis)

Scope: the thesis tester, Operate mode, inside the site world set by the home brief (canon: Groww/Zerodha register, pinned by the user). Job: pick a Nifty 50 stock, write or load three sentences, test them, and read verdicts with their evidence and track records.

## Direction contract

THESIS: A statement-style results table for your own view: each sentence is a line item with a lean bar, a verdict chip and the evidence behind it, closed by a double-ruled net position. It refuses green/red tiles and card grids for the results.

OWN-WORLD: Inherits the site tokens: white or dark ground, blue primary for actions, green/red/grey verdict chips that always carry an icon and a word, Figtree, 1px lines, soft radii.

STORY: Load an example or write three sentences, then Test my thesis. Rows resolve in order with a chip, a lean bar and an "Evidence says" restatement where the evidence disagrees. The evidence panel explains the selected row. The "What would prove me wrong" tab lists tripwires. Signals sit below in one table with each model's record.

FIRST VIEWPORT: Site navbar. Stock name heading with sector · close · date; stock select and the primary "Test my thesis" button; example links; tabs; the results table (# | sentence | Lean | Verdict); the evidence panel on the right.

FORM: Inherits the canon site world (home brief), seed f9e177e0.

Signature interaction: the Lean column. A diverging bar per sentence, its length set by evidence confidence, growing from the centre on Test. Reduced motion shows it final.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Agents need a Gemini key; fundamental claims show "Open" until then.
- DEFERRED: 'as of' axis; saved theses.

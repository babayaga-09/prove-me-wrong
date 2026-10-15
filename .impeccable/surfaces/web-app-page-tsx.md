---
version: 1
slug: "web-app-page-tsx"
primary_target: "web/app/page.tsx"
related_targets: []
---

# Home (landing page)

Scope: the home page, Persuade mode. Audience: an Indian retail investor first, a recruiter second. They should leave understanding that this tests *their* view on a Nifty 50 stock and is honest about its own accuracy, then click "Test your thesis".

## Direction contract

THESIS: A friendly retail-fintech home page at the craft level of Groww and Zerodha, where the hero demonstrates the mechanism with a real thesis, real verdicts and real data. It refuses a vague "AI predicts stocks" hero.

OWN-WORLD: The category standard, executed impeccably. White ground, cool off-white sections (#F6F8FB), one confident blue primary (#2F6BFF) for actions and links. Semantic green and red are reserved for verdicts (supported / undermined), each always with an icon and a word. Figtree throughout: bold, tight headlines and comfortable 16px body. Soft 12–16px radii, light 1px borders, gentle shadows only on floating cards. Dark theme via a toggle.

STORY: The hero says what it is in plain words and shows a live thesis card with three sentences and their verdicts. A strip of real numbers follows (50 stocks, years tested, models), then how it works in 3 steps, then "other apps vs us", then an honest scoreboard teaser that includes the loss, then Nifty 50 stocks to try (each opens the tester), then an FAQ that includes "is this advice? no", then the footer with the disclaimer.

FIRST VIEWPORT: A sticky top nav (wordmark, Home, Test a thesis, Scoreboard, How it works, theme toggle, primary "Test your thesis" button). Hero on the left: headline, subhead, primary and secondary CTAs, and a one-line trust note. On the right: a product card for HDFC Bank showing three sentences with verdict chips, built from real pipeline data.

FORM: Canon, pinned by the user (standing exit), with Groww and Zerodha named as the bar. Seed f9e177e0 (safer re-roll 1, superseded by the user's pin).

Signature interaction: the hero card replays its verdicts once on load (each chip resolves in sequence). Under reduced motion it shows them immediately.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

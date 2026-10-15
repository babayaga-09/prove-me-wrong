---
name: Prove Me Wrong
description: Test your own view on a Nifty 50 stock, sentence by sentence, in a clean Indian retail-fintech register.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-ink: "#2563eb"
  primary-soft: "#eaf1ff"
  for: "#067a52"
  for-wash: "#e6f6ef"
  against: "#c02a30"
  against-wash: "#fdecec"
  open-wash: "#f1f3f7"
  bg: "#ffffff"
  surface: "#f6f8fb"
  card: "#ffffff"
  fg: "#121826"
  fg-2: "#44506a"
  fg-3: "#636c80"
  line: "#e6eaf0"
  line-strong: "#d3d9e3"
  dark-primary-ink: "#8fb0ff"
  dark-primary-soft: "#1a2747"
  dark-for: "#3ccb8f"
  dark-for-wash: "#12302a"
  dark-against: "#ff7477"
  dark-against-wash: "#3a1c22"
  dark-open-wash: "#1d2433"
  dark-bg: "#0b0f17"
  dark-surface: "#111725"
  dark-card: "#151c2c"
  dark-fg: "#e8ebf2"
  dark-fg-2: "#aab3c5"
  dark-fg-3: "#7f899c"
  dark-line: "#222b3c"
  dark-line-strong: "#314058"
typography:
  display:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(40px, 5vw, 56px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 44px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  nav-item: "8px"
  control: "12px"
  panel: "16px"
  pill: "9999px"
spacing:
  gutter: "20px"
  gutter-md: "32px"
  card: "24px"
  row: "20px"
  section: "80px"
  frame: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  nav-link:
    textColor: "{colors.fg-2}"
    rounded: "{rounded.nav-item}"
    padding: "8px 12px"
  nav-link-active:
    textColor: "{colors.primary-ink}"
  select:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 36px 0 12px"
  chip-supported:
    backgroundColor: "{colors.for-wash}"
    textColor: "{colors.for}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    typography: "{typography.label}"
  chip-undermined:
    backgroundColor: "{colors.against-wash}"
    textColor: "{colors.against}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    typography: "{typography.label}"
  chip-open:
    backgroundColor: "{colors.open-wash}"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card}"
---

# Design System: Prove Me Wrong

## Overview

**Creative North Star: "The Honest Statement"**

Prove Me Wrong is built to the category standard of Indian retail fintech (the Groww and Zerodha register), executed carefully, under its own palette and wordmark. The page is white with cool off-white bands, there is one confident blue for anything you can press, and Figtree is used everywhere: bold, tight headlines over a calm 16px body. Nothing is decorative. Every number on the page comes from the pipeline, and the visual system's job is to keep those numbers legible and to keep its verdicts honest.

The world's signature is accounting rather than ornament. Results read as a statement: line items separated by hairlines, a diverging Lean bar per line, a verdict chip that always carries an icon and a word, and a net position closed by a double rule. Colour is spent sparingly. Blue means "you can act here". Green and red mean "the evidence decided", and they appear nowhere else as hue. Charts and data marks stay in neutral ink.

Density is moderate: generous section rhythm on the persuasive home page, tighter statement tables on the operating surfaces (tester, scoreboard). Light is the default theme and dark is a toggle; both are full themes with their own tuned values, and every text pair meets WCAG AA in both. The user explicitly rejected handwritten or novelty type, busy texture (ruled paper, grain, boxes everywhere), and private-client app shells.

**Key Characteristics:**
- White ground, cool off-white bands, one blue for actions and links.
- Green and red only for verdicts, always with an icon and a word.
- Figtree throughout; tabular numerals on by default.
- Statement grammar: hairline rows, Lean bars, double-ruled totals.
- 12px controls, 16px panels, pills for verdict chips.
- One 1200px frame shared by the nav, every page and the footer.

## Colors

A cool neutral field with a single saturated blue and a strictly rationed verdict pair.

### Primary
- **Action Blue** (primary): the fill of every primary button, the closing call-to-action band, the logo tile and the focus ring. White text on it passes AA (5.17:1). The same fill is used in both themes.
- **Action Blue Hover** (primary-hover): pressed/hover state of filled buttons only.
- **Link Blue** (primary-ink / dark-primary-ink): text-weight blue for links and the active nav item. It equals the fill in light theme and lifts to a pale periwinkle in dark so links stay AA on the dark ground.
- **Selection Wash** (primary-soft / dark-primary-soft): text selection and the selected row of an interactive table. A state colour, never a data colour.

### Secondary
- **Supported Green** (for / dark-for) on **For Wash** (for-wash / dark-for-wash): the "Supported" verdict, the For half of a Lean bar, the supported count in a net position.
- **Undermined Red** (against / dark-against) on **Against Wash** (against-wash / dark-against-wash): the "Undermined" verdict, the Against half of a Lean bar, the strike-through on an undermined sentence, and form errors.

### Neutral
- **Paper White** (bg / dark-bg): page ground.
- **Cool Band** (surface / dark-surface): alternating section bands, the footer, inset examples inside cards, hover fills, the evidence panel.
- **Card** (card / dark-card): floating panels and tables; white in light, one step above surface in dark.
- **Ink** (fg / dark-fg): headings, body, primary data. Also the stroke of every chart line and data mark.
- **Slate** (fg-2 / dark-fg-2): secondary copy, subheads, the "Open" verdict text.
- **Muted Slate** (fg-3 / dark-fg-3): captions, column headers, metadata, placeholders. Still AA (4.83:1 at worst, on dark card).
- **Hairline** (line / dark-line) and **Rule** (line-strong / dark-line-strong): row dividers and card borders; the stronger rule for table heads, section heads, outlined buttons and the double-ruled total.
- **Open Wash** (open-wash / dark-open-wash): the background of the "Open" verdict chip.

### Named Rules
**The Blue Means Press Rule.** Blue is for actions and links only: buttons, links, the active nav item, focus rings, selection and tab state. Never a chart series, a numeral, a column highlight or a badge.

**The Verdict Pair Rule.** Green and red are reserved for verdicts, and a verdict always carries an icon (check, cross, minus) and a word (Supported, Undermined, Open). Colour alone never states a result.

**The Neutral Ink Rule.** Charts and data marks use neutral ink: fg for the series and model, fg-3 for baselines, line-strong for reference lines and axes. A chart gains hue only where it is drawing a verdict.

**The Both Themes Rule.** Every text pair meets WCAG AA in both light and dark. A new colour enters with its dark counterpart and both contrast checks, or it does not enter.

## Typography

**Display Font:** Figtree (with system-ui, sans-serif)
**Body Font:** Figtree (with system-ui, sans-serif)

**Character:** One friendly geometric sans doing every job, from an extrabold hero to 11px axis labels. Weight and size carry hierarchy; there is no second family and no mono. Tabular numerals are on globally so prices and percentages align in columns.

### Hierarchy
- **Display** (800, 40px to 56px, 1.08, tight tracking): the home hero headline only, capped near 16ch.
- **Headline** (700, 32px to 44px, 1.15, tight tracking): page titles (34/44) and home section headings (32/40).
- **Title** (700, 24px to 30px, 1.15): table and section heads inside operating pages (Signals, Summary, model names); 17px to 20px semibold for card and step titles.
- **Lead** (400, 17px to 18px, 1.6): the paragraph under a heading, in slate, 52 to 64ch.
- **Body** (400, 16px, 1.6): running copy and thesis sentences (26px line on the tester); 14px to 15px for table cells and panel copy.
- **Label** (500, 13px): form labels, chip text, metadata lines in slate or muted slate. Sentence case, never uppercase.
- **Caption** (400, 12px; 11px on chart axes): column headers, chart notes, the disclaimer.

### Named Rules
**The Balanced Heading Rule.** Headings (h1 to h3) set at 1.15 leading with balanced wrapping and tight tracking. The display hero is the one tighter exception (1.08).

**The No Eyebrow Rule.** No eyebrow or kicker label sits above a heading. A heading opens its section on its own; context goes in the lead paragraph below it.

## Layout

One frame: every nav, section, page body and footer centres in a 1200px max-width container with 20px side gutters, widening to 32px from the md breakpoint (768px). Reading columns inside it cap at 820px to 880px for long text, and prose caps by character count (52 to 72ch).

The home page alternates full-bleed bands (white, then cool surface) with 80px vertical rhythm per section. The hero is a two-column grid from lg (1024px) with copy left and the live product card right. Operating pages (tester, scoreboard) are tighter: a page header ruled off with line-strong, then statement tables whose rows breathe at 20px to 24px vertical padding. The tester sets the results table beside a 340px evidence panel from lg; below it, everything stacks into one column and table columns collapse into stacked rows.

The sticky top nav is 64px tall, translucent ground with a backdrop blur and a hairline bottom border. Links collapse to a menu button below md; search collapses to an icon below lg.

## Elevation & Depth

Flat and bordered by default. Structure comes from 1px hairlines and tonal bands; a single soft shadow is reserved for things that genuinely float.

### Shadow Vocabulary
- **Floating card** (`box-shadow: 0 1px 2px rgba(18,24,38,0.04), 0 12px 32px -12px rgba(18,24,38,0.14)`; dark: `0 1px 2px rgba(0,0,0,0.3), 0 16px 40px -16px rgba(0,0,0,0.6)`): the hero product card, the search popover, and the hover state of a linked stock card.

### Named Rules
**The Float Only Rule.** Shadows only mark something floating above the page (a showcase card, a popover) or a hover lift on a clickable card. Tables, panels and section blocks sit flat on a 1px border.

## Shapes

Soft and consistent. Controls (buttons, selects, inputs) round at 12px; panels, tables and cards at 16px; nav items and small hover targets at 8px; verdict chips and badges are full pills. Inset blocks inside a panel (example sentences, demo rows) take 12px. Borders are always 1px, hairline for rows and cards, the stronger rule for outlined buttons and table heads. The one ornamental line is the accounting double rule (3px double, line-strong) that closes a net position.

## Components

### Buttons
Confident, filled, no gradients.
- **Shape:** gently rounded (12px).
- **Primary:** Action Blue fill, white semibold 15px to 16px text, 44px tall in page bodies and 48px in the hero and closing band, 20px to 24px side padding, often with a trailing arrow icon.
- **Hover / Focus:** fill steps to Action Blue Hover over a colour transition; focus shows the global 2px blue outline at 2px offset. Disabled drops to 50% fill.
- **Secondary:** transparent with a 1px Rule border and Ink text; hover fills with Cool Band.
- **Inverse:** on the blue closing band, a white button with blue text.
- **Text link:** Link Blue semibold, underline on hover; or Ink text with a Rule-coloured underline that turns blue on hover for inline actions.

### Chips (verdict)
- **Style:** pill, 4px by 10px, 13px medium, a 14px icon then the word. Supported: check on For Wash. Undermined: cross on Against Wash. Open: minus in Slate on Open Wash.
- **State:** they resolve in with a 380ms fade-up when a verdict lands; reduced motion shows them at once. The word may be relabelled (Works, Lost, Marginal) but the icon and colour stay bound to the verdict.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Card on a page, Cool Band for side panels and insets.
- **Shadow Strategy:** flat; see Elevation (floating card only).
- **Border:** 1px Hairline.
- **Internal Padding:** 20px to 24px.

### Inputs / Fields
- **Style:** 44px select with a 1px Rule border, Card fill, 12px radius, custom chevron. Thesis sentences are borderless auto-sizing textareas that show a hairline on hover and a Rule border with Card fill on focus.
- **Focus:** the border strengthens; keyboard focus adds the global blue outline. Caret is blue.
- **Error:** an inline alert line in Undermined Red.

### Navigation
- **Style:** sticky 64px bar, wordmark left (blue rounded tile with the Lean glyph, then "Prove Me Wrong" in 17px bold), 15px medium links in Slate with an 8px Cool Band hover, the active link in Link Blue. Right side: Nifty 50 search, theme toggle, primary "Test your thesis" button.
- **Mobile:** links fold into a menu button that opens a stacked list under a hairline.
- **Tabs:** text tabs on a hairline, active tab marked by a 2px blue underline and Ink text.

### Statement Table (signature)
Each line item is a hairline row: index in muted slate, the sentence, a Lean bar and a verdict chip, with a 12px caption row of column heads. Undermined sentences take a red strike-through and an "Evidence says:" restatement. The table closes with a double rule and a net position (counts per verdict).

### Lean Bar (signature)
An 8px pill track in Cool Band with a hairline ring and a centre tick. Evidence grows from the centre: right in Supported Green for For, left in Undermined Red for Against, length set by evidence confidence, animated with a 560ms scale-in on test (static under reduced motion). "Against" and "For" captions sit beneath, and the bar carries an accessible label naming its lean and confidence.

## Do's and Don'ts

### Do:
- **Do** keep every surface inside the shared 1200px frame with 20px / 32px gutters.
- **Do** use Action Blue only for buttons, links, the active nav item, focus, selection and tab state.
- **Do** pair every green or red verdict with its icon and its word.
- **Do** draw charts and data marks in neutral ink (fg series, fg-3 baseline, line-strong reference).
- **Do** round controls at 12px and panels at 16px; keep chips as pills.
- **Do** set headings at 1.15 leading with balanced wrapping.
- **Do** check every new text pair for WCAG AA in both light and dark themes.
- **Do** honour reduced motion: verdicts and Lean bars appear in their final state.

### Don't:
- **Don't** put an eyebrow or kicker label above a heading.
- **Don't** use blue for chart series, numerals, column highlights or badges.
- **Don't** use green or red for anything that is not a verdict, or show a verdict by colour alone.
- **Don't** add shadows to flat panels, tables or sections.
- **Don't** use handwritten or novelty type, a second display family, or busy texture (ruled paper, grain, boxes everywhere).
- **Don't** use Groww or Zerodha branding, colours or wordmarks.

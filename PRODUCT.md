# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) frontend, deployed as a static-first site. Offline Python pipeline (yfinance, LightGBM, GARCH via `arch`, LSTM via PyTorch, HMM via `hmmlearn`, FinBERT) writes JSON artifacts the site reads. LLM agents run on Gemini free tier (cached batch + rate-limited live thesis check). No paid infrastructure.

## Users

Primary: an Indian retail investor who already holds or follows a few NSE (Nifty 50) stocks and has a view on them. Job: find out whether that view still holds, without reading twelve tabs and a 40-page concall transcript.

Secondary: a recruiter or hiring manager evaluating Aryan's CV. Job: understand in under a minute what the system does, that the ML is real, and that it was evaluated honestly.

## Product Purpose

The user writes a three-sentence thesis on a company. The product tests it against evidence: three AI agents (Researcher, Model Builder, Earnings Reviewer) plus ML signals (20-day return range, volatility forecast, market regime, earnings-call language drift). For each sentence of the thesis it reports supports / undermines / silent, with the source. Success: the user leaves knowing what would make them wrong.

## Positioning

"Groww tells you what a stock did. This tells you whether you are wrong, and shows exactly how often it is wrong."

Two things neighbours do not do: (1) thesis-first: the user's own view is the object under test, not the stock; (2) a public, calibrated model scoreboard: every model is walk-forward backtested against a naive baseline, and a model that loses to its baseline is shown losing and given no weight.

## Operating Context

Universe: Nifty 50. Prices from yfinance (`.NS`). Earnings-call transcripts are PDFs filed on BSE/NSE. A per-company `notes.md`-style thesis record (view, what would make me wrong, last reviewed, what changed) is the compounding artifact. Agents are prompted from the three "Claude finance agents" templates: every claim sourced and dated, inferences labelled INFERENCE, "could not verify" instead of guessing.

## Capabilities and Constraints

- Never outputs buy/sell/hold, price targets, or "what you should do". Report and analyse only. (SEBI research-analyst rules; Aryan is not a registered RA.)
- Predictions are ranges and probabilities, never point price targets.
- Every model shows its track record next to its output.
- Data is end-of-day, not live; the UI must say when data was last updated.
- Free-tier only: Gemini quota can run out; the app must fall back to cached reports gracefully.

## Brand Commitments

Name: **Prove Me Wrong**. Voice: calm, direct, honest about uncertainty, slightly dry. Never hype, never "AI-powered alpha".

Visual constraints (Aryan, 2026-10-15, after rejecting the cassette J-card build): must read as a serious, premium finance product credible to an investor or recruiter. No handwritten or novelty type. No busy texture (ruled paper, grain, boxes everywhere): calm and uncluttered. Still distinctive, not a Groww/Zerodha clone.

Standing direction (Aryan, 2026-10-15, after rejecting both the cassette J-card and the private-client app shell): a proper website in the register of **Groww / Zerodha**: friendly, clean Indian retail fintech. Top navigation, a real home page, light theme by default with a dark toggle. Convention is the commitment: execute that category standard at full craft, without novelty worlds. Use our own palette and wordmark, never Groww or Zerodha branding.

## Evidence on Hand

None yet. No users, testimonials, or performance claims exist. All accuracy numbers must come from the pipeline's own backtest output; never write a number by hand.

## Product Principles

1. The user's view is the subject; the stock is the evidence.
2. Show the track record next to every signal.
3. Uncertainty is information. Ranges over points, "could not verify" over guesses.
4. Analyse, never advise.
5. One-minute legibility for a newcomer; depth on demand for an investor.

## Accessibility & Inclusion

WCAG 2.2 AA. Supports/undermines states must never rely on colour alone. Indian number formatting (₹, lakh/crore) where values are shown.

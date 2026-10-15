// Example theses that load on first visit. They are opinions written for the demo, not research.
export const DEMO_TAPES: { sym: string; title: string; tracks: [string, string, string] }[] = [
  {
    sym: "HDFCBANK",
    title: "Slow and steady",
    tracks: [
      "HDFC Bank's margins recover as deposit costs ease after the merger.",
      "It's a steady, defensive holding while the market wobbles.",
      "The stock is in an uptrend and keeps grinding higher.",
    ],
  },
  {
    sym: "RELIANCE",
    title: "Big and back",
    tracks: [
      "Reliance has been beating the Nifty over the last month.",
      "The stock has momentum behind it.",
      "The market backdrop is calm and supportive for large caps.",
    ],
  },
  {
    sym: "INFY",
    title: "IT winter",
    tracks: [
      "IT demand is weak, so Infosys revenue growth stays in low single digits.",
      "Infosys is in a downtrend.",
      "The stock will be volatile going into results.",
    ],
  },
];

export const TRACK_LIMIT = 160; // characters per track, so a thesis can't sprawl

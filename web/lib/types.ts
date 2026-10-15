// Shapes of the JSON written by pipeline/build.py.
export type Stock = {
  sym: string; name: string; sector: string; as_of: string; last_close: number;
  history: [string, number][];
  range: { source: "model" | "baseline"; q: [number, number, number]; price: [number, number, number] };
  vol: { baseline: number; garch: number | null; lstm: number | null; used: string; annualised: number; pct_rank: number };
  trend: { r20: number; r60: number; rel_r20: number; ma200: number };
  regime: { label: "Calm" | "Choppy" | "Stressed"; since: string };
};

export type UniverseRow = { sym: string; name: string; sector: string; last_close: number; r20: number };

export type Contender = { id: string; name: string; loss: number; skill: number };

export type Model = {
  id: string; name: string; algo: string; baseline: string; metric: string;
  skill?: number; beats_baseline?: boolean;
  coverage?: number; baseline_coverage?: number; target_coverage?: number;
  direction_hit?: number; always_up_hit?: number;
  calibration?: { nominal: number; model: number; baseline: number }[];
  by_year?: Record<string, number>[];
  contenders?: Contender[];
  stressed_vs_calm_vol?: number | null; informative?: boolean;
  regimes?: { regime: string; days: number; fwd_vol_ann: number; fwd_ret: number }[];
  status?: string; note?: string;
};

export type Scoreboard = { as_of: string; horizon_days: number; first_test_year: number; method: string; models: Model[] };

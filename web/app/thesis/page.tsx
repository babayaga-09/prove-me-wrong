import { ThesisCheck } from "@/components/ThesisCheck";
import universe from "@/public/data/universe.json";
import board from "@/public/data/scoreboard.json";
import initial from "@/public/data/stocks/HDFCBANK.json";
import type { Scoreboard, Stock } from "@/lib/types";

export default function Home() {
  return <ThesisCheck universe={universe.stocks} board={board as Scoreboard} initial={initial as unknown as Stock} />;
}

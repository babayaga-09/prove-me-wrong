"use client";

import { createContext, useContext, useState } from "react";

// The selected stock, shared by the rail search and the thesis check.
type Ctx = { sym: string; setSym: (s: string) => void; name: string; setName: (n: string) => void };
const StockCtx = createContext<Ctx | null>(null);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [sym, setSym] = useState("HDFCBANK");
  const [name, setName] = useState("HDFC Bank");
  return <StockCtx.Provider value={{ sym, setSym, name, setName }}>{children}</StockCtx.Provider>;
}

export function useStock() {
  const c = useContext(StockCtx);
  if (!c) throw new Error("useStock outside StockProvider");
  return c;
}

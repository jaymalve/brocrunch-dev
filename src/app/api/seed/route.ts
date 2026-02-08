import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const STRATEGIES = ["Yield Optimizer", "Momentum Sniper", "Arb Hunter", "Degen Express"];
const RISK_LEVELS = ["low", "medium", "high", "degen"];
const PAIRS = ["ETH/USDC", "BTC/USDT", "SOL/USDC", "ARB/USDT", "AVAX/USDC", "LINK/USDT"];

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert profile
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: user.email?.split("@")[0],
    total_balance: 10000,
    total_pnl: 1456.56,
  });

  // Create mock agents
  const agentData = [
    { user_id: user.id, name: "ALPHA-7", strategy: STRATEGIES[1], status: "active", risk_level: RISK_LEVELS[1], allocated_balance: 3200, total_pnl: 847.23, win_rate: 72.4, total_trades: 156 },
    { user_id: user.id, name: "YIELD-MAX", strategy: STRATEGIES[0], status: "active", risk_level: RISK_LEVELS[0], allocated_balance: 5000, total_pnl: 312.89, win_rate: 91.2, total_trades: 43 },
    { user_id: user.id, name: "ARB-HUNT", strategy: STRATEGIES[2], status: "idle", risk_level: RISK_LEVELS[1], allocated_balance: 1500, total_pnl: -45.12, win_rate: 58.3, total_trades: 89 },
    { user_id: user.id, name: "DEGEN-X", strategy: STRATEGIES[3], status: "paused", risk_level: RISK_LEVELS[3], allocated_balance: 800, total_pnl: 2341.56, win_rate: 41.7, total_trades: 312 },
  ];

  const { data: agents } = await supabase.from("agents").insert(agentData).select();

  // Create mock trades if agents were created
  if (agents && agents.length > 0) {
    const trades = [
      { user_id: user.id, agent_id: agents[0].id, pair: PAIRS[0], side: "long", entry_price: 3812.45, exit_price: 3847.21, size: 2.5, pnl: 86.9, status: "closed" },
      { user_id: user.id, agent_id: agents[0].id, pair: PAIRS[1], side: "long", entry_price: 96800, size: 0.15, pnl: 51.37, status: "open" },
      { user_id: user.id, agent_id: agents[3].id, pair: PAIRS[2], side: "short", entry_price: 192.1, exit_price: 189.34, size: 50, pnl: 138.0, status: "closed" },
      { user_id: user.id, agent_id: agents[2].id, pair: PAIRS[3], side: "long", entry_price: 1.18, exit_price: 1.23, size: 5000, pnl: 250.0, status: "closed" },
    ];

    await supabase.from("trades").insert(trades);
  }

  // Create portfolio snapshots
  const snapshots = Array.from({ length: 20 }, (_, i) => ({
    user_id: user.id,
    total_value: 10000 + Math.random() * 1500,
    timestamp: new Date(Date.now() - (20 - i) * 86400000).toISOString(),
  }));

  await supabase.from("portfolio_snapshots").insert(snapshots);

  return NextResponse.json({ success: true, message: "Mock data seeded" });
}

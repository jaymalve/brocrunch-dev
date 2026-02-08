"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

// ── Mock Data ──────────────────────────────────────────────
const MOCK_AGENTS = [
  {
    id: "a1",
    name: "ALPHA-7",
    strategy: "Momentum Sniper",
    status: "active" as const,
    risk_level: "medium",
    allocated_balance: 3200,
    total_pnl: 847.23,
    win_rate: 72.4,
    total_trades: 156,
  },
  {
    id: "a2",
    name: "YIELD-MAX",
    strategy: "Yield Optimizer",
    status: "active" as const,
    risk_level: "low",
    allocated_balance: 5000,
    total_pnl: 312.89,
    win_rate: 91.2,
    total_trades: 43,
  },
  {
    id: "a3",
    name: "ARB-HUNT",
    strategy: "Arb Hunter",
    status: "idle" as const,
    risk_level: "medium",
    allocated_balance: 1500,
    total_pnl: -45.12,
    win_rate: 58.3,
    total_trades: 89,
  },
  {
    id: "a4",
    name: "DEGEN-X",
    strategy: "Degen Express",
    status: "paused" as const,
    risk_level: "degen",
    allocated_balance: 800,
    total_pnl: 2341.56,
    win_rate: 41.7,
    total_trades: 312,
  },
];

const MOCK_TRADES = [
  { id: "t1", pair: "ETH/USDC", side: "long", entry_price: 3812.45, exit_price: 3847.21, size: 2.5, pnl: 86.9, status: "closed", agent_name: "ALPHA-7", opened_at: "2 min ago" },
  { id: "t2", pair: "BTC/USDT", side: "long", entry_price: 96800, exit_price: null, size: 0.15, pnl: 51.37, status: "open", agent_name: "ALPHA-7", opened_at: "14 min ago" },
  { id: "t3", pair: "SOL/USDC", side: "short", entry_price: 192.1, exit_price: 189.34, size: 50, pnl: 138.0, status: "closed", agent_name: "DEGEN-X", opened_at: "23 min ago" },
  { id: "t4", pair: "ARB/USDT", side: "long", entry_price: 1.18, exit_price: 1.23, size: 5000, pnl: 250.0, status: "closed", agent_name: "ARB-HUNT", opened_at: "1 hr ago" },
  { id: "t5", pair: "AVAX/USDC", side: "short", entry_price: 43.5, exit_price: null, size: 100, pnl: -139.0, status: "open", agent_name: "DEGEN-X", opened_at: "2 hr ago" },
  { id: "t6", pair: "LINK/USDT", side: "long", entry_price: 17.82, exit_price: 18.92, size: 200, pnl: 220.0, status: "closed", agent_name: "YIELD-MAX", opened_at: "3 hr ago" },
];

const PORTFOLIO_HISTORY = [
  10000, 10120, 10085, 10234, 10312, 10198, 10445, 10523, 10478, 10612,
  10734, 10689, 10823, 10956, 11023, 10987, 11145, 11234, 11312, 11456,
];

// ── Components ─────────────────────────────────────────────

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#a1a1aa" : "#52525b"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PortfolioChart({ data }: { data: number[] }) {
  const min = Math.min(...data) * 0.998;
  const max = Math.max(...data) * 1.002;
  const range = max - min || 1;
  const h = 200;
  const w = 800;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48 overflow-visible">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-white"
      : status === "paused"
        ? "bg-zinc-500"
        : "bg-zinc-700";
  return (
    <span className="relative flex h-2 w-2">
      {status === "active" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

// ── Main Dashboard ─────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"agents" | "trades">("agents");
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser({ email: user.email });
    } else {
      setUser({ email: "demo@brocrunch.xyz" });
    }
  }, [supabase.auth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function toggleAgentStatus(id: string) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : "active" as const }
          : a
      )
    );
  }

  const totalBalance = agents.reduce((sum, a) => sum + a.allocated_balance, 0);
  const totalPnl = agents.reduce((sum, a) => sum + a.total_pnl, 0);
  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm" />
          <span className="text-xs font-semibold tracking-tight">BROCRUNCH</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[10px] tracking-wider text-zinc-600 hover:text-white transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-zinc-600 uppercase mb-1">Portfolio Value</p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-bold tracking-tight font-mono">
              ${(totalBalance + totalPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h1>
            <span className={`text-sm font-mono ${totalPnl >= 0 ? "text-zinc-300" : "text-zinc-600"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({((totalPnl / totalBalance) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-white/5 rounded-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.2em] text-zinc-600 uppercase">Performance (30d)</p>
            <div className="flex gap-2">
              {["7D", "30D", "90D", "ALL"].map((period) => (
                <button
                  key={period}
                  className={`text-[10px] tracking-wider px-2 py-0.5 rounded-sm ${
                    period === "30D" ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <PortfolioChart data={PORTFOLIO_HISTORY} />
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Agents", value: `${activeCount}/${agents.length}` },
            { label: "Total Trades", value: agents.reduce((s, a) => s + a.total_trades, 0).toString() },
            { label: "Avg Win Rate", value: `${(agents.reduce((s, a) => s + a.win_rate, 0) / agents.length).toFixed(1)}%` },
            { label: "24h PnL", value: `+$${(totalPnl * 0.12).toFixed(2)}` },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/5 rounded-sm px-4 py-3">
              <p className="text-[10px] tracking-[0.2em] text-zinc-600 uppercase">{stat.label}</p>
              <p className="text-lg font-bold font-mono tracking-tight mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            {(["agents", "trades"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] tracking-[0.2em] uppercase pb-2 border-b-2 transition-colors ${
                  activeTab === tab ? "text-white border-white" : "text-zinc-600 border-transparent hover:text-zinc-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "agents" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[10px] tracking-wider bg-white text-black px-3 py-1.5 rounded-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              + NEW AGENT
            </button>
          )}
        </div>

        {/* Agents Tab */}
        {activeTab === "agents" && (
          <div className="space-y-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-white/5 rounded-sm p-5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={agent.status} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm tracking-tight font-mono">{agent.name}</h3>
                        <span className="text-[9px] tracking-[0.15em] text-zinc-600 border border-white/5 px-1.5 py-0.5 rounded-sm uppercase">
                          {agent.risk_level}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{agent.strategy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:block">
                      <MiniChart
                        data={PORTFOLIO_HISTORY.slice(i * 3, i * 3 + 10).length > 1 ? PORTFOLIO_HISTORY.slice(i * 3, i * 3 + 10) : PORTFOLIO_HISTORY.slice(0, 10)}
                        positive={agent.total_pnl >= 0}
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-mono font-medium">
                        ${agent.allocated_balance.toLocaleString()}
                      </p>
                      <p className={`text-xs font-mono ${agent.total_pnl >= 0 ? "text-zinc-300" : "text-zinc-600"}`}>
                        {agent.total_pnl >= 0 ? "+" : ""}${agent.total_pnl.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAgentStatus(agent.id)}
                        className={`text-[9px] tracking-wider px-2.5 py-1 rounded-sm border transition-colors ${
                          agent.status === "active"
                            ? "border-white/20 text-white hover:bg-white/5"
                            : "border-white/5 text-zinc-500 hover:border-white/15"
                        }`}
                      >
                        {agent.status === "active" ? "PAUSE" : "START"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-zinc-600">
                    Win Rate: <span className="text-zinc-400 font-mono">{agent.win_rate}%</span>
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    Trades: <span className="text-zinc-400 font-mono">{agent.total_trades}</span>
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    Status: <span className="text-zinc-400 font-mono uppercase">{agent.status}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <div className="border border-white/5 rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Pair", "Side", "Agent", "Entry", "Exit", "PnL", "Status", "Time"].map((h) => (
                    <th key={h} className="text-[9px] tracking-[0.2em] text-zinc-600 uppercase text-left px-4 py-2.5 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRADES.map((trade, i) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono font-medium">{trade.pair}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] tracking-wider font-mono uppercase ${
                        trade.side === "long" ? "text-zinc-300" : "text-zinc-500"
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-zinc-500 font-mono">{trade.agent_name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">${trade.entry_price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                      {trade.exit_price ? `$${trade.exit_price.toLocaleString()}` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-xs font-mono font-medium ${
                      trade.pnl >= 0 ? "text-zinc-200" : "text-zinc-600"
                    }`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] tracking-wider font-mono uppercase ${
                        trade.status === "open" ? "text-white" : "text-zinc-600"
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-zinc-600">{trade.opened_at}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(agent) => {
            setAgents((prev) => [agent, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Create Agent Modal ─────────────────────────────────────

function CreateAgentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (agent: typeof MOCK_AGENTS[0]) => void;
}) {
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState("Yield Optimizer");
  const [risk, setRisk] = useState("low");
  const [balance, setBalance] = useState("1000");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    onCreate({
      id: `a${Date.now()}`,
      name: name.toUpperCase() || "UNNAMED",
      strategy,
      status: "idle",
      risk_level: risk,
      allocated_balance: parseFloat(balance) || 1000,
      total_pnl: 0,
      win_rate: 0,
      total_trades: 0,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 rounded-sm p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-bold tracking-tight mb-1">Deploy New Agent</h2>
        <p className="text-xs text-zinc-500 mb-6">Configure your autonomous trading agent.</p>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700 uppercase"
              placeholder="e.g. SIGMA-9"
              required
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors"
            >
              <option>Yield Optimizer</option>
              <option>Momentum Sniper</option>
              <option>Arb Hunter</option>
              <option>Degen Express</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Risk Level</label>
            <div className="flex gap-2">
              {["low", "medium", "high", "degen"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRisk(level)}
                  className={`flex-1 text-[10px] tracking-wider py-2 rounded-sm border uppercase transition-colors ${
                    risk === level
                      ? "border-white/30 text-white bg-white/5"
                      : "border-white/5 text-zinc-600 hover:border-white/15"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Allocate ($)</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-white/30 transition-colors"
              min="100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-zinc-400 py-2.5 rounded-sm text-xs tracking-wider hover:border-white/20 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 bg-white text-black py-2.5 rounded-sm text-xs font-medium tracking-wider hover:bg-zinc-200 transition-colors"
            >
              DEPLOY AGENT
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

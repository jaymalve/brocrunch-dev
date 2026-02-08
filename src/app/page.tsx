"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MOCK_TICKERS = [
  { pair: "ETH/USDC", price: 3847.21, change: +2.41 },
  { pair: "BTC/USDT", price: 97142.5, change: +1.12 },
  { pair: "SOL/USDC", price: 189.34, change: -0.87 },
  { pair: "ARB/USDT", price: 1.23, change: +5.67 },
  { pair: "AVAX/USDC", price: 42.11, change: -1.34 },
  { pair: "LINK/USDT", price: 18.92, change: +3.21 },
];

const STATS = [
  { label: "Total Volume", value: "$4.2B" },
  { label: "Active Agents", value: "12,847" },
  { label: "Avg. Win Rate", value: "68.3%" },
  { label: "Protocols", value: "42" },
];

function TickerTape() {
  return (
    <div className="overflow-hidden border-b border-white/5 bg-black">
      <motion.div
        className="flex gap-8 py-2 whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...MOCK_TICKERS, ...MOCK_TICKERS, ...MOCK_TICKERS].map((t, i) => (
          <span key={i} className="text-xs tracking-wider font-mono text-zinc-500">
            {t.pair}{" "}
            <span className={t.change > 0 ? "text-zinc-300" : "text-zinc-600"}>
              ${t.price.toLocaleString()}{" "}
              {t.change > 0 ? "+" : ""}
              {t.change}%
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
    </div>
  );
}

function PulsingDot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="inline-block w-1.5 h-1.5 bg-white rounded-full"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    />
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <TickerTape />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">BROCRUNCH</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs text-zinc-500 tracking-wide">
          <a href="#how" className="hover:text-white transition-colors">HOW IT WORKS</a>
          <a href="#agents" className="hover:text-white transition-colors">AGENTS</a>
          <a href="#stats" className="hover:text-white transition-colors">STATS</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-white transition-colors tracking-wide"
          >
            LOG IN
          </Link>
          <Link
            href="/signup"
            className="text-xs bg-white text-black px-4 py-2 rounded-sm font-medium tracking-wide hover:bg-zinc-200 transition-colors"
          >
            START TRADING
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
        <GridBackground />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <PulsingDot />
            <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
              Agents are live on mainnet
            </span>
            <PulsingDot delay={0.5} />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Your portfolio
            <br />
            doesn&apos;t need
            <br />
            <span className="text-zinc-500">feelings.</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
            Deploy autonomous DeFi agents that trade with cold, calculated precision.
            No emotions. No FOMO. Just math.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link
              href="/signup"
              className="bg-white text-black px-8 py-3 rounded-sm text-sm font-medium tracking-wide hover:bg-zinc-200 transition-colors w-full sm:w-auto"
            >
              DEPLOY YOUR FIRST AGENT
            </Link>
            <Link
              href="/dashboard"
              className="border border-white/10 text-zinc-400 px-8 py-3 rounded-sm text-sm tracking-wide hover:border-white/30 hover:text-white transition-all w-full sm:w-auto"
            >
              VIEW DEMO
            </Link>
          </div>
        </motion.div>

        {/* Floating terminal mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-16 w-full max-w-2xl"
        >
          <div className="bg-zinc-950 border border-white/5 rounded-md overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-[10px] text-zinc-600 font-mono">brocrunch://agent-alpha</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1.5 text-zinc-500">
              <div><span className="text-zinc-600">[00:14:23]</span> Agent <span className="text-white">ALPHA-7</span> scanning 42 liquidity pools...</div>
              <div><span className="text-zinc-600">[00:14:24]</span> Arbitrage opportunity detected: ETH/USDC Uniswap → Curve</div>
              <div><span className="text-zinc-600">[00:14:24]</span> Expected profit: <span className="text-white">+0.34%</span> | Risk score: <span className="text-white">LOW</span></div>
              <div><span className="text-zinc-600">[00:14:25]</span> Executing swap: 2.5 ETH → 9,621.42 USDC</div>
              <div><span className="text-zinc-600">[00:14:26]</span> <span className="text-white">Trade confirmed.</span> Tx: 0x7f2a...b3c1</div>
              <div><span className="text-zinc-600">[00:14:26]</span> Portfolio PnL: <span className="text-white">+$847.23 (+2.41%)</span></div>
              <motion.span
                className="inline-block w-1.5 h-3.5 bg-white/70"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section id="stats" className="border-y border-white/5 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="px-6 py-8 text-center border-r border-white/5 last:border-r-0"
            >
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-[10px] tracking-[0.2em] text-zinc-600 mt-1 uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] text-zinc-600 uppercase mb-3">The process</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three steps to <span className="text-zinc-500">emotionless</span> profit
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                desc: "Link your wallet. We never touch your keys. Your assets stay yours — we just make them work harder.",
              },
              {
                step: "02",
                title: "Configure Agent",
                desc: "Pick a strategy, set your risk tolerance, and allocate capital. From conservative yield farming to full degen mode.",
              },
              {
                step: "03",
                title: "Let It Cook",
                desc: "Your agent monitors markets 24/7, executing trades with sub-second precision. Sleep well. It won't.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="border border-white/5 rounded-sm p-6 hover:border-white/10 transition-colors group"
              >
                <div className="text-[10px] tracking-[0.3em] text-zinc-600 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Strategies */}
      <section id="agents" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] text-zinc-600 uppercase mb-3">Strategies</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Pick your <span className="text-zinc-500">poison</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: "Yield Optimizer",
                risk: "LOW",
                desc: "Auto-compounds across lending protocols. Boring, but your accountant will love it.",
                apy: "8-15%",
              },
              {
                name: "Momentum Sniper",
                risk: "MEDIUM",
                desc: "Rides breakouts and dumps losers. Like a day trader, minus the energy drinks.",
                apy: "20-45%",
              },
              {
                name: "Arb Hunter",
                risk: "MEDIUM",
                desc: "Exploits cross-DEX price differences in milliseconds. Free money glitch (sort of).",
                apy: "15-30%",
              },
              {
                name: "Degen Express",
                risk: "DEGEN",
                desc: "High leverage, high frequency, high stakes. Not for the faint of heart or wallet.",
                apy: "50-200%",
              },
            ].map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border border-white/5 rounded-sm p-6 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold tracking-tight">{agent.name}</h3>
                  <span className={`text-[10px] tracking-[0.15em] px-2 py-0.5 rounded-sm border ${
                    agent.risk === "LOW"
                      ? "text-zinc-400 border-zinc-700"
                      : agent.risk === "DEGEN"
                        ? "text-white border-white/20"
                        : "text-zinc-300 border-zinc-600"
                  }`}>
                    {agent.risk}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{agent.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Target APY</span>
                  <span className="text-sm font-mono font-medium">{agent.apy}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Stop trading on vibes.
            <br />
            <span className="text-zinc-500">Start trading on math.</span>
          </h2>
          <p className="mt-4 text-zinc-500 text-sm">
            Join 12,000+ traders who replaced gut feelings with algorithms.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 bg-white text-black px-8 py-3 rounded-sm text-sm font-medium tracking-wide hover:bg-zinc-200 transition-colors"
          >
            GET STARTED — IT&apos;S FREE
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-sm" />
            <span className="text-xs text-zinc-600 tracking-wide">BROCRUNCH</span>
          </div>
          <p className="text-[10px] text-zinc-700 tracking-wide">
            BUILT BY DEGENS, FOR DEGENS. NOT FINANCIAL ADVICE. PROBABLY.
          </p>
        </div>
      </footer>
    </div>
  );
}

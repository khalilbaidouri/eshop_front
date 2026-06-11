"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import {
  Globe, Server, Database, Network, RefreshCw,
  Filter, BarChart3, List, ArrowRight, Activity,
  Layers, Zap, GitBranch, Clock, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Compteurs = { global: number; site1: number; site2: number };

const NODES = [
  {
    key: "global" as const,
    label: "Site Global",
    port: "1524",
    user: "eshop",
    desc: "Base principale",
    rule: "Toutes les données",
    href: "/global",
    Icon: Globe,
    color: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-700",
      dot: "bg-violet-500",
      bar: "bg-violet-500",
      badge: "bg-violet-100 text-violet-700",
      icon: "text-violet-500",
    },
  },
  {
    key: "site1" as const,
    label: "Site 1",
    port: "1522",
    user: "eshop1",
    desc: "Gros volumes",
    rule: "Quantité ≥ 100",
    href: "/site1",
    Icon: Server,
    color: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-700",
      dot: "bg-teal-500",
      bar: "bg-teal-500",
      badge: "bg-teal-100 text-teal-700",
      icon: "text-teal-500",
    },
  },
  {
    key: "site2" as const,
    label: "Site 2",
    port: "1523",
    user: "eshop2",
    desc: "Petits volumes",
    rule: "Quantité < 100",
    href: "/site2",
    Icon: Database,
    color: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      dot: "bg-orange-500",
      bar: "bg-orange-400",
      badge: "bg-orange-100 text-orange-700",
      icon: "text-orange-500",
    },
  },
] as const;

const FEATURES = [
  { icon: GitBranch, label: "Fragmentation horizontale", desc: "Partitionnement par quantité" },
  { icon: Zap,       label: "Triggers de synchro",       desc: "SYC_INSERT / UPDATE / DELETE" },
  { icon: Layers,    label: "Database Links",             desc: "link_site1 · link_site2" },
  { icon: Activity,  label: "Procédures stockées",        desc: "insertligne · updateligne" },
];

const NAV_QUICK = [
  { href: "/global", label: "Global",   Icon: Globe,     cls: "hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700" },
  { href: "/site1",  label: "Site 1",   Icon: Server,    cls: "hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700" },
  { href: "/site2",  label: "Site 2",   Icon: Database,  cls: "hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700" },
  { href: "/lignes", label: "Lignes",   Icon: List,      cls: "hover:border-gray-400 hover:bg-gray-50" },
  { href: "/stats",  label: "Stats CA", Icon: BarChart3, cls: "hover:border-gray-400 hover:bg-gray-50", primary: true },
];

export default function Dashboard() {
  const [compteurs,   setCompteurs]   = useState<Compteurs | null>(null);
  const [secondsAgo,  setSecondsAgo]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [pulse,       setPulse]       = useState(false);

  const fetchData = () => {
    setPulse(true);
    api.get("/compteurs").then((r) => {
      setCompteurs(r.data);
      setSecondsAgo(0);
      setLoading(false);
      setTimeout(() => setPulse(false), 600);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 3000);
    const tick = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, []);

  const total = compteurs ? (compteurs.site1 ?? 0) + (compteurs.site2 ?? 0) : null;
  const pct   = (val?: number) => total && val != null && total > 0 ? Math.round((val / total) * 100) : 0;
  const fmt   = (n?: number | null) => n != null ? n.toLocaleString("fr-FR") : "—";

  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ── Hero header ─────────────────────────────────── */}
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-5 flex items-center justify-between border-b">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-md shadow-violet-200">
                <Network className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold tracking-tight">EShop Distribué</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Oracle 21c XE · 3 nœuds · Docker · Fragmentation horizontale
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 text-[11px] border rounded-full px-3 py-1 transition-all",
                pulse ? "bg-green-100 border-green-300 text-green-700" : "bg-muted/50 text-muted-foreground"
              )}>
                <span className="w-[5px] h-[5px] rounded-full bg-green-500 animate-pulse" />
                Live · {secondsAgo}s
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-3 py-1 bg-muted/50 hover:bg-muted transition-colors"
              >
                <RefreshCw className={cn("w-3 h-3", pulse && "animate-spin")} />
                Sync
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 divide-x">
            {[
              {
                label: "Total lignes",
                value: fmt(total),
                sub: "site1 + site2",
                Icon: TrendingUp,
              },
              {
                label: "Nœuds actifs",
                value: "3 / 3",
                sub: "tous connectés · XEPDB1",
                Icon: Activity,
              },
              {
                label: "Dernière sync",
                value: `${secondsAgo}s`,
                sub: "intervalle 3 000 ms",
                Icon: Clock,
              },
            ].map((k) => (
              <div key={k.label} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <k.Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{k.label}</p>
                  <p className="text-[22px] font-semibold tabular-nums leading-none">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3 Node cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NODES.map((node) => {
            const val   = compteurs?.[node.key];
            const share = node.key !== "global" ? pct(val) : null;
            return (
              <Link key={node.key} href={node.href}
                className={cn(
                  "rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group block",
                  `hover:${node.color.border}`
                )}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      node.color.bg, node.color.border, "border"
                    )}>
                      <node.Icon className={cn("w-4 h-4", node.color.icon)} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{node.label}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">:{node.port}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border",
                    node.color.badge, node.color.border
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", node.color.dot)} />
                    healthy
                  </span>
                </div>

                {/* Count */}
                <div className="mb-1">
                  <span className={cn(
                    "text-[42px] font-bold tabular-nums leading-none transition-all",
                    loading ? "text-muted-foreground/30" : node.color.text
                  )}>
                    {loading ? "—" : fmt(val)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">lignes de commande</p>

                {/* Fragment rule */}
                <div className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg mb-4",
                  node.color.bg, node.color.text
                )}>
                  <Filter className="w-2.5 h-2.5" />
                  {node.rule}
                </div>

                {/* Progress bar */}
                {share != null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Part du total</span>
                      <span className={cn("font-medium", node.color.text)}>{share}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", node.color.bar)}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3.5 mt-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{node.user}</span>
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] font-medium transition-all",
                    node.color.text,
                    "opacity-0 group-hover:opacity-100"
                  )}>
                    Voir les données
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Architecture features ───────────────────────── */}
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              Architecture technique
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
            {FEATURES.map((f) => (
              <div key={f.label} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <f.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-[12px] font-medium leading-none mb-1">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick nav ────────────────────────────────────── */}
        <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-muted-foreground font-medium">Navigation rapide</p>
          <div className="flex items-center gap-2 flex-wrap">
            {NAV_QUICK.map((n) => (
              <Link key={n.href} href={n.href}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] border rounded-lg px-3 py-1.5 transition-all font-medium",
                  n.primary
                    ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
                    : `text-muted-foreground bg-white ${n.cls}`
                )}
              >
                <n.Icon className="w-3 h-3" />
                {n.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
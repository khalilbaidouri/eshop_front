"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import {
  Globe,
  Server,
  Database,
  Network,
  RefreshCw,
  Filter,
  BarChart3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Compteurs = { global: number; site1: number; site2: number };

const NODES = [
  {
    key: "global" as const,
    label: "Global",
    port: "1521",
    user: "eshop",
    desc: "base principale",
    showBar: false,
    Icon: Globe,
  },
  {
    key: "site1" as const,
    label: "Site 1",
    port: "1522",
    user: "eshop1",
    desc: "Quantité ≥ 100",
    showBar: true,
    Icon: Server,
  },
  {
    key: "site2" as const,
    label: "Site 2",
    port: "1523",
    user: "eshop2",
    desc: "Quantité < 100",
    showBar: true,
    Icon: Database,
  },
] as const;

const NAV = [
  { href: "/global", label: "Global", Icon: Globe },
  { href: "/site1", label: "Site 1", Icon: Server },
  { href: "/site2", label: "Site 2", Icon: Database },
  { href: "/lignes", label: "Lignes", Icon: List },
];

export default function Dashboard() {
  const [compteurs, setCompteurs] = useState<Compteurs | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchData = () => {
    api.get("/compteurs").then((r) => {
      setCompteurs(r.data);
      setSecondsAgo(0);
    });
  };

  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 3000);
    const tick = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const total = compteurs
    ? (compteurs.site1 ?? 0) + (compteurs.site2 ?? 0)
    : null;
  const pct = (val?: number) =>
    total && val != null && total > 0 ? Math.round((val / total) * 100) : 0;
  const fmt = (n?: number | null) =>
    n != null ? n.toLocaleString("fr-FR") : "—";

  return (
    <main className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="border rounded-xl overflow-hidden bg-background">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md border bg-muted flex items-center justify-center">
                <Network className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-medium leading-none">
                  EShop Distribué
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Oracle 21c XE · 3 nœuds · Fragmentation horizontale
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50">
                <span className="w-[5px] h-[5px] rounded-full bg-green-500 animate-pulse" />
                Live · 3s
              </span>
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50 hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="grid grid-cols-3 divide-x border-b">
            {[
              {
                label: "Total lignes commandes",
                value: fmt(total),
                meta: "site1 + site2 combinés",
              },
              {
                label: "Nœuds actifs",
                value: "3 / 3",
                meta: "tous connectés · XEPDB1",
              },
              {
                label: "Dernière sync",
                value: `il y a ${secondsAgo}s`,
                meta: "intervalle 3 000 ms",
              },
            ].map((k) => (
              <div key={k.label} className="px-5 py-3.5">
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  {k.label}
                </p>
                <p className="text-[22px] font-medium tabular-nums leading-none">
                  {k.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {k.meta}
                </p>
              </div>
            ))}
          </div>

          {/* ── Nodes ── */}
          <div className="grid grid-cols-3 divide-x">
            {NODES.map((node) => {
              const val = compteurs?.[node.key];
              const share = node.showBar ? pct(val) : null;
              return (
                <div key={node.key} className="p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] rounded-md border bg-muted flex items-center justify-center">
                        <node.Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium leading-none">
                          {node.label}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          localhost:{node.port}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      healthy
                    </span>
                  </div>

                  <p className="text-[36px] font-medium tabular-nums leading-none mb-1">
                    {compteurs ? fmt(val) : "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    LigneCommandes
                  </p>

                  {share != null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Part du total</span>
                        <span>{share}%</span>
                      </div>
                      <div className="h-px bg-border overflow-hidden">
                        <div
                          className="h-full bg-foreground/30 transition-all duration-700"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] text-muted-foreground border-t pt-4",
                      share == null && "mt-0",
                    )}
                  >
                    <Filter className="w-3 h-3" />
                    {node.user} · {node.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer nav ── */}
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/30">
            <div className="flex items-center gap-1.5">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-md px-2.5 py-1.5 bg-background hover:bg-muted transition-colors"
                >
                  <n.Icon className="w-3 h-3" />
                  {n.label}
                </a>
              ))}
              <a
                href="/stats"
                className="flex items-center gap-1.5 text-[11px] bg-foreground text-background rounded-md px-2.5 py-1.5 hover:opacity-80 transition-opacity"
              >
                <BarChart3 className="w-3 h-3" />
                Stats CA 2026
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Docker · DB Links · Triggers · Procédures stockées
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

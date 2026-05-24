"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";
import { Globe, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "lignes" | "clients" | "produits" | "commandes";

export default function GlobalPage() {
  const [lignes,    setLignes]    = useState<any[]>([]);
  const [clients,   setClients]   = useState<any[]>([]);
  const [produits,  setProduits]  = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<Tab>("lignes");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/global"),
      api.get("/clients"),
      api.get("/produits"),
      api.get("/commandes"),
    ]).then(([l, c, p, cmd]) => {
      setLignes(l.data);
      setClients(c.data);
      setProduits(p.data);
      setCommandes(cmd.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const tabs = [
    { key: "lignes"    as const, label: "LigneCommandes", count: lignes.length    },
    { key: "clients"   as const, label: "Clients",        count: clients.length   },
    { key: "produits"  as const, label: "Produits",       count: produits.length  },
    { key: "commandes" as const, label: "Commandes",      count: commandes.length },
  ];

  const dataMap = { lignes, clients, produits, commandes };
  const activeTab = tabs.find((t) => t.key === tab)!;

  return (
    <main className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header card ── */}
        <div className="border rounded-xl overflow-hidden bg-background">
          <div className="flex items-center justify-between px-5 py-3.5 border-b">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md border bg-muted flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-medium leading-none">Site Global</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  eshop · oracle-global · localhost:1521 · XEPDB1
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50">
                Base principale · toutes tables complètes
              </span>
              <button
                onClick={load}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50 hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>
          </div>

          {/* ── Tab counters ── */}
          <div className="grid grid-cols-4 divide-x">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-5 py-4 text-left transition-colors",
                  tab === t.key
                    ? "bg-background"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <p className="text-[11px] text-muted-foreground mb-1.5">{t.label}</p>
                <p className={cn(
                  "text-[22px] font-medium tabular-nums leading-none",
                  tab === t.key ? "text-foreground" : "text-muted-foreground"
                )}>
                  {loading ? "—" : t.count}
                </p>
                {tab === t.key && (
                  <div className="h-px bg-foreground mt-3 -mb-4 -mx-5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Insert form ── */}
        <InsertForm
          endpoint="/global/lignes"
          color="purple"
          siteLabel="Global (auto-routé)"
          qteRule="auto"
          onSuccess={load}
        />

        {/* ── Data table ── */}
        <SiteTable
          title={`Global — ${activeTab.label}`}
          subtitle="eshop@oracle-global:1521"
          color="purple"
          data={dataMap[tab]}
          loading={loading}
        />

        {/* ── Footer nav ── */}
        <div className="flex items-center justify-between pt-1">
          <a
            href="/"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-md px-3 py-1.5 bg-background hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </a>
          <a
            href="/site1"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-md px-3 py-1.5 bg-background hover:bg-muted transition-colors"
          >
            Site 1
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

      </div>
    </main>
  );
}
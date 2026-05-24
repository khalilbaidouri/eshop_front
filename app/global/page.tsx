"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";

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

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <h1 className="text-2xl font-medium">Site Global</h1>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            eshop · oracle-global · localhost:1524 · XEPDB1
          </p>
        </div>
        <button onClick={load}
          className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50">
          Actualiser
        </button>
      </div>

      {/* Compteurs par onglet */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl border p-4 text-left transition-all ${
              tab === t.key
                ? "bg-purple-50 border-purple-300"
                : "bg-white hover:bg-gray-50"
            }`}>
            <p className="text-xs text-gray-500 mb-1">{t.label}</p>
            <p className="text-2xl font-medium text-purple-700">
              {loading ? "—" : t.count}
            </p>
          </button>
        ))}
      </div>

      {/* Formulaire d'insertion — visible seulement sur l'onglet lignes */}
      {tab === "lignes" && (
        <InsertForm
          cmdEndpoint="/global/commandes-list"
          prodEndpoint="/global/produits-list"
          insertEndpoint="/global/lignes"
          color="purple"
          siteLabel="Global (auto-routé)"
          qteRule="auto"
          onSuccess={load}
        />
      )}

      {/* Tableau */}
      <SiteTable
        title={`Global — ${tabs.find(t => t.key === tab)?.label}`}
        subtitle="eshop@oracle-global:1524"
        color="purple"
        data={dataMap[tab]}
        loading={loading}
      />

      <div className="mt-4 flex gap-3">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</a>
        <a href="/site1" className="text-sm text-gray-500 hover:text-gray-800">Site1 →</a>
      </div>
    </main>
  );
}
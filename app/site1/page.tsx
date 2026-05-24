"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";

export default function Site1Page() {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/site1").then(r => {
      setData(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const total = data.reduce((s, r) => s + Number(r.quantite    || 0), 0);
  const ca    = data.reduce((s, r) => s + Number(r.quantite    || 0)
                                        * Number(r.prixUnitaire || 0), 0);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-3 h-3 rounded-full bg-teal-400" />
        <h1 className="text-2xl font-medium">Site 1 — Gros volumes</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Fragment Quantité ≥ 100 · eshop1@oracle-site1:1522
      </p>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "LigneCommandes", value: data.length },
          { label: "Quantité totale", value: total.toLocaleString() },
          { label: "CA brut (DH)",    value: ca.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-teal-50 border-teal-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-medium text-teal-700">
              {loading ? "..." : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Formulaire d'insertion */}
      <InsertForm
        cmdEndpoint="/site1/commandes"
        prodEndpoint="/site1/produits"
        insertEndpoint="/site1/lignes"
        color="teal"
        siteLabel="Site1 (direct + propagé vers Global)"
        qteRule="gte100"
        onSuccess={load}
      />

      {/* Tableau */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">
          Lignes synchronisées via trigger SYC_INSERT_LIGNE
        </p>
        <button onClick={load}
          className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50">
          Rafraîchir
        </button>
      </div>

      <SiteTable
        title="Site1 — LigneCommandes1"
        subtitle="eshop1@oracle-site1:1522"
        color="teal"
        data={data}
        loading={loading}
      />

      <div className="mt-4 flex gap-3">
        <a href="/global" className="text-sm text-gray-500 hover:text-gray-800">← Global</a>
        <a href="/site2"  className="text-sm text-gray-500 hover:text-gray-800">Site2 →</a>
      </div>
    </main>
  );
}
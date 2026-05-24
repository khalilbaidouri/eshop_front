"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";

export default function Site2Page() {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/site2").then(r => {
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
        <div className="w-3 h-3 rounded-full bg-orange-400" />
        <h1 className="text-2xl font-medium">Site 2 — Petits volumes</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Fragment Quantité &lt; 100 · eshop2@oracle-site2:1523
      </p>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "LigneCommandes", value: data.length },
          { label: "Quantité totale", value: total.toLocaleString() },
          { label: "CA brut (DH)",    value: ca.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-orange-50 border-orange-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-medium text-orange-700">
              {loading ? "..." : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Formulaire d'insertion */}
      <InsertForm
        cmdEndpoint="/site2/commandes"
        prodEndpoint="/site2/produits"
        insertEndpoint="/site2/lignes"
        color="coral"
        siteLabel="Site2 (direct + propagé vers Global)"
        qteRule="lt100"
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
        title="Site2 — LigneCommandes2"
        subtitle="eshop2@oracle-site2:1523"
        color="coral"
        data={data}
        loading={loading}
      />

      <div className="mt-4 flex gap-3">
        <a href="/site1" className="text-sm text-gray-500 hover:text-gray-800">← Site1</a>
        <a href="/"      className="text-sm text-gray-500 hover:text-gray-800">Dashboard →</a>
      </div>
    </main>
  );
}
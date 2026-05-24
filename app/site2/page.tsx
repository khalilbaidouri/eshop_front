"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";

export default function Site2Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/site2").then((r) => {
      setData(r.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const total = data.reduce((s, r) => s + Number(r.quantite || 0), 0);
  const ca = data.reduce(
    (s, r) => s + Number(r.quantite || 0) * Number(r.prixUnitaire || 0),
    0,
  );

  return (
    <main className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-3 h-3 rounded-full bg-orange-400" />
        <h1 className="text-2xl font-medium">Site 2 — Petits volumes</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Fragment Quantité &lt; 100 — eshop2@oracle-site2:1523
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
          <p className="text-xs text-gray-500 mb-1">LigneCommandes</p>
          <p className="text-3xl font-medium text-orange-700">
            {loading ? "..." : data.length}
          </p>
        </div>
        <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Quantité totale</p>
          <p className="text-3xl font-medium text-orange-700">
            {loading ? "..." : total.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
          <p className="text-xs text-gray-500 mb-1">CA brut</p>
          <p className="text-3xl font-medium text-orange-700">
            {loading ? "..." : ca.toLocaleString()} DH
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">
          Toutes les lignes avec Quantité &lt; 100 synchronisées via trigger
        </p>
        <button
          onClick={load}
          className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50"
        >
          Rafraîchir
        </button>
      </div>
      <InsertForm
        endpoint="/site2/lignes"
        color="coral"
        siteLabel="Site2 directement"
        qteRule="lt100"
        onSuccess={load}
      />
      <SiteTable
        title="Site2 — LigneCommandes2"
        subtitle="Synchronisé automatiquement par SYC_INSERT_LIGNE"
        color="coral"
        data={data}
        loading={loading}
      />

      <div className="mt-4 flex gap-3">
        <a href="/site1" className="text-sm text-gray-500 hover:text-gray-800">
          ← Site1
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800">
          Dashboard →
        </a>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";

type Commande = {
  idcommande: number;
  idclient: number;
  idemploye: number;
  dateCommande: string;
  dateLivraison: string;
};

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    idClient: "",
    idEmploye: "",
    dateLivraison: "",
  });

  // GET ALL
  const fetchCommandes = async () => {
    setLoading(true);
    const res = await api.get("/commandes");
    setCommandes(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  // ADD
  const addCommande = async () => {
    await api.post("/commandes", {
      idclient: Number(form.idClient),
      idemploye: Number(form.idEmploye),
      dateLivraison: form.dateLivraison,
    });

    setForm({
      idClient: "",
      idEmploye: "",
      dateLivraison: "",
    });

    fetchCommandes();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion Commandes</h1>

      {/* FORM */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <input
          placeholder="ID Client"
          className="border p-2"
          value={form.idClient}
          onChange={(e) =>
            setForm({ ...form, idClient: e.target.value })
          }
        />

        <input
          placeholder="ID Employé"
          className="border p-2"
          value={form.idEmploye}
          onChange={(e) =>
            setForm({ ...form, idEmploye: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2"
          value={form.dateLivraison}
          onChange={(e) =>
            setForm({ ...form, dateLivraison: e.target.value })
          }
        />
      </div>

      <button
        onClick={addCommande}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        + Ajouter Commande
      </button>

      {/* TABLE */}
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Client</th>
              <th className="p-2 text-left">Employé</th>
              <th className="p-2 text-left">Date Commande</th>
            </tr>
          </thead>

          <tbody>
            {commandes.map((cmd) => (
              <tr key={cmd.idcommande} className="border-t">
                <td className="p-2">{cmd.idcommande}</td>
                <td className="p-2">{cmd.idClient}</td>
                <td className="p-2">{cmd.idEmploye}</td>
                <td className="p-2">{cmd.dateCommande}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-3 text-gray-500">Chargement...</p>
        )}
      </div>
    </div>
  );
}
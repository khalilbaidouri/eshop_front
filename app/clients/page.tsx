"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";

type Client = {
  idclient: number;
  codeclient: string;
  societe: string;
  contact: string;
  adresse: string;
  ville: string;
  pays: string;
  codePostal: string;
  telephone: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    codeclient: "",
    societe: "",
    contact: "",
    adresse: "",
    ville: "",
    pays: "",
    codePostal: "",
    telephone: "",
  });

  // GET ALL
  const fetchClients = async () => {
    setLoading(true);
    const res = await api.get("/clients");
    setClients(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ADD CLIENT
  const addClient = async () => {
    await api.post("/clients", form);

    setForm({
      codeclient: "",
      societe: "",
      contact: "",
      adresse: "",
      ville: "",
      pays: "",
      codePostal: "",
      telephone: "",
    });

    fetchClients();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion Clients</h1>

      {/* FORM */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <input
          placeholder="Code client"
          className="border p-2"
          value={form.codeclient}
          onChange={(e) => setForm({ ...form, codeclient: e.target.value })}
        />

        <input
          placeholder="Société"
          className="border p-2"
          value={form.societe}
          onChange={(e) => setForm({ ...form, societe: e.target.value })}
        />

        <input
          placeholder="Contact"
          className="border p-2"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />

        <input
          placeholder="Adresse"
          className="border p-2"
          value={form.adresse}
          onChange={(e) => setForm({ ...form, adresse: e.target.value })}
        />

        <input
          placeholder="Ville"
          className="border p-2"
          value={form.ville}
          onChange={(e) => setForm({ ...form, ville: e.target.value })}
        />

        <input
          placeholder="Pays"
          className="border p-2"
          value={form.pays}
          onChange={(e) => setForm({ ...form, pays: e.target.value })}
        />

        <input
          placeholder="Code Postal"
          className="border p-2"
          value={form.codePostal}
          onChange={(e) => setForm({ ...form, codePostal: e.target.value })}
        />

        <input
          placeholder="Téléphone"
          className="border p-2"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        />
      </div>

      <button
        onClick={addClient}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        + Ajouter Client
      </button>

      {/* TABLE */}
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Société</th>
              <th className="p-2 text-left">Contact</th>
              <th className="p-2 text-left">Ville</th>
              <th className="p-2 text-left">Pays</th>
              <th className="p-2 text-left">Téléphone</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((c) => (
              <tr key={c.idclient} className="border-t">
                <td className="p-2">{c.idclient}</td>
                <td className="p-2">{c.codeclient}</td>
                <td className="p-2">{c.societe}</td>
                <td className="p-2">{c.contact}</td>
                <td className="p-2">{c.ville}</td>
                <td className="p-2">{c.pays}</td>
                <td className="p-2">{c.telephone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-3 text-gray-500">Chargement...</p>}
      </div>
    </div>
  );
}

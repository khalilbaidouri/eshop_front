"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";

type Categorie = {
  idCategorie: number;
  designation: string;
};

type Produit = {
  idProduit: number;
  designation: string;
  prixUnitaire: number;
  uniteVente: string;
  categorie: Categorie;
};

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    designation: "",
    prixUnitaire: "",
    uniteVente: "",
    idCategorie: "",
  });

  // GET ALL
  const fetchProduits = async () => {
    setLoading(true);

    try {
      const res = await api.get("/produits");
      setProduits(res.data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProduits();
    fetchCategories();
  }, []);

  // ADD PRODUCT
  const addProduit = async () => {
    try {
      await api.post("/produits", {
        designation: form.designation,
        prixUnitaire: Number(form.prixUnitaire),
        uniteVente: form.uniteVente,
        categorie: {
          idCategorie: Number(form.idCategorie),
        },
      });

      setForm({
        designation: "",
        prixUnitaire: "",
        uniteVente: "",
        idCategorie: "",
      });

      fetchProduits();
    } catch (error) {
      console.error(
        "Erreur ajout produit",
        error
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Gestion Produits
      </h1>

      {/* FORM */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <input
          placeholder="Désignation"
          className="border p-2 rounded"
          value={form.designation}
          onChange={(e) =>
            setForm({
              ...form,
              designation: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Prix unitaire"
          className="border p-2 rounded"
          value={form.prixUnitaire}
          onChange={(e) =>
            setForm({
              ...form,
              prixUnitaire: e.target.value,
            })
          }
        />

        <input
          placeholder="Unité vente"
          className="border p-2 rounded"
          value={form.uniteVente}
          onChange={(e) =>
            setForm({
              ...form,
              uniteVente: e.target.value,
            })
          }
        />

        <select
          className="border p-2 rounded"
          value={form.idCategorie}
          onChange={(e) =>
            setForm({
              ...form,
              idCategorie: e.target.value,
            })
          }
        >
          <option value="">
            Choisir catégorie
          </option>

          {categories.map((cat) => (
            <option
              key={cat.idCategorie}
              value={cat.idCategorie}
            >
              {cat.designation}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={addProduit}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        + Ajouter Produit
      </button>

      {/* TABLE */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">
                ID
              </th>
              <th className="p-2 text-left">
                Désignation
              </th>
              <th className="p-2 text-left">
                Prix
              </th>
              <th className="p-2 text-left">
                Unité
              </th>
              <th className="p-2 text-left">
                Catégorie
              </th>
            </tr>
          </thead>

          <tbody>
            {produits.map((p) => (
              <tr
                key={p.idProduit}
                className="border-t"
              >
                <td className="p-2">
                  {p.idProduit}
                </td>

                <td className="p-2">
                  {p.designation}
                </td>

                <td className="p-2">
                  {p.prixUnitaire}
                </td>

                <td className="p-2">
                  {p.uniteVente}
                </td>

                <td className="p-2">
                  {p.categorie?.designation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-3 text-gray-500">
            Chargement...
          </p>
        )}
      </div>
    </div>
  );
}
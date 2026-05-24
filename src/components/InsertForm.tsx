"use client";
import { useState, useEffect } from "react";
import api from "@/src/lib/api";

interface Commande { idCommande: number; idClient: number; date?: string; }
interface Produit  { idProduit: number; designation: string; prix: number; }

interface Props {
  cmdEndpoint:    string;
  prodEndpoint:   string;
  insertEndpoint: string;
  color:          "purple" | "teal" | "coral";
  siteLabel:      string;
  qteRule:        "gte100" | "lt100" | "auto";
  onSuccess:      () => void;
}

const colors = {
  purple: {
    btn:    "bg-purple-700 hover:bg-purple-800 text-white",
    border: "border-purple-200 bg-purple-50",
    badge:  "bg-purple-100 text-purple-800",
    info:   "bg-purple-50 text-purple-700 border-purple-200",
    dot:    "bg-purple-400",
  },
  teal: {
    btn:    "bg-teal-700 hover:bg-teal-800 text-white",
    border: "border-teal-200 bg-teal-50",
    badge:  "bg-teal-100 text-teal-800",
    info:   "bg-teal-50 text-teal-700 border-teal-200",
    dot:    "bg-teal-400",
  },
  coral: {
    btn:    "bg-orange-600 hover:bg-orange-700 text-white",
    border: "border-orange-200 bg-orange-50",
    badge:  "bg-orange-100 text-orange-800",
    info:   "bg-orange-50 text-orange-700 border-orange-200",
    dot:    "bg-orange-400",
  },
};

const emptyForm = {
  idCommande: "", idProduit: "",
  quantite: "", prixUnitaire: "", remise: "0",
};

export default function InsertForm({
  cmdEndpoint, prodEndpoint, insertEndpoint,
  color, siteLabel, qteRule, onSuccess,
}: Props) {
  const [open,      setOpen]      = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [produits,  setProduits]  = useState<Produit[]>([]);
  const [form,      setForm]      = useState(emptyForm);
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [loading,   setLoading]   = useState(false);
  const c = colors[color];

  // Charger les listes quand on ouvre le formulaire
  useEffect(() => {
    if (!open) return;
    if (commandes.length === 0) {
      api.get(cmdEndpoint).then(r  => setCommandes(r.data)).catch(() => {});
    }
    if (produits.length === 0) {
      api.get(prodEndpoint).then(r => setProduits(r.data)).catch(() => {});
    }
  }, [open]);

  // Auto-remplir le prix quand on choisit un produit
  const onProduitChange = (val: string) => {
    const prod = produits.find(p => String(p.idProduit) === val);
    setForm(f => ({
      ...f,
      idProduit:    val,
      prixUnitaire: prod ? String(prod.prix) : f.prixUnitaire,
    }));
  };

  const selectedProd = produits.find(p => String(p.idProduit) === form.idProduit);
  const selectedCmd  = commandes.find(c => String(c.idCommande) === form.idCommande);

  const submit = async () => {
    if (!form.idCommande || !form.idProduit || !form.quantite) {
      setMsg({ text: "Commande, Produit et Quantité sont obligatoires", ok: false });
      return;
    }
    const qte = Number(form.quantite);
    if (qteRule === "gte100" && qte < 100) {
      setMsg({ text: `Site1 : Quantité doit être ≥ 100 (vous avez saisi ${qte})`, ok: false });
      return;
    }
    if (qteRule === "lt100" && qte >= 100) {
      setMsg({ text: `Site2 : Quantité doit être < 100 (vous avez saisi ${qte})`, ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post(insertEndpoint, {
        idCommande:   Number(form.idCommande),
        idProduit:    Number(form.idProduit),
        quantite:     qte,
        prixUnitaire: Number(form.prixUnitaire),
        remise:       Number(form.remise),
      });
      if (res.data.success) {
        setMsg({ text: res.data.message, ok: true });
        setForm(emptyForm);
        onSuccess();
      } else {
        setMsg({ text: res.data.message, ok: false });
      }
    } catch (e: any) {
      setMsg({ text: e.response?.data?.message || "Erreur réseau", ok: false });
    }
    setLoading(false);
  };

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden ${c.border}`}>

      {/* ── Toggle header ── */}
      <button
        onClick={() => { setOpen(!open); setMsg(null); }}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${c.dot}`} />
          <div>
            <p className="font-medium text-sm">+ Ajouter une ligne — {siteLabel}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {qteRule === "gte100" ? "Quantité ≥ 100 requise" :
               qteRule === "lt100"  ? "Quantité < 100 requise" :
               "Auto-routé via trigger SYC_INSERT_LIGNE"}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* ── Formulaire ── */}
      {open && (
        <div className="border-t bg-white px-5 py-5 space-y-4">

          {/* Sélection Commande */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Commande *
            </label>
            {commandes.length === 0 ? (
              <div className="border rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
                Chargement des commandes...
              </div>
            ) : (
              <select
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.idCommande}
                onChange={e => setForm({ ...form, idCommande: e.target.value })}
              >
                <option value="">— Sélectionner une commande —</option>
                {commandes.map(cmd => (
                  <option key={cmd.idCommande} value={cmd.idCommande}>
                    Commande #{cmd.idCommande}
                    {cmd.date ? ` · ${cmd.date}` : ""}
                    {` · Client #${cmd.idClient}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sélection Produit */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Produit *
            </label>
            {produits.length === 0 ? (
              <div className="border rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
                Chargement des produits...
              </div>
            ) : (
              <select
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.idProduit}
                onChange={e => onProduitChange(e.target.value)}
              >
                <option value="">— Sélectionner un produit —</option>
                {produits.map(p => (
                  <option key={p.idProduit} value={p.idProduit}>
                    #{p.idProduit} · {p.designation} · {p.prix} DH
                  </option>
                ))}
              </select>
            )}
            {selectedProd && (
              <p className="text-xs text-gray-400 mt-1">
                Prix auto-rempli : {selectedProd.prix} DH
              </p>
            )}
          </div>

          {/* Quantité · Prix · Remise */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Quantité *{" "}
                <span className={`px-1.5 py-0.5 rounded text-xs ${c.badge}`}>
                  {qteRule === "gte100" ? "≥ 100" :
                   qteRule === "lt100"  ? "< 100" : "libre"}
                </span>
              </label>
              <input
                type="number"
                min={qteRule === "gte100" ? 100 : 1}
                max={qteRule === "lt100" ? 99 : undefined}
                placeholder={qteRule === "gte100" ? "Min 100" : qteRule === "lt100" ? "Max 99" : "Ex: 50"}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.quantite}
                onChange={e => setForm({ ...form, quantite: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Prix unitaire (DH)</label>
              <input
                type="number" step="0.01"
                placeholder="Auto depuis produit"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.prixUnitaire}
                onChange={e => setForm({ ...form, prixUnitaire: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Remise (%)</label>
              <input
                type="number" min="0" max="100"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.remise}
                onChange={e => setForm({ ...form, remise: e.target.value })}
              />
            </div>
          </div>

          {/* Info routage automatique */}
          {qteRule === "auto" && form.quantite && (
            <div className={`text-xs px-3 py-2 rounded-lg border ${c.info}`}>
              Quantité {form.quantite} → trigger va router vers{" "}
              <strong>{Number(form.quantite) >= 100 ? "Site1" : "Site2"}</strong>
            </div>
          )}

          {/* Résumé */}
          {form.idCommande && form.idProduit && form.quantite && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 border">
              <p className="font-medium mb-1">Résumé avant insertion :</p>
              <p>
                Commande #{form.idCommande} ·{" "}
                {selectedProd?.designation ?? `Produit #${form.idProduit}`} ·{" "}
                Qté : <strong>{form.quantite}</strong> ·{" "}
                Prix : {form.prixUnitaire} DH ·{" "}
                Remise : {form.remise}%
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button
              onClick={submit}
              disabled={loading || !form.idCommande || !form.idProduit || !form.quantite}
              className={`px-5 py-2 text-sm rounded-lg transition-colors disabled:opacity-40 ${c.btn}`}
            >
              {loading ? "Insertion en cours..." : "Insérer la ligne"}
            </button>
            <button
              onClick={() => { setOpen(false); setMsg(null); setForm(emptyForm); }}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            {msg && (
              <span className={`text-xs px-3 py-2 rounded-lg flex-1 border ${
                msg.ok
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {msg.ok ? "✓" : "✗"} {msg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import api from '@/src/lib/api';

interface Props {
  endpoint: string;
  color: 'teal' | 'coral';
  siteLabel: string;
  qteRule: 'gte100' | 'lt100';
  onSuccess: () => void;
}

const colors = {
  teal:  { btn: 'bg-teal-700 hover:bg-teal-800',    border: 'border-teal-200 bg-teal-50',   badge: 'bg-teal-100 text-teal-800' },
  coral: { btn: 'bg-orange-600 hover:bg-orange-700', border: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-800' },
};

const emptyUpdate = { idLigneCommande: '', idProduit: '', quantite: '', prixUnitaire: '', remise: '' };

export default function UpdateForm({ endpoint, color, siteLabel, qteRule, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyUpdate);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const c = colors[color];

  const submit = async () => {
    if (!form.idLigneCommande) {
      setMsg({ text: 'ID Ligne obligatoire', ok: false });
      return;
    }
    const qte = Number(form.quantite);
    if (qteRule === 'gte100' && qte < 100) {
      setMsg({ text: 'Quantité doit être >= 100 sur ' + siteLabel, ok: false });
      return;
    }
    if (qteRule === 'lt100' && qte >= 100) {
      setMsg({ text: 'Quantité doit être < 100 sur ' + siteLabel, ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.put(`${endpoint}/${form.idLigneCommande}`, {
        idProduit:    Number(form.idProduit),
        quantite:     qte,
        prixUnitaire: Number(form.prixUnitaire),
        remise:       Number(form.remise),
      });
      setMsg({ text: res.data.message, ok: res.data.success });
      if (res.data.success) {
        setForm(emptyUpdate);
        onSuccess();
      }
    } catch (e: any) {
      setMsg({ text: e.response?.data?.message || 'Erreur réseau', ok: false });
    }
    setLoading(false);
  };

  return (
    <div className={`border rounded-xl mb-3 overflow-hidden ${c.border}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">✎</span>
          <span className="font-medium text-sm">Modifier une ligne dans {siteLabel}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>
            {qteRule === 'gte100' ? 'Qté ≥ 100' : 'Qté < 100'}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t bg-white px-5 py-5">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4 text-xs text-blue-700">
            La modification sur {siteLabel} sera automatiquement propagée vers Global via le trigger TRG_INV_UPDATE
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
            {[
              { label: 'ID Ligne à modifier *', key: 'idLigneCommande', hint: 'ID existant' },
              { label: 'Nouveau ID Produit', key: 'idProduit', hint: 'Laisser vide = inchangé' },
              { label: 'Nouvelle Quantité *', key: 'quantite', hint: qteRule === 'gte100' ? 'Min 100' : 'Max 99' },
              { label: 'Nouveau Prix', key: 'prixUnitaire', hint: 'Ex: 899.99' },
              { label: 'Nouvelle Remise (%)', key: 'remise', hint: '0-100' },
            ].map(({ label, key, hint }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input
                  type="number"
                  step="any"
                  placeholder={hint}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={submit}
              disabled={loading || !form.idLigneCommande || !form.quantite}
              className={`px-5 py-2 text-white text-sm rounded-lg transition-colors disabled:opacity-40 ${c.btn}`}
            >
              {loading ? 'Modification...' : 'Modifier'}
            </button>
            <button
              onClick={() => { setOpen(false); setMsg(null); setForm(emptyUpdate); }}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            {msg && (
              <span className={`text-xs px-3 py-1.5 rounded-lg ${
                msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {msg.ok ? '✓' : '✗'} {msg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
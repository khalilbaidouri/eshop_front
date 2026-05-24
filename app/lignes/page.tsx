'use client';
import { useEffect, useState } from 'react';
import api from '@/src/lib/api';

export default function Lignes() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [form, setForm] = useState({
    idLigneCommande: '', idCommande: '', idProduit: '',
    quantite: '', prixUnitaire: '', remise: '0'
  });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/lignes').then(r => setLignes(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await api.post('/lignes', {
        idLigneCommande: Number(form.idLigneCommande),
        idCommande: Number(form.idCommande),
        idProduit: Number(form.idProduit),
        quantite: Number(form.quantite),
        prixUnitaire: Number(form.prixUnitaire),
        remise: Number(form.remise),
      });
      setMsg(`Ligne insérée → ${Number(form.quantite) >= 100 ? 'Site1' : 'Site2'} (trigger déclenché)`);
      load();
    } catch(e: any) {
      setMsg('Erreur : ' + e.response?.data?.message);
    }
  };

  const del = async (id: number) => {
    await api.delete(`/lignes/${id}`);
    setMsg(`Ligne ${id} supprimée et synchronisée`);
    load();
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-6">LigneCommandes</h1>

      <div className="border rounded-xl p-6 mb-6 bg-gray-50">
        <h2 className="font-medium mb-4">Insérer une ligne</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            ['ID Ligne', 'idLigneCommande'],
            ['ID Commande', 'idCommande'],
            ['ID Produit', 'idProduit'],
            ['Quantité', 'quantite'],
            ['Prix Unitaire', 'prixUnitaire'],
            ['Remise (%)', 'remise'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={(form as any)[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={submit}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            Insérer
          </button>
          {msg && (
            <span className={`text-sm px-3 py-1 rounded-lg ${
              msg.includes('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>{msg}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Quantité ≥ 100 → Site1 | Quantité &lt; 100 → Site2 (trigger automatique)
        </p>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['ID','Commande','Produit','Quantité','Prix','Remise','Site','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map(l => (
              <tr key={l.idLigneCommande} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{l.idLigneCommande}</td>
                <td className="px-4 py-3">{l.idCommande}</td>
                <td className="px-4 py-3">{l.idProduit}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    l.quantite >= 100 ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                  }`}>{l.quantite}</span>
                </td>
                <td className="px-4 py-3">{l.prixUnitaire}</td>
                <td className="px-4 py-3">{l.remise}%</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    l.quantite >= 100 ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                  }`}>{l.quantite >= 100 ? 'Site1' : 'Site2'}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => del(l.idLigneCommande)}
                    className="text-red-500 hover:text-red-700 text-xs">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
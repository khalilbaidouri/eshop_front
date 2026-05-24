'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/src/lib/api';

export default function Stats() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get('/stats/ca').then(r => setData(r.data));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-2">CA par catégorie 2026</h1>
      <p className="text-sm text-gray-500 mb-6">
        Requête distribuée — somme Site1 + Site2 via DB Links
      </p>
      <div className="border rounded-xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="categorie" />
            <YAxis />
            <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} DH`} />
            <Bar dataKey="ca" fill="#534AB7" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Catégorie</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">CA Total (DH)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3">{d.categorie}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {Number(d.ca).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
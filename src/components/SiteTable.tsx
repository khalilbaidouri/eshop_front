"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import api from "@/src/lib/api";

interface Props {
  title: string;
  subtitle: string;
  color: "purple" | "teal" | "coral";
  data: any[];
  loading: boolean;
  updateEndpoint?: string;
  deleteEndpoint?: string;
  onSuccess?: () => void;
}

const editableCols = [
  "idproduit",
  "quantite",
  "prixunitaire",
  "remise",
  "idProduit",
  "prixUnitaire",
];

export default function SiteTable({
  title,
  subtitle,
  color: _color,
  data,
  loading,
  updateEndpoint,
  deleteEndpoint,
  onSuccess,
}: Props) {
  const [editingId, setEditingId] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  const idKey = cols[0];
  const hasActions = !!(updateEndpoint || deleteEndpoint);

  const startEdit = (row: any) => {
    setEditingId(row[idKey]);
    setEditForm({ ...row });
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setMsg(null);
  };

  const saveEdit = async () => {
    if (!updateEndpoint) return;

    const qte = Number(editForm["quantite"] ?? 0);

    // Vérifier la règle selon le site
    if (updateEndpoint.includes("site1") && qte < 100) {
      setMsg({
        text: `Site1 : Quantité doit être ≥ 100 (vous avez saisi ${qte})`,
        ok: false,
      });
      return;
    }
    if (updateEndpoint.includes("site2") && qte >= 100) {
      setMsg({
        text: `Site2 : Quantité doit être < 100 (vous avez saisi ${qte})`,
        ok: false,
      });
      return;
    }

    // Pour Global : vérifier selon la quantité ORIGINALE de la ligne
    if (updateEndpoint.includes("global")) {
      const originalQte = Number(
        data.find((r: any) => r[idKey] === editingId)?.quantite ?? 0,
      );
      if (originalQte >= 100 && qte < 100) {
        setMsg({
          text: `Cette ligne est sur Site1 (Qté originale=${originalQte}≥100). La nouvelle quantité doit rester ≥ 100`,
          ok: false,
        });
        return;
      }
      if (originalQte < 100 && qte >= 100) {
        setMsg({
          text: `Cette ligne est sur Site2 (Qté originale=${originalQte}<100). La nouvelle quantité doit rester < 100`,
          ok: false,
        });
        return;
      }
    }

    setSaving(true);
    setMsg(null);
    const endpoint = updateEndpoint.startsWith("/")
      ? updateEndpoint
      : `/${updateEndpoint}`;
    try {
      const res = await api.put(`${endpoint}/${editingId}`, {
        idProduit: Number(editForm["idProduit"] ?? editForm["idproduit"] ?? 0),
        quantite: qte,
        prixUnitaire: Number(
          editForm["prixUnitaire"] ?? editForm["prixunitaire"] ?? 0,
        ),
        remise: Number(editForm["remise"] ?? 0),
      });
      setMsg({ text: res.data.message, ok: res.data.success });
      if (res.data.success) {
        setEditingId(null);
        onSuccess?.();
      }
    } catch (e: any) {
      setMsg({ text: e.response?.data?.message || "Erreur réseau", ok: false });
    }
    setSaving(false);
  };
  const handleDelete = async (id: any) => {
    if (!deleteEndpoint) return;
    if (!confirm(`Supprimer la ligne #${id} ?`)) return;
    setDeleting(id);
    setMsg(null);
    try {
      const res = await api.delete(`${deleteEndpoint}/${id}`);
      setMsg({ text: res.data.message, ok: res.data.success });
      if (res.data.success) onSuccess?.();
    } catch (e: any) {
      setMsg({ text: e.response?.data?.message || "Erreur réseau", ok: false });
    }
    setDeleting(null);
  };

  const isEditable = (col: string) =>
    editableCols.some((k) => k.toLowerCase() === col.toLowerCase());

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-background">
        <div>
          <p className="text-[13px] font-medium leading-none">{title}</p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground border rounded-full px-2.5 py-1 bg-muted/50">
          {loading ? "—" : `${data.length} lignes`}
        </span>
      </div>

      {/* ── Message retour ── */}
      {msg && (
        <div
          className={cn(
            "px-5 py-2 text-[11px] border-b flex items-center gap-2",
            msg.ok
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100",
          )}
        >
          <span>{msg.ok ? "✓" : "✗"}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-[12px] text-muted-foreground">
            Chargement…
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-[12px] text-muted-foreground">
            Aucune donnée
          </div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b bg-muted/30 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b bg-muted/30 whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const rowId = row[idKey];
                const isEditing = editingId === rowId;

                return (
                  <tr
                    key={i}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      isEditing ? "bg-amber-50/60" : "hover:bg-muted/30",
                    )}
                  >
                    {/* ── Cellules ── */}
                    {cols.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2 text-foreground whitespace-nowrap"
                      >
                        {isEditing && isEditable(col) ? (
                          <input
                            type="number"
                            step="any"
                            className="w-24 border rounded px-2 py-1 text-[12px] font-mono bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                            value={editForm[col] ?? ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                [col]: e.target.value,
                              })
                            }
                          />
                        ) : col.toLowerCase() === "quantite" ? (
                          <span className="font-mono text-[11px] border rounded px-1.5 py-0.5 bg-muted/50 text-muted-foreground">
                            {row[col]}
                          </span>
                        ) : row[col] != null ? (
                          <span
                            className={cn(
                              typeof row[col] === "number"
                                ? "font-mono text-[11px] text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {String(row[col])}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    ))}

                    {/* ── Actions ── */}
                    {hasActions && (
                      <td className="px-4 py-2 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
                            >
                              {saving ? "…" : "✓ Sauvegarder"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-[11px] px-2.5 py-1 rounded-md border hover:bg-muted/50 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {updateEndpoint && (
                              <button
                                onClick={() => startEdit(row)}
                                className="text-[11px] px-2.5 py-1 rounded-md border hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                              >
                                ✎ Modifier
                              </button>
                            )}
                            {deleteEndpoint && (
                              <button
                                onClick={() => handleDelete(rowId)}
                                disabled={deleting === rowId}
                                className="text-[11px] px-2.5 py-1 rounded-md border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40"
                              >
                                {deleting === rowId ? "…" : "✕"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import api from "@/src/lib/api";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  endpoint: string;
  siteLabel: string;
  qteRule?: "gte100" | "lt100" | "auto";
  onSuccess: () => void;
}

const empty = {
  idCommande: "",
  idProduit: "",
  quantite: "",
  prixUnitaire: "",
  remise: "0",
};

const FIELDS = [
  { label: "ID Commande", key: "idCommande", hint: "Doit exister" },
  { label: "ID Produit", key: "idProduit", hint: "Doit exister" },
  { label: "Quantité", key: "quantite", hint: "" },
  { label: "Prix unitaire", key: "prixUnitaire", hint: "Ex : 899.99" },
  { label: "Remise (%)", key: "remise", hint: "0 par défaut" },
] as const;

export default function InsertForm({
  endpoint,
  siteLabel,
  qteRule = "auto",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const qteHint =
    qteRule === "gte100"
      ? "Minimum 100"
      : qteRule === "lt100"
        ? "Maximum 99"
        : "Auto-routé vers Site 1 ou Site 2";

  const submit = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const res = await api.post(endpoint, {
        idCommande: Number(form.idCommande),
        idProduit: Number(form.idProduit),
        quantite: Number(form.quantite),
        prixUnitaire: Number(form.prixUnitaire),
        remise: Number(form.remise),
      });

      if (res.data.success) {
        setMsg({ text: res.data.message, ok: true });
        setForm(empty);
        onSuccess();
      } else {
        setMsg({ text: res.data.message, ok: false });
      }
    } catch (e: any) {
      setMsg({ text: e.response?.data?.message ?? "Erreur réseau", ok: false });
    }

    setLoading(false);
  };

  const canSubmit =
    !loading && !!form.idCommande && !!form.idProduit && !!form.quantite;

  const qRoute =
    qteRule === "auto" && form.quantite !== ""
      ? Number(form.quantite) >= 100
        ? "Site 1"
        : "Site 2"
      : null;

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30"
      >
        <div className="flex items-center gap-2.5">
          <Plus className="w-3 h-3" />
          <span className="text-[13px] font-medium">
            Ajouter une ligne — {siteLabel}
          </span>
        </div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Form */}
      {open && (
        <div className="border-t px-5 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FIELDS.map(({ label, key }) => (
              <div key={key}>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {label}
                </label>

                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 text-[12px]"
                  value={(form as any)[key]}
                  placeholder={key === "quantite" ? qteHint : ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          {/* Routing info */}
          {qRoute && (
            <div className="mt-4 text-[11px] border rounded-lg px-3 py-2 bg-muted/30">
              Quantité {form.quantite} → routée vers <b>{qRoute}</b>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="bg-black text-white px-4 py-2 rounded-lg text-[12px] disabled:opacity-40"
            >
              {loading ? "Insertion..." : "Insérer"}
            </button>

            <button
              onClick={() => {
                setForm(empty);
                setMsg(null);
                setOpen(false);
              }}
              className="border px-4 py-2 rounded-lg text-[12px]"
            >
              Annuler
            </button>

            {msg && (
              <span
                className={cn(
                  "text-[11px] px-3 py-1 rounded-lg",
                  msg.ok
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
                )}
              >
                {msg.ok ? "✓" : "✗"} {msg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

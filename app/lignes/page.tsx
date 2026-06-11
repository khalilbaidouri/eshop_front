"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import api from "@/src/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  RefreshCw,
  Layers,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const rowVariant: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.42,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (600 / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function LignesPage() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    idCommande: "",
    idProduit: "",
    quantite: "",
    prixUnitaire: "",
    remise: "0",
  });

  const load = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const r = await api.get("/lignes");
      setLignes(r.data);
    } catch {
      toast.error("Impossible de charger les lignes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.idCommande || !form.quantite || !form.idProduit) {
      toast.error(
        "Remplissez les champs obligatoires (Commande, Produit, Quantité)",
      );
      return;
    }
    setSubmitting(true);
    try {
      const qty = Number(form.quantite);
      const payload = {
        idCommande: Number(form.idCommande),
        idProduit: Number(form.idProduit),
        quantite: qty,
        prixUnitaire: Number(form.prixUnitaire),
        remise: Number(form.remise),
      };
      const res = await api.post("/global/lignes", payload);
      if (res.data.success === false) {
        toast.error("Erreur Oracle : " + res.data.message);
        return;
      }
      toast.success(
        `Ligne insérée (ID auto) → ${qty >= 100 ? "Site1 (≥ 100)" : "Site2 (< 100)"}`,
      );
      setForm({
        idCommande: "",
        idProduit: "",
        quantite: "",
        prixUnitaire: "",
        remise: "0",
      });
      load();
    } catch (e: any) {
      toast.error(
        "Erreur : " + (e.response?.data?.message || e.message || "inconnue"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/global/lignes/${id}`);
      toast.success(`Ligne #${id} supprimée et synchronisée`);
      load();
    } catch {
      toast.error("Impossible de supprimer la ligne");
    } finally {
      setDeletingId(null);
    }
  };

  const totalQty = lignes.reduce((s, l) => s + Number(l.quantite || 0), 0);
  const totalCA = lignes.reduce(
    (s, l) => s + Number(l.quantite || 0) * Number(l.prixUnitaire || 0),
    0,
  );
  const site1Count = lignes.filter((l) => Number(l.quantite) >= 100).length;
  const site2Count = lignes.filter((l) => Number(l.quantite) < 100).length;

  const statsCards = [
    {
      label: "Total lignes",
      value: lignes.length,
      icon: <Layers className="w-5 h-5" />,
      description: "Lignes enregistrées",
    },
    {
      label: "Volume total",
      value: totalQty,
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Unités commandées",
    },
    {
      label: "Chiffre d'affaires",
      value: Math.round(totalCA),
      icon: <DollarSign className="w-5 h-5" />,
      description: "CA brut estimé (DH)",
    },
    {
      label: "Site1 / Site2",
      value: site1Count,
      icon: <Zap className="w-5 h-5" />,
      description: `${site1Count} gros · ${site2Count} petits volumes`,
    },
  ];

  const fields = [
    { label: "ID Commande *", key: "idCommande" },
    { label: "ID Produit *", key: "idProduit" },
    { label: "Quantité *", key: "quantite" },
    { label: "Prix Unitaire", key: "prixUnitaire" },
    { label: "Remise (%)", key: "remise" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-violet-100 rounded-xl"
                  whileHover={{
                    rotate: [0, -8, 8, 0],
                    transition: { duration: 0.4 },
                  }}
                >
                  <Layers className="w-6 h-6 text-violet-600" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                    Lignes de commande
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Oracle Global
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      localhost:1524 · XEPDB1
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-12">
                <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs">
                  <Zap className="w-3 h-3 mr-1" />≥ 100 → Site1
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  &lt; 100 → Site2
                </Badge>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={load}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-violet-200 hover:bg-violet-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <Card className="border-violet-100 hover:shadow-lg hover:border-violet-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-violet-50 rounded-lg text-violet-600"
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {stat.icon}
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {stat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-violet-600">
                      <AnimatedCount value={stat.value} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Insert form ────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mb-8"
        >
          <Card className="border-violet-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-violet-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                Nouvelle ligne de commande
              </CardTitle>
              <CardDescription>
                ID généré automatiquement · Quantité ≥ 100 → Site1 · Quantité
                &lt; 100 → Site2 (trigger automatique)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {fields.map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{label}</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(form as any)[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      className="border-violet-100 focus:border-violet-400"
                    />
                  </div>
                ))}
              </div>

              {/* Live routing preview */}
              <AnimatePresence>
                {form.quantite && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${Number(form.quantite) >= 100 ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}
                    >
                      {Number(form.quantite) >= 100 ? (
                        <>
                          <Zap className="w-4 h-4" /> Sera routée vers{" "}
                          <strong>Site1</strong> (gros volume ≥ 100) · ID auto
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Sera routée vers{" "}
                          <strong>Site2</strong> (petit volume &lt; 100) · ID
                          auto
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={submit}
                    disabled={submitting}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Insertion...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Insérer la ligne
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Lignes enregistrées
                    <AnimatePresence mode="wait">
                      {!loading && (
                        <motion.div
                          key={lignes.length}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Toutes les lignes · base globale
                  </CardDescription>
                </div>
                <AnimatePresence>
                  {refreshing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : lignes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">
                    Aucune ligne
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Insérez votre première ligne ci-dessus
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-md border border-violet-50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-violet-50/50">
                        {[
                          "ID (auto)",
                          "Commande",
                          "Produit",
                          "Quantité",
                          "Prix unit.",
                          "Remise",
                          "Site",
                          "Action",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className="text-xs font-semibold text-violet-700"
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {lignes.map((l, i) => (
                          <motion.tr
                            key={l.idLigneCommande}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={rowVariant}
                            className="border-b border-violet-50/60 hover:bg-violet-50/30 transition-colors"
                          >
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-mono text-violet-700 border-violet-200"
                              >
                                #{l.idLigneCommande}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {l.idCommande}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {l.idProduit}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  Number(l.quantite) >= 100
                                    ? "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100"
                                    : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
                                }
                              >
                                {l.quantite}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {Number(l.prixUnitaire).toLocaleString()} DH
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {l.remise}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  Number(l.quantite) >= 100
                                    ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-50"
                                    : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
                                }
                              >
                                {Number(l.quantite) >= 100 ? "Site1" : "Site2"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => del(l.idLigneCommande)}
                                  disabled={deletingId === l.idLigneCommande}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                >
                                  {deletingId === l.idLigneCommande ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </motion.div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex justify-between items-center pt-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </motion.div>
          <div className="text-xs text-muted-foreground">
            ID auto · Routage automatique via trigger
          </div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/produits">
                Produits <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Package,
  Tag,
  DollarSign,
  BarChart3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Categorie = { idCategorie: number; designation: string };
type Produit = {
  idProduit: number;
  designation: string;
  prixUnitaire: number;
  uniteVente: string;
  categorie: Categorie | null;
};

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const rowVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: "easeOut" },
  }),
};

// ─── Animated counter ─────────────────────────────────────────────────────────

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
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

// ─── Category badge palette ───────────────────────────────────────────────────

const palette = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-purple-100 text-purple-700 border-purple-200",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [form, setForm] = useState({
    designation: "",
    prixUnitaire: "",
    uniteVente: "",
    idCategorie: "",
  });

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchProduits = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.get("/produits");
      console.log("Produits API response:", res.data);
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data?.content ?? res.data?.data ?? []);
      setProduits(data);
    } catch {
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await api.get("/categories");
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data?.content ?? res.data?.data ?? []);
      setCategories(data);
      if (data.length === 0)
        toast.warning("Aucune catégorie trouvée. Créez-en d'abord.");
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProduits();
    fetchCategories();
  }, []);

  // ── Add product ────────────────────────────────────────────────────────────

  const addProduit = async () => {
    if (!form.designation || !form.prixUnitaire) {
      toast.error("Désignation et prix sont requis");
      return;
    }
    if (!form.idCategorie) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/produits", {
        designation: form.designation,
        prixUnitaire: Number(form.prixUnitaire),
        uniteVente: form.uniteVente.trim() || "pièce",
        categorie: { idCategorie: Number(form.idCategorie) },
      });
      toast.success("Produit ajouté avec succès");
      setForm({
        designation: "",
        prixUnitaire: "",
        uniteVente: "",
        idCategorie: "",
      });
      fetchProduits();
    } catch {
      toast.error("Impossible d'ajouter le produit");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const avgPrice =
    produits.length > 0
      ? produits.reduce((s, p) => s + (p.prixUnitaire ?? 0), 0) /
        produits.length
      : 0;

  const catCount = new Set(
    produits.map((p) => p.categorie?.idCategorie).filter(Boolean),
  ).size;

  const statsCards = [
    {
      label: "Total produits",
      value: produits.length,
      icon: <Package className="w-5 h-5" />,
      description: "Produits au catalogue",
    },
    {
      label: "Catégories",
      value: catCount,
      icon: <Tag className="w-5 h-5" />,
      description: "Catégories distinctes",
    },
    {
      label: "Prix moyen",
      value: Math.round(avgPrice),
      icon: <DollarSign className="w-5 h-5" />,
      description: "Prix unitaire moyen (DH)",
    },
    {
      label: "Produits actifs",
      value: produits.length,
      icon: <BarChart3 className="w-5 h-5" />,
      description: "En vente actuellement",
    },
  ];

  // Badge color map keyed by category id
  const catColors: Record<number, string> = {};
  categories.forEach((cat, i) => {
    catColors[cat.idCategorie] = palette[i % palette.length];
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
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
                  className="p-2 bg-emerald-100 rounded-xl"
                  whileHover={{
                    rotate: [0, -8, 8, 0],
                    transition: { duration: 0.4 },
                  }}
                >
                  <Package className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    Produits
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
              <p className="text-sm text-muted-foreground ml-12">
                Catalogue des produits disponibles à la vente
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={fetchProduits}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-emerald-200 hover:bg-emerald-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.88 },
                visible: (i) => ({
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.42,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }),
              }}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <Card className="border-emerald-100 hover:shadow-lg hover:border-emerald-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-emerald-50 rounded-lg text-emerald-600"
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
                    <div className="text-2xl font-bold text-emerald-600">
                      <AnimatedCount value={stat.value} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add product form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mb-8"
        >
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-emerald-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                Nouveau produit
              </CardTitle>
              <CardDescription>Ajoutez un produit au catalogue</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Désignation *</label>
                  <Input
                    placeholder="Nom du produit"
                    value={form.designation}
                    onChange={(e) =>
                      setForm({ ...form, designation: e.target.value })
                    }
                    className="border-emerald-100 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix unitaire *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.prixUnitaire}
                    onChange={(e) =>
                      setForm({ ...form, prixUnitaire: e.target.value })
                    }
                    className="border-emerald-100 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unité de vente</label>
                  <Input
                    placeholder="Ex: pièce, kg, litre"
                    value={form.uniteVente}
                    onChange={(e) =>
                      setForm({ ...form, uniteVente: e.target.value })
                    }
                    className="border-emerald-100 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie *</label>
                  {loadingCategories ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <select
                      className="w-full border border-emerald-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                      value={form.idCategorie}
                      onChange={(e) =>
                        setForm({ ...form, idCategorie: e.target.value })
                      }
                    >
                      <option value="">-- Sélectionner une catégorie --</option>
                      {categories.map((cat) => (
                        <option key={cat.idCategorie} value={cat.idCategorie}>
                          {cat.designation}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={fetchCategories}
                  disabled={loadingCategories}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingCategories ? "animate-spin" : ""}`}
                  />
                  Recharger catégories
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={addProduit}
                    disabled={submitting}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Ajouter le produit
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products table */}
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
                    Catalogue produits
                    <AnimatePresence mode="wait">
                      {!loading && (
                        <motion.div
                          key={produits.length}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {produits.length} produit
                            {produits.length > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Base Oracle Global
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
              ) : produits.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">
                    Catalogue vide
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajoutez votre premier produit ci-dessus
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-md border border-emerald-50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50">
                        <TableHead className="text-xs font-semibold text-emerald-700">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-emerald-700">
                          Désignation
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-emerald-700">
                          Prix unitaire
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-emerald-700">
                          Unité
                        </TableHead>
                        
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produits.map((p, i) => (
                        <motion.tr
                          key={p.idProduit}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={rowVariant}
                          className="border-b border-emerald-50/60 hover:bg-emerald-50/30 transition-colors"
                        >
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-emerald-700 border-emerald-200"
                            >
                              #{p.idProduit}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {p.designation}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm font-semibold text-emerald-700">
                              {p.prixUnitaire?.toLocaleString()} DH
                            </span>
                          </TableCell>
                          <TableCell>
                            {p.uniteVente && p.uniteVente.trim() !== "" ? (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gray-100"
                              >
                                {p.uniteVente}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
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
            Catalogue produits
          </div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/clients">
                Clients <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

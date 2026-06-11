"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
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
  ShoppingCart,
  Calendar,
  User,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Commande = {
  idcommande: number;
  idclient: number;
  idemploye: number;
  dateCommande: string;
  dateLivraison: string;
};

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const rowVariant: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: "easeOut" },
  }),
};

// ─── Animated counter ─────────────────────────────────────────────────────

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = 16;
    const inc = value / (600 / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    idClient: "",
    idEmploye: "",
    dateLivraison: "",
  });

  const fetchCommandes = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.get("/commandes");
      setCommandes(res.data);
    } catch {
      toast.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCommandes(); }, []);

  const addCommande = async () => {
    if (!form.idClient || !form.idEmploye) {
      toast.error("ID Client et ID Employé sont requis");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/commandes", {
        idClient: Number(form.idClient),
        idEmploye: Number(form.idEmploye),
        dateLivraison: form.dateLivraison,
      });
      toast.success("Commande ajoutée avec succès");
      setForm({ idClient: "", idEmploye: "", dateLivraison: "" });
      fetchCommandes();
    } catch {
      toast.error("Impossible d'ajouter la commande");
    } finally {
      setSubmitting(false);
    }
  };

  const statsCards = [
    {
      label: "Total commandes",
      value: commandes.length,
      icon: <ShoppingCart className="w-5 h-5" />,
      description: "Commandes enregistrées",
    },
    {
      label: "Clients uniques",
      value: new Set(commandes.map(c => c.idclient)).size,
      icon: <User className="w-5 h-5" />,
      description: "Clients distincts",
    },
    {
      label: "Employés actifs",
      value: new Set(commandes.map(c => c.idemploye)).size,
      icon: <ClipboardList className="w-5 h-5" />,
      description: "Employés impliqués",
    },
    {
      label: "Ce mois",
      value: commandes.filter(c =>
        new Date(c.dateCommande).getMonth() === new Date().getMonth()
      ).length,
      icon: <Calendar className="w-5 h-5" />,
      description: "Commandes du mois",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-indigo-100 rounded-xl"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                    Commandes
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">Oracle Global</Badge>
                    <span className="text-xs text-muted-foreground">localhost:1524 · XEPDB1</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-12">
                Gestion et suivi des commandes clients
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={fetchCommandes}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-indigo-200 hover:bg-indigo-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats cards ────────────────────────────────────────── */}
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
                    ease: [0.22, 1, 0.36, 1] as any,
                  },
                }),
              }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
            >
              <Card className="border-indigo-100 hover:shadow-lg hover:border-indigo-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-indigo-50 rounded-lg text-indigo-600"
                      whileHover={{ rotate: 15 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {stat.icon}
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-xs">{stat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : (
                    <div className="text-2xl font-bold text-indigo-600">
                      <AnimatedCount value={stat.value} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Insert form ────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-8">
          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-indigo-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Nouvelle commande
              </CardTitle>
              <CardDescription>Créez une commande pour un client existant</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "ID Client *", key: "idClient", type: "number", placeholder: "Ex: 1" },
                  { label: "ID Employé *", key: "idEmploye", type: "number", placeholder: "Ex: 1" },
                  { label: "Date de livraison", key: "dateLivraison", type: "date", placeholder: "" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{label}</label>
                    <Input
                      type={type}
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="border-indigo-100 focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={addCommande}
                    disabled={submitting}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Ajout...</>
                      : <><Plus className="w-4 h-4" />Ajouter la commande</>
                    }
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Liste des commandes
                    <AnimatePresence mode="wait">
                      {!loading && (
                        <motion.div
                          key={commandes.length}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {commandes.length} commande{commandes.length > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1">Base Oracle Global · localhost:1524</CardDescription>
                </div>
                <AnimatePresence>
                  {refreshing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : commandes.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">Aucune commande</p>
                  <p className="text-sm text-muted-foreground mt-1">Créez votre première commande ci-dessus</p>
                </motion.div>
              ) : (
                <div className="rounded-md border border-indigo-50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-indigo-50/50">
                        {["ID", "Client", "Employé", "Date commande", "Livraison"].map(h => (
                          <TableHead key={h} className="text-xs font-semibold text-indigo-700">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commandes.map((cmd, i) => (
                        <motion.tr
                          key={cmd.idcommande}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={rowVariant}
                          className="border-b border-indigo-50/60 hover:bg-indigo-50/30 transition-colors"
                        >
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-indigo-700 border-indigo-200">
                              #{cmd.idcommande}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium">{cmd.idclient}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{cmd.idemploye}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {cmd.dateCommande
                                  ? new Date(cmd.dateCommande).toLocaleDateString("fr-FR")
                                  : "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cmd.dateLivraison ? (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                                {new Date(cmd.dateLivraison).toLocaleDateString("fr-FR")}
                              </Badge>
                            ) : <span className="text-muted-foreground">—</span>}
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

        {/* ── Navigation ─────────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex justify-between items-center pt-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/"><ArrowLeft className="w-4 h-4" />Dashboard</Link>
            </Button>
          </motion.div>
          <div className="text-xs text-muted-foreground">Gestion des commandes</div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/clients">Clients <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}
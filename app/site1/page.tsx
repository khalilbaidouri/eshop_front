"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Database,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Animated counter ─────────────────────────────────────────────────────

function AnimatedCount({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 700;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {decimals > 0
        ? display.toLocaleString(undefined, { maximumFractionDigits: decimals })
        : Math.floor(display).toLocaleString()}
    </span>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────

function AnimatedProgress({ value }: { value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(value, 100)), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative h-2 bg-teal-100 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Site1Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/site1");
      setData(response.data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = data.reduce((s, r) => s + Number(r.quantite || 0), 0);
  const ca = data.reduce(
    (s, r) => s + Number(r.quantite || 0) * Number(r.prixUnitaire || 0),
    0,
  );
  const avgOrderValue = data.length > 0 ? ca / data.length : 0;
  const revenueTarget = 1000000;
  const revenueProgress = (ca / revenueTarget) * 100;

  const statsCards = [
    {
      label: "Lignes de commande",
      value: data.length,
      rawValue: data.length,
      icon: <Package className="w-5 h-5" />,
      suffix: "",
      description: "Total des transactions",
    },
    {
      label: "Quantité totale",
      value: total,
      rawValue: total,
      icon: <TrendingUp className="w-5 h-5" />,
      suffix: "unités",
      description: "Volume d'activité",
    },
    {
      label: "Chiffre d'affaires",
      value: ca,
      rawValue: ca,
      icon: <DollarSign className="w-5 h-5" />,
      suffix: "DH",
      description: "CA brut estimé",
    },
    {
      label: "Panier moyen",
      value: Math.round(avgOrderValue),
      rawValue: Math.round(avgOrderValue),
      icon: <Zap className="w-5 h-5" />,
      suffix: "DH",
      description: "Valeur moyenne par ligne",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
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
                {/* Pulsing icon */}
                <motion.div
                  className="p-2 bg-teal-100 rounded-xl relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Database className="w-6 h-6 text-teal-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                      Site 1 — Gros volumes
                    </h1>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200">
                        <Zap className="w-3 h-3 mr-1" />
                        Quantité ≥ 100
                      </Badge>
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">Oracle Site1</Badge>
                    <span className="text-xs text-muted-foreground">
                      eshop1@oracle-site1:1522
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-12">
                Fragment contenant les lignes avec quantité ≥ 100 · Synchronisation globale automatique
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={load}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-teal-200 hover:bg-teal-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Rafraîchir
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
              variants={scaleIn}
              whileHover={{
                y: -5,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <Card className="border-teal-100 hover:shadow-lg hover:border-teal-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-teal-50 rounded-lg text-teal-600"
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
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-teal-600">
                        <AnimatedCount value={stat.rawValue} />
                      </div>
                      {stat.suffix && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.suffix}
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── CA progress ────────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && ca > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-teal-50 to-white border-teal-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Objectif chiffre d'affaires annuel</span>
                    <motion.span
                      className="text-teal-600 font-bold"
                      key={revenueProgress}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {Math.round(revenueProgress)}%
                    </motion.span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedProgress value={revenueProgress} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0 DH</span>
                    <span>{ca.toLocaleString()} DH</span>
                    <span>{(1000000).toLocaleString()} DH</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Insert form ────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="mb-8"
        >
          <Card className="border-teal-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-teal-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Nouvelle ligne de commande
              </CardTitle>
              <CardDescription>
                Ajoutez une ligne avec quantité ≥ 100 — sera automatiquement propagée vers la base globale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <InsertForm
                cmdEndpoint="/site1/commandes"
                prodEndpoint="/site1/produits"
                insertEndpoint="/site1/lignes"
                color="teal"
                siteLabel="Site1 (direct + propagé vers Global)"
                qteRule="gte100"
                onSuccess={load}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Data table ─────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Lignes de commande
                    <AnimatePresence mode="wait">
                      {!loading && data.length > 0 && (
                        <motion.div
                          key={data.length}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {data.length} ligne{data.length > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <span>Base Oracle Site1 · eshop1@oracle-site1:1522</span>
                    <Badge variant="outline" className="text-xs">Fragment conditionnel</Badge>
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  Synchronisation via trigger SYC_INSERT_LIGNE
                  <AnimatePresence>
                    {refreshing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <RefreshCw className="w-3 h-3 animate-spin ml-2" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SiteTable
                title=""
                subtitle=""
                color="teal"
                data={data}
                loading={loading}
                updateEndpoint="/site1/lignes"
                deleteEndpoint="/site1/lignes"
                onSuccess={load}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex justify-between items-center pt-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/global">
                <ArrowLeft className="w-4 h-4" />
                Base Global
              </a>
            </Button>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-teal-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-muted-foreground">Trigger actif</span>
            </div>
            <Badge variant="outline" className="text-xs">Propagation automatique</Badge>
          </div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/site2">
                Site 2
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 
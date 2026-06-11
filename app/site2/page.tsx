"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Package,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Database,
  Sparkles,
  AlertCircle,
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

function AnimatedCount({ value }: { value: number }) {
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

  return <span>{Math.floor(display).toLocaleString()}</span>;
}

// ─── Animated progress bar ────────────────────────────────────────────────

function AnimatedProgress({
  value,
  colorClass = "from-orange-500 to-orange-400",
}: {
  value: number;
  colorClass?: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(value, 100)), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative h-2 bg-orange-100 rounded-full overflow-hidden">
      <motion.div
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClass} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Site2Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/site2");
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
  const avgQuantity = data.length > 0 ? total / data.length : 0;

  const smallVolumeThreshold = 99;
  const smallVolumeCount = data.filter(
    (row) => Number(row.quantite || 0) <= smallVolumeThreshold,
  ).length;
  const smallVolumePercentage =
    data.length > 0 ? (smallVolumeCount / data.length) * 100 : 0;

  const growthTarget = 20;
  const currentGrowth = 15;

  const statsCards = [
    {
      label: "Lignes de commande",
      rawValue: data.length,
      icon: <Package className="w-5 h-5" />,
      suffix: "",
      description: "Transactions petites quantités",
    },
    {
      label: "Quantité totale",
      rawValue: total,
      icon: <TrendingUp className="w-5 h-5" />,
      suffix: "unités",
      description: "Volume total distribué",
    },
    {
      label: "Chiffre d'affaires",
      rawValue: ca,
      icon: <DollarSign className="w-5 h-5" />,
      suffix: "DH",
      description: "CA brut estimé",
    },
    {
      label: "Panier moyen",
      rawValue: Math.round(avgOrderValue),
      icon: <Sparkles className="w-5 h-5" />,
      suffix: "DH",
      description: "Valeur moyenne par ligne",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
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
                  className="p-2 bg-orange-100 rounded-xl relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Database className="w-6 h-6 text-orange-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      Site 2 — Petits volumes
                    </h1>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Quantité &lt; 100
                      </Badge>
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">Oracle Site2</Badge>
                    <span className="text-xs text-muted-foreground">
                      eshop2@oracle-site2:1523
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-12">
                Fragment contenant les lignes avec quantité &lt; 100 · Synchronisation globale automatique
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={load}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-orange-200 hover:bg-orange-50"
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
              <Card className="border-orange-100 hover:shadow-lg hover:border-orange-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-orange-50 rounded-lg text-orange-600"
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
                      <div className="text-2xl font-bold text-orange-600">
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

        {/* ── Analysis cards ─────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && data.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
            >
              {/* Distribution card */}
              <Card className="bg-gradient-to-r from-orange-50 to-white border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Distribution des quantités
                  </CardTitle>
                  <CardDescription>
                    Analyse des lignes par seuil de quantité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Petits volumes (≤ 99 unités)
                        </span>
                        <motion.span
                          className="font-medium text-orange-600"
                          key={smallVolumePercentage}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                        >
                          {Math.round(smallVolumePercentage)}%
                        </motion.span>
                      </div>
                      <AnimatedProgress value={smallVolumePercentage} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {smallVolumeCount} lignes respectent le critère du fragment
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Quantité moyenne par ligne
                        </span>
                        <span className="font-medium text-orange-600">
                          {Math.round(avgQuantity)} unités
                        </span>
                      </div>
                      <AnimatedProgress value={(avgQuantity / 100) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth card */}
              <Card className="bg-gradient-to-r from-orange-50 to-white border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Objectif de croissance
                  </CardTitle>
                  <CardDescription>
                    Suivi de la performance commerciale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Progression CA</span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Badge
                          variant={currentGrowth >= growthTarget ? "default" : "secondary"}
                          className={
                            currentGrowth >= growthTarget
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          +{currentGrowth}% / +{growthTarget}%
                        </Badge>
                      </motion.div>
                    </div>
                    <AnimatedProgress
                      value={(currentGrowth / growthTarget) * 100}
                      colorClass={
                        currentGrowth >= growthTarget
                          ? "from-green-500 to-green-400"
                          : "from-orange-500 to-orange-400"
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {currentGrowth >= growthTarget
                        ? "✓ Objectif de croissance atteint !"
                        : `Encore ${growthTarget - currentGrowth}% à parcourir pour atteindre l'objectif`}
                    </p>
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
          custom={6}
          className="mb-8"
        >
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-orange-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Nouvelle ligne de commande
              </CardTitle>
              <CardDescription>
                Ajoutez une ligne avec quantité &lt; 100 — sera automatiquement propagée vers la base globale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <InsertForm
                cmdEndpoint="/site2/commandes"
                prodEndpoint="/site2/produits"
                insertEndpoint="/site2/lignes"
                color="coral"
                siteLabel="Site2 (direct + propagé vers Global)"
                qteRule="lt100"
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
          custom={7}
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
                    <span>Base Oracle Site2 · eshop2@oracle-site2:1523</span>
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
                updateEndpoint="/site2/lignes"
                deleteEndpoint="/site2/lignes"
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
              <a href="/site1">
                <ArrowLeft className="w-4 h-4" />
                Site 1 — Gros volumes
              </a>
            </Button>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-orange-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-muted-foreground">Trigger actif</span>
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50">
              Petits volumes &lt; 100
            </Badge>
          </div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
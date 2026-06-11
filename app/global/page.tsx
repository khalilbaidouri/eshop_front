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
import { RefreshCw, ArrowLeft, ArrowRight, Database, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "lignes" | "clients" | "produits" | "commandes";

interface TabConfig {
  key: Tab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const tableVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ─── Animated counter ─────────────────────────────────────────────────────

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function GlobalPage() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("lignes");

  const load = async () => {
    setRefreshing(true);
    try {
      const [l, c, p, cmd] = await Promise.all([
        api.get("/global"),
        api.get("/clients"),
        api.get("/produits"),
        api.get("/commandes"),
      ]);
      setLignes(l.data);
      setClients(c.data);
      setProduits(p.data);
      setCommandes(cmd.data);
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

  const tabsConfig: TabConfig[] = [
    {
      key: "lignes",
      label: "Lignes de commande",
      icon: <Database className="w-4 h-4" />,
      description: "Détail des lignes",
    },
    {
      key: "clients",
      label: "Clients",
      icon: <Database className="w-4 h-4" />,
      description: "Liste des clients",
    },
    {
      key: "produits",
      label: "Produits",
      icon: <Database className="w-4 h-4" />,
      description: "Catalogue produits",
    },
    {
      key: "commandes",
      label: "Commandes",
      icon: <Database className="w-4 h-4" />,
      description: "Historique commandes",
    },
  ];

  const dataMap = { lignes, clients, produits, commandes };
  const currentCount = dataMap[tab].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
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
                  className="p-2 bg-purple-100 rounded-xl"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <Globe className="w-6 h-6 text-purple-600" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Site Global
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">Oracle Global</Badge>
                    <span className="text-xs text-muted-foreground">
                      localhost:1524 · XEPDB1
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-12">
                Gestion centralisée de l'eshop multibase
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={load}
                disabled={refreshing}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabsConfig.map((t, i) => (
            <motion.div
              key={t.key}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(147,51,234,0.12)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className={`cursor-pointer transition-colors duration-200 h-full ${
                  tab === t.key
                    ? "border-purple-300 bg-purple-50/50 shadow-md ring-1 ring-purple-200"
                    : "hover:border-purple-200"
                }`}
                onClick={() => setTab(t.key)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {t.label}
                    <motion.div
                      animate={{ rotate: tab === t.key ? 360 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {t.icon}
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-xs">{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-purple-600">
                      <AnimatedCount value={dataMap[t.key].length} />
                    </div>
                  )}
                </CardContent>

                {/* Active underline indicator */}
                <AnimatePresence>
                  {tab === t.key && (
                    <motion.div
                      className="h-0.5 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full mx-4 mb-3"
                      layoutId="activeTab"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Insert form ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {tab === "lignes" && (
            <motion.div
              key="insert-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-8"
            >
              <Card className="border-purple-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full" />
                    Nouvelle ligne de commande
                  </CardTitle>
                  <CardDescription>
                    Ajoutez une nouvelle ligne dans la base globale
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <InsertForm
                    cmdEndpoint="/global/commandes-list"
                    prodEndpoint="/global/produits-list"
                    insertEndpoint="/global/lignes"
                    color="purple"
                    siteLabel="Global (auto-routé)"
                    qteRule="auto"
                    onSuccess={load}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Data table ─────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tabsConfig.find((t) => t.key === tab)?.label}
                    <AnimatePresence mode="wait">
                      {!loading && (
                        <motion.div
                          key={currentCount}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {currentCount} enregistrement{currentCount > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Base Oracle Global · localhost:1524 · XEPDB1
                  </CardDescription>
                </div>
                <AnimatePresence>
                  {refreshing && (
                    <motion.div
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  variants={tableVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <SiteTable
                    title=""
                    subtitle=""
                    color="purple"
                    data={dataMap[tab]}
                    loading={loading}
                    updateEndpoint={tab === "lignes" ? "/global/lignes" : undefined}
                    deleteEndpoint={tab === "lignes" ? "/global/lignes" : undefined}
                    onSuccess={load}
                  />
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex justify-between items-center pt-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </a>
            </Button>
          </motion.div>
          <div className="text-xs text-muted-foreground">Base de données globale</div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <a href="/site1">
                Site 1
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
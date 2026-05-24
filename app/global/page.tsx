"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      description: "Détail des lignes de commande"
    },
    { 
      key: "clients", 
      label: "Clients", 
      icon: <Database className="w-4 h-4" />,
      description: "Liste des clients enregistrés"
    },
    { 
      key: "produits", 
      label: "Produits", 
      icon: <Database className="w-4 h-4" />,
      description: "Catalogue des produits"
    },
    { 
      key: "commandes", 
      label: "Commandes", 
      icon: <Database className="w-4 h-4" />,
      description: "Historique des commandes"
    },
  ];

  const dataMap = { lignes, clients, produits, commandes };
  const currentCount = dataMap[tab].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Site Global
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
                Gestion centralisée de l'eshop multibase
              </p>
            </div>

            <Button
              onClick={load}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabsConfig.map((t) => (
            <Card
              key={t.key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                tab === t.key
                  ? "border-purple-300 bg-purple-50/50 shadow-md"
                  : "hover:border-purple-200"
              }`}
              onClick={() => setTab(t.key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {t.label}
                  {t.icon}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-purple-600">
                    {dataMap[t.key].length}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insert Form - Only for lignes tab */}
        {tab === "lignes" && (
          <Card className="mb-8 border-purple-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                Nouvelle ligne de commande
              </CardTitle>
              <CardDescription>
                Ajoutez une nouvelle ligne de commande dans la base globale
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
        )}

        {/* Data Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {tabsConfig.find(t => t.key === tab)?.label}
                  {!loading && (
                    <Badge variant="secondary" className="ml-2">
                      {currentCount} enregistrement{currentCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  Base Oracle Global · localhost:1524 · XEPDB1
                </CardDescription>
              </div>
              {refreshing && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <SiteTable
              title=""
              subtitle=""
              color="purple"
              data={dataMap[tab]}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </a>
          </Button>
          <div className="text-xs text-muted-foreground">
            Base de données globale
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/site1">
              Site 1
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
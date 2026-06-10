"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Package, DollarSign, ArrowLeft, ArrowRight, Database, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const ca = data.reduce((s, r) => s + Number(r.quantite || 0) * Number(r.prixUnitaire || 0), 0);
  const avgOrderValue = data.length > 0 ? ca / data.length : 0;

  // Simuler un objectif de CA (exemple: 1,000,000 DH)
  const revenueTarget = 1000000;
  const revenueProgress = (ca / revenueTarget) * 100;

  const statsCards = [
    {
      label: "Lignes de commande",
      value: data.length,
      icon: <Package className="w-5 h-5" />,
      color: "teal",
      suffix: "",
      description: "Total des transactions"
    },
    {
      label: "Quantité totale",
      value: total.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "teal",
      suffix: "unités",
      description: "Volume d'activité"
    },
    {
      label: "Chiffre d'affaires",
      value: ca.toLocaleString(),
      icon: <DollarSign className="w-5 h-5" />,
      color: "teal",
      suffix: "DH",
      description: "CA brut estimé"
    },
    {
      label: "Panier moyen",
      value: Math.round(avgOrderValue).toLocaleString(),
      icon: <Zap className="w-5 h-5" />,
      color: "teal",
      suffix: "DH",
      description: "Valeur moyenne par ligne"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec badge fragment */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl relative">
                  <Database className="w-6 h-6 text-teal-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                      Site 1 — Gros volumes
                    </h1>
                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Quantité ≥ 100
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Oracle Site1
                    </Badge>
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

            <Button
              onClick={load}
              disabled={refreshing}
              variant="outline"
              className="gap-2 border-teal-200 hover:bg-teal-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* Statistiques avec progression CA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {stat.label}
                  <div className="p-1 bg-teal-50 rounded-lg text-teal-600">
                    {stat.icon}
                  </div>
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
                      {stat.value}
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
          ))}
        </div>

        {/* Objectif CA avec progression */}
        {!loading && ca > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-teal-50 to-white border-teal-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Objectif chiffre d'affaires annuel</span>
                <span className="text-teal-600 font-bold">
                  {Math.round(revenueProgress)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(revenueProgress, 100)} className="h-2 bg-teal-100" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>0 DH</span>
                <span>{ca.toLocaleString()} DH</span>
                <span>{revenueTarget.toLocaleString()} DH</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire d'insertion */}
        <Card className="mb-8 border-teal-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-teal-500 rounded-full" />
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

        {/* Tableau des données */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Lignes de commande
                  {!loading && data.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {data.length} ligne{data.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <span>Base Oracle Site1 · eshop1@oracle-site1:1522</span>
                  <Badge variant="outline" className="text-xs">
                    Fragment conditionnel
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Database className="w-3 h-3" />
                Synchronisation via trigger SYC_INSERT_LIGNE
                {refreshing && <RefreshCw className="w-3 h-3 animate-spin ml-2" />}
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

        {/* Navigation avec indicateurs */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/global">
              <ArrowLeft className="w-4 h-4" />
              Base Global
            </a>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Trigger actif
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Propagation automatique
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/site2">
              Site 2
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
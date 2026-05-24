"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import SiteTable from "@/src/components/SiteTable";
import InsertForm from "@/src/components/InsertForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, TrendingUp, DollarSign, ArrowLeft, ArrowRight, Database, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const ca = data.reduce((s, r) => s + Number(r.quantite || 0) * Number(r.prixUnitaire || 0), 0);
  const avgOrderValue = data.length > 0 ? ca / data.length : 0;
  const avgQuantity = data.length > 0 ? total / data.length : 0;

  // Seuil pour les petits volumes (max 99 unités)
  const smallVolumeThreshold = 99;
  const smallVolumeCount = data.filter(row => Number(row.quantite || 0) <= smallVolumeThreshold).length;
  const smallVolumePercentage = data.length > 0 ? (smallVolumeCount / data.length) * 100 : 0;

  // Objectif de croissance (exemple: +20% sur le CA)
  const growthTarget = 20;
  const currentGrowth = 15; // Simulation - à remplacer par des données réelles

  const statsCards = [
    {
      label: "Lignes de commande",
      value: data.length,
      icon: <Package className="w-5 h-5" />,
      color: "orange",
      suffix: "",
      description: "Transactions petites quantités"
    },
    {
      label: "Quantité totale",
      value: total.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "orange",
      suffix: "unités",
      description: "Volume total distribué"
    },
    {
      label: "Chiffre d'affaires",
      value: ca.toLocaleString(),
      icon: <DollarSign className="w-5 h-5" />,
      color: "orange",
      suffix: "DH",
      description: "CA brut estimé"
    },
    {
      label: "Panier moyen",
      value: Math.round(avgOrderValue).toLocaleString(),
      icon: <Sparkles className="w-5 h-5" />,
      color: "orange",
      suffix: "DH",
      description: "Valeur moyenne par ligne"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec badge fragment petits volumes */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl relative">
                  <Database className="w-6 h-6 text-orange-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      Site 2 — Petits volumes
                    </h1>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Quantité &lt; 100
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Oracle Site2
                    </Badge>
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

            <Button
              onClick={load}
              disabled={refreshing}
              variant="outline"
              className="gap-2 border-orange-200 hover:bg-orange-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-orange-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {stat.label}
                  <div className="p-1 bg-orange-50 rounded-lg text-orange-600">
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
                    <div className="text-2xl font-bold text-orange-600">
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

        {/* Analyse des petits volumes */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Petits volumes (≤ 99 unités)</span>
                      <span className="font-medium text-orange-600">{Math.round(smallVolumePercentage)}%</span>
                    </div>
                    <Progress value={smallVolumePercentage} className="h-2 bg-orange-100" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {smallVolumeCount} lignes respectent le critère du fragment
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Quantité moyenne par ligne</span>
                      <span className="font-medium text-orange-600">{Math.round(avgQuantity)} unités</span>
                    </div>
                    <Progress value={(avgQuantity / 100) * 100} className="h-2 bg-orange-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Progression CA</span>
                    <Badge variant={currentGrowth >= growthTarget ? "default" : "secondary"} 
                           className={currentGrowth >= growthTarget ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                      +{currentGrowth}% / +{growthTarget}%
                    </Badge>
                  </div>
                  <Progress value={(currentGrowth / growthTarget) * 100} className="h-2 bg-orange-100" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentGrowth >= growthTarget 
                      ? "✓ Objectif de croissance atteint !" 
                      : `Encore ${growthTarget - currentGrowth}% à parcourir pour atteindre l'objectif`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Formulaire d'insertion */}
        <Card className="mb-8 border-orange-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded-full" />
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
                  <span>Base Oracle Site2 · eshop2@oracle-site2:1523</span>
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
              color="coral"
              data={data}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Navigation avec indicateurs */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/site1">
              <ArrowLeft className="w-4 h-4" />
              Site 1 — Gros volumes
            </a>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Trigger actif
              </span>
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50">
              Petits volumes &lt; 100
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a href="/">
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
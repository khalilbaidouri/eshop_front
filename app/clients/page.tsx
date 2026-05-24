"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  RefreshCw,
  Phone,
  MapPin,
  Building,
} from "lucide-react";

type Client = {
  idclient: number;
  codeclient: string;
  societe: string;
  contact: string;
  adresse: string;
  ville: string;
  pays: string;
  codePostal: string;
  telephone: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    codeclient: "",
    societe: "",
    contact: "",
    adresse: "",
    ville: "",
    pays: "",
    codePostal: "",
    telephone: "",
  });

  // GET ALL
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ADD CLIENT
  const addClient = async () => {
    // Validation simple
    if (!form.societe || !form.codeclient) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au moins le code client et la société",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/clients/add", form);

      toast({
        title: "Succès",
        description: "Client ajouté avec succès",
      });

      setForm({
        codeclient: "",
        societe: "",
        contact: "",
        adresse: "",
        ville: "",
        pays: "",
        codePostal: "",
        telephone: "",
      });

      fetchClients();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Gestion Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre portefeuille clients
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClients}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouveau Client
            </CardTitle>
            <CardDescription>
              Remplissez les informations du client à ajouter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code client *</label>
                <Input
                  placeholder="Ex: CLT001"
                  value={form.codeclient}
                  onChange={(e) =>
                    setForm({ ...form, codeclient: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Société *</label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={form.societe}
                  onChange={(e) =>
                    setForm({ ...form, societe: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact</label>
                <Input
                  placeholder="Personne à contacter"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  placeholder="+33 1 23 45 67 89"
                  value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input
                  placeholder="Adresse complète"
                  value={form.adresse}
                  onChange={(e) =>
                    setForm({ ...form, adresse: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code Postal</label>
                <Input
                  placeholder="Code postal"
                  value={form.codePostal}
                  onChange={(e) =>
                    setForm({ ...form, codePostal: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Input
                  placeholder="Ville"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pays</label>
                <Input
                  placeholder="Pays"
                  value={form.pays}
                  onChange={(e) => setForm({ ...form, pays: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={addClient}
                disabled={submitting}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter le client
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des clients */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
            <CardDescription>
              {clients.length} client{clients.length > 1 ? "s" : ""} trouvé
              {clients.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aucun client trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez votre premier client en utilisant le formulaire
                  ci-dessus
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[70px]">ID</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Société</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ville
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Pays
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Téléphone
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.idclient}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            #{client.idclient}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {client.codeclient}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.societe}</div>
                          {client.adresse && (
                            <div className="text-xs text-muted-foreground hidden lg:block">
                              {client.adresse}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{client.contact || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {client.ville || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {client.pays || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.telephone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {client.telephone}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  Building,
  Phone,
  MapPin,
  Users,
  Globe2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
    transition: { duration: 0.3, delay: i * 0.035, ease: "easeOut" },
  }),
};

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (600 / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    codeclient: "", societe: "", contact: "",
    adresse: "", ville: "", pays: "",
    codePostal: "", telephone: "",
  });

  const fetchClients = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch {
      toast.error("Impossible de charger les clients");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const addClient = async () => {
    if (!form.societe || !form.codeclient) {
      toast.error("Code client et société sont requis");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/clients/add", form);
      toast.success("Client ajouté avec succès");
      setForm({
        codeclient: "", societe: "", contact: "",
        adresse: "", ville: "", pays: "",
        codePostal: "", telephone: "",
      });
      fetchClients();
    } catch {
      toast.error("Impossible d'ajouter le client");
    } finally {
      setSubmitting(false);
    }
  };

  const countryCount = new Set(clients.map(c => c.pays).filter(Boolean)).size;
  const cityCount = new Set(clients.map(c => c.ville).filter(Boolean)).size;

  const statsCards = [
    { label: "Total clients", value: clients.length, icon: <Building className="w-5 h-5" />, description: "Clients enregistrés" },
    { label: "Contacts renseignés", value: clients.filter(c => c.contact).length, icon: <Users className="w-5 h-5" />, description: "Avec un contact" },
    { label: "Villes couvertes", value: cityCount, icon: <MapPin className="w-5 h-5" />, description: "Villes distinctes" },
    { label: "Pays", value: countryCount, icon: <Globe2 className="w-5 h-5" />, description: "Couverture géographique" },
  ];

  const formFields = [
    { label: "Code client *", key: "codeclient", placeholder: "CLT001" },
    { label: "Société *", key: "societe", placeholder: "Nom de l'entreprise" },
    { label: "Contact", key: "contact", placeholder: "Personne à contacter" },
    { label: "Téléphone", key: "telephone", placeholder: "+212 6 00 00 00 00" },
    { label: "Adresse", key: "adresse", placeholder: "Adresse complète" },
    { label: "Code Postal", key: "codePostal", placeholder: "20000" },
    { label: "Ville", key: "ville", placeholder: "Casablanca" },
    { label: "Pays", key: "pays", placeholder: "Maroc" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-sky-100 rounded-xl"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <Building className="w-6 h-6 text-sky-600" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                    Clients
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">Oracle Global</Badge>
                    <span className="text-xs text-muted-foreground">localhost:1524 · XEPDB1</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-12">
                Portefeuille clients · gestion centralisée
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={fetchClients}
                disabled={refreshing}
                variant="outline"
                className="gap-2 border-sky-200 hover:bg-sky-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
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
              <Card className="border-sky-100 hover:shadow-lg hover:border-sky-200 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    <motion.div
                      className="p-1 bg-sky-50 rounded-lg text-sky-600"
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
                    <div className="text-2xl font-bold text-sky-600">
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
          <Card className="border-sky-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <motion.div
                  className="w-1 h-6 bg-sky-500 rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Nouveau client
              </CardTitle>
              <CardDescription>Remplissez les informations du client à ajouter</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {formFields.map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{label}</label>
                    <Input
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="border-sky-100 focus:border-sky-400"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={addClient}
                    disabled={submitting}
                    className="gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Ajout...</>
                      : <><Plus className="w-4 h-4" />Ajouter le client</>
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
                    Liste des clients
                    <AnimatePresence mode="wait">
                      {!loading && (
                        <motion.div
                          key={clients.length}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="ml-2">
                            {clients.length} client{clients.length > 1 ? "s" : ""}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardTitle>
                  <CardDescription className="mt-1">Base Oracle Global</CardDescription>
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
              ) : clients.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Building className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">Aucun client</p>
                  <p className="text-sm text-muted-foreground mt-1">Ajoutez votre premier client ci-dessus</p>
                </motion.div>
              ) : (
                <div className="rounded-md border border-sky-50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-sky-50/50">
                        {["ID", "Code", "Société", "Contact", "Ville", "Pays", "Téléphone"].map(h => (
                          <TableHead key={h} className="text-xs font-semibold text-sky-700">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client, i) => (
                        <motion.tr
                          key={client.idclient}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={rowVariant}
                          className="border-b border-sky-50/60 hover:bg-sky-50/30 transition-colors"
                        >
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-sky-700 border-sky-200">
                              #{client.idclient}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {client.codeclient}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{client.societe}</div>
                            {client.adresse && (
                              <div className="text-xs text-muted-foreground hidden lg:block truncate max-w-[180px]">
                                {client.adresse}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {client.contact || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {client.ville ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm">{client.ville}</span>
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {client.pays
                              ? <Badge variant="secondary" className="text-xs">{client.pays}</Badge>
                              : <span className="text-muted-foreground">—</span>
                            }
                          </TableCell>
                          <TableCell>
                            {client.telephone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm font-mono">{client.telephone}</span>
                              </div>
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
          <div className="text-xs text-muted-foreground">Portefeuille clients</div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.96 }}>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/commandes">Commandes <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}
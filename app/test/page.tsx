"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant = "site1" | "site2" | "global" | "insert" | "update" | "delete";
type TabId = "connexion" | "sites-global" | "global-sites" | "recap";

interface CommandBlock {
  label: string;
  code: string;
}

interface TestSection {
  id: string;
  badges: { label: string; variant: BadgeVariant }[];
  commands: CommandBlock[];
  result: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "connexion", label: "Connexions" },
  { id: "sites-global", label: "Sites → Global" },
  { id: "global-sites", label: "Global → Sites" },
  { id: "recap", label: "Récapitulatif" },
];

const CONNECTION_BLOCKS: CommandBlock[] = [
  {
    label: "eshop-site1",
    code: `docker exec -it eshop-site1 sqlplus "eshop1/Eshop123@localhost/XEPDB1"`,
  },
  {
    label: "eshop-site2",
    code: `docker exec -it eshop-site2 sqlplus "eshop2/Eshop123@localhost/XEPDB1"`,
  },
  {
    label: "eshop-global",
    code: `docker exec -it eshop-global sqlplus "eshop/Eshop123@localhost/XEPDB1"`,
  },
  {
    label: "Initialisation (toujours en premier)",
    code: `SET SERVEROUTPUT ON;`,
  },
  {
    label: "ID courant de la séquence",
    code: `SELECT SEQ_LIGNE.CURRVAL FROM DUAL;`,
  },
];

const SITES_TO_GLOBAL: TestSection[] = [
  {
    id: "s1-insert",
    badges: [
      { label: "Site 1", variant: "site1" },
      { label: "INSERT", variant: "insert" },
    ],
    commands: [
      {
        label: "eshop-site1 — exécuter",
        code: `EXEC eshop1.insert_and_sync(1, 1, 150, 100.00, 5);`,
      },
      {
        label: "Vérifier Site1",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes1
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
    ],
    result: "La ligne apparaît sur Site1 ET Global avec les mêmes valeurs.",
  },
  {
    id: "s2-insert",
    badges: [
      { label: "Site 2", variant: "site2" },
      { label: "INSERT", variant: "insert" },
    ],
    commands: [
      {
        label: "eshop-site2 — exécuter",
        code: `EXEC eshop2.insert_and_sync(2, 5, 10, 50.00, 0);`,
      },
      {
        label: "Vérifier Site2",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes2
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
    ],
    result: "La ligne (quantite=10) apparaît sur Site2 ET Global.",
  },
  {
    id: "s1-update",
    badges: [
      { label: "Site 1", variant: "site1" },
      { label: "UPDATE", variant: "update" },
      { label: "ID=187", variant: "site1" },
    ],
    commands: [
      {
        label: "eshop-site1 — voir les lignes disponibles",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes1
ORDER BY idligneCommande DESC
FETCH FIRST 3 ROWS ONLY;`,
      },
      {
        label: "eshop-site1 — modifier ID=187",
        code: `EXEC eshop1.update_and_sync(187, 500, 30);`,
      },
      {
        label: "Vérifier Site1",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes1
WHERE idligneCommande = 187;`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = 187;`,
      },
    ],
    result: "quantite=500, remise=30 sur Site1 et Global.",
  },
  {
    id: "s2-update",
    badges: [
      { label: "Site 2", variant: "site2" },
      { label: "UPDATE", variant: "update" },
      { label: "ID=163", variant: "site2" },
    ],
    commands: [
      {
        label: "eshop-site2 — modifier ID=163",
        code: `EXEC eshop2.update_and_sync(163, 50, 15);`,
      },
      {
        label: "Vérifier Site2",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes2
WHERE idligneCommande = 163;`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = 163;`,
      },
    ],
    result: "quantite=50, remise=15 sur Site2 et Global.",
  },
  {
    id: "s1-delete",
    badges: [
      { label: "Site 1", variant: "site1" },
      { label: "DELETE", variant: "delete" },
      { label: "ID=186", variant: "site1" },
    ],
    commands: [
      {
        label: "eshop-site1 — vérifier avant suppression",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes1
WHERE idligneCommande = 186;`,
      },
      {
        label: "eshop-site1 — supprimer",
        code: `EXEC eshop1.deleteligne(186);`,
      },
      {
        label: "Vérifier Site1 (doit être 0)",
        code: `SELECT COUNT(*) AS doit_etre_0
FROM LigneCommandes1
WHERE idligneCommande = 186;`,
      },
      {
        label: "Vérifier Global (doit être 0)",
        code: `SELECT COUNT(*) AS doit_etre_0
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = 186;`,
      },
    ],
    result: "COUNT=0 sur Site1 ET Global.",
  },
  {
    id: "s2-delete",
    badges: [
      { label: "Site 2", variant: "site2" },
      { label: "DELETE", variant: "delete" },
      { label: "ID=183", variant: "site2" },
    ],
    commands: [
      {
        label: "eshop-site2 — vérifier avant suppression",
        code: `SELECT idligneCommande, quantite, remise
FROM LigneCommandes2
WHERE idligneCommande = 183;`,
      },
      {
        label: "eshop-site2 — supprimer",
        code: `EXEC eshop2.deleteligne(183);`,
      },
      {
        label: "Vérifier Site2 (doit être 0)",
        code: `SELECT COUNT(*) AS doit_etre_0
FROM LigneCommandes2
WHERE idligneCommande = 183;`,
      },
      {
        label: "Vérifier Global (doit être 0)",
        code: `SELECT COUNT(*) AS doit_etre_0
FROM eshop.LigneCommandes@link_global
WHERE idligneCommande = 183;`,
      },
    ],
    result: "COUNT=0 sur Site2 ET Global.",
  },
];

const GLOBAL_TO_SITES: TestSection[] = [
  {
    id: "g-s1-insert",
    badges: [
      { label: "Global", variant: "global" },
      { label: "INSERT", variant: "insert" },
      { label: "→ Site1 (quantite ≥ 100)", variant: "site1" },
    ],
    commands: [
      {
        label: "eshop-global — exécuter",
        code: `EXEC eshop.insert_global(1, 1, 200, 100.00, 5);`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
      {
        label: "Vérifier Site1",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop1.LigneCommandes1@link_site1
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
    ],
    result: "quantite=200, remise=5 — présent sur Global ET Site1 (quantite ≥ 100).",
  },
  {
    id: "g-s2-insert",
    badges: [
      { label: "Global", variant: "global" },
      { label: "INSERT", variant: "insert" },
      { label: "→ Site2 (quantite < 100)", variant: "site2" },
    ],
    commands: [
      {
        label: "eshop-global — exécuter",
        code: `EXEC eshop.insert_global(2, 5, 10, 50.00, 0);`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
      {
        label: "Vérifier Site2",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop2.LigneCommandes2@link_site2
WHERE idligneCommande = SEQ_LIGNE.CURRVAL;`,
      },
    ],
    result: "quantite=10, remise=0 — présent sur Global ET Site2 (quantite < 100).",
  },
  {
    id: "g-s1-update",
    badges: [
      { label: "Global", variant: "global" },
      { label: "UPDATE", variant: "update" },
      { label: "→ Site1 · ID=187", variant: "site1" },
    ],
    commands: [
      {
        label: "eshop-global — modifier ID=187",
        code: `EXEC eshop.update_global(187, 999, 50);`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes
WHERE idligneCommande = 187;`,
      },
      {
        label: "Vérifier Site1",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop1.LigneCommandes1@link_site1
WHERE idligneCommande = 187;`,
      },
    ],
    result: "quantite=999, remise=50 sur Global et Site1.",
  },
  {
    id: "g-s2-update",
    badges: [
      { label: "Global", variant: "global" },
      { label: "UPDATE", variant: "update" },
      { label: "→ Site2 · ID=163", variant: "site2" },
    ],
    commands: [
      {
        label: "eshop-global — modifier ID=163",
        code: `EXEC eshop.update_global(163, 80, 20);`,
      },
      {
        label: "Vérifier Global",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop.LigneCommandes
WHERE idligneCommande = 163;`,
      },
      {
        label: "Vérifier Site2",
        code: `SELECT idligneCommande, quantite, remise
FROM eshop2.LigneCommandes2@link_site2
WHERE idligneCommande = 163;`,
      },
    ],
    result: "quantite=80, remise=20 sur Global et Site2.",
  },
  {
    id: "g-s1-delete",
    badges: [
      { label: "Global", variant: "global" },
      { label: "DELETE", variant: "delete" },
      { label: "→ Site1 · ID=185", variant: "site1" },
    ],
    commands: [
      {
        label: "eshop-global — supprimer ID=185",
        code: `DELETE FROM eshop.LigneCommandes WHERE idligneCommande = 185;\nCOMMIT;`,
      },
      {
        label: "Vérifier Site1 (doit être 0)",
        code: `SELECT COUNT(*) AS doit_etre_0
FROM eshop1.LigneCommandes1@link_site1
WHERE idligneCommande = 185;`,
      },
    ],
    result: "COUNT=0 — Site1 a bien supprimé la ligne.",
  },
];

const RECAP_ROWS = [
  { num: 1, op: "INSERT", op_v: "insert" as BadgeVariant, dir: "Global → Site1", id: "auto", result: "quantite=200, remise=5 sur Site1" },
  { num: 2, op: "INSERT", op_v: "insert" as BadgeVariant, dir: "Global → Site2", id: "auto", result: "quantite=10, remise=0 sur Site2" },
  { num: 3, op: "UPDATE", op_v: "update" as BadgeVariant, dir: "Global → Site1", id: "187", result: "quantite=999, remise=50" },
  { num: 4, op: "UPDATE", op_v: "update" as BadgeVariant, dir: "Global → Site2", id: "163", result: "quantite=80, remise=20" },
  { num: 5, op: "INSERT", op_v: "insert" as BadgeVariant, dir: "Site1 → Global", id: "auto", result: "Présent sur les 2" },
  { num: 6, op: "INSERT", op_v: "insert" as BadgeVariant, dir: "Site2 → Global", id: "auto", result: "Présent sur les 2" },
  { num: 7, op: "UPDATE", op_v: "update" as BadgeVariant, dir: "Site1 → Global", id: "187", result: "quantite=500, remise=30" },
  { num: 8, op: "UPDATE", op_v: "update" as BadgeVariant, dir: "Site2 → Global", id: "163", result: "quantite=50, remise=15" },
  { num: 9, op: "DELETE", op_v: "delete" as BadgeVariant, dir: "Site1 → Global", id: "186", result: "COUNT=0 sur les 2" },
  { num: 10, op: "DELETE", op_v: "delete" as BadgeVariant, dir: "Site2 → Global", id: "183", result: "COUNT=0 sur les 2" },
  { num: 11, op: "DELETE", op_v: "delete" as BadgeVariant, dir: "Global → Site1", id: "185", result: "COUNT=0 sur les 2" },
];

const PROCEDURES = [
  { node: "Site1", node_v: "site1" as BadgeVariant, name: "insert_and_sync", sig: "(idCmd, idProd, qte, prix, remise)" },
  { node: "Site1", node_v: "site1" as BadgeVariant, name: "update_and_sync", sig: "(idLigne, newQte, newRemise)" },
  { node: "Site1", node_v: "site1" as BadgeVariant, name: "deleteligne",     sig: "(idLigne)" },
  { node: "Site2", node_v: "site2" as BadgeVariant, name: "insert_and_sync", sig: "(idCmd, idProd, qte, prix, remise)" },
  { node: "Site2", node_v: "site2" as BadgeVariant, name: "update_and_sync", sig: "(idLigne, newQte, newRemise)" },
  { node: "Site2", node_v: "site2" as BadgeVariant, name: "deleteligne",     sig: "(idLigne)" },
  { node: "Global", node_v: "global" as BadgeVariant, name: "insert_global", sig: "(idCmd, idProd, qte, prix, remise)" },
  { node: "Global", node_v: "global" as BadgeVariant, name: "update_global", sig: "(idLigne, newQte, newRemise)" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const badgeStyles: Record<BadgeVariant, string> = {
  site1:  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  site2:  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  global: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  insert: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  update: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${badgeStyles[variant]}`}>
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-all duration-150 cursor-pointer
        ${copied
          ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
      aria-label="Copier la commande"
    >
      {copied ? (
        <>
          <CheckIcon />
          Copié
        </>
      ) : (
        <>
          <CopyIcon />
          Copier
        </>
      )}
    </button>
  );
}

function CommandBlock({ label, code }: CommandBlock) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="px-4 py-3 text-sm font-mono leading-relaxed bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
        <SqlHighlight code={code} />
      </pre>
    </div>
  );
}

function ResultBar({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 mb-6">
      <span className="mt-0.5 shrink-0">✅</span>
      <span>{text}</span>
    </div>
  );
}

function SectionHeader({ badges }: { badges: { label: string; variant: BadgeVariant }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3 mt-6">
      {badges.map((b, i) => (
        <Badge key={i} label={b.label} variant={b.variant} />
      ))}
    </div>
  );
}

// ─── SQL syntax highlighter (simple, no deps) ────────────────────────────────

const SQL_KEYWORDS = /\b(SELECT|FROM|WHERE|ORDER|BY|DESC|FETCH|FIRST|ROWS|ONLY|EXEC|SET|ON|DELETE|COMMIT|COUNT|AS|AND|INSERT|INTO|VALUES|UPDATE|SET)\b/g;
const SQL_COMMENTS = /(--[^\n]*)/g;

function SqlHighlight({ code }: { code: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = code;
  let key = 0;

  // Tokenise naively: comments first, then keywords
  const tokenise = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const commentSplit = text.split(SQL_COMMENTS);
    for (const part of commentSplit) {
      if (part.match(/^--/)) {
        result.push(<span key={key++} className="text-gray-400 dark:text-gray-500 italic">{part}</span>);
      } else {
        const kwSplit = part.split(SQL_KEYWORDS);
        for (const seg of kwSplit) {
          if (seg.match(SQL_KEYWORDS)) {
            result.push(<span key={key++} className="text-sky-600 dark:text-sky-400 font-semibold">{seg}</span>);
          } else if (seg.includes("@")) {
            result.push(<span key={key++} className="text-amber-600 dark:text-amber-400">{seg}</span>);
          } else if (seg.match(/eshop[12]?\.[a-zA-Z_]+/)) {
            result.push(<span key={key++} className="text-emerald-600 dark:text-emerald-400">{seg}</span>);
          } else {
            result.push(<span key={key++}>{seg}</span>);
          }
        }
      }
    }
    return result;
  };

  return <>{tokenise(remaining)}</>;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Tab content ─────────────────────────────────────────────────────────────

function ConnexionTab() {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Connectez-vous à chaque nœud via Docker avant d&apos;exécuter les commandes SQL.
      </p>
      {CONNECTION_BLOCKS.map((block, i) => (
        <CommandBlock key={i} label={block.label} code={block.code} />
      ))}
    </div>
  );
}

function TestSections({ sections }: { sections: TestSection[] }) {
  return (
    <div>
      {sections.map((section) => (
        <div key={section.id}>
          <SectionHeader badges={section.badges} />
          {section.commands.map((cmd, i) => (
            <CommandBlock key={i} label={cmd.label} code={cmd.code} />
          ))}
          <ResultBar text={section.result} />
        </div>
      ))}
    </div>
  );
}

function RecapTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">11 tests — vue d&apos;ensemble</h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 w-8">#</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Opération</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Direction</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Résultat attendu</th>
              </tr>
            </thead>
            <tbody>
              {RECAP_ROWS.map((row, i) => (
                <tr
                  key={row.num}
                  className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-900/30"}`}
                >
                  <td className="px-3 py-2 text-gray-400 dark:text-gray-600 font-mono text-xs">{row.num}</td>
                  <td className="px-3 py-2"><Badge label={row.op} variant={row.op_v} /></td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300 text-xs">{row.dir}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">{row.id}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300 text-xs">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Signatures des procédures</h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Nœud</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Procédure</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Signature</th>
              </tr>
            </thead>
            <tbody>
              {PROCEDURES.map((proc, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-900/30"}`}
                >
                  <td className="px-3 py-2"><Badge label={proc.node} variant={proc.node_v} /></td>
                  <td className="px-3 py-2 font-mono text-xs text-sky-600 dark:text-sky-400">{proc.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">{proc.sig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommandesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("connexion");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
              Oracle XE
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">3 nœuds Docker</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            eShop — Synchronisation distribuée
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Commandes de test INSERT / UPDATE / DELETE · Site1, Site2 et Global
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-150 cursor-pointer
                ${activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "connexion"    && <ConnexionTab />}
          {activeTab === "sites-global" && <TestSections sections={SITES_TO_GLOBAL} />}
          {activeTab === "global-sites" && <TestSections sections={GLOBAL_TO_SITES} />}
          {activeTab === "recap"        && <RecapTab />}
        </div>
      </div>
    </div>
  );
}
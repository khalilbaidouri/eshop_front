// src/components/layout/Footer.tsx
"use client";

import { Heart, GitFork, Database, Globe, Server, LayoutDashboard } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type FooterLink = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links: Record<string, FooterLink[]> = {
    "Navigation": [
      { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-3 h-3" /> },
      { href: "/global", label: "Site Global", icon: <Globe className="w-3 h-3" /> },
      { href: "/site1", label: "Site 1", icon: <Server className="w-3 h-3" /> },
      { href: "/site2", label: "Site 2", icon: <Database className="w-3 h-3" /> },
    ],
    "Technologies": [
      { label: "Next.js 14" },
      { label: "Tailwind CSS" },
      { label: "shadcn/ui" },
      { label: "Oracle Database" },
    ],
    "Liens": [
      { href: "#", label: "Documentation" },
      { href: "#", label: "API Reference" },
      { href: "#", label: "Statut" },
      { href: "#", label: "Support" },
    ],
  };

  return (
    <footer className="border-t bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/30">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <Database className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Eshop Multibase
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Système distribué Oracle avec fragmentation horizontale et synchronisation automatique.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>by Admin Dashboard</span>
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="space-y-3">
              <h3 className="font-semibold text-sm">{title}</h3>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={idx}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Eshop Multibase. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Oracle Database 19c</span>
            <span>•</span>
            <span>Fragmentation horizontale</span>
            <span>•</span>
            <span>Triggers de synchronisation</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <GitFork className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
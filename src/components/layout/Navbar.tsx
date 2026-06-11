"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe, Server, Database, LayoutDashboard,
  Menu, X, RefreshCw, Wifi, WifiOff,
  Package, Users, BarChart3, List,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",       label: "Dashboard", Icon: LayoutDashboard, color: "violet" },
  { href: "/global", label: "Global",    Icon: Globe,           color: "violet" },
  { href: "/site1",  label: "Site 1",    Icon: Server,          color: "teal"   },
  { href: "/site2",  label: "Site 2",    Icon: Database,        color: "orange" },
  { href: "/lignes", label: "Lignes",    Icon: List,            color: "gray"   },
  { href: "/clients",label: "Clients",   Icon: Users,           color: "blue"   },
  { href: "/produits",label: "Produits", Icon: Package,         color: "emerald"},
  { href: "/stats",  label: "Stats CA",  Icon: BarChart3,       color: "gray"   },
];

const activeColor: Record<string, string> = {
  violet:  "text-violet-700 bg-violet-50 border-violet-300",
  teal:    "text-teal-700   bg-teal-50   border-teal-300",
  orange:  "text-orange-700 bg-orange-50 border-orange-300",
  blue:    "text-blue-700   bg-blue-50   border-blue-300",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-300",
  gray:    "text-gray-700   bg-gray-100  border-gray-300",
};

const hoverColor: Record<string, string> = {
  violet:  "hover:text-violet-700 hover:bg-violet-50 hover:border-violet-200",
  teal:    "hover:text-teal-700   hover:bg-teal-50   hover:border-teal-200",
  orange:  "hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200",
  blue:    "hover:text-blue-700   hover:bg-blue-50   hover:border-blue-200",
  emerald: "hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200",
  gray:    "hover:text-gray-900   hover:bg-gray-50",
};

export default function Navbar() {
  const pathname          = usePathname();
  const [open,  setOpen]  = useState(false);
  const [online,setOnline]= useState(true);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center shadow-md shadow-violet-200">
                <Network className="w-4 h-4 text-white" />
              </div>
              {online && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-none bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                Eshop Multibase
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Oracle Distributed System</p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150",
                    active
                      ? activeColor[item.color]
                      : cn("text-muted-foreground border-transparent", hoverColor[item.color])
                  )}
                >
                  <item.Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border",
              online
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}>
              {online
                ? <Wifi className="w-3 h-3" />
                : <WifiOff className="w-3 h-3" />}
              <span>{online ? "Connecté" : "Hors ligne"}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted/50 border rounded-md px-2 py-1">
              Oracle Global
            </div>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              AD
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-1.5 rounded-lg border hover:bg-muted transition-colors"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div className="md:hidden border-t py-3 space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all border",
                    active
                      ? activeColor[item.color]
                      : cn("text-muted-foreground border-transparent hover:bg-muted/50")
                  )}
                >
                  <item.Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-3 px-3 border-t mt-2 flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border",
                online
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              )}>
                {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {online ? "Connecté" : "Hors ligne"}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 border rounded px-2 py-1">
                :1524
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
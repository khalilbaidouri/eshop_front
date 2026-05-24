// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Globe, 
  Server, 
  Database, 
  LayoutDashboard, 
  Menu, 
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronDown,
  Package,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Vérifier l'état de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: "purple"
    },
    { 
      href: "/global", 
      label: "Site Global", 
      icon: <Globe className="w-4 h-4" />,
      color: "purple",
      description: "Base centralisée"
    },
    { 
      href: "/site1", 
      label: "Site 1", 
      icon: <Server className="w-4 h-4" />,
      color: "teal",
      description: "Gros volumes (≥100)"
    },
    { 
      href: "/site2", 
      label: "Site 2", 
      icon: <Database className="w-4 h-4" />,
      color: "orange",
      description: "Petits volumes (<100)"
    },
    { 
    href: "/clients", 
    label: "Clients", 
    icon: <Users className="w-4 h-4" />,
    color: "blue",
    description: "Gestion des clients"
  },
  { 
    href: "/produits", 
    label: "Produits", 
    icon: <Package className="w-4 h-4" />,
    color: "emerald",
    description: "Catalogue produits"
  },
  ];

  const getActiveColor = (href: string, color: string) => {
    if (pathname === href) {
      switch(color) {
        case "purple": return "text-purple-600 bg-purple-50 border-purple-200";
        case "teal": return "text-teal-600 bg-teal-50 border-teal-200";
        case "orange": return "text-orange-600 bg-orange-50 border-orange-200";
        default: return "text-gray-600 bg-gray-50";
      }
    }
    return "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                {isOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  Eshop Multibase
                </h1>
                <p className="text-xs text-muted-foreground">
                  Oracle Distributed System
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${getActiveColor(item.href, item.color)}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Connecté' : 'Hors ligne'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Oracle Global
              </Badge>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin Dashboard</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      oracle@eshop.local
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Rafraîchir tout</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>À propos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${getActiveColor(item.href, item.color)}`}
              >
                {item.icon}
                <div className="flex-1">
                  <p>{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Link>
            ))}
            <div className="pt-4 px-3 flex flex-col gap-2">
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs w-fit ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Connecté' : 'Hors ligne'}</span>
              </div>
              <Badge variant="outline" className="w-fit">
                Oracle Global:1524
              </Badge>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
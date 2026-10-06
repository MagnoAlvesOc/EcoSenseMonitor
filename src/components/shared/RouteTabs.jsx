import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Barra de abas baseada em rotas (substitui <TabsList>/<TabsTrigger>).
 * Cada aba é um Link para `${base}/${value}`; a aba ativa é resolvida pela
 * URL atual — a rota-raiz `base` marca a primeira aba como ativa.
 */
export default function RouteTabs({ base, tabs, className = "" }) {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "inline-flex h-9 w-full max-w-full items-center justify-start gap-1 rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto touch-pan-x",
        className
      )}
    >
      {tabs.map((tab, idx) => {
        const target = `${base}/${tab.value}`;
        const active = pathname === target || (idx === 0 && pathname === base);
        return (
          <Link
            key={tab.value}
            to={target}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
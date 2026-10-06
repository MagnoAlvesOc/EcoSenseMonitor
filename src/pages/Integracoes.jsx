import React from "react";
import { Outlet } from "react-router-dom";
import RouteTabs from "@/components/shared/RouteTabs";
import { Globe, BarChart3, Code2, Zap } from "lucide-react";

const TABS = [
  { value: "temporeal", label: "Tempo Real", icon: Zap },
  { value: "fontes", label: "Fontes Externas", icon: Globe },
  { value: "comparacao", label: "Comparação", icon: BarChart3 },
  { value: "export", label: "API de Exportação", icon: Code2 },
];

export default function Integracoes() {
  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Integrações e Exportação</h1>
        <p className="text-xs text-muted-foreground">Importe dados de fontes externas, compare com suas estações e exporte via API JSON</p>
      </div>

      <RouteTabs
        base="/integracoes"
        tabs={TABS}
        className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg md:w-auto md:justify-center"
      />

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
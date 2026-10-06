import React from "react";
import { Outlet } from "react-router-dom";
import { FileText, BarChart3, GitCompareArrows } from "lucide-react";
import RouteTabs from "@/components/shared/RouteTabs";

const TABS = [
  { value: "relatorios", label: "Relatórios", icon: FileText },
  { value: "estatistica", label: "Estatística", icon: BarChart3 },
  { value: "comparacao", label: "Comparação", icon: GitCompareArrows },
];

export default function Analises() {
  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      {/* Cabeçalho e abas num único quadro — mesma largura dos quadros abaixo */}
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Análises</h1>
        <p className="text-xs text-muted-foreground">Relatórios, estatísticas históricas e comparação entre estações</p>
        <RouteTabs base="/analises" tabs={TABS} className="mt-3" />
      </div>

      <Outlet />
    </div>
  );
}
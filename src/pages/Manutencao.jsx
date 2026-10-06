import React from "react";
import { Outlet } from "react-router-dom";
import RouteTabs from "@/components/shared/RouteTabs";
import { DollarSign, Wrench, FileDown } from "lucide-react";

const TABS = [
  { value: "custos", label: "Custos", icon: DollarSign },
  { value: "preventiva", label: "Manutenção Preventiva", icon: Wrench },
  { value: "relatorio", label: "Relatório PDF", icon: FileDown },
];

export default function Manutencao() {
  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Gestão de Manutenção</h1>
        <p className="text-xs text-muted-foreground">Custos, histórico preventivo e relatórios PDF por estação</p>
      </div>

      <RouteTabs
        base="/manutencao"
        tabs={TABS}
        className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg md:w-auto md:justify-center"
      />

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustosTab from "../components/manutencao/CustosTab";
import ManutencaoTab from "../components/manutencao/ManutencaoTab";
import RelatorioTab from "../components/manutencao/RelatorioTab";
import { DollarSign, Wrench, FileDown } from "lucide-react";

export default function Manutencao() {
  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Gestão de Manutenção</h1>
        <p className="text-xs text-muted-foreground">Custos, histórico preventivo e relatórios PDF por estação</p>
      </div>

      <Tabs defaultValue="custos">
        <TabsList className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg">
          <TabsTrigger value="custos" className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Custos
          </TabsTrigger>
          <TabsTrigger value="preventiva" className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Manutenção Preventiva
          </TabsTrigger>
          <TabsTrigger value="relatorio" className="flex items-center gap-1.5">
            <FileDown className="w-3.5 h-3.5" /> Relatório PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custos" className="mt-4">
          <CustosTab />
        </TabsContent>
        <TabsContent value="preventiva" className="mt-4">
          <ManutencaoTab />
        </TabsContent>
        <TabsContent value="relatorio" className="mt-4">
          <RelatorioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
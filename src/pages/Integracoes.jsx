import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FontesExternasTab from "../components/integracoes/FontesExternasTab";
import ComparacaoTab from "../components/integracoes/ComparacaoTab";
import ExportApiTab from "../components/integracoes/ExportApiTab";
import TempoRealTab from "../components/integracoes/TempoRealTab";
import { Globe, BarChart3, Code2, Zap } from "lucide-react";

export default function Integracoes() {
  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Integrações e Exportação</h1>
        <p className="text-xs text-muted-foreground">Importe dados de fontes externas, compare com suas estações e exporte via API JSON</p>
      </div>

      <Tabs defaultValue="temporeal">
        <TabsList className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg">
          <TabsTrigger value="temporeal" className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Tempo Real
          </TabsTrigger>
          <TabsTrigger value="fontes" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Fontes Externas
          </TabsTrigger>
          <TabsTrigger value="comparacao" className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Comparação
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" /> API de Exportação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temporeal" className="mt-4">
          <TempoRealTab />
        </TabsContent>
        <TabsContent value="fontes" className="mt-4">
          <FontesExternasTab />
        </TabsContent>
        <TabsContent value="comparacao" className="mt-4">
          <ComparacaoTab />
        </TabsContent>
        <TabsContent value="export" className="mt-4">
          <ExportApiTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
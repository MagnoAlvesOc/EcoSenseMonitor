import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, GitCompareArrows } from "lucide-react";
import Relatorios from "./Relatorios";
import AnaliseEstatistica from "./AnaliseEstatistica";
import ComparacaoEstacoes from "./ComparacaoEstacoes";

export default function Analises() {
  return (
    <Tabs defaultValue="relatorios" className="space-y-4 max-w-5xl pointer-events-auto">
      {/* Cabeçalho e abas num único quadro — mesma largura dos quadros abaixo */}
      <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
        <h1 className="text-xl font-bold">Análises</h1>
        <p className="text-xs text-muted-foreground">Relatórios, estatísticas históricas e comparação entre estações</p>
        <TabsList className="mt-3 w-full max-w-full justify-start overflow-x-auto touch-pan-x bg-muted p-1">
          <TabsTrigger value="relatorios" className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <FileText className="w-3.5 h-3.5" /> Relatórios
          </TabsTrigger>
          <TabsTrigger value="estatistica" className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <BarChart3 className="w-3.5 h-3.5" /> Estatística
          </TabsTrigger>
          <TabsTrigger value="comparacao" className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <GitCompareArrows className="w-3.5 h-3.5" /> Comparação
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="relatorios" className="mt-0">
        <Relatorios />
      </TabsContent>
      <TabsContent value="estatistica" className="mt-0">
        <AnaliseEstatistica />
      </TabsContent>
      <TabsContent value="comparacao" className="mt-0">
        <ComparacaoEstacoes />
      </TabsContent>
    </Tabs>
  );
}
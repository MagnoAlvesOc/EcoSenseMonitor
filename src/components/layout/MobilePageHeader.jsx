import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TITLES = {
  "/sobre": "Sobre",
  "/contato": "Contato",
  "/mapa": "Mapa das Estações",
  "/analises": "Análises",
  "/logs": "Logs do Sistema",
  "/configuracoes": "Configurações",
  "/manutencao": "Manutenção",
  "/integracoes": "Integrações",
  "/relatorio-pdf": "Relatório PDF",
  "/RelatorioPDF": "Relatório PDF",
};

// Cabeçalho slim fixo — apenas no celular (oculto no desktop)
// Não aparece no Dashboard, que já possui sua própria barra de status superior.
export default function MobilePageHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") return null;

  const title = TITLES[location.pathname] ?? "EcoSense Monitor";

  return (
    <header className="fixed inset-x-0 top-0 z-50 md:hidden">
      <div className="flex items-center gap-1 px-2 pt-[calc(0.5rem_+_env(safe-area-inset-top))] pb-2 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{title}</span>
      </div>
    </header>
  );
}
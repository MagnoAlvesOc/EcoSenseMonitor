import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EcoSenseLogo from "@/components/shared/EcoSenseLogo";
import MobilePageHeader from "@/components/layout/MobilePageHeader";
import LegalFooter from "./LegalFooter";

// Estrutura compartilhada pelas páginas legais (Termos, Privacidade, Cookies):
// cabeçalho mobile, botão de voltar, logo, título e rodapé jurídico.
export default function LegalPage({ title, updatedAt = "05/10/2026", children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MobilePageHeader />
      <div className="flex-1 mx-auto w-full max-w-2xl px-4 pt-[calc(4.5rem_+_env(safe-area-inset-top))] pb-10 md:pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <EcoSenseLogo className="w-10 h-10" />
          <span className="font-bold text-lg">EcoSense Monitor</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-6">Versão dos documentos: {updatedAt}</p>

        <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
      </div>
      <LegalFooter />
    </div>
  );
}

// Bloco de título de seção reutilizável nas páginas legais
export function Section({ children }) {
  return <p className="text-foreground font-semibold pt-2">{children}</p>;
}
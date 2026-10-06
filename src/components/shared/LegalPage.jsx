import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import EcoSenseLogo from "@/components/shared/EcoSenseLogo";
import MobilePageHeader from "@/components/layout/MobilePageHeader";
import LegalFooter from "./LegalFooter";

// Estrutura compartilhada pelas páginas legais (Termos, Privacidade, Cookies, Avisos):
// cabeçalho mobile, botão de voltar, logo, título, link do documento oficial e rodapé jurídico.
export default function LegalPage({ title, updatedAt = "05/10/2026", docUrl, docLabel, children }) {
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
        <p className="text-xs text-muted-foreground mb-2">Versão dos documentos: {updatedAt}</p>

        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
          >
            <Download className="w-4 h-4" /> {docLabel || "Baixar documento oficial (.docx)"}
          </a>
        )}
        {!docUrl && <div className="mb-6" />}

        <div className="space-y-4 text-muted-foreground leading-relaxed text-justify hyphens-auto">{children}</div>
      </div>
      <LegalFooter />
    </div>
  );
}

// Bloco de título de seção reutilizável nas páginas legais
export function Section({ children }) {
  return <p className="text-foreground font-semibold pt-2">{children}</p>;
}

// Bloco "Base normativa e referências" comum aos documentos jurídicos
export function BaseNormativa({ itens, extra }) {
  return (
    <div className="rounded-lg border border-border/50 p-4 text-sm">
      <p className="text-foreground font-semibold mb-2">Base normativa e referências</p>
      <ul className="list-disc pl-5 space-y-1">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
        {extra}
      </ul>
      <p className="text-xs mt-3">
        Nota: este documento foi redigido para o cenário informado em outubro de 2026 e deve ser revisto
        sempre que houver alteração relevante de funcionalidades, fornecedores, categorias de dados,
        público-alvo, finalidade de pesquisa ou marco regulatório.
      </p>
    </div>
  );
}

export const BASE_NORMATIVA_COMPLETA = [
  "Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD).",
  "Lei nº 12.965/2014 - Marco Civil da Internet, naquilo que for aplicável.",
  "Resolução CD/ANPD nº 2/2022 - aplicação da LGPD a agentes de tratamento de pequeno porte.",
  "Resolução CD/ANPD nº 15/2024 - Regulamento de Comunicação de Incidente de Segurança.",
  "Resolução CD/ANPD nº 18/2024 - atuação do encarregado pelo tratamento de dados pessoais.",
  "Resolução CD/ANPD nº 19/2024 - Regulamento de Transferência Internacional de Dados.",
  "Guia Orientativo da ANPD sobre Cookies e Proteção de Dados Pessoais.",
  "Guia Orientativo da ANPD sobre Tratamento de Dados Pessoais para Fins Acadêmicos e para a Realização de Estudos e Pesquisas.",
  "Guia Orientativo da ANPD sobre Segurança da Informação para Agentes de Tratamento de Pequeno Porte.",
];
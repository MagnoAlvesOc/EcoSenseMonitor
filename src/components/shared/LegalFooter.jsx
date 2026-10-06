import React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { to: "/termos", label: "Termos de Uso" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/cookies", label: "Cookies" },
  { to: "/aviso-login-google", label: "Login com Google" },
  { to: "/aviso-transferencia-internacional", label: "Transferência Internacional" },
  { to: "/aviso-dados-ambientais", label: "Dados Ambientais" },
  { to: "/plano-incidentes", label: "Plano de Incidentes" },
  { to: "/ropa", label: "ROPA" },
  { to: "/matriz-riscos", label: "Matriz de Riscos" },
  { to: "/contato", label: "Contato" },
];

// Rodapé jurídico do EcoSense Monitor — exibido ao final do conteúdo
// de todas as páginas (app e páginas públicas). "pointer-events-auto"
// garante os links funcionais mesmo sobre o mapa de fundo do Dashboard.
export default function LegalFooter({ className = "" }) {
  return (
    <footer
      className={`pointer-events-auto bg-background/80 backdrop-blur-md border-t border-border/50 px-4 py-4 ${className}`}
    >
      <p className="mx-auto max-w-3xl flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">EcoSense Monitor © 2026</span>
        {LINKS.map((l) => (
          <React.Fragment key={l.to}>
            <span aria-hidden="true">·</span>
            <Link to={l.to} className="hover:text-foreground hover:underline whitespace-nowrap">
              {l.label}
            </Link>
          </React.Fragment>
        ))}
        <span aria-hidden="true">·</span>
        <span className="whitespace-nowrap">Versão dos documentos: 05/10/2026</span>
      </p>
    </footer>
  );
}
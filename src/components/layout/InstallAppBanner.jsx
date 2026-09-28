import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import EcoSenseLogo from "@/components/shared/EcoSenseLogo";

const DISMISSED_KEY = "install_banner_dismissed";

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.innerWidth >= 768) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;
    setVisible(true);
  }, []);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-x-2 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 md:hidden">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 flex items-start gap-3">
        <EcoSenseLogo className="w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instale o app na tela inicial</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isIOS
              ? "No Safari, toque no ícone de Compartilhar e depois em “Adicionar à Tela de Início”."
              : "No Chrome, toque no menu ⋮ e escolha “Adicionar à tela inicial”."}
          </p>
        </div>
        <button
          onClick={close}
          aria-label="Fechar aviso"
          className="p-2 -m-1 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
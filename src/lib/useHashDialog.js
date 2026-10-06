import { useCallback, useEffect, useState } from "react";

/**
 * Sincroniza a abertura de um diálogo/modal com o hash da URL (ex.: #dialog-edit).
 * O hash entra na pilha de histórico, então o botão "voltar" do Android fecha
 * o overlay via popstate em vez de navegar para outra página.
 *
 * Uso: const [open, openDialog, closeDialog] = useHashDialog("dialog-edit");
 */
export default function useHashDialog(hashName) {
  const clean = hashName.replace(/^#/, "");
  const [open, setOpen] = useState(() => window.location.hash === `#${clean}`);

  // popstate/hashchange: o botão voltar limpa o hash e fecha o overlay
  useEffect(() => {
    const sync = () => setOpen(window.location.hash === `#${clean}`);
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [clean]);

  // Limpa hash residual ao desmontar (sem adicionar entrada no histórico)
  useEffect(() => {
    return () => {
      if (window.location.hash === `#${clean}`) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
  }, [clean]);

  const openDialog = useCallback(() => {
    // Atribuir location.hash empurra uma nova entrada no histórico
    window.location.hash = clean;
    setOpen(true);
  }, [clean]);

  const closeDialog = useCallback(() => {
    if (window.location.hash === `#${clean}`) {
      // Volta na pilha: popstate → hashchange → overlay fecha
      window.history.back();
    } else {
      setOpen(false);
    }
  }, [clean]);

  return [open, openDialog, closeDialog];
}
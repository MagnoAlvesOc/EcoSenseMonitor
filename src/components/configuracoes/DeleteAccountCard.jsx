import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserX, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DeleteAccountCard() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("deleteAccount", {});
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Conta excluída", description: "Sua conta foi removida permanentemente." });
      base44.auth.logout();
    },
    onError: (e) => {
      toast({ title: "Não foi possível excluir a conta", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="bg-destructive/5 backdrop-blur-xl rounded-2xl border border-destructive/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <UserX className="w-4 h-4 text-destructive" />
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Excluir Conta</p>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Remove permanentemente sua conta de usuário do aplicativo. Esta ação não pode ser desfeita.
      </p>
      <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirmText(""); }}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <UserX className="w-4 h-4 mr-1" /> Excluir minha conta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os seus dados de acesso serão removidos e você será desconectado.
              Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder='Digite "EXCLUIR"' />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={confirmText !== "EXCLUIR" || deleteMutation.isPending}
              onClick={(e) => { e.preventDefault(); deleteMutation.mutate(); }}
            >
              {deleteMutation.isPending ? (<><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Excluindo...</>) : "Excluir conta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
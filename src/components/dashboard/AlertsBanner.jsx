import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";

const severityStyles = {
  critico: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  aviso: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
};

export default function AlertsBanner() {
  const queryClient = useQueryClient();
  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-unread"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }, "-created_date", 5),
    refetchInterval: 30000,
  });

  const dismiss = useMutation({
    mutationFn: (id) => base44.entities.Alertas.update(id, { lido: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alertas-unread"] }),
  });

  if (alertas.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertas.map(a => (
        <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${severityStyles[a.severidade] || severityStyles.info}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{a.mensagem}</p>
              <p className="text-xs opacity-70">{moment(a.created_date).fromNow()} • {a.estacao_nome || "Estação"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismiss.mutate(a.id)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
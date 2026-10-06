import React, { useState } from "react";
import { AlertTriangle, X, Flame, Droplets, Wind, Moon, Zap, BellRing, ChevronDown, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";

const TIPO_ICON = {
  temperatura_alta: Flame,
  temperatura_baixa: Flame,
  umidade_alta: Droplets,
  umidade_baixa: Droplets,
  co2_alto: Wind,
  bateria_baixa: AlertTriangle,
  estacao_offline: AlertTriangle,
  deep_sleep: Moon,
  wake_up: Zap,
};

const SEV_CHIP = {
  critico: "bg-red-500/15 text-red-700 dark:text-red-300",
  aviso: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
};

const SEV_ORDER = ["critico", "aviso", "info"];

// Log consolidado de alertas: um único cartão fixo no painel agrupa todos
// os alertas não lidos (destaque para o dia atual), com contagem por
// severidade, lista detalhável e ação única de "marcar todos como lidos" —
// em vez de uma notificação individual por alerta.
export default function DailyAlertsDigest({ alertas, onDismissAll }) {
  const [expandido, setExpandido] = useState(false);

  if (!alertas.length) return null;

  const contagens = { critico: 0, aviso: 0, info: 0 };
  alertas.forEach((a) => {
    contagens[a.severidade] = (contagens[a.severidade] || 0) + 1;
  });
  const maxSev = SEV_ORDER.find((s) => contagens[s] > 0) || "info";
  const hoje = alertas.filter((a) => moment(a.created_date).isSame(moment(), "day"));

  const borda = {
    critico: "border-red-500/40",
    aviso: "border-amber-500/40",
    info: "border-blue-500/40",
  }[maxSev];

  // Agrupa a lista detalhada por dia (Hoje, Ontem, data completa)
  const porDia = [];
  alertas.forEach((a) => {
    const dia = moment(a.created_date).format("YYYY-MM-DD");
    let grupo = porDia.find((g) => g.dia === dia);
    if (!grupo) {
      grupo = { dia, label: moment(a.created_date).calendar(null, { sameDay: "Hoje", lastDay: "Ontem", sameElse: "DD/MM/YYYY" }), itens: [] };
      porDia.push(grupo);
    }
    grupo.itens.push(a);
  });

  return (
    <div className={`rounded-xl border ${borda} bg-card text-card-foreground shadow-lg animate-in slide-in-from-right-4 duration-300`}>
      <button
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex items-center gap-3 p-3 text-left"
        aria-expanded={expandido}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${SEV_CHIP[maxSev]}`}>
          <BellRing className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Log consolidado de alertas</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {SEV_ORDER.filter((s) => contagens[s] > 0).map((s) => (
              <Badge key={s} className={`text-[10px] px-1.5 py-0 ${SEV_CHIP[s]}`}>
                {contagens[s]} {s === "critico" ? "críticos" : s === "aviso" ? "avisos" : "info"}
              </Badge>
            ))}
            <span className="text-[10px] text-muted-foreground">{hoje.length} hoje</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${expandido ? "rotate-180" : ""}`} />
      </button>

      {expandido && (
        <div className="px-3 pb-2 max-h-[50vh] overflow-y-auto space-y-3">
          {porDia.map((g) => (
            <div key={g.dia}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {g.label} · {g.itens.length}
              </p>
              <div className="space-y-1.5">
                {g.itens.map((a) => {
                  const Icon = TIPO_ICON[a.tipo] || AlertTriangle;
                  return (
                    <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-tight">{a.mensagem}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {a.estacao_nome || "Sistema"} · {moment(a.created_date).format("HH:mm")}
                        </p>
                      </div>
                      <Badge className={`text-[9px] px-1 py-0 flex-shrink-0 ${SEV_CHIP[a.severidade] || SEV_CHIP.info}`}>
                        {a.severidade}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-2 border-t border-border/50 flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onDismissAll(alertas.map((a) => a.id))}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" /> Marcar todos como lidos
        </Button>
      </div>
    </div>
  );
}
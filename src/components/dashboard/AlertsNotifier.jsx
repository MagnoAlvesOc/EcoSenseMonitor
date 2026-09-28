import React, { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Flame, Droplets, Wind } from "lucide-react";
import moment from "moment";

const SEVERITY_STYLE = {
  critico: "bg-red-500/95 text-white border-red-600",
  aviso:   "bg-amber-500/95 text-white border-amber-600",
  info:    "bg-blue-500/95 text-white border-blue-600",
};

const TIPO_ICON = {
  temperatura_alta: Flame,
  temperatura_baixa: Flame,
  umidade_alta: Droplets,
  umidade_baixa: Droplets,
  co2_alto: Wind,
  bateria_baixa: AlertTriangle,
  estacao_offline: AlertTriangle,
};

function AlertCard({ alerta, onDismiss }) {
  const Icon = TIPO_ICON[alerta.tipo] || AlertTriangle;
  const style = SEVERITY_STYLE[alerta.severidade] || SEVERITY_STYLE.aviso;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border shadow-lg ${style} animate-in slide-in-from-right-4 duration-300`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight">{alerta.estacao_nome || "Sistema"}</p>
        <p className="text-xs opacity-90 leading-tight mt-0.5">{alerta.mensagem}</p>
        <p className="text-[10px] opacity-70 mt-1">{moment(alerta.created_date).fromNow()}</p>
      </div>
      <button onClick={() => onDismiss(alerta.id)} className="opacity-80 hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function AlertsNotifier() {
  const queryClient = useQueryClient();
  const seenIds = useRef(new Set());

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-notifier"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 20000,
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["alert-config"],
    queryFn: () => base44.entities.AlertConfig.list(),
  });

  const { data: leituras = [] } = useQuery({
    queryKey: ["leituras-notifier"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 20),
    refetchInterval: 5000,
  });

  const { data: estacoes = [] } = useQuery({
    queryKey: ["estacoes-notifier"],
    queryFn: () => base44.entities.Estacoes.list(),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Alertas.update(id, { lido: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas-notifier"] });
      queryClient.invalidateQueries({ queryKey: ["alertas-unread"] });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.Alertas.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alertas-notifier"] }),
  });

  // Auto-check leituras against config thresholds
  useEffect(() => {
    const config = configs[0];
    if (!config || !leituras.length) return;

    const latest = leituras[0];
    const estacao = estacoes.find(e => e.id === latest.estacao_id);
    const key = `${latest.id}`;
    if (seenIds.current.has(key)) return;
    seenIds.current.add(key);

    const checks = [
      { cond: latest.temperatura_c > config.temperatura_max, tipo: "temperatura_alta", msg: `Temperatura alta: ${latest.temperatura_c?.toFixed(1)}°C (limite: ${config.temperatura_max}°C)`, sev: "critico", val: latest.temperatura_c, lim: config.temperatura_max },
      { cond: latest.temperatura_c < config.temperatura_min, tipo: "temperatura_baixa", msg: `Temperatura baixa: ${latest.temperatura_c?.toFixed(1)}°C (limite: ${config.temperatura_min}°C)`, sev: "aviso", val: latest.temperatura_c, lim: config.temperatura_min },
      { cond: latest.umidade_relativa_perc > config.umidade_max, tipo: "umidade_alta", msg: `Umidade alta: ${latest.umidade_relativa_perc?.toFixed(1)}% (limite: ${config.umidade_max}%)`, sev: "aviso", val: latest.umidade_relativa_perc, lim: config.umidade_max },
      { cond: latest.umidade_relativa_perc < config.umidade_min, tipo: "umidade_baixa", msg: `Umidade baixa: ${latest.umidade_relativa_perc?.toFixed(1)}% (limite: ${config.umidade_min}%)`, sev: "aviso", val: latest.umidade_relativa_perc, lim: config.umidade_min },
      { cond: latest.nivel_co2 > config.co2_max, tipo: "co2_alto", msg: `CO₂ alto: ${latest.nivel_co2?.toFixed(0)} ppm (limite: ${config.co2_max} ppm)`, sev: "critico", val: latest.nivel_co2, lim: config.co2_max },
      { cond: latest.status_bateria_v < config.bateria_min_v, tipo: "bateria_baixa", msg: `Bateria baixa: ${latest.status_bateria_v?.toFixed(2)}V (limite: ${config.bateria_min_v}V)`, sev: "aviso", val: latest.status_bateria_v, lim: config.bateria_min_v },
    ];

    checks.forEach(c => {
      if (c.cond) {
        createAlertMutation.mutate({
          tipo: c.tipo,
          mensagem: c.msg,
          estacao_id: latest.estacao_id,
          estacao_nome: estacao?.nome || latest.local_coleta || "Desconhecida",
          valor_registrado: c.val,
          limite_configurado: c.lim,
          severidade: c.sev,
          lido: false,
        });
      }
    });
  }, [leituras, configs, estacoes]);

  const unread = alertas.slice(0, 5); // show max 5

  if (!unread.length) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col gap-2" style={{ width: "360px" }}>
      {unread.map(a => (
        <AlertCard key={a.id} alerta={a} onDismiss={(id) => dismissMutation.mutate(id)} />
      ))}
    </div>
  );
}
import React, { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Flame, Droplets, Wind, Moon, Zap } from "lucide-react";
import moment from "moment";
import DailyAlertsDigest from "./DailyAlertsDigest";

function fmtDuracao(s) {
  const n = Number(s);
  if (!n || n <= 0) return null;
  if (n < 60) return `${Math.round(n)}s`;
  if (n < 3600) return `${Math.floor(n / 60)}min`;
  return `${(n / 3600).toFixed(1)}h`;
}

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

export default function AlertsNotifier() {
  const queryClient = useQueryClient();
  const seenIds = useRef(new Set());

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-notifier"],
    queryFn: () => base44.entities.Alertas.list("-created_date", 50),
    refetchInterval: 20000,
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["alert-config"],
    queryFn: () => base44.entities.AlertConfig.list(),
  });

  const { data: leituras = [] } = useQuery({
    queryKey: ["leituras-notifier"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 100),
    refetchInterval: 5000,
  });

  const { data: estacoes = [] } = useQuery({
    queryKey: ["estacoes-notifier"],
    queryFn: () => base44.entities.Estacoes.list(),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.Alertas.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alertas-notifier"] }),
  });

  // Auto-check leituras against config thresholds
  useEffect(() => {
    const config = configs[0];
    if (!config || !leituras.length || config.notificacoes_ativas === false) return;

    const latest = leituras[0];
    const estacao = estacoes.find(e => e.id === latest.estacao_id);
    const key = `${latest.id}`;
    if (seenIds.current.has(key)) return;
    seenIds.current.add(key);

    // Período de silêncio: não repetir o mesmo tipo de alerta da mesma
    // estação enquanto existir um igual nos últimos 30 minutos.
    const limite = moment().subtract(30, "minutes");
    const emSilencio = (tipo) =>
      alertas.some(
        (a) =>
          a.tipo === tipo &&
          a.estacao_id === latest.estacao_id &&
          moment(a.created_date).isAfter(limite)
      );

    const checks = [
      { cond: latest.temperatura_c > config.temperatura_max, tipo: "temperatura_alta", msg: `Temperatura alta: ${latest.temperatura_c?.toFixed(1)}°C (limite: ${config.temperatura_max}°C)`, sev: "critico", val: latest.temperatura_c, lim: config.temperatura_max },
      { cond: latest.temperatura_c < config.temperatura_min, tipo: "temperatura_baixa", msg: `Temperatura baixa: ${latest.temperatura_c?.toFixed(1)}°C (limite: ${config.temperatura_min}°C)`, sev: "aviso", val: latest.temperatura_c, lim: config.temperatura_min },
      { cond: latest.umidade_relativa_perc > config.umidade_max, tipo: "umidade_alta", msg: `Umidade alta: ${latest.umidade_relativa_perc?.toFixed(1)}% (limite: ${config.umidade_max}%)`, sev: "aviso", val: latest.umidade_relativa_perc, lim: config.umidade_max },
      { cond: latest.umidade_relativa_perc < config.umidade_min, tipo: "umidade_baixa", msg: `Umidade baixa: ${latest.umidade_relativa_perc?.toFixed(1)}% (limite: ${config.umidade_min}%)`, sev: "aviso", val: latest.umidade_relativa_perc, lim: config.umidade_min },
      { cond: latest.nivel_co2 > config.co2_max, tipo: "co2_alto", msg: `CO₂ alto: ${latest.nivel_co2?.toFixed(0)} ppm (limite: ${config.co2_max} ppm)`, sev: "critico", val: latest.nivel_co2, lim: config.co2_max },
      { cond: latest.status_bateria_v < config.bateria_min_v, tipo: "bateria_baixa", msg: `Bateria baixa: ${latest.status_bateria_v?.toFixed(2)}V (limite: ${config.bateria_min_v}V)`, sev: "aviso", val: latest.status_bateria_v, lim: config.bateria_min_v },
    ];

    checks.forEach(c => {
      if (c.cond && !emSilencio(c.tipo)) {
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
  }, [leituras, configs, estacoes, alertas]);

  // Alertas de ciclo de energia: entrada e saída do Deep Sleep.
  // Detecta transições entre leituras consecutivas da mesma estação e
  // registra o horário da última leitura processada para que, ao reabrir
  // o site, os eventos ocorridos enquanto estava fechado sejam notificados.
  useEffect(() => {
    if (!leituras.length) return;

    const estado = (r) => (r.estado_energia || "").toUpperCase();
    const newestTs = leituras[0].timestamp_recebimento;
    if (!newestTs) return;
    const lastSeen = localStorage.getItem("ecosense-energy-seen");

    if (!lastSeen) {
      localStorage.setItem("ecosense-energy-seen", newestTs);
      return;
    }

    const transicoes = [];
    for (let i = 0; i < leituras.length - 1; i++) {
      const novo = leituras[i];
      const antigo = leituras[i + 1];
      if (!novo?.timestamp_recebimento || novo.timestamp_recebimento <= lastSeen) continue;
      if (!novo.estacao_id || novo.estacao_id !== antigo.estacao_id) continue;
      const eNovo = estado(novo);
      const eAntigo = estado(antigo);
      if (!eNovo || !eAntigo) continue;

      if (eAntigo === "DEEP_SLEEP" && eNovo !== "DEEP_SLEEP") {
        transicoes.push({ tipo: "wake_up", ts: novo.timestamp_recebimento, r: novo });
      } else if (eAntigo !== "DEEP_SLEEP" && eNovo === "DEEP_SLEEP") {
        transicoes.push({ tipo: "deep_sleep", ts: novo.timestamp_recebimento, r: novo });
      }
    }

    // Marca tudo até a leitura mais recente como processado antes de criar
    // os alertas, para não duplicar em refetches simultâneos.
    localStorage.setItem("ecosense-energy-seen", newestTs);
    if (!transicoes.length) return;

    transicoes.forEach((t) => {
      const estacao = estacoes.find((e) => e.id === t.r.estacao_id);
      const nome = estacao?.nome || t.r.local_coleta || "Estação";
      let msg;
      if (t.tipo === "deep_sleep") {
        msg = `${nome} entrou em Deep Sleep`;
        if (t.r.ciclo_deepsleep != null) msg += ` (ciclo ${t.r.ciclo_deepsleep})`;
        const dur = fmtDuracao(t.r.tempo_sleep_programado_s);
        if (dur) msg += `. Próximo despertar em ~${dur}`;
      } else {
        msg = `${nome} saiu do Deep Sleep e voltou a coletar dados`;
        if (t.r.motivo_despertar) msg += ` (motivo: ${t.r.motivo_despertar})`;
      }
      createAlertMutation.mutate({
        tipo: t.tipo,
        mensagem: msg + ".",
        estacao_id: t.r.estacao_id,
        estacao_nome: nome,
        severidade: "info",
        lido: false,
      });
    });
  }, [leituras]);

  const unread = alertas.filter(a => !a.lido);

  if (!unread.length) return null;

  // Um único cartão consolidado no lugar de uma notificação por alerta
  const marcarTodos = async (ids) => {
    await base44.entities.Alertas.bulkUpdate(ids.map((id) => ({ id, lido: true })));
    queryClient.invalidateQueries({ queryKey: ["alertas-notifier"] });
    queryClient.invalidateQueries({ queryKey: ["alertas-unread"] });
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[360px] max-w-[calc(100vw-1.5rem)]">
      <DailyAlertsDigest alertas={unread} onDismissAll={marcarTodos} />
    </div>
  );
}
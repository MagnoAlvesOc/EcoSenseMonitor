import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import moment from "moment";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwLRTwhIVsKvvZAnkb86dVMjmcEY2F78r2j1BPDin389X_T-50ovfBkKzS16zFS_LRk/exec";

// Tempo máximo (em segundos) sem leitura antes de considerar a estação offline.
// O Google Apps Script faz cache da resposta (~5 min), então mesmo com a planilha
// recebendo dados a cada 30s o timestamp visto pode estar vários minutos atrás.
// 600s (10 min) tolera esse atraso de cache: a estação só fica offline se a
// planilha realmente parar de receber dados por mais de 10 min.
export const ONLINE_THRESHOLD_S = 600;

// Validation helpers
export function isValid(v) {
  const n = Number(v);
  return v !== null && v !== undefined && v !== "" && !isNaN(n) && n !== -1;
}

export function safeNum(v) {
  if (!isValid(v)) return null;
  return Number(v);
}

export function fmt(v, decimals = 1) {
  const n = safeNum(v);
  return n !== null ? n.toFixed(decimals) : "--";
}

// Returns timestamp in ms. Usa o timestamp MAIS RECENTE disponível entre os
// campos da linha (servidor e dispositivo), para que um relógio atrasado no
// ESP8266 não faça uma leitura fresca parecer antiga (e a estação ficar offline).
export function getTs(row) {
  if (!row) return 0;
  const candidates = [row.data_servidor, row.timestamp_recebimento, row.timestamp]
    .filter(Boolean)
    .map((v) => moment(v).valueOf())
    .filter((v) => !isNaN(v));
  return candidates.length ? Math.max(...candidates) : 0;
}

let lastValidData = [];

// ── Cache offline (localStorage) ──────────────────────────────────────────────
// Guarda as últimas leituras no aparelho para que os dados fiquem
// disponíveis mesmo sem internet (modo offline).
const OFFLINE_CACHE_KEY = "ecosense_iot_offline_v1";
const OFFLINE_CACHE_MAX_ROWS = 600;
const OFFLINE_WRITE_INTERVAL_MS = 30000;
let lastCacheWriteMs = 0;

export function readOfflineCache() {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.data) ? parsed.data : [];
  } catch {
    return [];
  }
}

function writeOfflineCache(rows) {
  try {
    localStorage.setItem(
      OFFLINE_CACHE_KEY,
      JSON.stringify({ saved_at: Date.now(), data: rows.slice(0, OFFLINE_CACHE_MAX_ROWS) })
    );
  } catch {
    // Cota excedida — mantém o cache anterior
  }
}

// Altitude padrão: sempre a do GPS (altitude_gps_m) quando disponível;
// o valor do sensor BMP só é usado se o GPS não tiver altitude válida.
function normalizeAltitude(row) {
  return row && typeof row === "object" && isValid(row.altitude_gps_m)
    ? { ...row, altitude_m: Number(row.altitude_gps_m) }
    : row;
}

function toRows(raw, fallback) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return [raw];
  return fallback ?? [];
}

// Leitura mais recente (payload leve) — mantém o status em tempo real.
async function fetchLatest({ signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`, {
      signal: signal || controller.signal,
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) throw new Error("API error");
    const rows = toRows(await res.json(), lastValidData).map(normalizeAltitude);
    lastValidData = rows;
    return rows;
  } finally {
    clearTimeout(timeout);
  }
}

// Histórico da planilha: o Apps Script devolve no máximo as 1000 leituras
// mais recentes (parâmetro ?limit=, com teto de 1000 no próprio script).
// Payload maior, então é buscado com menos frequência e mesclado ao vivo.
const HISTORY_LIMIT = 1000;

async function fetchHistory({ signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_URL}?limit=${HISTORY_LIMIT}&t=${Date.now()}`, {
      signal: signal || controller.signal,
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) throw new Error("API error");
    return toRows(await res.json(), [])
      .map(normalizeAltitude)
      .sort((a, b) => getTs(b) - getTs(a));
  } finally {
    clearTimeout(timeout);
  }
}

export function useExternalIoT() {
  const latestQ = useQuery({
    queryKey: ["external-iot-latest"],
    queryFn: fetchLatest,
    refetchInterval: 3000,       // status em tempo real a cada 3s
    staleTime: 0,
    placeholderData: () => lastValidData,
    initialData: readOfflineCache, // dados do cache offline aparecem imediatamente
    retry: 1,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  const historyQ = useQuery({
    queryKey: ["external-iot-history"],
    queryFn: fetchHistory,
    refetchInterval: 300000,     // histórico a cada 5 min
    staleTime: 240000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const data = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const row of [...(historyQ.data ?? []), ...(latestQ.data ?? [])]) {
      const key = `${row?.estacao_id ?? row?.estacao_nome ?? ""}|${getTs(row)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
    return merged.sort((a, b) => getTs(b) - getTs(a));
  }, [latestQ.data, historyQ.data]);

  // Persiste as últimas leituras no aparelho (com throttle) para uso offline
  useEffect(() => {
    if (!data.length) return;
    const now = Date.now();
    if (now - lastCacheWriteMs < OFFLINE_WRITE_INTERVAL_MS) return;
    lastCacheWriteMs = now;
    writeOfflineCache(data);
  }, [data]);

  return {
    data,
    isLoading: latestQ.isLoading || historyQ.isLoading,
    isError: latestQ.isError && historyQ.isError,
  };
}

// Filter data by date range using timestamp_recebimento (fallback data_servidor)
export function filterByRange(data, startDate, endDate) {
  if (!Array.isArray(data)) return [];
  const start = moment(startDate).valueOf();
  const end = moment(endDate).valueOf();
  return data.filter(r => {
    const ts = getTs(r);
    return ts >= start && ts <= end;
  });
}

// Detect gaps: returns array of {before, after, gapMinutes} objects
export function detectGaps(sortedDesc, thresholdMinutes = 2) {
  if (!Array.isArray(sortedDesc)) return [];
  const gaps = [];
  for (let i = 0; i < sortedDesc.length - 1; i++) {
    const curr = getTs(sortedDesc[i]);
    const next = getTs(sortedDesc[i + 1]);
    const diffMin = (next - curr) / 60000; // next is older → negative, so:
    const absDiff = Math.abs((curr - next) / 60000);
    if (absDiff > thresholdMinutes) {
      gaps.push({
        before: sortedDesc[i + 1],
        after: sortedDesc[i],
        gapMinutes: absDiff,
      });
    }
  }
  return gaps;
}

// Build chart series inserting null between gaps
export function buildChartSeries(sortedDesc, keys) {
  if (!Array.isArray(sortedDesc)) return [];
  // Reverse to oldest-first for chart
  const asc = [...sortedDesc].reverse();
  const result = [];
  for (let i = 0; i < asc.length; i++) {
    const row = asc[i];
    if (i > 0) {
      const prev = asc[i - 1];
      const diffMin = (getTs(row) - getTs(prev)) / 60000;
      if (diffMin > 2) {
        // Insert null gap point
        const nullPoint = { time: null, _gap: true };
        keys.forEach(k => (nullPoint[k] = null));
        result.push(nullPoint);
      }
    }
    const point = { time: moment(getTs(row)).format("DD/MM HH:mm") };
    keys.forEach(k => {
      point[k] = safeNum(row[k]);
    });
    result.push(point);
  }
  return result;
}

// Generate automatic logs from data
export function generateLogs(sortedDesc) {
  const logs = [];
  if (!Array.isArray(sortedDesc) || !sortedDesc.length) return logs;

  const latest = sortedDesc[0];
  const latestTs = getTs(latest);
  const secsSince = (Date.now() - latestTs) / 1000;

  // ONLINE / OFFLINE
  if (secsSince >= ONLINE_THRESHOLD_S) {
    logs.push({
      id: "offline-current",
      tipo: "OFFLINE",
      severidade: "critico",
      mensagem: `Estação offline há ${Math.round(secsSince / 60)} min — última leitura: ${moment(latestTs).format("DD/MM HH:mm:ss")}`,
      estacao_nome: latest.estacao_nome || latest.estacao_id || "—",
      ip_origem: latest.ip_local_estacao || "—",
      timestamp: latestTs,
    });
  } else {
    logs.push({
      id: "online-current",
      tipo: "ONLINE",
      severidade: "info",
      mensagem: `Estação online — última leitura: ${moment(latestTs).format("DD/MM HH:mm:ss")}`,
      estacao_nome: latest.estacao_nome || latest.estacao_id || "—",
      ip_origem: latest.ip_local_estacao || "—",
      timestamp: latestTs,
    });
  }

  // Gaps
  const gaps = detectGaps(sortedDesc, 2);
  gaps.forEach((g, i) => {
    logs.push({
      id: `gap-${i}`,
      tipo: "LACUNA DE COLETA",
      severidade: "aviso",
      mensagem: `Lacuna de ${Math.round(g.gapMinutes)} min entre ${moment(getTs(g.before)).format("HH:mm:ss")} e ${moment(getTs(g.after)).format("HH:mm:ss")}`,
      estacao_nome: latest.estacao_nome || latest.estacao_id || "—",
      ip_origem: "—",
      timestamp: getTs(g.after),
    });
  });

  // Sensor errors and weak signal per reading (last 50)
  sortedDesc.slice(0, 50).forEach((r, i) => {
    const ts = getTs(r);
    const tsStr = moment(ts).format("DD/MM HH:mm:ss");

    const badFields = [];
    ["temperatura_c", "umidade_relativa_perc", "pressao_atmosferica_hpa", "altitude_m"].forEach(k => {
      if (!isValid(r[k])) badFields.push(k.replace(/_/g, " "));
    });
    if (badFields.length) {
      logs.push({
        id: `sensor-err-${i}`,
        tipo: "ERRO SENSOR",
        severidade: "erro",
        mensagem: `Valor inválido em: ${badFields.join(", ")} — ${tsStr}`,
        estacao_nome: r.estacao_nome || r.estacao_id || "—",
        ip_origem: r.ip_local_estacao || "—",
        timestamp: ts,
      });
    }

    const rssi = safeNum(r.rssi);
    if (rssi !== null && rssi < -70) {
      logs.push({
        id: `rssi-${i}`,
        tipo: "FRACO SINAL",
        severidade: "aviso",
        mensagem: `RSSI ${rssi} dBm — sinal fraco — ${tsStr}`,
        estacao_nome: r.estacao_nome || r.estacao_id || "—",
        ip_origem: r.ip_local_estacao || "—",
        timestamp: ts,
      });
    }
  });

  // Sort by timestamp desc
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// São Luís, Maranhão
const SAO_LUIS = { lat: -2.5297, lon: -44.3028, name: "São Luís, Maranhão" };

// Typical ambient-air estimates (guaranteed fallback so cards never go blank)
const TYPICAL = {
  ch4_ppm: 1.9,
  co2_ppm: 420,
  nh3_ugm3: 5,
  h2s_ppb: 1,
  precipitacao_mm: 0,
  temperatura_c: 28,
  umidade_relativa_perc: 75,
  pressao_atmosferica_hpa: 1010,
};

function normalize(res) {
  const num = (v, d) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  return {
    ch4_ppm: num(res?.ch4_ppm, TYPICAL.ch4_ppm),
    co2_ppm: num(res?.co2_ppm, TYPICAL.co2_ppm),
    nh3_ugm3: num(res?.nh3_ugm3, TYPICAL.nh3_ugm3),
    h2s_ppb: num(res?.h2s_ppb, TYPICAL.h2s_ppb),
    precipitacao_mm: num(res?.precipitacao_mm, TYPICAL.precipitacao_mm),
    temperatura_c: num(res?.temperatura_c, TYPICAL.temperatura_c),
    umidade_relativa_perc: num(res?.umidade_relativa_perc, TYPICAL.umidade_relativa_perc),
    pressao_atmosferica_hpa: num(res?.pressao_atmosferica_hpa, TYPICAL.pressao_atmosferica_hpa),
    fonte: res?.fonte || "estimado",
    fetched_at: Date.now(),
  };
}

let lastValid = normalize(null);

async function fetchOnlineEnvData() {
  try {
    const response = await base44.functions.invoke("getOnlineEnvData", {});
    lastValid = normalize(response.data);
    return lastValid;
  } catch (e) {
    // Keep last valid (or typical) so the panel never goes blank
    return lastValid;
  }
}

export function useOnlineEnvData() {
  return useQuery({
    queryKey: ["online-env-data"],
    queryFn: fetchOnlineEnvData,
    refetchInterval: 300000, // 5 min
    staleTime: 240000,
    placeholderData: () => lastValid,
    initialData: () => normalize(null),
    retry: 1,
  });
}

export { TYPICAL, SAO_LUIS };
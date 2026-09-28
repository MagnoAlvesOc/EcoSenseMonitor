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
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um assistente de monitoramento ambiental. Pesquise na internet (IQAir, AQICN, OpenWeather, INMET, Copernicus) os valores ATUAIS de qualidade do ar e clima para São Luís, Maranhão, Brasil (lat -2.5297, lon -44.3028) para:
- Metano (CH4) em ppm (global ~1.9 ppm se não houver medição local)
- Dióxido de Carbono (CO2) em ppm (global ~420 ppm se não houver medição local)
- Amônia (NH3) em µg/m³ (use dados de qualidade do ar se disponível)
- Sulfeto de Hidrogênio (H2S) em ppb (ar urbano ~1 ppb se não houver medição local)
- Precipitação (chuva acumulada na última 1h) em mm (use dados meteorológicos atuais)
- Temperatura do ar em graus Celsius (use dados meteorológicos atuais de São Luís)
- Umidade relativa do ar em percentual (use dados meteorológicos atuais de São Luís)
- Pressão atmosférica ao nível do mar em hPa (use dados meteorológicos atuais de São Luís)

Retorne APENAS um JSON com valores numéricos. Sempre preencha TODOS os campos com um número. Se não encontrar medição local em tempo real, use a melhor estimativa de ar urbano: CH4 ~1.9 ppm, CO2 ~420 ppm, NH3 ~5 µg/m³, H2S ~1 ppb, Precipitação 0 mm, Temperatura ~28°C, Umidade ~75%, Pressão ~1010 hPa. No campo "fonte" diga "online" se obteve de fonte externa ou "estimado" se usou valores típicos.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          ch4_ppm: { type: "number" },
          co2_ppm: { type: "number" },
          nh3_ugm3: { type: "number" },
          h2s_ppb: { type: "number" },
          precipitacao_mm: { type: "number" },
          temperatura_c: { type: "number" },
          umidade_relativa_perc: { type: "number" },
          pressao_atmosferica_hpa: { type: "number" },
          fonte: { type: "string" },
        },
        required: ["ch4_ppm", "co2_ppm", "nh3_ugm3", "h2s_ppb", "precipitacao_mm", "temperatura_c", "umidade_relativa_perc", "pressao_atmosferica_hpa"],
      },
    });
    lastValid = normalize(res);
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
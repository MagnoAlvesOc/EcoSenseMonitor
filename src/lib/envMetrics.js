import { CloudDrizzle, Factory, Wind, FlaskConical, CloudRain } from "lucide-react";

export function getPollutantStatus(type, v) {
  if (v == null) return "offline";
  switch (type) {
    case "ch4":
      if (v > 10) return "critico";
      if (v > 2) return "atencao";
      return "normal";
    case "co2":
      if (v > 1000) return "critico";
      if (v > 600) return "atencao";
      return "normal";
    case "nh3":
      if (v > 50) return "critico";
      if (v > 10) return "atencao";
      return "normal";
    case "h2s":
      if (v > 30) return "critico";
      if (v > 5) return "atencao";
      return "normal";
    default:
      return "normal";
  }
}

export function calcRainChance(latest, prev) {
  const toNum = (v) => (v != null ? Number(v) : null);
  const humidity = toNum(latest?.umidade_relativa_perc);
  const pressure = toNum(latest?.pressao_atmosferica_hpa);
  const prevPressure = toNum(prev?.pressao_atmosferica_hpa);
  if (humidity == null || isNaN(humidity) || pressure == null || isNaN(pressure)) return null;

  let chance = 0;
  if (humidity >= 90) chance += 55;
  else if (humidity >= 80) chance += 40;
  else if (humidity >= 70) chance += 25;
  else if (humidity >= 60) chance += 12;
  else chance += 3;

  if (pressure < 1005) chance += 25;
  else if (pressure < 1010) chance += 15;
  else if (pressure < 1013) chance += 5;

  if (prevPressure != null && !isNaN(prevPressure) && pressure < prevPressure) chance += 20;

  return Math.min(100, Math.round(chance));
}

function getRainStatus(v) {
  if (v == null) return "offline";
  if (v >= 70) return "critico";
  if (v >= 40) return "atencao";
  return "normal";
}

export function buildEnvCards(latest, prev, onlineData) {
  const ch4 = onlineData?.ch4_ppm ?? null;
  const co2 = onlineData?.co2_ppm ?? null;
  const nh3 = onlineData?.nh3_ugm3 ?? null;
  const h2s = onlineData?.h2s_ppb ?? null;
  const precip = onlineData?.precipitacao_mm ?? null;
  const rainChance = calcRainChance(latest, prev);
  const rainHas = rainChance != null;

  return [
    { icon: CloudDrizzle, label: "Chance de Chuva", value: rainHas ? rainChance : null, unit: "%", color: "#2563eb", source: rainHas ? "estacao" : "offline", status: getRainStatus(rainChance) },
    { icon: Factory, label: "Metano (CH4)", value: ch4 != null ? ch4.toFixed(2) : null, unit: "ppm", color: "#a16207", source: ch4 != null ? "online" : "offline", status: getPollutantStatus("ch4", ch4) },
    { icon: Wind, label: "CO2", value: co2 != null ? co2.toFixed(0) : null, unit: "ppm", color: "#6b7280", source: co2 != null ? "online" : "offline", status: getPollutantStatus("co2", co2) },
    { icon: FlaskConical, label: "Amônia (NH3)", value: nh3 != null ? nh3.toFixed(1) : null, unit: "µg/m³", color: "#10b981", source: nh3 != null ? "online" : "offline", status: getPollutantStatus("nh3", nh3) },
    { icon: FlaskConical, label: "Sulfeto (H2S)", value: h2s != null ? h2s.toFixed(1) : null, unit: "ppb", color: "#8b5cf6", source: h2s != null ? "online" : "offline", status: getPollutantStatus("h2s", h2s) },
    { icon: CloudRain, label: "Precipitação", value: precip != null ? precip.toFixed(1) : null, unit: "mm", color: "#0ea5e9", source: precip != null ? "online" : "offline" },
  ];
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Retorna os valores atuais de qualidade do ar e clima para São Luís/MA.
// Sem parâmetros de entrada: operação específica do app, não um proxy genérico.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
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

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
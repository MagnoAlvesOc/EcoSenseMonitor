import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2, CloudDownload, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const FONTE_COLORS = {
  openweather: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  inmet: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  manual: "bg-violet-500/15 text-violet-600 border-violet-500/20",
};

export default function FontesExternasTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [fonte, setFonte] = useState("openweather");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("owm_api_key") || "");
  const [estacaoId, setEstacaoId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: dadosExternos = [] } = useQuery({
    queryKey: ["dados-externos"],
    queryFn: () => base44.entities.DadosExternos.list("-timestamp", 200),
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.DadosExternos.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dados-externos"] }),
  });

  const fetchOpenWeather = async (estacao) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${estacao.latitude}&lon=${estacao.longitude}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return {
      fonte: "openweather",
      estacao_referencia_id: estacao.id,
      estacao_referencia_nome: estacao.nome,
      nome_estacao_externa: data.name || "OpenWeather",
      latitude: estacao.latitude,
      longitude: estacao.longitude,
      timestamp: new Date().toISOString(),
      temperatura_c: data.main?.temp,
      umidade_relativa_perc: data.main?.humidity,
      pressao_atmosferica_hpa: data.main?.pressure,
      indice_uv: null,
      raw_response: JSON.stringify(data),
    };
  };

  const fetchINMET = async (estacao) => {
    // INMET Open API — busca estação mais próxima e leitura mais recente
    const hoje = moment().format("YYYY-MM-DD");
    const url = `https://apitempo.inmet.gov.br/estacao/${hoje}/${hoje}/${estacao.latitude}/${estacao.longitude}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`INMET API: ${res.status}`);
    const data = await res.json();
    const last = Array.isArray(data) ? data[data.length - 1] : data;
    return {
      fonte: "inmet",
      estacao_referencia_id: estacao.id,
      estacao_referencia_nome: estacao.nome,
      nome_estacao_externa: last?.DC_NOME || "INMET",
      latitude: estacao.latitude,
      longitude: estacao.longitude,
      timestamp: new Date().toISOString(),
      temperatura_c: parseFloat(last?.TEM_INS) || null,
      umidade_relativa_perc: parseFloat(last?.UMD_INS) || null,
      pressao_atmosferica_hpa: parseFloat(last?.PRE_INS) || null,
      indice_uv: parseFloat(last?.RAD_GLO) || null,
      raw_response: JSON.stringify(last),
    };
  };

  const handleFetch = async () => {
    if (!estacaoId) return toast({ title: "Selecione uma estação", variant: "destructive" });
    if (fonte === "openweather" && !apiKey) return toast({ title: "Informe a API Key do OpenWeather", variant: "destructive" });
    const estacao = estacoes.find(e => e.id === estacaoId);
    if (!estacao) return;

    localStorage.setItem("owm_api_key", apiKey);
    setLoading(true);
    try {
      let payload;
      if (fonte === "openweather") payload = await fetchOpenWeather(estacao);
      else payload = await fetchINMET(estacao);
      await base44.entities.DadosExternos.create(payload);
      qc.invalidateQueries({ queryKey: ["dados-externos"] });
      toast({ title: "Dados importados com sucesso!" });
    } catch (e) {
      toast({ title: "Erro ao importar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const grouped = dadosExternos.reduce((acc, d) => {
    const key = d.estacao_referencia_nome || "—";
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Config */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CloudDownload className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Importar Dados Externos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Fonte de Dados</Label>
            <Select value={fonte} onValueChange={setFonte}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openweather">OpenWeatherMap</SelectItem>
                <SelectItem value="inmet">INMET (Open API)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estação de Referência (In-Situ)</Label>
            <Select value={estacaoId} onValueChange={setEstacaoId}>
              <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
              <SelectContent>
                {estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {fonte === "openweather" && (
          <div className="mb-4">
            <Label>API Key OpenWeatherMap</Label>
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Sua chave da API em openweathermap.org"
              type="password"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Gratuito em <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">openweathermap.org/api</a>
            </p>
          </div>
        )}

        {fonte === "inmet" && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-200 mb-4">
            <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700">
              A API do INMET é pública e gratuita. Os dados são buscados pela coordenada geográfica da estação selecionada.
              Disponibilidade depende de estações INMET próximas.
            </p>
          </div>
        )}

        <Button onClick={handleFetch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {loading ? "Buscando..." : "Buscar Agora"}
        </Button>
      </GlassCard>

      {/* Histórico */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados Importados ({dadosExternos.length})</p>
        </div>

        {dadosExternos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado importado ainda</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([nomeEstacao, itens]) => (
              <div key={nomeEstacao}>
                <p className="text-xs font-semibold mb-2">{nomeEstacao}</p>
                <div className="space-y-1">
                  {itens.slice(0, 5).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className={FONTE_COLORS[d.fonte]}>{d.fonte}</Badge>
                        <span className="text-xs font-mono text-muted-foreground">{moment(d.timestamp).format("DD/MM HH:mm")}</span>
                        <span className="text-xs">
                          {d.temperatura_c != null && `🌡️ ${d.temperatura_c.toFixed(1)}°C`}
                          {d.umidade_relativa_perc != null && ` 💧 ${d.umidade_relativa_perc.toFixed(0)}%`}
                          {d.pressao_atmosferica_hpa != null && ` 🌬️ ${d.pressao_atmosferica_hpa.toFixed(0)}hPa`}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => remove.mutate(d.id)}>
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  {itens.length > 5 && <p className="text-xs text-muted-foreground pl-1">+ {itens.length - 5} registros anteriores</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
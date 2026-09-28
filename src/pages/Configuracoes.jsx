import React, { useState, useEffect } from "react";
import { appParams } from "@/lib/app-params";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Save, Webhook, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

export default function Configuracoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ["alert-config"],
    queryFn: () => base44.entities.AlertConfig.list(),
  });

  const config = configs[0] || {};
  const [form, setForm] = useState({
    temperatura_max: 40, temperatura_min: 5,
    umidade_max: 95, umidade_min: 20,
    co2_max: 1000, bateria_min_v: 3.3,
    canal_notificacao: "email", email_notificacao: "",
    telegram_bot_token: "", telegram_chat_id: "",
    notificacoes_ativas: true,
  });

  useEffect(() => {
    if (config.id) {
      setForm({
        temperatura_max: config.temperatura_max ?? 40,
        temperatura_min: config.temperatura_min ?? 5,
        umidade_max: config.umidade_max ?? 95,
        umidade_min: config.umidade_min ?? 20,
        co2_max: config.co2_max ?? 1000,
        bateria_min_v: config.bateria_min_v ?? 3.3,
        canal_notificacao: config.canal_notificacao || "email",
        email_notificacao: config.email_notificacao || "",
        telegram_bot_token: config.telegram_bot_token || "",
        telegram_chat_id: config.telegram_chat_id || "",
        notificacoes_ativas: config.notificacoes_ativas ?? true,
      });
    }
  }, [config.id]);

  const saveMutation = useMutation({
    mutationFn: (data) => config.id ? base44.entities.AlertConfig.update(config.id, data) : base44.entities.AlertConfig.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["alert-config"] }); toast({ title: "Configurações salvas" }); },
  });

  const { appId, appBaseUrl } = appParams;
  const entityUrl = `${appBaseUrl || "https://api.base44.app"}/api/apps/${appId}/entities/HistoricoLeituras`;

  return (
    <div className="space-y-4 max-w-3xl pointer-events-auto">
      <GlassCard className="p-4">
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-xs text-muted-foreground">Limites de alerta, notificações e integração</p>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Webhook className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Webhook de Coleta (POST)</p>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          O ESP32 pode enviar dados <strong>diretamente</strong> para a API REST do Base44 via HTTP POST — sem precisar de plano Builder+.
        </p>

        {/* Endpoint URL */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3">Endpoint</p>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl mb-4">
          <code className="text-xs font-mono flex-1 break-all">{entityUrl}</code>
          <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(entityUrl); toast({ title: "URL copiada" }); }}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Payload */}
        <div className="rounded-xl bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <span className="text-xs text-gray-400 font-mono">Arduino / ESP32 — HTTPClient</span>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-gray-400 hover:text-white px-2"
              onClick={() => {
                const code = `#include <HTTPClient.h>\n#include <ArduinoJson.h>\n\nconst char* serverUrl = "${entityUrl}";\n\nvoid enviarDados() {\n  HTTPClient http;\n  http.begin(serverUrl);\n  http.addHeader("Content-Type", "application/json");\n\n  StaticJsonDocument<512> doc;\n  doc["timestamp_recebimento"] = "2026-04-13T12:00:00Z"; // use NTP\n  doc["estacao_id"]           = "estacao-01"; // seu device_id\n  doc["temperatura_c"]        = temperatura_dht;\n  doc["temperatura_bmp_c"]    = temperatura_bmp;\n  doc["umidade_relativa_perc"]= umidade;\n  doc["pressao_atmosferica_hpa"] = pressao;\n  doc["altitude_m"]           = altitude;\n  doc["acc_x"] = acc_x; doc["acc_y"] = acc_y; doc["acc_z"] = acc_z;\n  doc["gyro_x"] = gyro_x; doc["gyro_y"] = gyro_y; doc["gyro_z"] = gyro_z;\n  doc["angle_x"] = angle_x; doc["angle_y"] = angle_y; doc["angle_z"] = angle_z;\n  doc["rssi"] = WiFi.RSSI();\n\n  String body;\n  serializeJson(doc, body);\n  int code = http.POST(body);\n  http.end();\n}`;
                navigator.clipboard.writeText(code);
                toast({ title: "Código copiado!" });
              }}
            >
              <Copy className="w-3 h-3 mr-1" /> Copiar código
            </Button>
          </div>
          <pre className="p-4 text-[11px] text-green-400 font-mono overflow-x-auto whitespace-pre">{`#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "${entityUrl}";
WiFiClient client;

void enviarDados() {
  HTTPClient http;
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["timestamp_recebimento"] = "2026-04-13T12:00:00Z"; // use NTP
  doc["estacao_id"]             = "estacao-01";
  doc["temperatura_c"]          = temperatura_dht;
  doc["temperatura_bmp_c"]      = temperatura_bmp;
  doc["umidade_relativa_perc"]  = umidade;
  doc["pressao_atmosferica_hpa"]= pressao;
  doc["altitude_m"]             = altitude;
  doc["acc_x"] = acc_x; doc["acc_y"] = acc_y; doc["acc_z"] = acc_z;
  doc["gyro_x"] = gyro_x; doc["gyro_y"] = gyro_y; doc["gyro_z"] = gyro_z;
  doc["angle_x"] = angle_x; doc["angle_y"] = angle_y; doc["angle_z"] = angle_z;
  doc["rssi"] = WiFi.RSSI();

  String body;
  serializeJson(doc, body);
  int httpCode = http.POST(body);  // 201 = sucesso
  Serial.println(httpCode);
  http.end();
}`}</pre>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Limites de Alerta</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Temp. Máxima (°C)</Label><Input type="number" value={form.temperatura_max} onChange={e => setForm({ ...form, temperatura_max: parseFloat(e.target.value) })} /></div>
            <div><Label>Temp. Mínima (°C)</Label><Input type="number" value={form.temperatura_min} onChange={e => setForm({ ...form, temperatura_min: parseFloat(e.target.value) })} /></div>
            <div><Label>Umidade Máxima (%)</Label><Input type="number" value={form.umidade_max} onChange={e => setForm({ ...form, umidade_max: parseFloat(e.target.value) })} /></div>
            <div><Label>Umidade Mínima (%)</Label><Input type="number" value={form.umidade_min} onChange={e => setForm({ ...form, umidade_min: parseFloat(e.target.value) })} /></div>
            <div><Label>CO₂ Máximo (ppm)</Label><Input type="number" value={form.co2_max} onChange={e => setForm({ ...form, co2_max: parseFloat(e.target.value) })} /></div>
            <div><Label>Bateria Mín. (V)</Label><Input type="number" step="0.1" value={form.bateria_min_v} onChange={e => setForm({ ...form, bateria_min_v: parseFloat(e.target.value) })} /></div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notificações</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notificações Ativas</Label>
              <Switch checked={form.notificacoes_ativas} onCheckedChange={v => setForm({ ...form, notificacoes_ativas: v })} />
            </div>
            <div>
              <Label>Canal</Label>
              <Select value={form.canal_notificacao} onValueChange={v => setForm({ ...form, canal_notificacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.canal_notificacao === "email" || form.canal_notificacao === "ambos") && (
              <div><Label>E-mail</Label><Input type="email" value={form.email_notificacao} onChange={e => setForm({ ...form, email_notificacao: e.target.value })} placeholder="seu@email.com" /></div>
            )}
            {(form.canal_notificacao === "telegram" || form.canal_notificacao === "ambos") && (
              <>
                <div><Label>Token do Bot</Label><Input value={form.telegram_bot_token} onChange={e => setForm({ ...form, telegram_bot_token: e.target.value })} placeholder="123456:ABC-DEF..." /></div>
                <div><Label>Chat ID</Label><Input value={form.telegram_chat_id} onChange={e => setForm({ ...form, telegram_chat_id: e.target.value })} placeholder="-100123456789" /></div>
              </>
            )}
          </div>
        </GlassCard>
      </div>

      <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full md:w-auto">
        <Save className="w-4 h-4 mr-2" /> Salvar Configurações
      </Button>
    </div>
  );
}
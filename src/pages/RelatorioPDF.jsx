import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

// ── Page sections ───────────────────────────────────────────────────────────

function DashboardSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Dashboard — EcoSense IoT</h2>
      <p className="text-sm text-gray-500 mb-4">Monitoramento em tempo real de sensores ambientais</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["Temperatura", "Umidade", "Pressão"].map(m => (
          <div key={m} className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase">{m}</p>
            <p className="text-3xl font-bold text-orange-600">--</p>
            <p className="text-xs text-gray-400">Sem dados</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">Tendências em Tempo Real — aguardando dados do ESP8266</p>
      </div>
    </div>
  );
}

function MapaSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Mapa de Estações</h2>
      <p className="text-sm text-gray-500 mb-4">Localização georreferenciada das estações IoT</p>
      <div className="border rounded-xl p-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">📍</div>
          <div>
            <p className="font-semibold">Estação Sá Viana</p>
            <p className="text-xs text-gray-500">-2.5557, -44.3007</p>
          </div>
          <span className="ml-auto text-xs text-emerald-600 font-medium">Online</span>
        </div>
        <div className="mt-3 bg-blue-50 rounded-lg p-4 text-center text-sm text-blue-700">
          Mapa interativo com marcadores coloridos por métrica (temperatura, umidade, CO₂, etc.)
        </div>
      </div>
    </div>
  );
}

function RelatoriosSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Relatórios</h2>
      <p className="text-sm text-gray-500 mb-4">Dados históricos com exportação CSV, Excel e TXT</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {["CSV", "Excel", "TXT", "PDF"].map(f => (
          <div key={f} className="bg-gray-50 rounded-lg p-3 text-center text-sm font-medium">{f}</div>
        ))}
      </div>
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Data/Hora</th>
              <th className="p-3 text-left">Estação</th>
              <th className="p-3 text-left">Temp (°C)</th>
              <th className="p-3 text-left">Umid (%)</th>
              <th className="p-3 text-left">Pressão (hPa)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={5} className="p-6 text-center text-gray-400">Histórico disponível após coleta de dados</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnaliseSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Análise Estatística</h2>
      <p className="text-sm text-gray-500 mb-4">Média, mediana, desvio padrão e lacunas de coleta</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Temperatura", color: "text-red-500" },
          { label: "Umidade", color: "text-blue-500" },
          { label: "Pressão", color: "text-purple-500" },
          { label: "Altitude", color: "text-green-500" },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${m.color}`}>--</p>
            <p className="text-xs text-gray-500">média • 0 amostras</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-400">
        Gráfico de tendências — dados insuficientes
      </div>
    </div>
  );
}

function LogsSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Logs do Sistema</h2>
      <p className="text-sm text-gray-500 mb-4">Eventos automáticos baseados na API em tempo real</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Info", count: 0, color: "text-blue-500" },
          { label: "Avisos", count: 0, color: "text-amber-500" },
          { label: "Erros", count: 0, color: "text-red-500" },
          { label: "Críticos", count: 0, color: "text-red-700" },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="border rounded-xl p-6 text-center text-gray-400">
        Nenhum evento registrado — sistema aguardando dados
      </div>
    </div>
  );
}

function ConfiguracoesSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Configurações</h2>
      <p className="text-sm text-gray-500 mb-4">Limites de alerta, notificações e integração ESP32</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: "Temp. Máxima", value: "40°C" },
          { label: "Temp. Mínima", value: "5°C" },
          { label: "Umidade Máx.", value: "95%" },
          { label: "Umidade Mín.", value: "20%" },
          { label: "CO₂ Máximo", value: "1000 ppm" },
          { label: "Bateria Mín.", value: "3.3V" },
        ].map(c => (
          <div key={c.label} className="bg-gray-50 rounded-lg p-3 flex justify-between">
            <span className="text-sm text-gray-600">{c.label}</span>
            <span className="text-sm font-bold">{c.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs">
        <p className="text-gray-500 mb-1">// ESP32 Webhook — POST</p>
        <p>POST /api/apps/.../entities/HistoricoLeituras</p>
        <p className="text-gray-500 mt-1">// Envia temperatura, umidade, pressão, altitude, UV, CO₂, bateria, IMU</p>
      </div>
    </div>
  );
}

function ManutencaoSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Gestão de Manutenção</h2>
      <p className="text-sm text-gray-500 mb-4">Custos, histórico preventivo e relatórios PDF por estação</p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {["$ Custos", "Manutenção Preventiva", "Relatório PDF"].map(t => (
          <div key={t} className={`rounded-lg p-3 text-center text-sm font-medium ${t === "$ Custos" ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-600"}`}>{t}</div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Custo Total", value: "R$ 0,00" },
          { label: "Registros", value: "0" },
          { label: "Estações", value: "1" },
          { label: "Custo Médio", value: "R$ 0,00" },
        ].map(c => (
          <div key={c.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegracoesSection() {
  return (
    <div className="page-section bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-2">Integrações e Exportação</h2>
      <p className="text-sm text-gray-500 mb-4">Fontes externas, comparação e API de exportação</p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {["🌐 Fontes Externas", "📊 Comparação", "</> API de Exportação"].map(t => (
          <div key={t} className={`rounded-lg p-3 text-center text-sm font-medium ${t.includes("Fontes") ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-600"}`}>{t}</div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-semibold mb-2">Importar Dados Externos</p>
        <div className="flex gap-4 mb-3">
          <select className="border rounded-lg px-3 py-2 text-sm flex-1" defaultValue="openweather">
            <option value="openweather">OpenWeatherMap</option>
            <option value="inmet">INMET</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm flex-1" defaultValue="">
            <option value="">Selecionar estação</option>
          </select>
        </div>
        <button className="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-medium">BUSCAR AGORA</button>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function RelatorioPDF() {
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef(null);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = -(pageHeight - 20) + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`EcoSenseIoT_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pointer-events-auto py-8 px-4">
      {/* Header */}
      <GlassCard className="p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório Completo — EcoSense IoT</h1>
          <p className="text-sm text-muted-foreground">Todas as 8 páginas do aplicativo em um único PDF</p>
        </div>
        <Button
          size="lg"
          onClick={handleGeneratePDF}
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
          ) : (
            <><FileText className="w-4 h-4" /> Baixar PDF</>
          )}
        </Button>
      </GlassCard>

      {/* Report content */}
      <div ref={reportRef} className="bg-white rounded-2xl shadow-xl p-8">
        {/* Cover */}
        <div className="page-section text-center py-16 mb-8 border-b-4 border-orange-500">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">E</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">EcoSense IoT</h1>
          <p className="text-lg text-gray-500 mb-1">Plataforma de Monitoramento Ambiental</p>
          <p className="text-sm text-gray-400">Relatório Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <h2 className="text-xl font-bold text-orange-600 mb-6 pb-2 border-b">📋 Índice de Páginas</h2>
        <ol className="list-decimal list-inside space-y-2 mb-10 text-sm text-gray-600">
          <li>Dashboard — Monitoramento em Tempo Real</li>
          <li>Mapa de Estações — Localização Georreferenciada</li>
          <li>Relatórios — Dados Históricos e Exportação</li>
          <li>Análise Estatística — Métricas e Tendências</li>
          <li>Logs do Sistema — Eventos e Diagnósticos</li>
          <li>Configurações — Alertas e Integração ESP32</li>
          <li>Gestão de Manutenção — Custos e Preventivas</li>
          <li>Integrações — Fontes Externas e API</li>
        </ol>

        <DashboardSection />
        <MapaSection />
        <RelatoriosSection />
        <AnaliseSection />
        <LogsSection />
        <ConfiguracoesSection />
        <ManutencaoSection />
        <IntegracoesSection />

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-10 pt-6 border-t">
          EcoSense IoT — Relatório automático • {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>
    </div>
  );
}
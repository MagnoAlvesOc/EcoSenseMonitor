import React from "react";
import { Link } from "react-router-dom";
import { Radio, MapPin, BarChart3, ShieldCheck, ArrowLeft } from "lucide-react";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">EcoSense Monitor</span>
        </div>

        <h1 className="text-3xl font-bold mb-4">Sobre o EcoSense Monitor</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            O <strong className="text-foreground">EcoSense Monitor</strong> é uma plataforma de
            monitoramento IoT (Internet das Coisas) dedicada ao acompanhamento de dados climáticos
            e de diagnóstico de estações meteorológicas em tempo real. Cada estação física,
            equipada com sensores de temperatura, umidade relativa, pressão atmosférica, radiação
            UV, CO₂ e GPS, envia suas leituras continuamente para a plataforma, que as organiza,
            valida e apresenta em um painel interativo.
          </p>
          <p>
            O sistema oferece um mapa de estações com visualização por satélite, gráficos de
            tendência histórica, comparação entre estações, análise de microclima em um raio de
            2,5 km, alertas automáticos de limites críticos (como temperatura extrema, bateria
            baixa ou estação offline) e ferramentas de manutenção preventiva com controle de
            custos. Também é possível cruzar os dados coletados em campo com fontes externas,
            como Open-Meteo e OpenWeatherMap, para validar as medições.
          </p>
          <p>
            A plataforma foi criada para <strong className="text-foreground">pesquisadores,
            estudantes, técnicos ambientais e produtores rurais</strong> que precisam de dados
            climáticos confiáveis e acessíveis para estudos de microclima, agricultura de
            precisão e monitoramento ambiental contínuo — inclusive em áreas remotas, com suporte
            a leituras offline e a dispositivos móveis.
          </p>
          <p>
            O EcoSense Monitor é desenvolvido e mantido pela equipe da{" "}
            <strong className="text-foreground">LabirPesq</strong>, que também opera as estações
            e é responsável pela coleta, calibração e qualidade dos dados publicados na
            plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <MapPin className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Mapa em tempo real</p>
            <p className="text-xs text-muted-foreground">Localização e status de cada estação via GPS.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Análises avançadas</p>
            <p className="text-xs text-muted-foreground">Tendências, comparações e estatísticas históricas.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Alertas e confiabilidade</p>
            <p className="text-xs text-muted-foreground">Monitoramento contínuo e diagnóstico de falhas.</p>
          </div>
        </div>

        <p className="mt-8 text-sm">
          Dúvidas ou sugestões?{" "}
          <Link to="/contato" className="text-primary font-semibold hover:underline">
            Fale conosco
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
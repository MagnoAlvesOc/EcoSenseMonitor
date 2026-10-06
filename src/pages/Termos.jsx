import React from "react";
import LegalPage, { Section } from "@/components/shared/LegalPage";

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso">
      <p>
        Bem-vindo ao EcoSense Monitor. Ao acessar ou utilizar a plataforma, você concorda com
        estes Termos de Uso. Caso não concorde com qualquer disposição, não utilize o serviço.
      </p>

      <Section>1. Descrição do serviço</Section>
      <p>
        O EcoSense Monitor é uma plataforma de monitoramento IoT que coleta, organiza e apresenta
        dados de estações meteorológicas — temperatura, umidade relativa, pressão atmosférica,
        radiação UV, CO₂, bateria e localização GPS — em tempo real, por meio de um painel
        interativo com mapas, gráficos, alertas e ferramentas de manutenção.
      </p>

      <Section>2. Conta e uso da plataforma</Section>
      <p>
        O acesso ao painel é restrito a usuários autorizados. Você é responsável pela
        confidencialidade das suas credenciais e por toda atividade realizada em sua conta. É
        proibido utilizar a plataforma para fins ilícitos, tentar interferir no funcionamento das
        estações ou dos servidores, ou acessar dados de terceiros sem autorização.
      </p>

      <Section>3. Dados das estações</Section>
      <p>
        As leituras enviadas pelas estações físicas são de responsabilidade de quem as opera. A
        plataforma realiza validações básicas e organização dos dados, mas não garante que as
        medições sejam adequadas para decisões de segurança, financeiras ou jurídicas. Para
        aplicações críticas, os dados devem ser confrontados com instrumentação calibrada.
      </p>

      <Section>4. Fontes de dados externas</Section>
      <p>
        O EcoSense Monitor integra dados de serviços públicos de terceiros, como Open-Meteo e
        OpenWeatherMap, exclusivamente para fins de comparação e validação. Esses serviços têm
        seus próprios termos e políticas, pelos quais a plataforma não responde.
      </p>

      <Section>5. Disponibilidade</Section>
      <p>
        Buscamos manter o serviço disponível de forma contínua, mas não garantimos funcionamento
        ininterrupto. Interferências de rede, energia, manutenção das estações ou dos serviços de
        hospedagem podem afetar temporariamente a disponibilidade.
      </p>

      <Section>6. Propriedade intelectual</Section>
      <p>
        A marca EcoSense Monitor, o layout da plataforma e os códigos que a compõem pertencem à
        equipe responsável pelo projeto. Os dados coletados pelas estações permanecem sob a
        titularidade de quem os gerou.
      </p>

      <Section>7. Limitação de responsabilidade</Section>
      <p>
        O serviço é oferecido "no estado em que se encontra". Na máxima extensão permitida pela
        lei, a plataforma não responde por perdas ou danos decorrentes do uso dos dados,
        incluindo decisões tomadas com base nas informações apresentadas.
      </p>

      <Section>8. Alterações dos termos</Section>
      <p>
        Estes Termos podem ser atualizados a qualquer momento. A versão vigente é sempre a
        publicada nesta página, com a data de versão indicada no rodapé.
      </p>

      <Section>9. Contato</Section>
      <p>
        Dúvidas sobre estes Termos podem ser enviadas pela página{" "}
        <strong className="text-foreground">Contato</strong> da plataforma.
      </p>
    </LegalPage>
  );
}
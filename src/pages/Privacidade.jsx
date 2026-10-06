import React from "react";
import LegalPage, { Section } from "@/components/shared/LegalPage";

export default function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade">
      <p>
        Esta Política explica como o EcoSense Monitor coleta, usa e protege dados pessoais, em
        conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
      </p>

      <Section>1. Dados coletados</Section>
      <p>
        <strong className="text-foreground">Dados de conta:</strong> nome, e-mail e função
        (administrador/usuário) registrados quando você é convidado ou se cadastra na plataforma.
      </p>
      <p>
        <strong className="text-foreground">Telemetria das estações:</strong> leituras dos
        sensores (temperatura, umidade, pressão, UV, CO₂, bateria), coordenadas GPS, endereço IP
        local da placa, intensidade do sinal Wi-Fi e eventos de energia das estações físicas.
        Esses dados são operacionais e, em regra, não identificam pessoas.
      </p>
      <p>
        <strong className="text-foreground">Registros técnicos:</strong> logs do sistema
        (falhas de conexão, reinicializações e envios) utilizados para diagnóstico.
      </p>

      <Section>2. Finalidades do tratamento</Section>
      <p>
        Os dados são tratados para operar o serviço: exibir painéis e mapas, emitir alertas
        críticos, apoiar análises e comparações entre estações, registrar manutenções e custos e
        melhorar a confiabilidade da plataforma.
      </p>

      <Section>3. Compartilhamento</Section>
      <p>
        Não vendemos dados pessoais. Os dados podem ser compartilhados apenas com a infraestrutura
        de hospedagem da plataforma e com serviços públicos de comparação climática (Open-Meteo,
        OpenWeatherMap), consultados por coordenadas aproximadas da estação, sem vínculo direto
        com usuários individuais.
      </p>

      <Section>4. Retenção</Section>
      <p>
        As leituras e os logs são mantidos pelo período necessário à operação e às análises
        históricas. Dados de conta são removidos quando o usuário solicita a exclusão da conta
        pelas configurações da plataforma.
      </p>

      <Section>5. Seus direitos</Section>
      <p>
        Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção,
        anonimização, bloqueio ou eliminação de seus dados, além de informações sobre
        compartilhamentos. As solicitações devem ser encaminhadas pela página{" "}
        <strong className="text-foreground">Contato</strong>.
      </p>

      <Section>6. Segurança</Section>
      <p>
        A plataforma adota medidas técnicas e administrativas para proteger os dados, incluindo
        controle de acesso por funções, criptografia em trânsito e registros de auditoria.
      </p>

      <Section>7. Atualizações</Section>
      <p>
        Esta Política pode ser revisada para refletir mudanças no serviço ou na legislação. A
        versão vigente é a publicada nesta página, com a data indicada no rodapé.
      </p>
    </LegalPage>
  );
}
import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/ba582be09_10_Plano_Resposta_Incidentes_EcoSense_Monitor.docx";

export default function PlanoIncidentes() {
  return (
    <LegalPage
      title="Plano de Resposta a Incidentes de Segurança"
      docUrl={DOC_URL}
      docLabel="Baixar Plano de Resposta a Incidentes (.docx)"
    >
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026
      </p>

      <Section>1. Objetivo</Section>
      <p>
        Definir responsabilidades, critérios e etapas para identificar, conter, investigar, remediar,
        documentar e, quando necessário, comunicar incidentes de segurança envolvendo dados pessoais ou
        a infraestrutura do EcoSense Monitor.
      </p>

      <Section>2. Responsável e ponto de contato</Section>
      <p>Responsável pelo acionamento do plano: José Magno Pinheiro Alves. E-mail: jose.mpa@discente.ufma.br.</p>

      <Section>3. Exemplos de incidente</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>acesso não autorizado a conta Base44, Google, Apps Script ou planilha;</li>
        <li>exposição de credenciais, tokens ou senhas;</li>
        <li>planilha ou base de dados tornada pública indevidamente;</li>
        <li>vazamento de e-mails, identificadores ou coordenadas associáveis a pessoa;</li>
        <li>alteração maliciosa de dados, exclusão indevida ou ransomware;</li>
        <li>uso indevido de endpoint para inserir ou consultar dados;</li>
        <li>perda ou furto de dispositivo contendo cópias de dados; e</li>
        <li>incidente comunicado por fornecedor que possa afetar usuários do EcoSense Monitor.</li>
      </ul>

      <Section>4. Classificação inicial</Section>
      <div className="overflow-hidden rounded-lg border border-border/50 text-sm">
        <div className="grid grid-cols-2 gap-2 bg-muted/60 p-3 text-foreground font-semibold">
          <span>Nível / Exemplo</span>
          <span>Ação e prazo interno</span>
        </div>
        {[
          ["Baixo: erro sem exposição de dados pessoais", "corrigir e registrar — até 5 dias úteis"],
          [
            "Moderado: acesso limitado ou risco controlado",
            "conter, investigar e avaliar impacto — início imediato; avaliação em até 48h",
          ],
          [
            "Alto: exposição relevante, credencial administrativa ou dados de múltiplos usuários",
            "acionar plano integral, preservar evidências, avaliar comunicação — imediato; avaliação inicial em até 24h",
          ],
          [
            "Crítico: comprometimento amplo, risco elevado a titulares ou continuidade",
            "isolamento urgente, resposta prioritária, contato com fornecedores/autoridades quando aplicável — imediato e contínuo",
          ],
        ].map(([n, a]) => (
          <div key={n} className="grid grid-cols-2 gap-2 p-3 border-t border-border/50">
            <span className="text-foreground">{n}</span>
            <span>{a}</span>
          </div>
        ))}
      </div>

      <Section>5. Fluxo de resposta</Section>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Detectar e registrar data/hora, sistema afetado, origem do alerta e responsável pela análise.</li>
        <li>
          Conter: revogar tokens, trocar senhas, bloquear sessões, restringir acesso, desabilitar
          endpoint ou isolar componente conforme necessário.
        </li>
        <li>
          Preservar evidências: exportar logs, capturas e registros sem alterar desnecessariamente o
          ambiente.
        </li>
        <li>
          Identificar dados, titulares, volume, duração, provável origem, possibilidade de reversão e
          medidas já adotadas.
        </li>
        <li>
          Avaliar risco ou dano relevante aos titulares segundo natureza, sensibilidade, quantidade,
          facilidade de identificação, consequências e salvaguardas existentes.
        </li>
        <li>Corrigir causa raiz e validar retorno seguro à operação.</li>
        <li>Decidir e executar comunicações legais, contratuais e aos titulares.</li>
        <li>Registrar lições aprendidas e medidas preventivas.</li>
      </ol>

      <Section>6. Comunicação à ANPD e aos titulares</Section>
      <p>
        Nos termos da Resolução CD/ANPD nº 15/2024, quando o incidente puder acarretar risco ou dano
        relevante, a comunicação à ANPD e aos titulares deve observar o prazo regulatório aplicável,
        atualmente de 3 dias úteis para o controlador, ressalvadas hipóteses específicas e regras
        aplicáveis a agentes de pequeno porte. Como prática conservadora, o EcoSense Monitor adotará
        meta de avaliar comunicabilidade em até 24 horas e, quando exigível, preparar a comunicação sem
        utilizar prorrogações como padrão operacional.
      </p>
      <p>
        Se todas as informações não estiverem disponíveis, poderá ser necessária comunicação preliminar
        e posterior complementação, conforme regulamentação vigente.
      </p>

      <Section>7. Conteúdo mínimo do dossiê do incidente</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>data de detecção e, se conhecida, data de ocorrência;</li>
        <li>sistemas, fornecedores e contas envolvidos;</li>
        <li>categorias e volume aproximado de dados e titulares;</li>
        <li>causa provável e vetor de ataque;</li>
        <li>medidas de contenção e correção;</li>
        <li>avaliação de risco ou dano relevante;</li>
        <li>decisão fundamentada sobre comunicação;</li>
        <li>cópias das comunicações realizadas; e</li>
        <li>plano de prevenção de recorrência.</li>
      </ul>

      <Section>8. Preservação de registros</Section>
      <p>
        O registro de incidentes envolvendo dados pessoais deverá ser mantido por, no mínimo, 5 anos
        quando assim exigido pelo Regulamento de Comunicação de Incidente de Segurança, com acesso
        restrito e proteção adequada.
      </p>

      <Section>9. Contatos e fornecedores</Section>
      <p>
        Manter lista atualizada de contatos de segurança/suporte da Base44, Google e demais fornecedores
        utilizados. Incidentes originados em terceiros devem ser acompanhados até confirmação das
        medidas de mitigação relevantes ao projeto.
      </p>

      <Section>10. Pós-incidente</Section>
      <p>
        Após incidente moderado, alto ou crítico, realizar revisão de credenciais, regras de acesso,
        documentação, retenção, arquitetura e treinamento, atualizando a Matriz de Riscos e este Plano.
      </p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
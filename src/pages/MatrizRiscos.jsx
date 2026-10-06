import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/a596857a8_12_Matriz_Riscos_Avaliacao_Preliminar_Privacidade_EcoSense_Monitor.docx";

const MATRIZ = [
  [
    "Conta Google ou Base44 comprometida",
    "Médio",
    "Alto",
    "Alto",
    "MFA, senhas exclusivas, revisão de sessões, menor privilégio",
    "Médio",
    "ativar MFA e revisar acessos trimestralmente",
  ],
  [
    "Credenciais Wi-Fi/API expostas em código ou repositório",
    "Médio",
    "Alto",
    "Alto",
    "secrets separados, código público com placeholders, rotação",
    "Médio",
    "não publicar firmware com credenciais reais",
  ],
  [
    "Planilha com dados pessoais compartilhada publicamente",
    "Médio",
    "Alto",
    "Alto",
    "ACL restrita, revisão de compartilhamentos",
    "Baixo-Médio",
    "auditar permissões Google Sheets",
  ],
  [
    "Coordenada GPS revelar residência ou rotina",
    "Médio",
    "Médio-Alto",
    "Alto",
    "reduzir precisão, restringir mapa, avaliar necessidade",
    "Médio",
    "coarsening quando a precisão exata não for científica",
  ],
  [
    "Endpoint de Apps Script abusado ou recebe dados falsos",
    "Médio",
    "Médio",
    "Médio",
    "validação, rate limit quando possível, autenticação/segredo, logs",
    "Médio",
    "avaliar mecanismo de autenticação da estação",
  ],
  [
    "Retenção excessiva de contas/logs",
    "Médio",
    "Médio",
    "Médio",
    "tabela de retenção e revisão periódica",
    "Baixo",
    "automatizar limpeza quando possível",
  ],
  [
    "Fornecedor internacional altera região/subprocessadores",
    "Médio",
    "Médio",
    "Médio",
    "revisão de DPA, subprocessadores e aviso internacional",
    "Médio",
    "revisão semestral de Base44/Google",
  ],
  [
    "Indisponibilidade durante Deep Sleep interpretada como falha",
    "Alto",
    "Baixo",
    "Médio",
    "estado_energia/evento_energia no dashboard",
    "Baixo",
    "manter UI consciente do ciclo 10/10",
  ],
  [
    "Medições ambientais usadas em decisão crítica",
    "Baixo-Médio",
    "Alto",
    "Alto",
    "aviso legal, metodologia, limitações e validação",
    "Médio",
    "manter disclaimer visível no dashboard",
  ],
  [
    "Incidente não comunicado no prazo",
    "Baixo-Médio",
    "Alto",
    "Alto",
    "plano de incidentes, contato, meta interna 24h",
    "Médio",
    "simulado anual e checklist de comunicação",
  ],
];

export default function MatrizRiscos() {
  return (
    <LegalPage
      title="Matriz de Riscos e Avaliação Preliminar de Impacto à Privacidade"
      docUrl={DOC_URL}
      docLabel="Baixar Matriz de Riscos (.docx)"
    >
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026
      </p>

      <Section>1. Objetivo</Section>
      <p>
        Registrar riscos previsíveis relacionados a privacidade, proteção de dados, segurança e uso
        indevido das informações do EcoSense Monitor, bem como controles existentes ou recomendados.
        Este documento é avaliação preliminar e não substitui eventual Relatório de Impacto à Proteção
        de Dados Pessoais formal quando exigido pela ANPD ou quando o tratamento assumir alto risco.
      </p>

      <Section>2. Contexto do tratamento</Section>
      <p>
        O EcoSense Monitor é projeto de pesquisa de pessoa física, com autenticação por conta Google e
        processamento de telemetria ambiental. Não há, nesta versão, publicidade, analytics
        comportamental, venda de dados ou decisão automatizada de efeitos relevantes. Os principais
        elementos pessoais são dados de conta, logs técnicos e, em determinados contextos, coordenadas
        da estação.
      </p>

      <Section>3. Critério de risco</Section>
      <p>
        Probabilidade e impacto são classificados como Baixo, Médio ou Alto. O risco residual considera
        os controles propostos. O responsável deve priorizar riscos altos e revisar os médios
        periodicamente.
      </p>

      <Section>4. Matriz</Section>
      <div className="overflow-x-auto rounded-lg border border-border/50 text-xs" style={{ touchAction: "pan-x" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/60 text-foreground">
              {["Risco", "Prob.", "Impacto", "Nível inicial", "Controles", "Risco residual", "Ação prioritária"].map(
                (h) => (
                  <th key={h} className="p-2 text-left font-semibold align-top">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {MATRIZ.map((row) => (
              <tr key={row[0]} className="border-t border-border/50 align-top">
                {row.map((cell, i) => (
                  <td key={i} className={`p-2 ${i === 0 ? "text-foreground font-medium" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Section>5. Avaliação de alto risco</Section>
      <p>
        No cenário informado, o tratamento não aparenta envolver, de forma ordinária, dados sensíveis em
        larga escala, vigilância sistemática de pessoas, perfilamento comportamental, decisão
        automatizada relevante ou público infantil. Entretanto, a publicação de coordenadas exatas de
        estação localizada em residência privada, a ampliação do número de usuários ou a inclusão de
        dados sensíveis pode elevar significativamente o risco e exigir reavaliação antes da
        implementação.
      </p>

      <Section>6. Recomendações prioritárias</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>Ativar MFA nas contas administrativas e manter contas individuais.</li>
        <li>Revisar permissões da planilha e da Base44; impedir acesso público indevido.</li>
        <li>Manter credenciais reais fora de versões de firmware/código compartilhadas.</li>
        <li>
          Confirmar os escopos OAuth Google e limitar a openid/email/profile se apenas autenticação for
          necessária.
        </li>
        <li>
          Avaliar se a coordenada exata da estação precisa ser pública; reduzir precisão quando não for
          essencial.
        </li>
        <li>Revisar o DPA e subprocessadores da Base44 e documentar mecanismo de transferência internacional.</li>
        <li>
          Executar revisão do pacote jurídico sempre que analytics, publicidade, novos sensores ou
          novos perfis de usuário forem adicionados.
        </li>
        <li>Realizar simulado anual de incidente e revisar o ROPA.</li>
      </ul>

      <Section>7. Conclusão</Section>
      <p>
        O risco residual é administrável para um protótipo de pesquisa de pequeno porte, desde que
        sejam implementados os controles prioritários acima e mantida revisão periódica. A principal
        concentração de risco está em credenciais, controle de acesso, exposição de coordenadas e
        dependência de fornecedores externos.
      </p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/fab6c1ca6_11_ROPA_Registro_Operacoes_Tratamento_EcoSense_Monitor.docx";

const OPERACOES = [
  [
    "Cadastro/login Google",
    "usuários",
    "nome, e-mail, ID Google, foto se disponibilizada, sessão",
    "autenticar e manter conta",
    "art. 7º V; segurança art. 7º IX quando aplicável",
    "Google; Base44",
    "conta ativa + eliminação operacional após encerramento",
    "baixo-médio",
  ],
  [
    "Logs e segurança",
    "usuários/visitantes",
    "IP, data/hora, eventos de login, dispositivo quando gerado",
    "segurança, fraude, diagnóstico",
    "legítimo interesse; obrigação legal quando aplicável",
    "Base44; Google/infraestrutura",
    "6 meses como padrão interno",
    "médio",
  ],
  [
    "Telemetria ambiental",
    "eventualmente pessoas ligadas à estação",
    "temperatura, umidade, pressão, sensores, GPS, Wi-Fi, Deep Sleep",
    "pesquisa e monitoramento técnico",
    "não pessoal em regra; se pessoal, base definida conforme caso",
    "Google Apps Script/Sheets; Base44 se exibido",
    "durante pesquisa; anonimização quando cabível",
    "baixo-médio",
  ],
  [
    "Coordenadas da estação",
    "eventualmente morador/proprietário/local privado",
    "latitude/longitude/altitude",
    "mapa e contextualização ambiental",
    "se pessoal: legítimo interesse ou consentimento conforme contexto",
    "Google/serviço de mapa; Base44",
    "enquanto necessário; revisar precisão anualmente",
    "médio",
  ],
  [
    "Suporte/contato",
    "usuários",
    "nome, e-mail, conteúdo da mensagem",
    "responder solicitações",
    "execução de relação de uso; legítimo interesse",
    "provedor de e-mail",
    "até 24 meses, salvo necessidade",
    "baixo",
  ],
  [
    "Direitos LGPD",
    "titulares",
    "identificação mínima, pedido, resposta",
    "cumprir LGPD e demonstrar atendimento",
    "obrigação legal",
    "fornecedores necessários quando imprescindível",
    "5 anos como política interna",
    "baixo",
  ],
  [
    "Incidentes",
    "titulares afetados",
    "dados do incidente, logs, impacto, comunicações",
    "resposta, comunicação e accountability",
    "obrigação legal; exercício de direitos",
    "ANPD, titulares, fornecedores",
    "mínimo 5 anos quando aplicável",
    "médio-alto",
  ],
];

export default function ROPA() {
  return (
    <LegalPage
      title="Registro das Operações de Tratamento (ROPA)"
      docUrl={DOC_URL}
      docLabel="Baixar ROPA (.docx)"
    >
      <p className="text-foreground font-semibold">
        Registro Simplificado das Operações de Tratamento - ROPA
      </p>
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026
      </p>

      <Section>1. Identificação do controlador</Section>
      <p>
        Controlador: José Magno Pinheiro Alves, pessoa física, responsável pelo projeto de pesquisa
        EcoSense Monitor. Contato: jose.mpa@discente.ufma.br. Aplicação: https://ecosensemonitorapp.base44.app.
      </p>

      <Section>2. Observação sobre atividade de pesquisa</Section>
      <p>
        O projeto é conduzido por pessoa física. Conforme orientação da ANPD, agentes que realizam
        pesquisa e não se enquadram no conceito legal de órgão de pesquisa podem tratar dados pessoais
        para fins acadêmicos ou de pesquisa, desde que a situação concreta esteja amparada em outra
        hipótese legal válida. Assim, este ROPA não utiliza “pesquisa” como base legal autônoma para
        dados pessoais do aplicativo.
      </p>

      <Section>3. Inventário de operações</Section>
      <div className="overflow-x-auto rounded-lg border border-border/50 text-xs" style={{ touchAction: "pan-x" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/60 text-foreground">
              {["Operação", "Titulares", "Dados", "Finalidade", "Base legal", "Compartilhamento", "Retenção", "Risco"].map(
                (h) => (
                  <th key={h} className="p-2 text-left font-semibold align-top">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {OPERACOES.map((row) => (
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

      <Section>4. Categorias de destinatários e fornecedores</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <span className="text-foreground">Base44:</span> desenvolvimento/hospedagem e serviços de
          infraestrutura, com papel contratual que pode incluir operação de dados de usuários do
          aplicativo;
        </li>
        <li>
          <span className="text-foreground">Google:</span> identidade, autenticação e, conforme
          arquitetura, Apps Script e Sheets; papel jurídico varia por serviço;
        </li>
        <li>
          <span className="text-foreground">Autoridades públicas:</span> apenas quando houver obrigação
          legal, ordem válida ou exercício regular de direitos; e
        </li>
        <li>
          <span className="text-foreground">outros fornecedores:</span> somente após avaliação de
          necessidade, segurança e atualização do inventário.
        </li>
      </ul>

      <Section>5. Transferências internacionais</Section>
      <p>
        Há potencial transferência internacional em razão de Base44 e Google. A Base44 informa
        armazenamento padrão de dados de apps nos Estados Unidos. Devem ser avaliados e documentados os
        mecanismos válidos da Resolução CD/ANPD nº 19/2024.
      </p>

      <Section>6. Dados sensíveis e crianças</Section>
      <p>
        Não há intenção de coletar dados pessoais sensíveis pelo fluxo ordinário. O aplicativo não é
        direcionado especificamente a crianças. Caso a pesquisa passe a envolver dados sensíveis,
        crianças/adolescentes ou seres humanos de forma sistemática, este ROPA e a avaliação de impacto
        deverão ser revistos antes da coleta.
      </p>

      <Section>7. Encarregado/canal</Section>
      <p>
        Considerando o enquadramento possível como agente de tratamento de pequeno porte e a Resolução
        CD/ANPD nº 2/2022, a indicação formal de encarregado pode ser dispensada quando os requisitos
        da norma forem atendidos, mas deve existir canal de comunicação com titulares. O canal adotado
        é jose.mpa@discente.ufma.br.
      </p>

      <Section>8. Revisão</Section>
      <p>
        Revisar trimestralmente durante desenvolvimento ativo e, após estabilização, ao menos anualmente
        ou sempre que houver novo fornecedor, nova categoria de dado ou mudança de finalidade.
      </p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
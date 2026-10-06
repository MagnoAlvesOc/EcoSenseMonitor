import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/86083b39f_02_Politica_de_Privacidade_EcoSense_Monitor.docx";

export default function Privacidade() {
  return (
    <LegalPage
      title="Política de Privacidade"
      docUrl={DOC_URL}
      docLabel="Baixar Política de Privacidade (.docx)"
    >
      <p className="text-foreground font-semibold">
        Política de Privacidade e Proteção de Dados Pessoais
      </p>
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Escopo e compromisso</Section>
      <p>
        Esta Política descreve como o EcoSense Monitor trata dados pessoais de usuários, visitantes e
        pessoas que interajam com a aplicação. O responsável pelo tratamento é José Magno Pinheiro
        Alves, pessoa física, que conduz o aplicativo como projeto de pesquisa. O canal para assuntos de
        privacidade é jose.mpa@discente.ufma.br.
      </p>
      <p>
        A Política aplica-se aos tratamentos realizados diretamente pelo projeto e deve ser lida em
        conjunto com os Termos de Uso, Política de Cookies, Aviso de Login com Google e Aviso de
        Transferência Internacional de Dados.
      </p>

      <Section>2. Papel do responsável e enquadramento</Section>
      <p>
        Nas operações em que define as finalidades e elementos essenciais do tratamento, o responsável
        atua como controlador. Fornecedores tecnológicos podem atuar como operadores em determinadas
        operações ou como controladores independentes em atividades próprias, conforme o serviço e os
        respectivos contratos.
      </p>
      <p>
        Por se tratar de projeto conduzido por pessoa física, não se presume automaticamente a condição
        legal de “órgão de pesquisa” prevista na LGPD. Quando houver tratamento de dados pessoais para
        fins acadêmicos ou de pesquisa, será adotada base legal adequada à situação concreta, como
        execução de contrato/procedimentos a pedido do titular, consentimento, legítimo interesse ou
        outra hipótese aplicável. A finalidade acadêmica, por si só, não elimina a necessidade de base
        legal.
      </p>

      <Section>3. Categorias de dados tratados</Section>
      <p className="text-foreground font-medium">3.1. Dados de cadastro e autenticação</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          dados básicos fornecidos ou disponibilizados pela conta Google nos escopos efetivamente
          autorizados, como nome, endereço de e-mail, identificador da conta e, quando disponibilizada,
          fotografia de perfil;
        </li>
        <li>
          identificadores internos de usuário, status de autenticação, data de criação e último acesso,
          quando mantidos pela plataforma; e
        </li>
        <li>informações estritamente necessárias à gestão da sessão e segurança da conta.</li>
      </ul>
      <p className="text-foreground font-medium">3.2. Dados técnicos de uso e segurança</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          endereço IP, data e hora, navegador, sistema operacional, identificadores técnicos, registros
          de autenticação e eventos de segurança, na medida em que sejam gerados pela infraestrutura;
        </li>
        <li>
          cookies ou tecnologias equivalentes necessárias à autenticação, sessão, prevenção de fraude e
          funcionamento do aplicativo; e
        </li>
        <li>logs necessários à investigação de erros, disponibilidade e segurança.</li>
      </ul>
      <p className="text-foreground font-medium">3.3. Dados ambientais e de telemetria</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>identificação e nome da estação;</li>
        <li>temperatura, umidade, pressão atmosférica, altitude, aceleração, giroscópio e intensidade de sinal;</li>
        <li>GPS da estação, incluindo latitude, longitude, altitude, velocidade, satélites, HDOP, data e hora;</li>
        <li>estado de energia, eventos de Deep Sleep, ciclos, motivo de despertar, tempo ativo e tempo de repouso; e</li>
        <li>outros dados técnicos que venham a ser incorporados ao protótipo mediante atualização da documentação.</li>
      </ul>
      <p>
        Dados ambientais e telemétricos nem sempre constituem dados pessoais. Contudo, serão tratados
        como dados pessoais quando puderem ser relacionados, direta ou indiretamente, a pessoa natural
        identificada ou identificável, por exemplo quando coordenadas revelem endereço residencial ou
        rotina individual.
      </p>

      <Section>4. Fontes dos dados</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>usuário, ao autenticar-se ou entrar em contato;</li>
        <li>Google, quando o usuário escolhe a autenticação por conta Google e autoriza os escopos apresentados;</li>
        <li>estações EcoSense e sensores conectados; e</li>
        <li>infraestrutura técnica e fornecedores, quanto a logs, sessão, disponibilidade e segurança.</li>
      </ul>

      <Section>5. Finalidades e bases legais</Section>
      <div className="overflow-hidden rounded-lg border border-border/50 text-sm">
        <div className="grid grid-cols-3 gap-2 bg-muted/60 p-3 text-foreground font-semibold">
          <span>Finalidade</span>
          <span>Dados principais</span>
          <span>Base legal principal</span>
        </div>
        {[
          [
            "Criar e autenticar conta",
            "nome, e-mail, identificador Google, sessão",
            "execução de contrato ou procedimentos a pedido do titular (art. 7º, V, LGPD)",
          ],
          [
            "Exibir e operar o dashboard",
            "identificadores da conta e dados técnicos",
            "execução de contrato/procedimentos; legítimo interesse quando estritamente necessário",
          ],
          [
            "Segurança, prevenção a abuso e diagnóstico",
            "IP, logs, eventos, identificadores técnicos",
            "legítimo interesse (art. 7º, IX) e cumprimento de obrigações legais quando aplicável",
          ],
          [
            "Pesquisa e análise técnica",
            "telemetria ambiental; eventualmente dados vinculáveis a usuário",
            "base legal definida conforme o caso concreto",
          ],
          [
            "Atender solicitações LGPD",
            "dados do solicitante e histórico do pedido",
            "cumprimento de obrigação legal/regulatória (art. 7º, II)",
          ],
          [
            "Comunicar incidentes e defender direitos",
            "dados afetados, registros e evidências",
            "obrigação legal/regulatória e exercício regular de direitos",
          ],
        ].map(([f, d, b]) => (
          <div key={f} className="grid grid-cols-3 gap-2 p-3 border-t border-border/50">
            <span className="text-foreground">{f}</span>
            <span>{d}</span>
            <span>{b}</span>
          </div>
        ))}
      </div>
      <p className="text-xs">
        Observações: a autenticação é necessária para disponibilizar áreas restritas; o uso para
        segurança é limitado à prestação e integridade do serviço; para pessoa física pesquisadora, a
        finalidade acadêmica não substitui base legal.
      </p>

      <Section>6. Login com Google</Section>
      <p>
        Quando o usuário seleciona “Entrar com Google”, o fluxo de autenticação é realizado pelo
        provedor de identidade. O projeto não recebe a senha da conta Google. A aplicação deve solicitar
        apenas escopos compatíveis com autenticação, preferencialmente openid, email e profile, ou
        equivalentes mínimos oferecidos pela plataforma. O usuário pode revogar permissões no ambiente
        de sua Conta Google.
      </p>
      <p>
        O projeto não declara acesso a Gmail, Google Drive, Google Agenda, contatos ou outros conteúdos
        da conta. Se qualquer desses escopos vier a ser solicitado, será necessária atualização prévia
        desta Política, revisão de necessidade e adequação do consentimento/autorização.
      </p>

      <Section>7. Compartilhamento e operadores</Section>
      <p>
        Os dados podem ser compartilhados ou disponibilizados, no limite necessário, a provedores que
        sustentam a operação do aplicativo. Na data desta Política, a infraestrutura informada inclui
        Base44 para desenvolvimento/hospedagem e serviços Google para autenticação e integrações como
        Apps Script/Sheets. A função jurídica de cada fornecedor depende do serviço concreto e de seus
        termos.
      </p>
      <p>
        A Base44 informa, em seu DPA, que pode processar dados de usuários do aplicativo em nome do
        cliente para fornecer os serviços, e mantém lista de subprocessadores. O responsável deve manter
        registro atualizado dos fornecedores e revisar mudanças relevantes.
      </p>

      <Section>8. Transferência internacional</Section>
      <p>
        O uso de Base44 e serviços Google pode envolver processamento ou armazenamento fora do Brasil. A
        Base44 informa que, por padrão, dados de aplicativos podem ser armazenados nos Estados Unidos.
        Transferências internacionais serão tratadas conforme os mecanismos previstos na LGPD e na
        Resolução CD/ANPD nº 19/2024. Informações adicionais constam no Aviso de Transferência
        Internacional de Dados.
      </p>

      <Section>9. Retenção e eliminação</Section>
      <p>
        Os dados serão conservados apenas pelo período necessário às finalidades informadas, ao
        cumprimento de obrigações legais, segurança, auditoria, pesquisa ou exercício de direitos.
        Prazos operacionais e critérios de descarte constam da Política de Retenção. Dados pessoais
        associados a conta encerrada serão eliminados ou anonimizados em prazo razoável, ressalvadas
        hipóteses legítimas de conservação e cópias temporárias de backup.
      </p>

      <Section>10. Direitos dos titulares</Section>
      <p>
        Nos termos da LGPD, conforme aplicável, o titular pode solicitar confirmação da existência de
        tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados excessivos ou
        tratados em desconformidade, portabilidade nos termos da regulamentação, informação sobre
        compartilhamentos, informação sobre possibilidade de negar consentimento e suas consequências,
        revogação do consentimento, eliminação de dados tratados com consentimento nas hipóteses
        legais, oposição e revisão de decisões automatizadas quando cabível.
      </p>
      <p>
        As solicitações devem ser encaminhadas a jose.mpa@discente.ufma.br. Poderão ser solicitadas
        informações razoáveis para confirmar a identidade do requerente, evitando entrega de dados a
        terceiros não autorizados.
      </p>

      <Section>11. Decisões automatizadas e perfilamento</Section>
      <p>
        Na data desta versão, o EcoSense Monitor não informa utilizar decisão automatizada destinada a
        produzir efeitos jurídicos ou impactos relevantes sobre usuários, nem perfilamento
        comportamental para publicidade. Caso tal funcionalidade seja adicionada, será realizada nova
        avaliação de impacto e atualização desta Política.
      </p>

      <Section>12. Crianças e adolescentes</Section>
      <p>
        O aplicativo não é direcionado especificamente à coleta de dados pessoais de crianças. Caso o
        projeto venha a tratar dados de crianças ou adolescentes, deverão ser implementadas salvaguardas
        compatíveis com o art. 14 da LGPD, o melhor interesse e, quando aplicável, exigências éticas de
        pesquisa.
      </p>

      <Section>13. Segurança</Section>
      <p>
        São adotadas ou previstas medidas proporcionais ao risco, incluindo controle de acesso,
        autenticação, princípio do menor privilégio, gestão de segredos, atualização de software,
        criptografia em trânsito, backups quando disponíveis, monitoramento de incidentes e restrição
        de compartilhamento. Nenhum sistema conectado à Internet é absolutamente imune a falhas, motivo
        pelo qual a segurança é tratada como processo contínuo.
      </p>

      <Section>14. Incidentes de segurança</Section>
      <p>
        Incidentes envolvendo dados pessoais serão avaliados conforme a LGPD e o Regulamento de
        Comunicação de Incidente de Segurança. Quando houver risco ou dano relevante, o controlador
        realizará as comunicações exigidas à ANPD e aos titulares dentro do prazo regulatório aplicável,
        adotando internamente meta mais conservadora sempre que possível.
      </p>

      <Section>15. Cookies, analytics e publicidade</Section>
      <p>
        Na data desta versão, o responsável não implementa publicidade, pixels de marketing ou
        ferramenta própria de analytics. Podem existir cookies e registros estritamente necessários à
        autenticação, sessão, segurança e funcionamento fornecidos pela Base44, Google ou navegador. Se
        cookies não necessários, analytics ou publicidade forem futuramente implementados, a Política de
        Cookies e os controles de consentimento serão revistos.
      </p>

      <Section>16. Atualizações</Section>
      <p>
        Esta Política poderá ser atualizada para refletir mudanças do projeto, novas integrações,
        fornecedores, funcionalidades ou normas. Alterações materialmente relevantes serão destacadas
        ou comunicadas por meio razoável.
      </p>

      <Section>17. Contato e canal do titular</Section>
      <p>
        Responsável/controlador: José Magno Pinheiro Alves. E-mail para privacidade e exercício de
        direitos: jose.mpa@discente.ufma.br. CPF completo consta dos registros internos de governança do
        projeto e poderá ser apresentado quando juridicamente necessário, sem exposição pública
        desnecessária.
      </p>

      <BaseNormativa
        itens={BASE_NORMATIVA_COMPLETA}
        extra={
          <>
            <li>Política de Privacidade e DPA da Base44, consultados em outubro de 2026.</li>
            <li>Documentação Google Identity Services/OpenID Connect sobre escopos de autenticação.</li>
          </>
        }
      />
    </LegalPage>
  );
}
import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/8cf98d012_04_Aviso_Login_Google_EcoSense_Monitor.docx";

export default function AvisoLoginGoogle() {
  return (
    <LegalPage
      title="Aviso de Privacidade - Login com Google"
      docUrl={DOC_URL}
      docLabel="Baixar Aviso de Login com Google (.docx)"
    >
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Finalidade do aviso</Section>
      <p>
        Este aviso apresenta, de forma específica e destacada, como ocorre a autenticação por conta
        Google no EcoSense Monitor. Ele complementa a Política de Privacidade e os Termos de Uso.
      </p>

      <Section>2. Como funciona</Section>
      <p>
        Ao selecionar a opção “Entrar com Google”, o usuário é direcionado ao fluxo de autenticação do
        Google ou de serviço integrado que utiliza Google Identity. O usuário escolhe a conta e
        visualiza as permissões solicitadas. O EcoSense Monitor não recebe a senha da conta Google.
      </p>

      <Section>3. Dados que podem ser recebidos</Section>
      <p>
        Para autenticação básica, os escopos usualmente utilizados pelo Google Identity Services são
        openid, email e profile. Conforme os escopos efetivamente configurados e autorizados, o
        aplicativo pode receber nome, endereço de e-mail, identificador exclusivo da conta e fotografia
        de perfil. A tela de consentimento do Google é a referência para os dados efetivamente
        autorizados em cada acesso.
      </p>

      <Section>4. Finalidades</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>criar ou reconhecer a conta de usuário;</li>
        <li>permitir acesso seguro às áreas autenticadas;</li>
        <li>associar preferências e permissões à conta;</li>
        <li>proteger a aplicação contra abuso e acesso indevido; e</li>
        <li>atender solicitações de suporte ou privacidade relacionadas à conta.</li>
      </ul>

      <Section>5. O que o projeto não solicita atualmente</Section>
      <p>
        Segundo o cenário informado para esta versão, o login é utilizado para autenticação. O projeto
        não declara solicitar acesso ao conteúdo de Gmail, Google Drive, Google Agenda, contatos, fotos
        ou outros recursos além dos dados de identidade estritamente necessários. Qualquer ampliação
        deverá ser precedida de revisão técnica e jurídica, princípio da minimização e atualização das
        informações ao usuário.
      </p>

      <Section>6. Base legal</Section>
      <p>
        O tratamento dos dados estritamente necessários ao cadastro e autenticação é realizado, em
        regra, para viabilizar procedimentos solicitados pelo próprio usuário e a execução da relação de
        uso do serviço, sem prejuízo de outras bases aplicáveis a operações específicas, como segurança
        e cumprimento de obrigação legal.
      </p>

      <Section>7. Revogação e desvinculação</Section>
      <p>
        O usuário pode revogar o acesso concedido ao aplicativo por meio das configurações da Conta
        Google. A revogação poderá impedir novo login até que a autorização seja concedida novamente. O
        usuário também poderá solicitar o encerramento da conta do EcoSense Monitor pelo canal de
        privacidade.
      </p>

      <Section>8. Segurança</Section>
      <p>
        O responsável deve manter configuração de OAuth/Sign-In com escopos mínimos, URLs de
        redirecionamento autorizadas, segredos protegidos e revisão periódica das permissões. Tokens e
        credenciais não devem ser publicados em código-fonte aberto, páginas públicas ou repositórios
        desprotegidos.
      </p>

      <Section>9. Terceiros</Section>
      <p>
        O tratamento realizado diretamente pelo Google está sujeito às políticas e termos do próprio
        provedor. O EcoSense Monitor trata apenas as informações recebidas no limite necessário às
        finalidades descritas nesta documentação.
      </p>

      <Section>10. Contato</Section>
      <p>Privacidade e conta: jose.mpa@discente.ufma.br.</p>

      <BaseNormativa
        itens={BASE_NORMATIVA_COMPLETA}
        extra={<li>Documentação Google Identity Services sobre OpenID Connect e escopos de autenticação.</li>}
      />
    </LegalPage>
  );
}
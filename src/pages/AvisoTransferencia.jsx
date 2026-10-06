import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/97c122b2d_05_Aviso_Transferencia_Internacional_EcoSense_Monitor.docx";

export default function AvisoTransferencia() {
  return (
    <LegalPage
      title="Aviso de Transferência Internacional de Dados"
      docUrl={DOC_URL}
      docLabel="Baixar Aviso de Transferência Internacional (.docx)"
    >
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Finalidade e fundamento</Section>
      <p>
        Este Aviso fornece transparência específica sobre operações que podem caracterizar
        transferência internacional de dados pessoais no EcoSense Monitor, em conformidade com a LGPD e
        com a Resolução CD/ANPD nº 19/2024.
      </p>

      <Section>2. Controlador</Section>
      <p>
        Controlador: José Magno Pinheiro Alves, pessoa física, responsável pelo projeto EcoSense
        Monitor. Canal de contato: jose.mpa@discente.ufma.br.
      </p>

      <Section>3. Fornecedores e destinos</Section>
      <p>
        O aplicativo utiliza infraestrutura de terceiros que pode tratar dados fora do Brasil. A Base44
        informa publicamente que, por padrão, dados de aplicativos podem ser armazenados nos Estados
        Unidos e mantém diretório de subprocessadores em diferentes jurisdições. Serviços Google também
        podem envolver infraestrutura internacional de acordo com o produto, configuração e contrato
        aplicáveis.
      </p>
      <p>
        Em razão de mudanças de arquitetura, subprocessadores ou regiões de hospedagem, os países
        efetivos poderão variar. O responsável deverá revisar periodicamente a documentação dos
        fornecedores e atualizar este Aviso quando houver alteração material.
      </p>

      <Section>4. Dados potencialmente transferidos</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          dados de cadastro e autenticação, como nome, e-mail, identificador de conta e fotografia de
          perfil quando disponibilizada;
        </li>
        <li>identificadores de sessão, endereço IP, logs e dados técnicos de segurança;</li>
        <li>dados de suporte e solicitações enviadas pelo usuário; e</li>
        <li>
          quando armazenados ou processados pela infraestrutura internacional, dados de telemetria
          associados a identificadores ou coordenadas que possam ser considerados pessoais.
        </li>
      </ul>

      <Section>5. Finalidades</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>hospedagem e disponibilização do aplicativo;</li>
        <li>autenticação e gestão de sessão;</li>
        <li>armazenamento e processamento de dados;</li>
        <li>segurança, prevenção a fraude, logs e diagnóstico; e</li>
        <li>suporte técnico, continuidade e manutenção da infraestrutura.</li>
      </ul>

      <Section>6. Mecanismos jurídicos e salvaguardas</Section>
      <p>
        As transferências internacionais somente deverão ocorrer mediante fundamento legal para o
        tratamento e mecanismo válido de transferência internacional, conforme o art. 33 da LGPD e a
        Resolução CD/ANPD nº 19/2024. Conforme o caso, poderão ser utilizados decisão de adequação,
        cláusulas-padrão contratuais aprovadas pela ANPD, cláusulas específicas, normas corporativas
        globais ou outro mecanismo legalmente permitido.
      </p>
      <p>
        O responsável deverá avaliar os contratos e DPAs dos fornecedores e, quando necessário,
        providenciar incorporação das cláusulas-padrão nacionais ou outro mecanismo válido. A mera
        utilização de fornecedor estrangeiro não dispensa essa avaliação.
      </p>

      <Section>7. Medidas de segurança</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>criptografia em trânsito por HTTPS/TLS sempre que suportada;</li>
        <li>controle de acesso, autenticação e princípio do menor privilégio;</li>
        <li>
          uso de fornecedores com controles formais de segurança e acordos de processamento de dados
          quando disponíveis;
        </li>
        <li>restrição de escopos OAuth e minimização de dados; e</li>
        <li>revisão periódica de subprocessadores, configurações e regiões de hospedagem.</li>
      </ul>

      <Section>8. Direitos do titular</Section>
      <p>
        O titular pode solicitar informações sobre o tratamento, destinatários, mecanismos de
        transferência e exercer os demais direitos previstos na LGPD pelo e-mail
        jose.mpa@discente.ufma.br. Também poderá peticionar perante a ANPD nos casos previstos na
        legislação.
      </p>

      <Section>9. Período da transferência</Section>
      <p>
        O processamento internacional ocorrerá enquanto for necessário para disponibilizar os serviços e
        manter os dados conforme os prazos de retenção aplicáveis. Encerrada a finalidade, os dados
        serão eliminados ou anonimizados, ressalvadas obrigações legais, defesa de direitos, backups
        temporários e outras hipóteses legítimas.
      </p>

      <Section>10. Revisão</Section>
      <p>
        Este Aviso deverá ser revisto sempre que houver mudança de fornecedor, país de hospedagem,
        subprocessador, categoria de dado ou mecanismo jurídico de transferência.
      </p>

      <BaseNormativa
        itens={BASE_NORMATIVA_COMPLETA}
        extra={
          <>
            <li>Resolução CD/ANPD nº 19/2024, especialmente regras de transparência e mecanismos de transferência.</li>
            <li>Política de Privacidade, DPA e página de Segurança da Base44 consultadas em outubro de 2026.</li>
          </>
        }
      />
    </LegalPage>
  );
}
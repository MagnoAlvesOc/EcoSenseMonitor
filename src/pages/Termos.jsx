import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/6014121f2_01_Termos_de_Uso_EcoSense_Monitor.docx";

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso" docUrl={DOC_URL} docLabel="Baixar Termos de Uso (.docx)">
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Objeto e aceitação</Section>
      <p>
        Estes Termos de Uso disciplinam o acesso e a utilização do EcoSense Monitor, aplicação web
        disponível em https://ecosensemonitorapp.base44.app, desenvolvida no contexto de projeto de
        pesquisa de responsabilidade de José Magno Pinheiro Alves. Ao criar conta, acessar áreas
        autenticadas ou utilizar funcionalidades da aplicação, o usuário declara ter lido e compreendido
        estes Termos e a Política de Privacidade vinculada.
      </p>
      <p>
        O EcoSense Monitor tem finalidade principal de coleta, organização, visualização e
        acompanhamento de dados ambientais e telemétricos provenientes de estações e sensores
        conectados, podendo ser utilizado para atividades de pesquisa, experimentação técnica,
        demonstração, ensino, validação de protótipos e análise de funcionamento do sistema.
      </p>

      <Section>2. Identificação do responsável</Section>
      <p>
        Responsável pelo projeto: José Magno Pinheiro Alves, pessoa física. Canal oficial de contato e
        privacidade: jose.mpa@discente.ufma.br. O projeto não se apresenta como serviço institucional da
        UFMA; eventual utilização de e-mail acadêmico do responsável não implica patrocínio, chancela ou
        responsabilidade institucional da Universidade, salvo instrumento formal em sentido diverso.
      </p>

      <Section>3. Cadastro e autenticação</Section>
      <p>
        O acesso a determinadas áreas pode exigir autenticação por conta Google. O usuário é responsável
        por manter a segurança da própria conta Google, adotar autenticação multifator quando disponível
        e impedir uso indevido de sua sessão.
      </p>
      <p>
        O EcoSense Monitor não recebe nem armazena a senha da conta Google. A autenticação deve
        limitar-se aos dados e escopos necessários ao login e identificação básica do usuário. Caso
        novas permissões sejam futuramente solicitadas, o usuário deverá ser informado de forma clara e
        os documentos jurídicos deverão ser atualizados antes da ampliação do tratamento.
      </p>

      <Section>4. Elegibilidade e uso por menores</Section>
      <p>
        O aplicativo não é direcionado especificamente a crianças. O cadastro por menores de idade
        somente deverá ocorrer quando houver autorização e base jurídica compatíveis com a legislação
        aplicável e, quando o contexto envolver pesquisa com seres humanos, observância das exigências
        éticas e institucionais pertinentes. Na ausência dessas condições, o uso autenticado é destinado
        a pessoas com 18 anos ou mais.
      </p>

      <Section>5. Funcionalidades e natureza dos dados</Section>
      <p>
        A aplicação pode receber e apresentar temperatura, umidade relativa, pressão atmosférica,
        altitude, coordenadas geográficas da estação, velocidade indicada por GPS, quantidade de
        satélites, métricas de precisão, intensidade de sinal, acelerômetro, giroscópio, identificação
        da estação, data e horário, status de funcionamento, ciclos de economia de energia e Deep
        Sleep, dentre outros dados técnicos compatíveis com o projeto.
      </p>
      <p>
        As coordenadas exibidas referem-se, em regra, à estação de monitoramento. Caso a localização
        permita inferir residência, rotina ou outra informação ligada a pessoa natural identificada ou
        identificável, o tratamento deverá observar integralmente a LGPD.
      </p>

      <Section>6. Ciclos de operação e Deep Sleep</Section>
      <p>
        A estação poderá operar em ciclos programados de atividade e repouso. Durante o Deep Sleep, a
        ausência temporária de novas transmissões constitui comportamento esperado e não caracteriza,
        por si só, indisponibilidade do serviço. O aplicativo poderá manter na interface os últimos
        valores válidos até o próximo despertar do dispositivo.
      </p>

      <Section>7. Uso permitido</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>consultar dados e painéis disponibilizados pelo projeto;</li>
        <li>
          utilizar informações para pesquisa, estudo, avaliação técnica e finalidades lícitas
          compatíveis com o escopo do aplicativo;
        </li>
        <li>relatar erros, inconsistências ou incidentes por meio do canal oficial; e</li>
        <li>
          exportar ou utilizar dados quando a funcionalidade estiver disponível e respeitados estes
          Termos, a legislação e eventuais restrições de pesquisa.
        </li>
      </ul>

      <Section>8. Condutas proibidas</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>acessar conta, dados, recursos ou infraestrutura sem autorização;</li>
        <li>
          contornar controles de acesso, testar vulnerabilidades sem autorização prévia, executar
          ataques de negação de serviço ou introduzir código malicioso;
        </li>
        <li>adulterar medições, identidades de estações, registros de evento ou resultados da pesquisa;</li>
        <li>
          utilizar o serviço para perseguição, monitoramento indevido de pessoas ou inferência de
          localização pessoal não autorizada;
        </li>
        <li>
          copiar, explorar ou redistribuir componentes protegidos do projeto em violação a direitos
          autorais, licenças ou segredos técnicos; e
        </li>
        <li>
          utilizar os dados como única base para decisões críticas de saúde, segurança, emergência,
          navegação, defesa civil ou operação industrial de risco.
        </li>
      </ul>

      <Section>9. Exatidão, calibração e disponibilidade</Section>
      <p>
        Sensores, redes sem fio, sistemas de posicionamento, painéis solares, baterias, servidores e
        serviços de terceiros estão sujeitos a tolerâncias, erros, descalibração, interferência,
        indisponibilidade, perda de pacotes, atraso de sincronização e outros eventos técnicos. O
        responsável adota esforços razoáveis de manutenção, mas não garante operação ininterrupta nem
        exatidão absoluta das medições.
      </p>
      <p>
        Quando determinada finalidade exigir medição oficial, certificada ou metrologicamente
        rastreável, o usuário deverá recorrer a instrumentos, procedimentos e fontes reconhecidos pela
        autoridade ou norma competente.
      </p>

      <Section>10. Serviços de terceiros</Section>
      <p>
        O EcoSense Monitor utiliza ou pode utilizar serviços de terceiros para hospedagem, autenticação,
        banco de dados, automação, armazenamento e integração, incluindo Base44 e serviços Google. Esses
        fornecedores possuem termos, políticas de privacidade e medidas próprias. A indisponibilidade ou
        modificação desses serviços pode afetar temporariamente o funcionamento do aplicativo.
      </p>

      <Section>11. Propriedade intelectual</Section>
      <p>
        A denominação EcoSense Monitor, a organização do projeto, documentação, código próprio, textos,
        fluxos, layouts, banco de dados estruturado, gráficos e demais criações autorais são protegidos
        pela legislação aplicável, ressalvados componentes de terceiros sujeitos às respectivas
        licenças. Estes Termos não transferem ao usuário direitos de propriedade intelectual além da
        licença limitada de uso da aplicação.
      </p>

      <Section>12. Dados, privacidade e segurança</Section>
      <p>
        O tratamento de dados pessoais é disciplinado pela Política de Privacidade e demais avisos
        específicos. O usuário deve comunicar imediatamente suspeitas de acesso não autorizado,
        exposição de informações ou comportamento anômalo pelo canal de contato.
      </p>

      <Section>13. Suspensão e encerramento de acesso</Section>
      <p>
        O responsável poderá suspender ou restringir contas quando houver indício razoável de fraude,
        abuso, risco de segurança, violação destes Termos, determinação legal ou necessidade de
        preservar a integridade do projeto. Sempre que viável e juridicamente adequado, o usuário será
        informado da medida e poderá solicitar esclarecimentos.
      </p>

      <Section>14. Encerramento de conta e dados</Section>
      <p>
        O usuário poderá solicitar o encerramento da conta e exercer direitos relativos a seus dados
        pessoais pelo e-mail indicado. A exclusão estará sujeita às hipóteses legais de conservação,
        registros de segurança, defesa de direitos, obrigações regulatórias e limitações técnicas de
        backup descritas na Política de Privacidade e na Política de Retenção.
      </p>

      <Section>15. Limitação de responsabilidade</Section>
      <p>
        Na máxima extensão permitida pela legislação, o responsável não responderá por danos
        decorrentes exclusivamente de uso indevido do aplicativo, interpretação inadequada de dados
        ambientais, falhas de conectividade, atos de terceiros, caso fortuito, força maior ou
        indisponibilidade de infraestrutura fora de seu controle razoável. Esta cláusula não exclui
        responsabilidades que sejam inderrogáveis por lei nem limita direitos eventualmente assegurados
        ao usuário por normas cogentes.
      </p>

      <Section>16. Ausência de publicidade e monetização comportamental</Section>
      <p>
        Na data desta versão, o responsável informa não utilizar publicidade comportamental, venda de
        dados pessoais ou ferramenta própria de analytics para fins mercadológicos. Caso esse cenário
        se altere, os documentos serão atualizados e, quando necessário, serão implementados
        mecanismos de consentimento ou oposição.
      </p>

      <Section>17. Alterações dos Termos</Section>
      <p>
        Os Termos poderão ser alterados em razão de evolução tecnológica, mudança de escopo da pesquisa,
        adoção de novos fornecedores ou alteração normativa. Mudanças relevantes serão comunicadas de
        maneira razoável e a versão vigente permanecerá acessível no aplicativo.
      </p>

      <Section>18. Legislação e solução de controvérsias</Section>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais controvérsias
        serão submetidas ao foro competente segundo a legislação aplicável, preservados os direitos de
        competência territorial que não possam ser validamente afastados, inclusive aqueles decorrentes
        de eventual relação de consumo.
      </p>

      <Section>19. Contato</Section>
      <p>Dúvidas, solicitações ou comunicações: jose.mpa@discente.ufma.br.</p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
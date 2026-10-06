import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/94fb1c617_06_Aviso_Legal_Dados_Ambientais_EcoSense_Monitor.docx";

export default function AvisoDadosAmbientais() {
  return (
    <LegalPage
      title="Aviso Legal - Dados Ambientais e Limitações Técnicas"
      docUrl={DOC_URL}
      docLabel="Baixar Aviso sobre Dados Ambientais (.docx)"
    >
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Natureza das informações</Section>
      <p>
        O EcoSense Monitor recebe dados de sensores e módulos eletrônicos empregados em protótipo e
        projeto de pesquisa. As informações têm natureza indicativa e experimental, salvo quando houver
        declaração expressa de calibração, certificação, rastreabilidade metrológica ou validação por
        método reconhecido.
      </p>

      <Section>2. Fontes de incerteza</Section>
      <ul className="list-disc pl-5 space-y-1">
        <li>tolerância e deriva dos sensores;</li>
        <li>posição física, exposição solar, ventilação, umidade, interferência eletromagnética e condições ambientais;</li>
        <li>qualidade de alimentação por bateria e painel solar;</li>
        <li>precisão e disponibilidade do GPS e geometria dos satélites;</li>
        <li>perda, atraso ou duplicidade de pacotes de rede;</li>
        <li>reinicializações, Deep Sleep e períodos sem transmissão;</li>
        <li>falhas ou indisponibilidade de Wi-Fi, provedores, Google Apps Script, Base44 ou outros componentes; e</li>
        <li>alterações de firmware, bibliotecas e calibração.</li>
      </ul>

      <Section>3. Deep Sleep e atualização dos dados</Section>
      <p>
        A estação pode permanecer intencionalmente sem transmitir durante janelas de Deep Sleep. O
        aplicativo poderá exibir o último valor recebido durante esse período. A ausência temporária de
        atualização, quando compatível com o ciclo programado, não deve ser interpretada
        automaticamente como falha do sensor.
      </p>

      <Section>4. GPS e localização</Section>
      <p>
        Coordenadas GPS estão sujeitas a erro e não devem ser utilizadas como única referência para
        navegação, georreferenciamento legal, delimitação fundiária, localização de emergência ou
        outras finalidades que demandem precisão certificada. Se a posição da estação coincidir com
        residência ou local privado, recomenda-se avaliar a necessidade de reduzir precisão ou restringir
        acesso.
      </p>

      <Section>5. Uso em decisões críticas</Section>
      <p>
        O EcoSense Monitor não deve constituir fonte exclusiva para decisões de emergência, saúde,
        segurança pessoal, defesa civil, navegação, controle industrial, previsão meteorológica oficial,
        acionamento de equipamentos de risco ou qualquer contexto em que erro, atraso ou
        indisponibilidade possa causar dano relevante.
      </p>

      <Section>6. Pesquisa e reprodução científica</Section>
      <p>
        Resultados de pesquisa baseados no EcoSense Monitor devem documentar versão do firmware,
        período de coleta, sensores utilizados, metodologia de calibração, tratamento de valores
        ausentes, critérios de exclusão, disponibilidade de rede e limitações do conjunto de dados. A
        publicação científica deve distinguir dados observados de inferências ou estimativas.
      </p>

      <Section>7. Responsabilidade</Section>
      <p>
        O responsável empregará esforços razoáveis para preservar integridade e disponibilidade, mas
        não garante precisão absoluta, continuidade ininterrupta ou adequação a finalidade específica
        não expressamente validada. Direitos inderrogáveis previstos em lei permanecem preservados.
      </p>

      <Section>8. Contato técnico</Section>
      <p>
        Comunicações sobre inconsistências técnicas ou qualidade de dados podem ser encaminhadas a
        jose.mpa@discente.ufma.br.
      </p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
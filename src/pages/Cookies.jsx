import React from "react";
import LegalPage, { Section, BaseNormativa, BASE_NORMATIVA_COMPLETA } from "@/components/shared/LegalPage";

const DOC_URL =
  "https://media.base44.com/files/public/6ab9c2047f11e4a7e4e64994/d697ee7e8_03_Politica_de_Cookies_EcoSense_Monitor.docx";

export default function Cookies() {
  return (
    <LegalPage
      title="Política de Cookies"
      docUrl={DOC_URL}
      docLabel="Baixar Política de Cookies (.docx)"
    >
      <p className="text-foreground font-semibold">Política de Cookies e Tecnologias Similares</p>
      <p>
        Responsável pelo projeto: <strong className="text-foreground">José Magno Pinheiro Alves</strong> ·
        Natureza: pessoa física - projeto de pesquisa · Canal de privacidade e contato:
        jose.mpa@discente.ufma.br · Aplicação: https://ecosensemonitorapp.base44.app · Versão 1.0 | 05 de
        outubro de 2026 · Classificação: PÚBLICO
      </p>

      <Section>1. Objetivo</Section>
      <p>
        Esta Política explica o uso de cookies, armazenamento local, tokens de sessão e tecnologias
        equivalentes no EcoSense Monitor. Deve ser interpretada juntamente com a Política de
        Privacidade.
      </p>

      <Section>2. Conceitos</Section>
      <p>
        Cookies são pequenos arquivos ou identificadores armazenados no navegador ou dispositivo que
        podem permitir funções como autenticação, manutenção de sessão, segurança, preferências e, em
        alguns serviços, medição de audiência ou publicidade. Tecnologias equivalentes podem incluir
        local storage, session storage, identificadores de sessão e mecanismos semelhantes.
      </p>

      <Section>3. Situação atual do EcoSense Monitor</Section>
      <p>
        Na data desta versão, o responsável pelo EcoSense Monitor não implementa intencionalmente
        publicidade, pixels de marketing, perfilamento comportamental nem ferramenta própria de
        analytics. O aplicativo pode utilizar tecnologias estritamente necessárias ao funcionamento,
        especialmente para login com Google, manutenção de sessão, prevenção de fraude, segurança e
        recursos providos pela Base44.
      </p>

      <Section>4. Categorias</Section>
      <div className="overflow-hidden rounded-lg border border-border/50 text-sm">
        <div className="grid grid-cols-2 gap-2 bg-muted/60 p-3 text-foreground font-semibold">
          <span>Categoria / Finalidade</span>
          <span>Situação atual</span>
        </div>
        {[
          [
            "Necessários/essenciais: login, sessão, segurança, funcionamento básico",
            "podem ser utilizados — necessários para o serviço solicitado",
          ],
          [
            "Preferências/funcionalidade: lembrar configurações não essenciais",
            "não declarados como implementados pelo responsável",
          ],
          [
            "Analytics/desempenho: medir audiência e comportamento agregado",
            "não implementados pelo responsável nesta data",
          ],
          [
            "Publicidade/marketing: segmentação e mensuração publicitária",
            "não implementados pelo responsável nesta data",
          ],
        ].map(([c, s]) => (
          <div key={c} className="grid grid-cols-2 gap-2 p-3 border-t border-border/50">
            <span className="text-foreground">{c}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <Section>5. Cookies de terceiros</Section>
      <p>
        Base44 e Google podem empregar cookies, tokens ou mecanismos próprios necessários a seus
        serviços. Quando essas tecnologias forem definidas e controladas pelo terceiro para finalidades
        próprias, aplicam-se também as políticas do respectivo fornecedor. O responsável pelo EcoSense
        Monitor deve manter a configuração do aplicativo de modo a evitar coleta não necessária sempre
        que tecnicamente possível.
      </p>

      <Section>6. Consentimento e banner</Section>
      <p>
        Não se recomenda criar consentimento artificial para cookies estritamente necessários, pois sua
        desativação pode impedir login, segurança ou funcionalidades solicitadas. Se forem adicionados
        cookies não necessários, analytics, marketing ou publicidade, deverá ser adotado mecanismo
        granular de escolha, com opção de rejeitar os não necessários em facilidade equivalente à opção
        de aceitar, sem caixas pré-marcadas e sem condicionar indevidamente o serviço à aceitação.
      </p>

      <Section>7. Gerenciamento pelo usuário</Section>
      <p>
        O usuário pode gerenciar cookies pelo navegador e também revisar permissões da conta Google. A
        exclusão de cookies essenciais pode encerrar a sessão, exigir novo login ou impedir o
        funcionamento de determinados recursos.
      </p>

      <Section>8. Alterações futuras</Section>
      <p>
        A inclusão de analytics, publicidade, pixels, mapas com rastreamento adicional ou outros
        mecanismos de monitoramento exige revisão desta Política, da Política de Privacidade e, quando
        cabível, implementação de consentimento específico antes da ativação.
      </p>

      <Section>9. Contato</Section>
      <p>Dúvidas sobre cookies e privacidade: jose.mpa@discente.ufma.br.</p>

      <BaseNormativa itens={BASE_NORMATIVA_COMPLETA} />
    </LegalPage>
  );
}
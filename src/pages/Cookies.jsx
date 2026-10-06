import React from "react";
import LegalPage, { Section } from "@/components/shared/LegalPage";

export default function Cookies() {
  return (
    <LegalPage title="Política de Cookies">
      <p>
        Esta Política explica como o EcoSense Monitor utiliza cookies e tecnologias similares no
        navegador.
      </p>

      <Section>1. O que são cookies</Section>
      <p>
        Cookies são pequenos arquivos armazenados pelo navegador no seu dispositivo quando você
        visita um site ou aplicativo web. Eles permitem manter sua sessão ativa e lembrar
        preferências de uso.
      </p>

      <Section>2. Cookies utilizados</Section>
      <p>
        <strong className="text-foreground">Essenciais:</strong> cookies de sessão e
        autenticação, necessários para manter você conectado de forma segura. O aplicativo não
        funciona corretamente sem eles.
      </p>
      <p>
        <strong className="text-foreground">Preferências:</strong> armazenamento local da
        escolha de tema claro/escuro e de filtros de exibição recentes, para que o painel seja
        apresentado como você deixou na última sessão.
      </p>
      <p>
        <strong className="text-foreground">Publicidade e rastreamento:</strong> o EcoSense
        Monitor <strong className="text-foreground">não</strong> utiliza cookies de publicidade,
        perfilamento ou rastreamento de terceiros.
      </p>

      <Section>3. Como gerenciar</Section>
      <p>
        Você pode limpar ou bloquear cookies nas configurações do seu navegador. Restringir os
        cookies essenciais impedirá o login e o uso normal da plataforma.
      </p>

      <Section>4. Atualizações</Section>
      <p>
        Esta Política pode ser atualizada a qualquer momento. A versão vigente é a publicada
        nesta página, com a data indicada no rodapé.
      </p>
    </LegalPage>
  );
}
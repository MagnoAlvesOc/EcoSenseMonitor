import React from "react";
import { Link } from "react-router-dom";
import { MapPin, BarChart3, ShieldCheck, ArrowLeft } from "lucide-react";
import EcoSenseLogo from "@/components/shared/EcoSenseLogo";
import MobilePageHeader from "@/components/layout/MobilePageHeader";
import LegalFooter from "@/components/shared/LegalFooter";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-foreground mt-8 mb-2">{children}</h2>
);

const SubTitle = ({ children }) => (
  <h3 className="text-base font-semibold text-foreground mt-5 mb-1.5">{children}</h3>
);

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MobilePageHeader />
      <div className="flex-1 mx-auto max-w-2xl px-4 pt-[calc(4.5rem_+_env(safe-area-inset-top))] pb-10 md:pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <EcoSenseLogo className="w-10 h-10" />
          <span className="font-bold text-lg">EcoSense Monitor</span>
        </div>

        {/* 1. A plataforma */}
        <h1 className="text-3xl font-bold mb-4">Sobre o EcoSense Monitor</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-justify hyphens-auto">
          <p>
            O <strong className="text-foreground">EcoSense Monitor</strong> é uma plataforma de
            monitoramento IoT (Internet das Coisas) dedicada ao acompanhamento de dados climáticos
            e de diagnóstico de estações meteorológicas em tempo real. Cada estação física,
            equipada com sensores de temperatura, umidade relativa, pressão atmosférica, radiação
            UV, CO₂ e GPS, envia suas leituras continuamente para a plataforma, que as organiza,
            valida e apresenta em um painel interativo.
          </p>
          <p>
            O sistema oferece um mapa de estações com visualização por satélite, gráficos de
            tendência histórica, comparação entre estações, análise de microclima em um raio de
            2,5 km, alertas automáticos de limites críticos (como temperatura extrema, bateria
            baixa ou estação offline) e ferramentas de manutenção preventiva com controle de
            custos. Também é possível cruzar os dados coletados em campo com fontes externas,
            como Open-Meteo e OpenWeatherMap, para validar as medições.
          </p>
          <p>
            A plataforma foi criada para <strong className="text-foreground">pesquisadores,
            estudantes, técnicos ambientais e produtores rurais</strong> que precisam de dados
            climáticos confiáveis e acessíveis para estudos de microclima, agricultura de
            precisão e monitoramento ambiental contínuo — inclusive em áreas remotas, com suporte
            a leituras offline e a dispositivos móveis.
          </p>
          <p>
            O EcoSense Monitor é desenvolvido e mantido pela equipe da{" "}
            <strong className="text-foreground">LabirPesq</strong>, que também opera as estações
            e é responsável pela coleta, calibração e qualidade dos dados publicados na
            plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <MapPin className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Mapa em tempo real</p>
            <p className="text-xs text-muted-foreground">Localização e status de cada estação via GPS.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Análises avançadas</p>
            <p className="text-xs text-muted-foreground">Tendências, comparações e estatísticas históricas.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ShieldCheck className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold">Alertas e confiabilidade</p>
            <p className="text-xs text-muted-foreground">Monitoramento contínuo e diagnóstico de falhas.</p>
          </div>
        </div>

        {/* 2. Termos de Uso e Política de Privacidade (estilo institucional) */}
        <div className="border-t border-border/60 mt-12 pt-8">
          <h1 className="text-3xl font-bold mb-3">Termos de Uso e Política de Privacidade</h1>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto mb-3">
            Esta página reúne os princípios que regem o uso do EcoSense Monitor: transparência,
            segurança, finalidade legítima e respeito aos direitos dos titulares de dados.
          </p>

          <SectionTitle>1. Objetivo da plataforma</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            O EcoSense Monitor tem como finalidade apresentar informações e ferramentas de
            monitoramento ambiental, permitindo o acompanhamento de estações de coleta, a consulta
            de dados climáticos e o acesso a conteúdos institucionais, canais de contato e
            documentação do projeto.
          </p>

          <SectionTitle>2. Uso permitido da plataforma</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto mb-2">
            O usuário compromete-se a utilizar a plataforma de forma ética, lícita e compatível
            com estes Termos, abstendo-se de:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
            <li>utilizar a plataforma para fins ilícitos, fraudulentos ou não autorizados;</li>
            <li>interferir no funcionamento, segurança ou disponibilidade do serviço;</li>
            <li>tentar acessar áreas restritas, sistemas ou bases de dados sem autorização;</li>
            <li>inserir, transmitir ou disseminar códigos maliciosos;</li>
            <li>utilizar conteúdos, marcas ou materiais da plataforma sem autorização;</li>
            <li>inserir dados falsos ou manipular leituras e registros do sistema.</li>
          </ul>

          <SectionTitle>3. Formulários e envio de informações</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            A plataforma disponibiliza formulários de contato e canais de comunicação. Ao
            preencher qualquer formulário, o usuário compromete-se a fornecer informações
            verdadeiras, completas e atualizadas. O tratamento dessas informações é detalhado na
            Política de Privacidade, em especial nas seções sobre quais dados são coletados e as
            finalidades do tratamento.
          </p>

          <SectionTitle>4. Propriedade intelectual</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            Todos os conteúdos disponibilizados, incluindo textos, marcas, logotipos, imagens,
            gráficos, ícones, layout, design, códigos e materiais institucionais, pertencem ao
            EcoSense Monitor / LabirPesq ou a terceiros que autorizaram seu uso. É proibida a
            reprodução, distribuição, modificação, cópia, exibição, transmissão, publicação ou
            qualquer outra forma de utilização do conteúdo sem autorização prévia e por escrito,
            salvo quando permitido pela legislação aplicável.
          </p>

          <SectionTitle>5. Links para terceiros</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            A plataforma pode conter links para páginas externas, ferramentas de suporte e
            serviços de terceiros, como provedores de dados meteorológicos e serviços de mapa.
            Não nos responsabilizamos pelo conteúdo, disponibilidade, segurança ou práticas de
            sites e serviços de terceiros. O acesso a links externos é realizado por conta e
            risco do usuário.
          </p>

          <SectionTitle>6. Disponibilidade da plataforma</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            Empregamos esforços razoáveis para manter a plataforma disponível, segura e
            funcional. Contudo, não garantimos que o acesso será contínuo, ininterrupto ou livre
            de erros. A plataforma pode ficar temporariamente indisponível por motivos técnicos,
            operacionais, de manutenção, falhas de terceiros, caso fortuito ou força maior.
          </p>

          <SectionTitle>7. Privacidade e proteção de dados pessoais</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto mb-2">
            O tratamento de dados pessoais realizado pelo EcoSense Monitor observa a legislação
            aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais (LGPD). A política
            completa explica, de forma detalhada e em linguagem acessível:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
            <li>quais dados pessoais coletamos e por quê;</li>
            <li>para quais finalidades os utilizamos;</li>
            <li>quanto tempo os armazenamos;</li>
            <li>com quem podem ser compartilhados;</li>
            <li>quais são os seus direitos como titular e como exercê-los.</li>
          </ul>
          <p className="mt-3 text-sm">
            <Link to="/privacidade" className="text-primary font-semibold hover:underline">
              Ler a Política de Privacidade completa
            </Link>
            {" · "}
            <Link to="/termos" className="text-primary font-semibold hover:underline">
              Ver os Termos de Uso completos
            </Link>
            {" · "}
            <Link to="/cookies" className="text-primary font-semibold hover:underline">
              Política de Cookies
            </Link>
          </p>

          <SectionTitle>8. Alterações destes Termos</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            Podemos alterar estes Termos e a Política de Privacidade a qualquer momento,
            especialmente para refletir mudanças na plataforma, em suas práticas internas,
            requisitos legais, regulatórios ou operacionais. A versão atualizada será publicada
            nesta página, com indicação da data da última atualização.
          </p>

          <SectionTitle>9. Contato</SectionTitle>
          <p className="text-muted-foreground leading-relaxed text-justify hyphens-auto">
            Em caso de dúvidas sobre estes Termos de Uso ou assuntos relacionados a privacidade e
            proteção de dados pessoais, entre em contato pelo canal do projeto:{" "}
            <span className="text-foreground font-medium">jose.mpa@discente.ufma.br</span> ou pela
            página de <Link to="/contato" className="text-primary font-semibold hover:underline">contato</Link>.
          </p>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}
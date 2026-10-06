import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { StationProvider } from '@/lib/StationContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Code-splitting: cada página é carregada sob demanda (first-load mais rápido em WebViews)
const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MapaEstacoes = lazy(() => import('./pages/MapaEstacoes'));
const Analises = lazy(() => import('./pages/Analises'));
const SystemLogsPage = lazy(() => import('./pages/SystemLogs'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Manutencao = lazy(() => import('./pages/Manutencao'));
const Integracoes = lazy(() => import('./pages/Integracoes'));
const RelatorioPDF = lazy(() => import('./pages/RelatorioPDF'));
const Sobre = lazy(() => import('./pages/Sobre'));
const Contato = lazy(() => import('./pages/Contato'));
const Termos = lazy(() => import('./pages/Termos'));
const Privacidade = lazy(() => import('./pages/Privacidade'));
const Cookies = lazy(() => import('./pages/Cookies'));
const AvisoLoginGoogle = lazy(() => import('./pages/AvisoLoginGoogle'));
const AvisoTransferencia = lazy(() => import('./pages/AvisoTransferencia'));
const AvisoDadosAmbientais = lazy(() => import('./pages/AvisoDadosAmbientais'));

// Sub-abas em rotas aninhadas (/analises/relatorios, /manutencao/custos, ...)
const Relatorios = lazy(() => import('./pages/Relatorios'));
const AnaliseEstatistica = lazy(() => import('./pages/AnaliseEstatistica'));
const ComparacaoEstacoes = lazy(() => import('./pages/ComparacaoEstacoes'));
const CustosTab = lazy(() => import('./components/manutencao/CustosTab'));
const ManutencaoTab = lazy(() => import('./components/manutencao/ManutencaoTab'));
const ManutencaoRelatorioTab = lazy(() => import('./components/manutencao/RelatorioTab'));
const TempoRealTab = lazy(() => import('./components/integracoes/TempoRealTab'));
const FontesExternasTab = lazy(() => import('./components/integracoes/FontesExternasTab'));
const IntegracoesComparacaoTab = lazy(() => import('./components/integracoes/ComparacaoTab'));
const ExportApiTab = lazy(() => import('./components/integracoes/ExportApiTab'));

// Fallback enquanto o chunk da página é carregado
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Bloqueia o acesso direto a /configuracoes para quem não é admin
const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isPublicPage = ["/sobre", "/contato", "/termos", "/privacidade", "/cookies", "/aviso-login-google", "/aviso-transferencia-internacional", "/aviso-dados-ambientais"].includes(window.location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/aviso-login-google" element={<AvisoLoginGoogle />} />
        <Route path="/aviso-transferencia-internacional" element={<AvisoTransferencia />} />
        <Route path="/aviso-dados-ambientais" element={<AvisoDadosAmbientais />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mapa" element={<MapaEstacoes />} />
        <Route path="/analises" element={<Analises />}>
          <Route index element={<Relatorios />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="estatistica" element={<AnaliseEstatistica />} />
          <Route path="comparacao" element={<ComparacaoEstacoes />} />
        </Route>
        <Route path="/logs" element={<SystemLogsPage />} />
        <Route path="/configuracoes" element={<AdminOnly><Configuracoes /></AdminOnly>} />
        <Route path="/manutencao" element={<Manutencao />}>
          <Route index element={<CustosTab />} />
          <Route path="custos" element={<CustosTab />} />
          <Route path="preventiva" element={<ManutencaoTab />} />
          <Route path="relatorio" element={<ManutencaoRelatorioTab />} />
        </Route>
        <Route path="/integracoes" element={<Integracoes />}>
          <Route index element={<TempoRealTab />} />
          <Route path="temporeal" element={<TempoRealTab />} />
          <Route path="fontes" element={<FontesExternasTab />} />
          <Route path="comparacao" element={<IntegracoesComparacaoTab />} />
          <Route path="export" element={<ExportApiTab />} />
        </Route>
        <Route path="/relatorio-pdf" element={<RelatorioPDF />} />
        <Route path="/RelatorioPDF" element={<RelatorioPDF />} />
      </Route>
      {/* Páginas públicas — acessíveis sem login */}
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/aviso-login-google" element={<AvisoLoginGoogle />} />
      <Route path="/aviso-transferencia-internacional" element={<AvisoTransferencia />} />
      <Route path="/aviso-dados-ambientais" element={<AvisoDadosAmbientais />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <StationProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <AuthenticatedApp />
            </Suspense>
          </Router>
          <Toaster />
        </StationProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
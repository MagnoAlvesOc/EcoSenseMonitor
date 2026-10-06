import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

// Fallback enquanto o chunk da página é carregado
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isPublicPage = ["/sobre", "/contato"].includes(window.location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
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
        <Route path="/analises" element={<Analises />} />
        <Route path="/logs" element={<SystemLogsPage />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/manutencao" element={<Manutencao />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/relatorio-pdf" element={<RelatorioPDF />} />
        <Route path="/RelatorioPDF" element={<RelatorioPDF />} />
      </Route>
      {/* Páginas públicas — acessíveis sem login */}
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/contato" element={<Contato />} />
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
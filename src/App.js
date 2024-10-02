import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/useAuthState';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Typography, Box } from '@mui/material';
import theme from './utils/theme';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PassengerPage from './pages/PassengerPage';
import TravelPage from './pages/TravelPage';
import TravelDetails from './components/travels/TravelDetails';
import PassengerAllocation from './components/allocation/PassengerAllocation';
import TravelOrderReservationPage from './components/travels/TravelOrderReservationPage';
import VehiclePage from './pages/VehiclePage';
import MyAccount from './pages/MyAccount';
import HelpCenter from './pages/HelpCenter';
import ReportPage from './pages/ReportPage';
import PaymentPage from './pages/PaymentPage';
import NewLandingPage from './components/newlandingpage/NewLandingPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ManageBusLayoutPage from './pages/ManageBusLayoutPage';
import BusLayoutBuilderPage from './components/seatlayout/BusLayoutBuilderPage'; // Import the new BusLayoutBuilderPage
import './App.css';

function AuthenticatedApp() {
  const { currentUser, loading } = useAuth();

  // Se ainda estiver carregando a autenticação, mostra a tela de carregamento
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Redireciona para a página de aprovação pendente se o usuário não estiver aprovado */}
        {currentUser && !currentUser.isApproved && (
          <Route path="*" element={<Navigate to="/pendente-aprovacao" />} />
        )}

        {/* Se o usuário estiver autenticado e aprovado, redireciona para /home */}
        <Route path="/" element={currentUser ? <Navigate to="/home" /> : <NewLandingPage />} />

        {/* Página Home acessível somente para usuários autenticados e aprovados */}
        <Route path="/home" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />

        {/* Página de login acessível somente para usuários não autenticados */}
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/home" />} />

        {/* Página para usuários pendentes de aprovação */}
        <Route path="/pendente-aprovacao" element={<PendingApprovalPage />} />

        {/* Demais rotas protegidas */}
        <Route path="/passageiros" element={currentUser ? <PassengerPage /> : <Navigate to="/login" />} />
        <Route path="/viagens" element={currentUser ? <TravelPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId" element={currentUser ? <TravelDetails /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/alocar-passageiros" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/reservas" element={currentUser ? <TravelOrderReservationPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/editar-reserva" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/veiculos" element={currentUser ? <VehiclePage /> : <Navigate to="/login" />} />
        
        {/* Rotas para a gestão de layouts de ônibus */}
        <Route path="/veiculos/layout" element={currentUser ? <ManageBusLayoutPage /> : <Navigate to="/login" />} />
        <Route path="/veiculos/layout/novo" element={currentUser ? <BusLayoutBuilderPage /> : <Navigate to="/login" />} />
        <Route path="/veiculos/layout/:id" element={currentUser ? <BusLayoutBuilderPage /> : <Navigate to="/login" />} />

        <Route path="/pagamentos" element={currentUser ? <PaymentPage /> : <Navigate to="/login" />} />
        <Route path="/relatorios" element={currentUser ? <ReportPage /> : <Navigate to="/login" />} />
        <Route path="/minha-conta" element={currentUser ? <MyAccount /> : <Navigate to="/login" />} />
        <Route path="/central-ajuda" element={<HelpCenter />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <DrawerProvider>
          <AuthenticatedApp />
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

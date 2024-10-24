import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/useAuthState';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CircularProgress, Typography, Box, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import getLPTheme from './components/newlandingpage/theme/getLPTheme';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PassengerPage from './pages/PassengerPage';
import TravelPage from './pages/TravelPage';
import TravelDetails from './components/travels/TravelDetails';
import TravelCosts from './pages/TravelCosts';
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
import BusLayoutBuilderPage from './components/seatlayout/BusLayoutBuilderPage';
import './App.css';

function AuthenticatedApp() {
  const { currentUser, loading } = useAuth();

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
        {currentUser && !currentUser.isApproved && (
          <Route path="*" element={<Navigate to="/pendente-aprovacao" />} />
        )}
        <Route path="/" element={currentUser ? <Navigate to="/home" /> : <NewLandingPage />} />
        <Route path="/home" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/home" />} />
        <Route path="/pendente-aprovacao" element={<PendingApprovalPage />} />
        <Route path="/passageiros" element={currentUser ? <PassengerPage /> : <Navigate to="/login" />} />
        <Route path="/viagens" element={currentUser ? <TravelPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId" element={currentUser ? <TravelDetails /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/alocar-passageiros" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/reservas" element={currentUser ? <TravelOrderReservationPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/custos" element={currentUser ? <TravelCosts /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/editar-reserva" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/veiculos" element={currentUser ? <VehiclePage /> : <Navigate to="/login" />} />
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
  const [mode, setMode] = useState('light');
  const [showCustomTheme, setShowCustomTheme] = useState(true);

  const MPTheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleCustomTheme = (value) => {
    setShowCustomTheme(value);
  };

  return (
    <ThemeProvider theme={showCustomTheme ? MPTheme : defaultTheme}>
      <CssBaseline enableColorScheme />
      <AuthProvider>
        <DrawerProvider>
          <AuthenticatedApp />
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

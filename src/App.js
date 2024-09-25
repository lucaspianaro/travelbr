import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/useAuthState';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider } from '@mui/material/styles';
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
import LandingPage from './pages/LandingPage'; 
import './App.css';

function AuthenticatedApp() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={currentUser ? <HomePage /> : <LandingPage />} />
        <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/passageiros" element={currentUser ? <PassengerPage /> : <Navigate to="/login" />} />
        <Route path="/viagens" element={currentUser ? <TravelPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId" element={currentUser ? <TravelDetails /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/alocar-passageiros" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/reservas" element={currentUser ? <TravelOrderReservationPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/editar-reserva" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/veiculos" element={currentUser ? <VehiclePage /> : <Navigate to="/login" />} />
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

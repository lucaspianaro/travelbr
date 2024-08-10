import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/useAuthState';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './components/common/theme';
import LoginPage from './components/auth/LoginPage';
import HomePage from './pages/HomePage';
import PassengerComponent from './components/passengers/PassengerComponent';
import TravelComponent from './components/travels/TravelComponent';
import TravelDetails from './components/travels/TravelDetails';
import PassengerAllocation from './components/allocation/PassengerAllocation';
import TravelOrderReservationPage from './components/travels/TravelOrderReservationPage';
import VehicleComponent from './components/vehicles/VehicleComponent';
import MyAccount from './pages/MyAccount';
import HelpCenter from './pages/HelpCenter';
import ReportComponent from './components/reports/ReportComponent';
import PaymentComponent from './components/payments/PaymentComponent'; // Importe o componente de pagamentos
import './App.css';

function AuthenticatedApp() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/passageiros" element={currentUser ? <PassengerComponent /> : <Navigate to="/login" />} />
        <Route path="/viagens" element={currentUser ? <TravelComponent /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId" element={currentUser ? <TravelDetails /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/alocar-passageiros" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/reservas" element={currentUser ? <TravelOrderReservationPage /> : <Navigate to="/login" />} />
        <Route path="/viagens/:travelId/editar-reserva" element={currentUser ? <PassengerAllocation /> : <Navigate to="/login" />} />
        <Route path="/veiculos" element={currentUser ? <VehicleComponent /> : <Navigate to="/login" />} />
        <Route path="/pagamentos" element={currentUser ? <PaymentComponent /> : <Navigate to="/login" />} /> {/* Adicione esta linha */}
        <Route path="/relatorios" element={currentUser ? <ReportComponent /> : <Navigate to="/login" />} />
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

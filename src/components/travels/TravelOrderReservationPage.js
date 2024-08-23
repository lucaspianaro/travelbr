import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid, CircularProgress, Box, Typography, IconButton, TextField, Button, Snackbar, Alert, Pagination,
  InputAdornment, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Modal, Card, Fade, Tabs, Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Layout from '../common/Layout';
import OrderCard from '../order/OrderCard';
import ReservationCard from '../reservation/ReservationCard';
import OrderDetails from '../order/OrderDetails';
import ReservationDetails from '../reservation/ReservationDetails';
import { getTravelById } from '../../services/TravelService';
import { getReservationsByTravelId, getOrdersByTravelId, cancelOrder, cancelReservation } from '../../services/OrderService';
import { getAllPassengers } from '../../services/PassengerService';
import { exportToPDF as exportReservationsToPDF } from '../../utils/ReservationsPDF';
import { exportOrdersToPDF } from '../../utils/OrdersPDF';
import { validateMasterPassword } from '../../utils/utils';
import { getMasterPasswordStatus } from '../../services/AuthService';  // Importando o serviço de verificação de senha master

const TravelOrderReservationPage = () => {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const [travel, setTravel] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [tabIndex, setTabIndex] = useState(0); // 0 para Reservas, 1 para Pedidos
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);  // Estado para controle da senha master
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchOrdersAndReservations = async () => {
      try {
        const travelDetails = await getTravelById(travelId);
        setTravel(travelDetails);

        const fetchedReservations = await getReservationsByTravelId(travelId);
        const fetchedOrders = await getOrdersByTravelId(travelId);

        const fetchedPassengers = await getAllPassengers();
        setPassengers(fetchedPassengers);

        setReservations(fetchedReservations);
        setOrders(fetchedOrders);
        setFilteredData(tabIndex === 0 ? fetchedReservations : fetchedOrders);
        setError('');
      } catch (err) {
        setError('Falha ao carregar reservas e pedidos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMasterPasswordStatus = async () => {
      const isActive = await getMasterPasswordStatus();
      setMasterPasswordActive(isActive);
    };

    fetchOrdersAndReservations();
    fetchMasterPasswordStatus();
  }, [travelId, tabIndex]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();

    const filteredReservations = reservations.filter(reservation => {
      const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
      return (
        (passenger.nome?.toLowerCase().includes(lowercasedFilter) ||
          passenger.cpf?.toLowerCase().includes(lowercasedFilter) ||
          passenger.rg?.toLowerCase().includes(lowercasedFilter) ||
          passenger.passaporte?.toLowerCase().includes(lowercasedFilter) ||
          reservation.orderId.toLowerCase().includes(lowercasedFilter)) &&
        (paymentStatusFilter === '' || reservation.status === paymentStatusFilter)
      );
    }).sort((a, b) => {
      if (a.status === 'Cancelada' && b.status !== 'Cancelada') return 1;
      if (a.status !== 'Cancelada' && b.status === 'Cancelada') return -1;
      return a.numeroAssento - b.numeroAssento;
    });

    const filteredOrders = orders.filter(order => {
      return (
        (order.id.toLowerCase().includes(lowercasedFilter) ||
          order.reservations.some(reservation => {
            const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
            return (
              passenger.nome?.toLowerCase().includes(lowercasedFilter) ||
              passenger.cpf?.toLowerCase().includes(lowercasedFilter) ||
              passenger.passaporte?.toLowerCase().includes(lowercasedFilter) ||
              passenger.rg?.toLowerCase().includes(lowercasedFilter)
            );
          })) &&
        (paymentStatusFilter === '' || order.status === paymentStatusFilter)
      );
    }).sort((a, b) => {
      if (a.status === 'Cancelada' && b.status !== 'Cancelada') return 1;
      if (a.status !== 'Cancelada' && b.status === 'Cancelada') return -1;
      return a.id.localeCompare(b.id);
    });

    setFilteredData(tabIndex === 0 ? filteredReservations : filteredOrders);
  }, [searchTerm, orders, reservations, passengers, paymentStatusFilter, tabIndex]);

  const handleGoBack = () => navigate(`/viagens/${travelId}`);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleClearSearch = () => setSearchTerm('');

  const handlePaymentStatusFilterChange = (e) => setPaymentStatusFilter(e.target.value);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleExportPDF = () => {
    const activeReservations = filteredData.filter(reservation => reservation.status !== 'Cancelada');
    const sortedReservations = activeReservations.sort((a, b) => a.numeroAssento - b.numeroAssento);
    if (tabIndex === 0) {
      if (travel && sortedReservations.length > 0) {
        exportReservationsToPDF(travel, sortedReservations, passengers);
      } else {
        setSnackbarMessage('Nenhuma reserva ativa encontrada para exportação.');
        setSnackbarOpen(true);
      }
    } else {
      if (travel && filteredData.length > 0) {
        exportOrdersToPDF(travel, filteredData, passengers);
      } else {
        setSnackbarMessage('Nenhum pedido encontrado para exportação.');
        setSnackbarOpen(true);
      }
    }
  };

  const handleEditReservation = (reservation, orderId) => {
    const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
    navigate(`/viagens/${travelId}/alocar-passageiros`, { state: { selectedSeats: [{ number: reservation.numeroAssento }], editingReservation: { ...reservation, orderId, passenger }, editingOrderId: orderId } });
  };

  const handleEditOrder = (order) => {
    const editingReservations = order.reservations.map(reservation => {
      const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
      return { 
        ...reservation, 
        passenger, 
        detalhesPagamento: order.detalhesPagamento 
      };
    });
  
    navigate(`/viagens/${travelId}/alocar-passageiros`, { 
      state: { 
        selectedSeats: editingReservations.map(reservation => ({ number: reservation.numeroAssento })), 
        editingReservation: editingReservations, // Passando todas as reservas associadas ao pedido como um array
        editingOrderId: order.id 
      } 
    });
  };

  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelReservation = (reservationId, orderId) => {
    setCancelOrderId(orderId);
    setCancelReservationId(reservationId);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    setLoading(true);
    try {
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }
      if (cancelReservationId) {
        await cancelReservation(travelId, cancelOrderId, cancelReservationId);
        setSnackbarMessage('Reserva cancelada com sucesso.');
      } else {
        await cancelOrder(travelId, cancelOrderId);
        setSnackbarMessage('Pedido cancelado com sucesso.');
      }

      setSnackbarOpen(true);

      const fetchedReservations = await getReservationsByTravelId(travelId);
      const fetchedOrders = await getOrdersByTravelId(travelId);
      
      setReservations(fetchedReservations);
      setOrders(fetchedOrders);
      setFilteredData(tabIndex === 0 ? fetchedReservations : fetchedOrders);
      setCancelDialogOpen(false);
      setCancelReservationId(null);
      setMasterPassword('');
    } catch (err) {
      setSnackbarMessage('Erro ao cancelar: ' + err.message);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleOpenModal = (data) => {
    setSelectedData(data);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedData(null);
  };

  const renderModalContent = useCallback(() => {
    if (!selectedData) return null;
    return tabIndex === 0
      ? <ReservationDetails reservation={selectedData} passengers={passengers} travel={travel}/>
      : <OrderDetails order={selectedData} passengers={passengers} travel={travel}/>;
  }, [selectedData, tabIndex, passengers]);

  const renderReservations = useCallback(() => (
    <Grid container spacing={2} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      {currentItems.map((reservation) => (
        <Grid item xs={12} md={6} lg={4} key={reservation.id} sx={{ display: 'flex', flexDirection: 'column' }}>
          <ReservationCard
            reservation={reservation}
            passengers={passengers}
            travel={travel}
            onEditReservation={handleEditReservation}
            onCancelReservation={handleCancelReservation}
            onCardClick={handleOpenModal}
          />
        </Grid>
      ))}
    </Grid>
  ), [currentItems, passengers, travel]);

  const renderOrders = useCallback(() => (
    <Grid container spacing={2}>
      {currentItems.map((order) => (
        <Grid item xs={12} md={6} lg={4} key={order.id}>
          <OrderCard
            order={order}
            travel={travel}
            onEditOrder={handleEditOrder}
            onCancelOrder={handleCancelOrder}
            onCardClick={handleOpenModal}
          />
        </Grid>
      ))}
    </Grid>
  ), [currentItems, travel]);

  const calculateTotals = useCallback(() => {
    let totalReceivable = 0;
    let totalReceived = 0;

    orders.forEach(order => {
      if (order.status !== 'Cancelada') {
        const valorPago = parseFloat(order.detalhesPagamento?.valorPago || 0);
        const valorRestante = parseFloat(order.detalhesPagamento?.valorRestante || 0);

        totalReceived += valorPago;
        totalReceivable += valorRestante;
      }
    });

    return { totalReceivable, totalReceived };
  }, [orders]);

  const { totalReceivable, totalReceived } = calculateTotals();

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            Reservas e Pedidos
          </Typography>
        </Box>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="Reservas" />
          <Tab label="Pedidos" />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            sx={{ flex: 2, minWidth: 300 }}
            label={tabIndex === 0 ? "Buscar Reservas" : "Buscar Pedidos"}
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={tabIndex === 0 ? "Digite nome, documento ou ID do pedido" : "Digite nome, documento ou ID do pedido"}
            InputProps={{
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          <FormControl variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel id="payment-status-filter-label">Status de Pagamento</InputLabel>
            <Select
              labelId="payment-status-filter-label"
              id="payment-status-filter"
              value={paymentStatusFilter}
              onChange={handlePaymentStatusFilterChange}
              label="Status de Pagamento"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pago">Pago</MenuItem>
              <MenuItem value="Pagamento pendente">Pagamento pendente</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="contained" color="primary" onClick={handleExportPDF}>
            {tabIndex === 0 ? "Exportar Reservas" : "Exportar Pedidos"}
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MonetizationOnIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total a Receber</Typography>
                  </Box>
                  <Typography variant="h6">R$ {totalReceivable.toFixed(2)}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlineIcon color='success' sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Recebido</Typography>
                  </Box>
                  <Typography variant="h6">R$ {totalReceived.toFixed(2)}</Typography>
                </Card>
              </Grid>
            </Grid>
            <Fade in={tabIndex === 0} timeout={500}>
              <div style={{ display: tabIndex === 0 ? 'block' : 'none' }}>
                {filteredData.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1">Nenhuma reserva encontrada.</Typography>
                  </Box>
                ) : renderReservations()}
              </div>
            </Fade>
            <Fade in={tabIndex === 1} timeout={500}>
              <div style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
                {filteredData.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1">Nenhum pedido encontrado.</Typography>
                  </Box>
                ) : renderOrders()}
              </div>
            </Fade>
          </>
        )}
        <Pagination
          count={Math.ceil(filteredData.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          sx={{ mt: 2 }}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes('sucesso') ? 'success' : 'error'} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {cancelReservationId
                ? 'Tem certeza de que deseja cancelar esta reserva? Esta ação não pode ser desfeita.'
                : 'Tem certeza de que deseja cancelar este pedido? Todas as reservas deste pedido serão canceladas. Esta ação não pode ser desfeita.'}
            </DialogContentText>
            {masterPasswordActive && (
              <TextField
                margin="normal"
                fullWidth
                label="Senha Master"
                type={showMasterPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                InputProps={{
                  autoComplete: 'new-password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle master password visibility"
                        onClick={() => setShowMasterPassword(!showMasterPassword)}
                        edge="end"
                      >
                        {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="off"
                disabled={loading}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }} >
              Não
            </Button>
            <Button
              onClick={confirmCancelOrder}
              variant="contained"
              color="confirmar"
              disabled={masterPasswordActive && !masterPassword || loading}
              sx={{ color: 'white' }} 
            >
              {loading ? <CircularProgress size={24} /> : cancelReservationId ? 'Cancelar reserva' : 'Cancelar pedido'}
            </Button>
          </DialogActions>
        </Dialog>
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: { xs: '90%', sm: '80%', md: '60%' }, 
            bgcolor: 'background.paper', 
            boxShadow: 24, 
            p: 4, 
            maxHeight: '90vh', 
            overflowY: 'auto',
            borderRadius: 2,
          }}>
            <Typography variant="h5" gutterBottom>
              {tabIndex === 0 ? 'Detalhes da Reserva' : 'Detalhes do Pedido'}
            </Typography>
            {renderModalContent()}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={handleCloseModal} variant="contained" color="primary">Fechar</Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Layout>
  );
};

export default TravelOrderReservationPage;

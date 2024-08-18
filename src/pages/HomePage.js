import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Button, Grid, Card, Snackbar, Alert, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../contexts/useAuthState';
import Layout from '../components/common/Layout';
import TravelCard from '../components/travels/TravelCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OrderCard from '../components/order/OrderCard';
import OrderDetails from '../components/order/OrderDetails';
import TravelForm from '../components/travels/TravelForm';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getAllTravels, updateTravel, deleteTravel, cancelTravel, getTravelById, addTravel } from '../services/TravelService';
import { getAllReservations, getAllPassengers } from '../services/PaymentService';
import { cancelOrder, cancelReservation } from '../services/OrderService';
import { validateMasterPassword } from '../utils/utils';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [travels, setTravels] = useState([]);
  const [orders, setOrders] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [travelsData, setTravelsData] = useState({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [travelToDelete, setTravelToDelete] = useState(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [travelToCancel, setTravelToCancel] = useState(null);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [travelIdState, setTravelIdState] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [openTravelModal, setOpenTravelModal] = useState(false);

  // Current date variables for filtering
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Months are zero-based in JS Date
  const currentYear = today.getFullYear();

  // Fetch travels and orders
  const fetchTravels = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTravels = await getAllTravels();
      const sortedTravels = fetchedTravels.sort((a, b) => {
        const dateA = new Date(a.dataIda);
        const dateB = new Date(b.dataIda);
        return dateA - dateB;
      });
      setTravels(sortedTravels.slice(0, 3));

      const fetchedReservations = await getAllReservations();
      const fetchedPassengers = await getAllPassengers();
      setPassengers(fetchedPassengers);

      const groupedOrders = fetchedReservations.reduce((acc, reservation) => {
        const orderIndex = acc.findIndex(o => o.id === reservation.orderId);
        if (orderIndex !== -1) {
          acc[orderIndex].reservations.push(reservation);
        } else {
          acc.push({
            id: reservation.orderId,
            reservations: [reservation],
            detalhesPagamento: reservation.detalhesPagamento,
            status: reservation.status,
            travelId: reservation.travelId,
          });
        }
        return acc;
      }, []);

      setOrders(groupedOrders);

      const travelIds = new Set(fetchedReservations.map(reservation => reservation.travelId));
      const travelData = {};
      for (const id of travelIds) {
        travelData[id] = await getTravelById(id);
      }
      setTravelsData(travelData);
      setError('');
    } catch (err) {
      setError('Falha ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTravels();
  }, [fetchTravels]);

  // Calculate totals based on the same logic from Receivables
  const calculateTotals = (orders) => {
    let totalReceivable = 0;
    let totalReceived = 0;

    orders.forEach(order => {
      if (order.status !== 'Cancelada') {
        const travel = travelsData[order.travelId];
        if (travel) {
          const travelDate = new Date(travel.dataIda);
          if (travelDate.getMonth() + 1 === currentMonth && travelDate.getFullYear() === currentYear) {
            totalReceived += parseFloat(order.detalhesPagamento?.valorPago || 0);
            totalReceivable += parseFloat(order.detalhesPagamento?.valorRestante || 0);
          }
        }
      }
    });

    return { totalReceivable, totalReceived };
  };

  const { totalReceivable, totalReceived } = useMemo(() => calculateTotals(orders), [orders, travelsData, currentMonth, currentYear]);

  // Filter orders for display
  const filteredPendingOrders = orders.filter(order => {
    const travelDate = travelsData[order.travelId]?.dataIda;
    if (!travelDate) return false;
    const date = new Date(travelDate);
    return order.status !== 'Cancelada' &&
      parseFloat(order.detalhesPagamento?.valorRestante || 0) > 0 &&
      date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const filteredPaidOrders = orders.filter(order => {
    const travelDate = travelsData[order.travelId]?.dataIda;
    if (!travelDate) return false;
    const date = new Date(travelDate);
    return order.status !== 'Cancelada' &&
      parseFloat(order.detalhesPagamento?.valorRestante || 0) === 0 &&
      date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const startEditing = (travel) => {
    setEditingTravel(travel);
    setOpenTravelModal(true);
  };

  const handleOpenTravelModal = () => {
    setEditingTravel(null);
    setOpenTravelModal(true);
  };

  const handleCloseTravelModal = () => {
    setEditingTravel(null);
    setOpenTravelModal(false);
  };

  const handleSaveTravel = async (travelData) => {
    setLoading(true);
    try {
      if (editingTravel) {
        await updateTravel(editingTravel.id, travelData);
        setTravels(travels.map(travel => travel.id === editingTravel.id ? { ...travel, ...travelData } : travel));
      } else {
        const newTravel = await addTravel(travelData);
        setTravels([...travels, { ...travelData, id: newTravel.id }]);
      }
      await fetchTravels(); // Fetch all travels again after saving
      handleCloseTravelModal();
      setSnackbarMessage('Viagem salva com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setLoading(false);
    } catch (err) {
      setError('Erro ao salvar viagem. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const openConfirmDeleteDialog = (travel) => {
    setTravelToDelete(travel);
    setConfirmDeleteOpen(true);
  };

  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setTravelToDelete(null);
    setMasterPassword(''); // Reset master password field
  };

  const confirmDelete = async () => {
    if (travelToDelete) {
      setLoading(true);
      try {
        await validateMasterPassword(masterPassword);
        await deleteTravel(travelToDelete.id);
        await fetchTravels(); // Fetch all travels again after deletion
        setSnackbarMessage('Viagem excluída com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        setError('Erro ao excluir a viagem. Por favor, tente novamente.');
        setSnackbarMessage('Erro ao excluir viagem: ' + err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
      closeConfirmDeleteDialog();
    }
  };

  const openConfirmCancelDialog = (travel) => {
    setTravelToCancel(travel);
    setConfirmCancelOpen(true);
  };

  const closeConfirmCancelDialog = () => {
    setConfirmCancelOpen(false);
    setTravelToCancel(null);
    setMasterPassword(''); // Reset master password field
  };

  const confirmCancel = async () => {
    if (travelToCancel) {
      setLoading(true);
      try {
        await validateMasterPassword(masterPassword);
        await cancelTravel(travelToCancel.id);
        await fetchTravels(); // Fetch all travels again after cancellation
        setSnackbarMessage('Viagem cancelada com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        closeConfirmCancelDialog();
      } catch (err) {
        setError('Erro ao cancelar a viagem. Por favor, tente novamente.');
        setSnackbarMessage('Erro ao cancelar viagem: ' + err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    }
  };

  const handleEditReservation = (reservation, orderId) => {
    const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
    navigate(`/viagens/${reservation.travelId}/alocar-passageiros`, {
      state: { selectedSeats: [{ number: reservation.numeroAssento }], editingReservation: { ...reservation, orderId, passenger }, editingOrderId: orderId }
    });
  };

  const handleEditOrder = (order) => {
    order.reservations.forEach(reservation => handleEditReservation(reservation, order.id));
  };

  const handleCancelOrder = (orderId, travelId) => {
    setCancelOrderId(orderId);
    setTravelIdState(travelId);
    setCancelReservationId(null);
    setCancelDialogOpen(true);
  };

  const handleCancelReservation = (reservationId, orderId, travelId) => {
    setCancelOrderId(orderId);
    setCancelReservationId(reservationId);
    setTravelIdState(travelId);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    setCancelLoading(true);

    try {
      await validateMasterPassword(masterPassword);

      if (cancelReservationId) {
        await cancelReservation(travelIdState, cancelOrderId, cancelReservationId);
        setSnackbarMessage('Reserva cancelada com sucesso.');
      } else {
        await cancelOrder(travelIdState, cancelOrderId);
        setSnackbarMessage('Pedido cancelado com sucesso.');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      const fetchedReservations = await getAllReservations();
      const groupedOrders = fetchedReservations.reduce((acc, reservation) => {
        const orderIndex = acc.findIndex(o => o.id === reservation.orderId);
        if (orderIndex !== -1) {
          acc[orderIndex].reservations.push(reservation);
        } else {
          acc.push({
            id: reservation.orderId,
            reservations: [reservation],
            detalhesPagamento: reservation.detalhesPagamento,
            status: reservation.status,
            travelId: reservation.travelId,
          });
        }
        return acc;
      }, []);
      setOrders(groupedOrders);

      const travelIds = new Set(fetchedReservations.map(reservation => reservation.travelId));
      const travelData = {};
      for (const id of travelIds) {
        travelData[id] = await getTravelById(id);
      }
      setTravelsData(travelData);
      setCancelDialogOpen(false);
      setCancelReservationId(null);
      setMasterPassword('');
    } catch (err) {
      setSnackbarMessage('Falha ao cancelar: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleClickShowMasterPassword = () => setShowMasterPassword(!showMasterPassword);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Bom dia';
    } else if (currentHour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ my: 3, mx: 2 }}>
        <Typography variant="h4" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {getGreeting()}, {currentUser?.displayName}!
        </Typography>

        {travels.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" paragraph>
              Parece que você ainda não tem nenhuma viagem.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/viagens')}>
              Adicionar viagem
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Suas viagens mais próximas:
            </Typography>
            <TravelCard
              travels={travels}
              startEditing={startEditing}
              handleDelete={openConfirmDeleteDialog}
              handleCancel={openConfirmCancelDialog}
            />
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total a Receber Este Mês</Typography>
                </Box>
                <Typography variant="h6">R$ {totalReceivable.toFixed(2)}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlineIcon color='success' sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Recebido Este Mês</Typography>
                </Box>
                <Typography variant="h6">R$ {totalReceived.toFixed(2)}</Typography>
              </Card>
            </Grid>
          </Grid>
          {orders.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1">
                Nenhum pedido a receber encontrado para este mês.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pedidos com Pagamento Pendente para Viagens neste Mês
              </Typography>
              {filteredPendingOrders.length === 0 ? (
                <Typography variant="body2">
                  Nenhum pedido com pagamento pendente encontrado para este mês.
                </Typography>
              ) : (
                filteredPendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    passengers={passengers}
                    travel={travelsData[order.travelId]}
                    onCardClick={handleOpenModal}
                    onEditOrder={handleEditOrder}
                    onCancelOrder={handleCancelOrder}
                  />
                ))
              )}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Pedidos Pagos para Viagens neste Mês
              </Typography>
              {filteredPaidOrders.length === 0 ? (
                <Typography variant="body2">
                  Nenhum pedido com pagamento pago encontrado para este mês.
                </Typography>
              ) : (
                filteredPaidOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    passengers={passengers}
                    travel={travelsData[order.travelId]}
                    onCardClick={handleOpenModal}
                    onEditOrder={handleEditOrder}
                    onCancelOrder={handleCancelOrder}
                  />
                ))
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <OrderDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        passengers={passengers}
        travel={travelsData[selectedOrder?.travelId]}
      />
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {cancelReservationId
              ? 'Tem certeza de que deseja cancelar esta reserva? Esta ação não pode ser desfeita.'
              : 'Tem certeza de que deseja cancelar este pedido? Todas as reservas deste pedido serão canceladas. Esta ação não pode ser desfeita.'}
          </DialogContentText>
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
                    onClick={handleClickShowMasterPassword}
                    edge="end"
                  >
                    {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoComplete="off"
            disabled={cancelLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="cancelar" variant="contained" disabled={cancelLoading} sx={{ color: 'white' }}>
            Não
          </Button>
          <Button
            onClick={confirmCancelOrder}
            variant="contained"
            color="confirmar"
            autoFocus
            disabled={!masterPassword || cancelLoading}
            sx={{ color: 'white' }}
          >
            {cancelLoading ? <CircularProgress size={24} /> : cancelReservationId ? 'Cancelar reserva' : 'Cancelar pedido'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmCancelOpen} onClose={closeConfirmCancelDialog}>
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja cancelar esta viagem? Esta ação não pode ser desfeita.
          </DialogContentText>
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
                    onClick={handleClickShowMasterPassword}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmCancelDialog} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }}>
            Não
          </Button>
          <Button onClick={confirmCancel} variant="contained" color="confirmar" autoFocus disabled={!masterPassword || loading} sx={{ color: 'white' }}>
            {loading ? <CircularProgress size={24} /> : 'Cancelar viagem'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDeleteOpen} onClose={closeConfirmDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
          </DialogContentText>
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
                    onClick={handleClickShowMasterPassword}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }}>
            Não
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="confirmar" autoFocus disabled={!masterPassword || loading} sx={{ color: 'white' }}>
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={openTravelModal} onClose={handleCloseTravelModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <TravelForm travel={editingTravel} saveTravel={handleSaveTravel} cancelForm={handleCloseTravelModal} />
        </Box>
      </Modal>
    </Layout>
  );
};

const OrderDetailsModal = ({ open, onClose, order, passengers, travel }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
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
      }}
    >
      <Typography variant="h5" gutterBottom>
        Detalhes do Pedido
      </Typography>
      {order && <OrderDetails order={order} passengers={passengers} travel={travel} />}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </Box>
    </Box>
  </Modal>
);

export default HomePage;

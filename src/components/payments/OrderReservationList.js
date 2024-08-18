import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Snackbar, Alert, Pagination, InputAdornment, FormControl, InputLabel, Select, MenuItem, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, IconButton, Grid, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ReservationCard from '../reservation/ReservationCard';
import OrderCard from '../order/OrderCard';
import ReservationDetails from '../reservation/ReservationDetails';
import OrderDetails from '../order/OrderDetails';
import { getAllReservations, getAllPassengers, getTravelById } from '../../services/PaymentService';
import { cancelOrder, cancelReservation } from '../../services/OrderService';
import { validateMasterPassword } from '../../utils/utils';

const OrderReservationList = () => {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [travels, setTravels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [filterType, setFilterType] = useState('reservas');
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [travelIdState, setTravelIdState] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const itemsPerPage = 10;

  // Efeito para buscar as reservas e pedidos
  useEffect(() => {
    const fetchOrdersAndReservations = async () => {
      try {
        const fetchedReservations = await getAllReservations();
        const fetchedPassengers = await getAllPassengers();
        setPassengers(fetchedPassengers);

        // Agrupando pedidos por ID
        const groupedOrders = fetchedReservations.reduce((acc, reservation) => {
          const orderIndex = acc.findIndex(o => o.id === reservation.orderId);
          if (orderIndex !== -1) {
            acc[orderIndex].reservations.push(reservation);
          } else {
            acc.push({
              id: reservation.orderId,
              reservations: [reservation],
              detalhesPagamento: reservation.detalhesPagamento,
              status: reservation.status === 'Cancelada' ? 'Cancelada' : reservation.detalhesPagamento?.valorRestante > 0 ? 'Pagamento pendente' : 'Pago',
              travelId: reservation.travelId
            });
          }
          return acc;
        }, []);

        setReservations(fetchedReservations);
        setOrders(groupedOrders);
        setFilteredData(filterType === 'reservas' ? fetchedReservations : groupedOrders);

        // Carregando dados das viagens
        const travelIds = new Set(fetchedReservations.map(reservation => reservation.travelId));
        const travelData = {};
        for (const id of travelIds) {
          travelData[id] = await getTravelById(id);
        }
        setTravels(travelData);
        setError('');
      } catch (err) {
        setError('Falha ao carregar reservas: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReservations();
  }, [filterType]);

  // Efeito para aplicar filtros e busca
  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();

    if (filterType === 'reservas') {
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
      setFilteredData(filteredReservations);
    } else {
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
      setFilteredData(filteredOrders);
    }
  }, [searchTerm, orders, reservations, passengers, paymentStatusFilter, filterType]);

  // Funções para manipulação de estados e filtros
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm('');
  const handlePaymentStatusFilterChange = (e) => setPaymentStatusFilter(e.target.value);
  const handleFilterTypeChange = (e) => setFilterType(e.target.value);
  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleEditReservation = (reservation, orderId) => {
    const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
    navigate(`/viagens/${reservation.travelId}/alocar-passageiros`, { state: { selectedSeats: [{ number: reservation.numeroAssento }], editingReservation: { ...reservation, orderId, passenger }, editingOrderId: orderId } });
  };

  const handleEditOrder = (order) => {
    order.reservations.forEach(reservation => handleEditReservation(reservation, order.id));
  };

  const handleCancelOrder = (orderId, travelId) => {
    setCancelOrderId(orderId);
    setTravelIdState(travelId);
    setCancelDialogOpen(true);
  };

  const handleCancelReservation = (reservationId, orderId, travelId) => {
    setCancelOrderId(orderId);
    setCancelReservationId(reservationId);
    setTravelIdState(travelId);
    setCancelDialogOpen(true);
  };

  // Função para confirmar cancelamento de pedido ou reserva
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
            travelId: reservation.travelId
          });
        }
        return acc;
      }, []);
      setReservations(fetchedReservations);
      setOrders(groupedOrders);
      setFilteredData(filterType === 'reservas' ? fetchedReservations : groupedOrders);

      const travelIds = new Set(fetchedReservations.map(reservation => reservation.travelId));
      const travelData = {};
      for (const id of travelIds) {
        travelData[id] = await getTravelById(id);
      }
      setTravels(travelData);
      setCancelDialogOpen(false);
      setCancelReservationId(null);
      setMasterPassword(''); // Limpa o campo de senha master
    } catch (err) {
      setSnackbarMessage('Falha ao cancelar: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => filteredData.slice(indexOfFirstItem, indexOfLastItem), [filteredData, indexOfFirstItem, indexOfLastItem]);

  const handleOpenModal = (data) => {
    setSelectedData(data);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedData(null);
  };

  const handleClickShowMasterPassword = () => setShowMasterPassword(!showMasterPassword);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} marginBottom={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="filter-type-label">Visualizar por</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type"
              value={filterType}
              onChange={handleFilterTypeChange}
              label="Visualizar por"
            >
              <MenuItem value="reservas">Reservas</MenuItem>
              <MenuItem value="pedidos">Pedidos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Digite nome, documento ou ID do pedido"
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
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined">
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
        </Grid>
      </Grid>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        filteredData.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1">
              {filterType === 'reservas' ? 'Nenhuma reserva encontrada' : 'Nenhum pedido encontrado'}.
            </Typography>
          </Box>
        ) : filterType === 'reservas' ? (
          <Box>
            {currentItems.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                passengers={passengers}
                travel={travels[reservation.travelId]}
                onEditReservation={handleEditReservation}
                onCancelReservation={handleCancelReservation}
                onCardClick={handleOpenModal}
              />
            ))}
          </Box>
        ) : (
          <Box>
            {currentItems.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                passengers={passengers}
                travel={travels[order.travelId]}
                onEditOrder={handleEditOrder}
                onCancelOrder={handleCancelOrder}
                onCardClick={handleOpenModal}
              />
            ))}
          </Box>
        )
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
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
            {cancelLoading ? <CircularProgress size={24} /> : cancelReservationId
              ? 'Cancelar reserva'
              : 'Cancelar pedido'}
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
            {filterType === 'reservas' ? 'Detalhes da Reserva' : 'Detalhes do Pedido'}
          </Typography>
          {selectedData && (filterType === 'reservas' ? (
            <ReservationDetails reservation={selectedData} passengers={passengers} travel={travels[selectedData.travelId]} />
          ) : (
            <OrderDetails order={selectedData} passengers={passengers} travel={travels[selectedData.travelId]} />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleCloseModal} variant="contained" color="primary">Fechar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderReservationList;

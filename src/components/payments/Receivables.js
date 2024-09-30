import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Snackbar, Alert, Pagination, InputAdornment, FormControl, InputLabel, Select, MenuItem, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, IconButton, Grid, Button, Card } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OrderCard from '../order/OrderCard';
import OrderDetails from '../order/OrderDetails';
import { getAllPassengers, getTravelById, getAllOrders } from '../../services/PaymentService';
import { cancelOrder, cancelReservation } from '../../services/OrderService';
import { validateMasterPassword } from '../../utils/utils';
import { getMasterPasswordStatus } from '../../services/AuthService';

const Receivables = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [travels, setTravels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredPaid, setFilteredPaid] = useState([]);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [travelIdState, setTravelIdState] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);
  const itemsPerPage = 10;

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedOrders = await getAllOrders();
        const fetchedPassengers = await getAllPassengers();
        setPassengers(fetchedPassengers);
        setOrders(fetchedOrders);

        const travelIds = new Set(fetchedOrders.map(order => order.travelId));
        const travelData = {};
        for (const id of travelIds) {
          travelData[id] = await getTravelById(id);
        }
        setTravels(travelData);
        setError('');
      } catch (err) {
        setError('Falha ao carregar pedidos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMasterPasswordStatus = async () => {
      const status = await getMasterPasswordStatus();
      setMasterPasswordActive(status);
    };

    fetchMasterPasswordStatus();
  }, []);

  useEffect(() => {
    const today = new Date();
    setMonthFilter(today.getMonth() + 1); // Mês atual (Janeiro é 0)
    setYearFilter(today.getFullYear()); // Ano atual
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const isMonthYearMatch = travelId => {
      const travel = travels[travelId];
      if (travel) {
        const date = new Date(travel.dataIda);
        const monthMatch = monthFilter
          ? date.getMonth() + 1 === parseInt(monthFilter, 10)
          : true;
        const yearMatch = yearFilter
          ? date.getFullYear() === parseInt(yearFilter, 10)
          : true;
        return monthMatch && yearMatch;
      }
      return false;
    };

    const filteredPendingOrders = orders.filter(order => {
      const orderMatchesSearchTerm =
        order.id.toLowerCase().includes(lowercasedFilter) ||
        order.reservations.some(reservation => {
          const passenger =
            passengers.find(p => p.id === reservation.passengerId) || {};
          return (
            passenger.nome?.toLowerCase().includes(lowercasedFilter) ||
            passenger.cpf?.toLowerCase().includes(lowercasedFilter) ||
            passenger.passaporte?.toLowerCase().includes(lowercasedFilter) ||
            passenger.rg?.toLowerCase().includes(lowercasedFilter)
          );
        });

      const orderHasPendingPayment =
        order.status !== 'Cancelada' &&
        parseFloat(order.detalhesPagamento?.valorRestante || 0) > 0 &&
        isMonthYearMatch(order.travelId);

      return orderMatchesSearchTerm && orderHasPendingPayment;
    });

    const filteredPaidOrders = orders.filter(order => {
      const orderMatchesSearchTerm =
        order.id.toLowerCase().includes(lowercasedFilter) ||
        order.reservations.some(reservation => {
          const passenger =
            passengers.find(p => p.id === reservation.passengerId) || {};
          return (
            passenger.nome?.toLowerCase().includes(lowercasedFilter) ||
            passenger.cpf?.toLowerCase().includes(lowercasedFilter) ||
            passenger.rg?.toLowerCase().includes(lowercasedFilter)
          );
        });

      const orderHasPaidPayment =
        order.status !== 'Cancelada' &&
        parseFloat(order.detalhesPagamento?.valorRestante || 0) === 0 &&
        isMonthYearMatch(order.travelId);

      return orderMatchesSearchTerm && orderHasPaidPayment;
    });

    setFilteredPending(filteredPendingOrders);
    setFilteredPaid(filteredPaidOrders);
  }, [searchTerm, orders, passengers, monthFilter, yearFilter, travels]);

  const handleSearchChange = e => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm('');
  const handleMonthFilterChange = e =>
    setMonthFilter(e.target.value === '' ? '' : parseInt(e.target.value, 10));
  const handleYearFilterChange = e =>
    setYearFilter(e.target.value === '' ? '' : parseInt(e.target.value, 10));
  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleEditReservation = (reservation, orderId) => {
    const passenger =
      passengers.find(p => p.id === reservation.passengerId) || {};
    navigate(`/viagens/${reservation.travelId}/alocar-passageiros`, {
      state: {
        selectedSeats: [{ number: reservation.numeroAssento }],
        editingReservation: { ...reservation, orderId, passenger },
        editingOrderId: orderId,
      },
    });
  };

  const handleEditOrder = order => {
    order.reservations.forEach(reservation =>
      handleEditReservation(reservation, order.id)
    );
  };

  const handleCancelOrder = (orderId, travelId) => {
    setCancelOrderId(orderId);
    setCancelReservationId(null);
    setTravelIdState(travelId);
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
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }

      if (cancelReservationId) {
        await cancelReservation(
          travelIdState,
          cancelOrderId,
          cancelReservationId
        );
        setSnackbarMessage('Reserva cancelada com sucesso.');
      } else {
        await cancelOrder(travelIdState, cancelOrderId);
        setSnackbarMessage('Pedido cancelado com sucesso.');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);

      const travelIds = new Set(fetchedOrders.map(order => order.travelId));
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
  const currentPendingItems = useMemo(
    () => filteredPending.slice(indexOfFirstItem, indexOfLastItem),
    [filteredPending, indexOfFirstItem, indexOfLastItem]
  );
  const currentPaidItems = useMemo(
    () => filteredPaid.slice(indexOfFirstItem, indexOfLastItem),
    [filteredPaid, indexOfFirstItem, indexOfLastItem]
  );

  const handleOpenModal = order => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleClickShowMasterPassword = () =>
    setShowMasterPassword(!showMasterPassword);

  const calculateTotals = orders => {
    let totalReceivable = 0;
    let totalReceived = 0;

    orders.forEach(order => {
      if (order.status !== 'Cancelada') {
        const travel = travels[order.travelId];
        if (travel) {
          const date = new Date(travel.dataIda);
          const monthMatch = monthFilter
            ? date.getMonth() + 1 === parseInt(monthFilter, 10)
            : true;
          const yearMatch = yearFilter
            ? date.getFullYear() === parseInt(yearFilter, 10)
            : true;
          if (monthMatch && yearMatch) {
            totalReceived += parseFloat(order.detalhesPagamento?.valorPago || 0);
            totalReceivable += parseFloat(
              order.detalhesPagamento?.valorRestante || 0
            );
          }
        }
      }
    });

    return { totalReceivable, totalReceived };
  };

  const { totalReceivable, totalReceived } = calculateTotals(
    filteredPending.concat(filteredPaid)
  );

  const getUniqueYears = () => {
    const years = new Set();
    Object.values(travels).forEach(travel => {
      const year = new Date(travel.dataIda).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => a - b);
  };

  const renderCancelDialogContent = () => {
    if (cancelOrderId) {
      const order = orders.find(o => o.id === cancelOrderId);
      const passenger = passengers.find(p => p.id === order?.passengerId);
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Informações do Pagador</Typography>
          <Typography variant="body2">Pedido ID: {cancelOrderId}</Typography>
          <Typography variant="body2">Nome: {order?.detalhesPagamento?.nomePagador || 'Não informado'}</Typography>
          <Typography variant="body2">CPF: {order?.detalhesPagamento?.cpfPagador || 'Não informado'}</Typography>
          <Typography variant="body2">RG: {order?.detalhesPagamento?.rgPagador || 'Não informado'}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} marginBottom={2}>
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
              ) : null,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="month-filter-label">Filtrar por Mês</InputLabel>
            <Select
              labelId="month-filter-label"
              id="month-filter"
              value={monthFilter === '' ? '' : monthFilter}
              onChange={handleMonthFilterChange}
              label="Filtrar por Mês"
            >
              <MenuItem value="">Todos</MenuItem>
              {monthNames.map((month, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="year-filter-label">Filtrar por Ano</InputLabel>
            <Select
              labelId="year-filter-label"
              id="year-filter"
              value={yearFilter === '' ? '' : yearFilter}
              onChange={handleYearFilterChange}
              label="Filtrar por Ano"
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniqueYears().map((year, index) => (
                <MenuItem key={index} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: '50px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total a Receber</Typography>
                </Box>
                <Typography variant="h6">
                  R$ {totalReceivable.toFixed(2)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: '50px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Recebido</Typography>
                </Box>
                <Typography variant="h6">
                  R$ {totalReceived.toFixed(2)}
                </Typography>
              </Card>
            </Grid>
          </Grid>
          {filteredPending.length === 0 && filteredPaid.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1">
                Nenhum pedido a receber encontrado.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pedidos com Pagamento Pendente
              </Typography>
              {currentPendingItems.length > 0 ? (
                currentPendingItems.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    passengers={passengers}
                    travel={travels[order.travelId]}
                    onEditOrder={handleEditOrder}
                    onCancelOrder={handleCancelOrder}
                    onCardClick={handleOpenModal}
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Nenhum pedido com pagamento pendente encontrado para o mês e
                  ano selecionados.
                </Typography>
              )}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Pedidos Pagos
              </Typography>
              {currentPaidItems.length > 0 ? (
                currentPaidItems.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    passengers={passengers}
                    travel={travels[order.travelId]}
                    onEditOrder={handleEditOrder}
                    onCancelOrder={handleCancelOrder}
                    onCardClick={handleOpenModal}
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Nenhum pedido com pagamento pago encontrado para o mês e ano
                  selecionados.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      <Pagination
        count={
          Math.ceil(filteredPending.length / itemsPerPage) +
          Math.ceil(filteredPaid.length / itemsPerPage)
        }
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
        sx={{ mt: 2 }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
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
          {renderCancelDialogContent()}
          {masterPasswordActive && (
            <TextField
              margin="normal"
              fullWidth
              label="Senha Master"
              type={showMasterPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
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
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            color="cancelar"
            variant="contained"
            disabled={cancelLoading}
            sx={{ color: 'white', borderRadius: '50px' }}
          >
            Voltar
          </Button>
          <Button
            onClick={confirmCancelOrder}
            variant="contained"
            color="confirmar"
            autoFocus
            disabled={(masterPasswordActive && !masterPassword) || cancelLoading}
            sx={{ color: 'white', borderRadius: '50px' }}
          >
            {cancelLoading ? (
              <CircularProgress size={24} />
            ) : cancelReservationId ? (
              'Cancelar reserva'
            ) : (
              'Cancelar pedido'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={modalOpen} onClose={handleCloseModal}>
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
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              passengers={passengers}
              travel={travels[selectedOrder.travelId]}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              color="primary"
              sx={{ borderRadius: '50px' }}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Receivables;

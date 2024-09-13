import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, CircularProgress, Pagination, Modal, TextField, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ReservationCard from '../reservation/ReservationCard';
import ReservationDetails from '../reservation/ReservationDetails';
import { formatCPF, formatDate, formatTelefone, validateMasterPassword } from '../../utils/utils';
import { getPassengerReservations, getPassengerById } from '../../services/PassengerService';
import { getTravelById } from '../../services/TravelService';
import { getOrderById, cancelReservation } from '../../services/OrderService';
import { getMasterPasswordStatus } from '../../services/AuthService';

const PassengerDetails = ({ passenger, open, onClose, onEditReservation, onReservationCancel }) => {
  const [reservas, setReservas] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [travelIdState, setTravelIdState] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);
  const [responsavel, setResponsavel] = useState(null); // Armazenar dados do responsável
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    if (open && passenger) {
      const fetchReservations = async () => {
        setLoading(true);
        try {
          const fetchedReservations = await getPassengerReservations(passenger.id);

          const groupedOrders = {};

          await Promise.all(fetchedReservations.map(async (reserva) => {
            if (!groupedOrders[reserva.orderId]) {
              groupedOrders[reserva.orderId] = { reservations: [], travel: null, detalhesPagamento: null };
            }

            groupedOrders[reserva.orderId].reservations.push(reserva);

            if (!groupedOrders[reserva.orderId].travel) {
              const travel = await getTravelById(reserva.travelId);
              groupedOrders[reserva.orderId].travel = travel;
            }

            if (!groupedOrders[reserva.orderId].detalhesPagamento) {
              const orderDetails = await getOrderById(reserva.travelId, reserva.orderId);
              groupedOrders[reserva.orderId].detalhesPagamento = orderDetails.detalhesPagamento;
            }
          }));

          setOrders(groupedOrders);
          setReservas(fetchedReservations);
        } catch (error) {
          console.error('Erro ao buscar reservas e pedidos do passageiro:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchReservations();

      // Se o passageiro for menor de idade, buscar as informações do responsável
      if (passenger.menorDeIdade && passenger.responsavelId) {
        const fetchResponsavel = async () => {
          try {
            const responsavelData = await getPassengerById(passenger.responsavelId);
            setResponsavel(responsavelData); // Armazenar as informações do responsável
          } catch (error) {
            console.error('Erro ao buscar informações do responsável:', error);
          }
        };
        fetchResponsavel();
      }
    }
  }, [open, passenger]);

  useEffect(() => {
    const fetchMasterPasswordStatus = async () => {
      const status = await getMasterPasswordStatus();
      setMasterPasswordActive(status);
    };

    fetchMasterPasswordStatus();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenModal = (reservation) => {
    setSelectedReservation(reservation);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReservation(null);
  };

  const handleEditReservation = (reservation, orderId) => {
    const passengerDetails = { ...passenger };
    navigate(`/viagens/${reservation.travelId}/alocar-passageiros`, {
      state: {
        selectedSeats: [{ number: reservation.numeroAssento }],
        editingReservation: { ...reservation, orderId, passenger: passengerDetails },
        editingOrderId: orderId,
      },
    });
  };

  const handleCancelReservation = (reservationId, orderId, travelId) => {
    setCancelReservationId(reservationId);
    setCancelOrderId(orderId);
    setTravelIdState(travelId);
    setCancelDialogOpen(true);
  };

  const confirmCancelReservation = async () => {
    setCancelLoading(true);

    try {
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }

      if (cancelReservationId) {
        await cancelReservation(travelIdState, cancelOrderId, cancelReservationId);

        const updatedReservations = reservas.map((r) =>
          r.id === cancelReservationId ? { ...r, status: 'Cancelada' } : r
        );
        setReservas(updatedReservations);

        setSnackbarMessage('Reserva cancelada com sucesso.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (onReservationCancel) {
          onReservationCancel();
        }
      }

      setCancelDialogOpen(false);
      setMasterPassword(''); // Limpa o campo de senha master
    } catch (err) {
      console.error('Falha ao cancelar a reserva:', err);

      setSnackbarMessage(err.message || 'Falha ao cancelar a reserva.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCancelLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reservas.slice(indexOfFirstItem, indexOfLastItem);

  const handleClickShowMasterPassword = () => setShowMasterPassword(!showMasterPassword);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="passenger-details-title" maxWidth="sm" fullWidth>
      <DialogTitle id="passenger-details-title">Detalhes do Passageiro</DialogTitle>
      <DialogContent>
        {passenger && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {passenger.nome}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                  <strong>CPF:</strong> {passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}
                </Typography>
                {passenger.rg && (
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                    <strong>RG:</strong> {passenger.rg}
                  </Typography>
                )}
                {passenger.passaporte && (
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                    <strong>Passaporte:</strong> {passenger.passaporte}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                  <strong>Data de Nascimento:</strong> {formatDate(passenger.dataNascimento)}
                </Typography>
                {passenger.menorDeIdade && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', wordBreak: 'break-word', mb: 1 }}>
                    <strong>Menor de Idade</strong> <VerifiedUserIcon sx={{ ml: 1, color: 'green' }} />
                  </Typography>
                )}
                {passenger.estrangeiro && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', wordBreak: 'break-word', mb: 1 }}>
                    <strong>Estrangeiro</strong> <VerifiedUserIcon sx={{ ml: 1, color: 'green' }} />
                  </Typography>
                )}
              </Box>
            </Box>

            {passenger.telefone && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <ContactPhoneIcon />
                  </Avatar>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    <strong>Telefone:</strong> {formatTelefone(passenger.telefone)}
                  </Typography>
                </Box>
              </>
            )}

            {passenger.endereco && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <HomeIcon />
                  </Avatar>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    <strong>Endereço:</strong> {passenger.endereco}
                  </Typography>
                </Box>
              </>
            )}

            {/* Exibição das informações do responsável */}
            {passenger.menorDeIdade && responsavel && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <Box>
                    {responsavel.nome && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Nome do Responsável:</strong> {responsavel.nome}
                      </Typography>
                    )}
                    {responsavel.cpf && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>CPF do Responsável:</strong> {formatCPF(responsavel.cpf)}
                      </Typography>
                    )}
                    {responsavel.estrangeiro ? (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Passaporte do Responsável:</strong> {responsavel.passaporte}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>RG do Responsável:</strong> {responsavel.rg}
                      </Typography>
                    )}
                    {responsavel.telefone && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Telefone do Responsável:</strong> {formatTelefone(responsavel.telefone)}
                      </Typography>
                    )}
                    {responsavel.estrangeiro && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', wordBreak: 'break-word', mb: 1 }}>
                        <strong>Responsável Estrangeiro</strong> <VerifiedUserIcon sx={{ ml: 1, color: 'green' }} />
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="body2">Buscando reservas...</Typography>
              </Box>
            ) : reservas.length > 0 ? (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <PermContactCalendarIcon />
                  </Avatar>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                    <strong>Reservas:</strong>
                  </Typography>
                </Box>
                {currentItems.map((reserva, index) => (
                  <ReservationCard
                    key={index}
                    reservation={reserva}
                    passengers={[passenger]} // Passando o passageiro atual
                    travel={orders[reserva.orderId]?.travel}
                    onEditReservation={handleEditReservation}
                    onCancelReservation={handleCancelReservation}
                    onCardClick={() => handleOpenModal(reserva)} // Usando a função handleOpenModal
                  />
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(reservas.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ wordBreak: 'break-word', mt: 2 }}>
                Nenhuma reserva encontrada.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </DialogActions>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza de que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</Typography>
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
                    <IconButton aria-label="toggle master password visibility" onClick={handleClickShowMasterPassword} edge="end">
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
          <Button onClick={() => setCancelDialogOpen(false)} color="cancelar" variant="contained" disabled={cancelLoading} sx={{ color: 'white' }}>
            Não
          </Button>
          <Button
            onClick={confirmCancelReservation}
            variant="contained"
            color="confirmar"
            autoFocus
            disabled={(masterPasswordActive && !masterPassword) || cancelLoading}
            sx={{ color: 'white' }}
          >
            {cancelLoading ? <CircularProgress size={24} /> : 'Cancelar reserva'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
            Detalhes da Reserva
          </Typography>
          {selectedReservation && (
            <ReservationDetails
              reservation={selectedReservation}
              passengers={[passenger]}
              travel={orders[selectedReservation.orderId]?.travel}
              detalhesPagamento={selectedReservation.detalhesPagamento} // Passando detalhes de pagamento
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleCloseModal} variant="contained" color="primary">
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Dialog>
  );
};

export default PassengerDetails;

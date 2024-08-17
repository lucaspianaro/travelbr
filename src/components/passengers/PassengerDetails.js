import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, CircularProgress, Pagination, Modal
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { formatCPF, formatDate, formatTelefone } from '../../utils/utils';
import { getPassengerReservations } from '../../services/PassengerService';
import { getTravelById } from '../../services/TravelService';
import ReservationCard from '../reservation/ReservationCard';
import ReservationDetails from '../reservation/ReservationDetails';
import { getOrderById } from '../../services/TravelService';

const PassengerDetails = ({ passenger, open, onClose, onEditReservation, onCancelReservation }) => {
  const [reservas, setReservas] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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
              try {
                const orderDetails = await getOrderById(reserva.travelId, reserva.orderId);
                groupedOrders[reserva.orderId].detalhesPagamento = orderDetails.detalhesPagamento;
              } catch (error) {
                console.error("Erro ao buscar detalhes do pedido:", error);
              }
            }
          }));

          // Adicionar detalhes de pagamento e pagador às reservas
          const reservasComDetalhes = fetchedReservations.map(reserva => ({
            ...reserva,
            detalhesPagamento: groupedOrders[reserva.orderId]?.detalhesPagamento || {}
          }));

          setOrders(groupedOrders);
          setReservas(reservasComDetalhes);
        } catch (error) {
          console.error('Erro ao buscar reservas e pedidos do passageiro:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchReservations();
    }
  }, [open, passenger]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reservas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="passenger-details-title"
      maxWidth="sm"
      fullWidth
    >
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

            {(passenger.nomeResponsavel || passenger.cpfResponsavel || passenger.rgResponsavel || passenger.passaporteResponsavel || passenger.telefoneResponsavel) && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <Box>
                    {passenger.nomeResponsavel && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Nome do Responsável:</strong> {passenger.nomeResponsavel}
                      </Typography>
                    )}
                    {passenger.cpfResponsavel && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>CPF do Responsável:</strong> {formatCPF(passenger.cpfResponsavel)}
                      </Typography>
                    )}
                    {passenger.estrangeiroResponsavel ? (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Passaporte do Responsável:</strong> {passenger.passaporteResponsavel}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>RG do Responsável:</strong> {passenger.rgResponsavel}
                      </Typography>
                    )}
                    {passenger.telefoneResponsavel && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                        <strong>Telefone do Responsável:</strong> {formatTelefone(passenger.telefoneResponsavel)}
                      </Typography>
                    )}
                    {passenger.estrangeiroResponsavel && (
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
                    passengers={[passenger]}  // Passando o passageiro atual
                    travel={orders[reserva.orderId]?.travel}
                    onEditReservation={onEditReservation}
                    onCancelReservation={onCancelReservation}
                    onCardClick={() => handleOpenModal(reserva)}  // Usando a função handleOpenModal
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
        <Button onClick={onClose} variant='contained' color="primary">Fechar</Button>
      </DialogActions>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
      >
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
            Detalhes da Reserva
          </Typography>
          {selectedReservation && (
            <ReservationDetails 
              reservation={selectedReservation}
              passengers={[passenger]}
              travel={orders[selectedReservation.orderId]?.travel}
              detalhesPagamento={selectedReservation.detalhesPagamento}  // Passando detalhes de pagamento
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleCloseModal} variant="contained" color="primary">Fechar</Button>
          </Box>
        </Box>
      </Modal>
    </Dialog>
  );
};

export default PassengerDetails;

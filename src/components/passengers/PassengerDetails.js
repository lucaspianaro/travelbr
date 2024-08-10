import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Avatar,
  List, ListItem, ListItemText, CircularProgress, Pagination
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { formatCPF, formatDate, formatTelefone } from '../../utils/utils';
import { getPassengerReservations } from '../../services/PassengerService';
import { getTravelById } from '../../services/TravelService';

// Componente que exibe os detalhes de um passageiro, incluindo suas reservas
const PassengerDetails = ({ passenger, open, onClose }) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Efeito que busca as reservas do passageiro quando o diálogo é aberto
  useEffect(() => {
    if (open && passenger) {
      const fetchReservations = async () => {
        setLoading(true);
        try {
          const fetchedReservations = await getPassengerReservations(passenger.id);
          const reservationsWithTravelDetails = await Promise.all(
            fetchedReservations.map(async (reserva) => {
              try {
                const travel = await getTravelById(reserva.travelId);
                return {
                  ...reserva,
                  travel
                };
              } catch (error) {
                console.error(`Erro ao buscar detalhes da viagem para travelId ${reserva.travelId}:`, error);
                return {
                  ...reserva,
                  travel: null
                };
              }
            })
          );
          setReservas(reservationsWithTravelDetails);
        } catch (error) {
          console.error('Erro ao buscar reservas do passageiro:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchReservations();
    }
  }, [open, passenger]);

  // Função para mudar a página da paginação
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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
                {passenger.menorDeIdade && passenger.estrangeiro ? (
                  <>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>Passaporte:</strong> {passenger.passaporte}
                    </Typography>
                  </>
                ) : passenger.menorDeIdade ? (
                  <>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>RG ou Certidão de Nascimento:</strong> {passenger.rg}
                    </Typography>
                  </>
                ) : passenger.estrangeiro ? (
                  <>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>Passaporte:</strong> {passenger.passaporte}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>RG:</strong> {passenger.rg}
                    </Typography>
                  </>
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
                <List>
                  {currentItems.map((reserva, index) => (
                    <ListItem key={index} sx={{ backgroundColor: reserva.status === 'Cancelada' ? '#ffebee' : '#e8f5e9', borderRadius: 1, mb: 1 }}>
                      <Avatar sx={{ bgcolor: reserva.status === 'Cancelada' ? '#f44336' : '#4caf50', mr: 2 }}>
                        {reserva.status === 'Cancelada' ? <CancelIcon /> : <CheckCircleIcon />}
                      </Avatar>
                      <ListItemText
                        primary={`${reserva.travel ? `${reserva.travel.identificador} - ${reserva.travel.origem} -> ${reserva.travel.destino}` : 'Informações da viagem não disponíveis'}`}
                        secondary={`Data: ${reserva.travel ? formatDate(reserva.travel.dataIda) : 'N/A'} - Assento: ${reserva.numeroAssento} ${reserva.status === 'Cancelada' ? '(Cancelada)' : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
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
    </Dialog>
  );
};

export default PassengerDetails;

import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Tooltip, IconButton, Divider, Avatar, Collapse } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatCPF, formatDate } from '../../utils/utils';

const ReservationCard = ({ reservation, passengers, travel, onEditReservation, onCancelReservation, onCardClick, hideTravelInfo }) => {
  const [expanded, setExpanded] = useState(false);

  // Encontrar o passageiro correspondente à reserva
  const passenger = passengers.find(p => p.id === reservation.passengerId) || {};

  // Definir a cor do status da reserva com base no status salvo no backend
  const status = reservation.status;
  const statusColor = status === 'Pago' ? 'green' : status === 'Cancelada' ? 'red' : 'gold';

  // Função para formatar o rótulo com as informações do passageiro
  const getPassengerLabel = (passenger) => (
    <>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        CPF: {passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}
      </Typography>
      {passenger.estrangeiro ? (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          Passaporte: {passenger.passaporte || 'Não informado'}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          RG: {passenger.rg || 'Não informado'}
        </Typography>
      )}
    </>
  );

  const handleExpandClick = (e) => {
    e.stopPropagation(); // Impede que o onCardClick seja disparado ao expandir
    setExpanded(!expanded);
  };

  return (
    <Card
      onClick={() => onCardClick(reservation)}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra padrão aumentada
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' }, // Sombra aumentada no hover
        mb: 1,
        borderRadius: 2,
        flex: 1
      }}
    >
      <CardContent sx={{ padding: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '75%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {passenger.nome || 'Nome não informado'}
                </Typography>
                {getPassengerLabel(passenger)}
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              Assento: {reservation.numeroAssento}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={`Status: ${status}`}>
              {status === 'Pago' ? (
                <CheckCircleIcon sx={{ color: 'green' }} />
              ) : status === 'Cancelada' ? (
                <CancelIcon sx={{ color: 'red' }} />
              ) : (
                <ErrorIcon sx={{ color: 'gold' }} />
              )}
            </Tooltip>

            {!hideTravelInfo && (
              <Tooltip title={expanded ? 'Fechar' : 'Expandir'}>
                <IconButton onClick={handleExpandClick}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Editar">
              <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEditReservation(reservation, reservation.orderId); }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            {status !== 'Cancelada' && (
              <Tooltip title="Cancelar">
                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onCancelReservation(reservation.id, reservation.orderId, reservation.travelId); }}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 1 }} />
          {/* Informações adicionais da viagem e do passageiro exibidas ao expandir */}
          {!hideTravelInfo && travel && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Identificador: {travel?.identificador || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Origem: {travel?.origem || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Destino: {travel?.destino || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Data de Ida: {travel?.dataIda ? formatDate(travel.dataIda) : 'Não informada'}
                </Typography>
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;

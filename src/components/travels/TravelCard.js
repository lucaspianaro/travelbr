import React, { useState, useEffect } from 'react';
import {
  Typography, IconButton, Box, Tooltip, Button, Grid, Card, CardContent, CardActions, Divider, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import { getReservedSeats } from '../../services/TravelService';
import { formatDate } from '../../utils/utils';

const statusStyles = {
  'Cancelada': { color: '#d27519', text: 'Cancelada' },
  'Em andamento': { color: '#4CAF50', text: 'Em andamento' },
  'Próxima': { color: '#2196F3', text: 'Próxima' },
  'Encerrada': { color: '#9E9E9E', text: 'Encerrada' },
  'Criada': { color: '#90CAF9', text: 'Criada' },
  'Indefinido': { color: '#9E9E9E', text: 'Indefinido' }
};

function TravelCard({ travels, startEditing, handleDelete, handleCancel }) {
  const navigate = useNavigate();
  const [reservedSeatsData, setReservedSeatsData] = useState({});

  useEffect(() => {
    const fetchReservedSeats = async () => {
      const data = {};
      for (const travel of travels) {
        const reservedSeats = await getReservedSeats(travel.id);
        const activeSeats = reservedSeats.filter(reservation => reservation.status !== 'Cancelada').length;
        data[travel.id] = activeSeats;
      }
      setReservedSeatsData(data);
    };
    fetchReservedSeats();
  }, [travels]);

  const handleViewReservations = (travelId, e) => {
    e.stopPropagation();
    navigate(`/viagens/${travelId}/reservas`);
  };

  const buttonStyle = { flex: 1, minWidth: '100px', maxWidth: '150px' };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {travels.length > 0 ? (
          travels.map(travel => {
            const status = statusStyles[travel.status] || statusStyles['Indefinido'];
            const totalSeats = (parseInt(travel.assentosAndar1, 10) || 0) + (parseInt(travel.assentosAndar2, 10) || 0);
            const occupiedSeats = reservedSeatsData[travel.id] || 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={travel.id}>
                <Card
                  onClick={() => navigate(`/viagens/${travel.id}`)}
                  sx={{
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra padrão aumentada
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' }, // Sombra aumentada no hover
                    mb: 1,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Chip label={status.text} sx={{ backgroundColor: status.color, color: 'white' }} />
                    {travel.identificador && (
                      <Chip label={`ID: ${travel.identificador}`} color="primary" />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6" noWrap>{travel.origem}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1 }} color="secondary" />
                      <Typography variant="h6" noWrap>{travel.destino}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DateRangeIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">Data de Ida: {formatDate(travel.dataIda)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">Hora: {travel.horarioIda}</Typography>
                      </Box>
                    </Box>
                    {travel.somenteIda ? (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">Viagem somente de ida</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateRangeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Data de Retorno: {formatDate(travel.dataRetorno)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Hora: {travel.horarioRetorno}</Typography>
                        </Box>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBusIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {travel.veiculo ? (
                          `${travel.veiculo.identificadorVeiculo} - ${travel.veiculo.placa} (${travel.veiculo.empresa})`
                        ) : (
                          `Nenhum veículo associado`
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AirlineSeatReclineNormalIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {travel.veiculo ? (
                          `Assentos Ocupados: ${occupiedSeats}/${totalSeats}`
                        ) : (
                          `Reservas: ${occupiedSeats || 'Nenhuma Reserva'}`
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {travel.status !== 'Cancelada' && (
                        <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon />} sx={buttonStyle} onClick={(e) => { e.stopPropagation(); startEditing(travel); }}>Editar</Button>
                      )}
                      <Button size="small" variant="outlined" color="primary" startIcon={<ListIcon />} sx={buttonStyle} onClick={(e) => handleViewReservations(travel.id, e)}>Reservas</Button>
                      {travel.status !== 'Cancelada' && travel.status !== 'Encerrada' && (
                        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} sx={buttonStyle} onClick={(e) => { e.stopPropagation(); handleCancel(travel); }}>Cancelar</Button>
                      )}
                    </Box>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDelete(travel); }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Typography variant="body1" sx={{ m: 2 }}>
            Nenhuma viagem encontrada.
          </Typography>
        )}
      </Grid>
    </Box>
  );
}

export default TravelCard;

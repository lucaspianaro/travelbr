import React, { useState, useEffect } from 'react';
import {
  Typography, IconButton, Box, Tooltip, Button, Grid, Card, CardContent, CardActions, Divider, Chip, Menu, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ListIcon from '@mui/icons-material/List';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import { getReservedSeats } from '../../services/OrderService';
import { formatDate } from '../../utils/utils';

const statusStyles = {
  'Cancelada': { color: '#d27519', text: 'Cancelada' },
  'Em andamento': { color: '#4CAF50', text: 'Em andamento' },
  'Próxima': { color: '#2196F3', text: 'Próxima' },
  'Encerrada': { color: '#9E9E9E', text: 'Encerrada' },
  'Criada': { color: '#90CAF9', text: 'Criada' },
  'Indefinido': { color: '#9E9E9E', text: 'Indefinido' }
};

function TravelCard({ travels, startEditing, handleDelete, handleCancel, hideActions, stacked }) {
  const navigate = useNavigate();
  const [reservedSeatsData, setReservedSeatsData] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTravel, setCurrentTravel] = useState(null);

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
    e.stopPropagation();  // Evita o clique no card
    navigate(`/viagens/${travelId}/reservas`);
  };

  const handleViewCosts = (travelId, e) => {
    e.stopPropagation();  // Evita o clique no card
    navigate(`/viagens/${travelId}/custos`);
  };

  const handleOpenMenu = (e, travel) => {
    e.stopPropagation();  // Evita o clique no card
    setAnchorEl(e.currentTarget);
    setCurrentTravel(travel);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentTravel(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();  // Evita o clique no card
    startEditing(currentTravel);
    handleCloseMenu();
  };

  const handleCancelTravel = (e) => {
    e.stopPropagation();  // Evita o clique no card
    handleCancel(currentTravel);
    handleCloseMenu();
  };

  const handleDeleteTravel = (e) => {
    e.stopPropagation();  // Evita o clique no card
    handleDelete(currentTravel);
    handleCloseMenu();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={stacked ? 0 : 2} direction={stacked ? 'column' : 'row'}>
        {travels.length > 0 ? (
          travels.map(travel => {
            const status = statusStyles[travel.status] || statusStyles['Indefinido'];
            const totalSeats = (parseInt(travel.assentosAndar1, 10) || 0) + (parseInt(travel.assentosAndar2, 10) || 0);
            const occupiedSeats = reservedSeatsData[travel.id] || 0;

            return (
              <Grid 
                item 
                xs={12} 
                sm={stacked ? 12 : 6} 
                md={stacked ? 12 : 4} 
                key={travel.id} 
              >
                <Card
                  onClick={() => navigate(`/viagens/${travel.id}`)}
                  sx={{
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
                    mb: 2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Chip label={status.text} sx={{ backgroundColor: status.color, color: 'white' }} />
                    {travel.identificador && (
                      <Chip label={`ID: ${travel.identificador}`} color="primary" />
                    )}
                    {!hideActions && travel.status !== 'Cancelada' && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, travel)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
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

                  {!hideActions && (
                    <CardActions sx={{ justifyContent: 'space-between', padding: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<ListIcon />}
                          onClick={(e) => handleViewReservations(travel.id, e)}
                          sx={{ borderRadius: '50px' }}
                        >
                          Reservas
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<AttachMoneyIcon />}
                          onClick={(e) => handleViewCosts(travel.id, e)}
                          sx={{ borderRadius: '50px' }}
                        >
                          Custos
                        </Button>
                      </Box>
                    </CardActions>
                  )}
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

      {/* Menu de opções para editar, cancelar ou excluir */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
          },
        }}
      >
        {currentTravel && currentTravel.status !== 'Cancelada' && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" /> Editar
          </MenuItem>
        )}
        {currentTravel && currentTravel.status !== 'Encerrada' && currentTravel.status !== 'Cancelada' && (
          <MenuItem onClick={handleCancelTravel}>
            <CancelIcon fontSize="small" /> Cancelar
          </MenuItem>
        )}
        {currentTravel && currentTravel.status !== 'Encerrada' && currentTravel.status !== 'Cancelada' && (
          <MenuItem onClick={handleDeleteTravel}>
            <DeleteIcon fontSize="small" /> Excluir
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default TravelCard;

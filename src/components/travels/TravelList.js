import React, { useState, useEffect } from 'react';
import {
  Typography, Box, IconButton, Tooltip, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Chip, Menu, MenuItem, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ListIcon from '@mui/icons-material/List';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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

function TravelList({ travels, startEditing, handleDelete, handleCancel }) {
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
    e.stopPropagation();
    navigate(`/viagens/${travelId}/reservas`);
  };

  const handleViewCosts = (travelId, e) => {
    e.stopPropagation();
    navigate(`/viagens/${travelId}/custos`);
  };

  const handleOpenMenu = (e, travel) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentTravel(travel);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentTravel(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    startEditing(currentTravel);
    handleCloseMenu();
  };

  const handleCancelTravel = (e) => {
    e.stopPropagation();
    handleCancel(currentTravel);
    handleCloseMenu();
  };

  const handleDeleteTravel = (e) => {
    e.stopPropagation();
    handleDelete(currentTravel);
    handleCloseMenu();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <List>
        {travels.length > 0 ? (
          travels.map(travel => {
            const status = statusStyles[travel.status] || statusStyles['Indefinido'];
            const totalSeats = (parseInt(travel.assentosAndar1, 10) || 0) + (parseInt(travel.assentosAndar2, 10) || 0);
            const occupiedSeats = reservedSeatsData[travel.id] || 0;

            return (
              <React.Fragment key={travel.id}>
                <ListItem
                  button
                  onClick={() => navigate(`/viagens/${travel.id}`)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6">{travel.origem} ➔ {travel.destino}</Typography>
                      <Typography variant="body2" color="textSecondary">Data de Ida: {formatDate(travel.dataIda)}</Typography>
                      {travel.somenteIda ? (
                        <Typography variant="body2" color="textSecondary">Viagem somente de ida</Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">Data de Retorno: {formatDate(travel.dataRetorno)}</Typography>
                      )}
                      <Typography variant="body2" color="textSecondary">Assentos Ocupados: {occupiedSeats}/{totalSeats}</Typography>
                      <Typography variant="body2" color="textSecondary">Veículo: {travel.veiculo ? `${travel.veiculo.identificadorVeiculo} - ${travel.veiculo.placa}` : 'Nenhum veículo associado'}</Typography>
                    </Box>

                    <Box>
                      <Chip label={status.text} sx={{ backgroundColor: status.color, color: 'white', mb: 1 }} />
                      <IconButton onClick={(e) => handleOpenMenu(e, travel)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <ListItemSecondaryAction sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<ListIcon />}
                      onClick={(e) => handleViewReservations(travel.id, e)}
                      sx={{ borderRadius: '50px', mr: 1 }}
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
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })
        ) : (
          <Typography variant="body1" sx={{ m: 2 }}>
            Nenhuma viagem encontrada.
          </Typography>
        )}
      </List>

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

export default TravelList;

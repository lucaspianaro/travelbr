import React from 'react';
import { Card, CardContent, Box, Typography, Tooltip, IconButton, Avatar, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BusinessIcon from '@mui/icons-material/Business';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { formatPlate } from '../../utils/utils';

/**
 * Componente que exibe informações de um veículo em um cartão.
 * @param {Object} vehicle - Objeto contendo os dados do veículo.
 * @param {Function} onEdit - Função a ser chamada quando o botão de editar for clicado.
 * @param {Function} onDelete - Função a ser chamada quando o botão de excluir for clicado.
 * @param {Function} onCardClick - Função a ser chamada quando o cartão for clicado.
 */
const VehicleCard = ({ vehicle, onEdit, onDelete, onCardClick }) => {
  return (
    <Card
      onClick={() => onCardClick(vehicle)}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra padrão aumentada
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' }, // Sombra aumentada no hover
        mb: 1,
        borderRadius: 2,
        width: '100%',
      }}
    >
      <CardContent sx={{ padding: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 28, height: 28 }}>
              <DirectionsBusIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {vehicle.identificadorVeiculo}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Placa: {formatPlate(vehicle.placa)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Editar">
              <IconButton size="small" edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton size="small" edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onDelete(vehicle); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BusinessIcon fontSize="small" />
            <Typography variant="caption">Empresa: {vehicle.empresa}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventSeatIcon fontSize="small" />
            <Typography variant="caption">
              Assentos Totais: {parseInt(vehicle.assentosAndar1) + parseInt(vehicle.assentosAndar2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DoubleArrowIcon fontSize="small" />
            <Typography variant="caption">Dois Andares: {vehicle.doisAndares ? 'Sim' : 'Não'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TravelExploreIcon fontSize="small" />
            <Typography variant="caption">Viagens Alocadas: {vehicle.numTravels || 0}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;

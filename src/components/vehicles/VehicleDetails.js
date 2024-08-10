import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Avatar, List, ListItem, ListItemText, CircularProgress, Pagination
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatDate } from '../../utils/utils';
import { getVehicleTravels } from '../../services/VehicleService';

const VehicleDetails = ({ vehicle, open, onClose }) => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Função para buscar as viagens do veículo
  useEffect(() => {
    if (open && vehicle) {
      const fetchTravels = async () => {
        setLoading(true);
        try {
          const fetchedTravels = await getVehicleTravels(vehicle.id);
          setTravels(fetchedTravels);
        } catch (error) {
          console.error('Erro ao buscar viagens do veículo:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTravels();
    }
  }, [open, vehicle]);

  // Função para lidar com a mudança de página na paginação
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = travels.slice(indexOfFirstItem, indexOfLastItem);

  // Função para obter detalhes do status de uma viagem
  const getStatusDetails = (status) => {
    switch (status) {
      case 'Cancelada':
        return { color: '#ffebee', iconColor: '#f44336', text: 'Cancelada' };
      case 'Em andamento':
        return { color: '#e8f5e9', iconColor: '#4caf50', text: 'Em andamento' };
      case 'Próxima':
        return { color: '#e3f2fd', iconColor: '#2196f3', text: 'Próxima' };
      case 'Encerrada':
        return { color: '#f5f5f5', iconColor: '#9e9e9e', text: 'Encerrada' };
      case 'Criada':
        return { color: '#e0f7fa', iconColor: '#00acc1', text: 'Criada' };
      default:
        return { color: '#f5f5f5', iconColor: '#9e9e9e', text: 'Status indefinido' };
    }
  };

  // Ordenação das viagens de acordo com o status
  const sortedTravels = travels.sort((a, b) => {
    const statusOrder = ['Em andamento', 'Próxima', 'Criada', 'Encerrada', 'Cancelada'];
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="vehicle-details-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="vehicle-details-title">Detalhes do Veículo</DialogTitle>
      <DialogContent>
        {vehicle && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <DirectionsBusIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {vehicle.identificadorVeiculo}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Placa:</strong> {vehicle.placa}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Empresa:</strong> {vehicle.empresa}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Assentos 1° andar:</strong> {vehicle.assentosAndar1}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Assentos 2° andar:</strong> {vehicle.assentosAndar2}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Dois andares:</strong> {vehicle.doisAndares ? 'Sim' : 'Não'}</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="body2">Buscando viagens...</Typography>
              </Box>
            ) : sortedTravels.length > 0 ? (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <DirectionsBusIcon />
                  </Avatar>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}><strong>Viagens:</strong></Typography>
                </Box>
                <List>
                  {currentItems.map((travel, index) => {
                    const statusDetails = getStatusDetails(travel.status);
                    return (
                      <ListItem key={index} sx={{ backgroundColor: statusDetails.color, borderRadius: 1, mb: 1 }}>
                        <Avatar sx={{ bgcolor: statusDetails.iconColor, mr: 2 }}>
                          {travel.status === 'Cancelada' ? <CancelIcon /> : <CheckCircleIcon />}
                        </Avatar>
                        <ListItemText
                          primary={`${travel.identificador} - ${travel.origem} -> ${travel.destino}`}
                          secondary={`Data: ${formatDate(travel.dataIda)} - Status: ${statusDetails.text}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(travels.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ wordBreak: 'break-word', mt: 2 }}>
                Nenhuma viagem encontrada.
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

export default VehicleDetails;

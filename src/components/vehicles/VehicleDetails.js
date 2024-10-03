import React, { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, Avatar, List, ListItem, ListItemText, CircularProgress, Pagination, Tabs, Tab } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatDate } from '../../utils/utils';
import { getVehicleTravels } from '../../services/VehicleService';
import VehicleLayoutView from './VehicleLayoutView';  // Importando o novo componente

const VehicleDetails = ({ vehicle, layout, open, onClose }) => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(0); // Aba atual
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = travels.slice(indexOfFirstItem, indexOfLastItem);

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

  const sortedTravels = travels.sort((a, b) => {
    const statusOrder = ['Em andamento', 'Próxima', 'Criada', 'Encerrada', 'Cancelada'];
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="vehicle-details-title" maxWidth="md" fullWidth>
      <DialogTitle id="vehicle-details-title">Detalhes do Veículo</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="vehicle details tabs">
            <Tab label="Detalhes" />
            <Tab label="Layout" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            {vehicle && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, paddingTop: '8px' }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <DirectionsBusIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {vehicle.identificadorVeiculo}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>Placa:</strong> {vehicle.placa}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 1 }}>
                      <strong>Empresa:</strong> {vehicle.empresa}
                    </Typography>
                  </Box>
                </Box>

                {/* Informações sobre o layout associado */}
                {layout ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Layout Associado:</strong> {layout.name ? layout.name : 'Sem nome'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Assentos 1° Andar:</strong> {layout.assentosAndar1 || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Assentos 2° Andar:</strong> {layout.assentosAndar2 || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Dois Andares:</strong> {layout.doisAndares ? 'Sim' : 'Não'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Layout Associado:</strong> Nenhum layout associado
                  </Typography>
                )}

                {/* Viagens associadas */}
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2">Buscando viagens...</Typography>
                  </Box>
                ) : sortedTravels.length > 0 ? (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Viagens Alocadas:</strong> {sortedTravels.length}
                    </Typography>
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
          </>
        )}

        {currentTab === 1 && <VehicleLayoutView layout={layout} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ borderRadius: '50px' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleDetails;

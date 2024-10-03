import React, { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider, CircularProgress, Pagination, Tabs, Tab, Avatar } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BusinessIcon from '@mui/icons-material/Business';
import { getVehicleTravels } from '../../services/VehicleService';
import TravelCard from '../travels/TravelCard'; // Importando o TravelCard
import VehicleLayoutView from './VehicleLayoutView'; // Importando o VehicleLayoutView

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

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="vehicle-details-title" maxWidth="md" fullWidth>
      <DialogTitle id="vehicle-details-title">Detalhes do Veículo</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="vehicle details tabs">
            <Tab label="Detalhes" />
            <Tab label="Layout" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            {vehicle && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  <DirectionsBusIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>
                  {vehicle.identificadorVeiculo}
                </Typography>
              </Box>
            )}

            {/* Informações sobre a empresa e placa */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Empresa:</strong> {vehicle.empresa}</Typography>
              <Typography variant="body2" sx={{ mb: 1, ml: 2 }}><strong>Placa:</strong> {vehicle.placa}</Typography>
            </Box>

            {/* Informações sobre o layout associado */}
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Layout Associado:</strong> {layout ? (layout.name ? layout.name : 'Sem nome') : 'Nenhum layout associado'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Assentos 1° Andar:</strong> {layout?.assentosAndar1 || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Assentos 2° Andar:</strong> {layout?.assentosAndar2 || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Dois Andares:</strong> {layout?.doisAndares ? 'Sim' : 'Não'}</Typography>
            </Box>

            {/* Viagens associadas */}
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography variant="body2">Buscando viagens...</Typography>
              </Box>
            ) : (
              <>
                <Divider sx={{ mb: 2 }} />
                <TravelCard travels={currentItems} hideActions stacked /> {/* Passando hideActions */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(travels.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
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

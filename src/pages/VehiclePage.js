import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Box, CircularProgress, Snackbar, Alert, Modal, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton, Grid, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import Layout from '../components/common/Layout';
import VehicleDetails from '../components/vehicles/VehicleDetails';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleForm from '../components/vehicles/VehicleForm';
import VehiclePageHelp from '../components/vehicles/VehiclePageHelp';
import { addVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehicleTravels } from '../services/VehicleService';
import { getAllLayouts } from '../services/LayoutService'; // Importar a função para buscar layouts
import { validateMasterPassword } from '../utils/utils';
import { getMasterPasswordStatus } from '../services/AuthService';

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [layouts, setLayouts] = useState([]); // Estado para armazenar layouts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openModal, setOpenModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);

  useEffect(() => {
    fetchVehiclesAndLayouts(); // Chama a função que busca veículos e layouts
    checkMasterPasswordStatus();
  }, []);

  const checkMasterPasswordStatus = async () => {
    const isActive = await getMasterPasswordStatus();
    setMasterPasswordActive(isActive);
  };

  const fetchVehiclesAndLayouts = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar veículos
      const fetchedVehicles = await getAllVehicles();
      const vehiclesWithTravels = await Promise.all(
        fetchedVehicles.map(async (vehicle) => {
          const travels = await getVehicleTravels(vehicle.id);
          const filteredTravels = travels.filter(travel => ['Em andamento', 'Próxima', 'Criada'].includes(travel.status));
          return { ...vehicle, numTravels: filteredTravels.length };
        })
      );

      // Buscar layouts
      const fetchedLayouts = await getAllLayouts();
      setVehicles(vehiclesWithTravels);
      setLayouts(fetchedLayouts); // Armazena os layouts no estado
      setLoading(false);
    } catch (err) {
      setError('Erro ao buscar veículos ou layouts');
      setSnackbarMessage('Erro ao buscar veículos ou layouts');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, []);

  const handleAddVehicle = async (vehicle) => {
    try {
      await addVehicle(vehicle);
      fetchVehiclesAndLayouts();
      setSnackbarMessage('Veículo adicionado com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenModal(false);
    } catch (err) {
      setError('Erro ao adicionar veículo');
      setSnackbarMessage('Erro ao adicionar veículo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditVehicle = async (vehicle) => {
    try {
      await updateVehicle(vehicle.id, vehicle);
      fetchVehiclesAndLayouts();
      setSnackbarMessage('Veículo atualizado com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenModal(false);
      setEditingVehicle(null);
    } catch (err) {
      setError('Erro ao atualizar veículo');
      setSnackbarMessage('Erro ao atualizar veículo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteVehicle = async () => {
    setLoading(true);
    try {
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }
      await deleteVehicle(vehicleToDelete.id);
      fetchVehiclesAndLayouts();
      setSnackbarMessage('Veículo excluído com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setConfirmDeleteOpen(false);
      setVehicleToDelete(null);
      setMasterPassword('');
    } catch (err) {
      setError('Erro ao excluir veículo');
      setSnackbarMessage('Erro ao excluir veículo: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startEditing = (vehicle) => {
    setEditingVehicle(vehicle);
    setOpenModal(true);
  };

  const openConfirmDeleteDialog = (vehicle) => {
    setVehicleToDelete(vehicle);
    setConfirmDeleteOpen(true);
  };

  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setVehicleToDelete(null);
    setMasterPassword('');
  };

  const handleCancel = () => {
    setOpenModal(false);
    setEditingVehicle(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleCardClick = (vehicle) => {
    const layout = getVehicleLayout(vehicle.layoutId);
    setSelectedVehicle({ ...vehicle, layout });
  };

  const handleClickShowMasterPassword = () => {
    setShowMasterPassword(!showMasterPassword);
  };

  // Busca o layout associado ao veículo
  const getVehicleLayout = (layoutId) => {
    return layouts.find(layout => layout.id === layoutId);
  };

  const sortedVehicles = vehicles.sort((a, b) => {
    const layoutA = getVehicleLayout(a.layoutId);
    const layoutB = getVehicleLayout(b.layoutId);
    const totalSeatsA = layoutA?.totalSeats || 0;
    const totalSeatsB = layoutB?.totalSeats || 0;

    return sortOrder === 'asc' ? totalSeatsA - totalSeatsB : totalSeatsB - totalSeatsA;
  });

  const filteredVehicles = sortedVehicles.filter(vehicle => {
    return (
      vehicle.identificadorVeiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout>
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div">
          Gerenciamento de Veículos
          <VehiclePageHelp />
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: '50px' }}>
          Adicionar
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)} sx={{ borderRadius: '50px' }}>
          {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </Box>

      <Collapse in={filtersVisible}>
        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-order-label">Ordenar por Nº de Assentos</InputLabel>
            <Select
              labelId="sort-order-label"
              value={sortOrder}
              onChange={handleSortChange}
              label="Ordenar por Nº de Assentos"
            >
              <MenuItem value="asc">Crescente</MenuItem>
              <MenuItem value="desc">Decrescente</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por Identificador, Placa ou Empresa"
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Collapse>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((vehicle) => {
                const layout = getVehicleLayout(vehicle.layoutId); // Obtém o layout associado
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                    <VehicleCard
                      vehicle={vehicle}
                      layout={layout} // Passa o layout associado para o cartão
                      onEdit={startEditing}
                      onDelete={openConfirmDeleteDialog}
                      onCardClick={handleCardClick}
                    />
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" align="left">Nenhum veículo encontrado.</Typography>
              </Grid>
            )}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredVehicles.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
      <Modal open={openModal} onClose={handleCancel}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '20px', // Adicione esta linha para bordas arredondadas
            overflow: 'hidden', // Para garantir que o conteúdo não saia do Box arredondado
          }}
        >
          <VehicleForm onSave={editingVehicle ? handleEditVehicle : handleAddVehicle} initialVehicle={editingVehicle} onCancel={handleCancel} fetchVehicles={fetchVehiclesAndLayouts} />
        </Box>
      </Modal>
      <Dialog open={confirmDeleteOpen} onClose={closeConfirmDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o veículo {vehicleToDelete?.identificadorVeiculo}? Esta ação não pode ser desfeita.
          </DialogContentText>
          {masterPasswordActive && (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              name="masterPassword"
              label="Senha Master"
              type={showMasterPassword ? 'text' : 'password'}
              id="masterPassword"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              InputProps={{
                autoComplete: 'new-password',
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowMasterPassword}
                      edge="end"
                    >
                      {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} variant="contained" disabled={loading} color="cancelar" sx={{ borderRadius: '50px' }} >
            Voltar
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            variant="contained"
            color="error"
            disabled={masterPasswordActive && !masterPassword || loading}
            sx={{ color: 'white', borderRadius: '50px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      {selectedVehicle && (
        <VehicleDetails
          vehicle={selectedVehicle}
          layout={selectedVehicle.layout} // Passa o layout associado
          open={Boolean(selectedVehicle)}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default VehiclePage;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Button, Box, CircularProgress, Snackbar, Alert, Modal, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton, Grid, Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import VehicleDetails from './VehicleDetails';
import VehicleCard from './VehicleCard';
import { addVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehicleTravels } from '../../services/VehicleService';
import { validateMasterPassword } from '../../utils/utils';
import Layout from '../common/Layout';
import VehicleForm from './VehicleForm';

const VehicleComponent = () => {
  const [vehicles, setVehicles] = useState([]);
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

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedVehicles = await getAllVehicles();
      const vehiclesWithTravels = await Promise.all(
        fetchedVehicles.map(async (vehicle) => {
          const travels = await getVehicleTravels(vehicle.id);
          const filteredTravels = travels.filter(travel => ['Em andamento', 'Próxima', 'Criada'].includes(travel.status));
          return { ...vehicle, numTravels: filteredTravels.length };
        })
      );

      setVehicles(vehiclesWithTravels);
      setLoading(false);
    } catch (err) {
      setError('Erro ao buscar veículos');
      setSnackbarMessage('Erro ao buscar veículos');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, []);

  const handleAddVehicle = async (vehicle) => {
    try {
      await addVehicle(vehicle);
      fetchVehicles();
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
      fetchVehicles();
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
      await validateMasterPassword(masterPassword);
      await deleteVehicle(vehicleToDelete.id);
      fetchVehicles();
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
    setSelectedVehicle(vehicle);
  };

  const handleClickShowMasterPassword = () => {
    setShowMasterPassword(!showMasterPassword);
  };

  const sortedVehicles = vehicles.sort((a, b) => {
    const totalAssentosA = a.assentosAndar1 + a.assentosAndar2;
    const totalAssentosB = b.assentosAndar1 + b.assentosAndar2;

    return sortOrder === 'asc' ? totalAssentosA - totalAssentosB : totalAssentosB - totalAssentosA;
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
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
          Adicionar
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)}>
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
              filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                  <VehicleCard
                    vehicle={vehicle}
                    onEdit={startEditing}
                    onDelete={openConfirmDeleteDialog}
                    onCardClick={handleCardClick}
                  />
                </Grid>
              ))
            ) : (
              <Typography variant="body1">Nenhum veículo encontrado.</Typography>
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
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <VehicleForm onSave={editingVehicle ? handleEditVehicle : handleAddVehicle} initialVehicle={editingVehicle} onCancel={handleCancel} fetchVehicles={fetchVehicles} />
        </Box>
      </Modal>
      <Dialog open={confirmDeleteOpen} onClose={closeConfirmDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o veículo {vehicleToDelete?.identificadorVeiculo}? Esta ação não pode ser desfeita.
          </DialogContentText>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }} >
            Não
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            variant="contained"
            color="confirmar"
            disabled={!masterPassword || loading}
            sx={{ color: 'white' }} 
          >
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      {selectedVehicle && (
        <VehicleDetails
          vehicle={selectedVehicle}
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

export default VehicleComponent;

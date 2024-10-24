import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Box, CircularProgress, Snackbar, Alert, IconButton, Modal, Fade, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Pagination, MenuItem, Select, FormControl, InputLabel, InputAdornment, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TravelForm from '../components/travels/TravelForm';
import TravelCard from '../components/travels/TravelCard';
import Layout from '../components/common/Layout';
import TravelPageHelp from '../components/travels/TravelPageHelp';
import { addTravel, getAllTravels, updateTravel, deleteTravel, cancelTravel, updateInactiveTravels } from '../services/TravelService';
import { validateMasterPassword, formatDate } from '../utils/utils';
import { getMasterPasswordStatus } from '../services/AuthService';  
import { getReservationsByTravelId } from '../services/OrderService';

const TravelPage = () => {
  const [travels, setTravels] = useState([]);
  const [filteredTravels, setFilteredTravels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('nearest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [openModal, setOpenModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [travelToDelete, setTravelToDelete] = useState(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [travelToCancel, setTravelToCancel] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);  

  useEffect(() => {
    const fetchTravelsData = async () => {
      await updateInactiveTravels();
      fetchTravels();
    };

    const fetchMasterPasswordStatus = async () => {
      const isActive = await getMasterPasswordStatus();  // Verifique o estado da senha master
      setMasterPasswordActive(isActive);
    };

    fetchTravelsData();
    fetchMasterPasswordStatus();
  }, []);

  const fetchTravels = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTravels = await getAllTravels();
      setTravels(fetchedTravels);
      setLoading(false);
    } catch (err) {
      setError('Falha ao buscar viagens. Por favor, tente novamente.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = travels.filter(travel => {
      const travelStartDate = new Date(travel.dataIda);
      const travelEndDate = new Date(travel.dataRetorno);
      const startCondition = startDate ? new Date(startDate) <= travelStartDate : true;
      const endCondition = endDate ? new Date(endDate) >= travelEndDate : true;
      const statusCondition = statusFilter ? travel.status === statusFilter : true;

      const vehicleMatch = travel.veiculo && (
        travel.veiculo.identificadorVeiculo?.toLowerCase().includes(lowercasedFilter) ||
        travel.veiculo.placa?.toLowerCase().includes(lowercasedFilter) ||
        travel.veiculo.empresa?.toLowerCase().includes(lowercasedFilter)
      );

      return startCondition && endCondition && statusCondition && (Object.keys(travel).some(key => {
        if (key === 'dataIda' || key === 'dataRetorno') {
          const formattedDate = formatDate(travel[key]);
          return formattedDate.includes(lowercasedFilter);
        }
        return String(travel[key]).toLowerCase().includes(lowercasedFilter);
      }) || vehicleMatch);
    });

    const sortedData = filteredData.sort((a, b) => {
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = new Date(a.dataIda);
      const dateB = new Date(b.dataIda);

      return order === 'nearest' ? dateA - dateB : dateB - dateA;
    });

    setFilteredTravels(sortedData);
  }, [searchTerm, startDate, endDate, statusFilter, travels, order]);

  const getStatusPriority = (status) => {
    switch (status) {
      case 'Em andamento':
        return 1;
      case 'Próxima':
        return 2;
      case 'Criada':
        return 3;
      case 'Encerrada':
        return 4;
      case 'Cancelada':
        return 5;
      default:
        return 6;
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenModal = () => {
    setEditingTravel(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSave = async (travelData) => {
    setLoading(true);
    try {
      if (editingTravel) {
        await updateTravel(editingTravel.id, travelData);
        setTravels(travels.map(travel => travel.id === editingTravel.id ? { ...travel, ...travelData } : travel));
      } else {
        const newTravel = await addTravel(travelData);
        setTravels([...travels, { ...travelData, id: newTravel.id }]);
      }
      await fetchTravels();
      handleCloseModal();
      setLoading(false);
    } catch (err) {
      setError('Erro ao salvar viagem. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const startEditing = (travel) => {
    setEditingTravel(travel);
    setOpenModal(true);
  };

  const openConfirmDeleteDialog = (travel) => {
    setTravelToDelete(travel);
    setConfirmDeleteOpen(true);
  };

  // Função para fechar o modal de exclusão
  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setTravelToDelete(null);
    setMasterPassword('');
  };

  // Função para confirmar exclusão da viagem
  const confirmDelete = async () => {
    if (travelToDelete) {
      setLoading(true);
      try {
        await deleteTravel(travelToDelete.id); // Realizar exclusão
        await fetchTravels(); // Atualizar viagens
        setSnackbarMessage('Viagem excluída com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        setError('Erro ao excluir a viagem. Por favor, tente novamente.');
        setSnackbarMessage('Erro ao excluir viagem: ' + err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
      closeConfirmDeleteDialog(); // Fechar modal após operação
    }
  };

  const openConfirmCancelDialog = async (travel) => {
    setTravelToCancel(travel);
    try {
      const reservations = await getReservationsByTravelId(travel.id); // Buscar reservas da viagem
      setReservationsCount(reservations.length); // Atualizar o número de reservas
    } catch (error) {
      setReservationsCount(0); // Se houver erro, definir como 0
      console.error("Erro ao buscar reservas:", error);
    }
    setConfirmCancelOpen(true);
  };

  const closeConfirmCancelDialog = () => {
    setConfirmCancelOpen(false);
    setTravelToCancel(null);
    setMasterPassword('');
    setReservationsCount(0); // Resetar contagem de reservas ao fechar o modal
  };

  const confirmCancel = async () => {
    if (travelToCancel) {
      setLoading(true);
      try {
        if (masterPasswordActive) {
          await validateMasterPassword(masterPassword);
        }
        await cancelTravel(travelToCancel.id);
        await fetchTravels();
        setSnackbarMessage('Viagem cancelada com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        setError('Erro ao cancelar a viagem. Por favor, tente novamente.');
        setSnackbarMessage('Erro ao cancelar viagem: ' + err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
      closeConfirmCancelDialog();
    }
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleClickShowMasterPassword = () => {
    setShowMasterPassword(!showMasterPassword);
  };

  const clearButton = (clearFunction) => (
    <InputAdornment position="end">
      <IconButton onClick={clearFunction} edge="end">
        <ClearIcon />
      </IconButton>
    </InputAdornment>
  );

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

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
          Gerenciamento de Viagens
          <TravelPageHelp />
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal} sx={{ borderRadius: '50px' }}>
          Adicionar
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)} sx={{ borderRadius: '50px' }}>
          {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </Box>
      <Collapse in={filtersVisible}>
        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl variant="outlined" sx={{ minWidth: 240, flexGrow: 1 }}>
            <InputLabel id="order-select-label">Ordenar Por</InputLabel>
            <Select
              labelId="order-select-label"
              id="order-select"
              value={order}
              label="Ordenar Por"
              onChange={e => setOrder(e.target.value)}
            >
              <MenuItem value="nearest">Mais Próxima</MenuItem>
              <MenuItem value="furthest">Mais Distante</MenuItem>
            </Select>
          </FormControl>
          <TextField
            sx={{ flexGrow: 1, minWidth: '240px' }}
            label="Busca"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Digite qualquer informação para buscar viagens"
            InputProps={{
              endAdornment: searchTerm ? clearButton(() => setSearchTerm('')) : null
            }}
            autoComplete="off"
          />
          <FormControl variant="outlined" sx={{ minWidth: 240, flexGrow: 1 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status-select"
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Em andamento">Em andamento</MenuItem>
              <MenuItem value="Próxima">Próxima</MenuItem>
              <MenuItem value="Criada">Criada</MenuItem>
              <MenuItem value="Encerrada">Encerrada</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Data de Ida"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 240, flexGrow: 1 }}
            InputProps={{
              endAdornment: startDate ? clearButton(() => setStartDate('')) : null
            }}
            autoComplete="off"
          />
          <TextField
            label="Data de Retorno"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 240, flexGrow: 1 }}
            InputProps={{
              endAdornment: endDate ? clearButton(() => setEndDate('')) : null
            }}
            autoComplete="off"
          />
        </Box>
      </Collapse>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TravelCard
            travels={filteredTravels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            startEditing={startEditing}
            handleDelete={openConfirmDeleteDialog}
            handleCancel={openConfirmCancelDialog}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredTravels.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
        <Fade in={openModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <TravelForm travel={editingTravel} saveTravel={handleSave} cancelForm={handleCloseModal} />
          </Box>
        </Fade>
      </Modal>
      <Dialog open={confirmDeleteOpen} onClose={closeConfirmDeleteDialog}>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a viagem para <strong>{travelToDelete?.destino}</strong>?
            <br />
            Data de Ida: <strong>{formatDate(travelToDelete?.dataIda)}</strong>
            <br />
            {!travelToDelete?.somenteIda && (
              <>
                Data de Retorno: <strong>{formatDate(travelToDelete?.dataRetorno)}</strong>
                <br />
              </>
            )}
            Essa ação excluirá todas as reservas e pedidos relacionados a essa viagem. Isso não pode ser desfeito.
          </DialogContentText>
          {masterPasswordActive && (
            <TextField
              margin="normal"
              fullWidth
              label="Senha Master"
              type={showMasterPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              InputProps={{
                autoComplete: 'new-password',
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle master password visibility"
                      onClick={handleClickShowMasterPassword}
                      edge="end"
                    >
                      {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="off"
              disabled={loading}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} variant="contained" disabled={loading} color="cancelar" sx={{ borderRadius: '50px' }} >
            Voltar
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error" autoFocus disabled={masterPasswordActive && !masterPassword || loading} sx={{ color: 'white', borderRadius: '50px' }} >
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmCancelOpen} onClose={closeConfirmCancelDialog}>
      <DialogTitle>Confirmar Cancelamento</DialogTitle>
      <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar a viagem para <strong>{travelToCancel?.destino}</strong>?
            <br />
            Data de Ida: <strong>{formatDate(travelToCancel?.dataIda)}</strong>
            <br />
            {!travelToCancel?.somenteIda && (
              <>
                Data de Retorno: <strong>{formatDate(travelToCancel?.dataRetorno)}</strong>
                <br />
              </>
            )}
            {reservationsCount > 0 && (
              <strong>Essa viagem tem {reservationsCount} reserva(s) associada(s).</strong>
            )}
            <br />
            Cancelar essa viagem também cancelará todas as reservas e pedidos associados. Essa ação não pode ser desfeita.
          </DialogContentText>
          {masterPasswordActive && (
            <TextField
              margin="normal"
              fullWidth
              label="Senha Master"
              type={showMasterPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              InputProps={{
                autoComplete: 'new-password',
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle master password visibility"
                      onClick={handleClickShowMasterPassword}
                      edge="end"
                    >
                      {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="off"
              disabled={loading}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmCancelDialog} variant="contained" color="cancelar" disabled={loading} sx={{ borderRadius: '50px' }} >
            Voltar
          </Button>
          <Button onClick={confirmCancel} variant="contained" color="error" autoFocus disabled={masterPasswordActive && !masterPassword || loading} sx={{ color: 'white', borderRadius: '50px' }} >
            {loading ? <CircularProgress size={24} /> : 'Cancelar viagem'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default TravelPage;

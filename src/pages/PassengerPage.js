import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Snackbar, Alert, Button, Typography, TextField, Box, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, InputAdornment, Select, MenuItem, FormControl, InputLabel, CircularProgress, Pagination, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Layout from '../components/common/Layout';
import PassengerCard from '../components/passengers/PassengerCard';
import PassengerTable from '../components/passengers/PassengerTable';
import PassengerForm from '../components/passengers/PassengerForm';
import PassengerPageHelp from '../components/passengers/PassengerPageHelp';
import { getAllPassengers, deletePassengers } from '../services/PassengerService';

const PassengerPage = () => {
  const [passageiros, setPassageiros] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editedPassenger, setEditedPassenger] = useState({});
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPassageiros, setFilteredPassageiros] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passengersPerPage] = useState(21);
  const [order, setOrder] = useState('newest');
  const [filterTrigger, setFilterTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'card'); // Pega o modo do localStorage ou usa 'card'

  const fetchPassageiros = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPassageiros = await getAllPassengers();
      setPassageiros(fetchedPassageiros);
    } catch (error) {
      setSnackbarMessage('Erro ao buscar passageiros: ' + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassageiros();
  }, [fetchPassageiros]);

  useEffect(() => {
    const sortedAndFiltered = passageiros.filter(p => {
      const birthDate = p.dataNascimento ? new Date(p.dataNascimento.split('/').reverse().join('-')) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const dateMatch = (!start || (birthDate && birthDate >= start)) && (!end || (birthDate && birthDate <= end));
      const textMatch = !searchTerm || Object.values(p).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      return dateMatch && textMatch;
    }).sort((a, b) => {
      if (order === 'newest' || order === 'oldest') {
        const dateA = new Date(a.dataAdicionado);
        const dateB = new Date(b.dataAdicionado);
        return order === 'newest' ? dateB - dateA : dateA - dateB;
      } else if (order === 'alphabetical') {
        return a.nome.localeCompare(b.nome);
      }
      return 0;
    });

    setFilteredPassageiros(sortedAndFiltered);
  }, [searchTerm, startDate, endDate, passageiros, order, filterTrigger]);

  const indexOfLastPassenger = useMemo(() => (currentPage) * passengersPerPage, [currentPage, passengersPerPage]);
  const indexOfFirstPassenger = useMemo(() => indexOfLastPassenger - passengersPerPage, [indexOfLastPassenger]);
  const currentPassengers = useMemo(() => filteredPassageiros.slice(indexOfFirstPassenger, indexOfLastPassenger), [filteredPassageiros, indexOfFirstPassenger, indexOfLastPassenger]);

  const handleOpenFormDialog = () => {
    setOpenFormDialog(true);
    setEditedPassenger({});
    setEditing(false);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
  };

  const startEditing = (passenger) => {
    setEditedPassenger(passenger);
    setEditing(true);
    setOpenFormDialog(true);
  };

  const handleDeletePassenger = async (id) => {
    setDeleting(true);
    try {
      await deletePassengers([id]);
      setSnackbarMessage('Passageiro excluído com sucesso.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchPassageiros();
    } catch (error) {
      setSnackbarMessage('Erro ao excluir passageiro: ' + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setDeleting(false);
    }
  };

  const clearButton = (clearFunction) => (
    <InputAdornment position="end">
      <IconButton onClick={clearFunction} edge="end">
        <ClearIcon />
      </IconButton>
    </InputAdornment>
  );

  // Função para alternar entre os modos de visualização e salvar no localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode); // Salva a opção de visualização no localStorage
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div">
          Gerenciamento de Passageiros
          <PassengerPageHelp />
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenFormDialog} sx={{ borderRadius: '50px' }}>
          Adicionar
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)} sx={{ borderRadius: '50px' }}>
          {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
        {/* Alternância de visualização com ícones, posicionado à direita */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => handleViewModeChange('card')} color={viewMode === 'card' ? 'primary' : 'default'}>
            <ViewModuleIcon />
          </IconButton>
          <IconButton onClick={() => handleViewModeChange('table')} color={viewMode === 'table' ? 'primary' : 'default'}>
            <ViewListIcon />
          </IconButton>
        </Box>
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
              <MenuItem value="newest">Mais Recente Adicionado</MenuItem>
              <MenuItem value="oldest">Mais Antigo Adicionado</MenuItem>
              <MenuItem value="alphabetical">Ordem Alfabética</MenuItem>
            </Select>
          </FormControl>
          <TextField
            sx={{ flexGrow: 1, minWidth: '240px' }}
            label="Busca"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Digite qualquer informação para buscar passageiros"
            InputProps={{
              endAdornment: searchTerm ? clearButton(() => setSearchTerm('')) : null
            }}
            autoComplete="off"
          />
          <TextField
            label="Nascidos a partir de"
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
            label="Nascidos até"
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
          {viewMode === 'card' ? (
            <PassengerCard
              passengers={currentPassengers}
              handleDeletePassenger={handleDeletePassenger}
              startEditing={startEditing}
            />
          ) : (
            <PassengerTable
              passengers={currentPassengers}
              handleDeletePassenger={handleDeletePassenger}
              startEditing={startEditing}
            />
          )}
          <Pagination
            count={Math.ceil(filteredPassageiros.length / passengersPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ mt: 2 }}
          />
        </>
      )}

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} aria-labelledby="form-dialog-title">
        <DialogContent>
          <PassengerForm
            editedPassenger={editedPassenger}
            setEditedPassenger={setEditedPassenger}
            errors={errors}
            setErrors={setErrors}
            handleCloseFormDialog={handleCloseFormDialog}
            fetchPassageiros={fetchPassageiros}
            editing={editing}
            passageiros={passageiros}
            setOpenSnackbar={setOpenSnackbar}
            setSnackbarMessage={setSnackbarMessage}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
      </Dialog>
    </Layout>
  );
};

export default PassengerPage;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Snackbar, Alert, Button, Typography, TextField, Box, Dialog, DialogActions, DialogTitle, DialogContent,
  IconButton, InputAdornment, Select, MenuItem, FormControl, InputLabel, CircularProgress, Pagination, Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import Layout from '../common/Layout';
import PassengerList from './PassengerCard';
import PassengerForm from './PassengerForm';
import { getAllPassengers, deletePassengers } from '../../services/PassengerService';

const PassengerComponent = () => {
  const [passageiros, setPassageiros] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editedPassenger, setEditedPassenger] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedPassageiros, setSelectedPassageiros] = useState(new Set());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
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

  const fetchPassageiros = useCallback(async () => {
    setLoading(true);
    const fetchedPassageiros = await getAllPassengers();
    setPassageiros(fetchedPassageiros);
    setLoading(false);
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
      setOpenSnackbar(true);
      fetchPassageiros();
    } catch (error) {
      setSnackbarMessage('Erro ao excluir passageiro.');
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

  return (
    <Layout>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div">
          Gerenciamento de Passageiros
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenFormDialog}>
          Adicionar
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)}>
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
            autoComplete="off" // Desativa o preenchimento automático
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
            autoComplete="off" // Desativa o preenchimento automático
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
            autoComplete="off" // Desativa o preenchimento automático
          />
        </Box>
      </Collapse>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <PassengerList
            passengers={currentPassengers}
            handleDeletePassenger={handleDeletePassenger}
            selectedPassageiros={selectedPassageiros}
            startEditing={startEditing}
            deleting={deleting}
          />
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
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
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
}

export default PassengerComponent;

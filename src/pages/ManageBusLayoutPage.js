import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Button, Box, Grid, CircularProgress, Snackbar, Alert, Collapse, FormControl, InputLabel, Select, MenuItem, TextField, Pagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import Layout from '../components/common/Layout';
import LayoutCard from '../components/seatlayout/LayoutCard';
import ManageBusLayoutPageHelp from '../components/seatlayout/ManageBusLayoutPageHelp';
import { getAllLayouts, deleteLayout } from '../services/LayoutService'; 
import { useNavigate } from 'react-router-dom';

const ManageBusLayoutPage = () => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca
  const [sortOrder, setSortOrder] = useState('asc'); // Ordenação (ascendente ou descendente)
  const [filtersVisible, setFiltersVisible] = useState(false); // Visibilidade dos filtros
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [itemsPerPage] = useState(12); // Itens por página
  const navigate = useNavigate();

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedLayouts = await getAllLayouts();
      setLayouts(fetchedLayouts);
      setLoading(false);
    } catch (err) {
      setSnackbarMessage('Erro ao buscar layouts');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, []);

  const handleDeleteLayout = async (layoutId) => {
    setLoading(true);
    try {
      await deleteLayout(layoutId);
      fetchLayouts();
      setSnackbarMessage('Layout excluído com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Erro ao excluir layout');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const goToLayoutBuilder = (layout = null) => {
    if (layout) {
      navigate(`/veiculos/layout/${layout.id}`, { state: { layout } });
    } else {
      navigate('/veiculos/layout/novo');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Ordenar os layouts pela quantidade de assentos
  const sortedLayouts = layouts.sort((a, b) => {
    return sortOrder === 'asc' ? a.assentosTotais - b.assentosTotais : b.assentosTotais - a.assentosTotais;
  });

  // Filtrar os layouts pelo termo de busca (ID ou nome)
  const filteredLayouts = sortedLayouts.filter(layout => {
    return (
      layout.id.toString().includes(searchTerm.toLowerCase()) ||
      (layout.name && layout.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Paginar os layouts
  const paginatedLayouts = filteredLayouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Layout>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div">
          Gerenciamento de Layout de Veículo
          <ManageBusLayoutPageHelp />
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => goToLayoutBuilder()} sx={{ borderRadius: '50px' }}>
          Adicionar Novo Layout
        </Button>
        <Button variant="outlined" color="primary" startIcon={<FilterListIcon />} onClick={() => setFiltersVisible(!filtersVisible)} sx={{ borderRadius: '50px' }}>
          {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </Box>

      {/* Filtros */}
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
            placeholder="Buscar por ID ou Nome"
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
            {paginatedLayouts.length > 0 ? (
              paginatedLayouts.map((layout) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={layout.id}>
                  <LayoutCard
                    layout={layout}
                    totalSeats={layout.assentosTotais} // Usando campo já existente
                    isTwoFloors={layout.doisAndares} // Usando campo já existente
                    onEdit={() => goToLayoutBuilder(layout)}
                    onDelete={handleDeleteLayout}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">Nenhum layout encontrado.</Typography>
              </Grid>
            )}
          </Grid>

          {/* Paginação */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredLayouts.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ManageBusLayoutPage;

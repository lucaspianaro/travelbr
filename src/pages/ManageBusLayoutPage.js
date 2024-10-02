import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Button, Box, Grid, Snackbar, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { getAllLayouts, deleteLayout } from '../services/LayoutService'; 
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';

const ManageBusLayoutPage = () => {
  const [layouts, setLayouts] = useState([]); // Listagem de layouts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [layoutToDelete, setLayoutToDelete] = useState(null); // Layout a ser excluído
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const navigate = useNavigate(); // Para navegação entre páginas

  // Fetch dos layouts existentes
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
      setError('Erro ao buscar layouts');
      setSnackbarMessage('Erro ao buscar layouts');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, []);

  // Função para excluir layout
  const handleDeleteLayout = async () => {
    setLoading(true);
    try {
      await deleteLayout(layoutToDelete.id);
      fetchLayouts();
      setSnackbarMessage('Layout excluído com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setConfirmDeleteOpen(false);
      setLayoutToDelete(null);
    } catch (err) {
      setError('Erro ao excluir layout');
      setSnackbarMessage('Erro ao excluir layout');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  // Fechar modal de confirmação de exclusão
  const closeConfirmDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setLayoutToDelete(null);
  };

  // Navegar para a página de criação/edição de layout
  const goToLayoutBuilder = (layout = null) => {
    if (layout) {
      navigate(`/veiculos/layout/${layout.id}`, { state: { layout } }); // Passa o layout selecionado via state
    } else {
      navigate('/veiculos/layout/novo');
    }
  };

  const calculateTotalSeats = (layout) => {
    let totalSeats = 0;

    // Calcula os assentos do primeiro andar
    if (Array.isArray(layout.firstFloor)) {
      totalSeats += layout.firstFloor.filter(cell => cell.type === 'seat').length;
    }

    // Calcula os assentos do segundo andar (se existir)
    if (Array.isArray(layout.secondFloor)) {
      totalSeats += layout.secondFloor.filter(cell => cell.type === 'seat').length;
    }

    return totalSeats;
  };

  const hasTwoFloors = (layout) => {
    // Verifica se há um segundo andar
    return Array.isArray(layout.secondFloor) && layout.secondFloor.length > 0;
  };

  const renderLayoutCard = (layout) => {
    const totalSeats = calculateTotalSeats(layout); // Total de assentos calculado
    const isTwoFloors = hasTwoFloors(layout); // Verifica se tem dois andares

    return (
      <Card
        onClick={() => goToLayoutBuilder(layout)}
        sx={{
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
          mb: 2,
          borderRadius: 2,
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
                  Layout ID: {layout.id}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Data Adicionado: {new Date(layout.dataAdicionado).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Editar">
                <IconButton size="small" edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); goToLayoutBuilder(layout); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <IconButton size="small" edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); setLayoutToDelete(layout); setConfirmDeleteOpen(true); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventSeatIcon fontSize="small" />
              <Typography variant="caption">
                Assentos Totais: {totalSeats}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DoubleArrowIcon fontSize="small" />
              <Typography variant="caption">Dois Andares: {isTwoFloors ? 'Sim' : 'Não'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div">
          Gerenciamento de Layout de Ônibus
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => goToLayoutBuilder()} sx={{ borderRadius: '50px' }}>
          Adicionar Novo Layout
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {layouts.length > 0 ? (
            layouts.map((layout) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={layout.id}>
                {renderLayoutCard(layout)}
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">Nenhum layout encontrado.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialog para confirmação de exclusão */}
      <Dialog open={confirmDeleteOpen} onClose={closeConfirmDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o layout selecionado? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} variant="contained" color="cancelled" sx={{borderRadius: '50px'}}>
            Voltar
          </Button>
          <Button onClick={handleDeleteLayout} variant="contained" color="error" sx={{ color: 'white', borderRadius: '50px' }}>
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens de sucesso/erro */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ManageBusLayoutPage;

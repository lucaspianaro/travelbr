import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, CircularProgress, Snackbar, Alert, IconButton, Card, CardContent, Collapse, Fade, Divider, Chip, Dialog, DialogContent, DialogActions, DialogTitle, Tooltip, TextField, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Layout from '../common/Layout';
import TravelForm from './TravelForm';
import SeatSelection from './SeatSelection';
import VehicleForm from '../vehicles/VehicleForm';
import { getTravelById, updateTravel, cancelTravel, deleteTravel } from '../../services/TravelService';
import { getAvailableSeats, getReservedSeats } from '../../services/OrderService';
import { addVehicle } from '../../services/VehicleService';
import { validateMasterPassword, formatDate } from '../../utils/utils';
import { getMasterPasswordStatus } from '../../services/AuthService';  
import { useDrawer } from '../../contexts/DrawerContext';

const drawerWidth = 240;

function TravelDetails() {
  const { travelId } = useParams();
  const [travel, setTravel] = useState(null);
  const [availableSeatsAndar1, setAvailableSeatsAndar1] = useState([]);
  const [availableSeatsAndar2, setAvailableSeatsAndar2] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);  // Estado para controlar a senha master
  const navigate = useNavigate();
  const allocationButtonRef = useRef(null);
  const { openDrawer } = useDrawer();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const travelData = await getTravelById(travelId);
        setTravel(travelData);
        if (travelData.veiculoId) {
          const totalSeats = parseInt(travelData.assentosAndar1, 10) + parseInt(travelData.assentosAndar2, 10);
          const seats = await getAvailableSeats(travelId, totalSeats);
          const reserved = await getReservedSeats(travelId);

          const activeReservedSeats = reserved.filter(reservation => reservation.status !== 'Cancelada');

          const seatsAndar1 = seats.slice(0, travelData.assentosAndar1);
          const seatsAndar2 = seats.slice(travelData.assentosAndar1, travelData.assentosAndar1 + travelData.assentosAndar2);

          setAvailableSeatsAndar1(seatsAndar1);
          setAvailableSeatsAndar2(seatsAndar2);
          setReservedSeats(activeReservedSeats);
        }
      } catch (err) {
        setError('Falha ao carregar detalhes da viagem: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    const fetchMasterPasswordStatus = async () => {
      const isActive = await getMasterPasswordStatus();  // Verifique o estado da senha master
      setMasterPasswordActive(isActive);
    };

    fetchMasterPasswordStatus();

  }, [travelId]);

  const handleEditToggle = () => setEditing(!editing);

  const handleGoBack = () => navigate('/viagens');

  const saveTravel = useCallback(async (updatedTravel) => {
    setLoading(true);
    try {
      await updateTravel(travelId, updatedTravel);
      const travelData = await getTravelById(travelId);
      setTravel(travelData);
      if (updatedTravel.veiculoId) {
        const totalSeats = parseInt(updatedTravel.assentosAndar1, 10) + parseInt(updatedTravel.assentosAndar2, 10);
        const seats = await getAvailableSeats(travelId, totalSeats);
        const reserved = await getReservedSeats(travelId);

        const activeReservedSeats = reserved.filter(reservation => reservation.status !== 'Cancelada');

        const seatsAndar1 = seats.slice(0, updatedTravel.assentosAndar1);
        const seatsAndar2 = seats.slice(updatedTravel.assentosAndar1, updatedTravel.assentosAndar1 + updatedTravel.assentosAndar2);

        setAvailableSeatsAndar1(seatsAndar1);
        setAvailableSeatsAndar2(seatsAndar2);
        setReservedSeats(activeReservedSeats);
      }
      setEditing(false);
      setError('');
    } catch (err) {
      setError('Erro ao salvar viagem. Por favor, tente novamente: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [travelId]);

  const handleOpenConfirmCancelDialog = () => {
    setConfirmCancelDialogOpen(true);
  };

  const handleCloseConfirmCancelDialog = () => {
    setConfirmCancelDialogOpen(false);
    setMasterPassword('');
  };

  const handleConfirmCancelTravel = async () => {
    setLoading(true);
    try {
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }
      await cancelTravel(travelId);
      const travelData = await getTravelById(travelId);
      setTravel(travelData);
      setError('');
      setConfirmCancelDialogOpen(false);
    } catch (err) {
      setError('Erro ao cancelar viagem. Por favor, tente novamente: ' + err.message);
    } finally {
      setLoading(false);
      setMasterPassword('');
    }
  };

  const handleOpenConfirmDeleteDialog = () => {
    setConfirmDeleteDialogOpen(true);
  };

  const handleCloseConfirmDeleteDialog = () => {
    setConfirmDeleteDialogOpen(false);
    setMasterPassword('');
  };

  const handleConfirmDeleteTravel = async () => {
    setLoading(true);
    try {
      if (masterPasswordActive) {
        await validateMasterPassword(masterPassword);
      }
      await deleteTravel(travelId);
      navigate('/viagens');
    } catch (err) {
      setError('Erro ao excluir viagem. Por favor, tente novamente: ' + err.message);
    } finally {
      setLoading(false);
      setConfirmDeleteDialogOpen(false);
      setMasterPassword('');
    }
  };

  const handleSelectSeats = (seats) => {
    setSelectedSeats(seats);
    if (seats.length > 0) {
      allocationButtonRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToAllocation = () => {
    navigate(`/viagens/${travelId}/alocar-passageiros`, { state: { selectedSeats } });
  };

  const handleViewReservations = () => {
    navigate(`/viagens/${travelId}/reservas`);
  };

  const handleNavigateToVehicles = () => {
    navigate('/veiculos');
  };

  const handleClickShowMasterPassword = () => setShowMasterPassword(!showMasterPassword);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const handleAddVehicle = async (newVehicle) => {
    try {
      await addVehicle(newVehicle);
      const travelData = await getTravelById(travelId);
      setTravel(travelData);
      const totalSeats = parseInt(travelData.assentosAndar1, 10) + parseInt(travelData.assentosAndar2, 10);
      const seats = await getAvailableSeats(travelId, totalSeats);
      const reserved = await getReservedSeats(travelId);

      const activeReservedSeats = reserved.filter(reservation => reservation.status !== 'Cancelada');

      const seatsAndar1 = seats.slice(0, travelData.assentosAndar1);
      const seatsAndar2 = seats.slice(travelData.assentosAndar1, travelData.assentosAndar1 + travelData.assentosAndar2);

      setAvailableSeatsAndar1(seatsAndar1);
      setAvailableSeatsAndar2(seatsAndar2);
      setReservedSeats(activeReservedSeats);

      setVehicleModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (travel && travel.origem && travel.destino) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(travel.origem)}&destination=${encodeURIComponent(travel.destino)}`;
      window.open(url, '_blank');
    } else {
      setSnackbarMessage('Origem e destino são necessários para gerar a rota.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const totalSeats = travel ? travel.assentosAndar1 + travel.assentosAndar2 : 0;
  const occupiedSeats = reservedSeats.length;

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Fade in={!loading}>
          <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Fade>
        {error && (
          <Snackbar open autoHideDuration={6000} onClose={() => setError('')}>
            <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
        <Card raised sx={{ mb: 2 }}>
          <CardContent>
            <Collapse in={!editing}>
              {travel ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip label={travel.status} sx={{ backgroundColor: getStatusColor(travel.status), color: 'white' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleOpenGoogleMaps}
                      startIcon={<LocationOnIcon />}
                    >
                      Ver Rota no Google Maps
                    </Button>
                  </Box>
                    {travel.identificador && (
                      <Chip label={`Identificador: ${travel.identificador}`} color="primary" />
                    )}
                  </Box>
                  {travel.origem && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                      <LocationOnIcon sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6" noWrap>{travel.origem}</Typography>
                    </Box>
                  )}
                  {travel.destino && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1 }} color="secondary" />
                      <Typography variant="h6" noWrap>{travel.destino}</Typography>
                    </Box>
                  )}
                  {travel.dataIda && travel.horarioIda && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateRangeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Data de Ida: {formatDate(travel.dataIda)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Hora: {travel.horarioIda}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                  {travel.somenteIda ? (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">Viagem somente de ida</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateRangeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Data de Retorno: {formatDate(travel.dataRetorno)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Hora: {travel.horarioRetorno}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                    </>
                  )}
                  {travel.veiculo ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DirectionsBusIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {travel.veiculo.identificadorVeiculo} - {travel.veiculo.placa} ({travel.veiculo.empresa})
                        </Typography>
                      </Box>
                      {totalSeats > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AirlineSeatReclineNormalIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Assentos Ocupados: {occupiedSeats}/{totalSeats}</Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AirlineSeatReclineNormalIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">Reservas: {occupiedSeats}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="error">
                          Para adicionar reservas, por favor, associe um veículo à viagem através do botão <strong>Editar</strong>. Caso ainda não tenha veículos cadastrados:
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => setVehicleModalOpen(true)} sx={{ ml: 2 }}>
                          Adicionar Veículo
                        </Button>
                      </Box>
                    </>
                  )}
                  {travel.veiculo && typeof travel.assentosAndar1 !== 'undefined' && travel.assentosAndar1 > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>Assentos 1° Andar: {travel.assentosAndar1}</Typography>
                  )}
                  {travel.veiculo && typeof travel.assentosAndar2 !== 'undefined' && travel.assentosAndar2 > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>Assentos 2° Andar: {travel.assentosAndar2}</Typography>
                  )}
                  {travel.informacoesAdicionais && (
                    <Typography variant="body2" sx={{ mb: 1 }}>Informações Adicionais: {travel.informacoesAdicionais}</Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {travel.status !== 'Cancelada' && (
                      <Button startIcon={<EditIcon />} variant="outlined" color="primary" onClick={handleEditToggle} sx={{ flex: 1 }}>
                        Editar
                      </Button>
                    )}
                    <Button startIcon={<ListIcon />} variant="outlined" color="primary" onClick={handleViewReservations} sx={{ flex: 1 }}>
                      Reservas
                    </Button>
                    {travel.status !== 'Cancelada' && travel.status !== 'Encerrada' && (
                      <Button startIcon={<CancelIcon />} variant="outlined" color="error" onClick={handleOpenConfirmCancelDialog} sx={{ flex: 1 }}>
                        Cancelar Viagem
                      </Button>
                    )}
                    {travel.status !== 'Cancelada' && travel.status !== 'Encerrada' && (
                      <Button startIcon={<DeleteIcon />} variant="outlined" color="inherit" onClick={handleOpenConfirmDeleteDialog} sx={{ flex: 1, borderColor: 'grey', color: 'grey' }}>
                        Excluir Viagem
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body1">Viagem não encontrada.</Typography>
              )}
            </Collapse>
            <Collapse in={editing}>
              <Dialog open={editing} fullWidth maxWidth="md" onClose={handleEditToggle}>
                <DialogContent sx={{ padding: 0 }}>
                  <Box sx={{ padding: 2, overflowY: 'auto', maxHeight: '80vh' }}>
                    <TravelForm travel={travel} saveTravel={saveTravel} cancelForm={handleEditToggle} />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleEditToggle} color="primary">
                    Fechar
                  </Button>
                </DialogActions>
              </Dialog>
            </Collapse>
          </CardContent>
        </Card>
        {travel?.veiculo && (
          <Card raised sx={{ mb: 2 }}>
            <CardContent>
              <SeatSelection
                seatsAndar1={availableSeatsAndar1}
                seatsAndar2={availableSeatsAndar2}
                reservedSeats={reservedSeats}
                onSelectSeat={handleSelectSeats}
              />
              <Box
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  left: openDrawer ? `calc(${drawerWidth}px + 16px)` : '16px',
                  zIndex: 1000,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: `calc(100% - ${openDrawer ? drawerWidth + 32 : 32}px)`,
                  maxWidth: '400px',
                }}
              >
                <Tooltip
                  title={selectedSeats.length === 0 ? 'Selecione ao menos um assento' : ''}
                  placement="top"
                  arrow
                  disableHoverListener={selectedSeats.length !== 0}
                >
                  <span>
                    <Button
                      ref={allocationButtonRef}
                      variant="contained"
                      color="primary"
                      onClick={handleProceedToAllocation}
                      disabled={selectedSeats.length === 0 || travel?.status === 'Cancelada'}
                      sx={{
                        width: 'calc(100% - 32px)',
                        maxWidth: '400px',
                      }}
                    >
                      Prosseguir com Alocação de Passageiros
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      <Dialog
        open={confirmCancelDialogOpen}
        onClose={handleCloseConfirmCancelDialog}
      >
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja cancelar esta viagem? Isso irá cancelar todas as reservas e pedidos. Esta ação não pode ser desfeita.
          </Typography>
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
          <Button onClick={handleCloseConfirmCancelDialog} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }} >
            Não
          </Button>
          <Button
            onClick={handleConfirmCancelTravel}
            variant="contained"
            color="confirmar"
            disabled={masterPasswordActive && !masterPassword || loading}
            sx={{ color: 'white' }} 
          >
            {loading ? <CircularProgress size={24} /> : 'Cancelar viagem'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={handleCloseConfirmDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
          </Typography>
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
          <Button onClick={handleCloseConfirmDeleteDialog} variant="contained" disabled={loading} color="cancelar" sx={{ color: 'white' }} >
            Não
          </Button>
          <Button
            onClick={handleConfirmDeleteTravel}
            variant="contained"
            color="confirmar"
            disabled={masterPasswordActive && !masterPassword || loading}
            sx={{ color: 'white' }} 
          >
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={vehicleModalOpen} onClose={() => setVehicleModalOpen(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <VehicleForm onSave={handleAddVehicle} onCancel={() => setVehicleModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Cancelada':
      return '#d27519';
    case 'Em andamento':
      return '#4CAF50';
    case 'Próxima':
      return '#2196F3';
    case 'Criada':
      return '#90CAF9';
    case 'Encerrada':
      return '#9E9E9E';
    default:
      return '#9E9E9E';
  }
};

export default TravelDetails;

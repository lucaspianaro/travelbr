import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Box, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Card, CardContent, Grid, Avatar, CircularProgress, TextField, InputAdornment, Snackbar, Alert, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PassengerDetails from './PassengerDetails';
import { formatCPF, formatDate, validateMasterPassword } from '../../utils/utils';
import { getMasterPasswordStatus } from '../../services/AuthService';
import { getAllPassengers } from '../../services/PassengerService';

const PassengerCard = ({ passengers, setPassengers, startEditing, handleDeletePassenger }) => {
  const [open, setOpen] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);

  useEffect(() => {
    const fetchMasterPasswordStatus = async () => {
      const isActive = await getMasterPasswordStatus();
      setMasterPasswordActive(isActive); // Definindo se a senha master está ativa
    };
    fetchMasterPasswordStatus();
  }, []);

  const handleCardClick = (passenger) => {
    setSelectedPassenger(passenger);
  };

  const handleCloseModal = () => {
    setSelectedPassenger(null);
  };

  const handleClickOpen = (passenger) => {
    setPassengerToDelete(passenger);
    setOpen(true);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setOpen(false);
      setPassengerToDelete(null);
      setMasterPassword(''); // Limpa o campo de senha quando o diálogo fecha
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (masterPasswordActive) {
        // Valida a senha master apenas se estiver ativa
        await validateMasterPassword(masterPassword);
      }
      await handleDeletePassenger(passengerToDelete.id);
      handleClose();
      setSnackbarMessage('Passageiro excluído com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error("Erro ao excluir passageiro: ", error);
      setSnackbarMessage('Erro ao excluir passageiro: ' + error.message);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsDeleting(false);
    }
  };

  const handleClickShowMasterPassword = () => setShowMasterPassword(!showMasterPassword);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const fetchedPassengers = await getAllPassengers();
        if (setPassengers) {
          setPassengers(fetchedPassengers);
        }
      } catch (error) {
        console.error('Erro ao buscar passageiros:', error);
        setSnackbarMessage('Erro ao buscar passageiros: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchPassengers();
  }, [setPassengers]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {passengers.length > 0 ? (
          passengers.map((passenger) => (
            <Grid item xs={12} sm={6} md={4} key={passenger.id}>
              <Card
                onClick={() => handleCardClick(passenger)}
                sx={{
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
                  mb: 1,
                  borderRadius: 2,
                  width: '100%',
                }}
              >
                <CardContent sx={{ padding: '8px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 28, height: 28 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {passenger.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          CPF: {passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); startEditing(passenger); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleClickOpen(passenger); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {passenger.estrangeiro ? (
                      <Typography variant="caption">Passaporte: {passenger.passaporte || 'Não informado'}</Typography>
                    ) : (
                      <Typography variant="caption">RG: {passenger.rg || 'Não informado'}</Typography>
                    )}
                    <Typography variant="caption">Data de Nascimento: {formatDate(passenger.dataNascimento)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ m: 2 }}>
            Nenhum passageiro encontrado.
          </Typography>
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza de que deseja excluir o passageiro {passengerToDelete?.nome}? Esta ação irá cancelar todas as reservas deste passageiro e não pode ser desfeita.
          </DialogContentText>
          {masterPasswordActive && (
            // Campo de senha master só aparece se `masterPasswordActive` for true
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
              autoComplete="new-password"
              disabled={isDeleting}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="cancelar" variant="contained" disabled={isDeleting} sx={{ borderRadius: '50px' }} >
            Voltar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={masterPasswordActive && !masterPassword || isDeleting}
            autoFocus
            sx={{ color: 'white', borderRadius: '50px' }}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <PassengerDetails
        passenger={selectedPassenger}
        open={Boolean(selectedPassenger)}
        onClose={handleCloseModal}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PassengerCard;

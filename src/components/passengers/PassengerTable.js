import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Snackbar, Alert, TextField, InputAdornment 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { formatCPF, formatDate, validateMasterPassword } from '../../utils/utils';
import { getMasterPasswordStatus } from '../../services/AuthService';
import PassengerDetails from './PassengerDetails';

const PassengerTable = ({ passengers, setPassengers, startEditing, handleDeletePassenger }) => {
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

  const handleRowClick = (passenger) => {
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

      // Remover o passageiro da lista de passageiros sem recarregar a página
      setPassengers((prevPassengers) =>
        prevPassengers.filter((passenger) => passenger.id !== passengerToDelete.id)
      );

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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell><strong>Nome</strong></TableCell>
            <TableCell><strong>CPF</strong></TableCell>
            <TableCell><strong>Data de Nascimento</strong></TableCell>
            <TableCell><strong>RG/Passaporte</strong></TableCell>
            <TableCell align="right"><strong>Ações</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {passengers.length > 0 ? (
            passengers.map((passenger) => (
              <TableRow
                key={passenger.id}
                hover
                onClick={() => handleRowClick(passenger)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{passenger.nome}</TableCell>
                <TableCell>{passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}</TableCell>
                <TableCell>{formatDate(passenger.dataNascimento)}</TableCell>
                <TableCell>
                  {passenger.estrangeiro
                    ? `Passaporte: ${passenger.passaporte || 'Não informado'}`
                    : `RG: ${passenger.rg || 'Não informado'}`}
                </TableCell>
                <TableCell align="right">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum passageiro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir o passageiro {passengerToDelete?.nome}? Esta ação não pode ser desfeita.
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
                autoComplete: 'new-password', // Desativa preenchimento automático para senhas
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
              autoComplete="off" // Desativa preenchimento automático no campo de senha
              disabled={isDeleting}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="cancelar" variant="contained" disabled={isDeleting}>
            Voltar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={masterPasswordActive && !masterPassword || isDeleting}
            autoFocus
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalhes do passageiro */}
      <PassengerDetails
        passenger={selectedPassenger}
        open={Boolean(selectedPassenger)}
        onClose={handleCloseModal}
      />

      {/* Snackbar de feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default PassengerTable;

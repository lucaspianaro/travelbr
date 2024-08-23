import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Alert, Collapse } from '@mui/material';
import { useAuth } from '../../contexts/useAuthState';
import { updateProfile } from '../../services/AuthService';

const mapFirebaseError = (error) => {
  switch (error.code || error.message) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique suas credenciais e tente novamente.';
    case 'auth/invalid-credential':
      return 'Senha incorreta. Tente novamente.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
};

const UpdateProfileForm = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (displayName !== currentUser.displayName) {
        await updateProfile({ displayName });
      }
      setSuccessMessage('Informações atualizadas com sucesso!');
    } catch (error) {
      setError(mapFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        id="email"
        label="Endereço de Email"
        name="email"
        autoComplete="email"
        value={currentUser.email}
        disabled
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        name="displayName"
        label="Nome Completo"
        id="displayName"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
      </Button>
      <Collapse in={!!error} timeout={500}>
        <Box sx={{ width: '100%', mb: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Collapse>
      <Collapse in={!!successMessage} timeout={500}>
        <Box sx={{ width: '100%', mb: 2 }}>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
        </Box>
      </Collapse>
    </Box>
  );
};

export default UpdateProfileForm;

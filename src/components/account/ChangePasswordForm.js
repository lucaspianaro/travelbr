import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Alert, Collapse, InputAdornment, IconButton, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/useAuthState';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '../../services/AuthService';

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número.');
  }
  return errors;
};

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

const ChangePasswordForm = () => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(' '));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('As senhas não correspondem.');
      setLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setSuccessMessage('Senha alterada com sucesso!');
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
        name="currentPassword"
        label="Senha Atual"
        type={showPassword ? 'text' : 'password'}
        id="currentPassword"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        name="newPassword"
        label="Nova Senha"
        type={showPassword ? 'text' : 'password'}
        id="newPassword"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        name="confirmNewPassword"
        label="Confirme a Nova Senha"
        type={showPassword ? 'text' : 'password'}
        id="confirmNewPassword"
        autoComplete="new-password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="body2" color="textSecondary">
        A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma letra minúscula e um número.
      </Typography>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Alterar Senha'}
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

export default ChangePasswordForm;

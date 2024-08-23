import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Alert, Collapse, InputAdornment, IconButton, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/useAuthState';
import { updateMasterPassword, checkMasterPasswordExists } from '../../services/AuthService';

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

const SetMasterPasswordForm = ({ masterPasswordActive }) => {
  const { currentUser } = useAuth();
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [masterPasswordExists, setMasterPasswordExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkMasterPassword = async () => {
      const exists = await checkMasterPasswordExists();
      setMasterPasswordExists(exists);
    };
    checkMasterPassword();
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const passwordErrors = validatePassword(masterPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(' '));
      setLoading(false);
      return;
    }

    if (masterPassword !== confirmMasterPassword) {
      setError('As senhas não correspondem.');
      setLoading(false);
      return;
    }

    try {
      await updateMasterPassword(currentMasterPassword, masterPassword);
      setSuccessMessage('Senha master definida com sucesso!');
    } catch (error) {
      setError(mapFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      {masterPasswordActive && (
        <>
          {masterPasswordExists && (
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              name="currentMasterPassword"
              label="Senha Master Atual"
              type={showPassword ? 'text' : 'password'}
              id="currentMasterPassword"
              autoComplete="current-password"
              value={currentMasterPassword}
              onChange={(e) => setCurrentMasterPassword(e.target.value)}
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
          )}
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            name="masterPassword"
            label="Nova Senha Master"
            type={showPassword ? 'text' : 'password'}
            id="masterPassword"
            autoComplete="new-password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
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
            name="confirmMasterPassword"
            label="Confirme a Nova Senha Master"
            type={showPassword ? 'text' : 'password'}
            id="confirmMasterPassword"
            autoComplete="new-password"
            value={confirmMasterPassword}
            onChange={(e) => setConfirmMasterPassword(e.target.value)}
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
            {loading ? <CircularProgress size={24} /> : 'Definir Senha Master'}
          </Button>
        </>
      )}
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

export default SetMasterPasswordForm;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuthState';
import {
  Container, Typography, Box, TextField, Button, Snackbar, Alert, CircularProgress, IconButton, InputAdornment, Collapse, Card, CardContent, CardActions, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import Layout from '../components/common/Layout';
import {
  updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider,
  updateMasterPassword, checkMasterPasswordExists
} from '../components/auth/authService';

// Função para validar a senha
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

// Função para mapear erros do Firebase para mensagens amigáveis
const mapFirebaseError = (error) => {
  switch (error.code || error.message) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique suas credenciais e tente novamente.';
    case 'auth/invalid-credential':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/email-already-in-use':
      return 'O endereço de e-mail já está em uso por outra conta.';
    case 'auth/invalid-email':
      return 'O endereço de e-mail não é válido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Tente uma senha mais forte.';
    case 'auth/network-request-failed':
      return 'Falha na rede. Verifique sua conexão e tente novamente.';
    case 'auth/email-not-verified':
      return 'Por favor, verifique seu e-mail antes de fazer login.';
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

const SetMasterPasswordForm = () => {
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

function MyAccount() {
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openMasterPassword, setOpenMasterPassword] = useState(false);

  return (
    <Layout showSidebar={true}>
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <Card variant="outlined" sx={{ width: '100%', mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Atualizar Perfil
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Atualize suas informações pessoais.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpenProfile(!openProfile)}
                endIcon={openProfile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {openProfile ? 'Fechar' : 'Abrir'}
              </Button>
            </CardActions>
            <Collapse in={openProfile} timeout="auto" unmountOnExit>
              <CardContent>
                <UpdateProfileForm />
              </CardContent>
            </Collapse>
          </Card>

          <Card variant="outlined" sx={{ width: '100%', mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LockIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Alteração de Senha
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Altere sua senha de login.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpenPassword(!openPassword)}
                endIcon={openPassword ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {openPassword ? 'Fechar' : 'Abrir'}
              </Button>
            </CardActions>
            <Collapse in={openPassword} timeout="auto" unmountOnExit>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Collapse>
          </Card>

          <Card variant="outlined" sx={{ width: '100%', mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Definir Senha Master
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Defina ou atualize sua senha master.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpenMasterPassword(!openMasterPassword)}
                endIcon={openMasterPassword ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {openMasterPassword ? 'Fechar' : 'Abrir'}
              </Button>
            </CardActions>
            <Collapse in={openMasterPassword} timeout="auto" unmountOnExit>
              <CardContent>
                <SetMasterPasswordForm />
              </CardContent>
            </Collapse>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
}

export default MyAccount;

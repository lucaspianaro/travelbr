import React, { useState, useEffect } from 'react';
import {
  Container, Box, Card, CardContent, CardActions, Typography,
  Collapse, Button, Switch, Dialog, DialogActions, DialogContent,
  DialogContentText, TextField, DialogTitle, CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Layout from '../components/common/Layout';
import UpdateProfileForm from '../components/account/UpdateProfileForm';
import ChangePasswordForm from '../components/account/ChangePasswordForm';
import SetMasterPasswordForm from '../components/account/SetMasterPasswordForm';
import MyAccountHelp from '../components/helps/MyAccountHelp'
import { getMasterPasswordFullStatus, toggleMasterPasswordActive } from '../services/AuthService';
import { validateMasterPassword } from '../utils/utils';

function MyAccount() {
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openMasterPassword, setOpenMasterPassword] = useState(false);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [masterPasswordDefined, setMasterPasswordDefined] = useState(false);

  useEffect(() => {
    const fetchMasterPasswordStatus = async () => {
      const { isActive, isDefined } = await getMasterPasswordFullStatus(); // Ajuste para desestruturar a resposta detalhada
      setMasterPasswordActive(isActive);
      setMasterPasswordDefined(isDefined);
    };
    fetchMasterPasswordStatus();
  }, []);

  const handleToggleMasterPasswordActive = async (event) => {
    const isActive = event.target.checked;

    if (!isActive) {
      if (masterPasswordDefined) {
        setConfirmDialogOpen(true);
      } else {
        await toggleMasterPasswordActive(false);
        setMasterPasswordActive(false);
      }
    } else {
      await toggleMasterPasswordActive(true);
      setMasterPasswordActive(true);
      setMasterPasswordDefined(true); // Considera a senha definida ao ativar
    }
  };

  const handleConfirmToggle = async () => {
    setIsProcessing(true);
    try {
      await validateMasterPassword(masterPassword);
      await toggleMasterPasswordActive(false);
      setMasterPasswordActive(false);
      setMasterPasswordDefined(false); // Reseta a definição da senha
      setConfirmDialogOpen(false);
      setMasterPassword('');
      setError('');
    } catch (error) {
      setError('Senha master incorreta. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout showSidebar={true}>
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ marginRight: 2 }}>
              Minha Conta
            </Typography>
            <MyAccountHelp />
          </Box>
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
                sx={{ borderRadius: '50px' }}
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
                sx={{ borderRadius: '50px' }}
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
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Definir Senha Master
                </Typography>
                <Switch
                  checked={masterPasswordActive}
                  onChange={handleToggleMasterPasswordActive}
                  color="primary"
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Defina ou atualize sua senha master.
              </Typography>
            </CardContent>
            {masterPasswordActive && (
              <>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setOpenMasterPassword(!openMasterPassword)}
                    endIcon={openMasterPassword ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ borderRadius: '50px' }}
                  >
                    {openMasterPassword ? 'Fechar' : 'Abrir'}
                  </Button>
                </CardActions>
                <Collapse in={openMasterPassword} timeout="auto" unmountOnExit>
                  <CardContent>
                    <SetMasterPasswordForm
                      masterPasswordActive={masterPasswordActive}
                    />
                  </CardContent>
                </Collapse>
              </>
            )}
          </Card>
        </Box>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Desativar Senha Master</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Para desativar a senha master, insira a senha master atual.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Senha Master"
              type="password"
              fullWidth
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialogOpen(false)}
              color="cancelar"
              variant="contained"
              disabled={isProcessing}
              sx={{ borderRadius: '50px' }}
            >
              Voltar
            </Button>
            <Button
              onClick={handleConfirmToggle}
              variant="contained"
              color="error"
              disabled={!masterPassword || isProcessing}
              sx={{ color: 'white', borderRadius: '50px' }}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default MyAccount;

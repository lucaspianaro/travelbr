import React, { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardActions, Typography, Collapse, Button, Switch } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Layout from '../components/common/Layout';
import UpdateProfileForm from '../components/account/UpdateProfileForm';
import ChangePasswordForm from '../components/account/ChangePasswordForm';
import SetMasterPasswordForm from '../components/account/SetMasterPasswordForm';
import { getMasterPasswordStatus, toggleMasterPasswordActive } from '../services/AuthService';

function MyAccount() {
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openMasterPassword, setOpenMasterPassword] = useState(false);
  const [masterPasswordActive, setMasterPasswordActive] = useState(false);

  useEffect(() => {
    // Verificar o status atual da senha master e atualizar o estado masterPasswordActive
    const fetchMasterPasswordStatus = async () => {
      const isActive = await getMasterPasswordStatus();
      setMasterPasswordActive(isActive);
    };
    fetchMasterPasswordStatus();
  }, []);

  const handleToggleMasterPasswordActive = async (event) => {
    const isActive = event.target.checked;
    setMasterPasswordActive(isActive);

    // Atualiza o estado no banco de dados
    await toggleMasterPasswordActive(isActive);
  };

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
      </Container>
    </Layout>
  );
}

export default MyAccount;

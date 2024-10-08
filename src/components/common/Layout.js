import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Collapse
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditRoadIcon from '@mui/icons-material/EditRoad';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import HelpIcon from '@mui/icons-material/Help';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import Logo from '../../assets/logo2.png';
import { logout } from '../../services/AuthService';
import { useAuth } from '../../contexts/useAuthState';
import { useDrawer } from '../../contexts/DrawerContext';
import { useIdleTimer } from 'react-idle-timer';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

// Estilização do componente principal
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, showSidebar }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: showSidebar ? `-${drawerWidth}px` : 0, 
    ...(open && showSidebar && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = ({ children, showSidebar = true, defaultOpenDrawer = true, hideLogout = false }) => {
  const theme = useTheme();
  const { openDrawer, toggleDrawer, closeDrawer } = useDrawer();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openVehicleSubMenu, setOpenVehicleSubMenu] = useState(false);

  useEffect(() => {
    if (!defaultOpenDrawer) {
      closeDrawer();
    }
  }, [defaultOpenDrawer, closeDrawer]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Falha ao sair:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubMenuClick = () => {
    setOpenVehicleSubMenu(!openVehicleSubMenu);
  };

  const handleOnIdle = () => {
    setSnackbarOpen(true);
  };

  const idleTimer = useIdleTimer({
    timeout: 300000,
    onIdle: handleOnIdle,
    debounce: 500
  });

  const handleSnackbarClick = () => {
    navigate('/central-ajuda');
  };

  const isSelected = (path) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {showSidebar && (
            <Tooltip title="Menu">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <img src={Logo} alt="Logo" style={{ height: 40, marginRight: 5 }} />
            <Typography variant="h6" noWrap component="div">
              TravelBR
            </Typography>
          </RouterLink>
          <Box sx={{ flexGrow: 1 }} />
          <RouterLink to="/central-ajuda" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Tooltip title="Ajuda">
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </RouterLink>
          {!hideLogout && !loading && currentUser && (
            <Tooltip title="Sair">
              <IconButton color="inherit" onClick={handleLogout}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          )}
          {loading && !hideLogout && <CircularProgress color="inherit" size={24} />}
        </Toolbar>
      </AppBar>

      {showSidebar && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={openDrawer}
        >
          <DrawerHeader>
            <IconButton onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem 
              button 
              component={RouterLink} 
              to="/" 
              selected={isSelected('/')}
              sx={isSelected('/') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/') ? { color: '#000' } : {}}><HomeIcon /></ListItemIcon>
              <ListItemText secondary="Início" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/viagens" 
              selected={isSelected('/viagens')}
              sx={isSelected('/viagens') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/viagens') ? { color: '#000' } : {}}><EditRoadIcon /></ListItemIcon>
              <ListItemText secondary="Viagens" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/passageiros" 
              selected={isSelected('/passageiros')}
              sx={isSelected('/passageiros') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/passageiros') ? { color: '#000' } : {}}><PeopleIcon /></ListItemIcon>
              <ListItemText secondary="Passageiros" />
            </ListItem>
            <ListItem button onClick={handleVehicleSubMenuClick}>
              <ListItemIcon><DirectionsBusIcon /></ListItemIcon>
              <ListItemText secondary="Veículos" />
              {openVehicleSubMenu ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openVehicleSubMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  component={RouterLink}
                  to="/veiculos"
                  selected={isSelected('/veiculos')}
                  sx={isSelected('/veiculos') ? { backgroundColor: '#e0e0e0', pl: 4 } : { pl: 4 }}
                >
                  <ListItemText secondary="Gerenciar Veículos" />
                </ListItem>
                <ListItem
                  button
                  component={RouterLink}
                  to="/veiculos/layout"
                  selected={isSelected('/veiculos/layout')}
                  sx={isSelected('/veiculos/layout') ? { backgroundColor: '#e0e0e0', pl: 4 } : { pl: 4 }}
                >
                  <ListItemText secondary="Layout de Assentos" />
                </ListItem>
              </List>
            </Collapse>
            <ListItem 
              button 
              component={RouterLink} 
              to="/pagamentos" 
              selected={isSelected('/pagamentos')}
              sx={isSelected('/pagamentos') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/pagamentos') ? { color: '#000' } : {}}><PaymentIcon /></ListItemIcon>
              <ListItemText secondary="Pagamentos" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/relatorios" 
              selected={isSelected('/relatorios')}
              sx={isSelected('/relatorios') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/relatorios') ? { color: '#000' } : {}}><AssessmentIcon /></ListItemIcon>
              <ListItemText secondary="Relatórios" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink} 
              to="/minha-conta" 
              selected={isSelected('/minha-conta')}
              sx={isSelected('/minha-conta') ? { backgroundColor: '#e0e0e0', color: '#000' } : {}}
            >
              <ListItemIcon sx={isSelected('/minha-conta') ? { color: '#000' } : {}}><AccountCircleIcon /></ListItemIcon>
              <ListItemText secondary="Minha Conta" />
            </ListItem>
          </List>
        </Drawer>
      )}

      <Main open={showSidebar && openDrawer} showSidebar={showSidebar}>
        <DrawerHeader />
        {children}
      </Main>

      <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: '100%', cursor: 'pointer' }}
          onClick={handleSnackbarClick}
        >
          Parece que você está inativo. Caso precise de ajuda, <strong>clique aqui</strong> ou pressione F1 para acessar a Central de Ajuda.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;

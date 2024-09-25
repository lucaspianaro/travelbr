import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HelpIcon from '@mui/icons-material/Help';
import Logo from '../../../assets/logo2.png'; // Ajuste o caminho da imagem do logo
import './NavBar.css'; // Importando o arquivo CSS para estilos personalizados

const Navbar = () => {
  return (
    <>
      <AppBar position="fixed" className="navbar">
        <Toolbar>
          {/* Logo e nome da empresa */}
          <RouterLink to="/" className="navbar-logo-link">
            <img src={Logo} alt="Logo" className="navbar-logo" />
            <Typography variant="h6" noWrap>
              TravelBR
            </Typography>
          </RouterLink>

          {/* Espaçamento flexível para ajustar os itens no AppBar */}
          <Box sx={{ flexGrow: 1 }} />   
          {/* Botão Entrar */}
          <RouterLink to="/login" className="navbar-login-link">
            <Button variant="contained" className="navbar-login-btn">
              Entrar
            </Button>
          </RouterLink>
          <RouterLink to="/central-ajuda" className="navbar-icon-link">
            <Tooltip title="Ajuda">
              <IconButton color="inherit" className="navbar-icon">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </RouterLink>

        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;

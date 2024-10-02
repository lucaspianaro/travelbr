import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-scroll'; // Importa o Link do react-scroll
import Logo from '../../../assets/logo2.png'; // Ajuste o caminho da imagem do logo
import ToggleColorMode from './ToggleColorMode'; // Importando o ToggleColorMode

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: '8px 12px',
}));

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function AppAppBar({ mode, toggleColorMode }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSectionClick = (sectionId) => {
    scrollToSection(sectionId);
    setOpen(false); // Fechar o Drawer no mobile após a seleção
  };

  return (
    <AppBar
      position="fixed"
      sx={{ boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 2 }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          {/* Logo e nome da empresa */}
          <RouterLink
            to="/"
            className="navbar-logo-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none', // Remove o sublinhado
            }}
          >
            <img
              src={Logo}
              alt="Logo"
              className="navbar-logo"
              style={{ width: '50px', height: 'auto', marginRight: '10px' }}
            />
            <Typography
              component="span"
              variant="h2"
              sx={(theme) => ({
                fontSize: '1.0rem', // Ajuste o valor conforme necessário
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              TravelBR
            </Typography>
          </RouterLink>

          {/* Centralizando as opções do menu */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button onClick={() => handleSectionClick('sobre-nos')}>Sobre Nós</Button>
              <Button onClick={() => handleSectionClick('equipe')}>Equipe</Button>
              <Button onClick={() => handleSectionClick('destaques')}>Destaques</Button>
              <Button onClick={() => handleSectionClick('contato')}>Contato</Button>
              <Button onClick={() => handleSectionClick('faq')}>FAQ</Button>
            </Box>
          </Box>

          {/* Botões "Entrar", Toggle Color Mode, e "Ajuda" no desktop */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <RouterLink to="/login" className="navbar-login-link">
              <Button variant="contained" className="navbar-login-btn">
                Entrar
              </Button>
            </RouterLink>

            {/* Toggle Theme Button */}
            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />

            {/* Ícone de Ajuda - Exibido somente em desktop */}
            <RouterLink to="/central-ajuda" className="navbar-icon-link">
              <Tooltip title="Ajuda">
                <IconButton
                  color="inherit"
                  sx={{ display: { xs: 'none', md: 'inline-flex' } }} // Escondido no mobile
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </RouterLink>
          </Box>

          {/* Drawer for mobile view */}
          <Box sx={{ display: { sm: 'flex', md: 'none' } }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'background.default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ my: 3 }} />

                {/* Links dentro do Drawer, centralizados */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <MenuItem onClick={() => handleSectionClick('sobre-nos')} sx={{ justifyContent: 'center' }}>
                    Sobre Nós
                  </MenuItem>
                  <MenuItem onClick={() => handleSectionClick('equipe')} sx={{ justifyContent: 'center' }}>
                    Equipe
                  </MenuItem>
                  <MenuItem onClick={() => handleSectionClick('destaques')} sx={{ justifyContent: 'center' }}>
                    Destaques
                  </MenuItem>
                  <MenuItem onClick={() => handleSectionClick('contato')} sx={{ justifyContent: 'center' }}>
                    Contato
                  </MenuItem>
                  <MenuItem onClick={() => handleSectionClick('faq')} sx={{ justifyContent: 'center' }}>
                    FAQ
                  </MenuItem>

                  {/* Ícone de Ajuda - Exibido somente no Drawer no mobile */}
                  <MenuItem sx={{ justifyContent: 'center' }}>
                    <RouterLink to="/central-ajuda" className="navbar-icon-link">
                      <Tooltip title="Ajuda">
                        <IconButton color="inherit" className="navbar-icon">
                          <HelpIcon />
                        </IconButton>
                      </Tooltip>
                    </RouterLink>
                  </MenuItem>
                </Box>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

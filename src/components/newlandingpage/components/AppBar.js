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

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '18px', // Tamanho de fonte menor
  fontWeight: 'normal', // Sem negrito
  color: 'secondary.main',
                ...theme.applyStyles('dark', {
                  color: 'secondary.light',
                }), // Cor suave
  textTransform: 'capitalize', // Primeira letra maiúscula
  letterSpacing: '0.5px', // Menor espaçamento entre letras
  marginLeft: '8px', // Margem à esquerda
}));

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
          {/* Logo and Company Name */}
          <RouterLink to="/" className="navbar-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={Logo} 
              alt="Logo" 
              className="navbar-logo" 
              style={{ width: '50px', height: 'auto', marginRight: '10px' }} 
            />
            {/* <StyledTypography variant="h6" noWrap>
              TravelBR
            </StyledTypography> */}
          </RouterLink>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button onClick={() => handleSectionClick('sobre-nos')}>Sobre Nós</Button>
              <Button onClick={() => handleSectionClick('equipe')}>Equipe</Button>
              <Button onClick={() => handleSectionClick('destaques')}>Destaques</Button>
              <Button onClick={() => handleSectionClick('contato')}>Contato</Button>
              <Button onClick={() => handleSectionClick('faq')}>FAQ</Button>
            </Box>
          </Box>

          {/* Custom "Entrar", Toggle Theme Button, and Help Icon */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
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

            <RouterLink to="/central-ajuda" className="navbar-icon-link">
              <Tooltip title="Ajuda">
                <IconButton color="inherit" className="navbar-icon">
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
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ my: 3 }} />
                
                {/* Links dentro do Drawer */}
                <MenuItem onClick={() => handleSectionClick('sobre-nos')}>
                  Sobre Nós
                </MenuItem>
                <MenuItem onClick={() => handleSectionClick('equipe')}>
                  Equipe
                </MenuItem>
                <MenuItem onClick={() => handleSectionClick('destaques')}>
                  Destaques
                </MenuItem>
                <MenuItem onClick={() => handleSectionClick('contato')}>
                  Contato
                </MenuItem>
                <MenuItem onClick={() => handleSectionClick('faq')}>
                  FAQ
                </MenuItem>

                {/* Adicionar botão de alternância de tema no Drawer */}
                <MenuItem>
                  <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                </MenuItem>

                <MenuItem>
                  <RouterLink to="/login" className="navbar-login-link">
                    <Button color="primary" variant="contained" fullWidth>
                      Entrar
                    </Button>
                  </RouterLink>
                </MenuItem>
                <MenuItem>
                  <RouterLink to="/central-ajuda" className="navbar-icon-link">
                    <Button color="primary" variant="outlined" fullWidth>
                      Ajuda
                    </Button>
                  </RouterLink>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

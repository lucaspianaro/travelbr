import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul
    },
    secondary: {
      main: '#dc004e', // Vermelho
    },
    success: {
      main: '#4caf50', // Verde
    },
    warning: {
      main: '#ff9800', // Laranja
    },
    info: {
      main: '#ffa726', // Amarelo
    },
    error: {
      main: '#f44336', // Vermelho para indicar algo cancelado
    },
    cancelled: {
      main: '#9e9e9e', // Cinza para indicar algo cancelado
    },
    confirmar: {
      main: '#F44336',
    },
    cancelar: {
      main: '#9E9E9E',
    }
  },
  typography: {
    fontFamily: 'Oxygen, Arial, sans-serif',
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.8rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
      },
    },
  },
});

export default theme;

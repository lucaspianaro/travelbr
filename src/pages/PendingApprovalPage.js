// src/pages/PendingApprovalPage.js
import React, { useEffect, useState } from 'react';
import { CircularProgress, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/AuthService'; // Importa a função de logout

function PendingApprovalPage() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5); // Para exibir contagem regressiva

  useEffect(() => {
    // Função para fazer o logout e iniciar o redirecionamento
    const performLogout = async () => {
      try {
        await logout(); // Realiza o logout do usuário
        console.log('Usuário foi deslogado com sucesso.');
      } catch (error) {
        console.error('Erro ao deslogar o usuário:', error);
      }
    };

    // Faz o logout quando o componente é montado
    performLogout();

    // Iniciar contagem regressiva e redirecionar após 5 segundos
    const countdown = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      navigate('/'); // Redireciona o usuário para a página principal
    }, 6000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f7f9fc',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
        Aguardando aprovação do administrador
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Sua conta ainda não foi aprovada. Você será desconectado e redirecionado para a página principal em {seconds} segundos.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, borderRadius: '50px'}}
        onClick={() => navigate('/login')}
      >
        Tentar fazer login novamente
      </Button>
    </Box>
  );
}

export default PendingApprovalPage;

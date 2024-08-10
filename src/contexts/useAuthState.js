import React, { useEffect, useState, useContext, createContext } from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { CircularProgress, Box, Typography } from '@mui/material';

// Cria um contexto para o estado de autenticação do usuário
const AuthContext = createContext(null);

// Provedor de contexto de autenticação que envolve os componentes filhos
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o usuário autenticado
  const [currentUser, setCurrentUser] = useState(null);
  // Estado para controlar o carregamento inicial
  const [loading, setLoading] = useState(true);

  // useEffect para monitorar as mudanças de autenticação
  useEffect(() => {
    // Função de callback chamada sempre que o estado de autenticação mudar
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Verifica se o e-mail do usuário foi verificado
        if (user.emailVerified) {
          setCurrentUser(user);
        } else {
          // Se o e-mail não for verificado, faz o logout do usuário
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup da subscrição ao desmontar o componente
    return unsubscribe;
  }, []);

  // Se o estado de carregamento estiver ativo, exibe um indicador de carregamento
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  // Provedor de contexto que envolve os componentes filhos
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para utilizar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

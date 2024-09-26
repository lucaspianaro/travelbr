import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, Grid, CircularProgress, Collapse, Zoom, IconButton, InputAdornment, Avatar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';  // Para redirecionamento
import Layout from '../components/common/Layout';
import logo3 from '../assets/logo3.jpg';
import { loginWithEmailPassword, registerWithEmailPassword, resetPassword, logout } from '../services/AuthService';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validateFields = () => {
    if (!email || !senha || (!isLogin && !nome)) {
      setErro("Por favor, preencha todos os campos.");
      return false;
    }
    if (!isLogin && senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!isLogin && !strongPasswordRegex.test(senha)) {
      setErro("A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula e um número.");
      return false;
    }

    return true;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setErro('');
    setSuccessMessage('');
    if (!validateFields()) return;
    setLoading(true);
    try {
      const user = await registerWithEmailPassword(email, senha, nome);
      setTimeout(() => {
        setSuccessMessage("Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta.");
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 2000);
      }, 10);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setErro('');
    setSuccessMessage('');
    
    if (!validateFields()) return;
    
    setLoading(true);
    console.log('Iniciando login com:', email); // Log de início do login
    
    try {
      // Tentativa de login com email e senha
      const { user, isApproved, emailVerified } = await loginWithEmailPassword(email, senha);
      
      console.log('Resultado do login:', user);
      console.log('Aprovação:', isApproved);
      console.log('Email verificado:', emailVerified);
  
      // Verificação de e-mail
      if (!emailVerified) {
        console.log('Usuário com e-mail não verificado.');
        setErro('Por favor, verifique seu e-mail antes de fazer login.');
        setLoading(false);
        return;
      }
  
      // Verificação de aprovação
      if (!isApproved) {
        console.log('Usuário não aprovado. Redirecionando para página de aprovação pendente.');
        navigate('/pendente-aprovacao'); // Redireciona para a página de aprovação pendente
        return;
      }
  
      // Se o usuário for aprovado, dispara o sucesso do login
      onLoginSuccess(user);
    } catch (error) {
      console.log('Erro durante o login:', error.message); // Exibe o erro no console
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErro("Por favor, insira seu email para redefinir a senha.");
      return;
    }
    try {
      await resetPassword(email);
      setErro("Link para redefinição de senha enviado. Verifique seu e-mail.");
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <Layout showSidebar={false} hideLogout={true}>
      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar alt="Logo" src={logo3} sx={{ width: 100, height: 100, mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Bem-vindo ao TravelBR
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            {isLogin ? 'Por favor, faça login para continuar.' : 'Registre-se para começar.'}
          </Typography>
          <Zoom in timeout={500}>
            <Typography component="h1" variant="h5">
              {isLogin ? 'Entrar' : 'Registrar'}
            </Typography>
          </Zoom>
          <Box component="form" onSubmit={isLogin ? handleLogin : handleRegister} noValidate sx={{ mt: 1, width: '100%' }}>
            <Collapse in={isLogin} timeout={1000}>
              <div>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Endereço de Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="senha"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <div style={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="textSecondary">* Campos Obrigatórios</Typography>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, borderRadius: '50px' }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Entrar'}
                </Button>
                <Collapse in={!!erro} timeout={500}>
                  <Box sx={{ width: '100%', mb: 2 }}>
                    {erro && <Alert severity="error">{erro}</Alert>}
                  </Box>
                </Collapse>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      onClick={handleForgotPassword}
                      fullWidth
                      variant="text"
                    >
                      Esqueceu sua senha?
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => setIsLogin(false)}
                    >
                      Não tem uma conta? Registrar
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Collapse>
            <Collapse in={!isLogin} timeout={1000}>
              <div>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="nome"
                  label="Nome Completo"
                  name="nome"
                  autoComplete="name"
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Endereço de Email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="senha"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
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
                <div style={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="textSecondary">* Campos Obrigatórios</Typography>
                </div>
                {erro && (
                <Collapse in={!!erro} timeout={500}>
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Alert severity="error">{erro}</Alert>
                  </Box>
                </Collapse>
              )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, borderRadius: '50px' }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Registrar'}
                </Button>
                <Collapse in={!!erro} timeout={500}>
                  <Box sx={{ width: '100%', mb: 2 }}>
                    {erro && <Alert severity="error">{erro}</Alert>}
                  </Box>
                </Collapse>
                <Collapse in={!!successMessage} timeout={500}>
                  <Box sx={{ width: '100%', mb: 2 }}>
                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                  </Box>
                </Collapse>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => setIsLogin(true)}
                    >
                      Já tem uma conta? Entrar
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Collapse>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}

export default LoginPage;

import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, Grid, CircularProgress, Collapse, Zoom, IconButton, InputAdornment, Avatar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Layout from '../components/common/Layout';
import logo3 from '../assets/logo3.jpg'; // Certifique-se de que o caminho para o logo está correto
import { loginWithEmailPassword, registerWithEmailPassword, resetPassword } from '../services/AuthService';

function LoginPage({ onLoginSuccess }) {
  // Estados para armazenar dados do formulário e mensagens de erro/sucesso
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alterna entre login e registro
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar ou esconder a senha

  // Função para alternar visibilidade da senha
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Função para validar os campos do formulário
  const validateFields = () => {
    if (!email || !senha || (!isLogin && !nome)) {
      setErro("Por favor, preencha todos os campos.");
      return false;
    }

    if (!isLogin && senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    // Atualizando o regex para aceitar caracteres especiais
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!isLogin && !strongPasswordRegex.test(senha)) {
      setErro("A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula e um número.");
      return false;
    }

    return true;
  };

  // Função para lidar com o registro de novo usuário
  const handleRegister = async (event) => {
    event.preventDefault();
    setErro('');
    setSuccessMessage('');
    if (!validateFields()) return;
    setLoading(true);
    try {
      const user = await registerWithEmailPassword(email, senha, nome);
      setTimeout(() => {
        setSuccessMessage("Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta. Caso não encontre, verifique também a caixa de spam e a lixeira.");
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 2000); // Retorna automaticamente para o login após 3 segundos
      }, 10); // Mostra a mensagem de redirecionamento após 3 segundos
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o login
  const handleLogin = async (event) => {
    event.preventDefault();
    setErro('');
    setSuccessMessage('');
    if (!validateFields()) return;
    setLoading(true);
    try {
      const user = await loginWithEmailPassword(email, senha);
      if (user.emailVerified) {
        onLoginSuccess(user);
      } else {
        setErro("Por favor, verifique seu e-mail antes de fazer login.");
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a redefinição de senha
  const handleForgotPassword = async () => {
    if (!email) {
      setErro("Por favor, insira seu email para redefinir a senha.");
      return;
    }
    try {
      await resetPassword(email);
      setErro("Link para redefinição de senha enviado. Verifique seu e-mail. Caso não encontre, verifique também a caixa de spam e a lixeira.");
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <Layout showSidebar={true}>
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

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { styled, useTheme } from '@mui/material/styles';
import ContactSvg from '../../../assets/landingpage/contact-us-animate.svg'; 
import { init, sendForm } from 'emailjs-com'; // Importa emailjs-com
import Alert from '@mui/material/Alert';

// Inicializa o EmailJS com seu User ID
init("8hcdiwwyR5OXExsP2");

const contactInfo = [
  {
    icon: <EmailRoundedIcon fontSize="large" />,
    title: 'E-mail',
    description: 'travelbruepg2024@gmail.com',
    href: 'mailto:travelbruepg2024@gmail.com', // Adicionando link mailto
  },
  {
    icon: <LocationOnRoundedIcon fontSize="large" />,
    title: 'Localização',
    description: 'Ponta Grossa, Paraná, Brasil',
  },
];

// Styled Button with animation
const AnimatedButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    transform: 'scale(1.05)',
    transition: 'transform 0.3s ease-in-out',
  },
  '&:active': {
    transform: 'scale(1)',
  },
}));

export default function Contact() {
  const theme = useTheme();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    telefone: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    telefone: false,
    message: false,
  });

  const [formFeedback, setFormFeedback] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = (data) => {
    const errors = {
      name: data.name.trim() === '',
      email: !/\S+@\S+\.\S+/.test(data.email),
      telefone: data.telefone.trim() === '',
      message: data.message.trim() === '',
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm(formValues)) {
      sendForm("default_service", "template_67ky9kq", "#contact-form")
        .then(() => {
          setSuccess(true);
          setFormFeedback("Mensagem enviada com sucesso!");
          setFormValues({ name: '', email: '', telefone: '', message: '' });
          setFormErrors({ name: false, email: false, telefone: false, message: false });
        })
        .catch(() => {
          setSuccess(false);
          setFormFeedback("Erro ao enviar a mensagem. Tente novamente.");
        });
    } else {
      setFormFeedback('Por favor, corrija os erros no formulário.');
    }
  };

  return (
    <Box
      id="contato"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: theme.palette.text.primary,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Contato
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Entre em contato conosco para mais informações sobre nossos serviços ou caso tenha dúvidas. Estamos prontos para ajudar!
          </Typography>
        </Box>

        {/* Informações de contato */}
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ textAlign: 'center' }}
        >
          {contactInfo.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                sx={{
                  color: theme.palette.text.primary,
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transition: 'background-color 0.3s',
                  },
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  {item.href ? (
                    <a href={item.href} style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                      <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {item.description}
                      </Typography>
                    </a>
                  ) : (
                    <>
                      <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {item.description}
                      </Typography>
                    </>
                  )}
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Formulário de contato com imagem ao lado */}
        <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
          {/* Coluna com o SVG/imagem */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={ContactSvg}
              alt="Contact illustration"
              sx={{
                width: '100%',
                maxWidth: 400,
                mx: 'auto',
                display: { xs: 'block', md: 'block' },
                height: 'auto',
              }}
            />
          </Grid>

          {/* Coluna com o formulário */}
          <Grid item xs={12} md={6}>
            <Box
              component="form"
              id="contact-form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
              }}
            >
              <TextField
                label="Nome"
                variant="outlined"
                fullWidth
                required
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                error={formErrors.name}
                helperText={formErrors.name ? 'Campo obrigatório' : ''}
              />
              <TextField
                label="E-mail"
                variant="outlined"
                fullWidth
                required
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                error={formErrors.email}
                helperText={formErrors.email ? 'E-mail inválido' : ''}
              />
              <TextField
                label="Telefone"
                variant="outlined"
                fullWidth
                required
                name="telefone"
                value={formValues.telefone}
                onChange={handleInputChange}
                error={formErrors.telefone}
                helperText={formErrors.telefone ? 'Campo obrigatório' : ''}
              />
              <TextField
                label="Mensagem"
                variant="outlined"
                fullWidth
                required
                name="message"
                value={formValues.message}
                onChange={handleInputChange}
                error={formErrors.message}
                helperText={formErrors.message ? 'Campo obrigatório' : ''}
              />
              <AnimatedButton
                variant="contained"
                color="secondary"
                size="large"
                type="submit"
                sx={{ alignSelf: 'center', mt: 2 }}
              >
                Enviar Mensagem
              </AnimatedButton>
            </Box>

            {/* Feedback após o envio */}
            {formFeedback && (
              <Typography
                variant="body2"
                sx={{ mt: 2, color: success ? 'green' : 'red', textAlign: 'center' }}
              >
                {formFeedback}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

import React, { useState } from "react";
import { Grid, Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import './Contact.css';
import ContactImage from '../../../assets/contato.jpg'; // Certifique-se de ajustar o caminho da imagem

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    // Simulação do envio
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  return (
    <Box id="contact" className="contact-section">
      <Box className="wrapper">
        <Typography variant="h4" className="contact-title">
          Entre em Contato
        </Typography>
        <Typography className="contact-description">
          Preencha o formulário abaixo para enviar uma mensagem e realizar um orçamento, nossa equipe entrará em contato com você o mais breve possível.
        </Typography>

        <Grid container spacing={4} className="contact-grid">
          <Grid item xs={12} md={6}>
            <form id="contact-form" onSubmit={handleSubmit}>
              <Typography variant="h5" className="form-title">
                Envie-nos uma Mensagem
              </Typography>
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: '#555' } }}
                InputProps={{
                  style: { color: '#333' },
                }}
                className="contact-input"
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: '#555' } }}
                InputProps={{
                  style: { color: '#333' },
                }}
                className="contact-input"
              />
              <TextField
                label="Mensagem"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={5}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: '#555' } }}
                InputProps={{
                  style: { color: '#333' },
                }}
                className="contact-input"
              />
              <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={sending}
                  className="submit-button"
                >
                  {sending ? <CircularProgress size={24} color="inherit" /> : "Enviar Mensagem"}
                </Button>
              </Box>
            </form>
          </Grid>

          {/* Imagem ao lado do formulário */}
          <Grid item xs={12} md={6}>
            <Box className="contact-image-container">
              <img src={ContactImage} alt="Contato" className="contact-image" />
            </Box>
          </Grid>
        </Grid>

        {/* Área de Informações de Contato */}
        <Box className="contact-info-section" sx={{ paddingTop: 4 }}>
          <Grid container spacing={4} justifyContent="center">
            {/* Endereço */}
            <Grid item xs={12} md={4} className="contact-info-box">
              <LocationOnIcon className="contact-icon" />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Ponta Grossa
              </Typography>
              <Typography variant="body1">Paraná, Brasil</Typography>
            </Grid>
            {/* Email */}
            <Grid item xs={12} md={4} className="contact-info-box">
              <EmailIcon className="contact-icon" />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
               Email
              </Typography>
              <Typography variant="body1">travelbruepg2024@gmail.com</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Snackbar de Sucesso */}
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Mensagem enviada com sucesso!
        </Alert>
      </Snackbar>

      {/* Snackbar de Erro */}
      <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
        <Alert onClose={() => setError(false)} severity="error" sx={{ width: '100%' }}>
          Ocorreu um erro ao enviar a mensagem. Tente novamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;

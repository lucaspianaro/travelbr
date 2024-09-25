import React from "react";
import { Grid, Typography, Box, Avatar } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Ícone de checagem
import Person01 from '../../../assets/lucas.jpg'; // Ajustar o caminho conforme necessário
import Person02 from '../../../assets/matheus.jpg';
import './About.css'; // Estilo específico para o About

const About = () => (
  <Box id="about" className="about-section" sx={{ padding: '80px 0' }}>
    <Box className="wrapper" textAlign="center">
      {/* Título da seção */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
        Sobre o TravelBR
      </Typography>
      <Typography className="font12" sx={{ marginBottom: 4 }}>
        O TravelBR é uma plataforma moderna que ajuda empresas de transporte a gerenciar viagens, passageiros, veículos e reservas de maneira eficiente e integrada. Nossa missão é facilitar o planejamento e o gerenciamento de todas as operações de viagens em um único lugar.
      </Typography>

      {/* Seção de Recursos */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2, color: '#1976d2' }}>
        Nossos principais recursos incluem:
      </Typography>
      <Grid container spacing={3} className="features-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Box className="feature-box" sx={{ textAlign: 'center' }}>
            <CheckCircleIcon className="feature-icon" sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Gestão de Viagens</Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie detalhes como itinerários, horários e preços de todas as viagens.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="feature-box" sx={{ textAlign: 'center' }}>
            <CheckCircleIcon className="feature-icon" sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Gerenciamento de Passageiros</Typography>
            <Typography variant="body2" color="textSecondary">
              Controle o histórico de reservas e informações de passageiros.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="feature-box" sx={{ textAlign: 'center' }}>
            <CheckCircleIcon className="feature-icon" sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controle de Frota</Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie os veículos da sua empresa, garantindo eficiência em cada viagem.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box className="feature-box" sx={{ textAlign: 'center' }}>
            <CheckCircleIcon className="feature-icon" sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Relatórios Detalhados</Typography>
            <Typography variant="body2" color="textSecondary">
              Acesse relatórios completos sobre ocupação e finanças.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Informações da equipe - Retorno ao layout anterior */}
      <Grid container spacing={4} sx={{ marginTop: 6 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Box className="team-box" sx={{ textAlign: 'center' }}>
            <Avatar alt="Lucas Pianaro" src={Person01} sx={{ width: 100, height: 100, marginBottom: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Lucas Pianaro</Typography>
            <Typography variant="subtitle1" color="textSecondary">Fundador</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box className="team-box" sx={{ textAlign: 'center' }}>
            <Avatar alt="Matheus Hoffmann" src={Person02} sx={{ width: 100, height: 100, marginBottom: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Matheus Hoffmann</Typography>
            <Typography variant="subtitle1" color="textSecondary">Fundador</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Box className="team-info" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Nossa Missão
            </Typography>
            <Typography variant="body2">
              Oferecer as melhores soluções para o gerenciamento de transporte, garantindo eficiência, satisfação dos passageiros e rentabilidade.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default About;

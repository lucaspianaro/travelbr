import React from "react";
import { Grid, Box, Typography, IconButton } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material"; // Ícone de seta para voltar ao topo
import { Link } from "react-scroll"; // Para navegação suave para o topo
import "./Footer.css"; // Estilos personalizados
import Logo from '../../../assets/logo3.jpg'; // Caminho para o logo

const Footer = () => (
  <Box className="footer">
    <Box className="wrapper">
      <Grid container spacing={2}>
        {/* Logo e Copyright */}
        <Grid item xs={12} sm={6} className="footer-box">
          <img src={Logo} alt="TravelBR Logo" className="footer-logo" />
          <Typography variant="body1" className="footer-text">
            © 2024 - TravelBR, Todos os direitos reservados.
          </Typography>
        </Grid>
        
        {/* Voltar ao topo */}
        <Grid item xs={12} sm={6} className="footer-box back-to-top">
          <Link to="hero" spy={true} smooth={true} offset={0} duration={500} style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" className="back-to-top-text">
              VOLTAR AO TOPO
            </Typography>
            <IconButton className="back-to-top-button">
              <ArrowUpward sx={{ color: "#fff", fontSize: 30 }} />
            </IconButton>
          </Link>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default Footer;

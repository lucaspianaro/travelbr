import React, { useState, useEffect } from "react";
import { Link } from "react-scroll"; // Importando o Link do react-scroll
import './Hero.css'; // Importando o arquivo de estilos
import LogoImage from '../../../assets/logo3.jpg'; // Sua logo permanece fixa

const backgroundImages = [
  'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1547886597-7e87e5288619?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1497302347632-904729bc24aa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]; // URLs de exemplo, substitua com suas próprias imagens

const Hero = () => {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Troca de imagem a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="hero"
      style={{ backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})` }}  // Background dinâmico
    >
      <div className="wrapper">
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-title">Bem-vindo ao TravelBR</h1>
            <h1 className="hero-title">A sua plataforma de gerenciamento de viagens.</h1>
            <p className="hero-subtitle">
              Organize e acompanhe suas viagens de forma simples e eficiente. Descubra novos destinos e personalize sua experiência.
            </p>
            <Link to="contact" smooth={true} duration={500}>
              <button className="cta-button">Começar Agora</button>
            </Link>
          </div>
          <div className="hero-image">
            <img src={LogoImage} alt="TravelBR Logo" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

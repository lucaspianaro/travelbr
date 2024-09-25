import React from "react";
import Hero from '../components/landingpage/hero/Hero'; // Importando o componente Hero
import Navbar from "../components/landingpage/navbar/NavBar"; // Importando o componente Navbar
import About from "../components/landingpage/about/About";
import Contact from "../components/landingpage/contact/Contact";
import Footer from "../components/landingpage/footer/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />  {/* Navbar vai no topo */}
      <Hero />    {/* Hero logo abaixo */}
      <About />  
      <Contact />
      <Footer />
    </>
  );
}

export default LandingPage;

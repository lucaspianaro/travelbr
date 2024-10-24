import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppAppBar from './components/AppBar'; // Certifique-se de importar corretamente
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Features from './components/Features';
import Founders from './components/Founders';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import getLPTheme from './theme/getLPTheme';
import TemplateFrame from './TemplateFrame';

export default function NewLandingPage() {
  const [mode, setMode] = React.useState('light'); // Tema claro por padrão
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  
  const MPTheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  React.useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode); // Armazena o tema selecionado no localStorage
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  return (
    <TemplateFrame
      toggleCustomTheme={toggleCustomTheme}
      showCustomTheme={showCustomTheme}
      mode={mode}
      toggleColorMode={toggleColorMode}
    >
      <ThemeProvider theme={showCustomTheme ? MPTheme : defaultTheme}>
        <CssBaseline enableColorScheme />
        
        {/* Passe toggleColorMode e mode para o AppAppBar */}
        <AppAppBar toggleColorMode={toggleColorMode} mode={mode} /> 
        <section id="hero">
        <Hero />
        </section>
        <Divider />

        <div>
          <section id="sobre-nos">
            <Features />
          </section>
          <Divider />

          <section id="equipe">
            <Founders />
          </section>
          <Divider />

          <section id="destaques">
            <Highlights />
          </section>
          <Divider />

          <section id="contato">
            <Contact />
          </section>
          <Divider />

          <section id="faq">
            <FAQ />
          </section>
          <Divider />

          <Footer />
        </div>
      </ThemeProvider>
    </TemplateFrame>
  );
}

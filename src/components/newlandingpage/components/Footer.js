import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import logo from '../../../assets/logo3.jpg'; // Importa a imagem corretamente

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
      {'Copyright © '}
      <Link color="text.secondary" href="https://travelbr-9d9f1.web.app">
        TravelBR
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Footer() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' }, // Sempre em linha
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'flex-start', // Alinha os itens no início
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: { xs: '50%', sm: '60%' }, // Largura mínima em dispositivos móveis
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
            <img
              src={logo}
              alt="TravelBR Logo"
              style={{
                width: '150px',
                borderRadius: '50%', // Arredondar a logo
              }}
            />
          </Box>
        </Box>

        {/* Seção de links do Produto */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            minWidth: { xs: '50%', sm: '40%' }, // Ajuste a largura para caber ao lado da logo
            textAlign: 'left', // Alinhamento à esquerda
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Produto
          </Typography>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection('sobre-nos')}
            sx={{ cursor: 'pointer' }}
          >
            Sobre nós
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection('equipe')}
            sx={{ cursor: 'pointer' }}
          >
            Equipe
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection('destaques')}
            sx={{ cursor: 'pointer' }}
          >
            Destaques
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection('contato')}
            sx={{ cursor: 'pointer' }}
          >
            Contato
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            onClick={() => scrollToSection('faq')}
            sx={{ cursor: 'pointer' }}
          >
            Perguntas Frequentes
          </Link>
        </Box>
      </Box>

      {/* Botão Voltar ao Topo */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => scrollToSection('hero')}
          sx={{
            borderRadius: '20px',
            minWidth: '150px',
          }}
        >
          Voltar ao Topo
        </Button>
      </Box>

      {/* Rodapé final com links e copyright na mesma linha */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: { xs: 4, sm: 8 },
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PrivacyPolicyModal />
          <TermsAndConditionsModal />
        </Box>
        <Copyright />
      </Box>

      {/* Créditos para as ilustrações em um Box separado */}
      <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
        <Typography
          variant="caption"
        >
          <a href="https://storyset.com/business" target="_blank" rel="noopener noreferrer">
            Business illustrations by Storyset
          </a>
        </Typography>
      </Box>
    </Container>
  );
}

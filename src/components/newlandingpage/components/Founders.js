import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/material'; // Para detectar o tamanho da tela
import Person01 from '../../../assets/lucas.jpg'; // Ajustar o caminho conforme necessário
import Person02 from '../../../assets/matheus.jpg';

// Aqui estão as informações e fotos dos fundadores
const founders = [
  {
    name: 'Lucas Pianaro',
    role: 'Fundador',
    description:
      'Lucas é um especialista em tecnologia com experiência e lidera o desenvolvimento técnico da plataforma.',
    imageLight: Person01,
    imageDark: Person01,
  },
  {
    name: 'Matheus Hoffmann',
    role: 'Fundador',
    description:
      'Matheus tem experiência na indústria de transporte e é responsável pela visão e estratégia da empresa.',
    imageLight: Person02,
    imageDark: Person02,
  },
];

// Layout para dispositivos móveis
function MobileLayout({ selectedItemIndex, handleItemClick, selectedFounder }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {founders.map(({ name }, index) => (
          <Button key={index} onClick={() => handleItemClick(index)} selected={selectedItemIndex === index}>
            {name}
          </Button>
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={{
            mb: 2,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 200,
            backgroundImage: `url(${founders[selectedItemIndex].imageLight})`,
            backgroundRepeat: 'no-repeat',
            borderRadius: '50%',
            width: 150,
            height: 150,
            margin: '0 auto',
          }}
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
            {selectedFounder.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFounder.role}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFounder.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

MobileLayout.propTypes = {
  handleItemClick: PropTypes.func.isRequired,
  selectedFounder: PropTypes.shape({
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageDark: PropTypes.string.isRequired,
    imageLight: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  selectedItemIndex: PropTypes.number.isRequired,
};

// Componente principal que adapta entre layout mobile e desktop
export default function Founders() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  const selectedFounder = founders[selectedItemIndex];
  
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm')); // Verifica se o dispositivo é móvel

  const handleItemClick = (index) => {
    setSelectedItemIndex(index);
  };

  return (
    <Container id="founders" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
          Nossa Equipe
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}>
          Conheça os fundadores da nossa empresa, os visionários por trás da plataforma. Com suas experiências únicas, eles lideram com inovação e compromisso.
        </Typography>
      </Box>

      {/* Renderiza layout mobile ou desktop, dependendo do tamanho da tela */}
      {isMobile ? (
        <MobileLayout
          selectedItemIndex={selectedItemIndex}
          handleItemClick={handleItemClick}
          selectedFounder={selectedFounder}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row-reverse' },
            gap: 2,
          }}
        >
          {/* Listagem de fundadores */}
          <div>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              {founders.map(({ name, role }, index) => (
                <Box
                  key={index}
                  component={Button}
                  onClick={() => handleItemClick(index)}
                  sx={{
                    p: 2,
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(selectedItemIndex === index && {
                      backgroundColor: 'action.selected',
                    }),
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      gap: 1,
                      textAlign: 'left',
                      textTransform: 'none',
                      color: 'text.secondary',
                      ...(selectedItemIndex === index && {
                        color: 'text.primary',
                      }),
                    }}
                  >
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="body2">{role}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </div>

          {/* Imagem do fundador */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: { xs: '100%', md: '70%' },
              height: '350px',
            }}
          >
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  m: 'auto',
                  width: 200,
                  height: 200,
                  backgroundSize: 'cover',
                  backgroundImage: `url(${founders[selectedItemIndex].imageLight})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  borderRadius: '50%',
                }}
              />
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
}

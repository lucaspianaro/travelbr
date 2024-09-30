import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { useTheme } from '@mui/material/styles';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Desempenho Adaptável',
    description:
      'Nosso produto se ajusta facilmente às suas necessidades, aumentando a eficiência e simplificando suas tarefas.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Construído para Durar',
    description:
      'Experimente uma durabilidade incomparável que vai além, oferecendo um investimento duradouro.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Ótima Experiência de Usuário',
    description:
      'Integre nosso produto ao seu dia a dia com uma interface intuitiva e fácil de usar.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Funcionalidade Inovadora',
    description:
      'Mantenha-se à frente com recursos que estabelecem novos padrões, atendendo melhor às suas necessidades em evolução.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Suporte Confiável',
    description:
      'Conte com nosso suporte ao cliente ágil, oferecendo assistência que vai além da compra.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Precisão em Cada Detalhe',
    description:
      'Aproveite um produto meticulosamente projetado, onde os pequenos toques fazem uma grande diferença em sua experiência geral.',
  },
];

export default function Highlights() {
  const theme = useTheme(); // Usando o tema do Material-UI

  return (
    <Box
      id="destaques"
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
            Destaques
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Explore por que nosso produto se destaca: adaptabilidade, durabilidade,
            design intuitivo e inovação. Aproveite o suporte ao cliente confiável e a
            precisão em cada detalhe.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: theme.palette.text.primary,
                  p: 3,
                  height: '100%',
                  borderColor: theme.palette.divider,
                  backgroundColor: theme.palette.background.paper,
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

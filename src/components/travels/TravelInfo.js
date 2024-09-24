import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { formatDate } from '../../utils/utils';

const statusStyles = {
  'Cancelada': { color: '#d27519', text: 'Cancelada' },
  'Em andamento': { color: '#4CAF50', text: 'Em andamento' },
  'Próxima': { color: '#2196F3', text: 'Próxima' },
  'Encerrada': { color: '#9E9E9E', text: 'Encerrada' },
  'Criada': { color: '#90CAF9', text: 'Criada' },
  'Indefinido': { color: '#9E9E9E', text: 'Indefinido' }
};

const TravelInfo = ({ travel }) => {
  if (!travel) return null;

  const { id, origem, destino, dataIda, dataRetorno, horarioIda, horarioRetorno, status, veiculo, identificador } = travel;
  const statusData = statusStyles[status] || statusStyles['Indefinido'];

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="travel-info-content"
        id={`travel-info-${id}`}
        sx={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          '&:hover': { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' },
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={statusData.text} sx={{ backgroundColor: statusData.color, color: 'white' }} />
                    {travel.identificador && (
                      <Chip label={`ID: ${travel.identificador}`} color="primary" />
                    )}
          </Box>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ mr: 1 }} color="primary" /> {origem}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ mr: 1 }} color="secondary" /> {destino}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Data de Ida: {formatDate(dataIda)} {horarioIda && ` - Hora: ${horarioIda}`}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DateRangeIcon sx={{ mr: 1 }} /> Data de Ida: {formatDate(dataIda)}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1 }} /> Hora de Ida: {horarioIda}
          </Typography>
          {dataRetorno && (
            <>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DateRangeIcon sx={{ mr: 1 }} /> Data de Retorno: {formatDate(dataRetorno)}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Hora de Retorno: {horarioRetorno}
              </Typography>
            </>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        {veiculo && (
          <Box>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DirectionsBusIcon sx={{ mr: 1 }} /> Veículo: {veiculo.identificadorVeiculo} - {veiculo.placa}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default TravelInfo;

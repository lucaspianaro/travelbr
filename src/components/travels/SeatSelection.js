import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, Tooltip } from '@mui/material';

const SeatSelection = ({ seatsAndar1, seatsAndar2, reservedSeats, onSelectSeat }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    onSelectSeat(Array.isArray(selectedSeats) ? selectedSeats : []);
  }, [selectedSeats, onSelectSeat]);

  // Função para alternar a seleção de um assento
  const toggleSeatSelection = (seat) => {
    setSelectedSeats((prevSelected) =>
      prevSelected.includes(seat)
        ? prevSelected.filter((s) => s !== seat)
        : [...prevSelected, seat]
    );
  };

  // Função para renderizar os assentos em uma grade
  const renderSeats = (seats) => {
    const rows = [];
    // Divide os assentos em linhas de 4 com um corredor no meio
    for (let i = 0; i < seats.length; i += 4) {
      const row = [];
      for (let j = i; j < i + 4; j += 2) {
        if (j < seats.length) {
          row.push(seats[j]);
        } else {
          row.push(null);
        }
        if (j + 1 < seats.length) {
          row.push(seats[j + 1]);
        } else {
          row.push(null);
        }
      }
      rows.push(row);
    }

    // Renderiza cada linha de assentos
    return rows.map((row, rowIndex) => (
      <Grid container justifyContent="center" key={rowIndex} sx={{ marginBottom: '8px' }}>
        {row.map((seat, colIndex) => {
          const reservedSeat = reservedSeats.find(reserved => reserved.number === seat?.number);
          const isReserved = reservedSeat && reservedSeat.status !== 'Cancelada';

          const passengerInfo = reservedSeat?.passenger 
            ? `${reservedSeat.passenger.nome} (${reservedSeat.passenger.cpf || reservedSeat.passenger.passaporte || reservedSeat.passenger.rg})`
            : '';

          return (
            <React.Fragment key={colIndex}>
              {colIndex === 2 && (
                <Grid item key={`aisle-${rowIndex}`} sx={{ width: '20px' }} /> // Espaço do corredor
              )}
              <Grid item>
                {seat ? (
                  <Tooltip title={isReserved ? passengerInfo : ''} arrow>
                    <span>
                      <Button
                        variant={selectedSeats.includes(seat) ? 'contained' : 'outlined'}
                        onClick={() => toggleSeatSelection(seat)}
                        disabled={isReserved}
                        sx={{
                          minWidth: '40px',
                          minHeight: '40px',
                          margin: '4px',
                          backgroundColor: isReserved ? 'gray' : selectedSeats.includes(seat) ? 'primary.main' : 'initial',
                          color: isReserved ? 'white' : selectedSeats.includes(seat) ? 'white' : 'initial',
                          cursor: isReserved ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {seat.number}
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Box sx={{ minWidth: '40px', minHeight: '40px', margin: '4px' }} />
                )}
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    ));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>Selecione os Assentos</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        {/* Legenda dos assentos */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <Button
            variant="outlined"
            sx={{
              minWidth: '40px',
              minHeight: '40px',
              margin: '4px',
              backgroundColor: 'gray',
              color: 'white'
            }}
            disabled
          >
          </Button>
          <Typography variant="body2" sx={{ marginLeft: '8px' }}>Reservado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <Button
            variant="outlined"
            sx={{
              minWidth: '40px',
              minHeight: '40px',
              margin: '4px',
              backgroundColor: 'white',
              borderColor: 'primary.main'
            }}
          >
          </Button>
          <Typography variant="body2" sx={{ marginLeft: '8px' }}>Disponível</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            sx={{
              minWidth: '40px',
              minHeight: '40px',
              margin: '4px',
              backgroundColor: 'primary.main',
              color: 'white'
            }}
            disabled
          >
          </Button>
          <Typography variant="body2" sx={{ marginLeft: '8px' }}>Selecionado</Typography>
        </Box>
      </Box>
      {/* Renderização dos assentos do 1° Andar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ marginBottom: '8px' }}>1° Andar</Typography>
        <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          {renderSeats(seatsAndar1)}
        </Box>
      </Box>
      {/* Renderização dos assentos do 2° Andar, se houver */}
      {seatsAndar2.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ marginBottom: '8px' }}>2° Andar</Typography>
          <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {renderSeats(seatsAndar2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SeatSelection;

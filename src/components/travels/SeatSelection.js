import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, Tooltip } from '@mui/material';
import { AirlineSeatReclineNormal, Wc, Stairs, Kitchen, Block } from '@mui/icons-material';

const SeatSelection = ({ layoutAndar1 = [], layoutAndar2 = [], reservedSeats = [], onSelectSeat }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    // Notificar o componente pai sobre a mudança nos assentos selecionados
    onSelectSeat(selectedSeats);
  }, [selectedSeats, onSelectSeat]);

  // Alternar a seleção de um assento com base no número do assento
  const toggleSeatSelection = (seat) => {
    setSelectedSeats((prevSelected) =>
      prevSelected.some((s) => s.number === seat.number)
        ? prevSelected.filter((s) => s.number !== seat.number) // Desseleciona o assento pelo número
        : [...prevSelected, seat] // Seleciona o assento
    );
  };

  // Converter o layout para matriz 2D
  const unflattenLayout = (flatLayout) => {
    const rows = Math.max(...flatLayout.map((cell) => cell.row)) + 1;
    const cols = Math.max(...flatLayout.map((cell) => cell.col)) + 1;

    const layout = Array.from({ length: rows }, () => Array(cols).fill({ type: 'empty', number: null }));

    flatLayout.forEach((cell) => {
      layout[cell.row][cell.col] = {
        type: cell.type || 'empty',
        number: cell.number ?? null,
      };
    });

    return layout;
  };

  // Renderizar o layout do andar
  const renderLayout = (layout) => {
    if (!Array.isArray(layout) || layout.length === 0) return null;

    return layout.map((row, rowIndex) => (
      <Grid container key={rowIndex} justifyContent="center" sx={{ marginBottom: '8px' }}>
        {row.map((cell, colIndex) => {
          const reservedSeat = reservedSeats.find((reserved) => reserved.number === cell.number);
          const isReserved = reservedSeat && reservedSeat.status !== 'Cancelada';

          const passengerInfo = reservedSeat?.passenger 
            ? `${reservedSeat.passenger.nome} (${reservedSeat.passenger.cpf || reservedSeat.passaporte || reservedSeat.passenger.rg})`
            : '';

          let tooltipText = '';
          if (cell.type === 'seat' && cell.number) {
            tooltipText = isReserved ? passengerInfo : `Assento ${cell.number}`;
          } else if (cell.type === 'bathroom') {
            tooltipText = 'Banheiro';
          } else if (cell.type === 'stair') {
            tooltipText = 'Escada';
          } else if (cell.type === 'fridge') {
            tooltipText = 'Frigobar';
          }

          return (
            <React.Fragment key={colIndex}>
              {colIndex === 2 && (
                <Grid item key={`aisle-${rowIndex}`} sx={{ width: '20px' }} /> // Espaço do corredor
              )}
              <Grid item>
                <Tooltip title={tooltipText} arrow>
                  <span>
                    <Button
                      variant={selectedSeats.some((selected) => selected.number === cell.number) ? 'contained' : 'outlined'}
                      onClick={() => toggleSeatSelection(cell)}
                      disabled={isReserved || cell.type !== 'seat'}
                      sx={{
                        width: '48px',   // Largura consistente para todas as células
                        height: '48px',  // Altura consistente para todas as células
                        margin: '4px',
                        display: 'flex',  // Garantir que o conteúdo esteja centralizado
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isReserved
                          ? 'gray'
                          : selectedSeats.some((selected) => selected.number === cell.number)
                          ? 'primary.main'  // Fundo azul quando selecionado
                          : 'initial',       // Padrão quando não selecionado
                        color: isReserved
                          ? 'white'
                          : selectedSeats.some((selected) => selected.number === cell.number)
                          ? 'white'          // Texto branco quando selecionado
                          : 'initial',
                        cursor: isReserved || cell.type !== 'seat' ? 'not-allowed' : 'pointer',
                        visibility: cell.type === 'empty' ? 'hidden' : 'visible',
                      }}
                    >
                      {renderCellContent(cell)}
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    ));
  };

  // Renderizar o conteúdo de cada célula
  const renderCellContent = (cell) => {
    switch (cell.type) {
      case 'seat':
        return cell.number ? `${cell.number}` : <AirlineSeatReclineNormal />;
      case 'bathroom':
        return <Wc />;
      case 'stair':
        return <Stairs />;
      case 'fridge':
        return <Kitchen />;
      case 'empty':
      default:
        return <Block />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>Selecione os Assentos</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <Button
            variant="outlined"
            sx={{
              width: '48px',
              height: '48px',
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
              width: '48px',
              height: '48px',
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
              width: '48px',
              height: '48px',
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
      {layoutAndar1.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: '8px' }}>1º Andar</Typography>
          <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {renderLayout(unflattenLayout(layoutAndar1))}
          </Box>
        </Box>
      )}
      {layoutAndar2.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ marginBottom: '8px' }}>2º Andar</Typography>
          <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {renderLayout(unflattenLayout(layoutAndar2))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SeatSelection;

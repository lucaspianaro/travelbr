import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Grid, Tooltip, CircularProgress } from '@mui/material';
import { AirlineSeatReclineNormal, Wc, Stairs, Kitchen, Block } from '@mui/icons-material';

const SeatChangeDialog = ({ open, onClose, currentSeat, layoutAndar1 = [], layoutAndar2 = [], reservedSeats = [], allocatedSeats = [], onSeatChange }) => {
  const [selectedSeat, setSelectedSeat] = useState(currentSeat);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setSelectedSeat(currentSeat);  // Inicializa o estado com o assento atual
      setLoading(true);  // Ativa o estado de carregamento ao abrir o diálogo
    }
  }, [currentSeat, open]);

  useEffect(() => {
    if (open && (layoutAndar1.length > 0 || layoutAndar2.length > 0)) {
      setLoading(false);  // Desativa o estado de carregamento quando os layouts estão carregados
    }
  }, [layoutAndar1, layoutAndar2, open]);

  const handleSeatSelection = (seat) => {
    setSelectedSeat(seat.number);  // Atualiza o assento selecionado
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
          const isAllocated = allocatedSeats.includes(cell.number) && cell.number !== currentSeat;

          let tooltipText = '';
          if (cell.type === 'seat' && cell.number) {
            tooltipText = isReserved ? 'Reservado' : `Assento ${cell.number}`;
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
                <Tooltip
                  title={tooltipText}
                  arrow
                >
                  <span>
                    <Button
                      variant={selectedSeat === cell.number ? 'contained' : 'outlined'}
                      onClick={() => handleSeatSelection(cell)}
                      disabled={isReserved || isAllocated || cell.type !== 'seat'}
                      sx={{
                        width: '48px', // Largura consistente
                        height: '48px', // Altura consistente
                        margin: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isReserved
                          ? 'gray'
                          : selectedSeat === cell.number
                            ? 'primary.main'
                            : 'initial',
                        color: isReserved || selectedSeat === cell.number ? 'white' : 'initial',
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>Trocar assento</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="subtitle1">1° Andar</Typography>
              {renderLayout(unflattenLayout(layoutAndar1))}
            </Box>
            {layoutAndar2.length > 0 && (
              <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9', mt: 2 }}>
                <Typography variant="subtitle1">2° Andar</Typography>
                {renderLayout(unflattenLayout(layoutAndar2))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="cancelled">
          Voltar
        </Button>
        <Button
          onClick={() => {
            onSeatChange(selectedSeat);
            onClose();
          }}
          variant="contained"
          color="primary"
          disabled={!selectedSeat || selectedSeat === currentSeat}
          sx={{ borderRadius: '50px' }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatChangeDialog;

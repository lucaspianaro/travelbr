import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Grid, Tooltip, CircularProgress } from '@mui/material';

const SeatChangeDialog = ({ open, onClose, currentSeat, availableSeatsAndar1, availableSeatsAndar2, reservedSeats, allocatedSeats, onSeatChange }) => {
  const [selectedSeat, setSelectedSeat] = useState(currentSeat);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setSelectedSeat(currentSeat);
      setLoading(true); 
    }
  }, [currentSeat, open]);

  useEffect(() => {
    if (open && (availableSeatsAndar1.length > 0 || availableSeatsAndar2.length > 0)) {
      setLoading(false); 
    }
  }, [availableSeatsAndar1, availableSeatsAndar2, open]);

  const handleSeatSelection = (seat) => {
    setSelectedSeat(seat);
  };

  const renderSeats = (seats, reserved, startNumber = 0) => {
    const rows = [];
    const seatsMap = seats.reduce((acc, seat) => {
      acc[seat.number] = seat;
      return acc;
    }, {});

    const seatsArray = seats.map((seat, i) => startNumber + i + 1);

    for (let i = 0; i < seatsArray.length; i += 4) {
      const row = [];
      for (let j = i; j < i + 4; j += 2) {
        if (j < seatsArray.length) {
          row.push(seatsArray[j]);
        } else {
          row.push(null);
        }
        if (j + 1 < seatsArray.length) {
          row.push(seatsArray[j + 1]);
        } else {
          row.push(null);
        }
      }
      rows.push(row);
    }

    return rows.map((row, rowIndex) => (
      <Grid container justifyContent="center" key={rowIndex} sx={{ marginBottom: '8px' }}>
        {row.map((seatNumber, colIndex) => {
          const seat = seatsMap[seatNumber];
          const isReserved = reserved.find(s => s.number === seatNumber);
          const isAllocated = allocatedSeats.includes(seatNumber) && seatNumber !== currentSeat;

          return (
            <React.Fragment key={colIndex}>
              {colIndex === 2 && (
                <Grid item key={`aisle-${rowIndex}`} sx={{ width: '20px' }} /> 
              )}
              <Grid item>
                {seat ? (
                  <Tooltip title={`Assento ${seat.number}`} arrow>
                    <span>
                      <Button
                        variant={selectedSeat === seat.number ? 'contained' : 'outlined'}
                        onClick={() => handleSeatSelection(seat.number)}
                        disabled={!!isReserved || isAllocated} 
                        sx={{
                          minWidth: '40px',
                          minHeight: '40px',
                          margin: '4px',
                          backgroundColor: selectedSeat === seat.number ? 'primary.main' : 'initial',
                          color: selectedSeat === seat.number ? 'white' : 'initial',
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>Selecionar Novo Assento</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <Typography variant="subtitle1">1° Andar</Typography>
              {renderSeats(availableSeatsAndar1, reservedSeats, 0)}
            </Box>
            {availableSeatsAndar2.length > 0 && (
              <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9', mt: 2 }}>
                <Typography variant="subtitle1">2° Andar</Typography>
                {renderSeats(availableSeatsAndar2, reservedSeats, availableSeatsAndar1.length)}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary">
          Descartar
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

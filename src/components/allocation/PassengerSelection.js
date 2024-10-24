import React from 'react';
import { Grid, Typography, TextField, CircularProgress, FormControlLabel, Checkbox, IconButton, Alert, AlertTitle, Autocomplete, Tooltip } from '@mui/material';
import { formatCPF, formatRG } from '../../utils/utils';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const PassengerSelection = ({
  reservations,
  passengers,
  loadingPassengers,
  duplicateWarnings,
  underageWarnings,
  handleInputChange,
  handlePayerChange,
  handleOpenFormDialog,
  handleOpenSeatSelection,
  handleRemoveReservation,
  editingReservation,
}) => {
  return (
    <Grid container spacing={2}>
      {reservations.map((reservation, index) => (
        <React.Fragment key={reservation.id || index}>
          <Grid item xs={12} container alignItems="center">
            {!editingReservation && reservations.length > 1 && (
              <Tooltip title="Remover assento do pedido">
                <IconButton
                  onClick={() => handleRemoveReservation(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              Assento {reservation.numeroAssento}
            </Typography>
            <Tooltip title="Trocar assento">
              <IconButton
                color="primary"
                onClick={() => handleOpenSeatSelection(index)}
                disabled={reservation.status === 'Cancelada'}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          {duplicateWarnings[index] && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <AlertTitle>Aviso</AlertTitle>
                Este passageiro já está alocado nesta viagem.
              </Alert>
            </Grid>
          )}
          {underageWarnings[index] && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <AlertTitle>Aviso</AlertTitle>
                O passageiro selecionado é menor de idade.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={passengers}
              getOptionLabel={(option) => {
                let label = `${option.nome}`;
                if (option.cpf) {
                  label += ` - CPF: ${formatCPF(option.cpf)}`;
                }
                if (option.estrangeiro) {
                  label += ` - Passaporte: ${option.passaporte}`;
                } else {
                  label += ` - RG: ${formatRG(option.rg)}`;
                }
                return label;
              }}
              loading={loadingPassengers}
              value={
                passengers.find((p) => p.id === reservation.passengerId) || null
              }
              onChange={(event, newValue) =>
                handleInputChange(index, event, newValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Passageiro"
                  fullWidth
                  required
                  disabled={reservation.status === 'Cancelada'}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingPassengers ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                        <Tooltip title="Adicionar Novo Passageiro">
                          <IconButton
                            onClick={handleOpenFormDialog}
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reservation.pagador}
                  onChange={() => handlePayerChange(index)}
                  name="pagador"
                  color="primary"
                  disabled={reservation.status === 'Cancelada'}
                />
              }
              label="É o pagador do pedido"
            />
          </Grid>
          {reservation.status === 'Cancelada' && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <AlertTitle>Aviso</AlertTitle>
                Este assento está cancelado e não pode ser modificado.
              </Alert>
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default PassengerSelection;

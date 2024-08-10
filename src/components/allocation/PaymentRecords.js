import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  Button,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const PaymentRecords = ({
  paymentRecords,
  handlePaymentRecordChange,
  handleRemovePaymentRecord,
  handleAddPaymentRecord,
  detalhesPagamento,
  setErrors,
}) => {
  const [localErrors, setLocalErrors] = useState({});

  const validatePayment = (index, value, updatedRecords) => {
    // Convert ',' to '.' for calculations
    const numericValue = parseFloat(value.replace(',', '.') || 0);

    const totalPaid =
      updatedRecords.reduce(
        (total, record, idx) =>
          total + (idx !== index ? parseFloat(record.valor.replace(',', '.') || 0) : 0),
        0
      ) + numericValue;

    const exceedsTotal = totalPaid > parseFloat(detalhesPagamento.valorTotal.replace(',', '.'));
    const invalidValue = value === '' || numericValue <= 0;

    setLocalErrors((prevErrors) => ({
      ...prevErrors,
      [`valor-${index}`]: invalidValue
        ? 'O valor do pagamento deve ser maior que zero.'
        : exceedsTotal
        ? 'O valor pago não pode exceder o valor total.'
        : '',
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      paymentRecord: exceedsTotal || invalidValue,
    }));
  };

  const handleRemoveRecord = (index) => {
    const updatedRecords = paymentRecords.filter((_, i) => i !== index);
    handleRemovePaymentRecord(index);

    // Revalidate all records after removal
    updatedRecords.forEach((record, idx) =>
      validatePayment(idx, record.valor, updatedRecords)
    );
    setErrors((prevErrors) => ({
      ...prevErrors,
      paymentRecord: false,
    }));
  };

  // Helper function to ensure input contains only valid numbers
  const handleNumberInput = (e) => {
    const char = String.fromCharCode(e.which);
    const isAllowed = /^\d|\.|-$/; // Allow digits, dot, and minus
    if (!isAllowed.test(char)) {
      e.preventDefault();
    }
  };

  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Registros de Pagamento
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddPaymentRecord}
        >
          Adicionar Pagamento
        </Button>
      </Box>
      {paymentRecords.map((record, index) => (
        <Box
          key={index}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            backgroundColor: '#ffffff',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Data de Pagamento"
                type="date"
                value={record.data}
                onChange={(e) =>
                  handlePaymentRecordChange(index, 'data', e.target.value)
                }
                fullWidth
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Valor do Pagamento"
                type="text"
                value={record.valor}
                onChange={(e) => {
                  const newValue = e.target.value.replace(',', '.'); // Convert ',' to '.'
                  handlePaymentRecordChange(index, 'valor', newValue);
                  validatePayment(index, newValue, paymentRecords);
                }}
                onKeyPress={handleNumberInput} // Only allow numbers and dots
                fullWidth
                required
                error={!!localErrors[`valor-${index}`]}
                helperText={localErrors[`valor-${index}`]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Método"
                value={record.metodoPagamento}
                onChange={(e) =>
                  handlePaymentRecordChange(
                    index,
                    'metodoPagamento',
                    e.target.value
                  )
                }
                fullWidth
                required
              >
                <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                <MenuItem value="Pix">Pix</MenuItem>
                <MenuItem value="Cartão">Cartão</MenuItem>
                <MenuItem value="Boleto">Boleto</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
              <Tooltip title="Remover registro de pagamento">
                <IconButton onClick={() => handleRemoveRecord(index)}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default PaymentRecords;

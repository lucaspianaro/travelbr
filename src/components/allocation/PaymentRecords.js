import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, InputAdornment, Tooltip, IconButton, Button, Typography, Box, Alert } from '@mui/material';
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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    validateAllPayments(paymentRecords);
  }, [paymentRecords]);

  const validatePayment = (index, field, value, updatedRecords) => {
    const numericValue = parseFloat(value.replace(',', '.') || 0);
    const totalPaid = updatedRecords.reduce(
      (total, record) => total + parseFloat(record.valor.replace(',', '.') || 0),
      0
    );

    const exceedsTotal = totalPaid > parseFloat(detalhesPagamento.valorTotal.replace(',', '.'));

    let error = '';
    if (field === 'valor') {
      error = numericValue <= 0 ? 'O valor do pagamento deve ser maior que zero.' : '';
    } else if (field === 'data' && !value) {
      error = 'A data de pagamento é obrigatória.';
    } else if (field === 'metodoPagamento' && !value) {
      error = 'O método de pagamento é obrigatório.';
    }

    setLocalErrors((prevErrors) => ({
      ...prevErrors,
      [`${field}-${index}`]: error || (exceedsTotal ? 'O valor pago não pode exceder o valor total.' : ''),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      paymentRecord: exceedsTotal || error,
    }));

    validateAllPayments(updatedRecords);
  };

  const validateAllPayments = (updatedRecords) => {
    const hasInvalidPayments = updatedRecords.some((record) => {
      const numericValue = parseFloat(record.valor.replace(',', '.') || 0);
      return (
        !record.data ||
        numericValue <= 0 ||
        !record.metodoPagamento ||
        localErrors[`valor-${paymentRecords.indexOf(record)}`] ||
        localErrors[`data-${paymentRecords.indexOf(record)}`] ||
        localErrors[`metodoPagamento-${paymentRecords.indexOf(record)}`]
      );
    });

    if (hasInvalidPayments) {
      setErrorMessage(
        'Todos os campos de data, valor e método são obrigatórios para cada registro de pagamento.'
      );
    } else {
      setErrorMessage('');
    }
  };

  const handleRemoveRecord = (index) => {
    const updatedRecords = paymentRecords.filter((_, i) => i !== index);
    handleRemovePaymentRecord(index);
    validateAllPayments(updatedRecords);

    setErrors((prevErrors) => ({
      ...prevErrors,
      paymentRecord: false,
    }));
  };

  const handleNumberInput = (e) => {
    const char = String.fromCharCode(e.which);
    const isAllowed = /^\d|\.|-$/;
    if (!isAllowed.test(char)) {
      e.preventDefault();
    }
  };

  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Registros de Pagamento</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddPaymentRecord}
          sx={{ borderRadius: '50px' }}
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
                error={!!localErrors[`data-${index}`]}
                helperText={localErrors[`data-${index}`]}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Valor do Pagamento"
                type="text"
                value={record.valor}
                onChange={(e) => {
                  const newValue = e.target.value.replace(',', '.');
                  handlePaymentRecordChange(index, 'valor', newValue);
                  validatePayment(index, 'valor', newValue, paymentRecords);
                }}
                onKeyPress={handleNumberInput}
                fullWidth
                required
                error={!!localErrors[`valor-${index}`]}
                helperText={localErrors[`valor-${index}`]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Método"
                value={record.metodoPagamento}
                onChange={(e) => {
                  handlePaymentRecordChange(index, 'metodoPagamento', e.target.value);
                  validatePayment(index, 'metodoPagamento', e.target.value, paymentRecords);
                }}
                fullWidth
                required
                error={!!localErrors[`metodoPagamento-${index}`]}
                helperText={localErrors[`metodoPagamento-${index}`]}
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
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Box>
  );
};

export default PaymentRecords;

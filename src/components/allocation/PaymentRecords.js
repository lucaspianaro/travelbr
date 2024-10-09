import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, InputAdornment, Tooltip, IconButton, Button, Typography, Box, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Função para formatar o valor como moeda sem o símbolo R$
const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
  }).format(parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0);
};

const unformatCurrency = (value) => {
  return value.replace(/[^\d,-]/g, '').replace(',', '.');
};

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
  const [tempValues, setTempValues] = useState(paymentRecords.map(record => record.valor || '')); // Controla valores sem formatação

  useEffect(() => {
    validateAllPayments(paymentRecords);
  }, [paymentRecords]);

  const validatePayment = (index, field, value, updatedRecords) => {
    const numericValue = parseFloat(unformatCurrency(value) || 0);
    const totalPaid = updatedRecords.reduce(
      (total, record) => total + parseFloat(unformatCurrency(record.valor) || 0),
      0
    );

    const exceedsTotal = totalPaid > parseFloat(unformatCurrency(detalhesPagamento.valorTotal));

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
      const numericValue = parseFloat(unformatCurrency(record.valor) || 0);
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
      setErrors((prevErrors) => ({
        ...prevErrors,
        paymentRecord: true, // Flag indicando erro nos registros de pagamento
      }));
    } else {
      setErrorMessage('');
      setErrors((prevErrors) => ({
        ...prevErrors,
        paymentRecord: false, // Não há erros
      }));
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

  const handleBlurValor = (index) => {
    const updatedValue = formatCurrency(tempValues[index]);
    const newRecords = [...paymentRecords];
    newRecords[index].valor = unformatCurrency(tempValues[index]);
    setTempValues((prev) => {
      const newTempValues = [...prev];
      newTempValues[index] = updatedValue;
      return newTempValues;
    });
    handlePaymentRecordChange(index, 'valor', unformatCurrency(tempValues[index]));
  };

  const handleChangeValor = (index, newValue) => {
    // Permite números, vírgula e ponto
    const unformattedValue = newValue.replace(/[^0-9,]/g, ''); 
    setTempValues((prev) => {
      const newTempValues = [...prev];
      newTempValues[index] = unformattedValue;
      return newTempValues;
    });
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
                value={tempValues[index]} // Exibe o valor temporário
                onChange={(e) => {
                  const newValue = e.target.value;
                  handleChangeValor(index, newValue);
                  validatePayment(index, 'valor', newValue, paymentRecords);
                }}
                onBlur={() => handleBlurValor(index)} // Formata o valor ao sair do campo
                fullWidth
                required
                error={!!localErrors[`valor-${index}`]}
                helperText={localErrors[`valor-${index}`]}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>, // Garante que R$ seja sempre fixo
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

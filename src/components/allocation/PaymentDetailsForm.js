import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, InputAdornment, Typography, Box, Card, CardContent, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import PaymentSummary from './PaymentSummary';
import { formatCPF, unformatCPF } from '../../utils/utils';

// Função para formatar o valor como moeda
const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0);
};

const unformatCurrency = (value) => {
  return value.replace(/[^\d,.-]/g, '').replace(',', '.');
};

const PaymentDetailsForm = ({ detalhesPagamento, handlePaymentDetailChange, errors, validatePaymentField }) => {
  const [pagadorEstrangeiro, setPagadorEstrangeiro] = useState(false);

  // Inicializa o estado com base nos dados existentes
  useEffect(() => {
    if (detalhesPagamento.passaportePagador) {
      setPagadorEstrangeiro(true); // Se houver passaporte, é estrangeiro
    } else {
      setPagadorEstrangeiro(false); // Se não houver, assume que é brasileiro
    }
  }, [detalhesPagamento]);

  const handleNumberInput = (e) => {
    const char = String.fromCharCode(e.which);
    const isAllowed = /^\d|\.|-$/;
    if (!isAllowed.test(char)) {
      e.preventDefault();
    }
  };

  const handlePagadorChange = (e) => {
    const isEstrangeiro = e.target.value === 'estrangeiro';
    setPagadorEstrangeiro(isEstrangeiro);
    if (isEstrangeiro) {
      // Limpa CPF e RG quando o pagador é estrangeiro
      handlePaymentDetailChange('cpfPagador', '');
      handlePaymentDetailChange('rgPagador', '');
    } else {
      // Limpa Passaporte quando o pagador é brasileiro
      handlePaymentDetailChange('passaportePagador', '');
    }
  };

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Informações de Pagamento
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Tipo de Pagador</FormLabel>
        <RadioGroup row value={pagadorEstrangeiro ? 'estrangeiro' : 'brasileiro'} onChange={handlePagadorChange}>
          <FormControlLabel value="brasileiro" control={<Radio />} label="Pagador Brasileiro" />
          <FormControlLabel value="estrangeiro" control={<Radio />} label="Pagador Estrangeiro" />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Nome Completo do Pagador"
            name="nomePagador"
            value={detalhesPagamento.nomePagador}
            onChange={(e) => handlePaymentDetailChange('nomePagador', e.target.value)}
            onBlur={(e) => validatePaymentField('nomePagador', e.target.value)}
            error={!!errors['nomePagador']}
            helperText={errors['nomePagador']}
            fullWidth
            required
            inputProps={{ maxLength: 255 }}
            sx={{ backgroundColor: 'white' }}
          />
        </Grid>

        {/* Exibe CPF e RG ou Passaporte com base na escolha do pagador */}
        {!pagadorEstrangeiro ? (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                label="CPF do Pagador"
                name="cpfPagador"
                value={formatCPF(detalhesPagamento.cpfPagador || '')}
                onChange={(e) => handlePaymentDetailChange('cpfPagador', unformatCPF(e.target.value))}
                onBlur={(e) => validatePaymentField('cpfPagador', e.target.value)}
                error={!!errors['cpfPagador']}
                helperText={errors['cpfPagador']}
                fullWidth
                required
                inputProps={{ maxLength: 14 }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="RG do Pagador"
                name="rgPagador"
                value={detalhesPagamento.rgPagador || ''}
                onChange={(e) => handlePaymentDetailChange('rgPagador', e.target.value)}
                onBlur={(e) => validatePaymentField('rgPagador', e.target.value)}
                error={!!errors['rgPagador']}
                helperText={errors['rgPagador']}
                fullWidth
                required
                inputProps={{ maxLength: 20 }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} md={6}>
            <TextField
              label="Passaporte do Pagador"
              name="passaportePagador"
              value={detalhesPagamento.passaportePagador || ''}
              onChange={(e) => handlePaymentDetailChange('passaportePagador', e.target.value)}
              onBlur={(e) => validatePaymentField('passaportePagador', e.target.value)}
              error={!!errors['passaportePagador']}
              helperText={errors['passaportePagador']}
              fullWidth
              required
              inputProps={{ maxLength: 20 }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <TextField
            label="Valor Total do Pedido"
            name="valorTotal"
            type="text"
            value={formatCurrency(detalhesPagamento.valorTotal)} // Formatação em tempo real
            onChange={(e) => handlePaymentDetailChange('valorTotal', unformatCurrency(e.target.value))}
            onBlur={(e) => validatePaymentField('valorTotal', e.target.value)}
            error={!!errors['valorTotal']}
            helperText={errors['valorTotal']}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"></InputAdornment>,
              inputProps: { min: 0 },
            }}
            sx={{ backgroundColor: 'white' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Método de Pagamento"
            name="metodoPagamento"
            value={detalhesPagamento.metodoPagamento}
            onChange={(e) => handlePaymentDetailChange('metodoPagamento', e.target.value)}
            onBlur={(e) => validatePaymentField('metodoPagamento', e.target.value)}
            error={!!errors['metodoPagamento']}
            helperText={errors['metodoPagamento']}
            fullWidth
            required
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            <MenuItem value="Pix">Pix</MenuItem>
            <MenuItem value="Cartão">Cartão</MenuItem>
            <MenuItem value="Boleto">Boleto</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Informações Adicionais da Reserva"
            name="informacoesAdicionais"
            value={detalhesPagamento.informacoesAdicionais}
            onChange={(e) => handlePaymentDetailChange('informacoesAdicionais', e.target.value)}
            onBlur={(e) => validatePaymentField('informacoesAdicionais', e.target.value)}
            error={!!errors['informacoesAdicionais']}
            helperText={errors['informacoesAdicionais']}
            fullWidth
            multiline
            maxRows={4}
            inputProps={{ maxLength: 255 }}
            sx={{ backgroundColor: 'white' }}
          />
        </Grid>
      </Grid>

      <PaymentSummary
        valorPago={detalhesPagamento.valorPago}
        valorRestante={detalhesPagamento.valorRestante}
      />
    </Box>
  );
};

export default PaymentDetailsForm;

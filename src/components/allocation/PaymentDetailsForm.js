import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, InputAdornment, Typography, Box, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import PaymentSummary from './PaymentSummary';
import { formatCPF, unformatCPF } from '../../utils/utils';

// Função para formatar o valor como moeda sem o símbolo R$
const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
  }).format(parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0);
};

const unformatCurrency = (value) => {
  return value.replace(/[^\d,.-]/g, '').replace(',', '.');
};

const PaymentDetailsForm = ({ detalhesPagamento, handlePaymentDetailChange, errors, validatePaymentField }) => {
  const [pagadorEstrangeiro, setPagadorEstrangeiro] = useState(false);
  const [valorTotalTemp, setValorTotalTemp] = useState(detalhesPagamento.valorTotal || ''); // Mantém o valor temporário sem formatação durante a digitação

  // Inicializa o estado com base nos dados existentes
  useEffect(() => {
    if (detalhesPagamento.passaportePagador) {
      setPagadorEstrangeiro(true);
    } else {
      setPagadorEstrangeiro(false);
    }
  }, [detalhesPagamento]);

  const handleBlurValorTotal = () => {
    const formattedValue = formatCurrency(valorTotalTemp);
    handlePaymentDetailChange('valorTotal', unformatCurrency(valorTotalTemp)); // Envia o valor não formatado
    setValorTotalTemp(formattedValue); // Atualiza o valor no campo com a formatação
  };

  // Controla o valor durante a digitação sem formatá-lo, para evitar atritos com a digitação
  const handleChangeValorTotal = (e) => {
    const unformattedValue = e.target.value.replace(/[^\d,]/g, ''); // Permite apenas números e vírgula
    setValorTotalTemp(unformattedValue); // Atualiza o valor temporário sem formatação
  };

  const handlePagadorChange = (e) => {
    const isEstrangeiro = e.target.value === 'estrangeiro';
    setPagadorEstrangeiro(isEstrangeiro);
    if (isEstrangeiro) {
      handlePaymentDetailChange('cpfPagador', '');
      handlePaymentDetailChange('rgPagador', '');
    } else {
      handlePaymentDetailChange('passaportePagador', '');
    }
  };

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Informações de Pagamento do Pedido
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
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
            value={valorTotalTemp} // Exibe o valor sem formatação temporária
            onChange={handleChangeValorTotal} // Atualiza o valor enquanto o usuário digita
            onBlur={handleBlurValorTotal} // Formata o valor ao perder o foco
            error={!!errors['valorTotal']}
            helperText={errors['valorTotal']}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>, // Garante que R$ seja sempre fixo
              inputProps: { min: 0 },
            }}
            sx={{ backgroundColor: 'white' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Método de Pagamento do Pedido"
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
            label="Informações Adicionais do Pedido"
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

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

// Função para formatar o valor como moeda
const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0);
};

const PaymentSummary = ({ valorPago, valorRestante }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Card variant="outlined" sx={{ flex: 1, mr: 1, p: 2 }}>
        <CardContent sx={{ paddingBottom: '8px !important' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Valor Pago:</Typography>
          <Typography variant="h6" color="success.main">{formatCurrency(valorPago)}</Typography>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ flex: 1, ml: 1, p: 2 }}>
        <CardContent sx={{ paddingBottom: '8px !important' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Valor Restante a Ser Pago:</Typography>
          <Typography variant="h6" color="error.main">{formatCurrency(valorRestante)}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSummary;

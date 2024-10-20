import React from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';

const CostSummary = ({ totalCosts, totalReceivings }) => {
  const balance = totalReceivings - totalCosts;

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '8px', display: 'flex', justifyContent: 'space-around', gap: 2, flexWrap: 'wrap' }}>
      {/* Custos Totais */}
      <Tooltip title="Soma total dos custos da viagem" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDown sx={{ fontSize: 24, color: '#e53935' }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Custos Totais
            </Typography>
            <Typography variant="body1" color="error">
              R$ {totalCosts.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      {/* Recebimentos Totais */}
      <Tooltip title="Soma total dos recebimentos da viagem" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ fontSize: 24, color: '#43a047' }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Recebimentos Totais
            </Typography>
            <Typography variant="body1" color="success">
              R$ {totalReceivings.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      {/* Saldo Total */}
      <Tooltip title="Saldo total (Recebimentos - Custos)" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet sx={{ fontSize: 24, color: '#1e88e5' }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Saldo Total
            </Typography>
            <Typography variant="body1" color={balance >= 0 ? 'success' : 'error'}>
              R$ {balance.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
    </Paper>
  );
};

export default CostSummary;

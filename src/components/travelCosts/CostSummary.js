import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';

const CostSummary = ({ totalCosts, totalReceivings }) => {
  const balance = totalReceivings - totalCosts;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Tooltip title="Soma total dos custos da viagem" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDown color="error" />
          <Typography variant="body1" color="error">
            R$ {totalCosts.toFixed(2)}
          </Typography>
        </Box>
      </Tooltip>

      <Tooltip title="Soma total dos recebimentos da viagem" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="success" />
          <Typography variant="body1" color="success">
            R$ {totalReceivings.toFixed(2)}
          </Typography>
        </Box>
      </Tooltip>

      <Tooltip title="Saldo total (Recebimentos - Custos)" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet color="primary" />
          <Typography variant="body1" color={balance >= 0 ? 'success' : 'error'}>
            R$ {balance.toFixed(2)}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default CostSummary;

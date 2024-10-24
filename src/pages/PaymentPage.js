import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Fade } from '@mui/material';
import Layout from '../components/common/Layout';
import OrderReservationList from '../components/payments/OrderReservationList';
import Receivables from '../components/payments/Receivables';
import ReceivablesHelp from '../components/helps/ReceivablesHelp';

const PaymentPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gestão de Reservas e Pagamentos
          <ReceivablesHelp />
        </Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="A receber" />
          <Tab label="Lista de Reservas e Pedidos" />
        </Tabs>
        <Box>
          <Fade in={tabIndex === 0} timeout={500}>
            <div style={{ display: tabIndex === 0 ? 'block' : 'none' }}>
              <Receivables />
            </div>
          </Fade>
          <Fade in={tabIndex === 1} timeout={500}>
            <div style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
              <OrderReservationList />
            </div>
          </Fade>
        </Box>
      </Box>
    </Layout>
  );
};

export default PaymentPage;

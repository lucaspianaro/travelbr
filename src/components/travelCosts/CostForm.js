import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, InputAdornment, Paper, Typography } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

const CostForm = ({ newCost, setNewCost, handleAddCost, transactionTypes, paymentMethods }) => {
  // Função para formatar a data atual no formato yyyy-MM-dd
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // useEffect para preencher a data com a data atual ao montar o componente
  useEffect(() => {
    if (!newCost.date) {
      setNewCost((prevCost) => ({
        ...prevCost,
        date: getCurrentDate(),
      }));
    }
  }, [newCost, setNewCost]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Adicionar Novo Custo/Recebimento</Typography>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          
          {/* Campo de descrição */}
          <TextField
            label="Descrição"
            value={newCost.description}
            onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
            sx={{ flex: 1, minWidth: '200px' }}
          />

          {/* Campo de valor */}
          <TextField
            label="Valor"
            type="number"
            value={newCost.amount}
            onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            sx={{ flex: 1, minWidth: '200px' }}
          />

          {/* Campo de data com valor inicial da data atual */}
          <TextField
            label="Data"
            type="date"
            value={newCost.date || getCurrentDate()}  
            onChange={(e) => setNewCost({ ...newCost, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: '200px' }}
          />

          {/* Campo de tipo */}
          <TextField
            label="Tipo"
            select
            value={newCost.type}
            onChange={(e) => setNewCost({ ...newCost, type: e.target.value })}
            sx={{ flex: 1, minWidth: '200px' }}
          >
            {transactionTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Campo de método de pagamento */}
          <TextField
            label="Método de Pagamento"
            select
            value={newCost.paymentMethod}
            onChange={(e) => setNewCost({ ...newCost, paymentMethod: e.target.value })}
            sx={{ flex: 1, minWidth: '200px' }}
          >
            {paymentMethods.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Botão para adicionar o custo/recebimento */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleAddCost}
            sx={{ minWidth: '150px', borderRadius: '50px' }}
          >
            Adicionar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CostForm;

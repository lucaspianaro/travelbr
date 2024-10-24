import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const SeatLayoutBuilder = ({ onSaveLayout, initialLayout }) => {
  const [selectedType, setSelectedType] = useState('seat'); // Tipo de célula atual (assento, banheiro, corredor, etc.)
  const [seatLayout, setSeatLayout] = useState(initializeLayout(10, 4)); // Inicializa layout com 10x4 ou usa layout inicial

  // Efeito para carregar o layout inicial ao editar
  useEffect(() => {
    if (initialLayout) {
      setSeatLayout(initialLayout);
    }
  }, [initialLayout]);

  // Função para inicializar a matriz do layout
  function initializeLayout(rows, cols) {
    const layout = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push({ type: 'empty', number: null });
      }
      layout.push(row);
    }
    return layout;
  }

  // Atualiza o layout com base no tipo de célula selecionada
  const handleCellClick = (rowIndex, colIndex) => {
    const updatedLayout = [...seatLayout];
    const currentCell = updatedLayout[rowIndex][colIndex];

    if (selectedType === 'seat') {
      currentCell.type = 'seat';
      currentCell.number = `${rowIndex + 1}${String.fromCharCode(65 + colIndex)}`; // Gera número para assento
    } else {
      currentCell.type = selectedType;
      currentCell.number = null;
    }

    setSeatLayout(updatedLayout);
  };

  // Renderiza o layout de assentos
  const renderLayout = () => {
    return seatLayout.map((row, rowIndex) => (
      <Grid container key={rowIndex} justifyContent="center" sx={{ marginBottom: '8px' }}>
        {row.map((cell, colIndex) => (
          <Grid item key={colIndex} sx={{ margin: '4px' }}>
            <Button
              variant="outlined"
              onClick={() => handleCellClick(rowIndex, colIndex)}
              sx={{
                minWidth: '60px',
                minHeight: '60px',
                backgroundColor: getColorByType(cell.type),
                color: cell.type === 'seat' ? 'white' : 'black',
              }}
            >
              {cell.type === 'seat' ? cell.number : cell.type.toUpperCase()}
            </Button>
          </Grid>
        ))}
      </Grid>
    ));
  };

  // Retorna cor de acordo com o tipo de célula
  const getColorByType = (type) => {
    switch (type) {
      case 'seat':
        return 'blue';
      case 'bathroom':
        return 'gray';
      case 'aisle':
        return 'white';
      case 'empty':
      default:
        return 'lightgray';
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Criar Layout de Assentos
      </Typography>

      <FormControl sx={{ minWidth: 120, marginBottom: 2 }}>
        <InputLabel>Tipo de Célula do Layout</InputLabel>
        <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <MenuItem value="seat">Assento</MenuItem>
          <MenuItem value="bathroom">Banheiro</MenuItem>
          <MenuItem value="aisle">Corredor</MenuItem>
          <MenuItem value="empty">Vazio</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ marginTop: 4 }}>
        {renderLayout()}
      </Box>

      <Box sx={{ marginTop: 4 }}>
        <Button variant="contained" color="primary" onClick={() => onSaveLayout({ layout: seatLayout })}>
          Salvar Layout
        </Button>
      </Box>
    </Box>
  );
};

export default SeatLayoutBuilder;

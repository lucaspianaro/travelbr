import React from 'react';
import { Box, Button, Grid, Typography, Tooltip } from '@mui/material';
import { AirlineSeatReclineNormal, Wc, Stairs, Kitchen } from '@mui/icons-material';

const VehicleLayoutView = ({ layout }) => {
  if (!layout || (!layout.firstFloor && !layout.secondFloor)) {
    return (
      <Typography variant="body2" sx={{ mt: 2 }}>
        Nenhum layout disponível.
      </Typography>
    );
  }

  // Função para calcular as dimensões reais do layout existente
  const getDimensionsFromLayout = (flatLayout) => {
    const rows = Math.max(...flatLayout.map((cell) => cell.row)) + 1;
    const cols = Math.max(...flatLayout.map((cell) => cell.col)) + 1;
    return { rows, cols };
  };

  // Função para desdobrar o layout de um formato achatado
  const unflattenLayout = (flatLayout, rows, cols) => {
    const layout = Array.from({ length: rows }, () => Array(cols).fill({ type: 'empty', number: null }));
    flatLayout.forEach((cell) => {
      layout[cell.row][cell.col] = {
        type: cell.type || 'empty',
        number: cell.number ?? null,
      };
    });
    return layout;
  };

  // Função para renderizar as células de layout
  const renderSeats = (floorLayout) => {
    return floorLayout.map((row, rowIndex) => (
      <Grid container key={rowIndex} justifyContent="center" sx={{ marginBottom: '8px' }}>
        {row.map((cell, colIndex) => (
          <React.Fragment key={colIndex}>
            {colIndex === 2 && <Grid item key={`aisle-${rowIndex}`} sx={{ width: '40px' }} />} {/* Espaço do corredor */}
            <Grid item sx={{ margin: '4px' }}>
              {cell.type !== 'empty' ? (
                <Tooltip title={getTooltipTitle(cell)} arrow>
                  <span>
                    <Button
                      variant="outlined"
                      disabled
                      sx={{
                        minWidth: '60px',
                        minHeight: '60px',
                        color: 'black',
                      }}
                    >
                      {renderCellContent(cell)}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Box sx={{ minWidth: '60px', minHeight: '60px', margin: '4px' }} /> // Mantém o espaço vazio
              )}
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    ));
  };

  // Função para obter o conteúdo do tooltip com base no tipo da célula
  const getTooltipTitle = (cell) => {
    switch (cell.type) {
      case 'seat':
        return cell.number ? `Assento ${cell.number}` : 'Assento';
      case 'bathroom':
        return 'Banheiro';
      case 'stair':
        return 'Escada';
      case 'fridge':
        return 'Frigobar';
      default:
        return '';
    }
  };

  // Função para renderizar o conteúdo da célula
  const renderCellContent = (cell) => {
    switch (cell.type) {
      case 'seat':
        return cell.number ? `${cell.number}` : <AirlineSeatReclineNormal />;
      case 'bathroom':
        return <Wc />;
      case 'stair':
        return <Stairs />;
      case 'fridge':
        return <Kitchen />;
      default:
        return null;
    }
  };

  // Calcular as dimensões do primeiro e segundo andar
  const firstFloorDims = layout.firstFloor ? getDimensionsFromLayout(layout.firstFloor) : null;
  const secondFloorDims = layout.secondFloor ? getDimensionsFromLayout(layout.secondFloor) : null;

  // Desdobrar o layout de ambos os andares
  const firstFloorLayout = layout.firstFloor ? unflattenLayout(layout.firstFloor, firstFloorDims.rows, firstFloorDims.cols) : null;
  const secondFloorLayout = layout.secondFloor ? unflattenLayout(layout.secondFloor, secondFloorDims.rows, secondFloorDims.cols) : null;

  return (
    <Box sx={{ padding: 2 }}>
      {firstFloorLayout && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1° Andar
          </Typography>
          <Box sx={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {renderSeats(firstFloorLayout)}
          </Box>
        </Box>
      )}
      {secondFloorLayout && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            2° Andar
          </Typography>
          <Box sx={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {renderSeats(secondFloorLayout)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VehicleLayoutView;

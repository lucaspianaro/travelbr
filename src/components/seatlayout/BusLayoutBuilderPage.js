import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, Tabs, Tab, Tooltip } from '@mui/material';
import { Add, Remove, AirlineSeatReclineNormal, Wc, Stairs, Block, Info, Kitchen } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../common/Layout';
import BusLayoutBuilderPageHelp from './BusLayoutBuilderPageHelp';
import { addLayout, updateLayout, getLayoutById } from '../../services/LayoutService';

const BusLayoutBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seatLayouts, setSeatLayouts] = useState([{ layout: initializeLayout(10, 4), floor: 1 }]);
  const [activeFloor, setActiveFloor] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellType, setCellType] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [seatNumberError, setSeatNumberError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  useEffect(() => {
    if (id) {
      fetchLayout(id);
    }
  }, [id]);

  const fetchLayout = async (layoutId) => {
    try {
      const fetchedLayout = await getLayoutById(layoutId);
      setLayoutName(fetchedLayout.name || '');  // Carregar o nome do layout
      const firstFloorDims = getDimensionsFromLayout(fetchedLayout.firstFloor);
      const secondFloorDims = fetchedLayout.secondFloor ? getDimensionsFromLayout(fetchedLayout.secondFloor) : null;

      const firstFloorLayout = unflattenLayout(fetchedLayout.firstFloor, firstFloorDims.rows, firstFloorDims.cols);
      const secondFloorLayout = fetchedLayout.secondFloor
        ? unflattenLayout(fetchedLayout.secondFloor, secondFloorDims.rows, secondFloorDims.cols)
        : null;

      setSeatLayouts([
        { layout: firstFloorLayout, floor: 1 },
        ...(secondFloorLayout ? [{ layout: secondFloorLayout, floor: 2 }] : [])
      ]);
    } catch (err) {
      setSnackbarMessage('Erro ao carregar layout.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Função para calcular as dimensões reais do layout existente
  const getDimensionsFromLayout = (flatLayout) => {
    const rows = Math.max(...flatLayout.map((cell) => cell.row)) + 1; // Número máximo de linhas
    const cols = Math.max(...flatLayout.map((cell) => cell.col)) + 1; // Número máximo de colunas
    return { rows, cols };
  };

  const flattenLayout = (layout) => {
    const flatLayout = [];
    layout.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        flatLayout.push({
          row: rowIndex,
          col: colIndex,
          type: cell.type || 'empty',
          number: cell.number ?? null,
        });
      });
    });
    return flatLayout;
  };

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

  const validateSeatNumber = (number) => {
    const flatLayout = flattenLayout(seatLayouts[0].layout).concat(seatLayouts[1]?.layout || []);
    const seatNumbers = flatLayout
      .filter((cell) => cell.type === 'seat' && cell.number !== null)
      .map((cell) => cell.number);

    if (seatNumbers.includes(number)) {
      setSeatNumberError('Este número de assento já existe.');
      return false;
    } else {
      setSeatNumberError('');
      return true;
    }
  };

  const handleSeatNumberChange = (e) => {
    const value = e.target.value;
    setSeatNumber(value);
    validateSeatNumber(value);
  };

  const validateLayout = (flatLayout) => {
    const hasSeat = flatLayout.some((cell) => cell.type === 'seat');
    if (!hasSeat) {
      setSnackbarMessage('O layout deve ter pelo menos um assento.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }

    const seatNumbers = flatLayout
      .filter((cell) => cell.type === 'seat' && cell.number !== null)
      .map((cell) => cell.number);

    const uniqueNumbers = new Set(seatNumbers);
    if (seatNumbers.length !== uniqueNumbers.size) {
      setSnackbarMessage('Os números dos assentos devem ser únicos.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleSaveLayout = async () => {
    try {
      const firstFloorFlat = flattenLayout(seatLayouts[0].layout);
      const secondFloorFlat = seatLayouts.length > 1 ? flattenLayout(seatLayouts[1].layout) : null;
  
      // Validação do layout antes de salvar
      if (!validateLayout(firstFloorFlat)) return;
  
      // Calcular a quantidade de assentos no primeiro e segundo andar
      const assentosAndar1 = firstFloorFlat.filter(cell => cell.type === 'seat').length;
      const assentosAndar2 = secondFloorFlat ? secondFloorFlat.filter(cell => cell.type === 'seat').length : 0;
      const assentosTotais = assentosAndar1 + assentosAndar2;
  
      // Verificar se o layout tem dois andares
      const doisAndares = seatLayouts.length > 1;
  
      const layoutData = {
        name: layoutName,
        firstFloor: firstFloorFlat,
        secondFloor: secondFloorFlat,
        assentosAndar1,   // Adiciona a quantidade de assentos do 1º andar
        assentosAndar2,   // Adiciona a quantidade de assentos do 2º andar
        assentosTotais,   // Adiciona a quantidade total de assentos
        doisAndares,      // Adiciona se tem dois andares
      };
  
      if (id) {
        await updateLayout(id, layoutData);
        setSnackbarMessage('Layout atualizado com sucesso!');
      } else {
        await addLayout(layoutData);
        setSnackbarMessage('Novo layout criado com sucesso!');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      navigate('/veiculos/layout');
    } catch (err) {
      console.error('Erro ao salvar layout:', err);
      setSnackbarMessage('Erro ao salvar layout.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };  

  const handleTabChange = (event, newValue) => {
    setActiveFloor(newValue);
  };

  const addSecondFloor = () => {
    if (seatLayouts.length === 1) {
      setSeatLayouts([...seatLayouts, { layout: initializeLayout(10, 4), floor: 2 }]);
    }
  };

  const removeSecondFloor = () => {
    if (seatLayouts.length > 1) {
      setSeatLayouts(seatLayouts.slice(0, 1));
      setActiveFloor(0);
    }
  };

  const handleCellClick = (rowIndex, colIndex) => {
    setSelectedCell({ rowIndex, colIndex });
    const cell = seatLayouts[activeFloor].layout[rowIndex][colIndex];
    setCellType(cell.type);
    setSeatNumber(cell.number || '');
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (cellType === 'seat' && (!seatNumber || seatNumber.trim() === '')) {
      setSnackbarMessage('O número do assento é obrigatório.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (cellType === 'seat' && !validateSeatNumber(seatNumber)) {
      setSnackbarMessage('Este número de assento já existe.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updatedLayout = [...seatLayouts];
    const { rowIndex, colIndex } = selectedCell;

    updatedLayout[activeFloor].layout[rowIndex][colIndex] = {
      type: cellType,
      number: cellType === 'seat' ? seatNumber : null, // Removido padStart aqui
    };

    setSeatLayouts(updatedLayout);
    setDialogOpen(false);
  };

  const addRow = () => {
    const updatedLayouts = [...seatLayouts];
    const newRow = Array(seatLayouts[0].layout[0].length).fill({ type: 'empty', number: null });
    updatedLayouts[activeFloor].layout.push(newRow);
    setSeatLayouts(updatedLayouts);
  };

  const removeRow = () => {
    if (seatLayouts[activeFloor].layout.length > 1) {
      const updatedLayouts = [...seatLayouts];
      updatedLayouts[activeFloor].layout.pop();
      setSeatLayouts(updatedLayouts);
    } else {
      setSnackbarMessage('Não é possível remover todas as fileiras.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  const renderSeats = (layout) => {
    return layout.map((row, rowIndex) => (
      <Grid container key={rowIndex} justifyContent="center" sx={{ marginBottom: '8px' }}>
        {row.map((cell, colIndex) => (
          <React.Fragment key={colIndex}>
            {colIndex === 2 && (
              <Grid item key={`aisle-${rowIndex}`} sx={{ width: '40px' }} />
            )}
            <Grid item sx={{ margin: '4px' }}>
              <Button
                variant="outlined"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                sx={{
                  minWidth: '60px',
                  minHeight: '60px',
                }}
              >
                {renderCellContent(cell)}
              </Button>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    ));
  };

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
      case 'empty':
      default:
        return <Block />;
    }
  };
  return (
    <Layout>
      <Box sx={{ padding: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {id ? `Editar Layout: ${layoutName}` : 'Criar Novo Layout de Veículo'}
            <BusLayoutBuilderPageHelp />
          </Typography>
          <Tooltip title="Legenda">
            <IconButton onClick={() => setInfoDialogOpen(true)} color="info">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Abas para alternar entre os andares */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nome do Layout"
            value={layoutName}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                setLayoutName(e.target.value); // Limita a 30 caracteres
              }
            }}
            helperText={`${layoutName.length}/30 caracteres`}
            sx={{ marginBottom: 2 }}
            inputProps={{ maxLength: 30 }} // Garante que não ultrapassa 30 caracteres
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Tabs value={activeFloor} onChange={handleTabChange} aria-label="abas de layout">
            <Tab label="1º Andar" />
            {seatLayouts.length > 1 && <Tab label="2º Andar" />}
          </Tabs>
          <Tooltip title="Adicionar segundo andar">
            <IconButton onClick={addSecondFloor} color="primary" disabled={seatLayouts.length > 1}>
              <Add />
            </IconButton>
          </Tooltip>
          {seatLayouts.length > 1 && (
            <Tooltip title="Remover segundo andar">
              <IconButton onClick={removeSecondFloor} color="secondary">
                <Remove />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Renderização do layout de assentos do andar selecionado */}
        <Box sx={{ display: 'flex', position: 'relative' }}>
          {/* Renderização do layout de assentos */}
          <Box sx={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: 4, flexGrow: 1 }}>
            {renderSeats(seatLayouts[activeFloor].layout)}
          </Box>
        </Box>

        {/* Botões para adicionar/remover fileira */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, marginBottom: 2 }}>
          <IconButton
            color="primary"
            onClick={addRow}
            sx={{
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              padding: '8px',
            }}
          >
            <Add />
          </IconButton>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            Adicionar Fileira
          </Typography>

          <IconButton
            color="secondary"
            onClick={removeRow}
            sx={{
              border: '2px solid',
              borderColor: 'secondary.main',
              borderRadius: '8px',
              padding: '8px',
            }}
          >
            <Remove />
          </IconButton>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            Remover Fileira
          </Typography>
        </Box>

        {/* Botões de ação */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Button color="cancelar" variant="contained" sx={{ borderRadius: '50px' }} onClick={() => navigate('/veiculos/layout')}>
            Voltar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveLayout} sx={{ borderRadius: '50px' }}>
            {id ? 'Atualizar Layout' : 'Salvar Layout'}
          </Button>
        </Box>
      </Box>

      {/* Diálogo para editar célula */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Célula do Layout</DialogTitle>
        <DialogContent dividers sx={{ padding: '24px' }}>
          <FormControl fullWidth sx={{ marginBottom: 3 }}>
            <InputLabel>Tipo de Célula</InputLabel>
            <Select value={cellType} onChange={(e) => setCellType(e.target.value)} label="Tipo de Célula">
              <MenuItem value="seat">Assento</MenuItem>
              <MenuItem value="bathroom">Banheiro</MenuItem>
              <MenuItem value="stair">Escada</MenuItem>
              <MenuItem value="fridge">Frigobar</MenuItem>
              <MenuItem value="empty">Vazio</MenuItem>
            </Select>
          </FormControl>

          {cellType === 'seat' && (
            <TextField
              fullWidth
              label="Número do Assento"
              value={seatNumber}
              onChange={(e) => {
                // Filtra a entrada para permitir apenas números
                const value = e.target.value.replace(/[^0-9]/g, '');

                // Remove o zero à esquerda, se houver
                const formattedValue = value.replace(/^0+/, '');

                setSeatNumber(formattedValue);
              }}
              onKeyPress={(e) => {
                // Permite apenas a entrada de números
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              sx={{ marginBottom: 3 }}
              inputProps={{ maxLength: 3 }} // Limita a entrada para até 3 caracteres
            />

          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="cancelled" sx={{ borderRadius: '50px' }}>
            Voltar
          </Button>
          <Button onClick={handleDialogSave} color="primary" sx={{ borderRadius: '50px' }} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens de sucesso/erro */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo para exibir a legenda */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Legenda</DialogTitle>
        <DialogContent dividers sx={{ padding: '24px' }}>
          <Typography variant="body1" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AirlineSeatReclineNormal sx={{ width: 24, height: 24 }} />
              <Typography>Assento</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Wc sx={{ width: 24, height: 24 }} />
              <Typography>Banheiro</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Stairs sx={{ width: 24, height: 24 }} />
              <Typography>Escada</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Kitchen sx={{ width: 24, height: 24 }} />
              <Typography>Frigobar</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Block sx={{ width: 24, height: 24 }} />
              <Typography>Espaço Vazio</Typography>
            </Box>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)} color="primary" variant="contained" sx={{ borderRadius: '50px', }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default BusLayoutBuilderPage;

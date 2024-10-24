import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid, Snackbar, Alert, IconButton, InputAdornment, Tooltip } from '@mui/material';
import debounce from 'lodash.debounce';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import VehicleFormHelp from '../helps/VehicleFormHelp';
import { checkVehiclePlateUnique } from '../../services/VehicleService';
import { getAllLayouts } from '../../services/LayoutService';
import { useNavigate } from 'react-router-dom';

const VehicleForm = ({ onSave, onCancel, initialVehicle }) => {
  const [vehicle, setVehicle] = useState({
    identificadorVeiculo: '',
    placa: '',
    empresa: '',
    layoutId: '',  // Campo layoutId para associar o layout
  });

  const [layouts, setLayouts] = useState([]); // Estado para armazenar os layouts disponíveis
  const [filteredLayouts, setFilteredLayouts] = useState([]); // Para layouts filtrados
  const [errors, setErrors] = useState({});
  const [isUnique, setIsUnique] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Usado para navegação entre telas

  useEffect(() => {
    if (initialVehicle) {
      setVehicle(initialVehicle);
    }
    fetchLayouts();  // Buscar os layouts existentes ao carregar o formulário
  }, [initialVehicle]);

  // Função para buscar os layouts existentes
  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const fetchedLayouts = await getAllLayouts();
      setLayouts(fetchedLayouts);
      setFilteredLayouts(fetchedLayouts); // Inicialmente, os layouts exibidos são todos
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar layouts:", err);
      setLoading(false);
    }
  };

  const handleLayoutSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = layouts.filter(
      (layout) =>
        layout.name.toLowerCase().includes(searchTerm) ||
        layout.id.toLowerCase().includes(searchTerm) // Corrigido para converter ID em string
    );
    setFilteredLayouts(filtered);
  };

  const handleLayoutChange = (event, value) => {
    setVehicle((prevVehicle) => ({
      ...prevVehicle,
      layoutId: value ? value.id : ''
    }));
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setVehicle((prevVehicle) => ({
      ...prevVehicle,
      [name]: value
    }));

    validateField(name, value);

    if (name === 'placa') {
      const unique = await checkVehiclePlateUnique(value, initialVehicle?.id);
      setIsUnique(unique);
      if (!unique) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          placa: 'Veículo já cadastrado com esta placa'
        }));
      } else {
        setErrors((prevErrors) => {
          const { placa, ...rest } = prevErrors;
          return rest;
        });
      }
    }
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'identificadorVeiculo':
        if (!value.trim() || value.length > 255) {
          error = 'Identificador do veículo é obrigatório e deve ter no máximo 255 caracteres.';
        }
        break;
      case 'placa':
        if (!value.trim() || value.length > 55) {
          error = 'Placa do veículo é obrigatória e deve ter no máximo 55 caracteres.';
        }
        break;
      case 'empresa':
        if (!value.trim() || value.length > 255) {
          error = 'Empresa é obrigatória e deve ter no máximo 255 caracteres.';
        }
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const isFormValid = () => {
    return (
      Object.values(errors).every((error) => !error) &&
      vehicle.identificadorVeiculo.trim() &&
      vehicle.placa.trim() &&
      vehicle.empresa.trim() &&
      isUnique
    ); // O layoutId não é obrigatório
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        await onSave(vehicle);
        onCancel(); // Feche o modal após o salvamento bem-sucedido
      } catch (error) {
        setSnackbarMessage(`Erro ao ${initialVehicle ? 'atualizar' : 'adicionar'} veículo: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const redirectToLayoutCreation = () => {
    navigate('/veiculos/layout/novo'); // Redireciona para a página de criação de layout
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          {initialVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
          <VehicleFormHelp />
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          * Campos Obrigatórios
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Identificador do Veículo"
            name="identificadorVeiculo"
            value={vehicle.identificadorVeiculo}
            onChange={handleInputChange}
            error={!!errors.identificadorVeiculo}
            helperText={errors.identificadorVeiculo}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Placa do Veículo"
            name="placa"
            value={vehicle.placa}
            onChange={handleInputChange}
            error={!!errors.placa}
            helperText={errors.placa}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Empresa do Veículo"
            name="empresa"
            value={vehicle.empresa}
            onChange={handleInputChange}
            error={!!errors.empresa}
            helperText={errors.empresa}
            fullWidth
            required
          />
        </Grid>

        {/* Campo para associar o layout */}
        <Grid item xs={12}>
          <Autocomplete
            id="layout-select"
            options={filteredLayouts}
            getOptionLabel={(option) => `${option.name} (ID: ${option.id}) - ${option.assentosTotais} assentos`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Associar Layout ao Veículo (Opcional)"
                placeholder="Busque por nome ou ID do Layout"
                onChange={handleLayoutSearch} // Busca layouts por nome ou ID
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      {params.InputProps.endAdornment}
                      <Tooltip title="Criar Novo Layout">
                        <IconButton onClick={redirectToLayoutCreation}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            value={layouts.find((layout) => layout.id === vehicle.layoutId) || null}
            onChange={handleLayoutChange}
            noOptionsText="Nenhuma opção encontrada."
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button onClick={onCancel} color="cancelar" variant="contained" sx={{ borderRadius: '50px' }}>
            {initialVehicle ? 'Descartar Alterações' : 'Voltar'}
          </Button>
          <Button variant="contained" color="primary" type="submit" disabled={!isFormValid()} sx={{ borderRadius: '50px' }}>
            {initialVehicle ? 'Salvar Alterações' : 'Adicionar Veículo'}
          </Button>
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehicleForm;

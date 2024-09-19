import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid, FormControlLabel, Checkbox, Snackbar, Alert } from '@mui/material';
import { checkVehiclePlateUnique } from '../../services/VehicleService';

const VehicleForm = ({ onSave, onCancel, initialVehicle }) => {
  const [vehicle, setVehicle] = useState({
    identificadorVeiculo: '',
    placa: '',
    empresa: '',
    assentosAndar1: 40,
    assentosAndar2: 0,
    doisAndares: false
  });

  const [errors, setErrors] = useState({});
  const [isUnique, setIsUnique] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (initialVehicle) {
      setVehicle(initialVehicle);
    }
  }, [initialVehicle]);

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setVehicle((prevVehicle) => ({
      ...prevVehicle,
      [name]: newValue
    }));

    validateField(name, newValue);

    if (name === 'placa') {
      const unique = await checkVehiclePlateUnique(newValue, initialVehicle?.id);
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
      case 'assentosAndar1':
      case 'assentosAndar2':
        if (value < 1 || value > 100) {
          error = 'Número de assentos deve ser entre 1 e 100.';
        } else {
          const totalAssentos = name === 'assentosAndar1'
            ? parseInt(value) + parseInt(vehicle.assentosAndar2)
            : parseInt(vehicle.assentosAndar1) + parseInt(value);
          if (totalAssentos > 100) {
            error = 'A soma dos assentos dos dois andares não deve ultrapassar 100.';
          }
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
      vehicle.assentosAndar1 >= 1 &&
      vehicle.assentosAndar1 <= 100 &&
      (!vehicle.doisAndares || (vehicle.assentosAndar2 >= 1 && vehicle.assentosAndar2 <= 100)) &&
      (parseInt(vehicle.assentosAndar1) + parseInt(vehicle.assentosAndar2)) <= 100 &&
      isUnique
    );
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          {initialVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
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
            label="Empresa"
            name="empresa"
            value={vehicle.empresa}
            onChange={handleInputChange}
            error={!!errors.empresa}
            helperText={errors.empresa}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Assentos no 1º Andar"
            name="assentosAndar1"
            type="number"
            value={vehicle.assentosAndar1}
            onChange={handleInputChange}
            error={!!errors.assentosAndar1}
            helperText={errors.assentosAndar1}
            fullWidth
            required
            InputProps={{
              inputProps: {
                min: 1,
                max: 100
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={vehicle.doisAndares}
                onChange={handleInputChange}
                name="doisAndares"
                color="primary"
              />
            }
            label="Veículo com dois andares"
          />
        </Grid>
        {vehicle.doisAndares && (
          <Grid item xs={12}>
            <TextField
              label="Assentos no 2º Andar"
              name="assentosAndar2"
              type="number"
              value={vehicle.assentosAndar2}
              onChange={handleInputChange}
              error={!!errors.assentosAndar2}
              helperText={errors.assentosAndar2}
              fullWidth
              required
              InputProps={{
                inputProps: {
                  min: 1,
                  max: 100
                }
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button onClick={onCancel} color="error">
            {initialVehicle ? 'Descartar Alterações' : 'Descartar'}
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

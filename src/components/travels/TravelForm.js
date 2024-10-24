import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField, Button, Box, Typography, Grid, Snackbar, Alert, Dialog, DialogContent, IconButton, InputAdornment, Tooltip, CircularProgress, Checkbox, FormControlLabel,
} from '@mui/material';
import debounce from 'lodash.debounce';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import LocationSelector from './LocationSelector';
import VehicleForm from '../vehicles/VehicleForm';
import TravelFormHelp from './TravelFormHelp';
import { checkTravelIdentifierUnique, getMaxTravelIdentifier } from '../../services/TravelService';
import { getReservationsByTravelId } from '../../services/OrderService';
import { getAllVehicles, checkVehicleTravelConflict, addVehicle } from '../../services/VehicleService';
import { getAllLayouts } from '../../services/LayoutService';

const generateNextIdentifier = async () => {
  const maxIdentifier = await getMaxTravelIdentifier();
  let nextIdentifier = (maxIdentifier + 1).toString();

  while (!(await checkTravelIdentifierUnique(nextIdentifier))) {
    nextIdentifier = (parseInt(nextIdentifier) + 1).toString();
  }

  return nextIdentifier;
};

const debounceCheckIdentifier = debounce(async (identifier, setErrors) => {
  const isAvailable = await checkTravelIdentifierUnique(identifier);
  setErrors((currentErrors) => ({
    ...currentErrors,
    identificador: isAvailable ? '' : 'Identificador já em uso.',
  }));
}, 500);

function TravelForm({ travel: initialTravel, saveTravel, cancelForm }) {
  const [travel, setTravel] = useState({
    identificador: '',
    origem: '',
    destino: '',
    dataIda: '',
    horarioIda: '',
    dataRetorno: '',
    horarioRetorno: '',
    informacoesAdicionais: '',
    assentosAndar1: '',
    assentosAndar2: '',
    veiculoId: '',
    somenteIda: false,
  });
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seatValidationLoading, setSeatValidationLoading] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      if (!initialTravel) {
        const newIdentifier = await generateNextIdentifier();
        setTravel((prevTravel) => ({
          ...prevTravel,
          identificador: newIdentifier,
        }));
      } else {
        setTravel({
          identificador: initialTravel.identificador || '',
          origem: initialTravel.origem || '',
          destino: initialTravel.destino || '',
          dataIda: initialTravel.dataIda || '',
          horarioIda: initialTravel.horarioIda || '',
          dataRetorno: initialTravel.dataRetorno || '',
          horarioRetorno: initialTravel.horarioRetorno || '',
          informacoesAdicionais: initialTravel.informacoesAdicionais || '',
          assentosAndar1: initialTravel.assentosAndar1
            ? initialTravel.assentosAndar1.toString()
            : '',
          assentosAndar2: initialTravel.assentosAndar2
            ? initialTravel.assentosAndar2.toString()
            : '',
          veiculoId: initialTravel.veiculoId || '',
          somenteIda: initialTravel.somenteIda || false,
        });
        setErrors(validateDatesAndTimes(initialTravel));
      }

      // Buscar veículos e layouts
      const fetchVehiclesAndLayouts = async () => {
        try {
          const fetchedVehicles = await getAllVehicles();
          fetchedVehicles.sort(
            (a, b) => new Date(b.dataAdicionado) - new Date(a.dataAdicionado)
          );
          setVehicles(fetchedVehicles);
          setFilteredVehicles(fetchedVehicles);

          const fetchedLayouts = await getAllLayouts(); // Buscar layouts
          setLayouts(fetchedLayouts); // Armazenar os layouts no estado
        } catch (err) {
          console.error('Erro ao buscar veículos e layouts:', err);
        }
      };

      fetchVehiclesAndLayouts();
    };

    initializeForm();
  }, [initialTravel]);

  const handleInputChange = useCallback(
    async (event) => {
      const { name, value, type, checked } = event.target;
      setTravel((prevTravel) => {
        const updatedTravel = {
          ...prevTravel,
          [name]: type === 'checkbox' ? checked : value,
        };

        if (name === 'veiculoId') {
          const selectedVehicle = vehicles.find(
            (vehicle) => vehicle.id === value
          );
          if (selectedVehicle) {
            updatedTravel.assentosAndar1 = selectedVehicle.assentosAndar1
              ? selectedVehicle.assentosAndar1.toString()
              : '';
            updatedTravel.assentosAndar2 = selectedVehicle.assentosAndar2
              ? selectedVehicle.assentosAndar2.toString()
              : '';
          } else {
            updatedTravel.assentosAndar1 = '';
            updatedTravel.assentosAndar2 = '';
          }

          validateVehicleAvailability(selectedVehicle?.id, updatedTravel);
        }

        if (name === 'somenteIda' && checked) {
          updatedTravel.dataRetorno = '';
          updatedTravel.horarioRetorno = '';
          setErrors((prevErrors) => ({
            ...prevErrors,
            dataRetorno: '',
            horarioRetorno: '',
          }));
        }

        const newErrors = validateField(name, value);
        const dateAndTimeErrors = validateDatesAndTimes(updatedTravel);

        setErrors((prevErrors) => ({
          ...prevErrors,
          ...newErrors,
          ...dateAndTimeErrors,
        }));

        if (
          ['dataIda', 'horarioIda', 'dataRetorno', 'horarioRetorno'].includes(
            name
          )
        ) {
          validateVehicleAvailability(updatedTravel.veiculoId, updatedTravel);
        }

        if (name === 'identificador') {
          debounceCheckIdentifier(value, setErrors);
        }
        return updatedTravel;
      });
    },
    [debounceCheckIdentifier, vehicles]
  );

  const handleVehicleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.identificadorVeiculo.toLowerCase().includes(value) ||
        vehicle.placa.toLowerCase().includes(value) ||
        vehicle.empresa.toLowerCase().includes(value)
    );
    setFilteredVehicles(filtered);
  };

  const handleVehicleChange = async (event, value) => {
    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === value?.id);
    let layout = null;

    if (selectedVehicle?.layoutId) {
      // Buscar o layout associado ao veículo
      layout = layouts.find((layout) => layout.id === selectedVehicle.layoutId);
    }

    setTravel((prevTravel) => ({
      ...prevTravel,
      veiculoId: value?.id || '',
      assentosAndar1: layout ? layout.assentosAndar1.toString() : selectedVehicle?.assentosAndar1.toString(),
      assentosAndar2: layout ? layout.assentosAndar2.toString() : selectedVehicle?.assentosAndar2.toString(),
    }));

    validateVehicleAvailability(value?.id, {
      ...travel,
      veiculoId: value?.id || '',
    });

    if (initialTravel) {
      validateSeatChange(selectedVehicle, initialTravel.id);
    }
  };
  
  const handleLocationChange = (name, value) => {
    setTravel((prevTravel) => {
      const updatedTravel = { ...prevTravel, [name]: value };
      const newErrors = validateField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...newErrors,
      }));
      return updatedTravel;
    });
  };

  const validateVehicleAvailability = async (vehicleId, travel) => {
    if (vehicleId) {
      const isConflict = await checkVehicleTravelConflict(
        vehicleId,
        travel.dataIda,
        travel.horarioIda,
        travel.dataRetorno,
        travel.horarioRetorno,
        travel.somenteIda // Passa somenteIda aqui
      );
      setErrors((prevErrors) => ({
        ...prevErrors,
        veiculoId: isConflict
          ? 'Veículo já alocado para outra viagem neste período.'
          : '',
      }));
    }
  };

  const validateSeatChange = async (newVehicle, travelId) => {
    if (!newVehicle || !travelId) return;
    setSeatValidationLoading(true);
    try {
      const reservations = await getReservationsByTravelId(travelId);

      const totalSeats =
        parseInt(newVehicle.assentosAndar1, 10) +
        parseInt(newVehicle.assentosAndar2, 10);

      const invalidSeats = reservations.filter(
        (reservation) => reservation.numeroAssento > totalSeats
      );

      if (invalidSeats.length > 0) {
        const invalidSeatNumbers = invalidSeats.map(
          (res) => res.numeroAssento
        ).join(', ');

        setErrors((prevErrors) => ({
          ...prevErrors,
          veiculoId: `Há na viagem, reservas em assentos não disponíveis neste ônibus. Assentos: ${invalidSeatNumbers}`,
        }));

        console.log(
          `Assentos reservados não disponíveis no novo veículo: ${invalidSeatNumbers}`
        );
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, veiculoId: '' }));
      }
    } catch (error) {
      console.error('Erro ao validar alteração de veículo:', error);
    } finally {
      setSeatValidationLoading(false);
    }
  };

  const validateDatesAndTimes = (travel) => {
    let errors = {};
    if (
      travel.dataRetorno &&
      new Date(travel.dataIda) > new Date(travel.dataRetorno)
    ) {
      errors.dataRetorno = 'Data de retorno não pode ser antes da data de ida.';
    } else {
      errors.dataRetorno = '';
    }

    if (
      travel.dataIda === travel.dataRetorno &&
      travel.horarioIda &&
      travel.horarioRetorno &&
      travel.horarioRetorno <= travel.horarioIda
    ) {
      errors.horarioRetorno =
        'Horário de retorno deve ser após o horário de ida no mesmo dia.';
    } else {
      errors.horarioRetorno = '';
    }
    return errors;
  };

  const validateField = (name, value) => {
    let errors = {};
    switch (name) {
      case 'identificador':
        errors.identificador = !/^\d*$/.test(value)
          ? 'Apenas números são permitidos.'
          : '';
        errors.identificador =
          value.length > 10 ? 'Máximo de 10 dígitos.' : errors.identificador;
        break;
      case 'origem':
      case 'destino':
        errors[name] = value.length > 55 ? 'Máximo de 55 caracteres.' : '';
        break;
      case 'informacoesAdicionais':
        errors.informacoesAdicionais =
          value.length > 255 ? 'Máximo de 255 caracteres.' : '';
        break;
      default:
        break;
    }
    return errors;
  };

  const isFormValid = () => {
    const requiredFields = [
      'identificador',
      'origem',
      'destino',
      'dataIda',
      'horarioIda',
    ];
    const requiredFieldsFilled = requiredFields.every((field) => !!travel[field]);
    const noErrors = Object.values(errors).every((error) => !error);
    return requiredFieldsFilled && noErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormValid()) {
      setLoading(true);
      await saveTravel(travel);
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleAddVehicle = async (newVehicle) => {
    try {
      await addVehicle(newVehicle);
      const updatedVehicles = await getAllVehicles();
      updatedVehicles.sort(
        (a, b) => new Date(b.dataAdicionado) - new Date(a.dataAdicionado)
      );
      const mostRecentVehicle = updatedVehicles[0];
      setVehicles(updatedVehicles);
      setFilteredVehicles(updatedVehicles);
      setVehicleModalOpen(false);
      setTravel((prevTravel) => ({
        ...prevTravel,
        veiculoId: mostRecentVehicle.id,
        assentosAndar1: mostRecentVehicle.assentosAndar1.toString(),
        assentosAndar2: mostRecentVehicle.assentosAndar2.toString(),
      }));
      validateVehicleAvailability(mostRecentVehicle.id, {
        ...travel,
        veiculoId: mostRecentVehicle.id,
      });
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
    }
  };

  return (
    <Dialog open onClose={cancelForm} fullWidth maxWidth="md">
      <DialogContent sx={{ padding: 0 }}>
        <Box sx={{ padding: 2, overflowY: 'auto', maxHeight: '80vh' }}>
          <form onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
                flexDirection: { xs: 'column', md: 'row' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                variant="h6"
                sx={{ marginBottom: { xs: 1, md: 0 } }}
              >
                {initialTravel ? 'Editar Viagem' : 'Nova Viagem'}
                <TravelFormHelp />
              </Typography>
              <Typography variant="caption" display="block" gutterBottom>
                * Campos Obrigatórios
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  error={!!errors.identificador}
                  helperText={errors.identificador}
                  label="Identificador da Viagem (Apenas números e máximo de 10 caracteres)"
                  name="identificador"
                  value={travel.identificador}
                  onChange={handleInputChange}
                  onKeyPress={(event) => {
                    if (
                      isNaN(Number(event.key)) ||
                      event.target.value.length >= 10
                    ) {
                      event.preventDefault();
                    }
                  }}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="somenteIda"
                      checked={travel.somenteIda}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="Viagem somente de ida"
                  sx={{ margin: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocationSelector
                  label="Local de Origem"
                  value={travel.origem}
                  onChange={(value) => handleLocationChange('origem', value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocationSelector
                  label="Local de Destino"
                  value={travel.destino}
                  onChange={(value) => handleLocationChange('destino', value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!errors.dataIda}
                  helperText={errors.dataIda}
                  label="Data de Ida da Viagem"
                  name="dataIda"
                  type="date"
                  value={travel.dataIda}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!errors.horarioIda}
                  helperText={errors.horarioIda}
                  label="Horário de Ida da Viagem"
                  name="horarioIda"
                  type="time"
                  value={travel.horarioIda}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!errors.dataRetorno}
                  helperText={errors.dataRetorno}
                  label="Data de Retorno da Viagem"
                  name="dataRetorno"
                  type="date"
                  value={travel.dataRetorno}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={travel.somenteIda}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!errors.horarioRetorno}
                  helperText={errors.horarioRetorno}
                  label="Horário de Retorno da Viagem"
                  name="horarioRetorno"
                  type="time"
                  value={travel.horarioRetorno}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={travel.somenteIda}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  id="vehicle-select"
                  options={filteredVehicles}
                  getOptionLabel={(option) =>
                    `${option.identificadorVeiculo} - Placa: ${option.placa} - Empresa: ${option.empresa}`
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Veículo da Viagem(Opcional)"
                      placeholder="Busque por Identificador, Placa ou Empresa"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.veiculoId}
                      helperText={errors.veiculoId}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            {params.InputProps.endAdornment}
                            <Tooltip title="Adicionar Veículo">
                              <IconButton
                                onClick={() => setVehicleModalOpen(true)}
                                edge="end"
                                sx={{ color: 'blue' }}
                              >
                                <AddIcon
                                  sx={{
                                    backgroundColor: 'primary.main',
                                    borderRadius: '50%',
                                    color: 'white',
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="Nenhuma opção encontrada."
                  value={vehicles.find((vehicle) => vehicle.id === travel.veiculoId) || null}
                  onChange={handleVehicleChange}
                  onInputChange={(event, newInputValue) =>
                    handleVehicleSearch({ target: { value: newInputValue } })
                  }
                />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <TextField
                  label="Assentos 1° Andar"
                  name="assentosAndar1"
                  type="number"
                  value={travel.assentosAndar1}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Assentos 2° Andar"
                  name="assentosAndar2"
                  type="number"
                  value={travel.assentosAndar2}
                  fullWidth
                  disabled
                />
              </Grid> */}
              <Grid item xs={12}>
                <TextField
                  error={!!errors.informacoesAdicionais}
                  helperText={errors.informacoesAdicionais}
                  label="Informações Adicionais da Viagem"
                  name="informacoesAdicionais"
                  value={travel.informacoesAdicionais}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  maxRows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <Button  onClick={cancelForm} color="cancelar" variant="contained" sx={{ borderRadius: '50px' }} >
                    {initialTravel ? 'Descartar alterações' : 'Voltar'}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isFormValid() || loading || seatValidationLoading}
                    sx={{ marginBottom: { xs: 2, md: 0 }, marginRight: { md: 1 }, borderRadius: '50px' }}
                  >
                    {loading || seatValidationLoading ? (
                      <CircularProgress size={24} />
                    ) : initialTravel ? (
                      'Salvar alterações'
                    ) : (
                      'Adicionar viagem'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity="success"
                sx={{ width: '100%' }}
              >
                Viagem salva com sucesso!
              </Alert>
            </Snackbar>
          </form>
        </Box>
      </DialogContent>
      <Dialog
        open={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <VehicleForm
            onSave={handleAddVehicle}
            onCancel={() => setVehicleModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default TravelForm;

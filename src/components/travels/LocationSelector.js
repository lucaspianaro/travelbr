import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TextField, CircularProgress, Autocomplete, Box, Typography } from '@mui/material';
import axios from 'axios';
import debounce from 'lodash.debounce';

const LocationSelector = ({ label, value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      setLoading(true);
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
        });

        const suggestions = response.data.map((item) => {
          const { address } = item;
          const city = address.city || address.town || address.village || address.hamlet || address.municipality || '';
          const state = address.state || '';
          const country = address.country || '';
          const display_name = [city, state, country].filter(Boolean).join(', ');

          return {
            display_name,
            place_id: item.place_id,
          };
        });

        setOptions(suggestions);
      } catch (error) {
        console.error('Erro ao buscar sugestões de localizações:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 2) {
      fetchSuggestions(newInputValue);
    } else {
      setOptions([]);
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    onChange(newValue ? newValue.display_name : '');
  };

  const memoizedOptions = useMemo(() => options, [options]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      freeSolo
      value={memoizedOptions.find(option => option.display_name === value) || null}
      inputValue={inputValue}
      options={memoizedOptions}
      getOptionLabel={(option) => option.display_name}
      onInputChange={handleInputChange}
      onChange={handleChange}
      noOptionsText={loading ? 'Carregando...' : 'Nenhuma opção encontrada'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Busque e Selecione uma das opções sugeridas"
          variant="outlined"
          margin="normal"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 1 }}>
              <CircularProgress size={20} />
              <Typography sx={{ marginLeft: 2 }}>Carregando...</Typography>
            </Box>
          ) : (
            option.display_name
          )}
        </Box>
      )}
    />
  );
};

export default React.memo(LocationSelector);

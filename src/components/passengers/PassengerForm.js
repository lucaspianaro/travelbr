import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { addPassenger, updatePassenger } from '../../services/PassengerService';
import { formatCPF, formatTelefone, validarCPF, unformatCPF } from '../../utils/utils';

// Função utilitária para renderizar um TextField
const renderTextField = (label, field, value, onChange, error, helperText, required = false, type = 'text', inputProps = {}) => (
  <TextField
    key={field}
    label={label}
    type={type}
    error={!!error}
    helperText={helperText || ''}
    value={value || ''}
    onChange={onChange}
    fullWidth
    margin="normal"
    required={required}
    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    inputProps={inputProps}
  />
);

const PassengerForm = ({
  editedPassenger, setEditedPassenger, errors, setErrors, handleCloseFormDialog, fetchPassageiros, editing, passageiros, setOpenSnackbar, setSnackbarMessage
}) => {
  const [isUnderage, setIsUnderage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para verificar se o passageiro é menor de idade quando a data de nascimento é alterada
  useEffect(() => {
    if (editedPassenger.dataNascimento) {
      setIsUnderage(checkUnderage(editedPassenger.dataNascimento));
    }
  }, [editedPassenger.dataNascimento]);

  // Função para verificar se o passageiro é menor de idade
  const checkUnderage = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const m = today.getMonth() - birthDate.getMonth();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  };

  // Função para lidar com mudanças nos campos de entrada
  const handleInputChange = (e, field) => {
    let { value } = e.target;
    let error = '';
    const documentAlreadyExists = (type, doc, excludeId) => {
      return passageiros.some(p => p[type] === doc && p.id !== excludeId);
    };
    switch (field) {
      case 'nome':
      case 'nomeResponsavel':
        value = value.replace(/[^a-zA-ZÀ-ú\s]/g, '');
        if (value.length > 255) error = 'Nome deve ter no máximo 255 caracteres e apenas letras.';
        break;
      case 'cpf':
        const cleanedCPF = unformatCPF(value);
        if (cleanedCPF && !validarCPF(cleanedCPF)) {
          error = 'CPF inválido.';
        } else if (cleanedCPF && documentAlreadyExists('cpf', cleanedCPF, editedPassenger.id)) {
          error = 'Passageiro já cadastrado com este CPF.';
        }
        value = cleanedCPF;
        break;
      case 'passaporte':
        if (value.length > 20) {
          error = 'Número do Passaporte deve ter no máximo 20 caracteres.';
        } else if (documentAlreadyExists('passaporte', value, editedPassenger.id)) {
          error = 'Passageiro já cadastrado com este Número de Passaporte.';
        }
        if (value === editedPassenger.passaporteResponsavel) {
          error = 'O número do passaporte do passageiro não pode ser o mesmo do responsável.';
        }
        break;
      case 'cpfResponsavel':
        const cleanedCPFResponsavel = unformatCPF(value);
        if (cleanedCPFResponsavel && cleanedCPFResponsavel === editedPassenger.cpf) {
          error = 'O CPF do responsável não pode ser o mesmo do passageiro.';
        } else if (cleanedCPFResponsavel && !validarCPF(cleanedCPFResponsavel)) {
          error = 'CPF inválido.';
        }
        value = cleanedCPFResponsavel;
        break;
      case 'passaporteResponsavel':
        if (value.length > 20) {
          error = 'Número do Passaporte do Responsável deve ter no máximo 20 caracteres.';
        } else if (documentAlreadyExists('passaporteResponsavel', value, editedPassenger.id)) {
          error = 'Passageiro já cadastrado com este Número de Passaporte do Responsável.';
        }
        if (value === editedPassenger.passaporte) {
          error = 'O número do passaporte do responsável não pode ser o mesmo do passageiro.';
        }
        break;
      case 'rg':
        if (value.length > 20) {
          error = 'RG deve ter no máximo 20 caracteres.';
        } else if (documentAlreadyExists('rg', value, editedPassenger.id)) {
          error = 'Passageiro já cadastrado com este RG.';
        }
        break;
      case 'rgResponsavel':
        if (value.length > 20) {
          error = 'RG deve ter no máximo 20 caracteres.';
        } else if (value === editedPassenger.rg) {
          error = 'O RG do responsável não pode ser o mesmo do passageiro.';
        }
        break;
      case 'telefone':
      case 'telefoneResponsavel':
        value = value.replace(/[^0-9]/g, '');
        if (value.length > 25) error = 'Telefone deve conter apenas números e ter no máximo 25 caracteres.';
        break;
      case 'endereco':
        if (value.length > 255) error = 'Endereço deve ter no máximo 255 caracteres.';
        break;
      default:
        break;
    }

    setEditedPassenger(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: error }));

    if (field === 'dataNascimento') {
      setIsUnderage(checkUnderage(value));
    }
  };

  // Função para verificar se todos os campos obrigatórios estão preenchidos corretamente
  const canSave = () => {
    const baseRequiredFields = editedPassenger.estrangeiro ? ['nome', 'passaporte', 'telefone', 'dataNascimento'] : isUnderage ? ['nome', 'rg', 'telefone', 'dataNascimento'] : ['nome', 'cpf', 'rg', 'telefone', 'dataNascimento'];
    const underageRequiredFields = editedPassenger.estrangeiroResponsavel ? ['nomeResponsavel', 'passaporteResponsavel', 'telefoneResponsavel'] : ['nomeResponsavel', 'rgResponsavel', 'telefoneResponsavel'];
    let requiredFields = [...baseRequiredFields];

    if (isUnderage) {
      requiredFields = [...requiredFields, ...underageRequiredFields];
    }

    const hasErrors = Object.values(errors).some(e => e.length > 0);
    const hasAllFieldsFilled = requiredFields.every(field => editedPassenger[field] && editedPassenger[field].trim() !== '');

    return !hasErrors && hasAllFieldsFilled;
  };

  // Função para adicionar ou atualizar um passageiro
  const handleAddOrUpdatePassenger = async () => {
    if (!canSave() || isSubmitting) {
      setSnackbarMessage('Preencha todos os campos obrigatórios corretamente.');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);

    const cpfExists = passageiros.some(p => p.cpf === editedPassenger.cpf && p.id !== editedPassenger.id);
    const rgExists = passageiros.some(p => p.rg === editedPassenger.rg && p.id !== editedPassenger.id);
    const passaporteExists = passageiros.some(p => p.passaporte === editedPassenger.passaporte && p.id !== editedPassenger.id);
    const passaporteResponsavelExists = passageiros.some(p => p.passaporteResponsavel === editedPassenger.passaporteResponsavel && p.id !== editedPassenger.id);

    if (isUnderage && editedPassenger.cpf && editedPassenger.cpf === editedPassenger.cpfResponsavel) {
      setSnackbarMessage('O CPF do passageiro não pode ser o mesmo do responsável.');
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    if (isUnderage && !editedPassenger.estrangeiroResponsavel && (!editedPassenger.nomeResponsavel || (editedPassenger.cpfResponsavel && !validarCPF(editedPassenger.cpfResponsavel)) || !editedPassenger.rgResponsavel || !editedPassenger.telefoneResponsavel)) {
      setSnackbarMessage('Dados do responsável são obrigatórios para menores de 18 anos.');
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    if (isUnderage && editedPassenger.estrangeiroResponsavel && (!editedPassenger.nomeResponsavel || !editedPassenger.passaporteResponsavel || !editedPassenger.telefoneResponsavel)) {
      setSnackbarMessage('Dados do responsável estrangeiro são obrigatórios para menores de 18 anos.');
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const passengerData = {
        ...editedPassenger,
        menorDeIdade: isUnderage,
        dataAdicionado: editedPassenger.dataAdicionado || new Date().toISOString()
      };

      if (!editedPassenger.id) {
        await addPassenger(passengerData);
        setSnackbarMessage('Passageiro adicionado com sucesso!');
      } else {
        await updatePassenger(editedPassenger.id, passengerData);
        setSnackbarMessage('Passageiro atualizado com sucesso!');
      }

      setOpenSnackbar(true);
      handleCloseFormDialog();
      fetchPassageiros();
    } catch (error) {
      console.error('Erro ao salvar passageiro:', error);
      setSnackbarMessage('Erro ao salvar passageiro. Por favor, tente novamente.');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para lidar com a mudança na checkbox de estrangeiro
  const handleForeignChange = (e) => {
    setEditedPassenger(prev => ({ ...prev, estrangeiro: e.target.checked, cpf: '', rg: '', passaporte: '' }));
    setErrors(prev => ({ ...prev, cpf: '', rg: '', passaporte: '' }));
  };

  const handleForeignResponsavelChange = (e) => {
    setEditedPassenger(prev => ({ ...prev, estrangeiroResponsavel: e.target.checked, cpfResponsavel: '', rgResponsavel: '', passaporteResponsavel: '' }));
    setErrors(prev => ({ ...prev, cpfResponsavel: '', rgResponsavel: '', passaporteResponsavel: '' }));
  };

  return (
    <>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {editing ? 'Editar Passageiro' : 'Cadastrar Novo Passageiro'}
      </Typography>
      <Grid item xs={12} style={{ marginTop: '10px', textAlign: 'right' }}>
        <Typography variant="caption" display="block" gutterBottom>
          * Campos Obrigatórios
        </Typography>
      </Grid>
      {renderTextField("Nome Completo", "nome", editedPassenger.nome, e => handleInputChange(e, 'nome'), errors.nome, errors.nome, true)}
      {renderTextField("Data de Nascimento", "dataNascimento", editedPassenger.dataNascimento, e => handleInputChange(e, 'dataNascimento'), errors.dataNascimento, errors.dataNascimento, true, 'date', { max: new Date().toISOString().split("T")[0] })}
      <FormControlLabel
        control={
          <Checkbox
            checked={editedPassenger.estrangeiro}
            onChange={handleForeignChange}
            name="estrangeiro"
            color="primary"
          />
        }
        label="Estrangeiro"
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {renderTextField("CPF", "cpf", formatCPF(editedPassenger.cpf), e => handleInputChange(e, 'cpf'), errors.cpf, errors.cpf, !editedPassenger.estrangeiro && !isUnderage)}
        </Grid>
        <Grid item xs={6}>
          {renderTextField(editedPassenger.estrangeiro ? "Número do Passaporte" : isUnderage ? "RG ou Certidão de Nascimento" : "RG", editedPassenger.estrangeiro ? "passaporte" : "rg", editedPassenger.estrangeiro ? editedPassenger.passaporte : editedPassenger.rg, e => handleInputChange(e, editedPassenger.estrangeiro ? 'passaporte' : 'rg'), editedPassenger.estrangeiro ? errors.passaporte : errors.rg, editedPassenger.estrangeiro ? errors.passaporte : errors.rg, true, 'text', editedPassenger.estrangeiro ? { maxLength: 20 } : {})}
        </Grid>
      </Grid>

      {renderTextField("Telefone", "telefone", formatTelefone(editedPassenger.telefone), e => handleInputChange(e, 'telefone'), errors.telefone, errors.telefone, true)}
      {renderTextField("Endereço", "endereco", editedPassenger.endereco, e => handleInputChange(e, 'endereco'), errors.endereco, errors.endereco)}

      {isUnderage && (
        <>
          {renderTextField("Nome do Responsável", "nomeResponsavel", editedPassenger.nomeResponsavel, e => handleInputChange(e, 'nomeResponsavel'), errors.nomeResponsavel, errors.nomeResponsavel, true)}
          <FormControlLabel
            control={
              <Checkbox
                checked={editedPassenger.estrangeiroResponsavel}
                onChange={handleForeignResponsavelChange}
                name="estrangeiroResponsavel"
                color="primary"
              />
            }
            label="Responsável Estrangeiro"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {renderTextField("CPF do Responsável", "cpfResponsavel", formatCPF(editedPassenger.cpfResponsavel), e => handleInputChange(e, 'cpfResponsavel'), errors.cpfResponsavel, errors.cpfResponsavel, !editedPassenger.estrangeiroResponsavel)}
            </Grid>
            <Grid item xs={6}>
              {renderTextField(editedPassenger.estrangeiroResponsavel ? "Número do Passaporte do Responsável" : "RG do Responsável", editedPassenger.estrangeiroResponsavel ? "passaporteResponsavel" : "rgResponsavel", editedPassenger.estrangeiroResponsavel ? editedPassenger.passaporteResponsavel : editedPassenger.rgResponsavel, e => handleInputChange(e, editedPassenger.estrangeiroResponsavel ? 'passaporteResponsavel' : 'rgResponsavel'), editedPassenger.estrangeiroResponsavel ? errors.passaporteResponsavel : errors.rgResponsavel, editedPassenger.estrangeiroResponsavel ? errors.passaporteResponsavel : errors.rgResponsavel, true, 'text', editedPassenger.estrangeiroResponsavel ? { maxLength: 20 } : {})}
            </Grid>
          </Grid>
          {renderTextField("Telefone do Responsável", "telefoneResponsavel", formatTelefone(editedPassenger.telefoneResponsavel), e => handleInputChange(e, 'telefoneResponsavel'), errors.telefoneResponsavel, errors.telefoneResponsavel, true)}
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>    
        <Button onClick={handleCloseFormDialog} color="error" disabled={isSubmitting}>
          {editing ? 'Descartar Alterações' : 'Descartar'}
        </Button>
        <Button
          onClick={handleAddOrUpdatePassenger}
          color="primary"
          variant="contained"
          disabled={!canSave() || isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {editing ? 'Salvar Alterações' : 'Adicionar Passageiro'}
        </Button>
      </Box>
    </>
  );
};

export default React.memo(PassengerForm);

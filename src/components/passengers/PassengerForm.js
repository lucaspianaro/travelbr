import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, FormControlLabel, Checkbox, Snackbar, Alert, Radio, RadioGroup, FormControl, FormLabel, Autocomplete } from '@mui/material';
import { addPassenger, updatePassenger, getPassengerById, validateDocumentDuplication } from '../../services/PassengerService';
import { formatCPF, formatRG, formatTelefone, validarCPF, unformatCPF } from '../../utils/utils';

// Função para criar um campo de texto com validação e atributos personalizados
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

// Função para verificar se o documento (CPF, RG, etc.) já está cadastrado
const documentAlreadyExists = (type, doc, excludeId, passageiros) => {
  return passageiros.some(p => p[type] === doc && p.id !== excludeId);
};

const PassengerForm = ({
  editedPassenger, setEditedPassenger, handleCloseFormDialog, fetchPassageiros, editing, passageiros
}) => {
  const [errors, setErrors] = useState({}); // useState para armazenar os erros de validação do formulário
  const [isUnderage, setIsUnderage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responsavelData, setResponsavelData] = useState({});
  const [responsavelFlow, setResponsavelFlow] = useState('existing');
  const [isForeign, setIsForeign] = useState(editedPassenger.estrangeiro || false);
  const [responsavelIsForeign, setResponsavelIsForeign] = useState(false);
  const [passengerIsForeign, setPassengerIsForeign] = useState(editedPassenger.estrangeiro || false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // useEffect que executa sempre que a data de nascimento ou o responsável do passageiro é alterado
  useEffect(() => {
    if (editedPassenger.dataNascimento) {
      setIsUnderage(checkUnderage(editedPassenger.dataNascimento));
    }

    if (editedPassenger.menorDeIdade && editedPassenger.responsavelId) {
      fetchResponsavelData(editedPassenger.responsavelId);
    }
  }, [editedPassenger.dataNascimento, editedPassenger.responsavelId]);

  // Função para buscar os dados do responsável
  const fetchResponsavelData = async (responsavelId) => {
    try {
      if (responsavelId) {
        const responsavel = await getPassengerById(responsavelId);
        setResponsavelData({
          responsavelId: responsavel.id,
          nomeResponsavel: responsavel.nome,
          cpfResponsavel: responsavel.cpf || '',
          rgResponsavel: responsavel.rg || '',
          passaporteResponsavel: responsavel.passaporte || '',
          telefoneResponsavel: responsavel.telefone || '',
          dataNascimentoResponsavel: responsavel.dataNascimento || '',
          estrangeiroResponsavel: responsavel.estrangeiro || false,
        });
        setResponsavelIsForeign(responsavel.estrangeiro || false);
      }
    } catch (error) {
      console.error('Erro ao buscar responsável:', error);
    }
  };

  // Função para verificar se o passageiro é menor de idade baseado na data de nascimento
  const checkUnderage = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  };

  // Função para validar os campos do formulário (nome, CPF, RG, etc.)
  const validateField = (field, value, entity) => {
    let error = '';
    const documentExists = (type, doc) => documentAlreadyExists(type, doc, entity === 'passenger' ? editedPassenger.id : null, passageiros);

    switch (field) {
      case 'nome':
        if (value.length > 255) error = 'Nome deve ter no máximo 255 caracteres.';
        break;
      case 'cpf':
        const cleanedCPF = unformatCPF(value);
        if (!isForeign && cleanedCPF) {
          if (!validarCPF(cleanedCPF)) {
            error = 'CPF inválido.';
          } else if (documentExists('cpf', cleanedCPF)) {
            error = 'Já existe um cadastro com este CPF.';
          }
        }
        break;
      case 'rg':
        if (value.length > 255) {
          error = 'RG ou Certidão de Nascimento deve ter no máximo 255 caracteres.';
        } else if (documentExists('rg', value)) {
          error = 'Já existe um cadastro com este RG.';
        }
        break;
      case 'passaporte':
        if (documentExists('passaporte', value)) {
          error = 'Já existe um cadastro com este Passaporte.';
        }
        break;
      default:
        break;
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [entity === 'responsavel' ? `${field}Responsavel` : field]: error,
    }));

    return error;
  };

  // Função chamada quando há alteração nos campos do formulário
  const handleInputChange = (e, field, entity) => {
    const { value } = e.target;
    if (entity === 'passenger') {
      setEditedPassenger(prev => ({ ...prev, [field]: value }));
    } else {
      setResponsavelData(prev => ({ ...prev, [field]: value }));
    }
    validateField(field, value, entity);
  };

  // Função para lidar com a alteração se o passageiro ou responsável for estrangeiro
  const handleForeignChange = (e, entity) => {
    const isForeign = e.target.checked;
    if (entity === 'passenger') {
      setPassengerIsForeign(isForeign);
      setEditedPassenger(prev => ({ ...prev, estrangeiro: isForeign, cpf: '', rg: '', passaporte: '' }));
    } else {
      setResponsavelIsForeign(isForeign);
      setResponsavelData(prev => ({ ...prev, estrangeiro: isForeign, cpf: '', rg: '', passaporte: '' }));
    }
    // Reset errors for documents
    setErrors(prev => ({
      ...prev,
      cpf: '',
      rg: '',
      passaporte: '',
      cpfResponsavel: '',
      rgResponsavel: '',
      passaporteResponsavel: '',
    }));
  };

  // Função para validar se os documentos (CPF, RG, passaporte) são únicos
  const validateUniqueDocuments = () => {
    const passengerDocuments = {
      cpf: editedPassenger.cpf || '',
      rg: editedPassenger.rg || '',
      passaporte: editedPassenger.passaporte || '',
    };
    const responsavelDocuments = {
      cpf: responsavelData.cpfResponsavel || '',
      rg: responsavelData.rgResponsavel || '',
      passaporte: responsavelData.passaporteResponsavel || '',
    };

    const newErrors = { ...errors };
    let hasError = false;

    if (passengerDocuments.cpf && passengerDocuments.cpf === responsavelDocuments.cpf) {
      newErrors.cpf = 'O CPF do passageiro e do responsável não podem ser iguais.';
      newErrors.cpfResponsavel = 'O CPF do passageiro e do responsável não podem ser iguais.';
      hasError = true;
    }

    if (passengerDocuments.rg && passengerDocuments.rg === responsavelDocuments.rg) {
      newErrors.rg = 'O RG do passageiro e do responsável não podem ser iguais.';
      newErrors.rgResponsavel = 'O RG do passageiro e do responsável não podem ser iguais.';
      hasError = true;
    }

    if (passengerDocuments.passaporte && passengerDocuments.passaporte === responsavelDocuments.passaporte) {
      newErrors.passaporte = 'O Passaporte do passageiro e do responsável não podem ser iguais.';
      newErrors.passaporteResponsavel = 'O Passaporte do passageiro e do responsável não podem ser iguais.';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  // Função para checar se todos os campos obrigatórios estão preenchidos e o formulário pode ser salvo
  const canSave = () => {
    const baseRequiredFields = passengerIsForeign
      ? ['nome', 'passaporte', 'telefone', 'dataNascimento']
      : isUnderage
      ? ['nome', 'rg', 'telefone', 'dataNascimento']
      : ['nome', 'cpf', 'rg', 'telefone', 'dataNascimento'];

    const hasErrors = Object.values(errors).some(e => e.length > 0);
    const hasAllFieldsFilled = baseRequiredFields.every(field => editedPassenger[field] && editedPassenger[field].trim() !== '');

    if (isUnderage && responsavelData) {
      const responsavelFields = ['nomeResponsavel', 'dataNascimentoResponsavel', 'telefoneResponsavel'];
      if (responsavelIsForeign) {
        responsavelFields.push('passaporteResponsavel');
      } else {
        responsavelFields.push('cpfResponsavel', 'rgResponsavel');
      }

      const responsavelFilled = responsavelFields.every(field => responsavelData[field] && responsavelData[field].trim() !== '');
      const responsavelIsValidAge = !checkUnderage(responsavelData.dataNascimentoResponsavel);

      return !hasErrors && hasAllFieldsFilled && responsavelFilled && responsavelIsValidAge;
    }

    return !hasErrors && hasAllFieldsFilled;
  };

  // Função para adicionar ou atualizar o passageiro no banco de dados
  const handleAddOrUpdatePassenger = async () => {
    if (!validateUniqueDocuments()) {
      return;
    }
  
    if (!canSave() || isSubmitting) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      let responsavelId = editedPassenger.responsavelId || null;
  
      // Validação de duplicidade para o passageiro
      await validateDocumentDuplication(editedPassenger, editedPassenger.id, 'passageiro');
  
      if (isUnderage) {
        if (responsavelFlow === 'existing' && responsavelData && responsavelData.responsavelId) {
          responsavelId = responsavelData.responsavelId;
        } else if (responsavelFlow === 'new' && responsavelData && !responsavelId) {
          // Validação de duplicidade para o responsável
          await validateDocumentDuplication(responsavelData, null, 'responsável');
  
          const responsavel = {
            nome: responsavelData.nomeResponsavel,
            ...(responsavelData.cpfResponsavel && { cpf: responsavelData.cpfResponsavel }), // Adiciona CPF apenas se existir
            ...(responsavelData.rgResponsavel && { rg: responsavelData.rgResponsavel }),
            ...(responsavelData.passaporteResponsavel && { passaporte: responsavelData.passaporteResponsavel }),
            telefone: responsavelData.telefoneResponsavel,
            endereco: responsavelData.enderecoResponsavel || null,
            dataNascimento: responsavelData.dataNascimentoResponsavel,
            estrangeiro: responsavelIsForeign || false,
            menorDeIdade: false,
          };
  
          const responsavelResponse = await addPassenger(responsavel);
          responsavelId = responsavelResponse.id;
        }
      }
  
      const passengerData = {
        ...editedPassenger,
        menorDeIdade: isUnderage,
        responsavelId: responsavelId || null,
        dataAdicionado: editedPassenger.dataAdicionado || new Date().toISOString(),
        ...(editedPassenger.cpf && { cpf: editedPassenger.cpf }), // Adiciona CPF apenas se existir
        ...(editedPassenger.rg && { rg: editedPassenger.rg }),
        ...(editedPassenger.passaporte && { passaporte: editedPassenger.passaporte })
      };
  
      if (!editedPassenger.id) {
        await addPassenger(passengerData);
        setSnackbarMessage('Passageiro adicionado com sucesso!');
      } else {
        await updatePassenger(editedPassenger.id, passengerData);
        setSnackbarMessage('Passageiro atualizado com sucesso!');
      }
  
      setSnackbarOpen(true);
      handleCloseFormDialog();
      fetchPassageiros();
    } catch (error) {
      console.error('Erro ao salvar passageiro:', error);
  
      if (error.message.includes('CPF')) {
        setSnackbarMessage(error.message.includes('responsável')
          ? 'Erro: O CPF do responsável já está cadastrado.'
          : 'Erro: O CPF do responsável já está cadastrado.');
      } else if (error.message.includes('RG')) {
        setSnackbarMessage(error.message.includes('responsável')
          ? 'Erro: O RG do responsável já está cadastrado.'
          : 'Erro: O RG do responsável já está cadastrado.');
      } else if (error.message.includes('PASSAPORTE')) {
        setSnackbarMessage(error.message.includes('responsável')
          ? 'Erro: O Passaporte do responsável já está cadastrado.'
          : 'Erro: O Passaporte do responsável já está cadastrado.');
      } else {
        setSnackbarMessage(error.message || 'Erro ao salvar passageiro. Por favor, tente novamente.');
      }
  
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  // Função para selecionar um responsável existente para um menor de idade
  const handlePassengerSelect = (event, newValue) => {
    if (newValue) {
      setResponsavelData(prev => ({
        ...prev,
        responsavelId: newValue.id,
        nomeResponsavel: newValue.nome,
        cpfResponsavel: newValue.cpf || '',
        rgResponsavel: newValue.rg || '',
        passaporteResponsavel: newValue.passaporte || '',
        telefoneResponsavel: newValue.telefone || '',
        dataNascimentoResponsavel: newValue.dataNascimento || '',
        estrangeiroResponsavel: newValue.estrangeiro || false,
      }));
      setResponsavelIsForeign(newValue.estrangeiro || false);
    }
  };

  // Filtra os passageiros para remover os menores de idade e ordena por nome
  const filteredPassageiros = passageiros
    .filter(p => !p.menorDeIdade)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // Função para garantir que somente números sejam permitidos no campo
  const handleNumericInputChange = (e, field, entity) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    handleInputChange({ target: { value: numericValue } }, field, entity);
  };  

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {editing ? 'Editar Passageiro' : 'Cadastrar Novo Passageiro'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          * Campos obrigatórios
        </Typography>
      </Box>
      <FormControlLabel
        control={<Checkbox checked={passengerIsForeign} onChange={(e) => handleForeignChange(e, 'passenger')} name="estrangeiro" color="primary" />}
        label="Estrangeiro"
      />
      {renderTextField("Nome Completo", "nome", editedPassenger.nome, e => handleInputChange(e, 'nome', 'passenger'), errors.nome, errors.nome, true)}
      {renderTextField("Data de Nascimento", "dataNascimento", editedPassenger.dataNascimento, e => handleInputChange(e, 'dataNascimento', 'passenger'), errors.dataNascimento, errors.dataNascimento, true, 'date', { max: new Date().toISOString().split("T")[0] })}

      {!passengerIsForeign && (
        <>
          {renderTextField("CPF", "cpf", formatCPF(editedPassenger.cpf), e => handleNumericInputChange(e, 'cpf', 'passenger'), errors.cpf, errors.cpf, !isUnderage, 'text', { inputMode: 'numeric', pattern: '[0-9]*' })}
          {renderTextField(isUnderage ? "RG ou Certidão de Nascimento" : "RG", "rg", editedPassenger.rg, e => handleInputChange(e, 'rg', 'passenger'), errors.rg, errors.rg, true)}
        </>
      )}

      {passengerIsForeign && (
        renderTextField("Número do Passaporte", "passaporte", editedPassenger.passaporte, e => handleInputChange(e, 'passaporte', 'passenger'), errors.passaporte, errors.passaporte, true)
      )}

      {renderTextField("Telefone", "telefone", formatTelefone(editedPassenger.telefone), e => handleNumericInputChange(e, 'telefone', 'passenger'), errors.telefone, errors.telefone, true, 'text', { inputMode: 'numeric', pattern: '[0-9]*' })}
      {renderTextField("Endereço", "endereco", editedPassenger.endereco, e => handleInputChange(e, 'endereco', 'passenger'), errors.endereco, errors.endereco)}

      {isUnderage && (
        <>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginTop: 2 }}>
            Dados do Responsável
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Selecione o fluxo:</FormLabel>
            <RadioGroup
              row
              aria-label="responsavelFlow"
              name="responsavelFlow"
              value={responsavelFlow}
              onChange={(e) => setResponsavelFlow(e.target.value)}
            >
              <FormControlLabel value="existing" control={<Radio />} label="Selecionar Responsável Existente" />
              <FormControlLabel value="new" control={<Radio />} label="Criar Novo Responsável" />
            </RadioGroup>
          </FormControl>

          {responsavelFlow === 'existing' && (
            <Autocomplete
              options={filteredPassageiros}
              getOptionLabel={(option) => `${option.nome} - ${option.cpf ? `CPF: ${formatCPF(option.cpf)}` : `RG: ${formatRG(option.rg)}`}`}
              loading={isSubmitting}
              value={filteredPassageiros.find((p) => p.id === responsavelData.responsavelId) || null}
              onChange={handlePassengerSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Responsável"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isSubmitting ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {responsavelFlow === 'new' && (
            <>
              {renderTextField("Nome do Responsável", "nomeResponsavel", responsavelData.nomeResponsavel, e => handleInputChange(e, 'nomeResponsavel', 'responsavel'), errors.nomeResponsavel, errors.nomeResponsavel, true)}
              {renderTextField("Data de Nascimento", "dataNascimentoResponsavel", responsavelData.dataNascimentoResponsavel, e => handleInputChange(e, 'dataNascimentoResponsavel', 'responsavel'), errors.dataNascimentoResponsavel, errors.dataNascimentoResponsavel, true, 'date', { max: new Date().toISOString().split("T")[0] })}
              {checkUnderage(responsavelData.dataNascimentoResponsavel) && <Typography color="error">O responsável deve ter 18 anos ou mais.</Typography>}
              <FormControlLabel
                control={<Checkbox checked={responsavelIsForeign} onChange={(e) => handleForeignChange(e, 'responsavel')} name="estrangeiroResponsavel" color="primary" />}
                label="Responsável Estrangeiro"
              />
              {!responsavelIsForeign && (
                <>
                  {renderTextField("CPF do Responsável", "cpfResponsavel", formatCPF(responsavelData.cpfResponsavel), e => handleNumericInputChange(e, 'cpfResponsavel', 'responsavel'), errors.cpfResponsavel, errors.cpfResponsavel, true, 'text', { inputMode: 'numeric', pattern: '[0-9]*' })}
                  {renderTextField("RG do Responsável", "rgResponsavel", responsavelData.rgResponsavel, e => handleInputChange(e, 'rgResponsavel', 'responsavel'), errors.rgResponsavel, errors.rgResponsavel, true)}
                </>
              )}
              {responsavelIsForeign && renderTextField("Passaporte do Responsável", "passaporteResponsavel", responsavelData.passaporteResponsavel, e => handleInputChange(e, 'passaporteResponsavel', 'responsavel'), errors.passaporteResponsavel, errors.passaporteResponsavel, true)}
              {renderTextField("Telefone do Responsável", "telefoneResponsavel", formatTelefone(responsavelData.telefoneResponsavel), e => handleNumericInputChange(e, 'telefoneResponsavel', 'responsavel'), errors.telefoneResponsavel, errors.telefoneResponsavel, true, 'text', { inputMode: 'numeric', pattern: '[0-9]*' })}
              {renderTextField("Endereço do Responsável", "enderecoResponsavel", responsavelData.enderecoResponsavel, e => handleInputChange(e, 'enderecoResponsavel', 'responsavel'), errors.enderecoResponsavel, errors.enderecoResponsavel, false)}
            </>
          )}
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('sucesso') ? 'success' : 'error'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(PassengerForm);

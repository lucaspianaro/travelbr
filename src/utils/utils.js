import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Função auxiliar para formatar CPF
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const unformattedCPF = cpf.replace(/\D/g, '');
  if (unformattedCPF.length !== 11) return cpf;
  return unformattedCPF
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Função auxiliar para desformatar CPF
export const unformatCPF = (cpf) => cpf.replace(/\D/g, '');

// Função para validar CPF
export const validarCPF = (cpf) => {
  cpf = unformatCPF(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Função auxiliar para formatar RG
export const formatRG = (rg) => {
  if (!rg) return '';
  return rg.replace(/\D/g, '');
};

// Função auxiliar para formatar telefone
export const formatTelefone = (telefone) => {
  if (!telefone) return '';
  const unformattedTelefone = telefone.replace(/\D/g, '');
  if (unformattedTelefone.length !== 11) return telefone;
  return unformattedTelefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Função auxiliar para formatar placas de veículos
export const formatPlate = (plate) => {
  if (!plate) return '';
  return plate.replace(/(\w{3})(\w{4})/, '$1-$2');
};

// Função auxiliar para formatar datas
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + "T00:00");
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Função auxiliar para formatar datas no nome do arquivo
export const formatDateForFilename = (dateString) => {
  const date = new Date(dateString + "T00:00");
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

// Função para verificar se alguma parcela corresponde ao mês e ano filtrados
export const isMonthYearMatch = (parcelas, monthFilter, yearFilter) => {
  if (!monthFilter || !yearFilter) return true;
  return parcelas.some(parcela => {
    const installmentDate = new Date(parcela.dataParcela);
    const installmentMonth = installmentDate.getMonth() + 1;
    const installmentYear = installmentDate.getFullYear();
    return installmentMonth === parseInt(monthFilter, 10) && installmentYear === parseInt(yearFilter, 10);
  });
};

// Função para validar a senha master fornecida
export const validateMasterPassword = async (providedMasterPassword) => {
  const user = auth.currentUser;

  if (!user) throw new Error('Usuário não está autenticado.');

  const userDocRef = doc(db, 'usuarios', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('Senha master não definida. Defina uma nova senha master.');
  }

  const userData = userDoc.data();
  const storedMasterPassword = userData.masterPassword;

  if (storedMasterPassword !== providedMasterPassword) {
    throw new Error('Senha master incorreta. Tente novamente.');
  }

  return true;
};

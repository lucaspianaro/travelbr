import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile as firebaseUpdateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// Função para registrar um novo usuário com email e senha
export const registerWithEmailPassword = async (email, senha, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Atualizar o perfil do usuário
    await firebaseUpdateProfile(user, { displayName });

    // Enviar e-mail de verificação
    await sendEmailVerification(user);
    console.log('E-mail de verificação enviado para:', user.email);
    return user;
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função para lidar com o login do usuário
export const loginWithEmailPassword = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth); // Fazer logout automático do usuário não verificado
      throw new Error('auth/email-not-verified');
    }

    return user;
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
};

// Função para fazer logout do usuário atual
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
};

// Função para redefinir a senha do usuário
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
};

// Função para verificar se a senha master está definida
export const checkMasterPasswordExists = async () => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuário não está autenticado.');

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().masterPassword) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar a senha master:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função para obter o status da senha master (ativa ou desativada)
export const getMasterPasswordStatus = async () => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuário não está autenticado.');

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return { isActive: data.masterPasswordActive || false, isDefined: !!data.masterPassword };
    }
    return { isActive: false, isDefined: false };
  } catch (error) {
    console.error('Erro ao obter o status da senha master:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função para alternar o status da senha master (ativar/desativar)
export const toggleMasterPasswordActive = async (isActive) => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuário não está autenticado.');

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Se o documento do usuário não existir, crie um novo documento
      await setDoc(userDocRef, {
        masterPasswordActive: isActive,
        // Inicialize outros campos que possam ser necessários
      });
    } else {
      // Se o documento existir, apenas atualize o campo
      await updateDoc(userDocRef, { masterPasswordActive: isActive });
    }

    console.log(`Senha master ${isActive ? 'ativada' : 'desativada'} com sucesso.`);
  } catch (error) {
    console.error('Erro ao alternar o status da senha master:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função para atualizar a senha master do usuário
export const updateMasterPassword = async (currentMasterPassword, masterPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuário não está autenticado.');

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.masterPassword) {
        if (userData.masterPassword !== currentMasterPassword) {
          throw new Error('Senha master atual incorreta.');
        }
      } else if (currentMasterPassword) {
        throw new Error('Senha master não definida. Defina uma nova senha master.');
      }

      await updateDoc(userDocRef, { masterPassword });
    } else {
      await setDoc(userDocRef, { masterPassword, masterPasswordActive: true });
    }

    console.log('Senha master definida com sucesso');
  } catch (error) {
    console.error('Erro ao definir a senha master:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função personalizada para atualizar o perfil do usuário
export const updateUserProfile = async (profileUpdates) => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuário não está autenticado.');

    await firebaseUpdateProfile(user, profileUpdates);
    console.log('Perfil atualizado com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    throw new Error(mapFirebaseError(error));
  }
};

// Função para mapear os códigos de erro do Firebase para mensagens mais amigáveis
const mapFirebaseError = (error) => {
  switch (error.code || error.message) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique suas credenciais e tente novamente.';
    case 'auth/invalid-credential':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/email-already-in-use':
      return 'O endereço de e-mail já está em uso por outra conta.';
    case 'auth/invalid-email':
      return 'O endereço de e-mail não é válido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Tente uma senha mais forte.';
    case 'auth/network-request-failed':
      return 'Falha na rede. Verifique sua conexão e tente novamente.';
    case 'auth/email-not-verified':
      return 'Por favor, verifique seu e-mail antes de fazer login.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
};

// Exportação de funções adicionais para atualização de perfil e senha
export {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
};
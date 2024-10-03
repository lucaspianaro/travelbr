import { db, auth } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';

// Função para adicionar um novo layout ao Firestore
export const addLayout = async (layout) => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const layoutCollectionRef = collection(userDocRef, 'layouts');
  const dataAdicionado = new Date().toISOString();
  return await addDoc(layoutCollectionRef, { ...layout, estaAtivo: true, dataExclusao: null, dataAdicionado });
};

// Função para atualizar um layout específico no Firestore
export const updateLayout = async (layoutId, layoutData) => {
  const userId = auth.currentUser.uid;
  const layoutDocRef = doc(db, 'usuarios', userId, 'layouts', layoutId);

  // Remover campos undefined do layoutData
  const cleanedLayoutData = removeUndefinedFields(layoutData);

  // Debug: Imprimir o que está sendo enviado
  console.log('Dados que serão enviados para o Firestore:', cleanedLayoutData);

  return await updateDoc(layoutDocRef, cleanedLayoutData);
};


const removeUndefinedFields = (obj) => {
  const cleanObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleanObj[key] = obj[key];
    }
  });
  return cleanObj;
};

// Função para marcar um layout como inativo no Firestore (exclusão lógica)
export const deleteLayout = async (layoutId) => {
  const userId = auth.currentUser.uid;
  const layoutDocRef = doc(db, 'usuarios', userId, 'layouts', layoutId);
  const dataExclusao = new Date().toISOString();
  return await updateDoc(layoutDocRef, { estaAtivo: false, dataExclusao });
};

// Função para obter todos os layouts ativos do Firestore
export const getAllLayouts = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const layoutCollectionRef = collection(userDocRef, 'layouts');
  const q = query(layoutCollectionRef, where('estaAtivo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Função para obter um layout específico pelo ID
export const getLayoutById = async (layoutId) => {
  const userId = auth.currentUser.uid;
  const layoutDocRef = doc(db, 'usuarios', userId, 'layouts', layoutId);
  const layoutDoc = await getDoc(layoutDocRef);
  
  if (layoutDoc.exists()) {
    return { id: layoutDoc.id, ...layoutDoc.data() };
  } else {
    throw new Error('Layout não encontrado');
  }
};

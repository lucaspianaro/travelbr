import { db, auth } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// Função para obter todos os custos associados a uma viagem
export const getCostsByTravelId = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const costsCollectionRef = collection(travelDocRef, 'custos');
  const snapshot = await getDocs(costsCollectionRef);

  const costs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return costs;
};

// Função para adicionar um novo custo a uma viagem
export const addCost = async (travelId, cost) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const costsCollectionRef = collection(travelDocRef, 'custos');

  const costWithTimestamp = {
    ...cost,
    dataAdicionado: new Date().toISOString(), // Adiciona timestamp
  };

  const costDoc = await addDoc(costsCollectionRef, costWithTimestamp);
  return { id: costDoc.id, ...costWithTimestamp };
};

// Função para atualizar um custo existente
export const updateCost = async (travelId, costId, updatedCost) => {
  const userId = auth.currentUser.uid;
  const costDocRef = doc(db, 'usuarios', userId, 'viagens', travelId, 'custos', costId);

  const costWithTimestamp = {
    ...updatedCost,
    dataAtualizado: new Date().toISOString(), // Adiciona timestamp de atualização
  };

  return await updateDoc(costDocRef, costWithTimestamp);
};

// Função para deletar um custo de uma viagem
export const deleteCost = async (travelId, costId) => {
  const userId = auth.currentUser.uid;
  const costDocRef = doc(db, 'usuarios', userId, 'viagens', travelId, 'custos', costId);
  return await deleteDoc(costDocRef);
};

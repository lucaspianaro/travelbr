import { db, auth } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';

// Função para adicionar um novo veículo ao Firestore
export const addVehicle = async (vehicle) => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const vehicleCollectionRef = collection(userDocRef, 'veiculos');
  const dataAdicionado = new Date().toISOString();
  return await addDoc(vehicleCollectionRef, { ...vehicle, estaAtivo: true, dataExclusao: null, dataAdicionado });
};

// Função para atualizar os dados de um veículo específico no Firestore
export const updateVehicle = async (vehicleId, vehicleData) => {
  const userId = auth.currentUser.uid;
  const vehicleDocRef = doc(db, 'usuarios', userId, 'veiculos', vehicleId);
  return await updateDoc(vehicleDocRef, vehicleData);
};

// Função para marcar um veículo como inativo no Firestore (exclusão lógica)
export const deleteVehicle = async (vehicleId) => {
  const userId = auth.currentUser.uid;
  const vehicleDocRef = doc(db, 'usuarios', userId, 'veiculos', vehicleId);
  const dataExclusao = Timestamp.now();
  return await updateDoc(vehicleDocRef, { estaAtivo: false, dataExclusao });
};

// Função para obter todos os veículos ativos do Firestore
export const getAllVehicles = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const vehicleCollectionRef = collection(userDocRef, 'veiculos');
  const q = query(vehicleCollectionRef, where('estaAtivo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Função para verificar se a placa do veículo é única no Firestore
export const checkVehiclePlateUnique = async (placa, vehicleId = null) => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const vehicleCollectionRef = collection(userDocRef, 'veiculos');
  const q = query(vehicleCollectionRef, where('placa', '==', placa), where('estaAtivo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.empty || (vehicleId && snapshot.docs[0].id === vehicleId);
};

// Função para obter todas as viagens associadas a um veículo específico no Firestore
export const getVehicleTravels = async (vehicleId) => {
  try {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, 'usuarios', userId);
    const travelCollectionRef = collection(userDocRef, 'viagens');
    const q = query(travelCollectionRef, where('veiculoId', '==', vehicleId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar viagens do veículo:', error);
    throw error;
  }
};

// Função para verificar se há conflitos de viagens para um veículo específico no Firestore
export const checkVehicleTravelConflict = async (vehicleId, dataIda, horarioIda, dataRetorno, horarioRetorno) => {
  try {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, 'usuarios', userId);
    const travelCollectionRef = collection(userDocRef, 'viagens');
    const q = query(travelCollectionRef, where('veiculoId', '==', vehicleId));
    const snapshot = await getDocs(q);
    const newTravelStart = new Date(`${dataIda}T${horarioIda}`);
    const newTravelEnd = new Date(`${dataRetorno}T${horarioRetorno}`);

    for (const doc of snapshot.docs) {
      const travel = doc.data();
      
      // Ignora viagens com status 'Cancelada' ou 'Encerrada'
      if (travel.status === 'Cancelada' || travel.status === 'Encerrada') {
        continue;
      }

      const travelStart = new Date(`${travel.dataIda}T${travel.horarioIda}`);
      const travelEnd = new Date(`${travel.dataRetorno}T${travel.horarioRetorno}`);

      // Verifica se há sobreposição entre as novas datas/horários da viagem e as viagens existentes
      if ((newTravelStart >= travelStart && newTravelStart <= travelEnd) ||
          (newTravelEnd >= travelStart && newTravelEnd <= travelEnd) ||
          (newTravelStart <= travelStart && newTravelEnd >= travelEnd)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar conflito de viagens:', error);
    throw error;
  }
};

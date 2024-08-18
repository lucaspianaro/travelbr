// TravelService.js
import { db, auth } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, query, where, updateDoc, getDoc, writeBatch, orderBy, limit } from 'firebase/firestore';
import { getReservationsByTravelId } from './OrderService';

// Função para obter o status da viagem baseado nas datas de ida e retorno
const getStatus = (travel) => {
  const now = new Date();
  const startDate = new Date(travel.dataIda + "T" + travel.horarioIda);
  let endDate = new Date(travel.dataRetorno + "T" + travel.horarioRetorno);
  const thirtyDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);

  if (travel.somenteIda) {
    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 24 horas após a data e horário de ida
  }

  if (travel.status === 'Cancelada') {
    return 'Cancelada';
  }
  if (startDate > thirtyDaysFromNow) {
    return 'Criada';
  } else if (startDate <= now && endDate >= now) {
    return 'Em andamento';
  } else if (startDate > now && startDate <= thirtyDaysFromNow) {
    return 'Próxima';
  } else if (endDate < now) {
    return 'Encerrada';
  }
  return 'Indefinido';
};

// Função para adicionar uma nova viagem
export const addTravel = async (travel) => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const travelCollectionRef = collection(userDocRef, 'viagens');
  const travelWithStatus = { ...travel, status: getStatus(travel), estaAtivo: true };
  return await addDoc(travelCollectionRef, travelWithStatus);
};

// Função para atualizar uma viagem
export const updateTravel = async (travelId, travelData) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const dataToUpdate = { ...travelData, status: getStatus(travelData) };
  if (!dataToUpdate.hasOwnProperty('estaAtivo')) {
    dataToUpdate.estaAtivo = true;
  }
  return await updateDoc(travelDocRef, dataToUpdate);
};

// Função para deletar (inativar) uma viagem
export const deleteTravel = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  return await updateDoc(travelDocRef, {
    estaAtivo: false,
    deletedAt: new Date()
  });
};

// Função para cancelar uma viagem e todas as suas reservas e pedidos
export const cancelTravel = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  return await updateDoc(travelDocRef, { status: 'Cancelada' });
};

// Função para obter todas as viagens ativas
export const getAllTravels = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const travelCollectionRef = collection(userDocRef, 'viagens');
  const q = query(travelCollectionRef, where('estaAtivo', '==', true));
  const snapshot = await getDocs(q);
  const travels = await Promise.all(snapshot.docs.map(async (doc) => {
    const travel = { id: doc.id, ...doc.data() };
    if (travel.veiculoId) {
      const vehicle = await getVehicleById(travel.veiculoId);
      travel.veiculo = vehicle;
    }
    return travel;
  }));

  for (const travel of travels) {
    const newStatus = getStatus(travel);
    if (newStatus !== travel.status) {
      await updateDoc(doc(travelCollectionRef, travel.id), { status: newStatus });
      travel.status = newStatus;
    }
  }
  return travels;
};

// Função para obter uma viagem pelo ID
export const getTravelById = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const docSnap = await getDoc(travelDocRef);

  if (docSnap.exists()) {
    const travel = { id: docSnap.id, ...docSnap.data() };
    travel.assentosAndar1 = parseInt(travel.assentosAndar1, 10);
    travel.assentosAndar2 = parseInt(travel.assentosAndar2, 10);
    const status = getStatus(travel);
    if (travel.status !== status) {
      await updateDoc(travelDocRef, { status });
      travel.status = status;
    }
    if (travel.veiculoId) {
      const vehicle = await getVehicleById(travel.veiculoId);
      travel.veiculo = vehicle;
    }
    return travel;
  } else {
    throw new Error('No travel found with this ID');
  }
};

// Função para obter um veículo pelo ID
export const getVehicleById = async (vehicleId) => {
  const userId = auth.currentUser.uid;
  const vehicleDocRef = doc(db, 'usuarios', userId, 'veiculos', vehicleId);
  const vehicleSnapshot = await getDoc(vehicleDocRef);
  return vehicleSnapshot.exists() ? vehicleSnapshot.data() : null;
};

// Função para verificar se o identificador da viagem é único
export const checkTravelIdentifierUnique = async (identifier) => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const travelCollectionRef = collection(userDocRef, 'viagens');
  const q = query(travelCollectionRef, where("identificador", "==", identifier));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

// Função para validar mudança de veículo
export const validateSeatChange = async (travelId, newVehicleId) => {
  try {
    const newVehicle = await getVehicleById(newVehicleId);
    if (!newVehicle) {
      throw new Error('Veículo não encontrado');
    }

    const totalSeats = parseInt(newVehicle.quantidadeAssentos, 10);
    const reservations = await getReservationsByTravelId(travelId);

    const invalidReservations = reservations.filter(reservation => reservation.number > totalSeats);

    if (invalidReservations.length > 0) {
      const invalidSeats = invalidReservations.map(reservation => reservation.number).join(', ');
      return `Existem reservas em assentos que não existem no novo ônibus. Assentos inválidos: ${invalidSeats}`;
    }

    return null; // No issues found, validation passed
  } catch (error) {
    console.error('Erro ao validar mudança de veículo:', error);
    throw error;
  }
};

// Função para obter o maior identificador de viagem
export const getMaxTravelIdentifier = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const travelCollectionRef = collection(userDocRef, 'viagens');
  const q = query(travelCollectionRef, orderBy('identificador', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return 0; // Nenhum identificador existe, iniciar a partir de 0
  } else {
    return parseInt(snapshot.docs[0].data().identificador, 10);
  }
};

// Função para atualizar viagens inativas
export const updateInactiveTravels = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, 'usuarios', userId);
  const travelCollectionRef = collection(userDocRef, 'viagens');
  const snapshot = await getDocs(travelCollectionRef);
  const now = new Date();

  const promises = snapshot.docs.map(async (doc) => {
    const travel = doc.data();
    const endDate = new Date(travel.dataRetorno + "T" + travel.horarioRetorno);
    const diffTime = Math.abs(now - endDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if ((travel.status === 'Encerrada' || travel.status === 'Cancelada') && diffDays > 365) {
      await updateDoc(doc.ref, { estaAtivo: false });
    }
  });

  await Promise.all(promises);
};

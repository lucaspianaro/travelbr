import { db } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, updateDoc, query, orderBy, where, writeBatch, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { cancelReservation } from './OrderService';

// Obtém a instância de autenticação do Firebase
const auth = getAuth();

// Obtém a referência do documento do usuário autenticado
const getUserDocRef = () => doc(db, 'usuarios', auth.currentUser.uid);

// Adiciona um novo passageiro à coleção de passageiros do usuário
export const addPassenger = async (passenger) => {
  const userId = auth.currentUser.uid;
  const userDocRef = getUserDocRef();
  const passengerCollectionRef = collection(userDocRef, 'passageiros');
  
  passenger = await checkAndUpdateAdultStatus(passenger);
  
  return await addDoc(passengerCollectionRef, {
    ...passenger,
    estaAtivo: true,
    dataAdicionado: new Date().toISOString(),
    dataExclusao: null
  });
};

// Atualiza os dados de um passageiro específico
export const updatePassenger = async (passengerId, passengerData) => {
  try {
    const passengerDocRef = doc(getUserDocRef(), 'passageiros', passengerId);
    
    passengerData = await checkAndUpdateAdultStatus(passengerData);
    
    await updateDoc(passengerDocRef, passengerData);
  } catch (error) {
    console.error("Failed to update passenger:", error);
    throw error;
  }
};

// Exclui um ou mais passageiros, marcando-os como inativos e cancelando suas reservas
export const deletePassengers = async (passengerIds) => {
  try {
    const batch = writeBatch(db);
    const deletionDate = new Date().toISOString();

    for (const id of passengerIds) {
      const passengerDocRef = doc(getUserDocRef(), 'passageiros', id);

      // Cancela as reservas deste passageiro
      const reservations = await getPassengerReservations(id);
      for (const reservation of reservations) {
        await cancelReservation(reservation.travelId, reservation.orderId, reservation.id);
      }

      // Marca o passageiro como inativo
      batch.update(passengerDocRef, { estaAtivo: false, dataExclusao: deletionDate });
    }

    await batch.commit();
  } catch (error) {
    console.error("Failed to delete passengers:", error);
    throw error;
  }
};

// Função para obter dados de um passageiro pelo ID
export const getPassengerById = async (passengerId) => {
  try {
    const passengerDocRef = doc(getUserDocRef(), 'passageiros', passengerId);
    const passengerSnapshot = await getDoc(passengerDocRef);

    if (passengerSnapshot.exists()) {
      return { id: passengerSnapshot.id, ...passengerSnapshot.data() };
    } else {
      throw new Error('Passageiro não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar dados do passageiro:', error);
    throw error;
  }
};

// Obtém todos os passageiros ativos do usuário, ordenados por data de adição
export const getAllPassengers = async (sortOrder = 'desc') => {
  try {
    const passengerCollectionRef = collection(getUserDocRef(), 'passageiros');
    const queryActive = query(passengerCollectionRef, where("estaAtivo", "==", true), orderBy("dataAdicionado", sortOrder));
    const snapshot = await getDocs(queryActive);
    
    const passengers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Verificar e atualizar o status de menor de idade
    const updatedPassengers = await Promise.all(passengers.map(checkAndUpdateAdultStatus));
    
    return updatedPassengers;
  } catch (error) {
    console.error("Failed to fetch passengers:", error);
    throw error;
  }
};

// Função para verificar se o passageiro atingiu 18 anos ou mais
const checkAndUpdateAdultStatus = async (passenger) => {
  const today = new Date();
  const birthDate = new Date(passenger.dataNascimento);
  const m = today.getMonth() - birthDate.getMonth();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  const menorDeIdade = age < 18;

  if (passenger.menorDeIdade !== menorDeIdade) {
    const passengerDocRef = doc(getUserDocRef(), 'passageiros', passenger.id);
    await updateDoc(passengerDocRef, { menorDeIdade });
  }

  return { ...passenger, menorDeIdade };
};

export const getPassengerReservations = async (passengerId) => {
  try {
    const userDocRef = getUserDocRef();
    const travelCollectionRef = collection(userDocRef, 'viagens');
    const travelsSnapshot = await getDocs(travelCollectionRef);
    const reservations = [];

    for (const travelDoc of travelsSnapshot.docs) {
      const travelId = travelDoc.id;
      const ordersCollectionRef = collection(travelDoc.ref, 'pedidos');
      const ordersSnapshot = await getDocs(ordersCollectionRef);

      for (const orderDoc of ordersSnapshot.docs) {
        const orderId = orderDoc.id;
        const reservationCollectionRef = collection(orderDoc.ref, 'reservas');
        const reservationSnapshot = await getDocs(reservationCollectionRef);

        reservationSnapshot.docs.forEach((reservationDoc) => {
          const reservationData = reservationDoc.data();
          if (reservationData.passengerId === passengerId) {
            reservations.push({
              id: reservationDoc.id,
              ...reservationData,
              travelId,
              orderId,
            });
          }
        });
      }
    }

    return reservations;
  } catch (error) {
    console.error('Erro ao buscar reservas do passageiro:', error);
    throw error;
  }
};
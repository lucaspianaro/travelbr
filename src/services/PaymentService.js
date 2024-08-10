import { db, auth } from '../firebaseConfig';
import { collection, doc, getDocs, query, where, getDoc } from 'firebase/firestore';

// Função para determinar o status de uma reserva baseado no status do pedido
const getReservationStatus = (reservation, order) => {
  if (reservation.status === 'Cancelada' || order.status === 'Cancelada') {
    return 'Cancelada';
  }
  return order.detalhesPagamento?.valorRestante > 0 ? 'Pagamento pendente' : 'Pago';
};

// Função para obter todas as reservas
export const getAllReservations = async () => {
  const userId = auth.currentUser.uid; // Obtém o ID do usuário atual
  const userDocRef = doc(db, 'usuarios', userId); // Referência ao documento do usuário
  const travelCollectionRef = collection(userDocRef, 'viagens'); // Referência à coleção de viagens do usuário
  const travelSnapshot = await getDocs(travelCollectionRef); // Busca todos os documentos de viagens

  const allReservations = []; // Array para armazenar todas as reservas
  const passengerMap = new Map(); // Mapa para armazenar dados dos passageiros

  // Busca todos os passageiros uma vez
  const passengerCollectionRef = collection(db, 'usuarios', userId, 'passageiros');
  const passengersSnapshot = await getDocs(passengerCollectionRef);
  passengersSnapshot.docs.forEach(doc => {
    const passengerData = doc.data();
    passengerMap.set(doc.id, { id: doc.id, ...passengerData });
  });

  // Itera sobre todas as viagens
  for (const travelDoc of travelSnapshot.docs) {
    const travelData = travelDoc.data();

    // Filtra viagens que não estão ativas
    if (!travelData.estaAtivo) continue;

    const travelId = travelDoc.id;
    const ordersCollectionRef = collection(travelDoc.ref, 'pedidos'); // Referência à coleção de pedidos
    const ordersSnapshot = await getDocs(ordersCollectionRef); // Busca todos os pedidos da viagem

    // Itera sobre todos os pedidos
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const detalhesPagamento = orderData.detalhesPagamento || {}; // Detalhes do pagamento do pedido
      const reservationCollectionRef = collection(orderDoc.ref, 'reservas'); // Referência à coleção de reservas
      const reservationSnapshot = await getDocs(reservationCollectionRef); // Busca todas as reservas do pedido

      // Itera sobre todas as reservas
      reservationSnapshot.docs.forEach((doc) => {
        const reservationData = doc.data();
        const passengerId = reservationData.passengerId;
        const passenger = passengerMap.get(passengerId) || null; // Obtém dados do passageiro

        // Define o status da reserva baseado no pedido
        const status = getReservationStatus(reservationData, orderData);

        // Adiciona a reserva ao array de todas as reservas
        allReservations.push({
          id: doc.id,
          ...reservationData,
          orderId: orderDoc.id,
          detalhesPagamento,
          passenger,
          travelId,
          status
        });
      });
    }
  }

  return allReservations;
};

// Função para obter todos os passageiros
export const getAllPassengers = async () => {
  const userId = auth.currentUser.uid; // Obtém o ID do usuário atual
  const userDocRef = doc(db, 'usuarios', userId); // Referência ao documento do usuário
  const passengerCollectionRef = collection(userDocRef, 'passageiros'); // Referência à coleção de passageiros
  const q = query(passengerCollectionRef, where("estaAtivo", "==", true)); // Consulta para buscar apenas passageiros ativos
  const snapshot = await getDocs(q); // Executa a consulta
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Mapeia os dados dos passageiros
};

// Função para obter uma viagem pelo ID
export const getTravelById = async (travelId) => {
  const userId = auth.currentUser.uid; // Obtém o ID do usuário atual
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId); // Referência ao documento da viagem
  const travelDoc = await getDoc(travelDocRef); // Busca o documento da viagem
  const travelData = travelDoc.data();
  
  // Retorna os dados da viagem se existir e estiver ativa
  return travelDoc.exists() && travelData.estaAtivo ? { id: travelDoc.id, ...travelData } : null;
};

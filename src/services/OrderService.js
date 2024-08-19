import { db, auth } from '../firebaseConfig';
import { collection, doc, addDoc, getDocs, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { getPassengerById } from './PassengerService';

// Função para manipular o status de pedidos e reservas
const updateOrderAndReservationStatus = async (orderDocRef) => {
  const reservationsCollectionRef = collection(orderDocRef, 'reservas');
  const reservationsSnapshot = await getDocs(reservationsCollectionRef);

  let allReservationsCancelled = true;
  const orderDoc = await getDoc(orderDocRef);
  const orderData = orderDoc.data();

  const valorTotal = Number(orderData.detalhesPagamento?.valorTotal || 0);
  const valorPago = Number(orderData.detalhesPagamento?.valorPago || 0);
  const valorRestante = valorTotal - valorPago;

  reservationsSnapshot.forEach((reservationDoc) => {
    const reservation = reservationDoc.data();
    
    if (reservation.status !== 'Cancelada') {
      allReservationsCancelled = false;
    }
  });

  let newOrderStatus = 'Indefinido';

  if (allReservationsCancelled) {
    newOrderStatus = 'Cancelada';
  } else if (valorRestante > 0) {
    newOrderStatus = 'Pagamento Pendente';
  } else if (valorPago === valorTotal && valorRestante === 0) {
    newOrderStatus = 'Pago';
  }

  await updateDoc(orderDocRef, { status: newOrderStatus });

  // Atualiza o status de todas as reservas, exceto as canceladas
  const batch = writeBatch(db);
  reservationsSnapshot.forEach((reservationDoc) => {
    const reservation = reservationDoc.data();
    if (reservation.status !== 'Cancelada') {
      const reservationDocRef = doc(reservationsCollectionRef, reservationDoc.id);
      batch.update(reservationDocRef, { status: newOrderStatus });
    }
  });

  await batch.commit();
};

// Função para adicionar um pedido
export const addOrder = async (order) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', order.travelId);
  const ordersCollectionRef = collection(travelDocRef, 'pedidos');
  const orderDoc = await addDoc(ordersCollectionRef, order);
  return orderDoc.id;
};

// Função para atualizar um pedido
export const updateOrder = async (orderId, orderData) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', orderData.travelId);
  const orderDocRef = doc(travelDocRef, 'pedidos', orderId);
  await updateDoc(orderDocRef, orderData);
  await updateOrderAndReservationStatus(orderDocRef); // Atualizar status após a atualização do pedido
};

// Função para cancelar um pedido
export const cancelOrder = async (travelId, orderId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const orderDocRef = doc(travelDocRef, 'pedidos', orderId);

  const reservationsCollectionRef = collection(orderDocRef, 'reservas');
  const reservationsSnapshot = await getDocs(reservationsCollectionRef);

  const batch = writeBatch(db);

  reservationsSnapshot.forEach((reservationDoc) => {
    const reservationDocRef = doc(reservationsCollectionRef, reservationDoc.id);
    batch.update(reservationDocRef, { status: 'Cancelada' });
  });

  batch.update(orderDocRef, { status: 'Cancelada' });

  await batch.commit();
};

// Função para adicionar uma reserva
export const addReservation = async (orderId, reservation) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', reservation.travelId);
  const ordersCollectionRef = doc(travelDocRef, 'pedidos', orderId);
  const reservationCollectionRef = collection(ordersCollectionRef, 'reservas');
  const reservationDoc = await addDoc(reservationCollectionRef, reservation);
  await updateOrderAndReservationStatus(ordersCollectionRef); // Atualizar status após adicionar a reserva
  return reservationDoc.id;
};

// Função para atualizar uma reserva
export const updateReservation = async (reservationId, reservation) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', reservation.travelId);
  const ordersCollectionRef = doc(travelDocRef, 'pedidos', reservation.orderId);
  const reservationDocRef = doc(ordersCollectionRef, 'reservas', reservationId);

  if (!reservationId || !reservation.travelId || !reservation.orderId) {
    console.error('Error updating reservation: Missing reservationId, travelId, or orderId');
    throw new Error('Invalid reservation data');
  }

  await updateDoc(reservationDocRef, reservation);
  await updateOrderAndReservationStatus(ordersCollectionRef); // Atualizar status após a atualização da reserva
};

// Função para cancelar uma reserva
export const cancelReservation = async (travelId, orderId, reservationId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const orderDocRef = doc(travelDocRef, 'pedidos', orderId);
  const reservationDocRef = doc(orderDocRef, 'reservas', reservationId);

  await updateDoc(reservationDocRef, { status: 'Cancelada' });

  await updateOrderAndReservationStatus(orderDocRef); // Atualizar status após o cancelamento da reserva
};

// Função para obter todas as reservas por ID de viagem
export const getReservationsByTravelId = async (travelId) => {
  try {
    const userId = auth.currentUser.uid;
    const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
    const ordersCollectionRef = collection(travelDocRef, 'pedidos');
    const ordersSnapshot = await getDocs(ordersCollectionRef);

    const allReservations = [];

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const reservationCollectionRef = collection(orderDoc.ref, 'reservas');
      const reservationSnapshot = await getDocs(reservationCollectionRef);

      for (const doc of reservationSnapshot.docs) {
        const reservationData = doc.data();
        const status = reservationData.status || orderData.status;

        allReservations.push({
          id: doc.id,
          ...reservationData,
          orderId: orderDoc.id,
          detalhesPagamento: orderData.detalhesPagamento,
          status,
        });
      }

      await updateOrderAndReservationStatus(orderDoc.ref); // Atualizar status do pedido após obter as reservas
    }
    return allReservations;
  } catch (error) {
    console.error('Erro ao buscar reservas por ID de viagem:', error);
    throw error;
  }
};

// Função para obter todos os assentos disponíveis
export const getAvailableSeats = async (travelId, quantidadeAssentos = 40) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const ordersCollectionRef = collection(travelDocRef, 'pedidos');
  const ordersSnapshot = await getDocs(ordersCollectionRef);

  const reservedSeats = [];
  for (const orderDoc of ordersSnapshot.docs) {
    const reservationCollectionRef = collection(orderDoc.ref, 'reservas');
    const reservationSnapshot = await getDocs(reservationCollectionRef);
    reservationSnapshot.docs.forEach((doc) => {
      if (doc.data().status !== 'Cancelada') {
        reservedSeats.push(doc.data().numeroAssento);
      }
    });
  }

  const allSeats = Array.from({ length: quantidadeAssentos }, (_, i) => ({ id: i + 1, number: i + 1 }));

  return allSeats;
};

// Função para obter todos os assentos reservados
export const getReservedSeats = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const ordersCollectionRef = collection(travelDocRef, 'pedidos');
  const ordersSnapshot = await getDocs(ordersCollectionRef);

  const reservedSeats = [];
  for (const orderDoc of ordersSnapshot.docs) {
    const reservationCollectionRef = collection(orderDoc.ref, 'reservas');
    const reservationSnapshot = await getDocs(reservationCollectionRef);
    
    for (const doc of reservationSnapshot.docs) {
      const reservationData = doc.data();
      const passengerId = reservationData.passengerId;
      const passengerInfo = await getPassengerById(passengerId); // Obter dados completos do passageiro
      
      reservedSeats.push({
        number: reservationData.numeroAssento,
        status: reservationData.status,
        passenger: passengerInfo
      });
    }
  }

  return reservedSeats;
};

// Função para obter um pedido pelo ID
export const getOrderById = async (travelId, orderId) => {
  if (!travelId || !orderId) {
    throw new Error('travelId ou orderId não fornecido');
  }

  const userId = auth.currentUser.uid;
  const orderDocRef = doc(db, 'usuarios', userId, 'viagens', travelId, 'pedidos', orderId);
  
  const orderSnapshot = await getDoc(orderDocRef);
  if (orderSnapshot.exists()) {
    const order = { id: orderSnapshot.id, ...orderSnapshot.data() };
    const reservationCollectionRef = collection(orderDocRef, 'reservas');
    const reservationSnapshot = await getDocs(reservationCollectionRef);
    order.reservations = reservationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    await updateOrderAndReservationStatus(orderDocRef); // Atualizar status do pedido após obter as reservas

    return order;
  } else {
    throw new Error('Pedido não encontrado');
  }
};

// Função para obter todos os pedidos por ID de viagem
export const getOrdersByTravelId = async (travelId) => {
  const userId = auth.currentUser.uid;
  const travelDocRef = doc(db, 'usuarios', userId, 'viagens', travelId);
  const ordersCollectionRef = collection(travelDocRef, 'pedidos');
  const ordersSnapshot = await getDocs(ordersCollectionRef);

  const orders = [];

  for (const orderDoc of ordersSnapshot.docs) {
    const orderData = { id: orderDoc.id, ...orderDoc.data() };
    const reservationCollectionRef = collection(orderDoc.ref, 'reservas');
    const reservationSnapshot = await getDocs(reservationCollectionRef);

    // Adicionar as reservas ao pedido
    orderData.reservations = reservationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Opcional: Atualizar o status do pedido e suas reservas se necessário
    await updateOrderAndReservationStatus(orderDoc.ref);

    orders.push(orderData);
  }

  return orders;
};


  export const getReservationById = async (travelId, orderId, reservationId) => {
    if (!travelId || !orderId || !reservationId) {
      throw new Error('travelId, orderId, ou reservationId não fornecido');
    }
  
    const userId = auth.currentUser.uid;
    const reservationDocRef = doc(db, 'usuarios', userId, 'viagens', travelId, 'pedidos', orderId, 'reservas', reservationId);
    
    const reservationSnapshot = await getDoc(reservationDocRef);
    if (reservationSnapshot.exists()) {
      const reservation = { id: reservationSnapshot.id, ...reservationSnapshot.data() };
      
      // Obter o pedido ao qual a reserva está associada
      const orderDocRef = doc(db, 'usuarios', userId, 'viagens', travelId, 'pedidos', orderId);
      const orderSnapshot = await getDoc(orderDocRef);
      
      if (orderSnapshot.exists()) {
        const orderData = { id: orderSnapshot.id, ...orderSnapshot.data() };
        reservation.detalhesPagamento = orderData.detalhesPagamento;
        reservation.orderStatus = orderData.status;
      }
  
      // Obter informações do passageiro associado à reserva
      const passengerInfo = await getPassengerById(reservation.passengerId);
      reservation.passengerInfo = passengerInfo;
  
      return reservation;
    } else {
      throw new Error('Reserva não encontrada');
    }
  };
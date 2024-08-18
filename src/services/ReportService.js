import { getAllTravels } from './TravelService';
import { getReservationsByTravelId } from './OrderService';

// Função principal para buscar os dados dos relatórios de viagens
export const getTravelReportData = async (year) => {
  try {
    const travels = await getAllTravels();
    const activeTravels = filterTravelsByYearAndStatus(travels, year, 'active');
    const cancelledTravels = filterTravelsByYearAndStatus(travels, year, 'cancelled');
    const reservations = await fetchAllReservations(travels);

    const monthlyTrips = aggregateMonthlyTrips(activeTravels);
    const monthlyCancelledTrips = aggregateMonthlyTrips(cancelledTravels);
    const monthlyReservations = aggregateMonthlyReservations(reservations, year);
    const popularDestinations = aggregatePopularDestinations(reservations, activeTravels);
    const availableYears = getAvailableYears(travels);

    return { monthlyTrips, monthlyCancelledTrips, monthlyReservations, popularDestinations, availableYears };
  } catch (error) {
    console.error('Erro ao buscar dados do relatório:', error);
    throw error;
  }
};

// Função para filtrar viagens por ano e status
const filterTravelsByYearAndStatus = (travels, year, status) => {
  return travels.filter(travel => {
    const travelYear = new Date(travel.dataIda).getFullYear();
    const isCancelled = travel.status === 'Cancelada';
    if (status === 'active') {
      return travelYear === year && !isCancelled;
    }
    if (status === 'cancelled') {
      return travelYear === year && isCancelled;
    }
    return false;
  });
};

// Função para buscar todas as reservas de todas as viagens
const fetchAllReservations = async (travels) => {
  const allReservations = [];
  for (const travel of travels) {
    const reservations = await getReservationsByTravelId(travel.id);
    allReservations.push(...reservations);
  }
  return allReservations;
};

// Função para agregar o número de viagens por mês
const aggregateMonthlyTrips = (viagens) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const result = months.map(month => ({ month, viagens: 0 }));

  viagens.forEach(trip => {
    const tripDate = new Date(trip.dataIda + "T" + trip.horarioIda);
    const monthName = months[tripDate.getMonth()];
    const monthData = result.find(data => data.month === monthName);
    if (monthData) {
      monthData.viagens += 1;
    }
  });

  return result;
};

// Função para agregar o número de reservas por mês
const aggregateMonthlyReservations = (reservations, year) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const result = months.map(month => ({ month, reservas: 0, reservasCanceladas: 0 }));

  reservations.forEach(reservation => {
    const reservationDate = new Date(reservation.criadoEm);
    if (reservationDate.getFullYear() === year) {
      const monthName = months[reservationDate.getMonth()];
      const monthData = result.find(data => data.month === monthName);
      if (monthData) {
        if (reservation.status === 'Cancelada') {
          monthData.reservasCanceladas += 1;
        } else {
          monthData.reservas += 1;
        }
      }
    }
  });

  return result;
};

// Função para agregar destinos populares com base nas reservas
const aggregatePopularDestinations = (reservations, travels) => {
  const destinationCount = {};

  travels.forEach(travel => {
    const travelReservations = reservations.filter(reservation => reservation.travelId === travel.id && reservation.status !== 'Cancelada');
    if (travelReservations.length > 0) {
      if (destinationCount[travel.destino]) {
        destinationCount[travel.destino] += travelReservations.length;
      } else {
        destinationCount[travel.destino] = travelReservations.length;
      }
    }
  });

  return Object.keys(destinationCount).map(destino => ({
    destination: destino,
    count: destinationCount[destino]
  })).sort((a, b) => b.count - a.count);
};

// Função para obter os anos disponíveis nas viagens
const getAvailableYears = (travels) => {
  const years = travels.map(travel => new Date(travel.dataIda).getFullYear());
  return [...new Set(years)].sort((a, b) => b - a);
};

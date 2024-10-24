import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Fade, IconButton, Snackbar, Alert, Button, Dialog, DialogContent, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../common/Layout';
import PassengerSelection from './PassengerSelection';
import PaymentDetailsForm from './PaymentDetailsForm';
import PaymentRecords from './PaymentRecords';
import PassengerForm from '../passengers/PassengerForm';
import SeatChangeDialog from './SeatChangeDialog';
import { getTravelById, getVehicleById } from '../../services/TravelService';
import { getAllPassengers } from '../../services/PassengerService';
import { addOrder, updateOrder, getOrderById, addReservation, updateReservation, getReservationsByTravelId, getAvailableSeats, getReservedSeats } from '../../services/OrderService';
import { validarCPF, unformatCPF } from '../../utils/utils';
import { getLayoutById } from '../../services/LayoutService';

const PassengerAllocation = () => {
  const { travelId } = useParams();
  const location = useLocation();
  const { selectedSeats = [], editingReservation, editingOrderId, previousPage } = location.state || {};
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true); // Novo estado para controle de carregamento dos dados principais

  const initialReservation = {
    nomePagador: '',
    cpfPagador: '',
    rgPagador: '',
    metodoPagamento: '',
    valorTotal: '',
    valorPago: '0',
    valorRestante: '0',
    informacoesAdicionais: ''
  };

  const sortReservationsBySeatNumber = (reservations) => {
    return reservations.sort((a, b) => a.numeroAssento - b.numeroAssento);
  };

  const [reservations, setReservations] = useState(() => {
    const initialReservations = editingReservation
      ? Array.isArray(editingReservation)
        ? [...editingReservation]
        : [{ ...editingReservation }]
      : (Array.isArray(selectedSeats) ? selectedSeats : []).map((seat) => ({
        numeroAssento: seat.number,
        passengerId: null,
        pagador: false
      }));
    return sortReservationsBySeatNumber(initialReservations);
  });

  const [detalhesPagamento, setPaymentDetails] = useState(
    editingReservation && Array.isArray(editingReservation) && editingReservation[0].detalhesPagamento
      ? editingReservation[0].detalhesPagamento
      : initialReservation
  );
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [existingReservations, setExistingReservations] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openSeatSelectionDialog, setOpenSeatSelectionDialog] = useState(false);
  const [selectedReservationIndex, setSelectedReservationIndex] = useState(null);
  const [layoutAndar1, setLayoutAndar1] = useState([]);
  const [layoutAndar2, setLayoutAndar2] = useState([]);
  const [editedPassenger, setEditedPassenger] = useState({});
  const [editing, setEditing] = useState(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState(
    new Array(reservations.length).fill(false)
  );
  const [underageWarnings, setUnderageWarnings] = useState(
    new Array(reservations.length).fill(false)
  );
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [availableSeatsAndar1, setAvailableSeatsAndar1] = useState([]);
  const [availableSeatsAndar2, setAvailableSeatsAndar2] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPassengers = useCallback(async () => {
    setLoadingPassengers(true);
    const fetchedPassengers = await getAllPassengers();
    fetchedPassengers.sort((a, b) => a.nome.localeCompare(b.nome));
    setPassengers(fetchedPassengers);
    setLoadingPassengers(false);
  }, []);

  const fetchExistingReservations = async () => {
    try {
      const fetchedReservations = await getReservationsByTravelId(travelId);
      setExistingReservations(fetchedReservations);
    } catch (error) {
      console.error('Erro ao buscar reservas existentes:', error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const order = await getOrderById(travelId, orderId);
      setReservations(sortReservationsBySeatNumber(order.reservations));
      setPaymentDetails(order.detalhesPagamento);
      setPaymentRecords(order.detalhesPagamento.pagamentos || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
    }
  };

  const fetchLayoutByVehicle = async (vehicleId) => {
    try {
      console.log('Buscando layout para o veículo com ID:', vehicleId);

      const vehicleData = await getVehicleById(vehicleId);

      if (vehicleData && vehicleData.layoutId) {
        const layoutData = await getLayoutById(vehicleData.layoutId);
        console.log('Layout obtido para o veículo:', layoutData);
        return layoutData;
      } else {
        throw new Error('Nenhum layoutId associado a este veículo.');
      }
    } catch (err) {
      console.error('Erro ao buscar layout do veículo:', err);
      return { firstFloor: [], secondFloor: [] };
    }
  };


  const fetchSeatData = async () => {
    try {
      const travelData = await getTravelById(travelId);
      const totalSeats = travelData.assentosAndar1 + travelData.assentosAndar2;

      if (travelData.veiculoId) {
        // Chama a função fetchLayoutByVehicle para buscar o layout
        const layoutData = await fetchLayoutByVehicle(travelData.veiculoId);

        setLayoutAndar1(layoutData.firstFloor || []);  // Certifique-se de estar usando a estrutura correta
        setLayoutAndar2(layoutData.secondFloor || []); // Certifique-se de estar usando a estrutura correta
      } else {
        console.error('Nenhum veículo associado à viagem.');
      }

      const allReservedSeats = await getReservedSeats(travelId);
      const activeReservedSeats = allReservedSeats.filter(reservation => reservation.status !== 'Cancelada');

      setReservedSeats(activeReservedSeats);
    } catch (error) {
      console.error('Erro ao buscar dados de assentos:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        window.scrollTo(0, 0);
        setLoadingData(true); // Inicia o estado de carregamento
        await fetchExistingReservations();
        await fetchPassengers();
        await fetchSeatData();
        if (editingOrderId) {
          await fetchOrderDetails(editingOrderId);
        }
      } finally {
        setLoadingData(false); // Finaliza o estado de carregamento
      }
    };
    fetchAllData();
  }, [travelId, editingOrderId, fetchPassengers]);


  const handleInputChange = (index, event, newValue) => {
    const passengerId = newValue ? newValue.id : null;
    const isDuplicate = checkDuplicatePassengerInTrip(
      passengerId,
      reservations[index].id
    );
    const isUnderagePassenger = newValue && newValue.menorDeIdade;

    setDuplicateWarnings((prevWarnings) => {
      const newWarnings = [...prevWarnings];
      newWarnings[index] = isDuplicate;
      return newWarnings;
    });

    setUnderageWarnings((prevWarnings) => {
      const newWarnings = [...prevWarnings];
      newWarnings[index] = isUnderagePassenger;
      return newWarnings;
    });

    setReservations((prevReservations) => {
      const newReservations = [...prevReservations];
      newReservations[index].passengerId = passengerId;
      return sortReservationsBySeatNumber(newReservations);
    });
    validateField(index, 'passengerId', passengerId);
  };

  const validateField = (index, name, value) => {
    let error = '';

    if (name === 'passengerId' && !value) {
      error = 'Passageiro é obrigatório.';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`${index}-${name}`]: error
    }));
  };

  const validatePaymentField = (name, value) => {
    let error = '';

    if (name === 'nomePagador' && (!value.trim() || value.length > 255)) {
      error = 'Nome do pagador é obrigatório e deve ter no máximo 255 caracteres.';
    } else if (name === 'cpfPagador' && (!value.trim() || !validarCPF(unformatCPF(value)))) {
      error = 'CPF do pagador é obrigatório e deve ser válido.';
    } else if (name === 'metodoPagamento' && !value.trim()) {
      error = 'Método de pagamento é obrigatório.';
    } else if (name === 'valorTotal' && parseFloat(value) < 0) {
      error = 'Valor total não pode ser negativo.';
    } else if (name === 'informacoesAdicionais' && value.length > 255) {
      error = 'Informações adicionais de pagamento devem ter no máximo 255 caracteres.';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const isFormValid = () => {
    const passengerDetailsValid = reservations.every(
      (reservation) =>
        reservation.passengerId &&
        Object.keys(errors).every((key) => !errors[key])
    );

    const detalhesPagamentoValid = detalhesPagamento &&
      detalhesPagamento.nomePagador &&
      // Validação para CPF ou passaporte
      (
        (detalhesPagamento.cpfPagador && validarCPF(unformatCPF(detalhesPagamento.cpfPagador))) ||
        (detalhesPagamento.passaportePagador && detalhesPagamento.passaportePagador.trim() !== '')
      ) &&
      detalhesPagamento.metodoPagamento &&
      detalhesPagamento.valorTotal &&
      Object.keys(errors).every((key) => !errors[key]);

    const paymentRecordsValid = !errors.paymentRecord;

    return passengerDetailsValid && detalhesPagamentoValid && paymentRecordsValid;
  };

  const checkDuplicatePassengerInTrip = (
    newPassengerId,
    reservationId = null
  ) => {
    return existingReservations.some(
      (reservation) =>
        reservation.passengerId === newPassengerId &&
        reservation.id !== reservationId &&
        reservation.status !== 'Cancelada'
    );
  };

  const handleAddPaymentRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    setPaymentRecords([
      ...paymentRecords,
      { data: today, valor: '', metodoPagamento: detalhesPagamento.metodoPagamento }
    ]);
  };

  const handlePaymentRecordChange = (index, field, value) => {
    const updatedRecords = [...paymentRecords];
    updatedRecords[index][field] = value;

    if (field === 'valor') {
      const totalPaid = updatedRecords.reduce(
        (total, record) => total + parseFloat(record.valor.replace(',', '.') || 0),
        0
      );
      if (totalPaid > parseFloat(detalhesPagamento.valorTotal.replace(',', '.'))) {
        setSnackbarMessage(
          'O valor total pago não pode exceder o valor total da reserva.'
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      setPaymentDetails((prevDetails) => ({
        ...prevDetails,
        valorPago: totalPaid.toFixed(2),
        valorRestante: (
          parseFloat(prevDetails.valorTotal.replace(',', '.')) - totalPaid
        ).toFixed(2)
      }));
    }

    setPaymentRecords(updatedRecords);
  };

  const handleRemovePaymentRecord = (index) => {
    const updatedRecords = paymentRecords.filter((_, i) => i !== index);
    const valorTotalPago = updatedRecords
      .reduce((total, record) => total + parseFloat(record.valor.replace(',', '.') || 0), 0)
      .toFixed(2);
    setPaymentRecords(updatedRecords);

    setPaymentDetails((prevDetails) => ({
      ...prevDetails,
      valorPago: valorTotalPago,
      valorRestante: (
        parseFloat(prevDetails.valorTotal.replace(',', '.')) - valorTotalPago
      ).toFixed(2)
    }));

    updatedRecords.forEach((record, idx) => validatePaymentField('valor', record.valor));
  };

  const handlePaymentDetailChange = (name, value) => {
    setPaymentDetails((prevDetails) => {
      const updatedDetails = {
        ...prevDetails,
        [name]: value || '', // Define uma string vazia se o valor for undefined
      };
  
      if (name === 'valorTotal') {
        const numericValue = parseFloat(value.replace(',', '.')) || 0;
        updatedDetails.valorRestante = (numericValue - parseFloat(prevDetails.valorPago.replace(',', '.'))).toFixed(2);
      }
  
      return updatedDetails;
    });
  };  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!isFormValid()) {
      setSnackbarMessage('Preencha todos os campos obrigatórios corretamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
  
    setLoading(true);
  
    try {
      let orderId = editingOrderId || null;
  
      const cleanDetalhesPagamento = {
        ...detalhesPagamento,
        passaportePagador: detalhesPagamento.passaportePagador || '', // Garantir que passaportePagador nunca seja undefined
        cpfPagador: detalhesPagamento.cpfPagador || '', // Garantir que cpfPagador também não seja undefined
        rgPagador: detalhesPagamento.rgPagador || '',  // Garantir que rgPagador não seja undefined
        pagamentos: paymentRecords,
      };
  
      if (!orderId) {
        const order = {
          travelId,
          detalhesPagamento: {
            ...cleanDetalhesPagamento,
            criadoEm: new Date().toISOString().split('T')[0],
          }
        };
        orderId = await addOrder(order);
      } else {
        await updateOrder(orderId, {
          travelId,
          detalhesPagamento: {
            ...cleanDetalhesPagamento,
            editadoEm: new Date().toISOString().split('T')[0],
          }
        });
      }
  
      // Processamento das reservas continua como antes
      for (const reservation of reservations) {
        if (reservation.id) {
          await updateReservation(reservation.id, {
            ...reservation,
            travelId,
            orderId,
            editadoEm: new Date().toISOString().split('T')[0]
          });
        } else {
          await addReservation(orderId, {
            ...reservation,
            travelId,
            criadoEm: new Date().toISOString().split('T')[0]
          });
        }
      }
      setSnackbarMessage('Reservas salvas com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      if (previousPage) {
        navigate(previousPage);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error('Erro ao salvar reservas:', err);
      setSnackbarMessage('Erro ao salvar reservas. Por favor, tente novamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };  

  const handleOpenFormDialog = () => {
    setOpenFormDialog(true);
    setEditedPassenger({});
    setEditing(false);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
  };

  const handleOpenSeatSelection = (index) => {
    setSelectedReservationIndex(index);
    setOpenSeatSelectionDialog(true);
  };

  const handleCloseSeatSelection = () => {
    setOpenSeatSelectionDialog(false);
  };

  const currentlyAllocatedSeats = reservations.map(reservation => reservation.numeroAssento);

  const handleSeatChange = (seatNumber) => {
    setReservations((prevReservations) => {
      const newReservations = [...prevReservations];
      if (selectedReservationIndex !== null) {
        newReservations[selectedReservationIndex].numeroAssento = seatNumber;
      }
      return sortReservationsBySeatNumber(newReservations);
    });
    handleCloseSeatSelection();
  };

  const handleRemoveReservation = (index) => {
    if (reservations.length > 1) {
      setReservations((prevReservations) => {
        const newReservations = prevReservations.filter((_, idx) => idx !== index);
        return newReservations;
      });
    }
  };

  const handlePayerChange = (index) => {
    setReservations((prevReservations) => {
      const newReservations = prevReservations.map((reservation, idx) => {
        if (idx === index) {
          reservation.pagador = !reservation.pagador;
        } else {
          reservation.pagador = false;
        }
        return reservation;
      });

      const payerReservation = newReservations.find(
        (reservation) => reservation.pagador
      );
      if (payerReservation) {
        const payerPassenger = passengers.find(
          (passenger) => passenger.id === payerReservation.passengerId
        );
        if (payerPassenger) {
          setPaymentDetails((prevDetails) => ({
            ...prevDetails,
            nomePagador: payerPassenger.nome,
            cpfPagador: payerPassenger.cpf,
            rgPagador: payerPassenger.rg,
            passaportePagador: payerPassenger.passaporte
          }));
        }
      } else {
        setPaymentDetails((prevDetails) => ({
          ...prevDetails,
          nomePagador: '',
          cpfPagador: '',
          rgPagador: '',
          passaportePagador: ''
        }));
      }

      return sortReservationsBySeatNumber(newReservations);
    });
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {loadingData ? (
          <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', // Centraliza horizontalmente
            alignItems: 'flex-start', // Alinha os itens no topo
            height: 'auto', // Define a altura como automática
            marginTop: '20px', // Adiciona uma margem superior para afastar do topo, ajuste conforme necessário
          }}
        >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Fade in={true}>
              <IconButton onClick={() => navigate(previousPage || -1)} sx={{ mb: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Fade>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alocar Passageiros</Typography>
                <form onSubmit={handleSubmit} noValidate>
                  <Box sx={{ mb: 3 }}>
                    <PassengerSelection
                      reservations={reservations}
                      passengers={passengers}
                      duplicateWarnings={duplicateWarnings}
                      underageWarnings={underageWarnings}
                      loadingPassengers={loadingPassengers}
                      handleInputChange={handleInputChange}
                      handlePayerChange={handlePayerChange}
                      handleOpenFormDialog={handleOpenFormDialog}
                      handleOpenSeatSelection={handleOpenSeatSelection}
                      handleRemoveReservation={handleRemoveReservation}
                      editingReservation={editingReservation}
                    />
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <PaymentDetailsForm
                      detalhesPagamento={detalhesPagamento}
                      handlePaymentDetailChange={handlePaymentDetailChange}
                      errors={errors}
                      validatePaymentField={validatePaymentField}
                    />
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <PaymentRecords
                      paymentRecords={paymentRecords}
                      handlePaymentRecordChange={handlePaymentRecordChange}
                      handleRemovePaymentRecord={handleRemovePaymentRecord}
                      handleAddPaymentRecord={handleAddPaymentRecord}
                      detalhesPagamento={detalhesPagamento} // Passado como prop
                      setErrors={setErrors} // Passar setErrors para atualizações
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button color="cancelar" variant="contained"sx={{ borderRadius: '50px' }} onClick={() => navigate(previousPage || -1)}>
                      {editingReservation ? 'Descartar Alterações' : 'Voltar'}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!isFormValid() || loading}
                      startIcon={loading && <CircularProgress size={20} />}
                      sx={{ borderRadius: '50px' }}
                    >
                      {editingReservation
                        ? reservations.length > 1 ? 'Atualizar Reservas' : 'Atualizar Reserva'
                        : reservations.length > 1 ? 'Salvar Reservas' : 'Salvar Reserva'}
                    </Button>
                  </Box>
                </form>
                {errors.form && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Dialog
              open={openFormDialog}
              onClose={handleCloseFormDialog}
              aria-labelledby="form-dialog-title"
            >
              <DialogContent>
                <PassengerForm
                  editedPassenger={editedPassenger}
                  setEditedPassenger={setEditedPassenger}
                  errors={errors}
                  setErrors={setErrors}
                  handleCloseFormDialog={handleCloseFormDialog}
                  fetchPassageiros={fetchPassengers}
                  editing={editing}
                  passageiros={passengers}
                  setOpenSnackbar={setSnackbarOpen}
                  setSnackbarMessage={setSnackbarMessage}
                />
              </DialogContent>
            </Dialog>
            <SeatChangeDialog
              open={openSeatSelectionDialog}
              onClose={handleCloseSeatSelection}
              currentSeat={selectedReservationIndex !== null ? reservations[selectedReservationIndex].numeroAssento : null}
              layoutAndar1={layoutAndar1}  // Passa o layout do 1º andar
              layoutAndar2={layoutAndar2}  // Passa o layout do 2º andar
              reservedSeats={reservedSeats}
              allocatedSeats={currentlyAllocatedSeats}
              onSeatChange={handleSeatChange}
            />
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity={snackbarSeverity}
                sx={{ width: '100%' }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default PassengerAllocation;

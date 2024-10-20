import React, { useState, useEffect } from 'react';
import { Box, IconButton, Snackbar, Alert, Typography, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import CostForm from '../components/travelCosts/CostForm';
import CostList from '../components/travelCosts/CostList';
import CostSummary from '../components/travelCosts/CostSummary';
import { getCostsByTravelId, addCost, updateCost, deleteCost } from '../services/TravelCostsService';
import { getOrdersByTravelId } from '../services/OrderService';

const TravelCosts = () => {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const [costs, setCosts] = useState([]);
  const [orders, setOrders] = useState([]); // Estado para pedidos
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    type: '',
    date: new Date().toISOString().substring(0, 10), // Define data atual automaticamente
    paymentMethod: ''
  });
  const [editingCost, setEditingCost] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [totalCosts, setTotalCosts] = useState(0);
  const [totalReceivings, setTotalReceivings] = useState(0);
  const [totalOrderReceived, setTotalOrderReceived] = useState(0); // Novo estado para valor recebido dos pedidos
  const [totalOrderReceivable, setTotalOrderReceivable] = useState(0); // Novo estado para valor a receber dos pedidos
  const [loading, setLoading] = useState(true); // Estado de carregamento

  const paymentMethods = ['Dinheiro', 'Cartão', 'Transferência', 'Pix', 'Outro'];
  const transactionTypes = ['Custo', 'Recebimento'];

  // Carregar custos e pedidos ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const costsData = await getCostsByTravelId(travelId);
        const ordersData = await getOrdersByTravelId(travelId); // Buscar os pedidos
        setCosts(costsData);
        setOrders(ordersData); // Salvar pedidos no estado
        calculateTotals(costsData, ordersData); // Calcular totais
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false); // Finalizar o estado de carregamento após os dados serem carregados
      }
    };
    fetchData();
  }, [travelId]);

  // Função para calcular totais de custos, recebimentos e valores a receber
  const calculateTotals = (costsData, ordersData) => {
    const totalCost = costsData.filter(cost => cost.type === 'Custo').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalReceiving = costsData.filter(cost => cost.type === 'Recebimento').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    // Filtrar pedidos que não estejam com o status "Cancelada"
    const validOrders = ordersData.filter(order => order.status !== 'Cancelada');

    // Calcular valores recebidos e a receber a partir dos pedidos válidos
    const orderReceived = validOrders.reduce((acc, order) => acc + parseFloat(order.detalhesPagamento.valorPago || 0), 0);
    const orderReceivable = validOrders.reduce((acc, order) => acc + parseFloat(order.detalhesPagamento.valorRestante || 0), 0);

    setTotalCosts(totalCost);
    setTotalReceivings(totalReceiving + orderReceived); // Soma os recebimentos de custos e pedidos válidos
    setTotalOrderReceived(orderReceived); // Valor total já recebido de pedidos válidos
    setTotalOrderReceivable(orderReceivable); // Valor total a receber de pedidos válidos
  };

  // Adicionar um novo custo
  const handleAddCost = async () => {
    if (!newCost.description || !newCost.amount || !newCost.type || !newCost.date || !newCost.paymentMethod) {
      setSnackbarMessage('Por favor, preencha todos os campos.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      const addedCost = await addCost(travelId, newCost);
      const updatedCosts = [...costs, addedCost];
      setCosts(updatedCosts);
      calculateTotals(updatedCosts, orders); // Atualizar totais após adicionar custo
      setNewCost({
        description: '',
        amount: '',
        type: '',
        date: new Date().toISOString().substring(0, 10), // Reseta a data para a data atual
        paymentMethod: ''
      });
      setSnackbarMessage('Transação adicionada com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Erro ao adicionar transação.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  // Iniciar a edição de um custo
  const handleEditClick = (cost) => {
    setEditingCost(cost);
  };

  // Atualizar um custo existente
  const handleUpdateCost = async () => {
    try {
      if (!editingCost.description || !editingCost.amount || !editingCost.type || !editingCost.date || !editingCost.paymentMethod) {
        setSnackbarMessage('Por favor, preencha todos os campos antes de salvar.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }
      await updateCost(travelId, editingCost.id, editingCost);
      const updatedCosts = costs.map((cost) => (cost.id === editingCost.id ? editingCost : cost));
      setCosts(updatedCosts);
      calculateTotals(updatedCosts, orders); // Atualizar totais após a edição
      setEditingCost(null);
      setSnackbarMessage('Transação atualizada com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setSnackbarMessage('Erro ao atualizar transação.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  // Excluir um custo
  const handleDeleteCost = async (costId) => {
    try {
      await deleteCost(travelId, costId);
      const updatedCosts = costs.filter((cost) => cost.id !== costId);
      setCosts(updatedCosts);
      calculateTotals(updatedCosts, orders); // Atualizar totais após exclusão
      setSnackbarMessage('Transação excluída com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Erro ao excluir transação.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  // Cancelar a edição de um custo
  const handleCancelEdit = () => {
    setEditingCost(null);
  };

  // Navegar de volta para a página anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5">Gerenciamento de Custos e Recebimentos</Typography>
          </Box>

          <CostSummary 
            totalCosts={totalCosts}
            totalReceivings={totalReceivings}
            totalOrderReceived={totalOrderReceived}
            totalOrderReceivable={totalOrderReceivable} />
        </Box>

        <CostForm
          newCost={newCost}
          setNewCost={setNewCost}
          handleAddCost={handleAddCost}
          transactionTypes={transactionTypes}
          paymentMethods={paymentMethods}
        />

        <CostList
          costs={costs}
          editingCost={editingCost}
          setEditingCost={setEditingCost}
          handleEditClick={handleEditClick}
          handleUpdateCost={handleUpdateCost}
          handleCancelEdit={handleCancelEdit}
          handleDeleteCost={handleDeleteCost}
          transactionTypes={transactionTypes}
          paymentMethods={paymentMethods}
          totalOrderReceived={totalOrderReceived}
          totalOrderReceivable={totalOrderReceivable} 
        />

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default TravelCosts;

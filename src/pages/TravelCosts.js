import React, { useState, useEffect } from 'react';
import { Box, IconButton, Snackbar, Alert, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import CostForm from '../components/travelCosts/CostForm';
import CostList from '../components/travelCosts/CostList';
import CostSummary from '../components/travelCosts/CostSummary';
import { getCostsByTravelId, addCost, updateCost, deleteCost } from '../services/TravelCostsService';

const TravelCosts = () => {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const [costs, setCosts] = useState([]);
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    type: '',
    date: new Date().toISOString().substring(0, 10),
    paymentMethod: ''
  });
  const [editingCost, setEditingCost] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [totalCosts, setTotalCosts] = useState(0);
  const [totalReceivings, setTotalReceivings] = useState(0);

  const paymentMethods = ['Dinheiro', 'Cartão', 'Transferência', 'Pix', 'Outro'];
  const transactionTypes = ['Custo', 'Recebimento'];

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const data = await getCostsByTravelId(travelId);
        setCosts(data);
        calculateTotals(data);
      } catch (error) {
        console.error('Erro ao buscar custos:', error);
      }
    };
    fetchCosts();
  }, [travelId]);

  const calculateTotals = (data) => {
    const totalCost = data.filter(cost => cost.type === 'Custo').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalReceiving = data.filter(cost => cost.type === 'Recebimento').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    setTotalCosts(totalCost);
    setTotalReceivings(totalReceiving);
  };

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
      calculateTotals(updatedCosts);
      setNewCost({
        description: '',
        amount: '',
        type: '',
        date: new Date().toISOString().substring(0, 10),
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

  const handleEditClick = (cost) => {
    setEditingCost(cost);
  };

  const handleUpdateCost = async () => {
    try {
      // Verifica se todos os campos estão preenchidos corretamente
      if (!editingCost.description || !editingCost.amount || !editingCost.type || !editingCost.date || !editingCost.paymentMethod) {
        setSnackbarMessage('Por favor, preencha todos os campos antes de salvar.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }
  
      // Chama a função de atualização no serviço
      await updateCost(travelId, editingCost.id, editingCost);
  
      // Atualiza a lista de custos no estado local
      const updatedCosts = costs.map((cost) => (cost.id === editingCost.id ? editingCost : cost));
      setCosts(updatedCosts);
      calculateTotals(updatedCosts);
      setEditingCost(null);
  
      // Exibe a mensagem de sucesso
      setSnackbarMessage('Transação atualizada com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setSnackbarMessage('Erro ao atualizar transação.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleDeleteCost = async (costId) => {
    try {
      await deleteCost(travelId, costId);
      const updatedCosts = costs.filter((cost) => cost.id !== costId);
      setCosts(updatedCosts);
      calculateTotals(updatedCosts);
      setSnackbarMessage('Transação excluída com sucesso!');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Erro ao excluir transação.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingCost(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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

          <CostSummary totalCosts={totalCosts} totalReceivings={totalReceivings} />
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

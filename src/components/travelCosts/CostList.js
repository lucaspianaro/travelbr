import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  MenuItem,
  TextField,
  InputAdornment,
  Collapse,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Save, Cancel, Search, FilterList as FilterListIcon, MonetizationOn, Payment } from '@mui/icons-material';
import { formatDate } from '../../utils/utils'; // Importando a função formatDate

const ITEMS_PER_PAGE = 5; // Definir quantos itens mostrar por página

const CostList = ({
  costs,
  editingCost,
  setEditingCost,
  handleUpdateCost,
  handleCancelEdit,
  handleDeleteCost,
  handleEditClick,
  transactionTypes,
  paymentMethods,
  totalOrderReceived,  // Adicionado: Total já recebido dos pedidos
  totalOrderReceivable // Adicionado: Total a receber dos pedidos
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Controla a página atual
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca por descrição
  const [filterType, setFilterType] = useState(''); // Filtro por tipo de transação
  const [filterPaymentMethod, setFilterPaymentMethod] = useState(''); // Filtro por método de pagamento
  const [filtersVisible, setFiltersVisible] = useState(false); // Controla a visibilidade dos filtros

  // Função para lidar com a troca de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Função para aplicar a busca e filtros
  const applyFilters = () => {
    return costs
      .filter((cost) =>
        cost.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((cost) => (filterType ? cost.type === filterType : true))
      .filter((cost) =>
        filterPaymentMethod ? cost.paymentMethod === filterPaymentMethod : true
      );
  };

  const filteredCosts = applyFilters();

  // Calcular o índice inicial e final dos itens a serem exibidos na página atual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCosts = filteredCosts.slice(startIndex, endIndex); // Itens da página atual

  return (
    <Box sx={{ mt: 4 }}>
      {/* Exibição dos Valores dos Pedidos em Estilo Compacto */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          Valores referentes aos pedidos da viagem
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
          {/* Valor Recebido de Pedidos */}
          <Tooltip title="Valor já recebido dos pedidos" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MonetizationOn color='success' sx={{ fontSize: 20}} />
              <Typography variant="body2">
                <strong>Recebido:</strong> R$ {totalOrderReceived.toFixed(2)}
              </Typography>
            </Box>
          </Tooltip>

          {/* Valor a Receber de Pedidos */}
          <Tooltip title="Valor ainda a receber dos pedidos" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Payment sx={{ fontSize: 20, color: '#1e88e5' }} />
              <Typography variant="body2">
                <strong>A Receber:</strong> R$ {totalOrderReceivable.toFixed(2)}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      {/* Botão para Expandir ou Contrair Filtros */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h6">Transações</Typography>
        <IconButton onClick={() => setFiltersVisible(!filtersVisible)}>
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* Filtros e Campo de Busca */}
      <Collapse in={filtersVisible}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Buscar por Descrição"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Filtrar por Tipo"
            select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
          >
            <MenuItem value="">Todos</MenuItem>
            {transactionTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Filtrar por Método de Pagamento"
            select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
          >
            <MenuItem value="">Todos</MenuItem>
            {paymentMethods.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Collapse>

      {/* Tabela de Transações */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Descrição</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Valor</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Data</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Método de Pagamento</TableCell>
              <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCosts.map((cost) => (
              <TableRow key={cost.id}>
                {editingCost?.id === cost.id ? (
                  <>
                    <TableCell>
                      <TextField
                        label="Descrição"
                        value={editingCost.description}
                        onChange={(e) =>
                          setEditingCost({ ...editingCost, description: e.target.value })
                        }
                        sx={{ width: '100%' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Valor"
                        type="number"
                        value={editingCost.amount}
                        onChange={(e) =>
                          setEditingCost({ ...editingCost, amount: e.target.value })
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">R$</InputAdornment>
                          ),
                        }}
                        sx={{ width: '100%' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Data"
                        type="date"
                        value={editingCost.date}
                        onChange={(e) =>
                          setEditingCost({ ...editingCost, date: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: '100%' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Tipo"
                        select
                        value={editingCost.type}
                        onChange={(e) =>
                          setEditingCost({ ...editingCost, type: e.target.value })
                        }
                        sx={{ width: '100%' }}
                      >
                        {transactionTypes.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Método de Pagamento"
                        select
                        value={editingCost.paymentMethod}
                        onChange={(e) =>
                          setEditingCost({ ...editingCost, paymentMethod: e.target.value })
                        }
                        sx={{ width: '100%' }}
                      >
                        {paymentMethods.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={handleUpdateCost}>
                        <Save />
                      </IconButton>
                      <IconButton color="secondary" onClick={handleCancelEdit}>
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>R${cost.amount}</TableCell>
                    <TableCell>{formatDate(cost.date)}</TableCell> {/* Formatando a data com formatDate */}
                    <TableCell>{cost.type}</TableCell>
                    <TableCell>{cost.paymentMethod}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditClick(cost)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCost(cost.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={Math.ceil(filteredCosts.length / ITEMS_PER_PAGE)} // Total de páginas
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          sx={{ borderRadius: '50px' }}
        />
      </Box>
    </Box>
  );
};

export default CostList;

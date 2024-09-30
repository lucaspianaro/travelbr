import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Tooltip, IconButton, Divider, Avatar, Grid, Collapse } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { formatDate, formatCPF } from '../../utils/utils';

const OrderCard = ({ order, travel, onEditOrder, onCancelOrder, onCardClick, hideTravelInfo }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e) => {
    e.stopPropagation(); // Evita disparar o onCardClick ao clicar no botão de expandir
    setExpanded(!expanded);
  };

  const detalhesPagamento = order.detalhesPagamento || {};
  const valorTotal = Number(detalhesPagamento.valorTotal || 0);
  const valorPago = Number(detalhesPagamento.valorPago || 0);
  const valorRestante = valorTotal - valorPago;

  const seatLabel = order.reservations?.length === 1 ? 'Assento' : 'Assentos';
  const sortedSeats = order.reservations ? order.reservations.map(reservation => reservation.numeroAssento).sort((a, b) => a - b).join(', ') : 'Nenhum assento';

  const orderStatus = order.status;
  const statusColor = orderStatus === 'Pago' ? 'green' : orderStatus === 'Cancelada' ? 'red' : 'gold';

  return (
    <Card
      onClick={() => onCardClick(order)}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
        mb: 1,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ padding: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '75%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: '#191ad2', mr: 2 }}>
                <AttachMoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Pedido: {order.id}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Valor Total: R$ {valorTotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Valor Pago: R$ {valorPago.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Valor Restante: R$ {valorRestante.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {seatLabel}: {sortedSeats}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={`Status: ${orderStatus}`}>
              {orderStatus === 'Pago' ? (
                <CheckCircleIcon sx={{ color: statusColor }} />
              ) : orderStatus === 'Cancelada' ? (
                <CancelIcon sx={{ color: statusColor }} />
              ) : (
                <ErrorIcon sx={{ color: statusColor }} />
              )}
            </Tooltip>

            <Tooltip title="Expandir">
              <IconButton onClick={handleExpandClick}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEditOrder(order); }}>
                <EditIcon />
              </IconButton>
            </Tooltip>

            {orderStatus !== 'Cancelada' && (
              <Tooltip title="Cancelar">
                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onCancelOrder(order.id, order.travelId); }}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 1 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Informações do Pagador:</Typography>
              <Typography variant="body2">Nome: {detalhesPagamento.nomePagador || 'Não informado'}</Typography>
              <Typography variant="body2">CPF: {detalhesPagamento.cpfPagador ? formatCPF(detalhesPagamento.cpfPagador) : 'Não informado'}</Typography>
              <Typography variant="body2">RG: {detalhesPagamento.rgPagador || 'Não informado'}</Typography>
              <Typography variant="body2">Método de Pagamento: {detalhesPagamento.metodoPagamento || 'Não informado'}</Typography>
            </Grid>

            {!hideTravelInfo && travel && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Informações da Viagem:</Typography>
                <Typography variant="body2">Identificador: {travel?.identificador || 'Não informado'}</Typography>
                <Typography variant="body2">Origem: {travel?.origem || 'Não informado'}</Typography>
                <Typography variant="body2">Destino: {travel?.destino || 'Não informado'}</Typography>
                <Typography variant="body2">Data de Ida: {travel?.dataIda ? formatDate(travel.dataIda) : 'Não informada'}</Typography>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default OrderCard;

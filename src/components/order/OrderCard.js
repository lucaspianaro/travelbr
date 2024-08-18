import React from 'react';
import { Card, CardContent, Box, Typography, Tooltip, IconButton, Divider, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { formatDate } from '../../utils/utils';

const OrderCard = ({ order, travel, onEditOrder, onCancelOrder, onCardClick }) => {
  const detalhesPagamento = order.detalhesPagamento || {};
  const valorTotal = Number(detalhesPagamento.valorTotal || 0);
  const valorPago = Number(detalhesPagamento.valorPago || 0);
  const valorRestante = valorTotal - valorPago;

  const seatLabel = order.reservations?.length === 1 ? 'Assento' : 'Assentos';
  const sortedSeats = order.reservations ? order.reservations.map(reservation => reservation.numeroAssento).sort((a, b) => a - b).join(', ') : 'Nenhum assento';

  // Status é diretamente do banco de dados (não calcular manualmente)
  const orderStatus = order.status;

  // Define a cor do status
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
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {seatLabel}: {sortedSeats}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Identificador: {travel?.identificador || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Origem: {travel?.origem || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Destino: {travel?.destino || 'Não informado'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Data de Ida: {travel?.dataIda ? formatDate(travel.dataIda) : 'Não informada'}
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
      </CardContent>
    </Card>
  );
};

export default OrderCard;

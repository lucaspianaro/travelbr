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
        p: { xs: 1, sm: 2 }, // Ajuste do padding para telas menores
      }}
    >
      <CardContent sx={{ padding: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '75%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: '#191ad2', mr: 2, width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } }}>
                <AttachMoneyIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Pedido: {order.id}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, wordBreak: 'break-word' }}>
                  Valor Total: R$ {valorTotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, wordBreak: 'break-word' }}>
                  Valor Pago: R$ {valorPago.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, wordBreak: 'break-word' }}>
                  Valor Restante: R$ {valorRestante.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, wordBreak: 'break-word' }}>
                  {seatLabel}: {sortedSeats}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={`Status: ${orderStatus}`}>
              {orderStatus === 'Pago' ? (
                <CheckCircleIcon sx={{ color: statusColor, fontSize: { xs: 20, sm: 24 } }} />
              ) : orderStatus === 'Cancelada' ? (
                <CancelIcon sx={{ color: statusColor, fontSize: { xs: 20, sm: 24 } }} />
              ) : (
                <ErrorIcon sx={{ color: statusColor, fontSize: { xs: 20, sm: 24 } }} />
              )}
            </Tooltip>

            <Tooltip title="Expandir">
              <IconButton onClick={handleExpandClick}>
                {expanded ? <ExpandLessIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /> : <ExpandMoreIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEditOrder(order); }}>
                <EditIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            </Tooltip>

            {orderStatus !== 'Cancelada' && (
              <Tooltip title="Cancelar">
                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onCancelOrder(order.id, order.travelId); }}>
                  <CancelIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>Informações do Pagador:</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Nome: {detalhesPagamento.nomePagador || 'Não informado'}</Typography>

              {detalhesPagamento.passaportePagador ? (
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Passaporte: {detalhesPagamento.passaportePagador || 'Não informado'}</Typography>
              ) : (
                <>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>CPF: {detalhesPagamento.cpfPagador ? formatCPF(detalhesPagamento.cpfPagador) : 'Não informado'}</Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>RG: {detalhesPagamento.rgPagador || 'Não informado'}</Typography>
                </>
              )}

              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Método de Pagamento: {detalhesPagamento.metodoPagamento || 'Não informado'}</Typography>
            </Grid>

            {!hideTravelInfo && travel && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>Informações da Viagem:</Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Identificador: {travel?.identificador || 'Não informado'}</Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Origem: {travel?.origem || 'Não informado'}</Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Destino: {travel?.destino || 'Não informado'}</Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Data de Ida: {travel?.dataIda ? formatDate(travel.dataIda) : 'Não informada'}</Typography>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default OrderCard;

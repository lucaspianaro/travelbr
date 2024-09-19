import React from 'react';
import { Box, Typography, Divider, Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Alert, Avatar } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatCPF, formatDate } from '../../utils/utils';

const OrderDetails = ({ order, passengers, travel }) => {
  const detalhesPagamento = order.detalhesPagamento || {};
  const valorTotal = Number(detalhesPagamento.valorTotal || 0);
  const valorPago = Number(detalhesPagamento.valorPago || 0);
  const valorRestante = valorTotal - valorPago;

  // Verifica se todas as reservas estão canceladas
  const allReservationsCancelled = order.reservations?.every(reservation => reservation.status === 'Cancelada');
  const status = allReservationsCancelled ? 'Cancelada' : valorRestante > 0 ? 'Pagamento pendente' : 'Pago';
  const statusColor = status === 'Pago' ? 'success' : status === 'Cancelada' ? 'error' : 'warning';

  const activeReservations = order.reservations.filter(reservation => reservation.status !== 'Cancelada');
  const cancelledReservations = order.reservations.filter(reservation => reservation.status === 'Cancelada');

  return (
    <Box key={order.id} sx={{ p: 2, backgroundColor: '#f4f4f4', borderRadius: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
        <Alert severity={statusColor} sx={{ width: 'fit-content', mb: 2, borderRadius: '50px' }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Status:</strong> {status}</Typography>
        </Alert>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #ccc', mb: 2 }}>Informações do Pedido</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Card sx={{ mb: 2, p: 1 }}>
            <CardContent sx={{ paddingBottom: '8px !important' }}>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon color="primary" />
                <Typography variant="body2" sx={{ wordBreak: 'break-word', ml: 1 }}><strong>Pedido ID:</strong> {order.id}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ mb: 2, p: 1 }}>
            <CardContent sx={{ paddingBottom: '8px !important' }}>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon color="primary" />
                <Typography variant="body2" sx={{ wordBreak: 'break-word', ml: 1 }}><strong>Valor Total:</strong> R$ {valorTotal.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ mb: 2, p: 1 }}>
            <CardContent sx={{ paddingBottom: '8px !important' }}>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon color="success" />
                <Typography variant="body2" sx={{ wordBreak: 'break-word', ml: 1 }}><strong>Valor Pago:</strong> R$ {valorPago.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ mb: 2, p: 1 }}>
            <CardContent sx={{ paddingBottom: '8px !important' }}>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon color="error" />
                <Typography variant="body2" sx={{ wordBreak: 'break-word', ml: 1 }}><strong>Valor Restante:</strong> R$ {valorRestante.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {detalhesPagamento.pagamentos && detalhesPagamento.pagamentos.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #ccc', mb: 2, mt: 2 }}>Registros de Pagamentos</Typography>
          <List>
            {detalhesPagamento.pagamentos.map((registro, index) => (
              <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon>
                  <PaymentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Data: ${formatDate(registro.data)}`}
                  secondary={`Valor: R$ ${parseFloat(registro.valor).toFixed(2)}`}
                  sx={{ wordBreak: 'break-word' }}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  <strong>Método:</strong> {registro.metodoPagamento}
                </Typography>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #ccc', mb: 2 }}>Detalhes dos Passageiros</Typography>

      {activeReservations.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Assentos Ativos</Typography>
          {activeReservations.map(reservation => {
            const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
            return (
              <Card key={reservation.id} sx={{ mb: 2, p: 1 }}>
                <CardContent sx={{ paddingBottom: '8px !important' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                      <Box display="flex" flexDirection="column" sx={{ ml: 1 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Assento:</strong> {reservation.numeroAssento}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Nome:</strong> {passenger.nome}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>CPF:</strong> {passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>{passenger.estrangeiro ? 'Passaporte:' : 'RG:'}</strong> {passenger.estrangeiro ? passenger.passaporte : passenger.rg || 'Não informado'}</Typography>
                        {passenger.menorDeIdade && (
                          <Typography variant="body2" color="error" sx={{ wordBreak: 'break-word' }}>
                            <strong>Menor de Idade</strong>
                          </Typography>
                        )}
                        {passenger.estrangeiro && (
                          <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-word' }}>
                            <strong>Estrangeiro</strong>
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      {cancelledReservations.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>Assentos Cancelados</Typography>
          {cancelledReservations.map(reservation => {
            const passenger = passengers.find(p => p.id === reservation.passengerId) || {};
            return (
              <Card key={reservation.id} sx={{ mb: 2, p: 1, backgroundColor: '#f9e6e6' }}>
                <CardContent sx={{ paddingBottom: '8px !important' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                      <Box display="flex" flexDirection="column" sx={{ ml: 1 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Assento:</strong> {reservation.numeroAssento}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Nome:</strong> {passenger.nome}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>CPF:</strong> {passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>{passenger.estrangeiro ? 'Passaporte:' : 'RG:'}</strong> {passenger.estrangeiro ? passenger.passaporte : passenger.rg || 'Não informado'}</Typography>
                        {passenger.menorDeIdade && (
                          <Typography variant="body2" color="error" sx={{ wordBreak: 'break-word' }}>
                            <strong>Menor de Idade</strong>
                          </Typography>
                        )}
                        {passenger.estrangeiro && (
                          <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-word' }}>
                            <strong>Estrangeiro</strong>
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #ccc', mb: 2 }}>Informações da Viagem</Typography>
      <Card sx={{ mb: 2, p: 1 }}>
        <CardContent sx={{ paddingBottom: '8px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    <strong>Identificador:</strong> {travel?.identificador || 'Não informado'}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mt: 1 }}>
                    <strong>Origem:</strong> {travel?.origem || 'Não informado'}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', mt: 1 }}>
                    <strong>Destino:</strong> {travel?.destino || 'Não informado'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <DateRangeIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  <strong>Data de Ida:</strong> {travel?.dataIda ? formatDate(travel.dataIda) : 'Não informado'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  <strong>Horário de Ida:</strong> {travel?.horarioIda || 'Não informado'}
                </Typography>
              </Box>
              {travel?.somenteIda ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', color: 'blue' }}>
                    <strong>Somente Ida</strong>
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <DateRangeIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      <strong>Data de Retorno:</strong> {travel?.dataRetorno ? formatDate(travel.dataRetorno) : 'Não informado'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      <strong>Horário de Retorno:</strong> {travel?.horarioRetorno || 'Não informado'}
                    </Typography>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #ccc', mb: 2 }}>Informações do Pagador</Typography>
      <Card sx={{ mb: 2, p: 1 }}>
        <CardContent sx={{ paddingBottom: '8px !important' }}>
          <Grid container spacing={2}>
            {detalhesPagamento.nomePagador && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Nome do Pagador:</strong> {detalhesPagamento.nomePagador}</Typography>
              </Grid>
            )}
            {detalhesPagamento.cpfPagador && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>CPF do Pagador:</strong> {formatCPF(detalhesPagamento.cpfPagador)}</Typography>
              </Grid>
            )}
            {detalhesPagamento.rgPagador && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>RG do Pagador:</strong> {detalhesPagamento.rgPagador}</Typography>
              </Grid>
            )}
            {detalhesPagamento.metodoPagamento && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Método de Pagamento:</strong> {detalhesPagamento.metodoPagamento}</Typography>
              </Grid>
            )}
            {detalhesPagamento.informacoesAdicionais && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}><strong>Informações Adicionais:</strong> {detalhesPagamento.informacoesAdicionais}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderDetails;

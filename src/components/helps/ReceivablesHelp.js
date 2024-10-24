import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function ReceivablesHelp() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Tooltip title="Ajuda">
                <IconButton onClick={handleOpen} color="cancelar">
                    <HelpIcon />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Ajuda - Gerenciamento de Recebíveis</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Esta página exibe as informações sobre recebíveis e pagamentos pendentes relacionados às reservas e pedidos de viagens. Abaixo estão as instruções para usar corretamente o sistema:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Busca de Pedidos</h2>
                            Utilize a barra de busca para filtrar pedidos por nome do passageiro, CPF, RG, passaporte, ou ID do pedido. Caso a busca esteja ativa, você pode clicar no ícone de "limpar" para resetar o campo de busca.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Filtragem por Mês e Ano</h2>
                            Você pode usar os filtros de mês e ano para limitar os pedidos exibidos, com base na data de ida da viagem. Selecione o mês e o ano desejados no menu suspenso para refinar a exibição.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Informações Totais</h2>
                            <ul>
                                <li><strong>Total a Receber:</strong> Exibe o valor total pendente de pagamento dos pedidos.</li>
                                <li><strong>Total Recebido:</strong> Exibe o valor total já recebido nos pedidos.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Ações em Pedidos</h2>
                            Cada pedido exibe botões de ação:
                            <ul>
                                <li><strong>Editar Pedido:</strong> Permite modificar reservas associadas ao pedido.</li>
                                <li><strong>Cancelar Pedido ou Reserva:</strong> Cancela um pedido completo ou uma reserva individual.</li>
                                <li><strong>Ver Detalhes:</strong> Abre uma janela com os detalhes do pedido e suas reservas associadas.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Paginação</h2>
                            Utilize a paginação na parte inferior da tela para navegar pelos pedidos. A contagem de páginas é ajustada conforme o número de pedidos filtrados.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Cancelamento de Pedidos e Reservas</h2>
                            Ao cancelar um pedido ou reserva:
                            <ul>
                                <li>Uma confirmação será exibida para garantir que a ação não seja realizada por engano.</li>
                                <li>Se a "Senha Master" estiver ativada, será solicitado que você insira a senha antes de confirmar o cancelamento.</li>
                                <li>Após o cancelamento, os valores recebidos associados à reserva ou pedido serão atualizados automaticamente.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Detalhes do Pedido</h2>
                            Ao clicar no botão de "Ver Detalhes", um modal será aberto contendo as informações detalhadas sobre o pedido, como:
                            <ul>
                                <li>Informações dos passageiros associados à reserva.</li>
                                <li>Detalhes de pagamento, incluindo valores pagos e valores pendentes.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>8. Mensagens de Feedback</h2>
                            Após ações como cancelamentos ou edições, uma notificação (Snackbar) será exibida com o resultado da operação. A cor e o ícone da notificação indicam se a operação foi bem-sucedida ou falhou.
                        </Typography>
                    </Box>
                    <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2 }}>
                        Fechar
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

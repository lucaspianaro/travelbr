import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function TravelOrderReservationHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Reservas e Pedidos</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            A página "Gerenciamento de Reservas e Pedidos" permite visualizar, filtrar, editar e cancelar tanto reservas quanto pedidos relacionados a uma viagem. Abaixo estão as funcionalidades e regras de negócio aplicáveis a esta página.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Visualização de Reservas e Pedidos</h2>
                            <ul>
                                <li><strong>Reservas:</strong> São as alocações de assentos feitas para os passageiros na viagem. Cada reserva está vinculada a um passageiro específico e contém detalhes como número de assento e status (pago, pendente ou cancelado).</li>
                                <li><strong>Pedidos:</strong> São as transações que podem incluir uma ou mais reservas associadas. Os pedidos refletem a parte financeira da operação, incluindo detalhes de pagamento, status e pagador.</li>
                                <li>As reservas e pedidos podem ser filtrados e paginados, facilitando a gestão de grandes volumes de dados.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Ações Disponíveis</h2>
                            Nesta página, é possível realizar diversas ações de administração de reservas e pedidos:
                            <ul>
                                <li><strong>Editar Reserva:</strong> Permite modificar as informações de uma reserva, como o número do assento e detalhes do passageiro. Isso é útil quando há necessidade de mudanças nas alocações de assentos.</li>
                                <li><strong>Editar Pedido:</strong> Altera detalhes de um pedido, como os assentos e informações de pagamento. Permite corrigir ou atualizar os dados financeiros e de assento associados a um pedido específico.</li>
                                <li><strong>Cancelar Reserva:</strong> Cancela uma reserva específica, liberando o assento para outra alocação. A reserva passa para o status de "Cancelada", e o assento volta a estar disponível.</li>
                                <li><strong>Cancelar Pedido:</strong> Cancela um pedido inteiro, o que resulta no cancelamento de todas as reservas associadas. Esta ação é irreversível.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Filtros e Pesquisa</h2>
                            A página oferece filtros para facilitar a busca e categorização de reservas e pedidos:
                            <ul>
                                <li><strong>Busca por Nome ou Documento:</strong> Um campo de pesquisa permite buscar reservas ou pedidos por nome de passageiro, CPF, RG, passaporte ou ID do pedido.</li>
                                <li><strong>Filtro de Status de Pagamento:</strong> Filtra as reservas e pedidos pelo status do pagamento, como "Pago", "Pagamento pendente" ou "Cancelada".</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Exportação para PDF</h2>
                            A funcionalidade de exportação para PDF permite gerar relatórios das reservas ou pedidos:
                            <ul>
                                <li><strong>Exportar Reservas:</strong> Exporta um relatório contendo todas as reservas ativas da viagem, organizadas por número de assento.</li>
                                <li><strong>Exportar Pedidos:</strong> Gera um relatório financeiro de todos os pedidos relacionados à viagem, contendo informações de pagamento e status de cada pedido.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Exibição de Detalhes</h2>
                            Ao clicar em uma reserva ou pedido, é exibido um modal contendo os detalhes completos:
                            <ul>
                                <li><strong>Detalhes da Reserva:</strong> Mostra as informações do passageiro, assento e status de pagamento da reserva.</li>
                                <li><strong>Detalhes do Pedido:</strong> Exibe as informações financeiras associadas ao pedido, incluindo o valor pago, valor pendente e detalhes do pagador.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Confirmação de Cancelamento com Senha Master</h2>
                            Se a <strong>Senha Master</strong> estiver ativada, será necessário inseri-la para confirmar o cancelamento de uma reserva ou pedido. Isso adiciona uma camada extra de segurança para evitar cancelamentos acidentais.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Indicador de Processamento</h2>
                            Durante ações sensíveis como cancelamento de reservas ou pedidos, um indicador de carregamento é exibido para que o usuário saiba que a operação está em andamento, evitando cliques repetidos.
                        </Typography>
                    </Box>
                    <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2, borderRadius: '50px'  }}>
                        Fechar
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

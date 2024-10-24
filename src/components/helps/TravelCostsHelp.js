import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function TravelCostsHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Custos e Recebimentos</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            A página "Gerenciamento de Custos e Recebimentos" permite administrar as despesas e recebimentos relacionados a uma viagem. Esta página fornece um resumo financeiro, ferramentas para adicionar e editar transações e visualizar os totais recebidos e a receber.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Visualização de Custos e Recebimentos</h2>
                            Você pode visualizar todos os custos e recebimentos associados a uma viagem. Isso inclui:
                            <ul>
                                <li><strong>Custos:</strong> Despesas associadas à viagem, como combustível, manutenção, etc.</li>
                                <li><strong>Recebimentos:</strong> Entradas financeiras, como pagamentos de pedidos e outras formas de receita.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Resumo Financeiro</h2>
                            O resumo financeiro exibe os totais da viagem:
                            <ul>
                                <li><strong>Total de Custos:</strong> Soma de todas as despesas (Custo) da viagem.</li>
                                <li><strong>Total de Recebimentos:</strong> Soma de todas as receitas e valores recebidos tanto de pedidos quanto de outras fontes (Recebimento).</li>
                                <li><strong>Total Recebido de Pedidos:</strong> Valor total já recebido de pedidos de passageiros.</li>
                                <li><strong>Total a Receber de Pedidos:</strong> Montante que ainda precisa ser pago pelos passageiros, baseado nos pedidos pendentes.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Adicionar Nova Transação</h2>
                            Para adicionar um novo custo ou recebimento:
                            <ul>
                                <li><strong>Descrição:</strong> Detalhe sobre o custo ou recebimento (ex.: "Combustível", "Pagamento de Passageiro").</li>
                                <li><strong>Valor:</strong> O valor da transação.</li>
                                <li><strong>Tipo:</strong> Define se é um "Custo" (despesa) ou "Recebimento" (entrada financeira).</li>
                                <li><strong>Data:</strong> A data da transação (preenchida automaticamente com a data atual, mas pode ser modificada).</li>
                                <li><strong>Método de Pagamento:</strong> Escolha o método de pagamento utilizado (ex.: Dinheiro, Cartão, Pix).</li>
                            </ul>
                            Após preencher todas as informações, clique em <strong>Adicionar</strong> para registrar a transação.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Editar ou Excluir Transações</h2>
                            As transações existentes podem ser editadas ou excluídas:
                            <ul>
                                <li><strong>Editar:</strong> Clique no ícone de edição para modificar os detalhes da transação. Após realizar as mudanças, salve as alterações.</li>
                                <li><strong>Excluir:</strong> Caso uma transação precise ser removida, clique no ícone de exclusão para deletá-la. A exclusão é permanente.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Pedidos de Passageiros</h2>
                            Além de administrar os custos e recebimentos manuais, a página também calcula e exibe os valores recebidos e a receber dos pedidos de passageiros:
                            <ul>
                                <li><strong>Pedidos Válidos:</strong> Somente pedidos que não estão "Cancelados" são contabilizados nos totais.</li>
                                <li><strong>Valor Pago:</strong> Mostra quanto já foi pago pelos passageiros nos pedidos.</li>
                                <li><strong>Valor a Receber:</strong> Exibe quanto ainda falta ser pago nos pedidos pendentes.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Mensagens de Confirmação</h2>
                            Após adicionar, editar ou excluir uma transação, uma mensagem de confirmação será exibida, informando se a ação foi bem-sucedida. Além disso, qualquer erro encontrado também será informado por uma mensagem de alerta.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Indicador de Carregamento</h2>
                            Enquanto os dados estão sendo carregados, um indicador de progresso circular é exibido para informar ao usuário que os dados ainda estão sendo processados.
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

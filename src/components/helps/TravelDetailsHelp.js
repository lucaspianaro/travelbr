import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function TravelDetailsHelp() {
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
                <DialogTitle>Ajuda - Detalhes da Viagem</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            A página "Detalhes da Viagem" é utilizada para gerenciar todas as informações e ações relacionadas a uma viagem específica. Aqui, você pode visualizar detalhes importantes, gerenciar reservas, custos, veículo, assentos e realizar ações administrativas. A seguir estão as principais funcionalidades e regras de negócio que regem essa página:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Visualização dos Detalhes da Viagem</h2>
                            A seção inicial exibe informações cruciais da viagem:
                            <ul>
                                <li><strong>Origem:</strong> Cidade de onde a viagem começa.</li>
                                <li><strong>Destino:</strong> Cidade de destino da viagem.</li>
                                <li><strong>Datas e horários:</strong> Data e hora da partida e, se aplicável, do retorno. Viagens podem ser "somente ida" ou "ida e volta".</li>
                                <li><strong>Veículo:</strong> Veículo associado à viagem, incluindo número de assentos, placa e empresa proprietária.</li>
                                <li><strong>Status da Viagem:</strong> Pode ser "Criada", "Em andamento", "Próxima", "Cancelada", ou "Encerrada". Cada status determina o que pode ser feito na viagem.</li>
                                <li><strong>Assentos Ocupados:</strong> A quantidade de assentos já reservados versus o total disponível no veículo.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Ações Administrativas</h2>
                            Nesta página, é possível realizar várias ações de administração, como:
                            <ul>
                                <li><strong>Editar:</strong> Permite modificar os detalhes da viagem, incluindo as datas, horários, e o veículo associado. Isso é útil caso a viagem precise de ajustes, como mudanças no cronograma ou troca de veículo.</li>
                                <li><strong>Cancelar:</strong> O cancelamento de uma viagem é uma ação irreversível. Ao cancelar, todas as reservas associadas também serão canceladas. A viagem muda seu status para "Cancelada", e nenhum passageiro pode ser alocado ou removido após essa ação.</li>
                                <li><strong>Excluir:</strong> Exclui permanentemente a viagem, removendo também todas as reservas e dados associados. Essa ação só é permitida para viagens que ainda não foram iniciadas ou que estão no status "Criada".</li>
                                <li><strong>Adicionar Veículo:</strong> Se a viagem ainda não tiver um veículo associado, você poderá adicionar um clicando no botão <strong>Adicionar Veículo</strong>. Um veículo é necessário para a alocação de passageiros.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Gerenciamento de Assentos</h2>
                            O layout do veículo é exibido na forma de um mapa de assentos. Aqui você pode:
                            <ul>
                                <li><strong>Assentos Disponíveis:</strong> São aqueles que ainda não foram reservados. Você pode selecionar esses assentos para alocar novos passageiros.</li>
                                <li><strong>Assentos Reservados:</strong> São mostrados como ocupados no layout. Esses assentos já estão atribuídos a um passageiro, e somente podem ser modificados ou liberados se a reserva for cancelada.</li>
                                <li><strong>Assentos por Andar:</strong> Caso o veículo seja de dois andares, o layout mostrará os assentos de ambos os andares, permitindo a visualização e gerenciamento dos dois níveis de assentos.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Visualização de Reservas e Custos</h2>
                            Além dos assentos e detalhes da viagem, você pode gerenciar diretamente:
                            <ul>
                                <li><strong>Reservas:</strong> A página oferece um botão para acessar a lista completa de reservas associadas à viagem. Aqui, você pode ver detalhes dos passageiros e modificar ou cancelar reservas, se necessário.</li>
                                <li><strong>Custos:</strong> A funcionalidade de custos permite visualizar e gerenciar todas as despesas associadas à viagem, como manutenção do veículo, pedágios, combustíveis, e outros encargos operacionais. Clicar em <strong>Custos</strong> abrirá a página dedicada a essa gestão.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Ver Rota no Google Maps</h2>
                            Uma funcionalidade adicional disponível é o botão <strong>Ver Rota no Google Maps</strong>. Ele gera uma rota automática entre a cidade de origem e a cidade de destino, abrindo o Google Maps em uma nova aba com essa rota traçada, facilitando a logística e o planejamento da viagem.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Confirmação de Ações Sensíveis com Senha Master</h2>
                            Algumas ações, como o cancelamento ou exclusão da viagem, requerem a inserção de uma <strong>Senha Master</strong> para confirmação. Isso adiciona uma camada extra de segurança e evita que essas ações críticas sejam realizadas sem autorização apropriada.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Indicador de Processamento</h2>
                            Ao realizar ações sensíveis, como cancelar ou excluir a viagem, um indicador de carregamento é exibido, garantindo que o usuário saiba que a operação está em andamento. Esse feedback visual evita cliques repetidos ou confusões durante a execução de operações mais demoradas.
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

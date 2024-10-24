import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function ReportPageHelp() {
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
                <DialogTitle>Ajuda - Relatórios de Viagens</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Esta página permite visualizar e exportar relatórios detalhados sobre viagens, reservas e destinos populares em diferentes anos. Abaixo estão as instruções de como utilizar a interface:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Seleção de Ano</h2>
                            Utilize o campo de seleção de ano para escolher o ano desejado. A lista de anos disponíveis será exibida com base nos dados que o sistema possui. A seleção do ano atualizará automaticamente os gráficos de viagens, reservas e destinos populares.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Gráficos de Viagens</h2>
                            A primeira seção de gráficos exibe o número de viagens realizadas por mês. Ele também diferencia as viagens canceladas das viagens concluídas:
                            <ul>
                                <li><strong>Viagens:</strong> Linha azul, representa o número de viagens realizadas em cada mês.</li>
                                <li><strong>Viagens Canceladas:</strong> Linha vermelha, representa o número de viagens canceladas em cada mês.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Gráficos de Reservas</h2>
                            O gráfico de barras exibe o número de reservas feitas em cada mês, bem como as reservas canceladas:
                            <ul>
                                <li><strong>Reservas:</strong> Barras verdes, mostram o total de reservas feitas em cada mês.</li>
                                <li><strong>Reservas Canceladas:</strong> Barras vermelhas, mostram o número de reservas que foram canceladas.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Gráficos de Destinos Populares</h2>
                            Este gráfico de pizza mostra os destinos mais populares, baseando-se na quantidade de reservas. Cada fatia da pizza representa um destino, e as cores são diferenciadas para facilitar a visualização:
                            <ul>
                                <li>Ao passar o cursor sobre uma fatia, um tooltip aparecerá exibindo o número de reservas.</li>
                                <li>As fatias são proporcionais ao número de reservas feitas para cada destino.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Exportação para PDF</h2>
                            Utilize o botão "Exportar para PDF" no topo da página para salvar uma cópia dos gráficos em formato PDF. Ao clicar no botão:
                            <ul>
                                <li>Os gráficos serão capturados e exportados, página por página, no formato PDF.</li>
                                <li>O PDF incluirá todas as visualizações atuais da página, para o ano selecionado.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Carregamento de Dados</h2>
                            Enquanto os dados estão sendo carregados, um círculo de progresso será exibido. Aguarde o carregamento para que os gráficos possam ser visualizados corretamente.
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

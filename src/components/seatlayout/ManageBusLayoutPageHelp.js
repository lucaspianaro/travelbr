import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function ManageBusLayoutPageHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Layout de Ônibus</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Esta página permite gerenciar os layouts de assentos dos ônibus. Abaixo estão as instruções detalhadas para usar as funcionalidades disponíveis:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Adicionar Novo Layout</h2>
                            Clique no botão "Adicionar Novo Layout" para criar um novo layout de assentos para um ônibus. Você será redirecionado para o construtor de layout, onde poderá definir a configuração dos assentos.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Buscar e Filtrar Layouts</h2>
                            Para encontrar um layout existente, utilize a barra de busca digitando o ID ou o nome do layout. Se desejar, clique no botão "Mostrar Filtros" para ordenar os layouts pelo número de assentos em ordem crescente ou decrescente.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Editar ou Excluir Layout</h2>
                            Cada layout exibido na lista tem botões de ação:
                            <ul>
                                <li><strong>Editar:</strong> Clique no ícone de edição para modificar o layout de assentos.</li>
                                <li><strong>Excluir:</strong> Clique no ícone de exclusão para remover o layout. Uma confirmação será solicitada antes de concluir a exclusão.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Paginação</h2>
                            Caso existam muitos layouts, a lista será paginada. Use os botões de navegação na parte inferior da página para navegar entre as páginas de layouts.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Notificações</h2>
                            Sempre que uma ação (como criar, editar ou excluir um layout) for realizada, uma notificação será exibida no topo da página, indicando se a operação foi bem-sucedida ou se houve algum erro.
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

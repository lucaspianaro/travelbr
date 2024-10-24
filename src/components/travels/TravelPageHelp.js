import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function TravelPageHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Viagens</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Esta tela permite que você gerencie as viagens, incluindo criar, editar, cancelar e excluir viagens.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Adicionar Viagem</h2>
                            Clique no botão "Adicionar" para abrir o formulário de criação de uma nova viagem. Certifique-se de preencher as informações obrigatórias, como o destino, a data de ida, e caso necessário, a data de retorno.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Editar Viagem</h2>
                            Para editar uma viagem, clique no ícone de edição na viagem que deseja modificar. Isso permitirá alterar detalhes como datas ou status da viagem.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Cancelar Viagem</h2>
                            Para cancelar uma viagem, clique no ícone de cancelamento. Caso a senha master esteja ativa, você deverá inseri-la para confirmar a ação. Reservas associadas também serão canceladas.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Excluir Viagem</h2>
                            Para excluir permanentemente uma viagem, clique no ícone de lixeira. Tenha cuidado, pois essa ação removerá todas as reservas e pedidos relacionados à viagem.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Filtrar e Buscar Viagens</h2>
                            Utilize os campos de busca e filtro para encontrar viagens específicas. Você pode filtrar por status, datas de ida e retorno, ou buscar por qualquer informação relacionada à viagem.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Paginação</h2>
                            Caso existam muitas viagens, utilize a navegação de páginas na parte inferior da tela para visualizar todas as viagens. Você pode ajustar o número de itens por página conforme necessário.
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

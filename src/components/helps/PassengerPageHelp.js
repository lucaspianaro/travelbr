import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help'; // Importando o ícone de ajuda

export default function PassengerPageHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Passageiros</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Este módulo permite gerenciar os passageiros de forma eficiente. Aqui você pode adicionar, editar e excluir passageiros, assim como aplicar filtros de busca para encontrar informações rapidamente.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <h2>1. Adicionar Passageiro</h2>
                            Clique no botão "Adicionar" para abrir o formulário de criação de um novo passageiro. Certifique-se de preencher todos os campos obrigatórios, como nome e data de nascimento, e clique em "Salvar" para registrar o novo passageiro.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <h2>2. Editar Passageiro</h2>
                            Para editar um passageiro existente, localize o passageiro na lista e clique no ícone de edição correspondente. O formulário será preenchido com as informações atuais do passageiro, permitindo que você faça as alterações necessárias.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <h2>3. Excluir Passageiro</h2>
                            Para remover um passageiro da lista, clique no ícone de exclusão ao lado do passageiro desejado. Uma confirmação será solicitada para evitar exclusões acidentais. Confirme a ação para concluir a exclusão.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <h2>4. Filtros</h2>
                            Utilize os filtros disponíveis para restringir a lista de passageiros exibidos. Você pode buscar por informações específicas, como nome ou data de nascimento, e aplicar datas para refinar ainda mais os resultados.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <h2>5. Navegação entre Páginas</h2>
                            Se a lista de passageiros for longa, use a navegação de páginas na parte inferior para percorrer os passageiros de forma eficiente. Você pode selecionar a página desejada para visualizar um conjunto específico de passageiros.
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

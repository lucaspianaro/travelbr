import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function VehiclePageHelp() {
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
                <DialogTitle>Ajuda - Gerenciamento de Veículos</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            O módulo de gerenciamento de veículos permite adicionar, editar, excluir e visualizar detalhes dos veículos utilizados nas viagens. Além disso, você pode aplicar filtros e ordenar a lista de veículos para facilitar o gerenciamento. Abaixo estão as instruções detalhadas de cada funcionalidade disponível na página.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Adicionar Veículo</h2>
                            Para adicionar um novo veículo, clique no botão "Adicionar" no topo da página. Um formulário aparecerá solicitando as informações do veículo, como identificador, placa, empresa, número de assentos, etc. Após preencher os campos, clique em "Salvar" para adicionar o veículo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Editar Veículo</h2>
                            Para editar as informações de um veículo existente, localize o veículo na lista e clique no ícone de edição. O formulário será preenchido com as informações atuais do veículo, permitindo que você faça as alterações necessárias. Após editar, clique em "Salvar" para atualizar as informações.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Excluir Veículo</h2>
                            Para excluir um veículo, clique no ícone de exclusão ao lado do veículo que deseja remover. Se a senha master estiver ativa, você deverá inseri-la para confirmar a exclusão. Uma confirmação aparecerá para evitar exclusões acidentais. Após confirmar, o veículo será permanentemente removido do sistema.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Visualizar Detalhes do Veículo</h2>
                            Clique no cartão do veículo para visualizar seus detalhes completos. A janela de detalhes exibirá todas as informações, incluindo o número de viagens associadas ao veículo e o layout dos assentos. Selecione essa opção para ter uma visão completa do veículo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Filtros e Ordenação</h2>
                            Utilize o botão "Mostrar Filtros" para aplicar filtros de busca e ordenar os veículos. Você pode buscar por identificador, placa ou empresa. Também é possível ordenar os veículos pelo número de assentos em ordem crescente ou decrescente.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Senha Master</h2>
                            Caso a função de Senha Master esteja ativa, ela será exigida para a exclusão de veículos. A senha pode ser visualizada ao clicar no ícone de visibilidade no campo correspondente.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Paginação</h2>
                            A lista de veículos é paginada para facilitar a navegação. Use os controles de paginação na parte inferior da lista para navegar entre as páginas e visualizar todos os veículos cadastrados.
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

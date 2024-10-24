import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function PassengerFormHelp() {
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
                <DialogTitle>Ajuda - Formulário de Passageiros</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Este formulário permite adicionar ou editar informações de passageiros, incluindo dados pessoais, documentos e responsável (caso o passageiro seja menor de idade).
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Preenchimento de Dados Pessoais</h2>
                            O formulário exige que você preencha os dados básicos do passageiro, como nome, data de nascimento e, no caso de brasileiros, CPF e RG. Caso o passageiro seja estrangeiro, o campo de passaporte será habilitado.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Passageiro Menor de Idade</h2>
                            Se o passageiro for menor de idade, você precisará fornecer informações sobre o responsável, como nome, CPF ou passaporte e data de nascimento. O formulário permitirá escolher entre um responsável existente ou criar um novo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Validação de Documentos</h2>
                            Os documentos fornecidos, como CPF, RG ou passaporte, são validados para garantir que não há duplicidade no sistema. Caso o documento já esteja cadastrado, uma mensagem de erro será exibida.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Adicionar ou Atualizar Passageiro</h2>
                            Após preencher todos os campos obrigatórios e garantir que não há erros, você pode adicionar ou atualizar o passageiro clicando no botão "Salvar" ou "Adicionar Passageiro".
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Fechar ou Cancelar</h2>
                            Caso deseje voltar sem salvar, clique no botão "Descartar Alterações" ou "Voltar". Nenhuma alteração será salva nesse caso.
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

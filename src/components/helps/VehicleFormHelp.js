import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function VehicleFormHelp() {
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
                <DialogTitle>Ajuda - Formulário de Veículo</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            O formulário de veículo permite adicionar ou editar veículos no sistema. Abaixo estão as instruções detalhadas para cada campo e funcionalidade do formulário.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Identificador do Veículo</h2>
                            Este campo é obrigatório e deve conter um identificador único para o veículo. O identificador deve ter no máximo 255 caracteres.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Placa do Veículo</h2>
                            A placa do veículo também é um campo obrigatório e deve ser única. O sistema validará automaticamente se a placa já está cadastrada. Caso esteja, será exibido um erro informando que a placa já está em uso.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Empresa do Veículo</h2>
                            Este campo é obrigatório e deve conter o nome da empresa responsável pelo veículo. O nome da empresa deve ter no máximo 255 caracteres.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Associar Layout ao Veículo (Opcional)</h2>
                            Caso deseje, você pode associar um layout ao veículo. O layout determina a configuração de assentos do veículo. Você pode buscar por layouts existentes no sistema ou criar um novo layout clicando no ícone de adição ao lado do campo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Salvar ou Cancelar</h2>
                            Após preencher os campos obrigatórios, clique no botão "Adicionar Veículo" para salvar o novo veículo ou "Salvar Alterações" ao editar um veículo existente. Se desejar cancelar a operação, clique em "Voltar" ou "Descartar Alterações".
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

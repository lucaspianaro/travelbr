import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function MyAccountHelp() {
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
                <DialogTitle>Ajuda - Minha Conta</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            A página de "Minha Conta" permite que você gerencie seu perfil, senha de login e a senha master de segurança. Abaixo estão as instruções detalhadas para cada seção:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Atualizar Perfil</h2>
                            Esta seção permite que você atualize as informações do seu perfil pessoal. Ao clicar no botão "Abrir", o formulário de atualização de perfil será exibido, onde você poderá modificar seus dados e salvar as alterações.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Alteração de Senha</h2>
                            Aqui, você pode alterar a senha de login da sua conta. Basta clicar em "Abrir", preencher o formulário com sua senha atual, nova senha e a confirmação da nova senha, e então salvar as alterações.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Definir Senha Master</h2>
                            A senha master é uma camada extra de segurança para ações sensíveis no sistema. Você pode ativá-la ou desativá-la através do interruptor presente nesta seção:
                            <ul>
                                <li><strong>Ativar:</strong> Ao ativar, a senha master será definida ou atualizada. Você poderá abrir o formulário clicando no botão "Abrir" para definir a nova senha.</li>
                                <li><strong>Desativar:</strong> Para desativar, se uma senha master já estiver definida, você precisará inserir a senha atual para confirmar a desativação.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Confirmação de Desativação da Senha Master</h2>
                            Se você optar por desativar a senha master, um diálogo de confirmação será exibido pedindo a senha master atual. Este processo garante que apenas você pode desativá-la com segurança.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Indicador de Processamento</h2>
                            Durante a confirmação de ações, como a ativação ou desativação da senha master, um círculo de carregamento será exibido enquanto o processo é realizado. Aguarde até que o processo seja concluído antes de tentar realizar outras ações.
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

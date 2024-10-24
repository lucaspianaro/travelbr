import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function BusLayoutBuilderPageHelp() {
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
                <DialogTitle>Ajuda - Construtor de Layout de Ônibus</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            Esta página permite que você crie e edite layouts de assentos para ônibus, permitindo a configuração de assentos, banheiros, escadas e outros itens. Abaixo estão as instruções detalhadas sobre como utilizar as funcionalidades:
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Criar ou Editar Layout</h2>
                            Se estiver criando um layout novo, você pode definir o nome e a estrutura dos assentos e outros componentes do ônibus. Se estiver editando, o layout já existente será carregado, e você poderá modificá-lo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Adicionar Assentos ou Outros Itens</h2>
                            Para adicionar ou editar um assento ou outro item (como banheiro, escada ou frigobar), clique em qualquer célula do layout. Uma janela se abrirá permitindo que você selecione o tipo de item e, se for um assento, defina seu número.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Validação de Assentos</h2>
                            O sistema verifica se os números dos assentos são únicos para garantir que não haja repetição. Além disso, é obrigatório que haja pelo menos um assento no layout para que ele possa ser salvo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Gerenciamento de Andares</h2>
                            <ul>
                                <li><strong>Adicionar Segundo Andar:</strong> Use o botão de "+" para adicionar um segundo andar ao layout.</li>
                                <li><strong>Remover Segundo Andar:</strong> Use o botão de "-" para remover o segundo andar.</li>
                            </ul>
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Adicionar e Remover Fileiras</h2>
                            Utilize os botões "+" e "-" na parte inferior da tela para adicionar ou remover fileiras de assentos. Não é possível remover todas as fileiras — o layout deve ter ao menos uma fileira.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Salvar Layout</h2>
                            Ao finalizar a configuração do layout, clique no botão "Salvar Layout" para armazenar as alterações. Se estiver criando um layout novo, ele será adicionado ao sistema; caso esteja editando, as alterações serão aplicadas ao layout existente.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Legenda</h2>
                            Utilize o ícone de "info" na tela para visualizar a legenda dos ícones de assentos, banheiros, escadas e frigobar.
                        </Typography>
                    </Box>
                    <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2,  borderRadius: '50px' }}>
                        Fechar
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

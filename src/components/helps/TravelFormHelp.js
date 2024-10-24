import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function TravelFormHelp() {
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
                <DialogTitle>Ajuda - Formulário de Viagens</DialogTitle>
                <DialogContent>
                    <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Typography variant="body1" paragraph>
                            O formulário de viagens permite criar e editar viagens, gerenciando os principais detalhes como origem, destino, datas, horários e informações adicionais. A seguir, estão as instruções para cada campo e funcionalidade do formulário.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>1. Identificador da Viagem</h2>
                            Este campo contém um número único que identifica a viagem. O identificador é gerado automaticamente com base no maior número de viagem existente, mas você pode alterá-lo se necessário. O identificador aceita apenas números e tem um limite máximo de 10 dígitos.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>2. Origem e Destino</h2>
                            Utilize os campos "Local de Origem" e "Local de Destino" para definir de onde a viagem sairá e para onde se destina. Esses campos são obrigatórios, e você deve inserir até 55 caracteres em cada campo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>3. Data e Horário de Ida</h2>
                            As informações da "Data de Ida" e "Horário de Ida" são obrigatórias e definem quando a viagem começará. Selecione a data e o horário da viagem de acordo com as informações disponíveis no momento.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>4. Viagem Somente de Ida</h2>
                            Marque a caixa "Viagem Somente de Ida" se a viagem não tiver um retorno. Ao marcar essa opção, os campos "Data de Retorno" e "Horário de Retorno" serão desativados automaticamente.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>5. Data e Horário de Retorno</h2>
                            Se a viagem incluir um retorno, insira a "Data de Retorno" e o "Horário de Retorno". Certifique-se de que a data e o horário de retorno são posteriores à data e horário de ida. Caso contrário, o sistema exibirá um erro.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>6. Seleção de Veículo</h2>
                            No campo "Veículo da Viagem", você pode selecionar o veículo que será utilizado na viagem. Utilize a busca para filtrar por identificador, placa ou empresa do veículo. Caso não encontre o veículo, você pode adicionar um novo clicando no ícone de "+" ao lado do campo.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>7. Assentos Disponíveis</h2>
                            O número de assentos disponíveis no veículo será preenchido automaticamente ao selecionar o veículo. Se houver reservas com assentos que não estão disponíveis no novo veículo, o sistema mostrará uma mensagem de erro.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>8. Informações Adicionais</h2>
                            Utilize o campo de "Informações Adicionais" para descrever detalhes relevantes sobre a viagem, como paradas planejadas, horários alternativos ou outras observações. O limite de caracteres para este campo é 255.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>9. Salvamento da Viagem</h2>
                            Após preencher todos os campos obrigatórios, clique no botão "Salvar" para concluir o cadastro ou a edição da viagem. O sistema validará as informações, e se houver algum erro, ele será destacado em vermelho.
                        </Typography>

                        <Typography variant="body1" paragraph>
                            <h2>10. Voltar ou Descartar Alterações</h2>
                            Caso você deseje sair do formulário sem salvar, clique no botão "Voltar". Se estiver editando uma viagem, você também pode descartar as alterações feitas.
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

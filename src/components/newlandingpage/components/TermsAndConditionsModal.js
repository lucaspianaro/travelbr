import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography } from '@mui/material';

export default function TermsConditionsModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen} variant="text" color="inherit">
        Termos e Condições
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Termos e Condições</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Typography variant="body1" paragraph>
              <h2>1. Termos</h2>
              Ao acessar o site <a href="https://travelbr-9d9f1.web.app">TravelBr</a>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
            </Typography>
            <Typography variant="body1" paragraph>
              <h2>2. Uso de Licença</h2>
              É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site TravelBr, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
              <ul>
                <li>Modificar ou copiar os materiais;</li>
                <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
                <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site TravelBr;</li>
                <li>Remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
                <li>Transferir os materiais para outra pessoa ou "espelhar" os materiais em qualquer outro servidor.</li>
              </ul>
              Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por TravelBr a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrônico ou impresso.
            </Typography>
            <Typography variant="body1" paragraph>
              <h2>3. Isenção de responsabilidade</h2>
              Os materiais no site da TravelBr são fornecidos 'como estão'. TravelBr não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
            </Typography>
            <Typography variant="body1" paragraph>
              <h2>4. Limitações</h2>
              Em nenhum caso o TravelBr ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em TravelBr, mesmo que TravelBr ou um representante autorizado da TravelBr tenha sido notificado da possibilidade de tais danos.
            </Typography>
            <Typography variant="body1" paragraph>
              <h2>5. Precisão dos materiais</h2>
              Os materiais exibidos no site da TravelBr podem incluir erros técnicos, tipográficos ou fotográficos. TravelBr não garante que qualquer material em seu site seja preciso, completo ou atual. TravelBr pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, TravelBr não se compromete a atualizar os materiais.
            </Typography>
            <Typography variant="body1" paragraph>
              <h2>6. Links</h2>
              O TravelBr não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por TravelBr do site. O uso de qualquer site vinculado é por conta e risco do usuário.
            </Typography>
            <Typography variant="body1" paragraph>
              <h3>Modificações</h3>
              O TravelBr pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
            </Typography>
            <Typography variant="body1" paragraph>
              <h3>Lei aplicável</h3>
              Estes termos e condições são regidos e interpretados de acordo com as leis do TravelBr e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquela localidade.
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

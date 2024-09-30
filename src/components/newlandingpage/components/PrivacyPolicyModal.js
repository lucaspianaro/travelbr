import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography } from '@mui/material';

export default function PrivacyPolicyModal() {
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
        Política de Privacidade
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Política de Privacidade</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Typography variant="body1" paragraph>
              A sua privacidade é importante para nós. É política do TravelBr respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="https://travelbr-9d9f1.web.app">TravelBr</a>, e outros sites que possuímos e operamos.
            </Typography>
            <Typography variant="body1" paragraph>
              Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </Typography>
            <Typography variant="body1" paragraph>
              Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </Typography>
            <Typography variant="body1" paragraph>
              Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
            </Typography>
            <Typography variant="body1" paragraph>
              O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas <a href="https://politicaprivacidade.com/">políticas de privacidade</a>.
            </Typography>
            <Typography variant="body1" paragraph>
              Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
            </Typography>
            <Typography variant="body1" paragraph>
              O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contacto connosco.
            </Typography>
            <Typography variant="h6" paragraph>
              Compromisso do Usuário
            </Typography>
            <Typography variant="body1" paragraph>
              O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o TravelBr oferece no site e com caráter enunciativo, mas não limitativo:
            </Typography>
            <ul>
              <li>
                <Typography variant="body1" paragraph>
                  A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do TravelBr, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros sistemas de hardware ou software que sejam capazes de causar danos anteriormente mencionados.
                </Typography>
              </li>
            </ul>
            <Typography variant="h6" paragraph>
              Mais informações
            </Typography>
            <Typography variant="body1" paragraph>
              Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
            </Typography>
            <Typography variant="body1" paragraph>
              Esta política é efetiva a partir de 30 Setembro 2024.
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

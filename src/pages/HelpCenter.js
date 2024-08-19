import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, IconButton, Fade, TextField, InputAdornment, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear'; 
import Layout from '../components/common/Layout';

// Dados das FAQ e Guias do Usuário
const faqData = [
  {
    category: "Guia do Usuário",
    items: [
      {
        title: "Viagens",
        content: (
          <Typography variant="body1" paragraph>
            A funcionalidade de Viagens permite que você planeje e gerencie todas as viagens oferecidas pela sua empresa. Aqui você pode:
            <ul>
              <li>Adicionar novas viagens, definindo itinerários, horários e preços.</li>
              <li>Editar ou excluir viagens existentes conforme necessário.</li>
              <li>Visualizar detalhes completos de cada viagem, incluindo a lista de passageiros e reservas.</li>
              <li>Acompanhar a ocupação de cada viagem para otimizar a alocação de recursos.</li>
            </ul>
          </Typography>
        )
      },
      {
        title: "Passageiros",
        content: (
          <Typography variant="body1" paragraph>
            Na seção de Passageiros, você pode gerenciar todas as informações dos passageiros. Isso inclui:
            <ul>
              <li>Registrar novos passageiros com todos os dados necessários.</li>
              <li>Atualizar informações de passageiros existentes.</li>
              <li>Visualizar o histórico de viagens de cada passageiro.</li>
              <li>Verificar reservas ativas e gerenciar alocações de assentos.</li>
            </ul>
          </Typography>
        )
      },
      {
        title: "Veículos",
        content: (
          <Typography variant="body1" paragraph>
            A funcionalidade de Veículos permite que você controle e gerencie sua frota. Aqui você pode:
            <ul>
              <li>Adicionar novos veículos à frota.</li>
              <li>Verificar a disponibilidade dos veículos para as viagens.</li>
              <li>Associar veículos específicos a determinadas viagens para melhor organização.</li>
            </ul>
          </Typography>
        )
      },
      {
        title: "Reservas",
        content: (
          <Typography variant="body1" paragraph>
            A seção de Reservas é onde você pode gerenciar todas as reservas de assentos feitas pelos passageiros. Aqui você pode:
            <ul>
              <li>Visualizar todas as reservas feitas para cada viagem.</li>
              <li>Confirmar, cancelar ou modificar reservas conforme necessário.</li>
              <li>Verificar a ocupação atual de cada viagem.</li>
              <li>Alocar manualmente passageiros em assentos específicos.</li>
            </ul>
          </Typography>
        )
      },
      {
        title: "Pedidos",
        content: (
          <Typography variant="body1" paragraph>
            Em Pedidos, você pode gerenciar todas as solicitações e pedidos feitos pelos passageiros. Isso inclui:
            <ul>
              <li>Gerenciar pedidos de reservas.</li>
              <li>Alterar reservas existentes conforme solicitado pelos passageiros.</li>
              <li>Tratar de outras solicitações relacionadas às viagens.</li>
              <li>Acompanhar o status de cada pedido para garantir que todos sejam atendidos adequadamente.</li>
            </ul>
          </Typography>
        )
      },
      {
        title: "Relatórios",
        content: (
          <Typography variant="body1" paragraph>
            A seção de Relatórios permite que você acesse e gere relatórios detalhados sobre as operações da sua empresa. Aqui você pode:
            <ul>
              <li>Gerar relatórios de ocupação de viagens.</li>
              <li>Obter análises financeiras sobre vendas e receitas.</li>
            </ul>
          </Typography>
        )
      }
    ]
  },
  {
    category: "Perguntas Frequentes (FAQ)",
    items: [
      {
        title: "Não recebi o email de confirmação de conta ou redefinição de senha",
        content: (
          <Typography variant="body1" paragraph>
            Se você não recebeu o email de confirmação de conta ou redefinição de senha, verifique a sua caixa de spam ou lixeira. Às vezes, esses emails podem ser marcados incorretamente como spam pelo seu provedor de email. Se ainda não encontrar o email, entre em contato com nosso suporte.
          </Typography>
        )
      },
      {
        title: "Como faço para adicionar uma nova viagem?",
        content: (
          <Typography variant="body1" paragraph>
            Para adicionar uma nova viagem, vá para a seção de Viagens no painel de controle. Clique no botão "Adicionar Viagem", preencha os detalhes necessários como itinerário, horários e preços, e salve a viagem. A nova viagem aparecerá na lista de viagens onde você poderá gerenciá-la conforme necessário.
          </Typography>
        )
      },
      {
        title: "Como gerenciar reservas de assentos?",
        content: (
          <Typography variant="body1" paragraph>
            Na seção de Reservas, você pode visualizar todas as reservas feitas para cada viagem. Você pode confirmar, cancelar ou modificar reservas, além de alocar manualmente passageiros em assentos específicos. Utilize os filtros e ferramentas de busca para encontrar rapidamente a reserva que deseja gerenciar.
          </Typography>
        )
      },
      {
        title: "O que é a senha master e como utilizá-la?",
        content: (
          <Typography variant="body1" paragraph>
            A senha master é uma senha especial usada para realizar ações críticas e sensíveis, como excluir veículos ou cancelar viagens. Apenas administradores têm acesso à senha master. Para utilizá-la, insira a senha master no campo designado ao tentar realizar uma ação que requer essa autenticação adicional. Caso você tenha esquecido a senha master ou precise redefini-la, entre em contato com o suporte.
          </Typography>
        )
      }
    ]
  }
];

function HelpCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(faqData);

  // Função para navegar de volta para a página anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  // Função para lidar com a pesquisa
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setLoading(true);

    // Filtra os dados de FAQ com base no termo de pesquisa
    setTimeout(() => {
      const filtered = faqData.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase()) ||
          (typeof item.content.props.children === 'string'
            ? item.content.props.children.toLowerCase().includes(value.toLowerCase())
            : Array.isArray(item.content.props.children) && item.content.props.children.some(child => 
                typeof child === 'string' && child.toLowerCase().includes(value.toLowerCase())
              )
          )
        )
      })).filter(category => category.items.length > 0);

      setFilteredData(filtered);
      setLoading(false);
    }, 500);
  };

  // Função para limpar a pesquisa
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredData(faqData);
  };

  return (
    <Layout showSidebar={true} defaultOpenDrawer={true}>
      <Box sx={{ p: 3 }}>
        <Fade in>
          <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Fade>
        <Container>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Central de Ajuda
            </Typography>
            <Typography variant="body1" paragraph>
              Bem-vindo à Central de Ajuda! Aqui você encontrará respostas para as perguntas mais frequentes e guias para resolver problemas comuns.
            </Typography>
            <TextField
              label="Pesquisar"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loading ? <CircularProgress size={24} /> : (
                      <>
                        {searchTerm && (
                          <IconButton onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        )}
                        <SearchIcon />
                      </>
                    )}
                  </InputAdornment>
                )
              }}
              sx={{ mb: 4 }}
            />
            {filteredData.map((category, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {category.category}
                </Typography>
                {category.items.map((item, idx) => (
                  <Accordion key={idx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">{item.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {item.content}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ))}
            <Box id="contact-support" sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Contato com Suporte
              </Typography>
              <Typography variant="body1" paragraph>
                Se você precisar de assistência adicional, entre em contato com nossa equipe de suporte:
              </Typography>
              <Typography variant="body1" paragraph>
                Email: travelbruepg2024@gmail.com
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}

export default HelpCenter;

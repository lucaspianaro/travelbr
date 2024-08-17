import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Box, Typography, CircularProgress, Paper, useMediaQuery, useTheme, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getTravelReportData } from '../../services/ReportService';
import Layout from '../common/Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5499C7', '#48C9B0', '#F4D03F', '#DC7633', '#AF7AC5'];

const ReportComponent = () => {
  // Estados do componente
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    monthlyTrips: [],
    monthlyCancelledTrips: [],
    monthlyReservations: [],
    popularDestinations: []
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Função para buscar dados do relatório ao montar o componente ou ao mudar o ano
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await getTravelReportData(year);
        const combinedTripsData = mergeData(reportData.monthlyTrips, reportData.monthlyCancelledTrips);
        setData({
          monthlyTrips: combinedTripsData,
          monthlyReservations: reportData.monthlyReservations,
          popularDestinations: reportData.popularDestinations
        });
        setAvailableYears(reportData.availableYears);
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  // Função para mesclar dados de viagens ativas e canceladas
  const mergeData = (active, cancelled) => {
    const merged = active.map((item, index) => ({
      ...item,
      viagensCanceladas: cancelled[index] ? cancelled[index].viagens : 0
    }));
    return merged;
  };

  // Função para alterar o ano selecionado
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Função para exportar gráficos para PDF
  const exportToPDF = async () => {
    const pdf = new jsPDF('landscape');
    const charts = document.querySelectorAll('.chart-container');

    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i];
      const canvas = await html2canvas(chart, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage();
      }

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Relatorio_Viagens_${year}.pdf`);
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Relatórios de Viagens</Typography>

        {/* Seção de seleção de ano e botão de exportação para PDF */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="select-year-label">Ano</InputLabel>
            <Select
              labelId="select-year-label"
              value={year}
              onChange={handleYearChange}
              label="Ano"
            >
              {availableYears.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={exportToPDF}>
            Exportar para PDF
          </Button>
        </Box>

        {/* Gráfico de viagens por mês */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }} className="chart-container">
          <Typography variant="h6" gutterBottom>Viagens por Mês</Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <LineChart data={data.monthlyTrips}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="viagens" stroke="#8884d8" />
              <Line type="monotone" dataKey="viagensCanceladas" stroke="#ff0000" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Gráfico de reservas por mês */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }} className="chart-container">
          <Typography variant="h6" gutterBottom>Reservas feitas em cada Mês</Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart data={data.monthlyReservations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reservas" fill="#82ca9d" />
              <Bar dataKey="reservasCanceladas" fill="#ff0000" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Gráfico de destinos populares */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }} className="chart-container">
          <Typography variant="h6" gutterBottom>Destinos Populares</Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <PieChart>
              <Pie
                data={data.popularDestinations}
                dataKey="count"
                nameKey="destination"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 150}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value} Reservas`}
              >
                {data.popularDestinations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} Reservas`} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ReportComponent;

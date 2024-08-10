import { formatCPF, formatDate, formatDateForFilename } from './utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Função para exportar dados de viagem, pedidos e passageiros para um arquivo PDF.
 * 
 * @param {Object} travel - Objeto contendo os detalhes da viagem.
 * @param {Array} orders - Lista de pedidos associados à viagem.
 * @param {Array} passengers - Lista de passageiros associados aos pedidos.
 */
export const exportOrdersToPDF = (travel, orders, passengers) => {
  const doc = new jsPDF('p', 'pt');

  // Função auxiliar para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return 'Não informado';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Define as colunas e seus títulos
  const columns = [
    { title: "Pedido ID", dataKey: "orderId" },
    { title: "Assentos", dataKey: "numerosAssentos" },
    { title: "Nome do Pagador", dataKey: "nomePagador" },
    { title: "CPF do Pagador", dataKey: "cpfPagador" },
    { title: "RG do Pagador", dataKey: "rgPagador" },
    { title: "Valor Total", dataKey: "valorTotal" },
    { title: "Método de Pagamento", dataKey: "metodoPagamento" },
    { title: "Status", dataKey: "status" },
    { title: "Informações Adicionais", dataKey: "informacoesAdicionais" }
  ];

  // Filtra pedidos cancelados
  const filteredOrders = orders.filter(order => order.status !== 'Cancelada');

  // Prepara os dados para o PDF
  const rows = filteredOrders.map(order => {
    const assentos = order.reservations.map(reservation => reservation.numeroAssento).join(', ');
    const informacoesAdicionais = order.reservations
      .map(reservation => reservation.detalhesPagamento?.informacoesAdicionais)
      .filter(info => info)
      .join('; ');

    const nomePagador = order.detalhesPagamento?.nomePagador || 'Não informado';
    const cpfPagador = order.detalhesPagamento?.cpfPagador ? formatCPF(order.detalhesPagamento.cpfPagador) : 'Não informado';
    const rgPagador = order.detalhesPagamento?.rgPagador || 'Não informado';
    const valorTotal = order.detalhesPagamento?.valorTotal ? `R$ ${Number(order.detalhesPagamento.valorTotal).toFixed(2)}` : 'Não informado';
    const metodoPagamento = order.detalhesPagamento?.metodoPagamento || 'Não informado';

    return {
      orderId: order.id,
      numerosAssentos: truncateText(assentos, 50),
      nomePagador: truncateText(nomePagador, 30),
      cpfPagador: truncateText(cpfPagador, 30),
      rgPagador: truncateText(rgPagador, 30),
      valorTotal: valorTotal,
      metodoPagamento: truncateText(metodoPagamento, 30),
      status: order.status,
      informacoesAdicionais: truncateText(informacoesAdicionais, 50)
    };
  });

  // Adiciona cabeçalho e rodapé
  const pageHeight = doc.internal.pageSize.height;

  // Adiciona informações da viagem
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes da Viagem', 40, 50);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Identificador: ${travel?.identificador || 'Não informado'}`, 40, 70);
  doc.text(`Origem: ${travel?.origem || 'Não informado'}`, 40, 85);
  doc.text(`Destino: ${travel?.destino || 'Não informado'}`, 40, 100);
  doc.text(`Data de Ida: ${formatDate(travel?.dataIda) || 'Não informado'} às ${travel?.horarioIda || 'Não informado'}`, 40, 115);

  if (travel?.somenteIda) {
    doc.text(`Somente Ida`, 40, 130, { color: 'blue' });
  } else {
    doc.text(`Data de Retorno: ${formatDate(travel?.dataRetorno) || 'Não informado'} às ${travel?.horarioRetorno || 'Não informado'}`, 40, 130);
  }

  if (travel?.veiculo) {
    doc.text(`Veículo: ${travel.veiculo.identificadorVeiculo || 'Não informado'} - ${travel.veiculo.placa || 'Não informado'} (${travel.veiculo.empresa || 'Não informado'})`, 40, 145);
  }
  if (travel?.informacoesAdicionais) {
    doc.text(`Informações Adicionais: ${travel.informacoesAdicionais}`, 40, 160);
  }

  // Cria a tabela de dados dos pedidos
  doc.autoTable({
    head: [columns.map(col => col.title)],
    body: rows.map(row => columns.map(col => row[col.dataKey])),
    startY: 180,
    theme: 'striped',
    margin: { top: 10, bottom: 30, left: 20, right: 20 },
    styles: { fontSize: 10, halign: 'center' },
    headStyles: { fillColor: [40, 60, 100], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      orderId: { cellWidth: 50 }, // Define a largura da coluna Pedido ID
    },
    didDrawPage: function (data) {
      doc.setFontSize(10);
      doc.setTextColor(40);

      var str = 'Página ' + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === 'function') {
        str = str + ' de ' + doc.internal.getNumberOfPages();
      }
      doc.setFontSize(10);
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    },
  });

  // Define o nome do arquivo e salva o PDF
  const identifier = travel?.identificador || 'sem-identificador';
  const origem = travel?.origem || 'sem-origem';
  const destino = travel?.destino || 'sem-destino';
  const dataIda = formatDateForFilename(travel?.dataIda || 'sem-data-ida');
  const dataRetorno = travel?.somenteIda ? 'somente-ida' : formatDateForFilename(travel?.dataRetorno || 'sem-data-retorno');
  const filename = `pedidos_${identifier}_de_${origem}_na_data_${dataIda}_a_${destino}_com_volta_${dataRetorno}.pdf`;

  doc.save(filename);
};

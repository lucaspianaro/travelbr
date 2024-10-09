import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCPF, formatTelefone, formatDate } from './utils';
import logo from '../assets/logo4.png';
import { getPassengerById } from '../services/PassengerService';  // Serviço para buscar o responsável

const exportReservationToPDF = async (reservation, passenger, travel) => {
  const doc = new jsPDF();

  const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    words.forEach(word => {
      let testLine = line + word + ' ';
      let testWidth = doc.getTextWidth(testLine);

      if (testWidth > maxWidth) {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = testLine;
      }
    });

    lines.push(line.trim());

    lines.forEach((line, index) => {
      doc.text(line, x, y + index * lineHeight);
    });

    return y + lines.length * lineHeight;
  };

  const img = new Image();
  img.src = logo;

  // Inicializando o doc depois de carregar a logo
  img.onload = async () => {
    doc.addImage(img, 'PNG', 14, 5, 50, 40);

    doc.setFontSize(18);
    doc.text('Detalhes da Reserva', 14, 50);

    const drawSectionBorder = (startX, startY, width, height) => {
      doc.setDrawColor(173, 216, 230);
      doc.setLineWidth(0.5);
      doc.rect(startX, startY, width, height);
    };

    let currentY = 56;

    // Assento
    const assentoHeight = 16;
    drawSectionBorder(12, currentY, 180, assentoHeight);
    doc.setFontSize(14);
    doc.text('Assento', 14, currentY + 6);
    doc.setFontSize(12);
    currentY = addWrappedText(`Assento: ${reservation.numeroAssento}`, 14, currentY + 12, 180, 6);
    currentY += 4;

    // Informações da viagem
    const viagemHeight = travel.somenteIda ? 40 : 48;
    drawSectionBorder(12, currentY, 180, viagemHeight);
    doc.setFontSize(14);
    doc.text('Informações da Viagem', 14, currentY + 6);
    doc.setFontSize(12);
    currentY = addWrappedText(`Identificador: ${travel.identificador}`, 14, currentY + 12, 180, 6);
    currentY = addWrappedText(`Origem: ${travel.origem}`, 14, currentY, 180, 6);
    currentY = addWrappedText(`Destino: ${travel.destino}`, 14, currentY, 180, 6);
    currentY = addWrappedText(`Data de Ida: ${formatDate(travel.dataIda)} ${travel.horarioIda}`, 14, currentY, 180, 6);

    if (!travel.somenteIda) {
      currentY = addWrappedText(`Data de Retorno: ${formatDate(travel.dataRetorno)} ${travel.horarioRetorno}`, 14, currentY, 180, 6);
    } else {
      doc.setTextColor('blue');
      currentY = addWrappedText(`Somente Ida`, 14, currentY, 180, 6);
      doc.setTextColor('black');
    }

    currentY += 8;

    // Informações do passageiro
    const passageiroHeight = 80;
    drawSectionBorder(12, currentY, 88, passageiroHeight);
    doc.setFontSize(14);
    doc.text('Informações do Passageiro', 14, currentY + 6);
    doc.setFontSize(12);
    let startY = currentY + 12;
    startY = addWrappedText(`Nome: ${passenger.nome}`, 14, startY, 88, 6);
    startY = addWrappedText(`CPF: ${passenger.cpf ? formatCPF(passenger.cpf) : 'Não informado'}`, 14, startY, 88, 6);
    startY = addWrappedText(`${passenger.estrangeiro ? 'Passaporte' : 'RG'}: ${passenger.estrangeiro ? passenger.passaporte || 'Não informado' : passenger.rg || 'Não informado'}`, 14, startY, 88, 6);
    if (passenger.telefone) {
      startY = addWrappedText(`Telefone: ${formatTelefone(passenger.telefone)}`, 14, startY, 88, 6);
    }
    if (passenger.endereco) {
      startY = addWrappedText(`Endereço: ${passenger.endereco}`, 14, startY, 88, 6);
    }
    if (passenger.menorDeIdade) {
      doc.setTextColor('red');
      startY = addWrappedText('Menor de Idade', 14, startY, 88, 6);
      doc.setTextColor('black');
    }
    if (passenger.estrangeiro) {
      doc.setTextColor('blue');
      startY = addWrappedText('Estrangeiro', 14, startY, 88, 6);
      doc.setTextColor('black');
    }

    // Verificar se há responsavelId e buscar o responsável
    if (passenger.responsavelId) {
      const responsavel = await getPassengerById(passenger.responsavelId); // Buscando os dados do responsável

      if (responsavel) {
        drawSectionBorder(105, currentY, 88, passageiroHeight);
        let responsavelStartX = 105;
        startY = currentY + 12;
        startY = addWrappedText(`Nome do Responsável: ${responsavel.nome}`, responsavelStartX, startY, 88, 6);
        startY = addWrappedText(`CPF do Responsável: ${responsavel.cpf ? formatCPF(responsavel.cpf) : 'Não informado'}`, responsavelStartX, startY, 88, 6);
        startY = addWrappedText(`${responsavel.estrangeiro ? 'Passaporte' : 'RG'} do Responsável: ${responsavel.estrangeiro ? responsavel.passaporte || 'Não informado' : responsavel.rg || 'Não informado'}`, responsavelStartX, startY, 88, 6);
        startY = addWrappedText(`Telefone do Responsável: ${formatTelefone(responsavel.telefone)}`, responsavelStartX, startY, 88, 6);
        if (responsavel.estrangeiro) {
          doc.setTextColor('blue');
          startY = addWrappedText('Estrangeiro', responsavelStartX, startY, 88, 6);
          doc.setTextColor('black');
        }
      }
    }

    currentY += passageiroHeight + 8;

    // Informações de pagamento e status
    // Informações de pagamento e status
    const pagadorHeight = 72;
    drawSectionBorder(12, currentY, 180, pagadorHeight);
    doc.setFontSize(14);
    doc.text('Informações do Pagador e Status', 14, currentY + 6);
    doc.setFontSize(12);
    let pagadorStartY = currentY + 12;

    if (reservation.detalhesPagamento?.nomePagador) {
      pagadorStartY = addWrappedText(`Nome do Pagador: ${reservation.detalhesPagamento.nomePagador}`, 14, pagadorStartY, 180, 6);
    }

    // Exibir Passaporte ou CPF/RG com base na nacionalidade do pagador
    if (reservation.detalhesPagamento?.passaportePagador) {
      pagadorStartY = addWrappedText(`Passaporte do Pagador: ${reservation.detalhesPagamento.passaportePagador || 'Não informado'}`, 14, pagadorStartY, 180, 6);
    } else {
      if (reservation.detalhesPagamento?.cpfPagador) {
        pagadorStartY = addWrappedText(`CPF do Pagador: ${formatCPF(reservation.detalhesPagamento.cpfPagador)}`, 14, pagadorStartY, 180, 6);
      }
      if (reservation.detalhesPagamento?.rgPagador) {
        pagadorStartY = addWrappedText(`RG do Pagador: ${reservation.detalhesPagamento.rgPagador}`, 14, pagadorStartY, 180, 6);
      }
    }

    if (reservation.detalhesPagamento?.metodoPagamento) {
      pagadorStartY = addWrappedText(`Método de Pagamento: ${reservation.detalhesPagamento.metodoPagamento}`, 14, pagadorStartY, 180, 6);
    }

    const valorTotal = Number(reservation.detalhesPagamento?.valorTotal || 0).toFixed(2);
    const valorPago = Number(reservation.detalhesPagamento?.valorPago || 0).toFixed(2);
    pagadorStartY = addWrappedText(`Valor Total: R$ ${valorTotal}`, 14, pagadorStartY, 180, 6);
    pagadorStartY = addWrappedText(`Valor Pago: R$ ${valorPago}`, 14, pagadorStartY, 180, 6);

    if (reservation.detalhesPagamento?.informacoesAdicionais) {
      pagadorStartY = addWrappedText(`Informações Adicionais: ${reservation.detalhesPagamento.informacoesAdicionais}`, 14, pagadorStartY, 180, 6);
    }

    pagadorStartY = addWrappedText(`Status: ${reservation.status}`, 14, pagadorStartY, 180, 6);

    // Salvar o PDF
    const fileName = passenger.nome ? `Reserva_${passenger.nome}.pdf` : `Reserva_${reservation.id}.pdf`;
    doc.save(fileName);
  };
};

export default exportReservationToPDF;

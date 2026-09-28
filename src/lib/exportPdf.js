import { jsPDF } from "jspdf";

// Caracteres fora da codificação das fontes padrão do PDF viram equivalentes simples.
const sanitize = (s) =>
  String(s)
    .replace(/₂/g, "2")
    .replace(/—/g, "-")
    .replace(/•/g, "-")
    .replace(/→/g, "->");

// Cria um documento A4 paisagem com cabeçalho e utilitário de tabela.
export function createPdfReport({ title, meta = [] }) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 12;
  let y = margin;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(sanitize(title), margin, y + 5);
  y += 11;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(110);
  meta.forEach((line) => {
    pdf.text(sanitize(line), margin, y + 4);
    y += 5;
  });
  pdf.setTextColor(0);
  y += 5;

  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Desenha uma tabela com cabeçalho destacado e quebra de página automática.
  const drawTable = (columns, rows) => {
    const totalW = columns.reduce((s, c) => s + c.width, 0);
    pdf.setFontSize(8);

    ensureSpace(10);
    pdf.setFillColor(243, 241, 238);
    pdf.rect(margin, y, totalW, 8, "F");
    pdf.setFont("helvetica", "bold");
    let x = margin;
    columns.forEach((c) => {
      pdf.text(sanitize(c.header), x + 1.5, y + 5.5);
      x += c.width;
    });
    y += 9;
    pdf.setFont("helvetica", "normal");

    rows.forEach((row) => {
      ensureSpace(7);
      x = margin;
      row.forEach((cell, i) => {
        pdf.text(sanitize(cell), x + 1.5, y + 5);
        x += columns[i].width;
      });
      y += 6;
    });
    y += 4;
  };

  return { pdf, drawTable, ensureSpace, save: (name) => pdf.save(name) };
}
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(file, "resultados.xlsx");
};

export const exportToPDF = (data: any[]) => {
  const doc = new jsPDF();
  const tableData = data.map((item) => [
    item.indicatorName,
    item.headquarterName,
    item.calculatedValue.toFixed(2),
    item.target.toFixed(2),
    item.measurementUnit,
    `${item.year}`,
  ]);

  autoTable(doc, {
    head: [["Indicador", "Sede", "Resultado", "Meta", "Unidad", "Año"]],
    body: tableData,
  });

  doc.save("resultados.pdf");
};

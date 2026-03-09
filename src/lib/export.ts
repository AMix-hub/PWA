import { TimeLog } from './storage';
import type { jsPDF as jsPDFType } from 'jspdf';

// jspdf-autotable extends jsPDF with lastAutoTable but doesn't export the type
interface jsPDFWithAutoTable extends jsPDFType {
  lastAutoTable: { finalY: number };
}

export async function exportToPDF(logs: TimeLog[], title: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString('sv-SE')}`, 14, 32);

  const grouped = groupLogsByDate(logs);
  let y = 45;

  for (const [date, dateLogs] of Object.entries(grouped)) {
    doc.setFontSize(13);
    doc.text(date, 14, y);
    y += 5;

    const rows = dateLogs.map((log) => {
      const duration = log.endTime - log.startTime;
      const hours = duration / 3600000;
      const earned = hours * log.hourlyRate;
      return [
        log.clientName,
        new Date(log.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        new Date(log.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        formatDurationHM(duration),
        `${log.hourlyRate} kr/h`,
        `${earned.toFixed(0)} kr`,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Klient', 'Start', 'Slut', 'Tid', 'Taxa', 'Intjänat']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [255, 107, 0] },
    });
    y = (doc as unknown as jsPDFWithAutoTable).lastAutoTable.finalY + 10;
  }

  doc.save(`tidrapport-${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportToExcel(logs: TimeLog[], _title: string): Promise<void> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tidrapport');

  sheet.columns = [
    { header: 'Datum',       key: 'datum',    width: 14 },
    { header: 'Klient',      key: 'klient',   width: 28 },
    { header: 'Start',       key: 'start',    width: 8  },
    { header: 'Slut',        key: 'slut',     width: 8  },
    { header: 'Timmar',      key: 'timmar',   width: 10 },
    { header: 'Taxa (kr/h)', key: 'taxa',     width: 12 },
    { header: 'Intjänat (kr)', key: 'intjanat', width: 14 },
  ];

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };

  for (const log of logs) {
    const duration = log.endTime - log.startTime;
    const hours = duration / 3600000;
    const earned = hours * log.hourlyRate;
    sheet.addRow({
      datum:    new Date(log.startTime).toLocaleDateString('sv-SE'),
      klient:   log.clientName,
      start:    new Date(log.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      slut:     new Date(log.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      timmar:   parseFloat(hours.toFixed(2)),
      taxa:     log.hourlyRate,
      intjanat: parseFloat(earned.toFixed(0)),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tidrapport-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

function groupLogsByDate(logs: TimeLog[]): Record<string, TimeLog[]> {
  return logs.reduce((acc, log) => {
    const date = new Date(log.startTime).toLocaleDateString('sv-SE');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, TimeLog[]>);
}

function formatDurationHM(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

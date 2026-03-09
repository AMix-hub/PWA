import { TimeLog } from './storage';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.save(`tidrapport-${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportToExcel(logs: TimeLog[], _title: string): Promise<void> {
  const XLSX = await import('xlsx');
  
  const rows = logs.map((log) => {
    const duration = log.endTime - log.startTime;
    const hours = duration / 3600000;
    const earned = hours * log.hourlyRate;
    return {
      Datum: new Date(log.startTime).toLocaleDateString('sv-SE'),
      Klient: log.clientName,
      Start: new Date(log.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      Slut: new Date(log.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      'Timmar': parseFloat(hours.toFixed(2)),
      'Taxa (kr/h)': log.hourlyRate,
      'Intjänat (kr)': parseFloat(earned.toFixed(0)),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tidrapport');
  XLSX.writeFile(wb, `tidrapport-${new Date().toISOString().split('T')[0]}.xlsx`);
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

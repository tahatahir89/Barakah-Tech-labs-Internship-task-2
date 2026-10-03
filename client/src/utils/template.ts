/** Generates a printable PDF task template (jsPDF is loaded on demand). */
export async function downloadTaskTemplate() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const left = 18;
  const right = 192;

  doc.setFillColor(255, 90, 30);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(20).text('Task Template', left, 17);
  doc.setFont('helvetica', 'normal').setFontSize(10).text('TaskFlow', right, 17, { align: 'right' });

  doc.setTextColor(30, 30, 30);
  const field = (label: string, y: number) => {
    doc.setFont('helvetica', 'bold').setFontSize(10).text(label, left, y);
    doc.setDrawColor(190).line(left + 32, y + 1, right, y + 1);
  };
  const options = (label: string, items: string[], y: number) => {
    doc.setFont('helvetica', 'bold').setFontSize(10).text(label, left, y);
    let x = left + 32;
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      doc.setDrawColor(120).rect(x, y - 3.4, 4, 4);
      doc.text(item, x + 6, y);
      x += 8 + doc.getTextWidth(item) + 6;
    });
  };

  field('Task title', 42);
  field('Category', 56);
  field('Due date', 70);
  options('Priority', ['Low', 'Medium', 'High', 'Urgent'], 86);
  options('Status', ['To do', 'In progress', 'Completed'], 100);

  doc.setFont('helvetica', 'bold').text('Description', left, 118);
  doc.setDrawColor(190);
  for (let y = 128; y <= 168; y += 10) doc.line(left, y, right, y);

  doc.text('Notes', left, 184);
  for (let y = 194; y <= 264; y += 10) doc.line(left, y, right, y);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(130);
  doc.text('© 2026 Muhammad Taha. All rights reserved.', 105, 287, { align: 'center' });
  doc.save('task-template.pdf');
}

// A text-based PDF avoids interpreting database content as HTML or fetching URLs.
export async function downloadReport(report) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  const width = 174;
  let y = 22;
  const printable = (value) => String(value ?? '').replace(/[^\x20-\x7E\n\r\t]/g, '?');
  function nextPage() { doc.addPage(); y = 22; }
  function text(value, size = 10, color = [45, 58, 75]) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(printable(value), width);
    for (const line of lines) { if (y > 269) nextPage(); doc.text(line, margin, y); y += size * 0.47 + 1.2; }
    y += 2;
  }
  function heading(value) { if (y > 252) nextPage(); y += 4; text(value, 14, [20, 83, 115]); }
  text('XSS SHIELD', 23, [12, 40, 64]);
  text('Security activity report', 17);
  text(`Generated: ${new Date(report.generated_at).toLocaleString()}`);
  text(report.publicDemo ? 'Public demonstration - shared, temporary history' : 'Local educational HTML sanitization prototype');
  heading(report.publicDemo ? 'Summary - currently retained scans' : 'Summary - all recorded scans');
  const s = report.summary;
  text(`Total scans: ${s.total}\nSafe / Unchanged: ${s.unchanged}\nSanitized: ${s.sanitized}\nNormalized: ${s.normalized}\nRemoved elements: ${s.removed_elements}\nRemoved attributes: ${s.removed_attributes}\nTotal removed items: ${s.removed_count}`);
  heading('Recent security activity');
  text(`Includes ${report.events.length} recent events (maximum 100). Summary totals cover all records. Content excerpts are limited to 500 characters per event.`);
  if (!report.events.length) text('No recorded activity.');
  for (const event of report.events) {
    if (y > 240) nextPage();
    text(`#${event.id} | ${event.status} | ${new Date(event.created_at).toLocaleString()}`, 11, [20, 83, 115]);
    text(`Action: ${event.action}. Removed items: ${event.removed_count}.`);
    text(event.explanation);
    const content = event.sanitized_content || '(empty output)';
    text(`Sanitized content: ${content.slice(0, 500)}${content.length > 500 ? ' [excerpt truncated]' : ''}`, 9);
  }
  heading('Security recommendations');
  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [report.recommendations];
  recommendations.filter(Boolean).forEach((item, index) => text(`${index + 1}. ${item}`));
  heading('Project scope and limitations');
  const limitations = Array.isArray(report.limitations) ? report.limitations : [report.limitations];
  limitations.filter(Boolean).forEach((item) => text(item));
  text('A sanitization event is not proof of a confirmed XSS attack. This report describes this demonstration application only. Invalid requests are not included in scan totals. Non-ASCII characters are represented as ? in this PDF; full text remains available in the application while records are retained.');
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) { doc.setPage(page); doc.setDrawColor(210, 220, 228); doc.line(margin, 280, 192, 280); doc.setFontSize(8); doc.setTextColor(90, 105, 120); doc.text('XSS Shield | Educational security report', margin, 286); doc.text(`Page ${page} of ${pages}`, 192, 286, { align: 'right' }); }
  doc.save(`xss-shield-report-${new Date(report.generated_at).toISOString().slice(0, 10)}.pdf`);
}

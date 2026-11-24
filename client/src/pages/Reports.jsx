import { useState } from 'react';
import { useResource } from '../services/api.js';
import { downloadReport } from '../utils/report.js';
import { Card, ErrorMessage, EventTable, Icon, Loading, PageHeading, formatDate } from '../components/UI.jsx';
import { SummaryStats } from './Dashboard.jsx';

export default function Reports() {
  const { data, error, loading, reload } = useResource('/report');
  const [busy, setBusy] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  async function download() { setBusy(true); setDownloadError(''); try { await downloadReport(data); } catch { setDownloadError('The PDF could not be generated. Please try again.'); } finally { setBusy(false); } }
  return <><PageHeading eyebrow="TURN ACTIVITY INTO UNDERSTANDING" title="Security Reports" action={<button className="button ghost" onClick={reload} disabled={loading}><Icon name="refresh" size={16} />Refresh data</button>}>A clear, downloadable record for your project presentation and review.</PageHeading>{loading ? <Loading /> : error ? <ErrorMessage retry={reload}>{error}</ErrorMessage> : data && <>
    <Card className="report-hero"><div className="report-illustration"><Icon name="file" size={70} /><span>PDF</span></div><div><p className="eyebrow">{data.publicDemo ? "PUBLIC DEMO REPORT" : "LOCAL SECURITY REPORT"}</p><h2>Your findings, ready to share.</h2><p>Real scan statistics, recent activity, practical recommendations, and project limitations in one paginated PDF.</p><small>Data snapshot: {formatDate(data.generated_at)}</small><div><button className="button primary" disabled={busy} onClick={download}><Icon name="download" />{busy ? 'Generating PDF…' : 'Download PDF report'}</button></div></div></Card>
    {downloadError && <ErrorMessage>{downloadError}</ErrorMessage>}<SummaryStats summary={data.summary} />
    <div className="grid two"><Card title="What’s in your report"><ul className="check-list">{['Project overview and generation date', 'Retained scan totals and removal counts', 'Up to 100 recent security events', 'Recommendations, scope, and limitations', 'Automatic page breaks and page numbers'].map((item) => <li key={item}><Icon name="check" size={17} />{item}</li>)}</ul></Card><Card title="Read the results responsibly"><p>A sanitized result means content was outside the formatting allowlist. It is not evidence of a confirmed attack.</p><p>Reports include sanitized content excerpts up to 500 characters. Use demonstration text, and review the report before sharing.</p><p className="field-help">Standard PDF fonts replace non-ASCII characters with ?. Original Unicode content remains available in Activity Logs.</p></Card></div>
    <Card title="Activity included" className="table-card" action={<span className="subtle-tag">{data.events.length} RECENT EVENTS</span>}><EventTable events={data.events.slice(0, 5)} compact /><p className="table-note">Previewing the first {Math.min(5, data.events.length)} events. The PDF includes up to 100 recent events.</p></Card>
  </>}</>;
}

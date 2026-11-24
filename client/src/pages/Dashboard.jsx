import { useResource } from '../services/api.js';
import { useEnvironment } from '../services/environment.js';
import { Badge, Card, Empty, ErrorMessage, EventTable, Icon, Loading, PageHeading } from '../components/UI.jsx';

export function SummaryStats({ summary }) {
  return <div className="stat-grid">{[
    ['Total scans', summary.total, 'scan', 'Retained sanitization scans', 'blue'],
    ['Safe / Unchanged', summary.unchanged, 'check', 'Passed the allowlist unchanged', 'green'],
    ['Sanitized', summary.sanitized, 'shield', 'Disallowed content removed', 'amber'],
    ['Normalized', summary.normalized, 'code', 'HTML formatting adjusted', 'purple'],
  ].map(([title, count, icon, description, tone]) => <section className={`stat-card ${tone}`} key={title}><div><span>{title}</span><Icon name={icon} /></div><strong>{Number(count || 0).toLocaleString()}</strong><small>{description}</small></section>)}</div>;
}

function TrendChart({ daily }) {
  const maximum = Math.max(1, ...daily.map((day) => day.count));
  return <div className="trend-chart" role="img" aria-label={`Daily scan counts: ${daily.map((day) => `${day.date}: ${day.count}`).join(', ')}`}><div className="chart-grid"><span>{maximum}</span><span>{Math.round(maximum / 2)}</span><span>0</span></div><div className="chart-bars">{daily.map((day) => <div className="bar-column" key={day.date}><div className="bar-track"><svg viewBox="0 0 40 180" preserveAspectRatio="none" aria-hidden="true"><title>{`${day.date}: ${day.count} scans`}</title><rect x="4" y={180 - day.count / maximum * 155} width="32" height={day.count / maximum * 155} rx="4" fill="#64c9da" /></svg><span className="bar-value">{day.count > 0 ? day.count : ''}</span></div><small>{new Date(`${day.date}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</small></div>)}</div></div>;
}

function Distribution({ summary }) {
  const values = [['unchanged', summary.unchanged, '#64d9b3'], ['sanitized', summary.sanitized, '#edbe67'], ['normalized', summary.normalized, '#a69afa']];
  let position = 0;
  const arcs = values.map(([status, count, color]) => {
    const portion = summary.total ? count / summary.total * 100 : 0;
    const circle = <circle key={status} cx="70" cy="70" r="54" pathLength="100" fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${portion} ${100 - portion}`} strokeDashoffset={-position} transform="rotate(-90 70 70)" />;
    position += portion;
    return circle;
  });
  return <div className="distribution"><div className="donut"><svg viewBox="0 0 140 140" role="img" aria-label={`${summary.unchanged} unchanged, ${summary.sanitized} sanitized, ${summary.normalized} normalized`}><circle cx="70" cy="70" r="54" fill="none" stroke="#1f2b3d" strokeWidth="14" />{arcs}</svg><div><strong>{summary.total}</strong><small>total scans</small></div></div><div className="distribution-legend">{values.map(([status, count]) => <div key={status}><Badge status={status} /><strong>{count}</strong><span>{summary.total ? Math.round(count / summary.total * 100) : 0}%</span></div>)}</div></div>;
}

export default function Dashboard() {
  const { publicDemo } = useEnvironment();
  const { data, error, loading, reload } = useResource('/summary');
  return <><PageHeading eyebrow={publicDemo ? "SHARED DEMONSTRATION ACTIVITY" : "YOUR LOCAL SECURITY OVERVIEW"} title="Security Dashboard" action={<button className="button ghost" onClick={reload} disabled={loading}><Icon name="refresh" size={16} />Refresh</button>}>Recorded scanner and customer-review sanitization results. Refresh to retrieve the latest retained data.</PageHeading>{loading ? <Loading /> : error ? <ErrorMessage retry={reload}>{error}</ErrorMessage> : data && <>
    <SummaryStats summary={data} />
    <div className="protection-banner"><span className="icon-box"><Icon name="shield" /></span><div><strong>Server-side sanitization active</strong><p>Strict formatting allowlist · browser-side re-sanitization · SQLite storage</p></div><span className="badge unchanged"><span />PROTECTED PIPELINE</span></div>
    <div className="grid dashboard-charts"><Card title="Daily scan activity" eyebrow="LAST 7 DAYS" action={<span className="subtle-tag">UTC</span>}>{data.daily?.length ? <TrendChart daily={data.daily} /> : <Empty />}</Card><Card title="Result distribution" eyebrow="RETAINED SCANS"><Distribution summary={data} /></Card></div>
    <div className="removal-overview"><div><Icon name="code" /><span>Removed elements <strong>{data.removed_elements}</strong></span></div><div><Icon name="code" /><span>Removed attributes <strong>{data.removed_attributes}</strong></span></div><div><Icon name="shield" /><span>Total removed items <strong>{data.removed_count}</strong></span></div></div>
    <Card title="Recent security activity" action={<a className="text-button" href="#logs">View all activity <Icon name="arrow" size={16} /></a>} className="table-card"><EventTable events={data.recent || []} compact /></Card>
    <p className="field-help">Statistics come from actual SQLite records. A sanitization result means the input did not match this project’s allowlist; it does not prove an XSS attack occurred.</p>
  </>}</>;
}

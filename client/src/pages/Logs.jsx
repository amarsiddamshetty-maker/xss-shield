import { useEffect, useRef, useState } from 'react';
import { useResource } from '../services/api.js';
import { Badge, Card, CodeBlock, Empty, ErrorMessage, EventTable, Icon, Loading, PageHeading, formatDate } from '../components/UI.jsx';

function EventDetail({ id, onClose }) {
  const { data, error, loading, reload } = useResource(`/events/${id}`);
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    return () => { node.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="event-dialog" aria-labelledby="event-title" onCancel={(event) => { event.preventDefault(); onClose(); }}><div className="dialog-heading"><div><p className="eyebrow">SECURITY EVENT</p><h2 id="event-title">Event #{id}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close event details"><Icon name="close" /></button></div>{loading ? <Loading /> : error ? <ErrorMessage retry={reload}>{error}</ErrorMessage> : data && <><Badge status={data.status} /><p className="detail-explanation">{data.explanation}</p><dl className="decision-details"><div><dt>Date & time</dt><dd>{formatDate(data.created_at)}</dd></div><div><dt>Security action</dt><dd>{data.action}</dd></div><div><dt>Removed elements</dt><dd>{data.removed_elements}</dd></div><div><dt>Removed attributes</dt><dd>{data.removed_attributes}</dd></div><div><dt>Original length</dt><dd>{data.original_length} characters</dd></div><div><dt>Sanitized length</dt><dd>{data.sanitized_length} characters</dd></div></dl><h3>Sanitized content</h3><CodeBlock>{data.sanitized_content}</CodeBlock><p className="field-help">Original input is never stored. All content in this detail view is rendered as plain text.</p></>}</dialog>;
}

export default function Logs() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new URLSearchParams(location.hash.split('?')[1] || '').get('event'));
  const query = new URLSearchParams({ page: String(page), pageSize: '10', ...(search && { search }), ...(status && { status }), ...(from && { from }), ...(to && { to }) });
  const { data, error, loading, reload } = useResource(`/events?${query}`);
  const hasFilters = Boolean(search || status || from || to);
  function change(setter, value) { setter(value); setPage(1); }
  return <><PageHeading eyebrow="A RECORD OF EVERY DECISION" title="Activity Logs" action={<button className="button ghost" onClick={reload} disabled={loading}><Icon name="refresh" size={16} />Refresh</button>}>Explore saved results. Only sanitized content and scan metadata are stored.</PageHeading>
    <Card className="filters-card"><div className="filters"><div className="search-filter"><label htmlFor="log-search">Search activity</label><div className="input-icon"><Icon name="search" size={17} /><input id="log-search" type="search" placeholder="Search content or explanation…" value={search} maxLength={200} onChange={(event) => change(setSearch, event.target.value)} /></div></div><div><label htmlFor="status-filter">Scan status</label><select id="status-filter" value={status} onChange={(event) => change(setStatus, event.target.value)}><option value="">All statuses</option><option value="unchanged">Safe / Unchanged</option><option value="sanitized">Sanitized</option><option value="normalized">Normalized</option></select></div><div><label htmlFor="date-from">From (UTC)</label><input type="date" id="date-from" value={from} onChange={(event) => change(setFrom, event.target.value)} /></div><div><label htmlFor="date-to">To (UTC)</label><input type="date" id="date-to" value={to} onChange={(event) => change(setTo, event.target.value)} /></div></div>{hasFilters && <button className="text-button reset-filters" onClick={() => { setSearch(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}>Clear filters <Icon name="close" size={14} /></button>}</Card>
    <Card className="table-card" title="Security events" action={<span className="subtle-tag">{data?.total ?? 0} RESULTS</span>}>{loading ? <Loading /> : error ? <ErrorMessage retry={reload}>{error}</ErrorMessage> : data?.items.length ? <EventTable events={data.items} onSelect={setSelected} /> : <Empty title={hasFilters ? 'No matching events' : 'No activity yet'}>{hasFilters ? 'Try a different search, status, or date range.' : 'Analyze an input in the scanner to create your first event.'}</Empty>}{data && !error && <div className="pagination"><span>Page {data.page} of {Math.max(1, data.totalPages)} · {data.total} events</span><div><button className="button ghost small" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className="button ghost small" disabled={loading || page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>}</Card>
    <div className="scope-note"><Icon name="lock" /><p>Raw input is not retained. Sanitized content can still contain personal text, so use only harmless demonstration data.</p></div>
    {selected && <EventDetail id={selected} onClose={() => setSelected(null)} />}
  </>;
}

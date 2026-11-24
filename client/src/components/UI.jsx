import DOMPurify from 'dompurify';
import { SANITIZE_CONFIG } from '../../../shared/sanitizer-policy.js';

const paths = {
  shield: 'M12 3 20 6v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z M8 12l3 3 5-6',
  home: 'm3 10 9-7 9 7 M5 9v11h5v-6h4v6h5V9',
  scan: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5 M7 12h10 M12 7v10',
  lab: 'M9 3h6 M10 3v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3 M7 15h10',
  chart: 'M4 3v18h17 M8 16v-5 M13 16V6 M18 16v-8',
  logs: 'M8 3h12v18H4V3h4 M8 3v3h8V3 M8 11h8 M8 15h8',
  file: 'M14 2H5v20h14V7l-5-5Z M14 2v6h5 M8 12h8 M8 16h8',
  info: 'M12 16v-5 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  check: 'm5 12 4 4L19 6',
  code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5Z M12 14v3',
  search: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M16 16l6 6',
  download: 'M12 3v12 M6 9l6 6 6-6 M4 16v5h16v-5',
  refresh: 'M20 7v5h-5 M4 17v-5h5 M5 7a8 8 0 0 1 14-1l1 6 M4 12l1 6a8 8 0 0 0 14-1',
  clock: 'M12 7v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  close: 'm6 6 12 12 M6 18 18 6',
};

export function Icon({ name = 'shield', size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.shield} /></svg>;
}

export const statusLabels = { unchanged: 'Safe / Unchanged', sanitized: 'Sanitized', normalized: 'Normalized' };
export function Badge({ status }) { return <span className={`badge ${status}`}><span />{statusLabels[status] || status}</span>; }
export function formatDate(value) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
export function PageHeading({ eyebrow, title, children, action }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subtitle">{children}</p></div>{action}</div>;
}
export function Card({ title, eyebrow, children, className = '', action }) {
  return <section className={`card ${className}`}>{(title || eyebrow) && <div className="card-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h2>{title}</h2>}</div>{action}</div>}{children}</section>;
}
export function ErrorMessage({ children, retry }) { return <div className="error-message" role="alert"><Icon name="info" /><span>{children}</span>{retry && <button className="button ghost small" onClick={retry}>Try again</button>}</div>; }
export function Loading() { return <div className="loading" role="status"><span className="loading-dot" />Loading local security data…</div>; }
export function Empty({ title = 'No activity yet', children = 'Run your first scan to see real security data here.' }) { return <div className="empty"><Icon name="scan" size={32} /><h3>{title}</h3><p>{children}</p></div>; }
export function CodeBlock({ children, label }) { return <pre className="code-block" aria-label={label}><code>{children || '(empty output)'}</code></pre>; }

// This is the only HTML rendering boundary. Original input is always React text.
// Sanitize again in the browser, including values loaded from the database.
export function SafePreview({ html }) {
  const clean = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  return <div className="safe-preview" data-testid="safe-preview" dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function EventTable({ events, onSelect, compact = false }) {
  if (!events.length) return <Empty />;
  return <div className="table-wrap"><table><thead><tr><th>Event</th><th>Date & time</th><th>Result</th>{!compact && <th>Sanitized content</th>}<th>Removed</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td><span className="event-id">#{String(event.id).padStart(4, '0')}</span></td><td className="date-cell">{formatDate(event.created_at)}</td><td><Badge status={event.status} /></td>{!compact && <td><code className="content-snippet">{event.sanitized_content || '(empty)'}</code></td>}<td>{event.removed_count}</td><td>{onSelect ? <button className="text-button" aria-label={`View event ${event.id}`} onClick={() => onSelect(event.id)}>Details <Icon name="arrow" size={14} /></button> : <a className="text-button" href={`#logs?event=${event.id}`}>View <Icon name="arrow" size={14} /></a>}</td></tr>)}</tbody></table></div>;
}

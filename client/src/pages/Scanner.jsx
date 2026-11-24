import { useState } from 'react';
import { useEnvironment } from '../services/environment.js';
import { api } from '../services/api.js';
import { Badge, Card, CodeBlock, ErrorMessage, Icon, PageHeading, SafePreview, formatDate } from '../components/UI.jsx';

export const samples = [
  { label: 'Normal text', html: 'Hello, welcome to my college project!' },
  { label: 'Allowed formatting', html: '<h2>A safer web</h2><p>Learn <strong>security</strong>, one step at a time.</p>' },
  { label: 'Disallowed element', html: '<p>Hello, student!</p><iframe title="Demonstration"></iframe>' },
  { label: 'Disallowed attribute', html: '<p style="color:red" title="Example">Hello, student!</p>' },
  { label: 'HTML normalization', html: '<P>Hello, student!</P>' },
];

export default function Scanner() {
  const { publicDemo } = useEnvironment();
  const [html, setHtml] = useState('');
  const [sample, setSample] = useState('');
  const [original, setOriginal] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function scan(event) {
    event.preventDefault();
    setError(''); setResult(null);
    if (!html.trim()) { setError('Invalid Input: enter some text or HTML to analyze.'); return; }
    if (html.length > 20000) { setError('Invalid Input: use at most 20,000 characters.'); return; }
    setBusy(true);
    const submitted = html;
    try { const data = await api('/scan', { method: 'POST', body: JSON.stringify({ html: submitted }) }); setResult(data); setOriginal(submitted); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  return <>
    <PageHeading eyebrow="INSPECT · SANITIZE · UNDERSTAND" title="XSS Scanner">Give your HTML a closer look. See exactly what the allowlist keeps and removes.</PageHeading>
    <div className="scanner-layout"><Card title="HTML input" eyebrow="01 / SUBMIT" className="input-card" action={<span className="subtle-tag">{publicDemo ? "PUBLIC DEMO" : "LOCAL PROCESSING"}</span>}>
      <form onSubmit={scan} noValidate><label htmlFor="sample">Try a harmless example</label><select id="sample" value={sample} disabled={busy} onChange={(event) => { setSample(event.target.value); if (event.target.value !== '') setHtml(samples[Number(event.target.value)].html); setError(''); setResult(null); }}>{<option value="">Choose a sample input…</option>}{samples.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}</select>
        <div className="label-row"><label htmlFor="html-input">HTML to analyze</label><span>{html.length.toLocaleString()} / 20,000</span></div><textarea id="html-input" spellCheck="false" placeholder={'<p>Start with something simple.</p>\n\nPaste HTML here, or choose a sample above.'} value={html} disabled={busy} onChange={(event) => { setHtml(event.target.value); setSample(''); setResult(null); setError(''); }} aria-describedby="input-help" />
        <p className="field-help" id="input-help">Basic formatting is allowed. Links, images, scripts, styles, and all attributes are removed. Do not submit personal or sensitive content. {publicDemo && "Your sanitized submission is visible to all visitors."}</p>
        <div className="button-row"><button className="button primary" type="submit" disabled={busy}><Icon name="scan" />{busy ? 'Analyzing…' : 'Analyze and Sanitize'}</button><button className="button ghost" type="button" disabled={busy} onClick={() => { setHtml(''); setSample(''); setResult(null); setOriginal(''); setError(''); }}>Clear</button></div>
      </form>{error && <ErrorMessage>{error}</ErrorMessage>}
    </Card><Card title="Security decision" eyebrow="02 / UNDERSTAND" className="decision-card">
      {result ? <div aria-live="polite" data-testid="scan-result"><Badge status={result.status} /><h3 className="decision-title">{result.status === 'unchanged' ? 'Your input passed unchanged.' : result.status === 'normalized' ? 'Your HTML was normalized.' : 'Disallowed content was removed.'}</h3><p>{result.explanation}</p><div className="removal-stats"><div><strong>{result.removed_elements}</strong><span>Elements removed</span></div><div><strong>{result.removed_attributes}</strong><span>Attributes removed</span></div></div><dl className="decision-details"><div><dt>Event</dt><dd>#{result.id}</dd></div><div><dt>Action</dt><dd>{result.action}</dd></div><div><dt>Scanned</dt><dd>{formatDate(result.created_at)}</dd></div></dl><a className="text-button" href={`#logs?event=${result.id}`}>View saved event <Icon name="arrow" size={16} /></a></div> : <div className="scan-idle"><span className="large-icon"><Icon name="shield" size={48} /></span><h3>Ready when you are.</h3><p>Your result, removal counts, and a plain-language explanation will appear here.</p><span className="subtle-tag">SERVER-SIDE DOMPURIFY</span></div>}
    </Card></div>
    {result && <><div className="grid two output-grid"><Card title="Original input" eyebrow="03 / COMPARE" action={<span className="subtle-tag">TEXT ONLY</span>}><CodeBlock label="Original input">{original}</CodeBlock></Card><Card title="Sanitized HTML" action={<span className="subtle-tag">SANITIZED OUTPUT</span>}><CodeBlock label="Sanitized HTML">{result.sanitized_content}</CodeBlock></Card></div><Card title="Safe rendered preview" eyebrow="04 / PREVIEW" action={<span className="badge unchanged"><Icon name="lock" size={12} /> Sanitized again in browser</span>}><SafePreview html={result.sanitized_content} />{!result.sanitized_content && <p className="field-help">The sanitizer returned empty content, so there is nothing to render.</p>}</Card></>}
    <div className="grid three explanation-grid"><div><span className="step-label">VALIDATE</span><h3>Is the input acceptable?</h3><p>Check that the request contains a non-empty string within the size limit.</p></div><div><span className="step-label">SANITIZE</span><h3>Which HTML may remain?</h3><p>DOMPurify removes elements and attributes outside the strict formatting allowlist.</p></div><div><span className="step-label">ENCODE</span><h3>Should this be plain text?</h3><p>React displays the original as text, so HTML characters never become page instructions.</p></div></div>
  </>;
}

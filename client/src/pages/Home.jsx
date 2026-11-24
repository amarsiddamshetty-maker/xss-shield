import { Card, Icon } from '../components/UI.jsx';
import { useEnvironment } from '../services/environment.js';

const concepts = [
  { number: '01', title: 'Stored XSS', icon: 'logs', text: 'Untrusted content is saved, then shown to other visitors later. Sanitize before displaying content from a database.' },
  { number: '02', title: 'Reflected XSS', icon: 'arrow', text: 'Input from a request is returned in the page. Treat search terms, form fields, and URL values as untrusted.' },
  { number: '03', title: 'DOM-based XSS', icon: 'code', text: 'Browser JavaScript puts untrusted input into a page. Use safe text rendering and sanitize intentional HTML.' },
];

export default function Home() {
  const { publicDemo } = useEnvironment();
  return <>
    <section className="home-hero">
      <div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> YOUR FIRST LINE OF UNDERSTANDING</p><h1>Safer HTML.<br /><span>Stronger foundations.</span></h1><p className="hero-description">See what happens between untrusted input and a safer webpage. Explore cross-site scripting, sanitize HTML, and follow every decision.</p><div className="hero-actions"><a className="button primary" href="#scanner"><Icon name="scan" />Start Security Scan<Icon name="arrow" size={18} /></a><a className="button ghost" href="#lab">Explore the learning lab</a></div><div className="hero-notes"><span><Icon name="check" size={15} /> Real DOMPurify sanitization</span><span><Icon name="lock" size={15} /> {publicDemo ? "Free online demonstration" : "Runs on localhost"}</span></div></div>
      <div className="hero-visual" aria-label="Illustration of HTML passing through the sanitization engine"><div className="visual-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="visual-input"><span className="tiny-label">UNTRUSTED INPUT</span><code>&lt;p style="color:red"&gt;Hello&lt;/p&gt;</code><span className="input-marker">1 disallowed attribute</span></div><div className="shield-core"><Icon name="shield" size={66} /></div><div className="visual-output"><span className="tiny-label"><Icon name="check" size={13} /> SANITIZED OUTPUT</span><code>&lt;p&gt;Hello&lt;/p&gt;</code></div><span className="visual-caption">STRICT ALLOWLIST · SAFE RENDERING</span></div>
    </section>
    <div className="feature-strip"><div><Icon name="shield" /><span><strong>Inspect & sanitize</strong><small>Server-side protection</small></span></div><div><Icon name="chart" /><span><strong>Monitor real activity</strong><small>{publicDemo ? "Temporary shared records" : "Persistent SQLite records"}</small></span></div><div><Icon name="lab" /><span><strong>Learn by exploring</strong><small>Safe visual simulations</small></span></div><div><Icon name="file" /><span><strong>Share your findings</strong><small>Downloadable PDF reports</small></span></div></div>
    <div className="section-heading"><div><p className="eyebrow">UNDERSTAND THE THREAT</p><h2>One vulnerability. Three paths to the browser.</h2></div><a className="text-button" href="#lab">Open learning lab <Icon name="arrow" size={16} /></a></div>
    <p className="section-description">Cross-site scripting (XSS) happens when a website treats untrusted content as instructions. It can change a page or access information available to that page.</p>
    <div className="grid three">{concepts.map((concept) => <Card key={concept.number} className="concept-card"><div className="concept-top"><span className="icon-box"><Icon name={concept.icon} /></span><span className="concept-number">{concept.number}</span></div><h3>{concept.title}</h3><p>{concept.text}</p></Card>)}</div>
    <Card className="workflow-card"><div><p className="eyebrow">HOW XSS SHIELD WORKS</p><h2>A clear path from input to insight.</h2><p>DOMPurify parses HTML and keeps only the basic formatting allowed by this project. A changed input is not automatically a confirmed attack.</p></div><ol className="workflow">{[['01', 'Submit HTML', 'Your input'], ['02', 'Validate', 'Type & size'], ['03', 'Sanitize', 'DOMPurify'], ['04', 'Store & preview', 'Safe output']].map(([n, title, description]) => <li key={n}><span>{n}</span><strong>{title}</strong><small>{description}</small></li>)}</ol></Card>
    <div className="scope-note"><Icon name="info" /><p>This is an educational application-level protection prototype. It sanitizes submitted HTML in this application; it is not an enterprise firewall or an external website scanner.</p></div>
  </>;
}

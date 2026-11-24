import { useEffect, useState } from 'react';
import { ErrorMessage, Icon, Loading } from './components/UI.jsx';
import { useResource } from './services/api.js';
import { EnvironmentContext } from './services/environment.js';
import Home from './pages/Home.jsx';
import Scanner from './pages/Scanner.jsx';
import LearningLab from './pages/LearningLab.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Logs from './pages/Logs.jsx';
import Reports from './pages/Reports.jsx';
import About from './pages/About.jsx';

const navigation = [
  ['home', 'Home', 'home'], ['scanner', 'XSS Scanner', 'scan'], ['lab', 'Learning Lab', 'lab'],
  ['dashboard', 'Dashboard', 'chart'], ['logs', 'Activity Logs', 'logs'], ['reports', 'Reports', 'file'], ['about', 'About', 'info'],
];
const pages = { home: Home, scanner: Scanner, lab: LearningLab, dashboard: Dashboard, logs: Logs, reports: Reports, about: About };
const readRoute = () => location.hash.slice(1).split('?')[0] || 'home';

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const { data: environment, loading, error, reload } = useResource('/health');
  useEffect(() => {
    const handle = () => { setRoute(readRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);
  useEffect(() => { document.title = `${navigation.find(([id]) => id === route)?.[1] || 'Home'} · XSS Shield`; }, [route]);
  const Page = pages[route] || Home;
  // Confirm the server's mode before exposing forms or claiming content is local.
  if (loading) return <main><Loading /></main>;
  if (error) return <main><ErrorMessage retry={reload}>{error}</ErrorMessage></main>;
  const { publicDemo, eventLimit } = environment;
  return <EnvironmentContext.Provider value={environment}><div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content').focus(); }}>Skip to content</a>
    <aside className="sidebar">
      <a href="#home" className="brand" aria-label="XSS Shield home"><span className="brand-symbol"><Icon size={27} /></span><span>XSS<span className="brand-light"> Shield</span><small>SECURITY LABORATORY</small></span></a>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">{navigation.map(([id, title, icon]) => <a key={id} href={`#${id}`} className={route === id ? 'nav-link active' : 'nav-link'} aria-current={route === id ? 'page' : undefined}><Icon name={icon} /><span>{title}</span>{id === 'scanner' && <span className="nav-shortcut" aria-hidden="true">↗</span>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="local-card"><span className="status-dot" /><div><strong>{publicDemo ? "Public demonstration" : "Local environment"}</strong><small>Your learning workspace</small></div><Icon name="lock" size={16} /></div><p>Inspect. Understand. Protect.</p><span className="version">XSS SHIELD <span>v1.0</span></span></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{navigation.find(([id]) => id === route)?.[1] || 'Home'}</strong></div><div className="topbar-right"><span className="local-pill"><span className="status-dot" />{publicDemo ? "PUBLIC DEMO" : "LOCAL ONLY"}</span><span className="avatar" title="Educational project">XS</span></div></header>
      <main id="main-content" tabIndex={-1}>
        {publicDemo && <div className="notice demo-notice" role="note"><Icon name="info" /><div><strong>Public demonstration — shared, temporary history</strong><p>Everyone can view submitted sanitized content. Use sample text only, never personal information. Only the latest {eventLimit} events are kept; history can reset when the free host sleeps or restarts.</p></div></div>}
        <Page key={route} />
      </main>
      <footer><span><Icon name="shield" size={14} /> Built for learning. Designed for safer HTML.</span><span>Educational prototype · {publicDemo ? "public demo" : "localhost"}</span></footer>
    </div>
  </div></EnvironmentContext.Provider>;
}

import { useState } from 'react';
import { Card, CodeBlock, ErrorMessage, Icon, PageHeading } from '../components/UI.jsx';
import { api } from '../services/api.js';

const scenarios = {
  search:{title:'Product search',type:'Reflected XSS',steps:['Browser sends search','Express receives request','JSON response','React displays text'],technique:'Safe text rendering (HTML output encoding)',risk:'A search page that interprets request data as HTML could confuse text with instructions.'},
  review:{title:'Customer review',type:'Stored XSS',steps:['Customer A submits','Express validates sample','SQLite saves review','Customer B retrieves later'],technique:'Validated input, bound SQL parameters and safe output rendering',risk:'Saved content is not automatically trusted. Rendering it as HTML could affect later visitors.'},
  preview:{title:'Live message',type:'DOM-based XSS',steps:['Browser input','React state','Page DOM updates'],technique:'React text interpolation',risk:'Browser code can confuse user text with HTML instructions when updating the page.'}
};
const encode=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function Scenario({mode}){
  const lesson=scenarios[mode];
  const [value,setValue]=useState(mode==='search'?'Notebook':mode==='preview'?'<b>Welcome!</b>':'formatted');
  const [result,setResult]=useState(null);
  const [reviews,setReviews]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function run(operation){
    setBusy(true);setError('');
    try{await operation();}catch(cause){setError(cause.message);}finally{setBusy(false);}
  }
  const sample=value==='formatted'?'<b>Excellent notebook!</b>':'Excellent notebook!';
  const shown=mode==='preview'?value:mode==='search'?result?.term:reviews?.[0]?.sample;
  return <>
    <Card title={lesson.type} eyebrow="FOLLOW THE DATA"><p>{lesson.risk}</p><ol className="demo-flow">{lesson.steps.map((step,index)=><li key={step}><span>{index+1}</span><strong>{step}</strong></li>)}</ol></Card>
    <div className="grid two"><Card title={mode==='review'?'Customer A — write review':lesson.title}>
    {mode==='search'?<form onSubmit={event=>{event.preventDefault();run(async()=>setResult(await api('/demo/search?q='+encodeURIComponent(value))));}}><label htmlFor="demo-value">Search products</label><input id="demo-value" maxLength={200} value={value} onChange={event=>setValue(event.target.value)}/><div className="button-row"><button className="button primary" disabled={busy}>Search</button><button type="button" className="button ghost" onClick={()=>setValue('<b>Notebook</b>')}>Use formatting sample</button></div></form>:mode==='review'?<form onSubmit={event=>{event.preventDefault();run(async()=>setResult(await api('/demo/reviews',{method:'POST',body:JSON.stringify({sample:value})})));}}><label htmlFor="review-sample">Sample review</label><select id="review-sample" value={value} onChange={event=>setValue(event.target.value)}><option value="formatted">Formatted sample</option><option value="plain">Plain sample</option></select><CodeBlock>{sample}</CodeBlock><button className="button primary" disabled={busy}>Post sample review</button><p className="field-help">Only fixed harmless samples are stored in a separate shared table, limited to ten records.</p></form>:<><label htmlFor="demo-value">Preview message</label><textarea id="demo-value" maxLength={200} rows={3} value={value} onChange={event=>setValue(event.target.value)}/><p>No API call or database access occurs as you type.</p></>}
    {error&&<ErrorMessage>{error}</ErrorMessage>}
    {mode==='search'&&result&&<><h3>Actual server response</h3><CodeBlock>{JSON.stringify(result,null,2)}</CodeBlock><h3>Product results</h3>{result.products.length?result.products.map(p=><p key={p.name}>{p.name} · ₹{p.price}</p>):<p>No matching products.</p>}</>}
    {mode==='review'&&result&&<p role="status">SQLite saved review #{result.id}. Now retrieve it as Customer B.</p>}
    </Card><Card title={mode==='review'?'Customer B — read saved reviews':'Compare the paths'} eyebrow="PROTECTION IN ACTION">
    {mode==='review'&&<><button className="button primary" disabled={busy} onClick={()=>run(async()=>setReviews(await api('/demo/reviews')))}>Retrieve saved reviews</button><div className="demo-reviews">{reviews?.map(review=><p key={review.id}>#{review.id} · {review.sample}</p>)}</div>{reviews?.length===0&&<p>No saved sample reviews yet.</p>}</>}
    <div className="demo-comparison"><div><h3>Without protection — simulated</h3><p>{lesson.risk}</p>{shown&&<><CodeBlock>{shown}</CodeBlock><p>{/[<>]/.test(shown)?'Markup-like characters are present. A vulnerable rendering operation could interpret them as instructions.':'No angle brackets in this sample. The risk depends on how the application handles future input.'}</p></>}</div><div><h3>With protection — real</h3><p data-testid="demo-safe-text" className="demo-text">{shown??'Complete the operation to see its output.'}</p>{shown&&<><p>HTML text-context encoded representation:</p><CodeBlock>{mode==='search'?result.encoded:encode(shown)}</CodeBlock></>}<p><strong>{lesson.technique}</strong></p></div></div>
    </Card></div><Card title="Security decision"><p>{mode==='search'?'The search API returns JSON and does not save the search term. React renders the returned text safely.':mode==='review'?'A separate SQLite table stores only approved samples. The retrieval request proves that storage and display are separate steps. History is shared and temporary on the Free host.':'The greeting updates directly through React state. No request is sent while typing.'}</p><p>These are safe learning demonstrations. Scanner events and reports remain separate; use the scanner to inspect and log actual sanitization.</p><a className="text-button" href="#scanner">Open real sanitization scanner <Icon name="arrow" size={16}/></a></Card>
  </>;
}
export default function RealWorldDemo(){
  const [mode,setMode]=useState('search');
  return <><PageHeading eyebrow="REAL-WORLD LEARNING" title="Real-World Demo">Three different routes for untrusted text, demonstrated through a fictional stationery shop.</PageHeading><div className="notice"><Icon name="info"/><div><strong>Safe educational demonstration</strong><p>Use sample content only. Unsafe paths are explanations, never executed. Search and review use real APIs; live preview runs only in the browser. No purchases or accounts.</p></div></div><div className="tabs demo-tabs" role="group" aria-label="Demo scenarios">{Object.entries(scenarios).map(([key,item])=><button key={key} type="button" className={mode===key?'selected':''} aria-pressed={mode===key} onClick={()=>setMode(key)}>{item.title}</button>)}</div><Scenario key={mode} mode={mode}/></>;
}

import { useState } from 'react';
import { Card, CodeBlock, ErrorMessage, Icon, PageHeading, SafePreview, Badge } from '../components/UI.jsx';
import { Illustration, ProtectionComparison } from '../components/ProtectionComparison.jsx';
import { api } from '../services/api.js';
import { reviewSamples } from '../../../shared/demo-samples.js';

const scenarios={
  search:{title:'Product search',type:'Reflected XSS',steps:['Browser sends query','Express receives request','JSON response','React displays text'],purpose:'A customer searches for products. The server returns matching products and the search term immediately.',risk:'If a website treats a search term as HTML instead of data, the browser may misinterpret that text.',technique:'Safe text rendering; context-appropriate encoding'},
  review:{title:'Customer review',type:'Stored XSS',steps:['Customer A selects sample','DOMPurify sanitizes','SQLite saves output','Customer B retrieves later'],purpose:'A customer writes a formatted review. Another customer reads it later, even after a refresh.',risk:'Content from a database is still untrusted. Formatting must be restricted before display.',technique:'Server-side sanitization, bound SQL parameters and browser re-sanitization'},
  preview:{title:'Live message',type:'DOM-based XSS',steps:['Browser input','React state','DOM text update'],purpose:'A customer customizes a welcome message. JavaScript updates the page immediately.',risk:'Browser code may accidentally interpret input as instructions instead of text.',technique:'React text interpolation; no HTML insertion'}
};
const labels={plain:'Ordinary text',formatted:'Allowed bold formatting',styled:'Disallowed style + allowed bold',titled:'Disallowed title attribute',list:'Allowed list formatting'};
const searchExamples=[['Notebook','Normal product search'],['<b>Notebook</b>','Markup-like search'],['Paper & pens','Special character'],['Unknown product','No matching product']];
const previewExamples=[['Welcome!','Normal greeting'],['<b>Welcome!</b>','Markup-like greeting'],['Books & stationery','Special character'],['"Hello"','Quotation marks'],['<p style="color:red"><strong>Excellent notebook!</strong></p>','Styled rich-text sample']];
function Flow({steps}){return <ol className="demo-flow">{steps.map((step,index)=><li key={step}><span>{index+1}</span><strong>{step}</strong></li>)}</ol>;}
function ExampleButtons({items,onSelect,disabled=false}){return <div className="demo-examples">{items.map(([value,label])=><button key={label} type="button" disabled={disabled} className="button ghost small" onClick={()=>onSelect(value)}>{label}</button>)}</div>;}
function Scenario({mode}){
 const lesson=scenarios[mode];
 const [value,setValue]=useState(mode==='search'?'Notebook':mode==='preview'?'Welcome!':'styled');
 const [result,setResult]=useState(null);
 const [submitted,setSubmitted]=useState('');
 const [reviews,setReviews]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [technical,setTechnical]=useState(false);
 async function run(operation){setBusy(true);setError('');try{await operation();}catch(cause){setError(cause.message);}finally{setBusy(false);}}
 const shown=mode==='preview'?value:mode==='search'?result?.term:undefined;
 const analysis=mode==='review'?result?.analysis:null;
 const illustrationInput=mode==='review'?(submitted||reviewSamples[value]):mode==='search'?(result?.term??value):value;
 return <>
 <Card title={lesson.type} eyebrow="01 / UNDERSTAND"><p>{lesson.purpose}</p><Flow steps={lesson.steps}/><p><strong>Where the risk occurs:</strong> {lesson.risk}</p></Card>
 <div className="grid two">
 <Card title={mode==='review'?'Customer A — write a rich-text review':lesson.title} eyebrow="02 / TRY IT">
 {mode==='search'?<form onSubmit={event=>{event.preventDefault();run(async()=>setResult(await api('/demo/search?q='+encodeURIComponent(value))));}}><label htmlFor="demo-value">Search products</label><input id="demo-value" maxLength={200} disabled={busy} value={value} onChange={event=>{setValue(event.target.value);setResult(null);}}/><ExampleButtons items={searchExamples} disabled={busy} onSelect={next=>{setValue(next);setResult(null);}}/><button className="button primary" disabled={busy}>Search</button><p className="field-help">Search is sent to Express. The application does not save the term in SQLite. Use sample text only.</p></form>:mode==='review'?<form onSubmit={event=>{event.preventDefault();const selected=value;run(async()=>{const response=await api('/demo/reviews',{method:'POST',body:JSON.stringify({sample:selected})});setSubmitted(reviewSamples[selected]);setResult(response);});}}><label htmlFor="review-sample">Sample review</label><select id="review-sample" disabled={busy} value={value} onChange={event=>{setValue(event.target.value);setResult(null);setSubmitted('');}}>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><CodeBlock>{reviewSamples[value]}</CodeBlock><button className="button primary" disabled={busy}>Post sample review</button><p className="field-help">Only predefined examples are accepted. DOMPurify cleans the review before storage; a real scan event appears in the dashboard.</p></form>:<><label htmlFor="demo-value">Preview message</label><textarea id="demo-value" maxLength={200} rows={3} value={value} onChange={event=>setValue(event.target.value)}/><ExampleButtons items={previewExamples} onSelect={setValue}/><p className="field-help">Type or choose a sample. The visible page changes without a server request.</p></>}
 {error&&<ErrorMessage>{error}</ErrorMessage>}
 {mode==='search'&&result&&<><h3>Shop search results</h3><p>Search results for: <strong className="demo-text">{result.term}</strong></p><div className="demo-products">{result.products.map(p=><article key={p.name}><Icon name={p.icon} size={30}/><h3>{p.name}</h3><span>₹{p.price}</span></article>)}</div>{!result.products.length&&<p>No matching products. Try Notebook.</p>}</>}
 {mode==='review'&&result&&<p role="status">SQLite saved review #{result.id}. Retrieve it as Customer B.</p>}
 </Card>
 <Card title="What a visitor actually sees" eyebrow="03 / COMPARE">
 <div className="demo-comparison"><div><h3>Without protection — illustration only</h3><p>{lesson.risk}</p><Illustration value={illustrationInput}/></div>
 <div><h3>With protection — actual result</h3>{mode==='review'?analysis?<><Badge status={analysis.status}/><SafePreview html={analysis.sanitized_content}/></>:<p>Post a sample review to see the sanitized formatting.</p>:<div className="demo-visitor" data-testid="demo-safe-text">{shown??'Submit a search to see the result.'}</div>}<p>{lesson.technique}</p></div></div>
 {mode==='review'&&analysis&&<><h3>Security analysis</h3><p>Original sample</p><CodeBlock>{submitted}</CodeBlock><p>Sanitized HTML</p><CodeBlock>{analysis.sanitized_content}</CodeBlock><dl className="demo-metrics"><div><dt>Elements removed</dt><dd>{analysis.removed_elements}</dd></div><div><dt>Attributes removed</dt><dd>{analysis.removed_attributes}</dd></div></dl><p>{analysis.explanation}</p><a className="text-button" href={'#logs?event='+analysis.id}>View actual security event <Icon name="arrow" size={16}/></a></>}
 {mode!=='review'&&shown!==undefined&&<><button type="button" className="button ghost small" aria-expanded={technical} onClick={()=>setTechnical(!technical)}>{technical?'Hide technical details':'Show technical details'}</button>{technical&&<><p>{mode==='search'?'Server JSON response. React renders the original term safely; the encoded string is educational.':'React renders a text value, not HTML. Encoding the string manually is unnecessary for this text-rendering operation.'}</p>{mode==='search'&&<CodeBlock>{JSON.stringify(result,null,2)}</CodeBlock>}{mode==='preview'&&<CodeBlock>{shown}</CodeBlock>}</>}</>}
 </Card></div>
 {mode==='preview'&&<Card title="Choose the right protection for the feature" eyebrow="04 / TWO REAL PROTECTED MODES"><ProtectionComparison value={value}/><p>Use plain text for greetings that do not need formatting. Use sanitized rich text only when formatting is a feature. Both run locally in the browser.</p></Card>}
 {mode==='review'&&<Card title="Customer B — read stored reviews" eyebrow="04 / RETRIEVE"><p>Refresh the page or retrieve the reviews now. The database retains the latest ten sanitized samples until the host resets.</p><button className="button primary" disabled={busy} onClick={()=>run(async()=>setReviews(await api('/demo/reviews')))}>Retrieve saved reviews</button>{reviews?.length===0&&<p>No reviews yet.</p>}<div className="demo-reviews">{reviews?.map(review=><article key={review.id}><p>Review #{review.id}</p><SafePreview html={review.sample}/></article>)}</div></Card>}
 <Card title="What did we learn?" eyebrow="TAKEAWAY"><p>{mode==='search'?'Search is a request-response operation. Preserve the original text but do not interpret it as markup. Encoding is context-specific.':mode==='review'?'Formatting can be useful. Sanitization preserves allowed elements and removes disallowed attributes. Database storage alone does not make HTML safe.':'DOM means Document Object Model: the browser’s representation of the page. Safe text rendering updates it without parsing the message as HTML.'}</p><p>A policy removal is not proof of an attack. All unsafe examples here are conceptual. {mode==='review'?'Review scans are included in actual security statistics.':'Safe text demonstrations do not create sanitizer events.'}</p><a href="#scanner" className="text-button">Explore more sanitization cases <Icon name="arrow" size={16}/></a></Card>
 </>;
}
export default function RealWorldDemo(){
 const [mode,setMode]=useState('search');
 return <><PageHeading eyebrow="REAL-WORLD LEARNING" title="Real-World Demo">One fictional shop, three distinct ways user data reaches a webpage. Learn why each protection technique matters.</PageHeading><div className="notice"><Icon name="info"/><div><strong>Safe learning environment</strong><p>No purchases, personal information or executable attack examples. Review history is shared and temporary on the Free host.</p></div></div><div className="tabs demo-tabs" role="group" aria-label="Demo scenarios">{Object.entries(scenarios).map(([key,item])=><button key={key} type="button" className={mode===key?'selected':''} aria-pressed={mode===key} onClick={()=>setMode(key)}>{item.title}</button>)}</div><Scenario key={mode} mode={mode}/></>;
}

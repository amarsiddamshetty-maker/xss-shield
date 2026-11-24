import { useState } from 'react';
import { Card, Icon, PageHeading } from '../components/UI.jsx';

const catalog = [{name:'Notebook',price:120,icon:'file'},{name:'Desk lamp',price:850,icon:'home'},{name:'Backpack',price:990,icon:'lock'}];
const lessons = {
  search: {title:'Product search',type:'Reflected XSS',label:'Search products',sample:'Notebook',description:'A search term is returned immediately in the results page. Display it as text, not markup.'},
  review: {title:'Customer review',type:'Stored XSS',label:'Sample review',sample:'Great notebook!',description:'A saved review could be shown to later visitors. This demonstration keeps only the current browser session’s sample reviews.'},
  preview: {title:'Live message',type:'DOM-based XSS',label:'Preview message',sample:'Welcome to our store!',description:'Browser JavaScript updates the page from a user value. React renders that value as plain text.'},
};
export default function RealWorldDemo() {
  const [mode,setMode]=useState('search');
  const [value,setValue]=useState('');
  const [submitted,setSubmitted]=useState('');
  const [reviews,setReviews]=useState([]);
  const lesson=lessons[mode];
  const shown=mode==='preview'?value:submitted;
  const products=catalog.filter(p=>mode!=='search'||p.name.toLowerCase().includes(submitted.toLowerCase()));
  function submit(event){event.preventDefault();setSubmitted(value);if(mode==='review'&&value.trim())setReviews(previous=>[value,...previous].slice(0,10));}
  return <><PageHeading eyebrow="REAL-WORLD LEARNING" title="Real-World Demo">Explore a fictional stationery shop and see how everyday website inputs stay safe.</PageHeading>
  <div className="notice"><Icon name="info"/><div><strong>Fictional shop · no purchases or real accounts</strong><p>Use harmless sample text only. Inputs stay in this page; no unsafe code runs and no reviews are sent to the server. The scanner is available separately for real server-side sanitization.</p></div></div>
  <div className="tabs demo-tabs" role="group" aria-label="Demo scenarios">{Object.entries(lessons).map(([key,item])=><button key={key} type="button" className={mode===key?'selected':''} aria-pressed={mode===key} onClick={()=>{setMode(key);setValue('');setSubmitted('');}}>{item.title}</button>)}</div>
  <section className="demo-store"><p className="eyebrow">THE PAPER & DESK SHOP</p><h2>Everyday essentials.</h2><div className="demo-products">{products.map(p=><article key={p.name}><Icon name={p.icon} size={34}/><h3>{p.name}</h3><span>₹{p.price}</span></article>)}</div>{!products.length&&<p>No matching products.</p>}</section>
  <div className="grid two"><Card title={lesson.title} eyebrow={lesson.type}><p>{lesson.description}</p><form onSubmit={submit}><label htmlFor="demo-value">{lesson.label}</label><textarea id="demo-value" rows={3} maxLength={500} value={value} onChange={event=>setValue(event.target.value)}/><div className="button-row"><button className="button primary" type="submit">{mode==='search'?'Search':mode==='review'?'Post sample review':'Confirm preview'}</button><button className="button ghost" type="button" onClick={()=>setValue(lesson.sample)}>Use sample</button></div></form>{mode==='review'&&<div className="demo-reviews"><h3>Session reviews</h3>{reviews.map((review,index)=><p key={index}>{review}</p>)}</div>}</Card>
  <Card title="Compare the two paths" eyebrow="PROTECTION IN ACTION"><div className="demo-comparison"><div><h3>Unsafe path — concept only</h3><p>A vulnerable website might interpret input as instructions. We never execute that behavior.</p></div><div><h3>Protected path — actual text rendering</h3><p data-testid="demo-safe-text" className="demo-text">{shown||'Your sample appears here.'}</p></div></div><a href="#scanner" className="text-button">Try server-side sanitization <Icon name="arrow" size={16}/></a></Card></div></>;
}

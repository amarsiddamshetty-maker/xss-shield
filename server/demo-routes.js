import { HttpError } from './middleware/errors.js';

const products = [{name:'Notebook',price:120,icon:'file'},{name:'Desk lamp',price:850,icon:'home'},{name:'Backpack',price:990,icon:'lock'}];
const samples = Object.freeze({plain:'Excellent notebook!',formatted:'<b>Excellent notebook!</b>'});
const encode = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export function registerDemoRoutes(app, db) {
  db.exec('CREATE TABLE IF NOT EXISTS demo_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, sample TEXT NOT NULL, created_at TEXT NOT NULL)');
  const insert = db.prepare('INSERT INTO demo_reviews (sample, created_at) VALUES (?, ?)');
  const list = db.prepare('SELECT id, sample, created_at FROM demo_reviews ORDER BY id DESC LIMIT 10');
  const prune = db.prepare('DELETE FROM demo_reviews WHERE id NOT IN (SELECT id FROM demo_reviews ORDER BY id DESC LIMIT 10)');
  app.get('/api/demo/search', (req,res)=>{
    const term = req.query.q;
    if(typeof term !== 'string' || term.length > 200) throw new HttpError(400,'INVALID_INPUT','Use a search term of at most 200 characters.');
    res.json({data:{term,encoded:encode(term),products:products.filter(p=>p.name.toLowerCase().includes(term.toLowerCase())),stored:false}});
  });
  app.post('/api/demo/reviews',(req,res)=>{
    if(!req.is('application/json') || !req.body || Object.keys(req.body).length!==1 || !Object.hasOwn(samples,req.body.sample)) throw new HttpError(400,'INVALID_INPUT','Select a provided sample review.');
    const record=insert.run(samples[req.body.sample],new Date().toISOString());
    prune.run();
    res.status(201).json({data:{id:Number(record.lastInsertRowid),stored:true}});
  });
  app.get('/api/demo/reviews',(req,res)=>res.json({data:list.all()}));
}

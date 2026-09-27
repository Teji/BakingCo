import express from 'express';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {client,config,loadCatalog,loadSettings,money,imageUrl} from './server/catalog.js';
import {startingPrice,priceOf,hasOffer} from './public/js/catalog.js';
import {prepareOrder,saveOrder,InputError} from './server/orders.js';
const app=express(),root=path.dirname(fileURLToPath(import.meta.url));
app.disable('x-powered-by');
app.set('view engine','ejs');app.set('views',path.join(root,'views'));
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'",'https:','data:'],connectSrc:["'self'",config.url,config.url.replace('https:','wss:')],fontSrc:["'self'"],objectSrc:["'none'"],frameSrc:["'none'"],upgradeInsecureRequests:process.env.NODE_ENV==='production'?[]:null}},crossOriginEmbedderPolicy:false,strictTransportSecurity:process.env.NODE_ENV==='production'?undefined:false}));
app.use(express.json({limit:'150kb'}));
app.use(express.static(path.join(root,'public')));
app.get('/api/config',(req,res)=>res.json({url:config.url,key:config.key,demo:process.env.DEMO_MODE==='true'}));
app.get('/api/catalog',async(req,res)=>{try{res.set('Cache-Control','no-store').json({cakes:await loadCatalog(),site:await loadSettings(),demo:process.env.DEMO_MODE==='true'});}catch(e){res.status(503).json({error:e.message});}});
app.get('/api/settings-defaults',(req,res)=>loadSettings().then(site=>res.json(site)));
app.use('/api/orders',rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many enquiries. Please wait a few minutes and retry.'}}));
app.post('/api/orders',async(req,res)=>{
  if(process.env.DEMO_MODE==='true')return res.status(503).json({error:'Offline preview: orders are disabled. Turn off DEMO_MODE to use your live database.'});
  // Same-origin UI; no permissive CORS or unauthenticated customer read endpoint.
  if(req.get('sec-fetch-site')==='cross-site')return res.status(403).json({error:'Open the enquiry form on our website.'});
  try{const [cakes,site]=await Promise.all([loadCatalog(),loadSettings()]);const row=prepareOrder(req.body,cakes,site);res.status(201).json(await saveOrder(client,row,site));}catch(e){res.status(e instanceof InputError?400:503).json({error:e.message});}
});
app.get(['/admin','/admin/:view','/editor.html'],(req,res)=>{res.set('Cache-Control','no-store').render('admin');});
app.use('/api',(req,res)=>res.status(404).json({error:'API route not found.'}));
app.get('/index.html',(req,res)=>res.redirect(301,'/'));
app.get('/health',(req,res)=>res.json({ok:true}));
app.use(async(req,res,next)=>{
  if(req.method!=='GET')return next();
  try{const [site,cakes]=await Promise.all([loadSettings(),loadCatalog()]);res.locals={site,cakes,money,imageUrl,startingPrice,priceOf,hasOffer,query:req.query,path:req.path,title:site.brand,demo:process.env.DEMO_MODE==='true'};next();}
  catch(e){res.status(503).send('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>_baking_co</title><body><h1>We’ll be right back.</h1><p>Our cake catalogue could not load. Please refresh shortly.</p><a href="/">Try again</a></body></html>');}
});
app.get('/',(req,res)=>res.render('home'));
app.get('/cakes',(req,res)=>{
  const q=String(req.query.q||'').toLowerCase(),category=String(req.query.category||''),flavour=String(req.query.flavour||''),weight=String(req.query.weight||'');
  let filtered=res.locals.cakes.filter(c=>(!q||[c.name,c.description,c.category,...c.flavours].join(' ').toLowerCase().includes(q))&&(!category||c.category.toLowerCase()===category.toLowerCase())&&(!flavour||c.flavours.some(f=>f.toLowerCase().includes(flavour.toLowerCase())))&&(!weight||c.variants.some(v=>v.label===weight))&&(!req.query.budget||(startingPrice(c)!=null&&startingPrice(c)<=Number(req.query.budget)))&&(!req.query.offers||c.variants.some(v=>hasOffer(c,v))));
  if(req.query.sort==='low')filtered.sort((a,b)=>(startingPrice(a)??Infinity)-(startingPrice(b)??Infinity));
  if(req.query.sort==='high')filtered.sort((a,b)=>(startingPrice(b)??-Infinity)-(startingPrice(a)??-Infinity));
  if(req.query.sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name));
  res.render('cakes',{filtered,title:'Our cake collection'});
});
app.get('/cakes/:slug',(req,res)=>{const cake=res.locals.cakes.find(c=>c.id===req.params.slug);if(!cake)return res.status(404).render('not-found');res.render('product',{cake,title:cake.name});});
app.get('/cart',(req,res)=>res.render('cart',{title:'Your cake bag'}));
app.get(['/custom','/corporate'],(req,res)=>res.render('custom',{title:req.path==='/corporate'?'Cakes for your team':'Create your own celebration',corporate:req.path==='/corporate'}));
app.get('/about',(req,res)=>res.render('info',{title:'A little about _baking_co',text:res.locals.site.about}));
app.get('/contact',(req,res)=>res.render('contact',{title:'Let’s talk cake'}));
app.get('/faq',(req,res)=>res.render('faq',{title:'Good things to know'}));
app.get('/policies/:policy',(req,res)=>{const map={delivery:['Delivery & collection','deliveryText'],refund:['Cancellations & refunds','refundText'],privacy:['Privacy','privacyText'],terms:['Ordering terms','termsText']};const p=map[req.params.policy];if(!p)return res.status(404).render('not-found');res.render('info',{title:p[0],text:res.locals.site[p[1]]});});
app.use((req,res)=>res.status(404).render('not-found'));
app.use((err,req,res,next)=>{console.error(err.message);if(res.headersSent)return next(err);res.status(err.status===400?400:500).json({error:'Something went wrong. Please try again.'});});
if(!process.env.VERCEL&&process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))app.listen(Number(process.env.PORT)||3000,()=>console.log('Baking Co: http://localhost:'+(process.env.PORT||3000)));
export default app;

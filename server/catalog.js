import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../public/js/supabase-config.js';
export const config={url:process.env.SUPABASE_URL||SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY||SUPABASE_PUBLISHABLE_KEY};
export const client=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,opts)=>fetch(url,{...opts,signal:AbortSignal.timeout(12000)})}});
export const defaults=JSON.parse(readFileSync(new URL('../data/site.json',import.meta.url)));
export function rowToCake(r){return {id:r.slug,name:r.name,category:r.category,description:r.description,image:r.image_url,gallery:r.gallery||[],flavours:r.flavors||[],eggOptions:r.egg_options||[],ingredients:r.ingredients||'',allergens:r.allergens||'',active:r.active,available:r.available,featured:r.featured,sample:r.sample,offerText:r.offer_text||'',offerEnds:r.offer_ends||'',sortOrder:r.sort_order||0,minNoticeDays:r.min_notice_days||0,variants:r.variants||[],_uuid:r.id};}
export async function loadCatalog(db=client){
  if(process.env.DEMO_MODE==='true')return JSON.parse(readFileSync(new URL('../data/catalog-snapshot.json',import.meta.url))).map(rowToCake).map((c,i)=>({...c,image:`/assets/images/baking-co-${i+1}.png`}));
  const {data,error}=await db.from('cakes').select('*').eq('active',true).order('sort_order',{ascending:false});
  if(error)throw new Error('The cake catalogue is temporarily unavailable. Please try again shortly.');
  return data.map(rowToCake);
}
export async function loadSettings(db=client){
  if(process.env.DEMO_MODE==='true')return defaults;
  try{const {data,error}=await db.from('site_settings').select('content').eq('id','main').maybeSingle();if(!error&&data?.content)return {...defaults,...data.content};}catch{}
  return defaults;
}
export const money=n=>n==null?'Quote on request':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
export const imageUrl=s=>String(s||'').startsWith('assets/')?'/'+s:s;

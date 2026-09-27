import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,CAKE_BUCKET} from './supabase-config.js';

export const recoveryMode=location.hash.includes('type=recovery');
const response=await fetch('/api/config');
if(!response.ok)throw new Error('Cannot load application configuration.');
const config=await response.json();
export const db=globalThis.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const requireDb=()=>{
  if(!db) throw new Error('Supabase connection is unavailable. Check the internet connection and reload.');
  return db;
};
export const rowToCake=r=>({id:r.slug,name:r.name,category:r.category,description:r.description||'',image:r.image_url||'',gallery:r.gallery||[],flavours:r.flavors||['Confirm with baker'],eggOptions:r.egg_options||['Confirm with baker'],ingredients:r.ingredients||'',allergens:r.allergens||'',active:r.active??true,available:r.available??true,featured:r.featured??false,sample:r.sample??false,offerText:r.offer_text||'',offerEnds:r.offer_ends||'',sortOrder:Number(r.sort_order||0),minNoticeDays:Number(r.min_notice_days||0),variants:Array.isArray(r.variants)?r.variants:[] ,_uuid:r.id});
export const cakeToRow=c=>({name:c.name,slug:c.id,description:c.description,category:c.category,price:c.variants?.[0]?.price??0,original_price:c.variants?.[0]?.offerPrice!=null?c.variants[0].price:null,image_url:c.image||null,featured:!!c.featured,available:!!c.available,offer_text:c.offerText||'',flavors:c.flavours||[],sizes:(c.variants||[]).map(v=>v.label),active:!!c.active,sample:!!c.sample,gallery:c.gallery||[],egg_options:c.eggOptions||[],ingredients:c.ingredients||'',allergens:c.allergens||'',offer_ends:c.offerEnds||null,sort_order:Number(c.sortOrder||0),min_notice_days:Number(c.minNoticeDays||0),variants:c.variants||[]});
export async function loadCakesFromSupabase(){const {data,error}=await requireDb().from('cakes').select('*').order('created_at',{ascending:true});if(error)throw error;return (data||[]).map(rowToCake);}
export async function isAdmin(){const {data:{user}}=await requireDb().auth.getUser();if(!user)return false;const {data,error}=await requireDb().from('admins').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data;}
export async function uploadCakeImage(file,slug='cake'){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image.');if(file.size>5*1024*1024)throw new Error('Photo must be below 5 MB.');const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const safe=slug.replace(/[^a-z0-9-]/gi,'-').toLowerCase();const path=`${safe}/${Date.now()}-${crypto.randomUUID()}.${ext}`;const {error}=await requireDb().storage.from(CAKE_BUCKET).upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});if(error)throw error;const {data}=requireDb().storage.from(CAKE_BUCKET).getPublicUrl(path);return data.publicUrl;}

export async function loadOrders(){const {data,error}=await requireDb().from('orders').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[];}
export async function updateOrderStatus(id,status){const {error}=await requireDb().from('orders').update({status}).eq('id',id);if(error)throw error;}

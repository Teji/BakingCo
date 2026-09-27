import {createHash} from 'node:crypto';
import {priceOf,todayIST} from '../public/js/catalog.js';
export class InputError extends Error{}
const text=(x,max=400)=>typeof x==='string'?x.trim().slice(0,max):'';
export function prepareOrder(body,cakes,site){
  if(!body||typeof body!=='object'||Array.isArray(body))throw new InputError('Please complete the enquiry form.');
  if(body.website)throw new InputError('Unable to submit this enquiry.');
  if(!/^[a-f0-9-]{36}$/i.test(body.requestId||''))throw new InputError('Refresh the form and try again.');
  const name=text(body.name,100),phone=text(body.phone,20).replace(/[\s()-]/g,''),date=text(body.date,10),fulfilment=body.fulfilment;
  if(name.length<2||!/^\+?\d{10,15}$/.test(phone))throw new InputError('Enter your name and a valid phone number.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<todayIST())throw new InputError('Choose a valid celebration date, today or later.');
  if(!['Delivery','Pickup'].includes(fulfilment))throw new InputError('Choose delivery or pickup.');
  const area=text(body.area,100),locality=text(body.locality,400),notes=text(body.notes,1000);
  if(fulfilment==='Delivery'&&(!area||locality.length<5))throw new InputError('Add your area and delivery address.');
  let subtotal=0,items=[],details={},kind=body.type;
  if(kind==='cart'){
    if(!Array.isArray(body.items)||!body.items.length||body.items.length>30)throw new InputError('Your bag must have 1–30 cake selections.');
    for(const item of body.items){
      const cake=cakes.find(c=>c.id===item.id&&c.active&&c.available),variant=cake?.variants.find(v=>v.id===item.variantId);
      if(!cake||!variant)throw new InputError('A cake in your bag is no longer available. Please review your bag.');
      if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20)throw new InputError('Cake quantity must be 1–20.');
      if(!cake.flavours.includes(item.flavour)||!cake.eggOptions.includes(item.egg))throw new InputError('Review the flavour and egg preference for each cake.');
      const earliest=new Date(todayIST()+'T00:00:00Z');earliest.setUTCDate(earliest.getUTCDate()+cake.minNoticeDays);
      if(date<earliest.toISOString().slice(0,10))throw new InputError(`${cake.name} needs ${cake.minNoticeDays} day(s) notice.`);
      const price=priceOf(cake,variant);if(price==null)subtotal=null;else if(subtotal!=null)subtotal+=Math.round(price*100)*item.quantity/100;
      items.push({cake_id:cake.id,cake_name:cake.name,variant_id:variant.id,variant_label:variant.label,flavour:item.flavour,egg:item.egg,quantity:item.quantity,unit_price:price,message:text(item.message,80)});
    }
  }else if(kind==='custom'){
    details={occasion:text(body.occasion,120),design:text(body.design,1500),budget:text(body.budget,100),servings:text(body.servings,100)};
    if(details.design.length<5)throw new InputError('Tell us a little more about your custom cake.');
    subtotal=null;
  }else throw new InputError('Unknown enquiry type.');
  const reference='BC-'+createHash('sha256').update(body.requestId+JSON.stringify({name,phone,date,fulfilment,area,locality,notes,kind,items:body.items||[],details})).digest('hex').slice(0,20).toUpperCase();
  const lines=items.map(i=>`${i.quantity} × ${i.cake_name} (${i.variant_label}) · ${i.flavour} · ${i.egg}${i.message?' · Cake message: '+i.message:''}`);
  const message=[`Hello ${site.brand}! Enquiry ${reference}`,`Name: ${name}`,`Phone: ${phone}`,`Celebration: ${date}`,`${fulfilment}: ${area} ${locality}`,...lines,kind==='custom'?`Custom cake: ${details.occasion}\n${details.design}\nBudget: ${details.budget} · Servings: ${details.servings}`:'',subtotal==null?'Please confirm a quote.':`Cake subtotal: ₹${subtotal.toFixed(2)} (delivery extra if applicable)`,notes?`Notes: ${notes}`:'','Please confirm availability, final price and delivery.'].filter(Boolean).join('\n');
  return {reference,enquiry_type:kind,customer_name:name,phone,celebration_date:date,fulfilment,area,locality,items,subtotal,notes,details,whatsapp_message:message,status:'new'};
}
export async function saveOrder(db,row,site){
  const {error}=await db.from('orders').insert(row);
  // A unique reference makes retries safe. Never select anonymous customer rows.
  if(error&&error.code!=='23505')throw new Error('Your enquiry could not be saved. Please try again. WhatsApp has not been opened.');
  const message=error?`Hello ${site.brand}, please follow up my saved enquiry ${row.reference}.`:row.whatsapp_message;
  return {reference:row.reference,duplicate:!!error,whatsappUrl:`https://wa.me/${String(site.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(message)}`};
}

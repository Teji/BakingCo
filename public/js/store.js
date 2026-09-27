import {escapeHTML as e,priceOf,todayIST,reconcileCart} from './catalog.js';
const $=s=>document.querySelector(s),money=n=>n==null?'Quote on request':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
let catalogPromise;const catalog=()=>catalogPromise??=fetch('/api/catalog').then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);return d;});
const readBag=()=>{try{return JSON.parse(localStorage.getItem('baking-co-bag')||'[]')}catch{return[]}};
const saveBag=bag=>{localStorage.setItem('baking-co-bag',JSON.stringify(bag));updateCount();};
function updateCount(){const bag=readBag();$('#bag-count').textContent=Array.isArray(bag)?bag.reduce((n,i)=>n+(Number(i.quantity)||0),0):0;}
function toast(message){$('#toast').textContent=message;setTimeout(()=>$('#toast').textContent='',4000);}
updateCount();window.addEventListener('storage',updateCount);
document.querySelectorAll('.dropdown>button').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',on);b.parentElement.classList.toggle('open',on);}));
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')document.querySelectorAll('.dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false')});});
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>$('#product-main').src=b.dataset.photo));
const product=$('#product-form');
if(product){
  catalog().then(({cakes})=>{const cake=cakes.find(c=>c.id===product.dataset.cake);if(!cake)throw Error('This cake is no longer available.');
    const update=()=>{const v=cake.variants.find(v=>v.id===product.elements.variantId.value);$('#product-price').textContent=money(priceOf(cake,v));};update();product.addEventListener('change',update);
    product.addEventListener('submit',ev=>{ev.preventDefault();const d=new FormData(product),item={id:cake.id,variantId:d.get('variantId'),flavour:d.get('flavour'),egg:d.get('egg'),quantity:Number(d.get('quantity')),message:d.get('message')};let bag=reconcileCart(readBag(),cakes);const old=bag.find(i=>i.id===item.id&&i.variantId===item.variantId&&i.flavour===item.flavour&&i.egg===item.egg&&i.message===item.message);if(old)old.quantity=Math.min(20,old.quantity+item.quantity);else bag.push(item);saveBag(bag);toast('Added to your bag. Let’s make it a celebration!');const b=product.querySelector('button[type="submit"],button.button');b.textContent='Added ✓ · View your bag';b.type='button';b.onclick=()=>location.href='/cart';});
  }).catch(err=>toast(err.message));
}
let cart=[];
async function renderCart(){
  try{const {cakes}=await catalog();const before=readBag();cart=reconcileCart(before,cakes);saveBag(cart);let total=0;
    $('#cart-items').innerHTML=(cart.length!==before.length?'<p class="form-status">Some unavailable selections were removed. Please review your bag.</p>':'')+(cart.map((item,index)=>{const c=cakes.find(c=>c.id===item.id),v=c.variants.find(v=>v.id===item.variantId),price=priceOf(c,v);if(price==null)total=null;else if(total!=null)total+=Math.round(price*100)*item.quantity/100;return `<article class="cart-row"><a href="/cakes/${e(c.id)}"><img src="${e(c.image.startsWith('assets/')?'/'+c.image:c.image)}" alt="${e(c.name)}"></a><div><a href="/cakes/${e(c.id)}"><h3>${e(c.name)}</h3></a><p>${e(v.label)} · ${e(item.flavour)} · ${e(item.egg)}${item.message?'<br>Message: '+e(item.message):''}</p><div class="cart-actions"><input type="number" min="1" max="20" value="${item.quantity}" data-quantity="${index}" aria-label="Quantity for ${e(c.name)}"><button type="button" data-remove="${index}">Remove</button><strong>${money(price==null?null:price*item.quantity)}</strong></div></div></article>`;}).join('')||'<div class="empty"><h2>Your bag is waiting for something lovely.</h2><a class="button dark" href="/cakes">Find my cake ↗</a></div>');
    $('#cart-total').textContent=cart.length?(total==null?'Final quote to be confirmed':'Cake subtotal '+money(total)):'';$('#checkout-form').querySelector('[type=submit]').disabled=!cart.length;
    document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.remove),1);saveBag(cart);renderCart();});
    document.querySelectorAll('[data-quantity]').forEach(i=>i.onchange=()=>{const q=Number(i.value);if(!Number.isInteger(q)||q<1||q>20)return i.reportValidity();cart[Number(i.dataset.quantity)].quantity=q;saveBag(cart);renderCart();});
  }catch(err){$('#cart-items').textContent=err.message;$('#checkout-form').querySelector('[type=submit]').disabled=true;}
}
if($('#cart-items'))renderCart();
for(const selector of ['#checkout-form','#custom-form']){
  const form=$(selector);if(!form)continue;
  form.elements.date.min=todayIST();
  const deliveryRules=()=>{const delivery=form.elements.fulfilment.value==='Delivery';form.elements.area.required=delivery;form.elements.locality.required=delivery;form.elements.locality.minLength=delivery?5:0;};form.elements.fulfilment.addEventListener('change',deliveryRules);deliveryRules();
  // Survives a network retry or reload; no customer details are stored here.
  const tokenKey='baking-co-enquiry-'+selector;let requestId=sessionStorage.getItem(tokenKey)||crypto.randomUUID();sessionStorage.setItem(tokenKey,requestId);
  form.addEventListener('submit',async ev=>{
    ev.preventDefault();const button=form.querySelector('[type=submit]'),status=form.querySelector('.form-status');if(button.disabled)return;button.disabled=true;button.textContent='Saving your enquiry…';status.textContent='';
    try{const body={...Object.fromEntries(new FormData(form)),type:selector==='#checkout-form'?'cart':'custom',requestId};if(body.type==='cart')body.items=readBag();
      const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not save. Please retry.');
      // Only a database success response reveals this WhatsApp action.
      form.hidden=true;const success=$('#enquiry-success');success.hidden=false;success.innerHTML=`<div class="success-box"><span class="success-mark">✓</span><h3>Your enquiry is saved.</h3><p>Keep this reference. Now continue on WhatsApp to confirm the details with us.</p><code>${e(result.reference)}</code><a class="button" href="${e(result.whatsappUrl)}" target="_blank" rel="noopener">Continue on WhatsApp ↗</a><p class="form-note">Your enquiry is recorded even if WhatsApp does not open. This is not an order confirmation.</p><a class="text-link" href="/cakes">Back to the cakes</a></div>`;success.scrollIntoView({behavior:'smooth',block:'center'});sessionStorage.removeItem(tokenKey);if(body.type==='cart')saveBag([]);
    }catch(err){status.textContent=err.message;button.disabled=false;button.textContent='Save enquiry & continue →';}
  });
}

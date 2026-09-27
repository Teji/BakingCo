// Shared catalogue rules. Routine product edits belong in data/cakes.json.
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function todayIST() {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get = name => parts.find(p => p.type === name).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function validImage(value) {
  return typeof value === 'string' && (/^https:\/\/[^\s]+$/i.test(value) || /^\/?assets\/images\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(value) && !value.split('/').includes('..'));
}
export function validateCatalog(data) {
  if (!Array.isArray(data)) throw new Error('cakes.json must contain a list: [ ... ].');
  const ids = new Set();
  data.forEach((cake, index) => {
    const fail = message => {throw new Error(`Cake ${index + 1} (${cake?.name || 'unnamed'}): ${message}`);};
    if (!cake || typeof cake !== 'object') fail('must be an object.');
    if (typeof cake.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cake.id) || ids.has(cake.id)) fail('id must be unique, using lowercase letters, numbers and hyphens.');
    ids.add(cake.id);
    for (const key of ['name','category','description']) if (typeof cake[key] !== 'string' || !cake[key].trim()) fail(`${key} is required.`);
    for (const key of ['active','available','featured','sample']) if (typeof cake[key] !== 'boolean') fail(`${key} must be true or false.`);
    if (!validImage(cake.image)) fail('image must be an assets/images/ filename or a direct HTTPS image URL.');
    if (cake.gallery !== undefined && (!Array.isArray(cake.gallery) || !cake.gallery.every(validImage))) fail('gallery must be a list of valid image paths.');
    for (const key of ['flavours','eggOptions']) if (!Array.isArray(cake[key]) || !cake[key].length || cake[key].some(v => typeof v !== 'string' || !v.trim()) || new Set(cake[key]).size !== cake[key].length) fail(`${key} must contain unique non-empty text choices.`);
    for (const key of ['ingredients','allergens','offerText']) if (cake[key] !== undefined && typeof cake[key] !== 'string') fail(`${key} must be text.`);
    if (typeof cake.offerEnds !== 'string' || (cake.offerEnds && (!/^\d{4}-\d{2}-\d{2}$/.test(cake.offerEnds) || !Number.isFinite(Date.parse(cake.offerEnds)) || new Date(cake.offerEnds).toISOString().slice(0,10)!==cake.offerEnds))) fail('offerEnds must be empty or a valid YYYY-MM-DD date.');
    if (!Array.isArray(cake.variants) || !cake.variants.length) fail('add at least one weight/pack option.');
    if(!Number.isInteger(cake.minNoticeDays??0)||(cake.minNoticeDays??0)<0)fail('Minimum notice must be a nonnegative whole number.');
    if(!Number.isInteger(cake.sortOrder??0))fail('Display priority must be a whole number.');
    const variantIds = new Set();
    cake.variants.forEach(variant => {
      if (!variant || typeof variant.id !== 'string' || !/^[a-z0-9-]+$/.test(variant.id) || variantIds.has(variant.id)) fail('variant ids must be unique within each cake.');
      variantIds.add(variant.id);
      if (typeof variant.label !== 'string' || !variant.label.trim()) fail('every weight/pack needs a label.');
      if (variant.price !== null && (typeof variant.price !== 'number' || !Number.isFinite(variant.price) || variant.price <= 0)) fail('price must be a positive number or null for a quote.');
      if (variant.offerPrice !== null && (typeof variant.offerPrice !== 'number' || !Number.isFinite(variant.offerPrice) || variant.offerPrice <= 0 || variant.price === null || variant.offerPrice >= variant.price)) fail('offerPrice must be null or a positive number below price.');
      if (typeof variant.serves !== 'string') fail('serves must be text.');
    });
  });
  return data;
}
export function hasOffer(cake, variant, today = todayIST()) {
  return variant.offerPrice !== null && (!cake.offerEnds || cake.offerEnds >= today);
}
export function priceOf(cake, variant, today = todayIST()) {
  return hasOffer(cake, variant, today) ? variant.offerPrice : variant.price;
}
export function startingPrice(cake) {
  const prices = cake.variants.map(v => priceOf(cake,v)).filter(v => v !== null);
  return prices.length === cake.variants.length ? Math.min(...prices) : null;
}
export function reconcileCart(cart, cakes) {
  if (!Array.isArray(cart)) return [];
  return cart.slice(0,30).filter(item => {
    if (!item || typeof item !== 'object') return false;
    const cake = cakes.find(c => c.id === item.id && c.active && c.available);
    return cake && cake.variants.some(v => v.id === item.variantId) && cake.flavours.includes(item.flavour) && cake.eggOptions.includes(item.egg) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 20;
  }).map(item => ({id:item.id,variantId:item.variantId,flavour:item.flavour,egg:item.egg,quantity:item.quantity,message:String(item.message || '').slice(0,80),notes:String(item.notes || '').slice(0,400)}));
}
export async function loadJSON(path) {
  const response = await fetch(path, {cache:'no-store'});
  if (!response.ok) throw new Error(`Cannot load ${path} (HTTP ${response.status}).`);
  try {return await response.json();} catch {throw new Error(`${path} contains invalid JSON. Check quotes and commas.`);}
}

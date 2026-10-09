
document.addEventListener('DOMContentLoaded',()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],icons=()=>window.lucide?.createIcons(),money=n=>'$'+Number(n).toFixed(2),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const db=window.eliteDB,c=window.ELITE_CONFIG||{},state={products:[],filter:'todos',search:'',sort:'default',cart:[],selected:null,size:null};
try{state.cart=JSON.parse(localStorage.getItem('eliteCart')||'[]');if(!Array.isArray(state.cart))state.cart=[]}catch{state.cart=[]}
const saveCart=()=>localStorage.setItem('eliteCart',JSON.stringify(state.cart));
function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,3200)}
window.eliteToast=toast;
const publicPhoto=path=>db.storage.from('productos').getPublicUrl(path).data.publicUrl;
function normalize(p){return{id:p.id,name:p.name,category:p.category,price:Number(p.price),oldPrice:p.old_price===null?null:Number(p.old_price),sizes:p.sizes||[],description:p.description||'',image:publicPhoto(p.image_path),imagePath:p.image_path,createdAt:Date.parse(p.created_at)||0}}
async function loadProducts(){
if(!db){toast('Configura Supabase en config.js');return}
const {data,error}=await db.from('productos').select('*').order('created_at',{ascending:false});
if(error){console.error(error);toast('No se pudo cargar el catálogo: '+error.message);return}
state.products=(data||[]).map(normalize);
state.cart=state.cart.filter(x=>state.products.some(p=>p.id===x.id&&p.sizes.includes(x.size)));
saveCart();renderProducts();renderCart();
window.dispatchEvent(new CustomEvent('elite:products-loaded',{detail:state.products}))
}
window.eliteLoadProducts=loadProducts;
function renderProducts(){
let list=state.products.filter(p=>(state.filter==='todos'||p.category===state.filter)&&(p.name.toLowerCase().includes(state.search)||p.category.includes(state.search)));
if(state.sort==='low')list.sort((a,b)=>a.price-b.price);
if(state.sort==='high')list.sort((a,b)=>b.price-a.price);
if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
$('#resultCount').textContent=list.length+' productos';
$('#allCount').textContent=state.products.length;
$('#heroProductCount').textContent=state.products.length;
$('#emptyState').hidden=!!list.length;
$('#emptyTitle').textContent=state.products.length?'NO ENCONTRAMOS PRODUCTOS':'TODAVÍA NO HAY PRODUCTOS';
$('#emptyDescription').textContent=state.products.length?'Prueba otra búsqueda o categoría.':'Pronto encontrarás productos nuevos.';
$('#resetFilters').hidden=!state.products.length;
$('#productGrid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-image" data-open="${p.id}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><button class="quick" data-open="${p.id}">VER PRODUCTO ↗</button></div><div class="product-info"><small>${p.category==='camisetas'?'CAMISETAS DE FÚTBOL':'ZAPATOS DEPORTIVOS'}</small><h3 data-open="${p.id}">${esc(p.name)}</h3><div><strong>${money(p.price)}</strong>${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:''}<button data-open="${p.id}" aria-label="Ver producto"><i data-lucide="plus"></i></button></div></div></article>`).join('');
const shirt=state.products.find(p=>p.category==='camisetas'),shoe=state.products.find(p=>p.category==='zapatos');
$('#collectionCamisetas').style.backgroundImage=shirt?`url('${shirt.image}')`:"url('img/camiseta1.jpg')";
$('#collectionZapatos').style.backgroundImage=shoe?`url('${shoe.image}')`:"url('img/zapato1.jpg')";
icons()
}
function openImageViewer(src,alt){
let viewer=$('#eliteImageViewer');
if(!viewer){
viewer=document.createElement('div');
viewer.id='eliteImageViewer';
viewer.innerHTML='<button type="button" class="elite-image-close" aria-label="Cerrar imagen">✕</button><img alt=""><div class="elite-image-tip">Haz clic en la imagen para ampliar o reducir</div>';
document.body.appendChild(viewer);
viewer.addEventListener('click',e=>{
if(e.target===viewer||e.target.closest('.elite-image-close'))closeImageViewer();
else if(e.target.tagName==='IMG')viewer.classList.toggle('zoomed')
})
}
viewer.querySelector('img').src=src;
viewer.querySelector('img').alt=alt;
viewer.classList.remove('zoomed');
viewer.classList.add('open');
document.body.classList.add('locked')
}
function closeImageViewer(){
const viewer=$('#eliteImageViewer');
if(!viewer||!viewer.classList.contains('open'))return false;
viewer.classList.remove('open','zoomed');
if($('#cartOverlay').hidden&&$('#modalBackdrop').hidden&&$('#adminBackdrop').hidden)document.body.classList.remove('locked');
return true
}
const imageStyle=document.createElement('style');
imageStyle.textContent=`
.modal-layout>img{cursor:zoom-in}
.elite-photo-hint{font-size:11px;color:#c8ff24;margin-top:9px;display:flex;align-items:center;gap:7px}
.elite-photo-hint svg{width:15px;height:15px}
#eliteImageViewer{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.96);display:flex;align-items:center;justify-content:center;padding:65px 25px 50px;opacity:0;visibility:hidden;transition:.25s;cursor:zoom-out}
#eliteImageViewer.open{opacity:1;visibility:visible}
#eliteImageViewer img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;cursor:zoom-in;transition:transform .25s;user-select:none}
#eliteImageViewer.zoomed img{transform:scale(1.65);cursor:zoom-out}
#eliteImageViewer .elite-image-close{position:absolute;top:18px;right:22px;z-index:2;background:#24272c;color:#fff;border:1px solid #5b5e64;border-radius:50%;width:45px;height:45px;font-size:21px;cursor:pointer}
#eliteImageViewer .elite-image-close:hover{background:#c8ff24;color:#111}
#eliteImageViewer .elite-image-tip{position:absolute;bottom:18px;left:0;right:0;text-align:center;color:#bbb;font-size:11px;pointer-events:none}
@media(max-width:600px){#eliteImageViewer{padding:70px 10px 55px}#eliteImageViewer.zoomed img{transform:scale(1.4)}}
`;
document.head.appendChild(imageStyle);
function openModal(id){
const p=state.products.find(x=>x.id===id);
if(!p)return;
state.selected=p;state.size=null;
$('#modalContent').innerHTML=`<div class="modal-layout"><img src="${p.image}" alt="${esc(p.name)}" title="Clic para ver imagen completa"><div class="modal-info"><div class="elite-photo-hint"><i data-lucide="zoom-in"></i> Haz clic en la fotografía para verla completa</div><small>${p.category==='camisetas'?'CAMISETA':'ZAPATO'}</small><h2>${esc(p.name)}</h2><strong>${money(p.price)}</strong><p>${esc(p.description||'Consulta disponibilidad de este producto.')}</p><h4>SELECCIONA TU TALLA</h4><div class="size-options">${p.sizes.map(s=>`<button data-size="${esc(s)}">${esc(s)}</button>`).join('')}</div><button id="modalAdd" class="btn primary full">AGREGAR AL CARRITO</button></div></div>`;
$('#modalBackdrop').hidden=false;
document.body.classList.add('locked');
icons()
}
function closeModal(){
closeImageViewer();
$('#modalBackdrop').hidden=true;
unlock()
}
function unlock(){
if($('#cartOverlay').hidden&&$('#modalBackdrop').hidden&&$('#adminBackdrop').hidden)document.body.classList.remove('locked')
}
window.eliteUnlock=unlock;
function renderCart(){
let count=0,total=0;
$('#cartItems').innerHTML=state.cart.length?state.cart.map((x,i)=>{
const p=state.products.find(p=>p.id===x.id);
if(!p)return '';
count+=x.qty;total+=p.price*x.qty;
return `<div class="cart-item"><img src="${p.image}" alt=""><div><h4>${esc(p.name)}</h4><small>Talla: ${esc(x.size)}</small><strong>${money(p.price*x.qty)}</strong><div class="quantity"><button data-action="minus" data-index="${i}">−</button>${x.qty}<button data-action="plus" data-index="${i}">+</button><button data-action="remove" data-index="${i}"><i data-lucide="trash-2"></i></button></div></div></div>`
}).join(''):'<div class="empty-state">Tu carrito está vacío.</div>';
$('#cartCount').textContent=count;
$('#drawerCount').textContent='('+count+')';
$('#cartTotal').textContent=money(total);
$('#checkoutBtn').disabled=!count;
icons()
}
function openCart(){
$('#cartOverlay').hidden=false;
$('#cartDrawer').classList.add('open');
document.body.classList.add('locked')
}
function closeCart(){
$('#cartOverlay').hidden=true;
$('#cartDrawer').classList.remove('open');
unlock()
}
function whatsapp(message){
return 'https://wa.me/'+(c.WHATSAPP||'593999999999')+'?text='+encodeURIComponent(message)
}
$('#productGrid').addEventListener('click',e=>{
const b=e.target.closest('[data-open]');
if(b)openModal(Number(b.dataset.open))
});
$('#modalContent').addEventListener('click',e=>{
const photo=e.target.closest('.modal-layout>img');
if(photo){openImageViewer(photo.src,photo.alt);return}
const b=e.target.closest('[data-size]');
if(b){
state.size=b.dataset.size;
$$('.size-options button').forEach(x=>x.classList.toggle('active',x===b))
}
if(e.target.closest('#modalAdd')){
if(!state.size)return toast('Selecciona una talla');
const x=state.cart.find(x=>x.id===state.selected.id&&x.size===state.size);
if(x)x.qty=Math.min(99,x.qty+1);
else state.cart.push({id:state.selected.id,size:state.size,qty:1});
saveCart();renderCart();closeModal();
toast('Producto agregado al carrito')
}
});
$('#modalClose').onclick=closeModal;
$('#modalBackdrop').addEventListener('click',e=>{
if(e.target.id==='modalBackdrop')closeModal()
});
$('#cartToggle').onclick=openCart;
$('#cartClose').onclick=closeCart;
$('#cartOverlay').onclick=closeCart;
$('#cartItems').addEventListener('click',e=>{
const b=e.target.closest('[data-action]');
if(!b)return;
const i=Number(b.dataset.index),x=state.cart[i];
if(!x)return;
if(b.dataset.action==='remove')state.cart.splice(i,1);
if(b.dataset.action==='plus')x.qty=Math.min(99,x.qty+1);
if(b.dataset.action==='minus'&&--x.qty<=0)state.cart.splice(i,1);
saveCart();renderCart()
});
$('#checkoutBtn').onclick=()=>{
if(!state.cart.length)return;
const lines=state.cart.map(x=>{
const p=state.products.find(p=>p.id===x.id);
return `• ${p.name} | Talla: ${x.size} | ${x.qty} unidad(es) | ${money(p.price*x.qty)}`
});
const total=state.cart.reduce((n,x)=>n+state.products.find(p=>p.id===x.id).price*x.qty,0);
window.open(whatsapp('Hola, quiero realizar este pedido en ELITE SPORT:\n\n'+lines.join('\n')+'\n\nTOTAL: '+money(total)+'\nConfírmame disponibilidad y envío.'),'_blank','noopener,noreferrer')
};
$$('.filter').forEach(b=>b.onclick=()=>{
$$('.filter').forEach(x=>x.classList.toggle('active',x===b));
state.filter=b.dataset.filter;
renderProducts()
});
$$('.collection').forEach(a=>a.onclick=()=>{
const b=$(`.filter[data-filter="${a.dataset.category}"]`);
b?.click()
});
$('#sortSelect').onchange=e=>{
state.sort=e.target.value;
renderProducts()
};
$('#globalSearch').oninput=e=>{
state.search=e.target.value.trim().toLowerCase();
renderProducts()
};
$('#searchToggle').onclick=()=>{
$('#searchPanel').hidden=!$('#searchPanel').hidden;
if(!$('#searchPanel').hidden)$('#globalSearch').focus()
};
$('#searchClose').onclick=()=>$('#searchPanel').hidden=true;
$('#resetFilters').onclick=()=>{
$('#globalSearch').value='';
state.search='';
$('.filter[data-filter="todos"]').click()
};
$('#menuToggle').onclick=()=>$('#nav').classList.toggle('open');
$$('nav a:not(#adminAccess)').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
$('#contactLink').href=whatsapp('Hola, quisiera información sobre ELITE SPORT.');
$('#footerWhatsapp').href=$('#contactLink').href;
$('#contactLink').target='_blank';
$('#footerWhatsapp').target='_blank';
$('#year').textContent=new Date().getFullYear();
$('#backTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
window.addEventListener('scroll',()=>$('#backTop').classList.toggle('visible',scrollY>400),{passive:true});
document.addEventListener('keydown',e=>{
if(e.key==='Escape'){
if(closeImageViewer())return;
closeModal();
closeCart();
$('#searchPanel').hidden=true
}
});
renderProducts();
renderCart();
icons();
loadProducts()
});

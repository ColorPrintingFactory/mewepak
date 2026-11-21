(function(){
const root=document.getElementById('mewepak-homepage');
const language=JSON.parse(document.getElementById('mewepak-home-language')?.textContent || '{}');
const localized=value=>language.phrases?.[value] || value;
const announcement=(key,current,total,fallback)=>language.labels?.[key]?.replace('{current}',current).replace('{total}',total) || fallback;
const assets={"banner-clean":"/assets/client-design/images/8518a408df421d96.webp","banner-spout":"/assets/client-design/images/b7a7deecc5b51853.webp","banner-frozen":"/assets/client-design/images/7bfc29b884cf81f5.webp","banner-warm":"/assets/client-design/images/2a515bfa6180e869.webp","blog-frozen":"/assets/client-design/images/888fab2980d0bbb3.webp","blog-comparison":"/assets/client-design/images/cd6e96c5b2fb5106.webp","blog-pouch":"/assets/client-design/images/26f9b812dfc33516.webp","blog-coffee":"/assets/client-design/images/e0e14ec25fe1a893.webp","product-grapes":"/assets/client-design/images/bf0603fd2ce106bf.webp","product-candy":"/assets/client-design/images/5c6eeb86d1bb4666.webp","product-almonds":"/assets/client-design/images/14980b4aa189caae.webp","logo":"/assets/client-design/images/20a077c2c564b477.webp","process":"/assets/client-design/images/4c5cbe3a77957324.svg","market-coffee":"/assets/client-design/images/cbada3a2ffb092a4.svg","market-snacks":"/assets/client-design/images/8e8e9d8102e08f50.svg","market-supplement":"/assets/client-design/images/26bc4c1e297a1d4d.svg","market-pet":"/assets/client-design/images/1eb0e00948281260.svg","market-sauce":"/assets/client-design/images/0f0a8f3c5634aef2.svg","market-baby":"/assets/client-design/images/57bb86b6edf91910.svg","market-beverage":"/assets/client-design/images/a09696afbefdd187.svg","market-frozen":"/assets/client-design/images/8ed7e5f7beec344f.svg","market-home":"/assets/client-design/images/a65c8f550eeffe4f.svg","market-meat":"/assets/client-design/images/21a4010b92337c21.svg","market-beauty":"/assets/client-design/images/077eb5c9aec965ac.svg","market-seafood":"/assets/client-design/images/7aa7f96cf9850d63.svg","market-produce":"/assets/client-design/images/679bb263d633ab40.svg","market-cbd":"/assets/client-design/images/1783ea8c8b1c8e5d.svg","market-cosmetics":"/assets/client-design/images/47406fc2ec61f20b.svg","market-spices":"/assets/client-design/images/da659246181f0d29.svg","market-fashion":"/assets/client-design/images/41e72adf5c62a7df.svg","market-tobacco":"/assets/client-design/images/f7e2ef0f392e1c60.svg","market-cbd-thc":"/assets/client-design/images/6f8e3801ad0b145c.svg","market-cannabis":"/assets/client-design/images/7774e2c6a0e67981.svg","market-accessories":"/assets/client-design/images/4242105c7266c6b6.svg","banner-clean-mobile":"/assets/client-design/images/b60ae589680e4bc3.webp","banner-spout-mobile":"/assets/client-design/images/eb4103495dd421c1.webp","banner-frozen-mobile":"/assets/client-design/images/771a9e033db13712.webp","banner-warm-mobile":"/assets/client-design/images/359b0f076dd5f393.webp","market-coffee-photo":"/assets/client-design/images/873549651fc1a911.webp","market-snacks-photo":"/assets/client-design/images/d1b92713ab295161.webp","market-supplement-photo":"/assets/client-design/images/740080ec3ae057b2.webp","market-pet-photo":"/assets/client-design/images/cfcdbd746a6ff3b8.webp","market-sauce-photo":"/assets/client-design/images/39b101c6f4e0ea09.webp","market-baby-photo":"/assets/client-design/images/e81d60808ae47bc9.webp","market-beverage-photo":"/assets/client-design/images/b516f69f40e45895.webp","market-frozen-photo":"/assets/client-design/images/457e72a2cbb71194.webp","market-home-photo":"/assets/client-design/images/1a461dfa6c622d5f.webp","market-produce-photo":"/assets/client-design/images/263d52df600b949b.webp","sustainability-reduce":"/assets/client-design/images/1349a7ea161b18c0.svg","sustainability-reuse":"/assets/client-design/images/8797998f4184f836.svg","sustainability-recycle":"/assets/client-design/images/12a6b47c3484c051.svg","factory-cover":"/assets/client-design/images/205a7467f8ee9d5f.webp","bottom-photo-1":"/assets/client-design/images/30e138afb1ec62c7.webp","bottom-photo-2":"/assets/client-design/images/12cf35da5b04561a.webp","bottom-photo-3":"/assets/client-design/images/497b30600ed09447.webp","bottom-photo-4":"/assets/client-design/images/70ca70e35365e5ab.webp","bottom-photo-5":"/assets/client-design/images/fc7a6f96dc5e2acf.webp","bottom-photo-6":"/assets/client-design/images/ebeeb82dedcb3576.webp","bottom-theme":"/assets/client-design/images/1ff6e79272df0934.svg","rrr-photo-reduce":"/assets/client-design/images/c01562e3242b601f.webp","rrr-photo-reuse":"/assets/client-design/images/fa0255d4e762f436.webp","rrr-photo-recycle":"/assets/client-design/images/54e9e71a129970ab.webp","rrr-photo-reduce-v2":"/assets/client-design/images/6ba584ddffd36f1f.webp","rrr-photo-reuse-v2":"/assets/client-design/images/c1aacb4e8eb780d4.webp","rrr-photo-recycle-v2":"/assets/client-design/images/33d10eb4c8802723.webp","premium-cover-bg":"/assets/client-design/images/7a70e9c1e5090a83.webp","cert-quality":"/assets/client-design/images/af1264c9762c2b9f.svg","cert-food-safety":"/assets/client-design/images/b52c861fefb617e4.svg","cert-environment":"/assets/client-design/images/bfc0a13ac897ea06.svg","cert-traceability":"/assets/client-design/images/1b2d8f42cc33c5da.svg","v2-connect-pattern":"/assets/client-design/images/b32f8a8b5c4c37b6.svg","factory-cover-premium":"/assets/client-design/images/1fb868d406e90a2f.svg","cert-ref-brcgs":"/assets/client-design/images/a3024bf9de9b5a2a.webp","cert-ref-iso14001":"/assets/client-design/images/93c3d62dbdc5ef62.webp","cert-ref-iso9001":"/assets/client-design/images/53f1286bd156bc86.webp","cert-ref-iso45001":"/assets/client-design/images/89fdd1c655aca87e.webp","cert-ref-cibo-fce":"/assets/client-design/images/7d1aa63fd93ad93f.webp","cert-ref-fsc":"/assets/client-design/images/c88d1d10094d467c.webp","cert-ref-uni125":"/assets/client-design/images/3b7a8369303119d3.webp","cert-ref-uni":"/assets/client-design/images/f9b4e3e9fe7c84d6.webp"};
const content={"productIntervalMs":4200,"heroSlides":[{"name":"Custom packaging","kicker":"Flexible packaging, made personal","title":"Custom packaging.","accent":"Made for your brand.","description":"Thoughtful formats, standout print and the details your product needs.","photos":[{"key":"bottom-photo-1","alt":"Original Mewepak Roselle pouch"},{"key":"bottom-photo-3","alt":"Original Mewepak Pocket Bites pouch"},{"key":"bottom-photo-6","alt":"Original Mewepak Sour Cherry pouch"}]},{"name":"Spout pouches","kicker":"A format for every pour","title":"Spout pouches.","accent":"Ready for every pour.","description":"Explore spout formats for food, drinks and everyday refill ideas.","photos":[{"key":"bottom-photo-5","alt":"Original Mewepak baby-food spout pouch"},{"key":"bottom-photo-4","alt":"Original Mewepak Pops apple spout pouch"}]},{"name":"Fresh & frozen food","kicker":"From the shelf to the freezer","title":"Fresh & frozen.","accent":"Packaging with purpose.","description":"Choose a pack around your product, storage conditions and brand.","photos":[{"key":"product-candy","alt":"Original Mewepak Cotton Candy pouch"},{"key":"product-grapes","alt":"Original Mewepak Frozen Candied Grapes pouch"},{"key":"product-almonds","alt":"Original Mewepak Premium Almonds pouch"}]},{"name":"Stand-up pouches","kicker":"Your brand, front and centre","title":"Stand-up pouches.","accent":"Made to stand out.","description":"Bring your product into focus with a format that feels right for your brand.","photos":[{"key":"bottom-photo-2","alt":"Original Mewepak Jowar Puffs pouch"},{"key":"bottom-photo-1","alt":"Original Mewepak Roselle pouch"},{"key":"bottom-photo-6","alt":"Original Mewepak Sour Cherry pouch"}]}]};
root.querySelector('.hy-connect').style.backgroundImage='url('+assets['v2-connect-pattern']+'),url('+assets['premium-cover-bg']+')';root.querySelector('.hy-connect').style.backgroundSize='cover,cover';
root.querySelectorAll('img[data-asset]').forEach(img=>{img.src=assets[img.dataset.asset];});
// Banner text is real HTML. All supplied product artwork remains unchanged.
let overrides;
try { overrides = JSON.parse(root.dataset.heroOverrides || '[]'); }
catch { overrides = []; }
const textFields = ['name', 'kicker', 'title', 'accent', 'description'];
const slides = content.heroSlides.map((slide, index) => {
 const edited = overrides[index];
 const copy = { ...slide, photos: slide.photos.map((photo, i) =>
  edited?.photos?.[i] ? { src: edited.photos[i], alt: edited.name || slide.name } : photo) };
 for (const field of textFields) copy[field] = language.phrases
  ? language.phrases[edited?.[field]] || localized(slide[field])
  : edited?.[field] || slide[field];
 if (language.phrases) copy.photos = copy.photos.map(photo=>({...photo,alt:language.phrases[photo.alt] || copy.name}));
 return copy;
});
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const still=new URLSearchParams(location.search).has('still');
const hero=root.querySelector('.mw-hero');
const heroFrame=hero.querySelector('.mw-hero-frame');
const heroControls=hero.querySelector('#mw-carousel-controls');
const heroStatus=hero.querySelector('#mw-slide-status');
const rotationButton=hero.querySelector('#mw-hero-playback');
const heroInterval=6000;
let current=0;
let rotating=!reduce.matches&&!still;
let inView=!('IntersectionObserver' in window);
let hovered=false;
let rotationTimer;

function showSlide(index, manual=false){
 current=(index+slides.length)%slides.length;
 const slide=slides[current];
 root.querySelector('#v2-hero-kicker').textContent=slide.kicker;
 const title=root.querySelector('#v2-hero-title');
 title.replaceChildren(document.createTextNode(slide.title),document.createElement('br'));
 const accent=document.createElement('span');accent.textContent=slide.accent;title.append(accent);
 root.querySelector('#v2-hero-description').textContent=slide.description;
 root.querySelector('.v2-hero-circle').dataset.count=String(slide.photos.length);
 root.querySelectorAll('[data-hero-shot]').forEach((img,i)=>{img.parentElement.hidden=i>=slide.photos.length;if(i<slide.photos.length){img.src=slide.photos[i].src||assets[slide.photos[i].key];img.alt=slide.photos[i].alt;}});
 root.querySelector('#mw-slide-count').textContent=(current+1)+' / '+slides.length;
 root.querySelector('#mw-slide-title').textContent=slide.name;
 if(manual) heroStatus.textContent=slide.name+', '+announcement('banner',current+1,slides.length,'banner '+(current+1)+' of '+slides.length);
 root.querySelectorAll('[data-slide]').forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
}
function queueRotation(){
 clearTimeout(rotationTimer);
 const focused=hero.contains(document.activeElement)&&document.activeElement!==rotationButton;
 if(!rotating||!inView||hovered||focused||document.hidden)return;
 rotationTimer=setTimeout(()=>{
  showSlide(current+1);
  queueRotation();
 },heroInterval);
}
function setRotation(enabled){
 rotating=enabled;
 const label=localized(enabled?'Pause banner rotation':'Play banner rotation');
 rotationButton.setAttribute('aria-label',label);
 rotationButton.title=label;
 rotationButton.dataset.playing=String(enabled);
 queueRotation();
}
function selectSlide(index){
 showSlide(index,true);
 queueRotation();
}
root.querySelector('#mw-previous').addEventListener('click',()=>selectSlide(current-1));
root.querySelector('#mw-next').addEventListener('click',()=>selectSlide(current+1));
root.querySelectorAll('[data-slide]').forEach(dot => {
 const index = Number(dot.dataset.slide);
 dot.setAttribute('aria-label', slides[index].name + ', ' + announcement('banner',index+1,slides.length,'banner '+(index+1)+' of '+slides.length));
 dot.addEventListener('click', () => selectSlide(index));
});
heroControls.addEventListener('keydown',event=>{
 if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
 event.preventDefault();
 const step=event.key==='ArrowRight'?1:-1;
 selectSlide(current+(root.closest('[dir="rtl"]')?-step:step));
});
rotationButton.addEventListener('click',()=>setRotation(!rotating));
heroFrame.addEventListener('pointerenter',event=>{
 if(event.pointerType!=='mouse')return;
 hovered=true;
 queueRotation();
});
heroFrame.addEventListener('pointerleave',()=>{
 hovered=false;
 queueRotation();
});
hero.addEventListener('focusin',queueRotation);
hero.addEventListener('focusout',()=>queueMicrotask(queueRotation));
document.addEventListener('visibilitychange',queueRotation);
reduce.addEventListener('change',event=>{if(event.matches)setRotation(false);});
if('IntersectionObserver' in window){
 new IntersectionObserver(([entry])=>{
  inView=entry.isIntersecting;
  queueRotation();
 }).observe(heroFrame);
}
showSlide(0);
rotationButton.hidden=false;
setRotation(rotating);
const expand=root.querySelector('#mw-expand-markets');expand.addEventListener('click',()=>{const open=expand.getAttribute('aria-expanded')!=='true';expand.setAttribute('aria-expanded',String(open));expand.textContent=open?localized('Show fewer markets')+' ↑':localized('View all markets')+' ↗';root.querySelectorAll('.mw-extra-market').forEach(card=>card.hidden=!open);});
// Four original cards, with a hidden copy at either end for a continuous loop.
const track=root.querySelector('.hy-product-track');
const originals=[...track.children];
const count=originals.length;
function copyCard(card){const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('button,a,input').forEach(el=>el.tabIndex=-1);return clone;}
originals.forEach(card=>track.appendChild(copyCard(card)));
const before=document.createDocumentFragment();originals.forEach(card=>before.appendChild(copyCard(card)));track.prepend(before);
let productIndex=count, busy=false, userPaused=false, hoverPaused=false, focusPaused=false;
let normalizer;
const productWindow=track.parentElement;
const pauseButton=root.querySelector('#hy-product-pause');
function setProductPosition(animated){
 const step=originals[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
 track.style.transition=animated?'':'none';
 track.style.transform='translateX(-'+productIndex*step+'px)';
 productWindow.scrollLeft=0;
 if(!animated){void track.offsetWidth;track.style.transition='';}
 const index=((productIndex-count)%count+count)%count;
 root.querySelector('#hy-product-status').textContent=announcement('product',index+1,count,'Featured packaging '+(index+1)+' of '+count);
 root.querySelector('#hy-product-page').textContent=String(index+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
}
function normalizeProduct(){
 clearTimeout(normalizer);
 if(productIndex>=count*2){productIndex-=count;setProductPosition(false);}
 if(productIndex<count){productIndex+=count;setProductPosition(false);}
 busy=false;
}
function productMove(delta,manual=false){
 if(busy||(!manual&&(userPaused||hoverPaused||focusPaused)))return;
 busy=true;productIndex+=delta;setProductPosition(!reduce.matches);
 if(reduce.matches)normalizeProduct();else normalizer=setTimeout(normalizeProduct,720);
}
track.addEventListener('transitionend',event=>{if(event.target===track&&event.propertyName==='transform')normalizeProduct();});
root.querySelector('#hy-product-prev').addEventListener('click',()=>productMove(-1,true));
root.querySelector('#hy-product-next').addEventListener('click',()=>productMove(1,true));
pauseButton.addEventListener('click',()=>{userPaused=!userPaused;pauseButton.setAttribute('aria-pressed',String(userPaused));pauseButton.textContent=localized(userPaused?'Resume auto-scroll':'Pause auto-scroll');});
productWindow.addEventListener('mouseenter',()=>hoverPaused=true);
productWindow.addEventListener('mouseleave',()=>hoverPaused=false);
productWindow.addEventListener('focusin',event=>{
 focusPaused=true;
 const card=event.target.closest('.mw-product'), index=originals.indexOf(card);
 if(index<0)return;
 const bounds=card.getBoundingClientRect(), frame=productWindow.getBoundingClientRect();
 if(bounds.left<frame.left-1||bounds.right>frame.right+1){normalizeProduct();productIndex=count+index;setProductPosition(false);}
});
productWindow.addEventListener('focusout',event=>{if(!productWindow.contains(event.relatedTarget))focusPaused=false;});
setProductPosition(false);
const auto=setInterval(()=>{
 if(!root.isConnected){clearInterval(auto);return;}
 if(!reduce.matches&&!document.hidden&&!still)productMove(1);
},content.productIntervalMs);
window.addEventListener('resize',()=>{normalizeProduct();setProductPosition(false);});
const images=[...root.querySelectorAll('img[src]')];Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(done=>{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}))).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{document.body.dataset.homepageReady='1';document.body.dataset.homepageBrokenImages=String(images.filter(img=>!img.naturalWidth).length);})));
})();

window.mewepakClient.home();

(async function(){
 'use strict';
 const root=document.getElementById('mewepak-homepage');
 const assets={"logo":"/assets/client-design/images/20a077c2c564b477.webp","bottom-photo-1":"/assets/client-design/images/30e138afb1ec62c7.webp","bottom-photo-4":"/assets/client-design/images/70ca70e35365e5ab.webp","bottom-photo-6":"/assets/client-design/images/ebeeb82dedcb3576.webp","product-almonds":"/assets/client-design/images/14980b4aa189caae.webp","market-coffee-photo":"/assets/client-design/images/873549651fc1a911.webp","market-snacks-photo":"/assets/client-design/images/d1b92713ab295161.webp","market-pet-photo":"/assets/client-design/images/cfcdbd746a6ff3b8.webp","market-home-photo":"/assets/client-design/images/1a461dfa6c622d5f.webp","rrr-photo-reduce-v2":"/assets/client-design/images/6ba584ddffd36f1f.webp","pack-flat-bottom":"/assets/client-design/images/0f5501a48238d114.webp","pack-flat-pouch":"/assets/client-design/images/eaeb81847d354fb0.webp","pack-retort":"/assets/client-design/images/622b82855e376f12.webp","pack-rollstock":"/assets/client-design/images/21f880d0630c48f8.webp","pack-quad-seal":"/assets/client-design/images/d211d844432c3131.webp","pack-tap-pouch":"/assets/client-design/images/18d5587101907264.webp","pack-bag-in-box":"/assets/client-design/images/318424abdaa1ab3e.webp","pack-shaped-pouch":"/assets/client-design/images/0f0db5c9beb76f37.webp","detail-opening":"/assets/client-design/images/786a45c30ae8e8df.svg","detail-window":"/assets/client-design/images/1e0e259fc9f2c74a.svg","detail-finish":"/assets/client-design/images/b381e66d563eb5b1.svg","detail-artwork":"/assets/client-design/images/6229902d4a5dd774.svg","hero-pouch-group-v3":"/assets/client-design/images/e48dd101819047f6.webp","eco-guide-pattern":"/assets/client-design/images/1f82dfbca4bb80c9.svg","quote-samples-pattern":"/assets/client-design/images/5f94610f65c66bdf.svg"};
 let formats=[{"id":"stand-up","name":"Stand-up pouches","family":"pouches","kicker":"An everyday favourite","image":"bottom-photo-1","original":true,"alt":"Original Mewepak Roselle printed stand-up pouch","summary":"An upright gusseted format with a generous front panel for your brand.","keywords":"stand up zipper snacks sweets coffee dry foods roselle","detail":"Start with the familiar stand-up shape, then build a brief around your product, opening preferences and artwork.","questions":["Pack dimensions and intended fill quantity","Opening and resealing preferences","Material, barrier and finish requirements"],"tags":["Snacks & sweets","Dry goods"]},{"id":"flat-bottom","name":"Flat-bottom pouches","family":"pouches","kicker":"A distinct shelf profile","image":"pack-flat-bottom","original":false,"alt":"Illustrative Mewepak coffee flat-bottom pouch mockup","summary":"A box-style base and defined panels for branding on every side.","keywords":"box pouch flat bottom coffee tea dry goods","detail":"Explore a more structured pouch profile and consider how your artwork will work across its front, back and side panels.","questions":["Filled pack dimensions and shelf profile","Panel artwork and preferred closure","Product protection and material brief"],"tags":["Coffee & tea","Nuts & seeds"]},{"id":"quad-seal","name":"Quad seal bags","family":"pouches","kicker":"Four corners. More character.","image":"pack-quad-seal","original":false,"alt":"Mewepak quad seal coffee bag concept with side gussets and four corner seams","summary":"Four sealed corners and side gussets create a structured bag profile.","keywords":"quad seal four corner coffee tea pet food dry goods","detail":"Consider a four-corner-seal bag when planning a gusseted pack with a defined front, back and side profile. Share your product and filling requirements so the details can be discussed.","questions":["Product, fill weight and bag dimensions","Side-gusset depth and filling method","Panel artwork and opening preferences"],"tags":["Coffee","Pet food"]},{"id":"flat-pouch","name":"Flat pouches","family":"pouches","kicker":"A simpler silhouette","image":"pack-flat-pouch","original":false,"alt":"Illustrative Mewepak flat three-side-seal pouch mockup","summary":"A compact, flat-format pack for portions, sachets and samples.","keywords":"flat pouch three side seal sachet sample portions daily blend","detail":"Explore a slim, flat-pouch layout and discuss the seal arrangement and opening details around your intended fill.","questions":["Single-portion quantity and pouch dimensions","Seal layout and tear-opening preference","Print area and film-structure brief"],"tags":["Samples","Single portions"]},{"id":"shaped","name":"Shaped pouches","family":"pouches","kicker":"A silhouette of your own","image":"pack-shaped-pouch","original":false,"alt":"Illustrative Mewepak hourglass-shaped die-cut pouch concept","summary":"Custom silhouettes give your packaging a distinctive outline.","keywords":"shaped die cut unique outline confectionery samples cosmetics","detail":"Start with the shape you have in mind and consider how it will fill, open, display and carry your artwork. The final outline and structure need to work together.","questions":["Proposed shape and intended fill","Seal areas, opening and handling","Artwork position and production feasibility"],"tags":["Custom outline","Distinctive branding"]},{"id":"retort","name":"Retort pouches","family":"pouches","kicker":"Start with the process","image":"pack-retort","original":false,"alt":"Illustrative Mewepak ready-meal retort-style pouch mockup","summary":"Plan your pouch around the food, filling and processing requirements.","keywords":"retort food meal ready meal processing","detail":"For a retort-format project, begin with your product and processing requirements so the pack structure can be discussed and validated.","questions":["Product and processing requirements","Pack dimensions and sealing details","Testing and validation requirements"],"tags":["Food","Process-led brief"]},{"id":"spout","name":"Spout pouches","family":"liquid","kicker":"Made around the pour","image":"bottom-photo-4","original":true,"alt":"Original Mewepak Pops apple and mango spout pouch","summary":"A capped spout for pouring, resealing and everyday use.","keywords":"spout liquid puree sauce drinks beverage refill baby food pops","detail":"Bring the product, filling process and intended use into the conversation when considering a spout-pouch format.","questions":["Product type and filling process","Spout position and cap preferences","Handling, storage and pack-size requirements"],"tags":["Beverages","Sauces & pur\u00e9es"]},{"id":"tap-pouch","name":"Pouches with tap","family":"liquid","kicker":"Designed around dispensing","image":"pack-tap-pouch","original":false,"alt":"Illustrative Mewepak large dispensing pouch with carry handle and lower black tap","summary":"A large-format flexible pouch with an integrated dispensing tap.","keywords":"stand up pouch tap dispensing liquid beverage large format handle","detail":"Explore a tap-pouch format around your liquid product, filling process and dispensing needs. Discuss the handle, fitment and pack volume as part of the brief.","questions":["Liquid product and intended volume","Tap position, fitment and carry handle","Filling, handling and storage requirements"],"tags":["Liquid products","Dispensing"]},{"id":"bag-in-box","name":"Bag-in-box","family":"liquid","kicker":"Inside flexible. Outside structured.","image":"pack-bag-in-box","original":false,"alt":"Illustrative Mewepak kraft outer box and separate silver flexible inner bag with dispensing tap","summary":"An inner flexible bag, outer box and tap brought together as one pack.","keywords":"bag in box bib inner bag outer carton wine beverage liquid dispenser","detail":"Plan the flexible inner bag and outer carton as one packaging system. Bring the liquid product, intended volume and dispensing requirements to the conversation.","questions":["Product and inner-bag volume","Outer box dimensions and artwork","Tap, filling process and handling brief"],"tags":["Liquid products","Boxed systems"]},{"id":"rollstock","name":"Printed roll stock","family":"film","kicker":"For the bigger picture","image":"pack-rollstock","original":false,"alt":"Illustrative Mewepak printed flexible packaging film roll mockup","summary":"Continuous printed film planned around your filling or wrapping line.","keywords":"film roll stock rollstock printed web automated filling coffee","detail":"Bring the equipment requirements and print layout together when considering printed film supplied in roll form.","questions":["Filling equipment and required web width","Print-repeat and artwork requirements","Material structure and finishing brief"],"tags":["Form-fill-seal","Wrapping"]}];
 const grid=root.querySelector('#pk-card-grid');
 const search=root.querySelector('#pk-search');
 const filters=[...root.querySelectorAll('[data-filter]')];
 let activeFilter='all', selectedFormat=null, pageReady=false;
 function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
 formats = await window.mewepakClient.catalogue(formats);
 const cards=formats.map((format,index)=>{
  const card=element('article','pk-card');card.dataset.format=format.id;
  const media=element('a','pk-card-media'+(format.original?' pk-original':''));media.href='/products/'+encodeURIComponent(format.slug)+'/';media.setAttribute('aria-label','View format page: '+format.name);
  const image=element('img');if (format.image) image.dataset.asset=format.image; else image.src=window.mewepakClient.formatImage(format, assets); image.loading='lazy';image.alt=format.alt;image.width=600;image.height=450;media.append(image,element('span','pk-card-number',String(index+1).padStart(2,'0')));
  const copy=element('div','pk-card-copy');copy.append(element('p','pk-card-kicker',format.kicker),element('h3','',format.name),element('p','pk-card-summary',format.summary));
  const formatIcon = window.mewepakClient.formatIcon(format.slug);
  if (formatIcon) copy.querySelector('h3').prepend(formatIcon);
  const tags=element('ul','pk-card-tags');tags.setAttribute('aria-label','Format ideas');(format.tags||[]).forEach(tag=>tags.append(element('li','',tag)));copy.append(tags);
  const action=element('button','pk-card-action');action.type='button';action.dataset.detail=format.id;action.setAttribute('aria-label','View '+format.name+' details');action.append(element('span','','Explore format'),element('b','','↗'));copy.append(action);card.append(media,copy);grid.append(card);
  return {card,format};
 });
 const catalogueHelp=root.querySelector('#pk-catalogue-help');
 grid.append(catalogueHelp);
 root.querySelectorAll('img[data-asset]').forEach(image=>{image.src=assets[image.dataset.asset];});
 function postSize(){
  if(!pageReady)return;
  const images=[...root.querySelectorAll('img[src]')];
  const broken=images.filter(img=>img.complete&&!img.naturalWidth).length;
  document.body.dataset.packagingReady='1';document.body.dataset.packagingBroken=String(broken);
  
 }
 function applyFilters(){
  const words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let visible=0;
  cards.forEach(({card,format})=>{
   const matchesCategory=activeFilter==='all'||format.family===activeFilter;
   const haystack=(format.name+' '+format.summary+' '+format.keywords).toLowerCase();
   const show=matchesCategory&&words.every(word=>haystack.includes(word));
   card.hidden=!show;if(show)visible++;
  });
  root.querySelector('#pk-count').textContent=visible+' '+(visible===1?'format':'formats')+' to explore';
  root.querySelector('#pk-empty').hidden=visible!==0;
  root.querySelector('#pk-clear').hidden=activeFilter==='all'&&words.length===0;
  catalogueHelp.hidden=activeFilter!=='all'||words.length>0;
  filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===activeFilter)));
 }
 function resetFilters(){search.value='';activeFilter='all';applyFilters();}
 search.addEventListener('input',applyFilters);
 filters.forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;applyFilters();}));
 root.querySelector('#pk-clear').addEventListener('click',resetFilters);
 root.querySelector('#pk-reset').addEventListener('click',()=>{resetFilters();search.focus();});
 applyFilters();
 root.querySelectorAll('[data-market-search]').forEach(button=>button.addEventListener('click',()=>{
  search.value=button.dataset.marketSearch;activeFilter='all';applyFilters();
  root.querySelector('#formats').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 }));
 const dialog=root.querySelector('#pk-format-dialog');
 root.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-detail]');if(!trigger||!root.contains(trigger))return;
  selectedFormat=formats.find(format=>format.id===trigger.dataset.detail);if(!selectedFormat)return;
  root.querySelector('#pk-open-detail').href = '/products/' + encodeURIComponent(selectedFormat.slug) + '/';
  root.querySelector('#pk-dialog-title').textContent=selectedFormat.name;
  root.querySelector('#pk-dialog-description').textContent=selectedFormat.detail;
  const image=root.querySelector('#pk-dialog-image');image.src=window.mewepakClient.formatImage(selectedFormat, assets);image.alt=selectedFormat.alt;
  const list=root.querySelector('#pk-dialog-list');list.replaceChildren(...selectedFormat.questions.map(question=>element('li','',question)));
  root.querySelector('#pk-dialog-category').textContent={film:'Printed film',pouches:'Pouch format',liquid:'Liquid packaging'}[selectedFormat.family];
  dialog.showModal();
 });
 root.querySelector('#pk-dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();});
 const form=root.querySelector('#pk-enquiry-form');
 const review=root.querySelector('#pk-review');
 const formatSelect=root.querySelector('#pk-format');
 function invalidateReview(){review.hidden=true;}
 root.querySelector('#pk-use-format').addEventListener('click',()=>{
  if(!selectedFormat)return;
  formatSelect.value=selectedFormat.id;invalidateReview();dialog.close();
  root.querySelector('#pk-selected-status').hidden=false;root.querySelector('#pk-selected-status').textContent=selectedFormat.name+' selected for your brief.';
  root.querySelector('#packaging-enquiry').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  root.querySelector('#pk-product').focus({preventScroll:true});
 });
 form.addEventListener('input',invalidateReview);
 form.addEventListener('change',()=>{invalidateReview();root.querySelector('#pk-selected-status').hidden=true;});
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);const get=name=>String(data.get(name)||'').trim();
  const selected=formats.find(format=>format.id===get('format'));
  const formatName=selected?selected.name:'Please advise';
  const name=get('name'),email=get('email'),company=get('company'),product=get('product'),quantity=get('quantity'),notes=get('notes');
  const brief='MEWEPAK — PACKAGING BRIEF\n\nName: '+name+'\nEmail: '+email+'\nCompany: '+(company||'Not provided')+'\nFormat: '+formatName+'\nProduct: '+product+'\nApproximate quantity: '+(quantity||'Please advise')+'\n\nProject notes:\n'+notes+'\n\nArtwork can be shared with the Mewepak team during follow-up.';
  root.querySelector('#pk-review-person').textContent=name+'\n'+email;
  root.querySelector('#pk-review-company').textContent=company||'Not provided';
  window.mewepakClient.fillBrief('pk', new FormData(form), brief, formatName);
  root.querySelector('#pk-review-format').textContent=formatName;
  root.querySelector('#pk-review-product').textContent=product;
  root.querySelector('#pk-review-quantity').textContent=quantity||'Please advise';
  root.querySelector('#pk-review-notes').textContent=notes;
  root.querySelector('#pk-download').href='data:text/plain;charset=utf-8,'+encodeURIComponent(brief);
  review.hidden=false;root.querySelector('#pk-review-heading').focus({preventScroll:true});
  review.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 });
 root.querySelector('#pk-edit').addEventListener('click',()=>{review.hidden=true;root.querySelector('#pk-name').focus();});
 const initialImages=[...root.querySelectorAll('img[src]')];
 Promise.all(initialImages.map(img=>img.complete?Promise.resolve():new Promise(done=>{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}))).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{pageReady=true;postSize();})));
 new ResizeObserver(()=>requestAnimationFrame(postSize)).observe(root);
})();


/* Behaviours for the three requested banner updates. */
(function(){
 'use strict';
 const root=document.getElementById('mewepak-homepage');
 const guide=root.querySelector('#pk-eco-dialog');
 root.querySelector('#pk-open-eco').addEventListener('click',()=>guide.showModal());
 root.querySelector('#pk-close-eco').addEventListener('click',()=>guide.close());
 guide.addEventListener('click',event=>{
  if(event.target!==guide)return;
  const r=guide.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)guide.close();
 });
 function visitBrief(){
  root.querySelector('#packaging-enquiry').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  root.querySelector('#pk-name').focus({preventScroll:true});
 }
 root.querySelector('#pk-guide-to-brief').addEventListener('click',()=>{guide.close();visitBrief();});
 root.querySelector('#pk-request-samples').addEventListener('click',()=>{
  const notes=root.querySelector('#pk-enquiry-form textarea');
  const prefix='I would like to request packaging samples.';
  if(!notes.value.includes(prefix))notes.value=prefix+'\nPreferred format(s): \nDelivery country: '+(notes.value.trim()?'\n\nExisting project notes:\n'+notes.value:'');
  root.querySelector('#pk-review').hidden=true;
  const status=root.querySelector('#pk-selected-status');
  status.hidden=false;
  status.textContent='Sample request selected. Add your preferred formats and delivery country to the project notes; availability and shipping will be confirmed.';
  visitBrief();
 });
})();

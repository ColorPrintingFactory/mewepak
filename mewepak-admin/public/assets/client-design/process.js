(function(){
 'use strict';
 const root=document.querySelector('#mewepak-homepage.process-page');
 if(!root)return;
 const assets={"stage-prepress":"/assets/client-design/images/06f09cf509aa7b03.svg","stage-extrusion":"/assets/client-design/images/f2f3054c738581a2.svg","stage-printing":"/assets/client-design/images/75fb677b383ce6dc.svg","stage-lamination":"/assets/client-design/images/2ddd127787e621bb.svg","stage-slitting":"/assets/client-design/images/419f2b075a2e9c99.svg","stage-bag-making":"/assets/client-design/images/d8922e794635b7c8.svg","process-overview":"/assets/client-design/images/a3165775732536a2.svg"};
 const stages=[{"id":"prepress","name":"Prepress","label":"Artwork & plate preparation","short":"Prepare the details","headline":"The details come first.","description":"Artwork, dimensions and layout come together before a design reaches the press. This stage establishes the visual starting point for the pack.","focus":"Artwork layout, colour references and print preparation.","result":"A prepared design for the agreed production route.","keywords":"artwork design plate colour dimensions layout preparation"},{"id":"extrusion","name":"Extrusion","label":"Film formation","short":"Shape the film","headline":"The film takes shape.","description":"Film formation creates the flexible material for the following stages. The film direction begins with the product and its packaging brief.","focus":"The film base and the material requirements of the project.","result":"Flexible film for the next production stage.","keywords":"extrusion film material base formation"},{"id":"printing","name":"Printing","label":"Colour & brand detail","short":"Bring the brand to life","headline":"Your brand comes into view.","description":"The prepared artwork is transferred to the film, bringing the pack\u2019s colour, graphics and product information into view.","focus":"The agreed artwork, print layout and colour references.","result":"Printed film carrying the design of the pack.","keywords":"printing print press graphics colour brand ink"},{"id":"lamination","name":"Lamination","label":"Bringing layers together","short":"Build the structure","headline":"A structure built in layers.","description":"Selected layers are brought together to create the packaging structure. The combination is considered alongside the product, filling and storage requirements.","focus":"The intended material structure and its role in the pack.","result":"A combined film structure for further conversion.","keywords":"lamination layers structure combination material"},{"id":"slitting","name":"Slitting","label":"Reels cut to size","short":"Set the right width","headline":"The right width. The next step.","description":"Wider reels are divided into narrower widths for the next stage. This connects the printed film with the dimensions of the intended packaging format.","focus":"Reel width and the conversion format.","result":"Reels sized for the next operation.","keywords":"slitting slit reels width cutting cut size roll"},{"id":"bag-making","name":"Bag Making","label":"Forming & sealing","short":"Create the finished form","headline":"Film becomes a finished pack.","description":"Prepared film is formed and sealed into the agreed pouch or bag format. The shape, seal layout and opening details bring the packaging design together.","focus":"The agreed format, dimensions and pack features.","result":"Finished pouches or bags in the specified format.","keywords":"bag making pouch forming form sealing seal finished conversion"}];
 const $=s=>root.querySelector(s);
 const tabs=$('#pr-tabs');
 const panel=$('#pr-stage-panel');
 let current=0;
 const pad=i=>String(i+1).padStart(2,'0');
 function selectStage(index,focusTab=false){
  current=(index+stages.length)%stages.length;
  const stage=stages[current];
  tabs.querySelectorAll('[role=tab]').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===current));tab.tabIndex=i===current?0:-1;});
  panel.setAttribute('aria-labelledby','pr-tab-'+current);
  $('#pr-stage-label').textContent=pad(current)+' / '+stage.label.toUpperCase();
  $('#pr-stage-image').src=assets['stage-'+stage.id];
  $('#pr-stage-image').alt=stage.label+' process illustration';
  $('#pr-stage-headline').textContent=stage.headline;
  $('#pr-stage-description').textContent=stage.description;
  $('#pr-stage-focus').textContent=stage.focus;
  $('#pr-stage-result').textContent=stage.result;
  $('#pr-step-count').textContent=pad(current);
  if(focusTab)$('#pr-tab-'+current).focus({preventScroll:true});
 }
 tabs.replaceChildren();
 stages.forEach((stage,i)=>{
  const tab=document.createElement('button');tab.type='button';tab.className='pr-tab';tab.id='pr-tab-'+i;
  tab.setAttribute('role','tab');tab.setAttribute('aria-controls','pr-stage-panel');
  const num=document.createElement('span');num.textContent=pad(i);
  const words=document.createElement('span');const title=document.createElement('strong');title.textContent=stage.name;
  const sub=document.createElement('small');sub.textContent=stage.short;words.append(title,sub);
  const arrow=document.createElement('i');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  tab.append(num,words,arrow);tab.addEventListener('click',()=>selectStage(i));tabs.append(tab);
 });
 selectStage(0);
 const mobile=window.matchMedia('(max-width:700px)');
 const orientation=()=>tabs.setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');orientation();mobile.addEventListener('change',orientation);
 tabs.addEventListener('keydown',event=>{
  if(!event.target.closest('[role=tab]'))return;
  let target;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')target=current+1;
  if(event.key==='ArrowLeft'||event.key==='ArrowUp')target=current-1;
  if(event.key==='Home')target=0;
  if(event.key==='End')target=stages.length-1;
  if(target!==undefined){event.preventDefault();selectStage(target,true);}
 });
 $('#pr-prev').addEventListener('click',()=>selectStage(current-1));
 $('#pr-next').addEventListener('click',()=>selectStage(current+1));
 root.querySelectorAll('[data-stage-link]').forEach(link=>link.addEventListener('click',()=>selectStage(Number(link.dataset.stageLink))));
 root.querySelectorAll('[data-download]').forEach(link=>link.href=assets[link.dataset.download]);
 const checklist='MEWEPAK — PACKAGING PROJECT CHECKLIST\n\nProduct and intended fill quantity:\nPreferred pouch or bag format:\nApproximate dimensions:\nOpening and closure preferences:\nFilling and storage conditions:\nArtwork, logo and colour references available:\nApproximate quantity per design:\nQuestions for the packaging conversation:\n\nAttach artwork and reference photos to your email before sending to our team'+(document.body.dataset.mewepakContactEmail ? ' at '+document.body.dataset.mewepakContactEmail : '')+'.\n';
 $('#pr-checklist-download').href='data:text/plain;charset=utf-8,'+encodeURIComponent(checklist);

 const form=$('#pr-enquiry-form');let briefUrl='';
 const review=$('#pr-review');
 function clearReview(){review.hidden=true;if(briefUrl){URL.revokeObjectURL(briefUrl);briefUrl='';}$('#pr-download-brief').removeAttribute('href');}
 form.addEventListener('input',clearReview);form.addEventListener('change',clearReview);
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  clearReview();const data=new FormData(form);
  const fields=[['Name',data.get('name').trim()],['Email',data.get('email').trim()],['Company',data.get('company').trim()],['Product',data.get('product').trim()],['Preferred format',data.get('format')||'Please advise'],['Approximate quantity',data.get('quantity').trim()||'To discuss'],['Project stage',data.get('projectStage')],['Project notes',data.get('notes').trim()]];
  const details=$('#pr-review-details');details.replaceChildren();
  fields.forEach(([label,value])=>{const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;details.append(dt,dd);});
  const text='MEWEPAK — PACKAGING PROJECT BRIEF\n\n'+fields.map(([label,value])=>label+': '+value).join('\n\n')+'\n\nOur team will follow up for artwork or reference photos.\n';
  window.mewepakClient.fillBrief('pr', data, text);
  briefUrl=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));$('#pr-download-brief').href=briefUrl;
  review.hidden=false;$('#pr-review-title').focus();
 });
 $('#pr-edit-brief').addEventListener('click',()=>{clearReview();form.elements.namedItem('name').focus();});

 const search=$('#pr-footer-search');
 if(search){search.addEventListener('submit',event=>{
  event.preventDefault();const input=$('#pr-footer-search-input');const query=input.value.trim().toLocaleLowerCase();
  const index=stages.findIndex(stage=>query&&[stage.name,stage.label,stage.keywords].join(' ').toLowerCase().includes(query));
  const status=$('#pr-footer-status');
  if(index<0){status.textContent='Try a stage such as artwork, film, printing or sealing.';return;}
  selectStage(index);status.textContent='Showing '+stages[index].name+'.';$('#process-stages').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});panel.focus({preventScroll:true});
 });}
})();

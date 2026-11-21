import homeCopy from './i18n/home.json' with { type:'json' };
import formats from './i18n/formats.json' with { type:'json' };
import ui from './i18n/ui.json' with { type:'json' };
import { hasLocalizedVersion, languageSwitcher, localizedPath } from './i18n.js';

const languages = ['de','es','fr','ar'];
const strings = {
  de: { banner:'Banner {current} von {total}', product:'Verpackungsbeispiel {current} von {total}', overview:'Alle anzeigen', subscribed:'Vielen Dank für Ihre Anmeldung.' },
  es: { banner:'Banner {current} de {total}', product:'Envase destacado {current} de {total}', overview:'Ver todo', subscribed:'Gracias por suscribirse.' },
  fr: { banner:'Bannière {current} sur {total}', product:'Emballage {current} sur {total}', overview:'Tout voir', subscribed:'Merci de votre inscription.' },
  ar: { banner:'الشريحة {current} من {total}', product:'العبوة {current} من {total}', overview:'عرض الكل', subscribed:'شكراً لاشتراكك.' },
};
const escape = value => value.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const entities = { amp:'&', apos:"'", quot:'"', nbsp:' ', lt:'<', gt:'>', rsquo:'’', ndash:'–' };
function normalized(input) {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(whole,entity) => {
    const key=entity.toLowerCase();
    if (Object.hasOwn(entities,key)) return entities[key];
    if (!key.startsWith('#')) return whole;
    const code=key.startsWith('#x') ? parseInt(key.slice(2),16) : Number(key.slice(1));
    return Number.isInteger(code) && code>0 && code<=0x10ffff ? String.fromCodePoint(code) : whole;
  }).trim().replace(/\s+/gu,' ');
}

export function localizeSharedHome(response, lang) {
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
  const phrases=Object.fromEntries(Object.entries(homeCopy).map(([key,value])=>[key,value[languages.indexOf(lang)]]));
  const t=ui[lang];
  const labels=strings[lang];
  function translate(value) {
    const key=normalized(value);
    if (Object.hasOwn(phrases,key)) return phrases[key];
    const trailing=/^(.*?)\s*(↗|→|▾|\.\.\.|\|)$/.exec(key);
    if (trailing && Object.hasOwn(phrases,trailing[1].trim())) return phrases[trailing[1].trim()]+' '+trailing[2];
    if (key.includes('All rights reserved.')) return key.replace('All rights reserved.',phrases['All rights reserved.']);
    if (/^(Call Us|Toll-Free|Front Desk):/.test(key)) return key.replace(/^[^:]+/,text=>phrases[text]||text);
    if (/^Featured packaging 1 of 4$/.test(key)) return labels.product.replace('{current}','1').replace('{total}','4');
    return null;
  }
  let node='';
  const result=new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('lang',lang);el.setAttribute('dir',lang==='ar'?'rtl':'ltr');}})
    .on('head',{element(el){el.append('<link rel="stylesheet" href="/assets/shared-localized-home.css?v=1">',{html:true});}})
    .on('body',{element(el){
      const entries=Object.fromEntries(Object.entries(formats).map(([slug,value])=>['/products/'+slug,value[lang].slice(0,2)]));
      const client = JSON.stringify({ phrases, labels, entries }).replace(/</g,'\\u003c');
      el.prepend(`<script type="application/json" id="mewepak-home-language">${client}</script>`,{html:true});
    },text(chunk){
      node+=chunk.text;
      if (!chunk.lastInTextNode) { chunk.remove(); return; }
      const translated=translate(node);
      chunk.replace(translated===null?node:node.match(/^\s*/)[0]+escape(translated)+node.match(/\s*$/)[0],{html:true});
      node='';
    }})
    .on('body [aria-label],body [placeholder],body [alt],body [title]',{element(el){
      for (const name of ['aria-label','placeholder','alt','title']) {
        const value=el.getAttribute(name);
        const localized=value&&translate(value);
        if (localized) el.setAttribute(name,localized);
      }
    }})
    .on('.mwl-switch',{element(el){el.replace(languageSwitcher('/',lang),{html:true});}})
    .on('body a[href]',{element(el){
      const href=el.getAttribute('href');
      if (!/^\/(?![\/\\])/.test(href) || href.startsWith('/assets/')) return;
      const [slug]=href.split(/[?#]/);
      const path=slug.replace(/\/+$/,'')+'/';
      if (hasLocalizedVersion(path,lang)) {
        el.setAttribute('href',localizedPath(path,lang)+href.slice(slug.length));
      } else {
        el.setAttribute('hreflang','en');
      }
    }})
    .on('form[role="search"][action="/"]',{element(el){el.setAttribute('action',localizedPath('/',lang));}})
    .on('form[data-mewepak-subscribe]',{element(el){
      el.setAttribute('data-locale',lang);
      el.setAttribute('data-form-success',labels.subscribed);
      el.setAttribute('data-form-failure',t.failure);
      el.setAttribute('data-form-checking',t.checking);
      el.setAttribute('data-form-verification',t.verification);
    }})
    .transform(response);
  result.headers.set('content-language',lang);
  result.headers.delete('content-length');
  return result;
}

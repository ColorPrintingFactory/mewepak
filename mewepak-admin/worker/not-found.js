import { siteIcons } from './site-icons.js';

const copy = {
  en: ['Page not found', 'This page may have moved. Explore our packaging formats or tell us what you’re looking for.', 'Home', 'Browse packaging', 'Contact us'],
  de: ['Seite nicht gefunden', 'Die Seite wurde möglicherweise verschoben. Sehen Sie sich unsere Verpackungsformate an oder schreiben Sie uns, wonach Sie suchen.', 'Startseite', 'Verpackungen ansehen', 'Kontakt'],
  es: ['Página no encontrada', 'Es posible que la página haya cambiado de dirección. Consulta nuestros formatos de envase o cuéntanos qué necesitas.', 'Inicio', 'Ver formatos', 'Contacto'],
  fr: ['Page introuvable', 'Cette page a peut-être été déplacée. Découvrez nos formats d’emballage ou dites-nous ce que vous recherchez.', 'Accueil', 'Voir les emballages', 'Nous contacter'],
  ar: ['الصفحة غير موجودة', 'ربما تغيّر عنوان هذه الصفحة. تصفّح أشكال التغليف المتاحة أو أخبرنا بما تبحث عنه.', 'الرئيسية', 'تصفّح أشكال التغليف', 'تواصل معنا'],
};

export function notFoundPage(lang = 'en', method = 'GET') {
  const [title, description, home, products, contact] = copy[lang];
  const prefix = lang === 'en' ? '' : '/' + lang;
  const body = `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Mewepak</title>${siteIcons}
<style>
  *{box-sizing:border-box}
  body{margin:0;font:1rem/1.65 Arial,Helvetica,sans-serif;background:#f2f6f5;color:#102b35}
  header,main{padding-inline:clamp(20px,6vw,80px)}
  header{background:white;padding-block:16px;border-bottom:1px solid #d9e4e2}
  header img{display:block;width:145px;height:auto}
  main{max-width:62rem;padding-block:clamp(3rem,11vw,8rem)}
  h1{margin:0;font-size:clamp(2.2rem,7vw,4rem);line-height:1.1}
  p{max-width:49ch;margin-block:1.25rem 1.75rem}
  nav{display:flex;flex-wrap:wrap;gap:10px}
  nav a{border:1px solid #102b35;border-radius:5px;padding:9px 16px;min-height:44px;color:#102b35;text-decoration:none}
  nav a:first-child{background:#102b35;color:#fff}
  a:focus-visible{outline:2px solid #007b79;outline-offset:3px}
</style>
</head><body>
<header><a href="${prefix}/" aria-label="${home}"><img src="/assets/media/home-thumbs/mewepak-logo-420.webp" alt="Mewepak"></a></header>
<main><h1>${title}</h1><p>${description}</p>
<nav><a href="${prefix}/products/">${products}</a><a href="${prefix}/contact/">${contact}</a><a href="${prefix}/">${home}</a></nav></main>
</body></html>`;
  return new Response(method === 'HEAD' ? null : body, {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex', 'cache-control': 'no-store' },
  });
}

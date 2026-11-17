import { json, restRequest } from '../lib/http.js';

const definitions = {
  categories: { table: 'product_categories', select: 'id,name,slug,short_description,image_url,menu_group,menu_order', order: 'menu_order.asc' },
  products: { table: 'products', select: 'id,name,slug,short_description,primary_image_url,gallery_urls,is_featured,sort_order,category:product_categories(name,slug)', order: 'sort_order.asc' },
  articles: { table: 'articles', select: 'id,title,slug,excerpt,featured_image_url,published_at', order: 'published_at.desc' },
};

export async function onRequestGet({ request, env }) {
  const type = new URL(request.url).searchParams.get('type') || '';
  const definition = definitions[type];
  if (!definition) return json({ error: 'Unsupported content type.' }, 400);
  try {
    const query = new URLSearchParams({ select: definition.select, status: 'eq.published', order: definition.order, limit: type === 'products' ? '24' : '100' });
    const response = await restRequest(env, `${definition.table}?${query}`);
    if (!response.ok) return json({ error: 'Content is unavailable.' }, 502);
    return json(await response.json());
  } catch {
    return json({ error: 'Content is unavailable.' }, 500);
  }
}

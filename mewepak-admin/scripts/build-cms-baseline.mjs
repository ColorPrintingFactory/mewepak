import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const migration = JSON.parse(await readFile(new URL('../migration/wordpress-content.json', import.meta.url)));
const baseline = {};
const hash = (text) => createHash('sha256').update(text || '').digest('hex');
const add = (path, row) => {
  baseline[path] = {
    title: row.title || row.name,
    short_description: row.short_description,
    image_url: row.image_url,
    primary_image_url: row.primary_image_url,
    gallery_urls: row.gallery_urls,
    featured_image_url: row.featured_image_url,
    body_hash: row.body === undefined ? undefined : hash(row.body),
    description_hash: row.description === undefined ? undefined : hash(row.description),
    seo_title: row.seo_title || '',
    seo_description: row.seo_description || '',
  };
};

for (const page of migration.pages) add(page.slug === 'home' ? '/' : '/' + page.slug + '/', page);
for (const category of migration.product_categories) add('/products/' + category.slug + '/', category);
for (const product of migration.products) add('/products/' + product.category_slug + '/' + product.slug + '/', product);
for (const article of migration.articles) add('/' + article.slug + '/', article);

await writeFile(new URL('../public/assets/original/cms-baseline.json', import.meta.url), JSON.stringify(baseline) + '\n');

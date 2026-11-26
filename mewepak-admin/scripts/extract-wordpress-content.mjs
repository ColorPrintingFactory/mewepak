import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const POST_COLUMNS = [
  'id', 'post_author', 'post_date', 'post_date_gmt', 'post_content', 'post_title',
  'post_excerpt', 'post_status', 'comment_status', 'ping_status', 'post_password',
  'post_name', 'to_ping', 'pinged', 'post_modified', 'post_modified_gmt',
  'post_content_filtered', 'post_parent', 'guid', 'menu_order', 'post_type',
  'post_mime_type', 'comment_count',
];
const META_COLUMNS = ['meta_id', 'post_id', 'meta_key', 'meta_value'];
const TERM_COLUMNS = ['term_id', 'name', 'slug', 'term_group'];
const TAXONOMY_COLUMNS = ['term_taxonomy_id', 'term_id', 'taxonomy', 'description', 'parent', 'count'];
const RELATIONSHIP_COLUMNS = ['object_id', 'term_taxonomy_id', 'term_order'];
const COMMERCE_SLUGS = new Set(['shop', 'cart', 'checkout', 'my-account']);
const UNUSED_PAGE_SLUGS = new Set(['sample-page']);
const TERM_META_COLUMNS = ['meta_id', 'term_id', 'meta_key', 'meta_value'];

function decodeEscape(char) {
  return ({ n: '\n', r: '\r', t: '\t', 0: '\0', Z: '\x1a' })[char] ?? char;
}

function parseTuple(source) {
  const values = [];
  let token = '';
  let quoted = false;
  let wasQuoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '\\') {
        index += 1;
        token += decodeEscape(source[index] ?? '');
      } else if (char === "'") {
        quoted = false;
      } else {
        token += char;
      }
      continue;
    }
    if (char === "'") {
      quoted = true;
      wasQuoted = true;
    } else if (char === ',') {
      values.push(coerce(token, wasQuoted));
      token = '';
      wasQuoted = false;
    } else {
      token += char;
    }
  }
  values.push(coerce(token, wasQuoted));
  return values;
}

function coerce(value, quoted) {
  if (quoted) return value;
  const trimmed = value.trim();
  if (/^null$/i.test(trimmed)) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function rowObject(columns, values) {
  return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
}

function rowsForTable(sql, table, columns) {
  const prefix = `INSERT INTO \`${table}\` VALUES (`;
  return sql.split('\n')
    .filter((line) => line.startsWith(prefix) && line.endsWith(');'))
    .map((line) => rowObject(columns, parseTuple(line.slice(prefix.length, -2))));
}

function isoDate(value) {
  if (!value || value.startsWith('0000-00-00')) return null;
  return `${value.replace(' ', 'T')}Z`;
}

function htmlText(value = '') {
  return value
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

const inputPath = resolve(process.argv[2] || '../studio-backup-db-export-2026-11-17-14-03-08.sql');
const outputPath = resolve(process.argv[3] || './migration/wordpress-content.json');
const sql = await readFile(inputPath, 'utf8');

const posts = rowsForTable(sql, 'wp_posts', POST_COLUMNS);
const postMetaRows = rowsForTable(sql, 'wp_postmeta', META_COLUMNS);
const terms = rowsForTable(sql, 'wp_terms', TERM_COLUMNS);
const taxonomies = rowsForTable(sql, 'wp_term_taxonomy', TAXONOMY_COLUMNS);
const relationships = rowsForTable(sql, 'wp_term_relationships', RELATIONSHIP_COLUMNS);
const termMetaRows = rowsForTable(sql, 'wp_termmeta', TERM_META_COLUMNS);

const postMeta = new Map();
for (const row of postMetaRows) {
  if (!postMeta.has(row.post_id)) postMeta.set(row.post_id, new Map());
  postMeta.get(row.post_id).set(row.meta_key, row.meta_value);
}
const termById = new Map(terms.map((row) => [row.term_id, row]));
const termMeta = new Map();
for (const row of termMetaRows) {
  if (!termMeta.has(row.term_id)) termMeta.set(row.term_id, new Map());
  termMeta.get(row.term_id).set(row.meta_key, row.meta_value);
}
const taxonomyById = new Map(taxonomies.map((row) => [row.term_taxonomy_id, row]));
const postTerms = new Map();
for (const row of relationships) {
  if (!postTerms.has(row.object_id)) postTerms.set(row.object_id, []);
  const taxonomy = taxonomyById.get(row.term_taxonomy_id);
  const term = taxonomy ? termById.get(taxonomy.term_id) : null;
  if (taxonomy && term) postTerms.get(row.object_id).push({ ...term, taxonomy: taxonomy.taxonomy, description: taxonomy.description });
}

const attachmentById = new Map();
const media = posts.filter((post) => post.post_type === 'attachment').map((post) => {
  const meta = postMeta.get(post.id) || new Map();
  const sourceFile = meta.get('_wp_attached_file') || '';
  const item = {
    wordpress_id: post.id,
    file_name: basename(sourceFile || post.guid),
    source_file: sourceFile,
    original_url: post.guid,
    mime_type: post.post_mime_type || '',
    alt_text: meta.get('_wp_attachment_image_alt') || post.post_excerpt || '',
    title: post.post_title || '',
  };
  attachmentById.set(post.id, item);
  return item;
});

function featuredImage(postId) {
  const attachmentId = Number(postMeta.get(postId)?.get('_thumbnail_id'));
  const attachment = attachmentById.get(attachmentId);
  return attachment?.source_file || '';
}

function mediaUrl(sourceFile) {
  return sourceFile ? `/assets/media/${sourceFile.split('/').map(encodeURIComponent).join('/')}` : '';
}

function seo(postId) {
  const meta = postMeta.get(postId) || new Map();
  return {
    seo_title: meta.get('rank_math_title') || '',
    seo_description: meta.get('rank_math_description') || '',
  };
}

const productCategories = taxonomies
  .filter((row) => row.taxonomy === 'product_cat')
  .map((row, index) => {
    const term = termById.get(row.term_id);
    const thumbnailId = Number(termMeta.get(row.term_id)?.get('thumbnail_id'));
    return {
      wordpress_id: row.term_id,
      name: term?.name || '',
      slug: term?.slug || '',
      short_description: row.description || '',
      image_source_file: attachmentById.get(thumbnailId)?.source_file || '',
      image_url: mediaUrl(attachmentById.get(thumbnailId)?.source_file || ''),
      menu_group: ['quad-seal-bag', 'flat-pouch', 'shaped-pouch'].includes(term?.slug) ? 'specialty-packaging' : 'pouch-formats',
      menu_order: (index + 1) * 10,
      status: 'published',
    };
  });

const publishedPages = posts.filter((post) => post.post_type === 'page' && post.post_status === 'publish');
const pageById = new Map(publishedPages.map((post) => [post.id, post]));
function pagePath(post, seen = new Set()) {
  if (!post?.post_parent || seen.has(post.id)) return post?.post_name || '';
  seen.add(post.id);
  const parent = pageById.get(post.post_parent);
  return parent ? `${pagePath(parent, seen)}/${post.post_name}` : post.post_name;
}

const pages = publishedPages
  .filter((post) => !COMMERCE_SLUGS.has(post.post_name) && !UNUSED_PAGE_SLUGS.has(post.post_name))
  .map((post) => ({
    wordpress_id: post.id,
    title: post.post_title,
    slug: pagePath(post),
    parent_wordpress_id: post.post_parent || null,
    template_key: postMeta.get(post.id)?.get('_wp_page_template') || 'page-default',
    summary: post.post_excerpt || htmlText(post.post_content).slice(0, 320),
    sections: post.post_content ? [{ type: 'legacy_wordpress', raw_html: post.post_content }] : [],
    status: 'published',
    sort_order: post.menu_order || 0,
    ...seo(post.id),
    created_at: isoDate(post.post_date_gmt),
    updated_at: isoDate(post.post_modified_gmt),
  }));

const products = posts
  .filter((post) => post.post_type === 'product' && post.post_status === 'publish')
  .map((post) => {
    const meta = postMeta.get(post.id) || new Map();
    const gallery = String(meta.get('_product_image_gallery') || '').split(',').filter(Boolean).map(Number).map((id) => attachmentById.get(id)?.source_file).filter(Boolean);
    const category = (postTerms.get(post.id) || []).find((term) => term.taxonomy === 'product_cat');
    return {
      wordpress_id: post.id,
      category_slug: category?.slug || null,
      name: post.post_title,
      slug: post.post_name,
      short_description: post.post_excerpt || htmlText(post.post_content).slice(0, 320),
      description: post.post_content,
      primary_image_source_file: featuredImage(post.id),
      primary_image_url: mediaUrl(featuredImage(post.id)),
      gallery_source_files: gallery,
      gallery_urls: gallery.map(mediaUrl),
      is_featured: (postTerms.get(post.id) || []).some((term) => term.taxonomy === 'product_visibility' && term.slug === 'featured'),
      sort_order: post.menu_order || 0,
      status: 'published',
      ...seo(post.id),
      created_at: isoDate(post.post_date_gmt),
      updated_at: isoDate(post.post_modified_gmt),
    };
  });

const articles = posts
  .filter((post) => post.post_type === 'post' && post.post_status === 'publish')
  .map((post) => ({
    wordpress_id: post.id,
    title: post.post_title,
    slug: post.post_name,
    excerpt: post.post_excerpt || htmlText(post.post_content).slice(0, 320),
    body: post.post_content,
    featured_image_source_file: featuredImage(post.id),
    featured_image_url: mediaUrl(featuredImage(post.id)),
    status: 'published',
    published_at: isoDate(post.post_date_gmt),
    ...seo(post.id),
    created_at: isoDate(post.post_date_gmt),
    updated_at: isoDate(post.post_modified_gmt),
  }));

const output = {
  generated_at: new Date().toISOString(),
  source: basename(inputPath),
  note: 'Original WordPress HTML and media paths are retained. Commerce pages and trashed products are intentionally excluded.',
  counts: { categories: productCategories.length, products: products.length, pages: pages.length, articles: articles.length, media: media.length },
  product_categories: productCategories,
  products,
  pages,
  articles,
  media: media.map((item) => ({ ...item, public_url: mediaUrl(item.source_file) })),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output: outputPath, ...output.counts }, null, 2));

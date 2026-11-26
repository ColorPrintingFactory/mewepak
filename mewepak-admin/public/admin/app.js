import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.0';

const app = document.querySelector('#app');
const dialog = document.querySelector('#editor-dialog');
const toastRegion = document.querySelector('#toast-region');
const moduleState = new Map();
let supabase;
let currentUser;
let activeSection = 'overview';
let cachedCategories = [];
let cachedProducts = [];
let renderToken = 0;
const listViewState = {
  products: { query: '', category: '', status: '', page: 1, pageSize: 25 },
};

const navGroups = [
  { label: '工作台', items: [{ id: 'overview', label: '工作台', icon: 'grid' }] },
  { label: '产品管理', items: [
    { id: 'categories', label: '产品分类', icon: 'layers' },
    { id: 'products', label: '产品', icon: 'box' },
    { id: 'models', label: '3D 模型', icon: 'cube' },
  ] },
  { label: '网站内容', items: [
    { id: 'pages', label: '页面', icon: 'file' },
    { id: 'articles', label: '文章', icon: 'book' },
    { id: 'media', label: '媒体库', icon: 'image' },
    { id: 'settings', label: '网站设置', icon: 'sliders', adminOnly: true },
  ] },
  { label: '客户咨询', items: [
    { id: 'appointments', label: '预约记录', icon: 'calendar', adminOnly: true },
    { id: 'booking-settings', label: '预约时间设置', icon: 'clock', adminOnly: true },
    { id: 'inquiries', label: '询价记录', icon: 'mail', adminOnly: true },
    { id: 'subscribers', label: '邮件订阅', icon: 'mail', adminOnly: true },
  ] },
];

const adminOnlySections = new Set(['settings', 'appointments', 'booking-settings', 'inquiries', 'subscribers']);

const siteSettingEditors = {
  brand: { title: '网站品牌', fields: [
    { name: 'name', label: '网站名称' },
    { name: 'tagline', label: '品牌标语' },
    { name: 'logo_url', label: '网站标志链接', full: true },
    { name: '_logo', label: '上传网站标志', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'logo_url', folder: 'branding', full: true },
  ] },
  company_contact: { title: '联系方式', fields: [
    { name: 'email', label: '联系邮箱', type: 'email', full: true },
    { name: 'phone', label: '联系电话', type: 'tel', help: '请包含国际区号。' },
    { name: 'whatsapp', label: 'WhatsApp 号码', type: 'tel', help: '请包含国际区号。' },
  ] },
  us_locations: { title: '页脚美国联系方式', fields: [
    { name: 'address_1', label: '美国地址 1', full: true },
    { name: 'address_2', label: '美国地址 2', full: true },
    { name: 'address_3', label: '美国地址 3', full: true },
    { name: 'toll_free', label: '美国免费电话', type: 'tel' },
    { name: 'front_desk', label: '美国前台电话', type: 'tel' },
  ] },
  factory_tour: { title: '工厂视频', fields: [
    { name: 'video_url', label: '视频链接', full: true, help: '请填写 MP4 或 WebM 视频文件的直接链接，也可上传文件。' },
    { name: '_video', label: '上传工厂视频', type: 'file', accept: 'video/mp4,video/webm', target: 'video_url', folder: 'factory-videos', full: true },
    { name: 'poster_url', label: '视频封面链接', full: true },
    { name: '_poster', label: '上传视频封面', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'poster_url', folder: 'factory-posters', full: true },
  ] },
  social_media: { title: '社交媒体', fields: [
    { name: 'whatsapp_url', label: 'WhatsApp 链接', full: true, help: '例如：https://wa.me/8613537663353' },
    { name: 'facebook_url', label: 'Facebook 链接', full: true },
    { name: 'instagram_url', label: 'Instagram 链接', full: true },
    { name: 'linkedin_url', label: 'LinkedIn 链接', full: true },
    { name: 'twitter_url', label: 'X / Twitter 链接', full: true },
    { name: 'youtube_url', label: 'YouTube 链接', full: true },
    { name: 'tiktok_url', label: 'TikTok 链接', full: true },
    { name: 'pinterest_url', label: 'Pinterest 链接', full: true },
  ] },
  languages: { title: '语言入口', fields: [] },
};

const recordNames = {
  categories: '产品分类', products: '产品', pages: '页面', articles: '文章',
  models: '3D 模型', media: '素材', settings: '网站设置', inquiries: '询价', subscribers: '订阅',
};

function findSettingEditor(key) {
  return Object.hasOwn(siteSettingEditors, key) ? siteSettingEditors[key] : null;
}

function languageRow(link = {}) {
  return `<div class="language-row" data-language-row><label>语言名称<input class="control" name="language_label" value="${esc(link.label)}" placeholder="例如：简体中文" required></label><label>页面链接<input class="control" name="language_url" value="${esc(link.url)}" placeholder="/zh-cn/" required></label><button type="button" class="btn btn-plain" data-remove-language>移除</button></div>`;
}

function isSiteLink(value) {
  if (/^\/(?![\\/])/.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function settingSummary(row) {
  const value = row.value || {};
  if (row.key === 'brand') return [value.name, value.tagline].filter(Boolean).join(' · ');
  if (row.key === 'company_contact') return [value.email, value.phone, value.whatsapp].filter(Boolean).join(' · ');
  if (row.key === 'us_locations') return [value.address_1, value.address_2, value.address_3, value.toll_free, value.front_desk].filter(Boolean).join(' · ');
  if (row.key === 'factory_tour') return value.video_url ? '已设置视频' : '尚未上传视频';
  if (row.key === 'social_media') {
    const active = ['whatsapp_url','facebook_url','instagram_url','linkedin_url','twitter_url','youtube_url','tiktok_url','pinterest_url']
      .filter((key) => value[key]).length;
    return active ? `已设置 ${active} 个社媒入口` : '尚未添加社媒链接';
  }
  if (row.key === 'languages') return value.links?.length ? value.links.map((link) => link.label).join('、') : '尚未添加其他语言入口';
  return '高级设置';
}

const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.3 7.7 7.7 4.4 7.7-4.4M12 12.1V21"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M21 3v18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  external: '<path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
};

const definitions = {
  categories: {
    table: 'product_categories', title: '产品分类',
    description: '管理产品分类、导航顺序和封面图。',
    singular: 'category', add: '新增分类',
    columns: ['name', 'group', 'slug', 'menu', 'order'],
    fields: [
      { name: 'name', label: '分类名称', required: true },
      { name: 'slug', label: '网址路径', required: true },
      { name: 'menu_group', label: '导航分组', type: 'select', options: [['pouch-formats', '袋型包装'], ['specialty-packaging', '特色包装']] },
      { name: 'menu_order', label: '导航顺序', type: 'number', value: 10 },
      { name: 'short_description', label: '简短介绍', type: 'textarea', full: true },
      { name: 'image_url', label: '导航图片链接', type: 'text', full: true, help: '可填写现有图片链接，或直接上传图片。' },
      { name: '_upload', label: '上传导航图片', type: 'file', full: true, accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'image_url', folder: 'category-images' },
      { name: 'show_in_menu', label: '在产品菜单显示', type: 'checkbox', value: true },
      { name: 'status', label: '状态', type: 'select', value: 'draft', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },
      { name: 'seo_title', label: '搜索结果标题', full: true },
      { name: 'seo_description', label: '搜索结果摘要', type: 'textarea', full: true },
    ],
  },
  products: {
    table: 'products', title: '产品', description: '管理产品图片、介绍和包装规格。', singular: 'product', add: '新增产品',
    columns: ['name', 'category', 'slug', 'status'],
    fields: [
      { name: 'name', label: '产品名称', required: true },
      { name: 'slug', label: '网址路径', required: true },
      { name: 'category_id', label: '所属分类', type: 'category', full: true },
      { name: 'short_description', label: '简短介绍', type: 'textarea', full: true },
      { name: 'description', label: '产品详情', type: 'textarea', full: true },
      { name: 'primary_image_url', label: '主图链接', type: 'text', full: true },
      { name: '_upload', label: '上传主图', type: 'file', full: true, accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'primary_image_url', folder: 'product-images' },
      { name: 'gallery_urls', label: '产品图集链接', type: 'array', full: true, help: '每行填写一个图片链接。' },
      { name: 'features', label: '包装特点', type: 'array', full: true, help: '每行填写一项，可以用「标题 — 说明」的格式。' },
      { name: 'material_options', label: '可选材料', type: 'array', full: true, help: '每行填写一项。' },
      { name: 'printing_options', label: '印刷与表面工艺', type: 'array', full: true, help: '每行填写一项。' },
      { name: 'applications', label: '适用场景', type: 'array', full: true, help: '每行填写一项。' },
      { name: 'is_featured', label: '设为推荐产品', type: 'checkbox' },
      { name: 'sort_order', label: '显示顺序', type: 'number', value: 0 },
      { name: 'status', label: '状态', type: 'select', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },
      { name: 'seo_title', label: '搜索结果标题', full: true },
      { name: 'seo_description', label: '搜索结果摘要', type: 'textarea', full: true },
    ],
  },
  pages: {
    table: 'pages', title: '页面', description: '更新网站页面的标题、内容和发布状态。', singular: 'page', add: '新增页面',
    columns: ['title', 'slug', 'template_key', 'status'],
    fields: [
      { name: 'title', label: '页面标题', required: true },
      { name: 'slug', label: '网址路径', required: true },
      { name: 'template_key', label: '页面模板', value: 'page-default' },
      { name: 'summary', label: '页面简介', type: 'textarea', full: true },
      { name: 'page_html', label: '页面正文（HTML）', type: 'textarea', full: true, help: '修改正文会影响前台页面，请保留现有布局代码。' },
      { name: 'sort_order', label: '导航顺序', type: 'number', value: 0 },
      { name: 'status', label: '状态', type: 'select', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },
      { name: 'seo_title', label: '搜索结果标题', full: true },
      { name: 'seo_description', label: '搜索结果摘要', type: 'textarea', full: true },
    ],
  },
  articles: {
    table: 'articles', title: '文章', description: '撰写并发布包装指南和公司资讯。', singular: 'article', add: '新增文章',
    columns: ['title', 'slug', 'published_at', 'status'],
    fields: [
      { name: 'title', label: '文章标题', required: true },
      { name: 'slug', label: '网址路径', required: true },
      { name: 'excerpt', label: '文章摘要', type: 'textarea', full: true },
      { name: 'body', label: '文章正文（HTML）', type: 'textarea', full: true },
      { name: 'featured_image_url', label: '封面图链接', type: 'text', full: true },
      { name: '_upload', label: '上传封面图', type: 'file', full: true, accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'featured_image_url', folder: 'article-images' },
      { name: 'published_at', label: '发布时间', type: 'datetime-local' },
      { name: 'status', label: '状态', type: 'select', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },
      { name: 'seo_title', label: '搜索结果标题', full: true },
      { name: 'seo_description', label: '搜索结果摘要', type: 'textarea', full: true },
    ],
  },
  models: {
    table: 'model_assets', title: '3D 模型', description: '上传模型，并选择要在前台展示该模型的产品。', singular: '3D asset', add: '新增模型',
    columns: ['name', 'product', 'status'],
    fields: [
      { name: 'name', label: '模型名称', required: true },
      { name: 'model_url', label: '模型文件链接', type: 'text', full: true },
      { name: '_upload', label: '上传 3D 模型', type: 'file', full: true, accept: '.glb,.gltf,model/gltf-binary,model/gltf+json,application/octet-stream', target: 'model_url', folder: '3d-models' },
      { name: 'poster_url', label: '预览图链接', type: 'text', full: true },
      { name: '_poster_upload', label: '上传预览图', type: 'file', full: true, accept: 'image/png,image/jpeg,image/webp,image/avif', target: 'poster_url', folder: '3d-posters' },
      { name: 'product_id', label: '关联产品', type: 'product', full: true },
      { name: 'preview_settings', label: '预览参数（JSON）', type: 'json', full: true },
      { name: 'sort_order', label: '显示顺序', type: 'number', value: 0 },
      { name: 'status', label: '状态', type: 'select', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },
    ],
  },
  media: {
    table: 'media_assets', title: '媒体库', description: '上传和管理网站使用的图片、视频及模型。', singular: 'media item', add: '上传素材',
    columns: ['file_name', 'mime_type', 'public_url', 'created_at'],
    fields: [
      { name: 'file_name', label: '文件名称', required: true },
      { name: '_upload', label: '选择文件', type: 'file', full: true, accept: 'image/*,video/mp4,video/webm,.glb,.gltf', target: 'public_url', folder: 'uploads' },
      { name: 'alt_text', label: '图片说明', type: 'textarea', full: true },
      { name: 'public_url', label: '文件链接', type: 'text', full: true },
      { name: 'mime_type', label: '文件格式' },
    ],
  },
  settings: {
    table: 'site_settings', title: '网站设置', description: '修改网站名称、联系方式、社交媒体、工厂视频和语言入口。', singular: 'setting', add: '新增高级设置',
    columns: ['key', 'value', 'is_public'],
    fields: [
      { name: 'key', label: '设置名称', required: true },
      { name: 'value', label: '设置内容（JSON）', type: 'json', full: true, help: '仅供网站维护人员填写自定义设置。' },
      { name: 'is_public', label: '在网站启用', type: 'checkbox' },
    ],
  },
  inquiries: {
    table: 'inquiries', title: '询价记录', description: '查看客户需求并记录跟进进度。', singular: 'inquiry', add: null,
    columns: ['contact_name', 'company', 'email', 'status', 'created_at'], fields: [],
  },
  subscribers: {
    table: 'newsletter_subscribers', title: '邮件订阅',
    description: '查看网站收集的订阅邮箱。', singular: 'subscriber', add: null,
    columns: ['email', 'source_page', 'created_at'], fields: [],
  },
};

function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? esc(value) : new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(date);
}

function showToast(message, error = false) {
  const toast = document.createElement('div');
  toast.className = `toast${error ? ' error' : ''}`;
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function friendlyError(error, fallback = '操作失败，请重试。') {
  const message = String(error?.message || error || '');
  const known = [
    ['category_has_products', '该分类下仍有产品，请先移动或删除这些产品。'],
    ['published_product_requires_category', '发布产品前必须先选择产品分类。'],
    ['published_product_requires_published_category', '发布产品前请先把所属分类设为“已发布”。'],
    ['invalid_model_url', '3D 模型链接必须是有效的 HTTPS / 站内 GLB 或 GLTF 文件。'],
    ['invalid_model_poster_url', '3D 预览图必须是有效的 HTTPS / 站内 PNG、JPG、WebP 或 AVIF 图片。'],
    ['duplicate key value', '保存失败：网址路径或其他唯一字段已被占用。'],
    ['violates check constraint', '保存内容不符合要求，请检查网址路径、状态或关联关系。'],
    ['slot_end', '结束时间必须晚于开始时间。'],
    ['booking_settings', '预约时间设置不符合要求，请检查营业时段和时长。'],
  ];
  return known.find(([needle]) => message.includes(needle))?.[1] || (message && !/database|postgres|constraint|violates/i.test(message) ? message : fallback);
}

function bindDirtyGuard(form) {
  let dirty = false;
  const mark = () => { dirty = true; };
  form.addEventListener('input', mark);
  form.addEventListener('change', mark);
  form._markClean = () => { dirty = false; };
  form.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    if (dirty && !window.confirm('有尚未保存的修改，确定关闭吗？')) return;
    dialog.close();
  }));
  dialog.oncancel = (event) => {
    if (dirty && !window.confirm('有尚未保存的修改，确定关闭吗？')) event.preventDefault();
  };
  dialog.onclose = () => { dialog.oncancel = null; dialog.onclose = null; };
}

function sectionFromHash() {
  const value = location.hash.replace(/^#/, '');
  return navGroups.flatMap((group) => group.items).some((item) => item.id === value) ? value : 'overview';
}

function openPasswordDialog() {
  dialog.innerHTML = `<form id="password-form"><div class="dialog-head"><h2>修改登录密码</h2><button class="icon-btn" type="button" data-close aria-label="关闭">×</button></div><div class="dialog-body"><div class="field-grid"><div class="field full"><label for="new-password">新密码</label><input class="control" id="new-password" name="password" type="password" autocomplete="new-password" minlength="12" required><span class="field-help">至少 12 位，建议同时包含大小写字母、数字和符号。</span></div><div class="field full"><label for="confirm-password">确认新密码</label><input class="control" id="confirm-password" name="confirm" type="password" autocomplete="new-password" minlength="12" required></div></div><div class="error-box" role="alert" hidden></div></div><div class="dialog-foot"><button class="btn btn-plain" type="button" data-close>取消</button><button class="btn btn-primary" type="submit">更新密码</button></div></form>`;
  const form = dialog.querySelector('#password-form');
  form.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = form.elements.password.value;
    const confirm = form.elements.confirm.value;
    const errorBox = form.querySelector('.error-box');
    const button = form.querySelector('[type="submit"]');
    errorBox.hidden = true;
    if (password !== confirm) {
      errorBox.textContent = '两次输入的密码不一致。';
      errorBox.hidden = false;
      return;
    }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      errorBox.textContent = '密码至少 12 位，并需要包含大小写字母、数字和符号。';
      errorBox.hidden = false;
      return;
    }
    button.disabled = true;
    button.textContent = '正在更新…';
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      errorBox.textContent = error.message || '密码更新失败，请重试。';
      errorBox.hidden = false;
      button.disabled = false;
      button.textContent = '更新密码';
      return;
    }
    dialog.close();
    showToast('密码已更新，请妥善保存新密码。');
  });
  dialog.showModal();
}

function setupView() {
  app.innerHTML = `<div class="signin-wrap"><section class="setup-card">
    <div class="signin-brand"><span class="brand-mark">M</span><div class="brand-name">Mewepak 后台</div></div>
    <h1>后台暂不可用</h1>
    <p>请稍后重试，或联系网站维护人员。</p>
    <button class="btn btn-primary" type="button" data-action="reload">重试</button>
  </section></div>`;
  app.querySelector('[data-action="reload"]').addEventListener('click', () => location.reload());
}

function loginView(error = '') {
  app.innerHTML = `<div class="signin-wrap"><section class="signin-card">
    <div class="signin-brand"><span class="brand-mark">M</span><div><div class="brand-name">Mewepak 后台</div><div class="brand-caption">网站管理</div></div></div>
    <h1>登录管理后台</h1><p>请使用已开通的后台账号登录。</p>
    ${error ? `<div class="error-box" role="alert">${esc(error)}</div>` : ''}
    <form class="signin-form" id="login-form">
      <div class="field"><label for="login-email">邮箱</label><input class="control" id="login-email" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label for="login-password">密码</label><input class="control" id="login-password" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary" type="submit">登录 ${icon('arrow')}</button>
    </form>
  </section></div>`;
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    button.textContent = '正在登录…';
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    if (signInError) return loginView('登录失败，请检查邮箱和密码后重试。');
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !isStaff(data.user)) {
      await supabase.auth.signOut();
      return loginView('此账号没有后台访问权限。');
    }
    currentUser = data.user;
    activeSection = 'overview';
    await renderApp();
  });
}

function isStaff(user) {
  const role = user?.app_metadata?.role;
  return role === 'admin' || role === 'editor';
}

function isAdministrator(user = currentUser) {
  return user?.app_metadata?.role === 'admin';
}

function visibleNavGroups() {
  return navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || isAdministrator()),
  })).filter((group) => group.items.length > 0);
}

function pageTitle(id) {
  for (const group of navGroups) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found.label;
  }
  return 'Mewepak 后台';
}

function shellMarkup(content) {
  const email = currentUser?.email || '后台账号';
  const initial = email.trim().charAt(0).toUpperCase() || 'M';
  return `<div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand"><span class="brand-mark">M</span><div><div class="brand-name">Mewepak 后台</div><div class="brand-caption">网站管理后台</div></div></div>
      ${visibleNavGroups().map((group) => `<div class="nav-label">${esc(group.label)}</div><nav class="nav-list">${group.items.map((item) => `<button class="nav-item${activeSection === item.id ? ' active' : ''}" type="button" data-section="${esc(item.id)}">${icon(item.icon)}<span>${esc(item.label)}</span></button>`).join('')}</nav>`).join('')}
      <div class="sidebar-spacer"></div><div class="sidebar-foot"><p><strong>${isAdministrator() ? '管理员' : '内容编辑'}</strong><br>在这里管理网站内容和客户咨询。</p></div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="crumbs"><button type="button" class="mobile-menu" data-action="mobile-menu" aria-label="打开菜单">${icon('menu')}</button><span>Mewepak</span><span>›</span><strong>${esc(pageTitle(activeSection))}</strong></div>
        <div class="top-actions"><span class="env-pill"><span class="env-dot"></span>已连接</span><div class="user-chip"><span class="user-avatar">${esc(initial)}</span><span class="user-name">${esc(email)}</span><button type="button" class="icon-btn" data-action="change-password" aria-label="修改密码" title="修改密码">${icon('lock')}</button><button type="button" class="icon-btn" data-action="signout" aria-label="退出登录">${icon('logout')}</button></div></div>
      </header>
      <section class="content">${content}</section>
    </main>
  </div>`;
}

function heading(title, description, action = '') {
  return `<div class="page-heading"><div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`;
}

function emptyState(title, message) {
  return `<div class="empty-state"><span class="empty-icon">${icon('layers')}</span><strong>${esc(title)}</strong><span>${esc(message)}</span></div>`;
}

function errorState(message) {
  return `<div class="error-box">${esc(message)}</div>`;
}

async function queryTable(table, select = '*', sort = 'created_at', ascending = false) {
  const result = await supabase.from(table).select(select).order(sort, { ascending });
  if (result.error) throw result.error;
  return result.data || [];
}

async function countTable(table, filters = []) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  for (const [key, value] of filters) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function renderOverview() {
  let counts;
  const administrator = isAdministrator();
  try {
    const countRequests = [
      countTable('product_categories'), countTable('products'), countTable('pages'),
    ];
    if (administrator) countRequests.push(countTable('appointments', [['status', 'pending']]));
    counts = await Promise.all(countRequests);
  } catch (error) {
    return `${heading('网站工作台', '暂时无法读取工作台数据。')}${errorState(`请刷新后重试，或联系网站维护人员。`)}`;
  }
  return `${heading('网站工作台', '查看网站概况，快速处理常用工作。', '<a class="btn btn-plain" href="/" target="_blank" rel="noopener">查看网站 ↗</a>')}
    <div class="kpi-grid">
      ${[['产品分类', counts[0], '分类', 'layers'], ['产品', counts[1], '产品', 'box'], ['页面', counts[2], '页面', 'file'], ...(administrator ? [['待确认预约', counts[3], '条待确认', 'calendar']] : [])].map(([label, value, sub, ico]) => `<article class="card kpi"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">${icon(ico)}</span></div><div class="kpi-value">${value}</div><div class="kpi-caption">${sub}</div></article>`).join('')}
    </div>
    <div class="dashboard-grid"><section class="card card-pad"><div class="card-title-row"><div><h2 class="card-title">常用操作</h2><p class="card-note">选择一项开始管理。</p></div></div><div class="quick-list">
      ${[['categories','管理产品分类','设置导航分组、图片和顺序','layers'],['products','管理产品','更新产品介绍、图片和规格','box'],['pages','管理页面','修改页面内容和搜索展示信息','file'],['models','管理 3D 模型','上传并关联产品模型','cube'],...(administrator ? [['inquiries','查看询价','打开客户需求并更新跟进状态','mail'],['settings','修改网站信息','更新品牌、联系方式和视频','sliders']] : [])].map(([id,title,sub,ico])=>`<button class="quick-link" type="button" data-section="${id}"><span class="quick-left"><span class="quick-icon">${icon(ico)}</span><span><span class="quick-title">${title}</span><span class="quick-sub">${sub}</span></span></span><span class="quick-arrow">›</span></button>`).join('')}
    </div></section></div>`;
}

function categoryPreview(rows) {
  const visible = rows.filter((row) => row.show_in_menu && row.status === 'published');
  const groups = [['pouch-formats', '袋型包装'], ['specialty-packaging', '特色包装']];
  return `<div class="menu-preview">${groups.map(([key,label]) => {
    const items = visible.filter((row) => row.menu_group === key).sort((a,b) => a.menu_order - b.menu_order || a.name.localeCompare(b.name));
    return `<section class="card preview-group"><h3>${esc(label)} <span class="preview-count">${items.length} 项</span></h3><div class="preview-items">${items.length ? items.map((row) => `<div class="preview-item"><span class="preview-thumb">${row.image_url ? `<img src="${esc(row.image_url)}" alt="">` : esc(row.name.slice(0,1))}</span><span class="preview-name" title="${esc(row.name)}">${esc(row.name)}</span></div>`).join('') : '<span class="row-secondary">此分组暂无已发布分类</span>'}</div></section>`;
  }).join('')}</div>`;
}

function tableHead(columns) {
  const labels = {
    name: '名称', group: '导航分组', slug: '网址路径', menu: '导航显示', order: '顺序',
    category: '分类', status: '状态', title: '标题', template_key: '模板', published_at: '发布时间',
    model_url: '模型文件', product: '产品', file_name: '文件', mime_type: '类型', public_url: '链接',
    key: '设置项', value: '当前内容', is_public: '启用', contact_name: '联系人', company: '公司', email: '邮箱',
    created_at: '创建时间', booking_date: '日期', slot_start: '时间', meeting_type: '会议形式', topic: '主题',
    alt_text: '图片说明', source_page: '来源页面',
  };
  return `<thead><tr>${columns.map((column) => `<th>${esc(labels[column] || column)}</th>`).join('')}<th style="text-align:right">操作</th></tr></thead>`;
}

function statusBadge(status) {
  const labels = { published: '已发布', draft: '草稿', archived: '已下架', pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' };
  return `<span class="badge ${esc(String(status || '').toLowerCase())}">${esc(labels[status] || '未知状态')}</span>`;
}

function groupChip(group) {
  const label = group === 'specialty-packaging' ? '特色包装' : '袋型包装';
  return `<span class="group-chip${group === 'specialty-packaging' ? ' specialty' : ''}">${label}</span>`;
}

function actionsFor(module, id, allowDelete = true) {
  return `<div class="actions"><button class="icon-btn" type="button" data-action="edit" data-module="${esc(module)}" data-id="${esc(id)}" aria-label="编辑">${icon('edit')}</button>${allowDelete ? `<button class="icon-btn" type="button" data-action="delete" data-module="${esc(module)}" data-id="${esc(id)}" aria-label="删除">${icon('trash')}</button>` : ''}</div>`;
}

function rowFor(module, row) {
  const id = esc(row.id || row.key);
  if (module === 'categories') return `<tr><td><div class="row-primary">${esc(row.name)}</div><div class="row-secondary">${esc(row.short_description || '')}</div></td><td>${groupChip(row.menu_group)}</td><td>${esc(row.slug)}</td><td>${row.show_in_menu ? '<span class="badge published">显示</span>' : '<span class="badge archived">隐藏</span>'}</td><td>${Number(row.menu_order || 0)}</td><td>${actionsFor(module,id)}</td></tr>`;
  if (module === 'products') return `<tr><td><div class="row-product"><span class="product-thumb">${row.primary_image_url ? `<img src="${esc(row.primary_image_url)}" alt="">` : esc((row.name || 'P').slice(0,1))}</span><span><span class="row-primary">${esc(row.name)}</span><span class="row-secondary">${esc(row.short_description || '')}</span></span></div></td><td>${esc(row.category?.name || '未设置')}</td><td>${esc(row.slug)}</td><td>${statusBadge(row.status)}</td><td>${actionsFor(module,id)}</td></tr>`;
  if (module === 'pages') return `<tr><td><div class="row-primary">${esc(row.title)}</div><div class="row-secondary">${esc(row.summary || '')}</div></td><td>${esc(row.slug)}</td><td>${esc(row.template_key)}</td><td>${statusBadge(row.status)}</td><td>${actionsFor(module,id)}</td></tr>`;
  if (module === 'articles') return `<tr><td><div class="row-primary">${esc(row.title)}</div><div class="row-secondary">${esc(row.excerpt || '')}</div></td><td>${esc(row.slug)}</td><td>${formatDate(row.published_at)}</td><td>${statusBadge(row.status)}</td><td>${actionsFor(module,id)}</td></tr>`;
  if (module === 'models') return `<tr><td><div class="row-primary">${esc(row.name)}</div><div class="row-secondary">${esc(row.model_url || '')}</div></td><td>${row.product?.name ? esc(row.product.name) : '未设置'}</td><td>${statusBadge(row.status)}</td><td>${actionsFor(module,id)}</td></tr>`;
  if (module === 'media') {
    const imagePreview = /^image\//i.test(row.mime_type || '') && row.public_url
      ? `<img class="media-thumb" src="${esc(row.public_url)}" alt="">`
      : `<span class="media-file-icon">${icon('file')}</span>`;
    return `<tr><td><div class="row-product">${imagePreview}<span><span class="row-primary">${esc(row.file_name)}</span><span class="row-secondary">${esc(row.alt_text || '')}</span></span></div></td><td>${esc(row.mime_type || '—')}</td><td><a href="${esc(row.public_url)}" target="_blank" rel="noopener">查看文件 ${icon('external')}</a></td><td>${formatDate(row.created_at)}</td><td>${actionsFor(module,id)}</td></tr>`;
  }
  if (module === 'settings') return `<tr><td><div class="row-primary">${esc(findSettingEditor(row.key)?.title || row.key)}</div></td><td><div class="row-secondary">${esc(settingSummary(row) || '尚未填写')}</div></td><td>${row.is_public ? '<span class="badge published">启用</span>' : '<span class="badge archived">未启用</span>'}</td><td>${actionsFor(module,id,!findSettingEditor(row.key))}</td></tr>`;
  if (module === 'inquiries') return `<tr><td><div class="row-primary">${esc(row.contact_name)}</div><div class="row-secondary">${esc(row.phone || '')}</div></td><td>${esc(row.company || '—')}</td><td>${esc(row.email)}</td><td><select class="select-small" data-action="inquiry-status" data-id="${id}">${[['new','待跟进'],['in_progress','跟进中'],['replied','已回复'],['closed','已关闭']].map(([v,l])=>`<option value="${v}"${row.status===v?' selected':''}>${l}</option>`).join('')}</select></td><td>${formatDate(row.created_at)}</td><td><div class="actions"><button class="btn btn-plain" type="button" data-inquiry-detail="${id}">详情</button><button class="icon-btn" type="button" data-action="delete" data-module="inquiries" data-id="${id}" aria-label="删除询价">${icon('trash')}</button></div></td></tr>`;
  if (module === 'subscribers') return `<tr><td>${esc(row.email)}</td><td>${esc(row.source_page)}</td><td>${formatDate(row.created_at)}</td><td><button class="icon-btn" type="button" data-action="delete" data-module="subscribers" data-id="${id}" aria-label="删除订阅">${icon('trash')}</button></td></tr>`;
  return '';
}

async function renderListModule(module) {
  const definition = definitions[module];
  try {
    let rows;
    if (module === 'products') {
      const [result, categories] = await Promise.all([
        supabase.from('products').select('*, category:product_categories(id,name,status)').order('sort_order').order('name'),
        supabase.from('product_categories').select('id,name,status').order('name'),
      ]);
      if (result.error) throw result.error;
      if (categories.error) throw categories.error;
      rows = result.data || [];
      cachedProducts = rows;
      cachedCategories = categories.data || [];
    } else if (module === 'models') {
      const result = await supabase.from('model_assets').select('*, product:products(name)').order('sort_order').order('name');
      if (result.error) throw result.error;
      rows = result.data || [];
    } else if (module === 'settings') {
      const result = await supabase.from('site_settings')
        .select('key,value,is_public,updated_at')
        .neq('key', 'booking_api_secret')
        .order('key', { ascending: true });
      if (result.error) throw result.error;
      rows = result.data || [];
    } else {
      rows = await queryTable(definition.table, '*', module === 'categories' ? 'menu_order' : 'created_at', module === 'categories');
    }
    moduleState.set(module, rows);
    if (module === 'categories') cachedCategories = rows;
    const title = definition.title;
    const addButton = definition.add ? `<button type="button" class="btn btn-primary" data-action="add" data-module="${module}">${icon('plus')}${esc(definition.add)}</button>` : '';
    const exportButton = module === 'inquiries' ? '<button type="button" class="btn btn-plain" data-action="export-inquiries">导出 CSV</button>' : '';
    const menu = module === 'categories' ? categoryPreview(rows) : '';
    let visibleRows = rows;
    let toolbarExtra = '';
    let countLabel = `共 ${rows.length} 条`;
    let pager = '';
    if (module === 'products') {
      const state = listViewState.products;
      const query = state.query.trim().toLowerCase();
      visibleRows = rows.filter((row) =>
        (!query || [row.name,row.slug,row.short_description,row.category?.name].some((value) => String(value || '').toLowerCase().includes(query))) &&
        (!state.category || String(row.category?.id || '') === state.category) &&
        (!state.status || row.status === state.status)
      );
      const total = visibleRows.length;
      const pages = Math.max(1, Math.ceil(total / state.pageSize));
      state.page = Math.min(Math.max(1, state.page), pages);
      const start = (state.page - 1) * state.pageSize;
      visibleRows = visibleRows.slice(start, start + state.pageSize);
      countLabel = `筛选后 ${total} / 共 ${rows.length} 条`;
      toolbarExtra = `<select class="select-small" id="product-category-filter" aria-label="按分类筛选"><option value="">全部分类</option>${cachedCategories.map((row)=>`<option value="${esc(row.id)}"${state.category===String(row.id)?' selected':''}>${esc(row.name)}</option>`).join('')}</select><select class="select-small" id="product-status-filter" aria-label="按状态筛选"><option value="">全部状态</option>${[['draft','草稿'],['published','已发布'],['archived','已下架']].map(([v,l])=>`<option value="${v}"${state.status===v?' selected':''}>${l}</option>`).join('')}</select>`;
      pager = `<div class="pager"><button class="btn btn-plain btn-small" type="button" data-page-step="-1"${state.page<=1?' disabled':''}>上一页</button><span class="row-secondary">第 ${state.page} / ${pages} 页</span><button class="btn btn-plain btn-small" type="button" data-page-step="1"${state.page>=pages?' disabled':''}>下一页</button></div>`;
    }
    const rowsHtml = visibleRows.map((row) => rowFor(module,row)).join('');
    const table = visibleRows.length ? `<div class="table-wrap"><table>${tableHead(definition.columns)}<tbody>${rowsHtml}</tbody></table></div>` : emptyState('没有匹配结果', '请调整搜索词或筛选条件。');
    return `${heading(title, definition.description, addButton + exportButton)}${menu}<section class="card"><div class="toolbar"><div class="toolbar-left"><label class="search-box">${icon('search')}<input id="list-search" type="search" placeholder="搜索${esc(definition.title)}" aria-label="搜索${esc(definition.title)}" value="${esc(module === 'products' ? listViewState.products.query : '')}"></label>${toolbarExtra}</div><div class="toolbar-right"><span class="row-secondary">${countLabel}</span></div></div>${table}${pager}</section>`;
  } catch (error) {
    return `${heading(definition.title, definition.description)}${errorState('暂时无法加载' + definition.title + '。请刷新后重试。')}`;
  }
}

async function renderAppointments() {
  const definition = { title: '预约记录', description: '查看预约详情，确认时间并更新状态。' };
  try {
    const rows = await queryTable('appointments', '*', 'booking_date');
    moduleState.set('appointments', rows);
    const sorted = [...rows].sort((a,b) => `${b.booking_date}${b.slot_start}`.localeCompare(`${a.booking_date}${a.slot_start}`));
    const table = sorted.length ? `<div class="table-wrap"><table><thead><tr><th>联系人</th><th>公司</th><th>预约时间</th><th>会议形式</th><th>主题</th><th>状态</th></tr></thead><tbody>${sorted.map((row) => `<tr><td><div class="row-primary">${esc(row.contact_name)}</div><div class="row-secondary">${esc(row.email)} · ${esc(row.phone)}</div></td><td>${esc(row.company || '—')}</td><td>${esc(row.booking_date)}<div class="row-secondary">${esc(String(row.slot_start).slice(0,5))}–${esc(String(row.slot_end).slice(0,5))} · ${Number(row.meeting_duration_minutes || 0)} 分钟</div><div class="row-secondary">${esc(row.customer_timezone || '')}</div></td><td>${row.meeting_type === 'factory_visit' ? '工厂参观' : '视频会议'}</td><td>${esc(row.topic || '—')}</td><td><select class="select-small" data-action="booking-status" data-id="${esc(row.id)}">${[['pending','待确认'],['confirmed','已确认'],['cancelled','已取消'],['completed','已完成']].map(([v,l])=>`<option value="${v}"${row.status===v?' selected':''}>${l}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : emptyState('暂无预约', '网站访客提交预约后，会在这里显示。');
    return `${heading(definition.title, definition.description, '<button type="button" class="btn btn-plain" data-section="booking-settings">设置可预约时间</button>')}<section class="card">${table}</section>`;
  } catch (error) {
    return `${heading(definition.title, definition.description)}${errorState(`暂时无法加载预约记录，请刷新后重试。`)}`;
  }
}

async function renderBookingSettings() {
  try {
    const { data, error } = await supabase.from('booking_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    const selected = new Set(data.working_days || []);
    const days = [[1,'周一'],[2,'周二'],[3,'周三'],[4,'周四'],[5,'周五'],[6,'周六'],[7,'周日']];
    const durations = Array.isArray(data.meeting_durations) ? data.meeting_durations.join(', ') : '15, 30';
    const timezones = Object.entries(data.timezones || {}).map(([zone, label]) => `${zone}|${label}`).join('\n');
    return `${heading('预约时间设置', '设置客户可选择的日期、时间和会议时长。')}
      <form class="card card-pad" id="schedule-form"><div class="field-grid">
        <div class="field"><label for="booking-title">预约页面标题</label><input class="control" id="booking-title" name="display_title" value="${esc(data.display_title || 'Meet with Mewepak')}" required></div>
        <div class="field"><label for="booking-location">会议方式说明</label><input class="control" id="booking-location" name="display_location" value="${esc(data.display_location || 'Zoom / Factory Visit')}" required></div>
        <div class="field"><label for="booking-avatar">接待人头像链接</label><input class="control" id="booking-avatar" name="avatar_url" value="${esc(data.avatar_url || '')}"></div>
        <div class="field"><label for="booking-avatar-upload">上传头像</label><input class="control" id="booking-avatar-upload" name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp,image/avif"></div>
        <div class="field"><label for="booking-email">预约 / 询价通知邮箱</label><input class="control" id="booking-email" name="notification_email" type="email" value="${esc(data.notification_email || '')}" placeholder="name@company.com"><span class="field-help">新预约和新询价的内部通知都会发送到这里。</span></div>
        <div class="field"><label for="meeting-durations">可选会议时长（分钟）</label><input class="control" id="meeting-durations" name="meeting_durations" value="${esc(durations)}" required><span class="field-help">用逗号分隔，例如 15, 30。</span></div>
        <div class="field full"><label for="timezone-options">客户可选时区</label><textarea class="control" id="timezone-options" name="timezone_options" rows="5" required>${esc(timezones)}</textarea><span class="field-help">每行一个时区，例如 Asia/Shanghai|北京时间。</span></div>
        <div class="field full"><label>开放预约的星期</label><div class="day-picker">${days.map(([n,label])=>`<label class="checkbox-field"><input type="checkbox" name="working_days" value="${n}"${selected.has(n)?' checked':''}><span>${label}</span></label>`).join('')}</div></div>
        <div class="field"><label for="schedule-start">开始时间</label><input class="control" id="schedule-start" name="start_time" type="time" value="${esc(String(data.start_time).slice(0,5))}" required></div>
        <div class="field"><label for="schedule-end">结束时间</label><input class="control" id="schedule-end" name="end_time" type="time" value="${esc(String(data.end_time).slice(0,5))}" required></div>
        <div class="field"><label for="slot-minutes">每个预约时段的长度</label><select class="control" id="slot-minutes" name="slot_minutes">${[15,30,60,90].map((n)=>`<option value="${n}"${Number(data.slot_minutes)===n?' selected':''}>${n} 分钟</option>`).join('')}</select></div>
        <div class="field"><label for="max-per-slot">每个时段最多预约数</label><input class="control" id="max-per-slot" name="max_per_slot" type="number" min="1" max="20" value="${Number(data.max_per_slot)}"></div>
        <div class="field"><label for="advance-days">最多可提前预约的天数</label><input class="control" id="advance-days" name="advance_days" type="number" min="1" max="365" value="${Number(data.advance_days)}"></div>
        <div class="field"><label for="timezone">营业时区</label><input class="control" id="timezone" name="timezone" value="${esc(data.timezone)}" required></div>
      </div><div style="display:flex;justify-content:flex-end;margin-top:20px"><button class="btn btn-primary" type="submit">保存预约设置</button></div></form>`;
  } catch (error) {
    return `${heading('预约时间设置', '设置可预约的日期和时间。')}${errorState(`暂时无法加载预约时间设置，请刷新后重试。`)}`;
  }
}

async function renderPanel() {
  if (adminOnlySections.has(activeSection) && !isAdministrator()) activeSection = 'overview';
  if (activeSection === 'overview') return renderOverview();
  if (activeSection === 'appointments') return renderAppointments();
  if (activeSection === 'booking-settings') return renderBookingSettings();
  if (definitions[activeSection]) return renderListModule(activeSection);
  return emptyState('Section unavailable', 'This section is not available yet.');
}

async function renderApp() {
  if (!currentUser) return loginView();
  const currentToken = ++renderToken;
  const body = await renderPanel();
  if (currentToken !== renderToken) return;
  app.innerHTML = shellMarkup(body);
  bindShellEvents();
}

function exportInquiriesCsv() {
  const rows = moduleState.get('inquiries') || [];
  const fields = [['created_at','提交时间'],['contact_name','联系人'],['company','公司'],['email','邮箱'],['phone','电话'],['product_type','包装类型'],['product_context','产品/来源上下文'],['quantity','数量'],['message','需求详情'],['source_page','来源页面'],['internal_notes','内部备注'],['status','状态']];
  const csv = [fields.map(([,label]) => label), ...rows.map((row) => fields.map(([key]) => row[key] ?? ''))]
    .map((line) => line.map((value) => '"' + String(value).replaceAll('"','""') + '"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: 'mewepak-inquiries-' + new Date().toISOString().slice(0,10) + '.csv' });
  link.click();
  URL.revokeObjectURL(url);
}

function bindShellEvents() {
  app.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', async () => {
    activeSection = button.dataset.section;
    if (location.hash !== '#' + activeSection) history.pushState(null, '', '#' + activeSection);
    document.querySelector('#sidebar')?.classList.remove('open');
    await renderApp();
  }));
  app.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.toggle('open'));
  app.querySelector('[data-action="reload"]')?.addEventListener('click', () => location.reload());
  app.querySelector('[data-action="change-password"]')?.addEventListener('click', openPasswordDialog);
  app.querySelector('[data-action="export-inquiries"]')?.addEventListener('click', exportInquiriesCsv);
  app.querySelector('[data-action="signout"]')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    loginView();
  });
  app.querySelectorAll('[data-action="add"]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.module)));
  app.querySelectorAll('[data-action="edit"]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.module, button.dataset.id)));
  app.querySelectorAll('[data-action="delete"]').forEach((button) => button.addEventListener('click', () => deleteRecord(button.dataset.module, button.dataset.id)));
  app.querySelectorAll('[data-inquiry-detail]').forEach((button) => button.addEventListener('click', () => {
    const inquiry = moduleState.get('inquiries')?.find((row) => row.id === button.dataset.inquiryDetail);
    if (!inquiry) return;
    const fields = [['名称', inquiry.contact_name], ['公司', inquiry.company], ['邮箱', inquiry.email], ['电话', inquiry.phone], ['包装类型', inquiry.product_type], ['产品', inquiry.product_context], ['数量', inquiry.quantity], ['来源页面', inquiry.source_page], ['提交时间', inquiry.created_at], ['需求详情', inquiry.message]];
    dialog.innerHTML = `<form id="inquiry-note-form" data-id="${esc(inquiry.id)}"><div class="dialog-head"><h2>询价详情</h2><button type="button" class="icon-btn" data-close aria-label="关闭">×</button></div><div class="dialog-body"><dl>${fields.filter(([,value]) => value).map(([label,value]) => `<dt class="row-primary">${esc(label)}</dt><dd style="margin:0 0 12px;white-space:pre-wrap;overflow-wrap:anywhere">${esc(value)}</dd>`).join('')}</dl><div class="field"><label for="inquiry-notes">内部备注</label><textarea class="control" id="inquiry-notes" name="internal_notes" rows="5">${esc(inquiry.internal_notes || '')}</textarea></div></div><div class="dialog-foot"><button class="btn btn-plain" type="button" data-close>关闭</button><button class="btn btn-primary" type="submit">保存备注</button></div></form>`;
    const form = dialog.querySelector('#inquiry-note-form');
    bindDirtyGuard(form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const { error } = await supabase.from('inquiries').update({ internal_notes: form.elements.internal_notes.value.trim(), updated_at: new Date().toISOString() }).eq('id', inquiry.id);
      if (error) return showToast(friendlyError(error, '备注保存失败，请重试。'), true);
      form._markClean?.();
      dialog.close();
      showToast('询价备注已保存');
      await renderApp();
    });
    dialog.showModal();
  }));
  app.querySelectorAll('[data-action="booking-status"],[data-action="inquiry-status"]').forEach((select) => select.addEventListener('change', async () => updateStatus(select.dataset.action === 'booking-status' ? 'appointments' : 'inquiries', select.dataset.id, select.value)));
  app.querySelector('#list-search')?.addEventListener('input', async (event) => {
    if (activeSection === 'products') {
      listViewState.products.query = event.target.value;
      listViewState.products.page = 1;
      await renderApp();
      app.querySelector('#list-search')?.focus();
      return;
    }
    const query = event.target.value.trim().toLowerCase();
    app.querySelectorAll('tbody tr').forEach((row) => { row.hidden = query && !row.textContent.toLowerCase().includes(query); });
  });
  app.querySelector('#product-category-filter')?.addEventListener('change', async (event) => {
    listViewState.products.category = event.target.value;
    listViewState.products.page = 1;
    await renderApp();
  });
  app.querySelector('#product-status-filter')?.addEventListener('change', async (event) => {
    listViewState.products.status = event.target.value;
    listViewState.products.page = 1;
    await renderApp();
  });
  app.querySelectorAll('[data-page-step]').forEach((button) => button.addEventListener('click', async () => {
    listViewState.products.page += Number(button.dataset.pageStep);
    await renderApp();
  }));
  app.querySelector('#schedule-form')?.addEventListener('submit', saveSchedule);
}

function fieldValue(item, field) {
  if (item[field.name] !== undefined && item[field.name] !== null) return item[field.name];
  if (field.type === 'json') return field.name === 'sections' ? [] : {};
  if (field.type === 'array') return [];
  return field.value ?? '';
}

function formatDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderEditorField(field, item) {
  const value = fieldValue(item, field);
  const name = esc(field.name);
  const id = `field-${name}`;
  let input = '';
  if (field.type === 'checkbox') {
    input = `<label class="checkbox-field"><input id="${id}" type="checkbox" name="${name}"${value ? ' checked' : ''}><span>${esc(field.label)}</span></label>`;
    return `<div class="field${field.full ? ' full' : ''}">${input}${field.help ? `<span class="field-help">${esc(field.help)}</span>` : ''}</div>`;
  }
  if (field.type === 'select') {
    const opts = (field.options || []).map(([optionValue,label]) => `<option value="${esc(optionValue)}"${String(value)===String(optionValue)?' selected':''}>${esc(label)}</option>`).join('');
    input = `<select class="control" id="${id}" name="${name}"${field.required?' required':''}>${opts}</select>`;
  } else if (field.type === 'category' || field.type === 'product') {
    const records = field.type === 'category' ? cachedCategories : cachedProducts;
    input = `<select class="control" id="${id}" name="${name}"><option value="">未设置</option>${records.map((row)=>`<option value="${esc(row.id)}"${String(value)===String(row.id)?' selected':''}>${esc(row.name)}</option>`).join('')}</select>`;
  } else if (field.type === 'textarea' || field.type === 'array' || field.type === 'json') {
    let text = value;
    if (field.type === 'array') text = Array.isArray(value) ? value.join('\n') : String(value || '');
    if (field.type === 'json') text = JSON.stringify(value ?? (field.name === 'sections' ? [] : {}), null, 2);
    input = `<textarea class="control${field.type==='json'?' json-field':''}" id="${id}" name="${name}"${field.required?' required':''}>${esc(text)}</textarea>`;
  } else if (field.type === 'file') {
    input = `<input class="control" id="${id}" type="file" name="${name}" accept="${esc(field.accept || '*/*')}">`;
  } else {
    let inputValue = value;
    if (field.type === 'datetime-local' && value) inputValue = formatDateTimeLocal(value);
    input = `<input class="control" id="${id}" type="${esc(field.type || 'text')}" name="${name}" value="${esc(inputValue)}"${field.required?' required':''}${field.min!==undefined?` min="${field.min}"`:''}>`;
  }
  return `<div class="field${field.full ? ' full' : ''}"><label for="${id}">${esc(field.label)}${field.required ? ' *' : ''}</label>${input}${field.help ? `<span class="field-help">${esc(field.help)}</span>` : ''}</div>`;
}

function openSiteSetting(item, editor) {
  const values = item.value || {};
  const isLanguages = item.key === 'languages';
  const fields = isLanguages
    ? `<div data-language-list>${(Array.isArray(values.links) ? values.links : []).map(languageRow).join('')}</div><button type="button" class="btn btn-plain" data-add-language>添加语言入口</button>`
    : `<div class="field-grid">${editor.fields.map((field) => renderEditorField(field, values)).join('')}</div>`;
  dialog.innerHTML = `<form id="setting-form"><div class="dialog-head"><h2>编辑${esc(editor.title)}</h2><button class="icon-btn" type="button" data-close aria-label="关闭">×</button></div><div class="dialog-body">${fields}<label class="checkbox-field setting-toggle"><input type="checkbox" name="enabled"${item.is_public ? ' checked' : ''}> 在网站启用</label><div class="error-box" role="alert" hidden></div></div><div class="dialog-foot"><button class="btn btn-plain" type="button" data-close>取消</button><button class="btn btn-primary" type="submit">保存</button></div></form>`;
  const form = dialog.querySelector('#setting-form');
  bindDirtyGuard(form);
  form.addEventListener('click', (event) => {
    if (event.target.closest('[data-remove-language]')) event.target.closest('[data-language-row]')?.remove();
    if (event.target.closest('[data-add-language]')) {
      const list = form.querySelector('[data-language-list]');
      list.insertAdjacentHTML('beforeend', languageRow());
      list.lastElementChild.querySelector('input').focus();
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const errorBox = form.querySelector('.error-box');
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = '正在保存…';
    errorBox.hidden = true;
    try {
      const data = new FormData(form);
      const value = { ...values };
      if (isLanguages) {
        value.links = [...form.querySelectorAll('[data-language-row]')].map((row) => {
          const label = row.querySelector('[name="language_label"]').value.trim();
          const url = row.querySelector('[name="language_url"]').value.trim();
          if (!label || !isSiteLink(url)) throw new Error('请填写语言名称及有效链接。链接可使用本站路径或 HTTPS 网址。');
          return { label, url };
        });
        if (value.links.length > 20) throw new Error('最多可添加 20 个语言入口。');
      } else {
        for (const field of editor.fields.filter((field) => field.type !== 'file')) {
          value[field.name] = String(data.get(field.name) || '').trim();
          if (field.name.endsWith('_url') && value[field.name] && !isSiteLink(value[field.name])) throw new Error(`${field.label}请填写本站路径或 HTTPS 网址。`);
        }
        for (const field of editor.fields.filter((field) => field.type === 'file')) {
          const file = data.get(field.name);
          if (file?.size) value[field.target] = await uploadFile(file, field.folder);
        }
      }
      if (item.key === 'factory_tour' && value.video_url && !/\.(mp4|webm)(?:[?#]|$)/i.test(value.video_url)) {
        throw new Error('请使用 MP4 或 WebM 视频文件的直接链接。');
      }
      if (item.key === 'us_locations' && [value.toll_free, value.front_desk].some((number) => number && !/^\+?[\d ().-]{6,30}$/.test(number))) {
        throw new Error('美国电话号码只能使用数字、国际区号及常见分隔符。');
      }
      const { error } = await supabase.from('site_settings').update({
        value, is_public: data.has('enabled'), updated_at: new Date().toISOString(),
      }).eq('key', item.key);
      if (error) throw new Error('保存失败，请稍后重试。');
      form._markClean?.();
      dialog.close();
      showToast(`${editor.title}已保存`);
      await renderApp();
    } catch (error) {
      errorBox.textContent = friendlyError(error, '保存失败，请重试。');
      errorBox.hidden = false;
      button.disabled = false;
      button.textContent = '保存';
    }
  });
  dialog.showModal();
}

const bannerFields = [
  ['name', '轮播名称'], ['kicker', '标题上方短句'], ['title', '第一行标题'],
  ['accent', '第二行标题'], ['description', '说明文字'],
];
const bannerNames = ['定制包装', '吸嘴袋', '冷鲜与冷冻食品', '自立袋'];

function renderPageOptions(item) {
  const sections = item.sections || [];
  if (item.slug === 'home') {
    const slides = sections.find((section) => section.type === 'home_banners')?.slides || [];
    return `<details class="advanced-fields" open><summary>首页轮播</summary><p class="field-help">填写需要更新的内容，空白字段会使用原版。图片可从媒体库复制链接。</p>
      ${bannerNames.map((label, index) => {
        const slide = slides[index] || {};
        const photos = index === 1 ? 2 : 3;
        return `<details class="advanced-fields"><summary>第 ${index + 1} 张 · ${label}</summary><div class="field-grid">
          ${bannerFields.map(([name, title]) => `<label class="field">${title}<input class="control" name="banner-${index}-${name}" value="${esc(slide[name])}" maxlength="250"></label>`).join('')}
          ${Array.from({ length: photos }, (_, photo) => `<label class="field full">产品图 ${photo + 1}<input class="control" name="banner-${index}-photo-${photo}" value="${esc(slide.photos?.[photo])}"></label>`).join('')}
        </div></details>`;
      }).join('')}</details>`;
  }
  if (item.slug?.startsWith('markets/') && cachedCategories.length) {
    const chosen = sections.find((section) => section.type === 'recommended_formats')?.slugs || [];
    return `<details class="advanced-fields" open><summary>推荐包装</summary><p class="field-help">从已发布的分类里挑选，按以下顺序展示。四项都留空时恢复原版推荐。</p>
      <label class="checkbox-field"><input type="checkbox" name="market-format-reset">恢复原版推荐</label><div class="field-grid">
      ${Array.from({ length: 4 }, (_, index) => `<label class="field">第 ${index + 1} 项<select class="control" name="market-format-${index}"><option value="">留空</option>
        ${cachedCategories.filter((category) => category.status === 'published').map(({slug, name}) => `<option value="${esc(slug)}" ${slug === chosen[index] ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>`).join('')}
      </div></details>`;
  }
  return '';
}

function applyPageOptions(form, sections) {
  const data = new FormData(form);
  const write = (type, content) => [...sections.filter((section) => section.type !== type), { type, ...content }];
  if (data.has('banner-0-name')) {
    const slides = bannerNames.map((_, index) => ({
      ...Object.fromEntries(bannerFields.map(([name]) => [name, data.get(`banner-${index}-${name}`).trim()])),
      photos: Array.from({ length: 3 }, (_, i) => String(data.get(`banner-${index}-photo-${i}`) || '').trim()),
    }));
    if (slides.some((slide) => slide.photos.some((url) => url && !/^https:\/\/|^\/(?![\/\\])/i.test(url)))) {
      throw new Error('轮播图片请填写 HTTPS 链接或网站内路径。');
    }
    return write('home_banners', { slides });
  }
  if (data.has('market-format-reset')) return sections.filter((section) => section.type !== 'recommended_formats');
  if (data.has('market-format-0')) {
    const slugs = [...new Set(Array.from({ length: 4 }, (_, i) => data.get(`market-format-${i}`)).filter(Boolean))];
    return slugs.length ? write('recommended_formats', { slugs }) : sections.filter((section) => section.type !== 'recommended_formats');
  }
  return sections;
}

async function openEditor(module, id = '') {
  const definition = definitions[module];
  if (!definition) return;
  let item = {};
  if (id) {
    const rows = moduleState.get(module) || [];
    item = rows.find((row) => String(row.id || row.key) === String(id)) || {};
  }
  if (module === 'settings' && findSettingEditor(item.key)) {
    return openSiteSetting(item, findSettingEditor(item.key));
  }
  if (module === 'products' || module === 'models' || (module === 'pages' && item.slug?.startsWith('markets/'))) {
    try { cachedCategories = await queryTable('product_categories','*','menu_order',true); } catch { cachedCategories = []; }
    if (module === 'models') {
      try { cachedProducts = await queryTable('products','*','name'); } catch { cachedProducts = []; }
    }
  }
  if (module === 'pages') {
    const rendered = item.sections?.find((section) => section.type === 'rendered_page');
    if (rendered) item = { ...item, page_html: rendered.html };
    else if (id && !['booking', '3d-preview'].includes(item.slug)) {
      try {
        const route = item.slug === 'home' ? '/' : '/' + item.slug.split('/').map(encodeURIComponent).join('/') + '/';
        const response = await fetch(route, { cache: 'no-store' });
        if (response.ok) {
          const markup = new DOMParser().parseFromString(await response.text(), 'text/html');
          item = { ...item, page_html: markup.querySelector('main')?.innerHTML.trim() || '' };
        }
      } catch { /* The editor can still save metadata. */ }
    }
  }
  const dialogTitle = id ? `编辑${recordNames[module]}` : definition.add;
  const advancedNames = new Set(['seo_title', 'seo_description', 'template_key', 'page_html', 'preview_settings', 'mime_type']);
  const basic = definition.fields.filter((field) => !advancedNames.has(field.name));
  const advanced = definition.fields.filter((field) => advancedNames.has(field.name) && !(field.name === 'page_html' && ['booking','3d-preview'].includes(item.slug)));
  dialog.innerHTML = `<form id="editor-form" data-module="${esc(module)}" data-id="${esc(id)}"><div class="dialog-head"><div><h2>${esc(dialogTitle)}</h2></div><button type="button" class="icon-btn" data-close aria-label="关闭">×</button></div><div class="dialog-body"><div class="field-grid">${basic.map((field)=>renderEditorField(field,item)).join('')}</div>${module === 'pages' ? renderPageOptions(item) : ''}${advanced.length ? `<details class="advanced-fields"><summary>高级选项</summary><div class="field-grid">${advanced.map((field)=>renderEditorField(field,item)).join('')}</div></details>` : ''}<div id="form-error" class="error-box" style="display:none;margin-top:14px"></div></div><div class="dialog-foot"><button type="button" class="btn btn-plain" data-close>取消</button><button type="submit" class="btn btn-primary">保存</button></div></form>`;
  const editorForm = dialog.querySelector('#editor-form');
  bindDirtyGuard(editorForm);
  editorForm.addEventListener('submit', saveEditor);
  dialog.querySelectorAll('input[type="file"]').forEach((input) => input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    if (module === 'media') {
      const fileName = dialog.querySelector('[name="file_name"]');
      const mimeType = dialog.querySelector('[name="mime_type"]');
      if (fileName && !fileName.value) fileName.value = file.name;
      if (mimeType && !mimeType.value) mimeType.value = file.type;
    }
  }));
  dialog.showModal();
}

async function uploadFile(file, folder) {
  const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-120) || 'asset';
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('site-media').upload(path, file, {
    cacheControl: '31536000', upsert: false, contentType: file.type || 'application/octet-stream',
  });
  if (error) throw error;
  return supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl;
}

async function saveEditor(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const module = form.dataset.module;
  const id = form.dataset.id;
  const definition = definitions[module];
  const payload = {};
  const errorBox = form.querySelector('#form-error');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = '正在保存…';
  try {
    for (const field of definition.fields) {
      const element = form.elements.namedItem(field.name);
      if (field.name === 'page_html') {
        if (element && element.value !== element.defaultValue) {
          const current = moduleState.get(module)?.find((row) => String(row.id) === id)?.sections || [];
          payload.sections = [...current.filter((section) => section.type !== 'rendered_page'), { type: 'rendered_page', html: element.value }];
        }
        continue;
      }
      if (field.type === 'file') {
        const file = element?.files?.[0];
        if (file) payload[field.target] = await uploadFile(file, field.folder);
        continue;
      }
      if (field.type === 'checkbox') { payload[field.name] = Boolean(element?.checked); continue; }
      let value = element?.value ?? '';
      if (field.type === 'number') value = value === '' ? 0 : Number(value);
      if (field.type === 'array') value = value.split('\n').map((part)=>part.trim()).filter(Boolean);
      if (field.type === 'json') {
        try { value = JSON.parse(value || (field.name === 'sections' ? '[]' : '{}')); }
        catch { throw new Error(`${field.label}的 JSON 格式有误，请检查后重试。`); }
      }
      if (field.type === 'datetime-local') value = value ? new Date(value).toISOString() : null;
      if ((field.type === 'category' || field.type === 'product') && value === '') value = null;
      if (value !== '' || ['textarea','array','json','select'].includes(field.type) || ['value','seo_title','primary_image_url','image_url','featured_image_url','model_url','poster_url'].includes(field.name)) payload[field.name] = value;
    }
    if (['categories','products','articles'].includes(module)) {
      const slug = String(payload.slug || '').trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('网址路径只能使用小写字母、数字和短横线，且不能有空格或 / ? #。');
      const reserved = new Set(['admin','api','assets','search','contact','products','markets','solutions','blog','about-us','added-value','sustainability','booking','inquiry']);
      if (module === 'articles' && reserved.has(slug)) throw new Error('这个网址路径属于系统保留路径，请换一个。');
      payload.slug = slug;
    }
    if (module === 'models') {
      if (payload.model_url && !/^(https:\/\/|\/).*\.(glb|gltf)(?:[?#].*)?$/i.test(payload.model_url)) throw new Error('3D 模型链接必须是 HTTPS / 站内 GLB 或 GLTF 文件。');
      if (payload.poster_url && !/^(https:\/\/|\/).*\.(png|jpe?g|webp|avif)(?:[?#].*)?$/i.test(payload.poster_url)) throw new Error('预览图链接必须是 HTTPS / 站内图片文件。');
    }
    if (module === 'pages') {
      const previous = moduleState.get(module)?.find((row) => String(row.id) === id)?.sections || [];
      const sections = applyPageOptions(form, payload.sections || previous);
      if (sections !== previous) payload.sections = sections;
    }
    if (module === 'media' && !payload.file_name) {
      const file = form.elements.namedItem('_upload')?.files?.[0];
      if (file) payload.file_name = file.name;
    }
    if (module === 'articles' && payload.status === 'published' && !payload.published_at) {
      const existing = moduleState.get('articles')?.find((row) => String(row.id) === String(id));
      payload.published_at = existing?.published_at || new Date().toISOString();
    }
    if (module !== 'media') payload.updated_at = new Date().toISOString();
    const table = definition.table;
    let result;
    if (id) {
      result = await supabase.from(table).update(payload).eq(module === 'settings' ? 'key' : 'id', id);
    } else {
      result = await supabase.from(table).insert(payload);
    }
    if (result.error) throw result.error;
    form._markClean?.();
    dialog.close();
    showToast(`${recordNames[module]}已保存`);
    await renderApp();
  } catch (error) {
    errorBox.textContent = error instanceof Error ? error.message : '保存失败，请重试。';
    errorBox.style.display = 'block';
    button.disabled = false;
    button.textContent = '保存';
  }
}

async function deleteRecord(module, id) {
  const definition = definitions[module];
  if (!definition) return;
  const row = moduleState.get(module)?.find((item) => String(item.id || item.key) === String(id));
  const label = row?.name || row?.title || row?.file_name || row?.contact_name || row?.email || row?.key || recordNames[module];
  if (module === 'categories') {
    const { count, error } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (error) return showToast(friendlyError(error, '无法检查分类关联产品。'), true);
    if (count) return showToast(`不能删除“${label}”：该分类下还有 ${count} 个产品，请先移动或删除产品。`, true);
  }
  if (!window.confirm(`确定删除“${label}”吗？此操作不可撤销。`)) return;
  if (module === 'media' && row?.public_url) {
    try {
      const marker = '/storage/v1/object/public/site-media/';
      const url = new URL(row.public_url);
      const index = url.pathname.indexOf(marker);
      if (index >= 0) {
        const storagePath = decodeURIComponent(url.pathname.slice(index + marker.length));
        const { error } = await supabase.storage.from('site-media').remove([storagePath]);
        if (error) throw error;
      }
    } catch (error) {
      return showToast(friendlyError(error, '存储文件删除失败，素材记录未删除。'), true);
    }
  }
  const key = module === 'settings' ? 'key' : 'id';
  const { error } = await supabase.from(definition.table).delete().eq(key,id);
  if (error) return showToast(friendlyError(error, '删除失败，请重试。'), true);
  showToast(`${recordNames[module]}已删除`);
  await renderApp();
}

async function updateStatus(table, id, status) {
  const payload = { status, updated_at: new Date().toISOString() };
  if (table === 'articles' && status === 'published') {
    const existing = moduleState.get('articles')?.find((row) => String(row.id) === String(id));
    if (!existing?.published_at) payload.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) return showToast(friendlyError(error, '状态更新失败，请重试。'), true);
  showToast('状态已更新');
  await renderApp();
}

async function saveSchedule(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const slotMinutes = Number(data.get('slot_minutes'));
  const meetingDurations = String(data.get('meeting_durations') || '').split(',').map((part) => Number(part.trim())).filter(Number.isInteger);
  const timezoneEntries = String(data.get('timezone_options') || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const timezones = {};
  for (const line of timezoneEntries) {
    const separator = line.indexOf('|');
    if (separator < 1 || separator === line.length - 1) return showToast('请按“时区编号|显示名称”的格式填写。', true);
    const zone = line.slice(0, separator).trim();
    const label = line.slice(separator + 1).trim();
    try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); }
    catch { return showToast(`时区编号无效：${zone}`, true); }
    if (timezones[zone]) return showToast(`时区重复：${zone}`, true);
    timezones[zone] = label;
  }
  if (!meetingDurations.length || meetingDurations.some((minutes) => minutes < 5 || minutes > slotMinutes)) {
    return showToast('会议时长至少为 5 分钟，且不能超过预约时段的长度。', true);
  }
  if (Object.keys(timezones).length === 0) return showToast('请至少添加一个时区。', true);
  const avatarFile = data.get('avatar_file');
  let avatarUrl = String(data.get('avatar_url') || '').trim();
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try { avatarUrl = await uploadFile(avatarFile, 'booking-host'); }
    catch (error) { return showToast(error.message || '头像上传失败，请重试。', true); }
  }
  const payload = {
    id: 1,
    working_days: data.getAll('working_days').map(Number).sort((a,b)=>a-b),
    start_time: data.get('start_time'),
    end_time: data.get('end_time'),
    slot_minutes: slotMinutes,
    max_per_slot: Number(data.get('max_per_slot')),
    advance_days: Number(data.get('advance_days')),
    timezone: String(data.get('timezone')).trim(),
    meeting_durations: [...new Set(meetingDurations)],
    timezones,
    display_title: String(data.get('display_title') || '').trim(),
    display_location: String(data.get('display_location') || '').trim(),
    avatar_url: avatarUrl,
    notification_email: String(data.get('notification_email') || '').trim(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('booking_settings').upsert(payload);
  if (error) return showToast(error.message || '预约设置保存失败，请重试。', true);
  showToast('预约设置已保存');
}

async function bootstrap() {
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    const config = await response.json().catch(() => null);
    if (!response.ok || !config?.configured) return setupView();
    supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    });
    const { data, error } = await supabase.auth.getSession();
    if (error) return loginView('登录已过期，请重新登录。');
    if (data.session) {
      const { data: userData } = await supabase.auth.getUser();
      if (!isStaff(userData?.user)) return loginView('此账号没有后台访问权限。');
      currentUser = userData.user;
      activeSection = sectionFromHash();
      if (adminOnlySections.has(activeSection) && !isAdministrator()) activeSection = 'overview';
      await renderApp();
    } else {
      loginView();
    }
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        currentUser = null;
        window.setTimeout(() => loginView(), 0);
      }
    });
  } catch (error) {
    app.innerHTML = `<div class="signin-wrap"><section class="setup-card"><h1>暂时无法连接后台</h1><p>${esc(error.message || '请稍后重试，或联系网站维护人员。')}</p><button class="btn btn-primary" type="button" data-action="reload">重试</button></section></div>`;
  }
}

window.addEventListener('hashchange', async () => {
  if (!currentUser) return;
  const next = sectionFromHash();
  if (next === activeSection) return;
  activeSection = adminOnlySections.has(next) && !isAdministrator() ? 'overview' : next;
  await renderApp();
});

bootstrap();

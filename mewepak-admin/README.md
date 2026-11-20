# Mewepak Studio

独立开发的 Mewepak 网站和管理后台。Cloudflare Worker 同时提供静态前端与 API，Supabase 提供数据库、账号和内容权限；公开站点按现有网站的版式、交互、页面路径、原文案与原素材独立实现，不依赖 WordPress 主题或插件。

## 开发边界

- 当前线上 WordPress 前台继续运行，直到新站预览完成并验收。
- WordPress 备份用来核对现有页面、视觉、交互、文案、图片、视频、Logo 和 3D 模型。
- 原素材和文案沿用，不擅自换图、生成替代素材或改写内容。迁移时只调整存储位置和引用地址；备份里缺少的文件会登记确认。
- 按 Mewepak 要求补充网站配图时，可用 AI 生成场景图。所有新增网站配图都要在导出的图片文件中直接嵌入现有官方 Mewepak Logo，并检查移动端裁切。生成的工厂、人员或展会场景在页面上标为示意。
- 新 CMS 的数据结构按 Mewepak 业务需要设计。网站前台可使用适配 Cloudflare 的语言与框架，页面效果以现站为准。
- 这是产品展示与询价网站，不包含购物车、价格结算、支付或订单管理。

## 当前代码

- `public/index.html`：独立实现的公开站点首页，包含原站导航、产品大菜单、Hero、市场/规格入口、产品展示、3D 预览、生产流程、可持续发展和询价入口。
- `public/products/`：从 Supabase 读取分类和产品的产品展示页。
- `public/booking/`：读取后台预约规则并提交预约的客户预约页。
- `public/3d-preview/`：使用原站模型与交互逻辑实现的独立 3D 包装预览页，支持前后图上传、旋转、缩放和背景切换；设计图只在浏览器本地处理。
- `public/assets/`：从备份中保留的原 Logo、产品图片、3D 模型及公开站点样式和交互。
- `public/admin/`：员工登录与后台管理界面。
- `worker/index.js`：Cloudflare Worker 入口，包括静态资源、安全响应头、公开内容读取、运行配置、预约时段读取和预约提交接口。
- `database/schema.sql`：Supabase 表、RLS、媒体桶、预约原子写入函数及 12 个产品分类的初始化脚本。
- `database/upgrade_admin_roles_booking_options.sql`：已有 CMS 项目的预约字段升级与 admin/editor 数据权限收紧脚本。
- `scripts/extract-wordpress-content.mjs`：从 WordPress SQL 备份提取原页面、产品、文章、分类和媒体映射。
- `migration/wordpress-content.json`：本次备份生成的可复核迁移清单，保留原 WordPress HTML 和原媒体路径。
- `docs/DEVELOPMENT_PLAN.md`：全站重建与后台建设计划。

分类、产品、页面、文章、媒体、3D 资源、预约、询价和站点设置已有管理界面骨架；公开站点首页、产品页、预约页及独立 3D 预览已有第一版实现。Supabase 已导入备份中的 12 个产品分类、3 个在用产品、52 个非商城页面、11 篇文章、33 个有效媒体记录和 1 个 3D 模型记录。其余原站页面渲染、预约邮件和客户级编辑器仍在开发中。部署前台之前不会改动或替换当前线上 WordPress。

## 运行配置

在 Cloudflare Worker 的 Preview 和 Production 环境分别设置：

| 变量 | 用途 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_PUBLISHABLE_KEY` | 登录和员工数据访问使用的公开 key |
| `TURNSTILE_SECRET_KEY` | 公开预约表单的人机验证 |
| `TURNSTILE_SITE_KEY` | 预约页加载的人机验证公开 site key |
| `BOOKING_API_SECRET` | Worker 调用受保护预约 RPC 的专用随机密钥 |
| `ASSET_COMMIT_SHA` | 未接入 Git 构建时用于预览静态资源的 GitHub commit SHA |

本地开发时，将 `.dev.vars.example` 复制为 `.dev.vars` 并填写开发环境值。`.dev.vars` 已加入 Git 忽略规则。

## 权限边界

- `admin`：管理全部内容、网站设置、预约与询价资料。
- `editor`：管理分类、产品、页面、文章、媒体和 3D 资源；不能读取预约、询价个人资料或修改网站私有设置。
- 角色保存于可信的 Supabase `app_metadata`。前端导航隐藏不代表授权；数据库 RLS 才是最终访问控制。
- 公开预约不向浏览器暴露 Supabase 服务角色密钥。Worker 通过 `BOOKING_API_SECRET` 调用受保护 RPC，数据库只保存该密钥的 SHA-256 哈希。

首次初始化前，先核对目标 Supabase 项目和 SQL 内容。首位管理员账号由项目管理员创建，再通过 `app_metadata.role = 'admin'` 授予权限。关闭公开注册；不要把密钥放进仓库或浏览器。

## 部署

Cloudflare Worker 项目根目录为 `mewepak-admin`，静态资源目录为 `public`，API 入口为 `worker/index.js`。后台入口为 `/admin/`。生产发布前，先使用 Workers Preview 核对公开页面、登录、角色访问、媒体上传与数据库策略。

Cloudflare 账号必须先完成邮箱验证，否则 Workers API 会返回错误代码 `10034`，无法创建 Worker 或 Preview。

## 重新提取 WordPress 内容

```bash
npm run extract:wordpress -- ../studio-backup-db-export-2026-11-17-14-03-08.sql ./migration/wordpress-content.json
```

提取器会排除购物车、结账、账户页、已删除产品和 WordPress 示例页，并保留真实页面的层级路径，避免父页面下同名子页面发生 slug 冲突。

## 预约接口

```http
GET /api/booking-slots?date=YYYY-MM-DD
POST /api/bookings
Content-Type: application/json
```

提交接口会验证同源、输入长度、Turnstile 和时段容量；数据库函数在事务锁内再次检查容量。公开可约接口只返回时段，不返回已有预约人的资料。


### 预约与询价邮件

应用 `database/lead_notifications.sql` 后，新的预约、预约确认及询价会在同一笔数据库事务内加入通知队列。Worker 的五分钟定时任务会发送通知并重试暂时失败的请求。需要在 Cloudflare Worker 配置 `NOTIFICATIONS_FROM`（客户账号下已验证的发件地址）和密钥 `RESEND_API_KEY`，并在后台「预约时间设置」填写业务通知邮箱。发送配置缺失时，表单仍可正常保存，定时任务会保留待发送状态。发送前先在预览环境用指定测试邮箱核对业务通知和客户回执。

### 索引与换站

预览 Worker 的 HTML 返回 `X-Robots-Tag: noindex, follow`。在生产环境使用正式 Mewepak 域名时，`robots.txt` 才会公布站点地图。部署上线后，检查媒体和主要页面的旧链接、canonical 及 `/sitemap.xml`，再在对应的 Search Console 资源提交站点地图。

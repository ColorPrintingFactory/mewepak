# Mewepak Studio

独立开发的 Mewepak 网站管理后台。后台使用 Cloudflare Pages Functions 和 Supabase；公开站点将按现有网站的版式、交互、页面路径、原文案与原素材独立实现，不依赖 WordPress 主题或插件。

## 开发边界

- 当前线上 WordPress 前台继续运行，直到新站预览完成并验收。
- WordPress 备份用来核对现有页面、视觉、交互、文案、图片、视频、Logo 和 3D 模型。
- 原素材和文案沿用，不擅自换图、生成替代素材或改写内容。迁移时只调整存储位置和引用地址；备份里缺少的文件会登记确认。
- 新 CMS 的数据结构按 Mewepak 业务需要设计。网站前台可使用适配 Cloudflare 的语言与框架，页面效果以现站为准。
- 这是产品展示与询价网站，不包含购物车、价格结算、支付或订单管理。

## 当前代码

- `public/admin/`：员工登录与后台管理界面。
- `functions/`：Cloudflare Pages Functions，包括运行配置、预约时段读取和预约提交接口。
- `database/schema.sql`：Supabase 表、RLS、媒体桶、预约原子写入函数及 12 个产品分类的初始化脚本。
- `database/upgrade_admin_roles_booking_options.sql`：已有 CMS 项目的预约字段升级与 admin/editor 数据权限收紧脚本。
- `docs/DEVELOPMENT_PLAN.md`：全站重建与后台建设计划。

分类、产品、页面、文章、媒体、3D 资源、预约、询价和站点设置已有管理界面骨架；内容导入、预约邮件、客户级编辑器和公开站点的新前端仍在开发中。部署前台之前不会改动或替换当前线上 WordPress。

## 运行配置

在 Cloudflare Pages 的 Preview 和 Production 环境分别设置：

| 变量 | 用途 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_PUBLISHABLE_KEY` | 登录和员工数据访问使用的公开 key |
| `SUPABASE_SERVICE_ROLE_KEY` | Pages Functions 专用服务端密钥，绝不放入浏览器 |
| `TURNSTILE_SECRET_KEY` | 公开预约表单的人机验证 |

本地开发时，将 `.dev.vars.example` 复制为 `.dev.vars` 并填写开发环境值。`.dev.vars` 已加入 Git 忽略规则。

## 权限边界

- `admin`：管理全部内容、网站设置、预约与询价资料。
- `editor`：管理分类、产品、页面、文章、媒体和 3D 资源；不能读取预约、询价个人资料或修改网站私有设置。
- 角色保存于可信的 Supabase `app_metadata`。前端导航隐藏不代表授权；数据库 RLS 才是最终访问控制。

首次初始化前，先核对目标 Supabase 项目和 SQL 内容。首位管理员账号由项目管理员创建，再通过 `app_metadata.role = 'admin'` 授予权限。关闭公开注册；不要把密钥放进仓库或浏览器。

## 部署

Cloudflare Pages 根目录为 `mewepak-admin`，静态输出目录为 `public`；Functions 从 `functions/` 自动加载。后台入口为 `/admin/`。发布到客户环境前，先使用 Preview 环境核对登录、角色访问、媒体上传与数据库策略。

## 预约接口

```http
GET /api/booking-slots?date=YYYY-MM-DD
POST /api/bookings
Content-Type: application/json
```

提交接口会验证同源、输入长度、Turnstile 和时段容量；数据库函数在事务锁内再次检查容量。公开可约接口只返回时段，不返回已有预约人的资料。


# How To Express 部署说明书

本文档说明如何将 PWA 版提词器部署到 GitHub Pages，让非技术人员也能通过网址直接使用。

---

## 一、部署前准备

### 1.1 需要的东西

- 一个 GitHub 账号
- 本项目的源代码（即当前文件夹）
- 一个仓库名（例如 `how-to-express`）

### 1.2 仓库名说明

GitHub Pages 有两种地址：

| 仓库类型 | 示例仓库名 | 部署后网址 | 适用场景 |
|---|---|---|---|
| 项目页 | `how-to-express` | `https://你的用户名.github.io/how-to-express/` | 推荐，一般项目都用这个 |
| 用户页 | `你的用户名.github.io` | `https://你的用户名.github.io/` | 个人主页专用 |

**本文档默认按“项目页”方式说明。**

---

## 二、修改配置（关键步骤）

### 2.1 修改 `vite.config.ts`

找到这一行：

```ts
base: './',
```

替换为：

```ts
base: '/YOUR_REPO_NAME/',
```

其中 `YOUR_REPO_NAME` 换成你的真实仓库名。

**示例**：如果你的仓库名是 `how-to-express`，就写成：

```ts
base: '/how-to-express/',
```

如果是用户页仓库（仓库名等于 `用户名.github.io`），则写成：

```ts
base: '/',
```

### 2.2 检查 `public/manifest.json`

确保内容如下（一般不需要改）：

```json
{
  "name": "How To Express",
  "short_name": "Express",
  "description": "极简桌面提词器，支持语音跟随",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#0f0f11",
  "theme_color": "#0f0f11",
  "orientation": "any",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 三、上传到 GitHub

### 3.1 在 GitHub 创建仓库

1. 打开 [https://github.com/new](https://github.com/new)
2. 输入仓库名，例如 `how-to-express`
3. 选择 **Public**（公开仓库才能免费使用 GitHub Pages）
4. 不要勾选 README、.gitignore、license
5. 点击 **Create repository**

### 3.2 把代码推送到仓库

在项目根目录打开命令行，依次执行：

```bash
git init
git add .
git commit -m "init: pwa teleprompter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

把 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 换成你的真实用户名和仓库名。

---

## 四、开启 GitHub Pages

1. 打开仓库页面：`https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. 点击上方 **Settings** 标签
3. 左侧菜单找到 **Pages**（在 Code and automation 下面）
4. 在 **Build and deployment** 区域：
   - **Source** 选择 **GitHub Actions**
5. 等待几秒，页面顶部会出现提示：
   > Your GitHub Pages site is currently being built from the `.github/workflows/deploy.yml` file.

---

## 五、等待部署完成

1. 点击仓库上方的 **Actions** 标签
2. 看到名为 **Deploy to GitHub Pages** 的工作流在运行
3. 等待它变成绿色对勾 ✅（通常 1-3 分钟）
4. 完成后，访问：

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

## 六、安装为 Windows 桌面应用

### 6.1 用 Chrome 或 Edge 打开部署地址

**注意**：一定要用 Chrome 或 Edge。Firefox 不支持 PWA 安装。

### 6.2 安装

地址栏右侧会出现 **安装 How To Express** 的图标，点击后按提示安装。

如果没有看到图标，可以点击浏览器右上角 **三个点菜单 → 应用 → 安装 How To Express**。

### 6.3 安装后效果

- Windows 开始菜单会出现 **How To Express**
- 桌面可能会出现快捷方式（取决于安装时是否勾选）
- 双击打开，像普通软件一样使用
- 没有浏览器地址栏，界面更干净

---

## 七、更新应用

以后只要修改代码并推送到 `main` 分支：

```bash
git add .
git commit -m "update: 你的更新说明"
git push
```

GitHub Actions 会自动重新部署。用户刷新网页即可获得最新版本。

如果已安装为 PWA，打开时会自动检查更新并提示。

---

## 八、常见问题

### Q1：网页打开后是一片空白？

检查 `vite.config.ts` 中的 `base` 是否填写正确。仓库名必须和 GitHub 上完全一致，区分大小写。

### Q2：地址栏没有“安装”按钮？

按 F12 打开开发者工具，查看 Console 是否有红色报错。常见原因是：

- `manifest.json` 路径错误
- 图标文件损坏或路径错误
- Service Worker 注册失败
- 当前不是 HTTPS（GitHub Pages 默认 HTTPS，本地 localhost 也可以）

### Q3：语音跟随用不了？

语音跟随依赖浏览器提供的 Web Speech API，必须满足：

- 使用 Chrome 或 Edge 浏览器/PWA
- 允许麦克风权限
- 电脑能访问 Google 语音识别服务
- 部署在 HTTPS 或 localhost 上

### Q4：断网后还能用吗？

可以。PWA 会缓存页面资源，断网后仍能打开和手动滚动。但**语音跟随需要网络**，因为它依赖云端语音识别。

### Q5：想换图标或名字怎么办？

- 改名字：编辑 `public/manifest.json` 和 `index.html`
- 改图标：替换 `public/icons/` 和 `public/favicon.ico`、`public/apple-touch-icon.png`
- 改完后重新推送，GitHub Actions 会自动部署

---

## 九、文件清单说明

| 文件/目录 | 作用 |
|---|---|
| `public/manifest.json` | PWA 应用清单，定义名称、图标、主题色 |
| `public/icons/` | PWA 图标 |
| `public/favicon.ico` | 浏览器标签页图标 |
| `public/apple-touch-icon.png` | iOS/macOS 主屏幕图标 |
| `vite.config.ts` | Vite 构建配置，其中 `base` 决定部署路径 |
| `.github/workflows/deploy.yml` | GitHub Actions 自动部署配置 |
| `src/` | 项目源代码 |

---

## 十、联系方式/反馈

如果遇到问题，检查浏览器开发者工具 Console 的报错信息，或回到项目目录重新运行：

```bash
npm run build
npm run preview
```

确认本地构建没有问题后再推送。

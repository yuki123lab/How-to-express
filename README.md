# How To Express

一个极简的桌面提词器 PWA，支持语音跟随自动滚动。

## 在线使用

访问：https://yuki123lab.github.io/How-to-express/

## 功能

- 输入文本，调整字号
- 自动滚动播放
- 语音跟随：根据朗读内容自动定位到当前段落
- 可安装为 Windows 桌面应用

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 部署

详见 [DEPLOY.md](./DEPLOY.md)。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- PWA（vite-plugin-pwa）

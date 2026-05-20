# image-audit

扫描项目中的图片资源，检测未在代码中引用的图片，并通过可视化报告预览、复制路径或删除。

支持 **Vite 插件**、**Webpack 插件** 和 **CLI** 三种使用方式。

> 检测基于文件名 / 无扩展名文件名的文本匹配，属于启发式分析。删除前请人工确认（动态 import、CSS `url()`、运行时路径等可能产生误报）。

## 安装

```bash
npm install -D image-audit
# 或
pnpm add -D image-audit
```

## CLI

在项目根目录执行：

```bash
npx image-audit
```

选项：

| 选项 | 说明 |
|------|------|
| `--port <n>` | 报告服务端口，默认 `8899` |
| `--output <file>` | 额外输出静态 HTML 报告 |
| `--no-open` | 不自动打开浏览器 |

## Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { imageAudit } from 'image-audit/vite'

export default defineConfig({
  plugins: [
    imageAudit({
      // searchDirs: ['src'],
      // assetDirs: ['src', 'public'],
      // port: 8899,
      // open: true,
      // integrate: true,  // 挂载到 Vite 开发服务器
      // mountPath: '/__image-audit__',
    }),
  ],
})
```

运行 `vite` / `npm run dev` 后，终端会输出报告地址（默认独立端口 `8899`）。

设置 `integrate: true` 时，报告会挂载到 Vite 开发服务器，例如：`http://localhost:5173/__image-audit__/`

## Webpack

```js
// webpack.config.js
const { ImageAuditWebpackPlugin } = require('image-audit/webpack')

module.exports = {
  plugins: [
    new ImageAuditWebpackPlugin({
      // runInServeOnly: true,  // 默认仅在 webpack serve / watch 时启动
    }),
  ],
}
```

ESM：

```js
import { ImageAuditWebpackPlugin } from 'image-audit/webpack'
```

## 配置项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `searchDirs` | `string[]` | `['src']` | 扫描代码引用的目录 |
| `assetDirs` | `string[]` | `['src', 'public']` | 扫描图片资源的目录 |
| `imageExtensions` | `string[]` | 常见图片后缀 | 图片扩展名 |
| `codeExtensions` | `string[]` | `.vue` `.ts` 等 | 代码文件扩展名 |
| `excludeDirs` | `string[]` | `node_modules` 等 | 排除目录 |
| `port` | `number` | `8899` | 报告服务端口 |
| `open` | `boolean` | `true` | 是否自动打开浏览器 |
| `output` | `string` | - | 输出静态 HTML 路径 |

## 编程式 API

```ts
import { analyze, generateReportHtml, startReportServer } from 'image-audit'

const result = analyze({ searchDirs: ['src'], assetDirs: ['src', 'public'] })
console.log(result.imageAudit)

await startReportServer({ port: 8899 })
```

## License

[MIT](./LICENSE)

// @env node
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { execSync } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { AnalysisResult, ImageAuditOptions, ReportServerHandle } from './types.js'
import { resolveOptions } from './constants.js'
import { analyze, logAnalysisSummary } from './analyzer.js'
import { generateReportHtml } from './report.js'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
}

export interface ReportContext {
  root: string
  result: AnalysisResult
  getHtml: () => string
  refresh: () => AnalysisResult
}

export function createReportContext(
  options: ImageAuditOptions,
  root: string,
): ReportContext {
  let result = analyze(options, root)

  return {
    root,
    get result() {
      return result
    },
    getHtml: () => generateReportHtml(result),
    refresh() {
      result = analyze(options, root)
      return result
    },
  }
}

export function createReportMiddleware(ctx: ReportContext) {
  return (req: IncomingMessage, res: ServerResponse, next?: () => void) => {
    const url = new URL(req.url || '/', 'http://localhost')

    if (url.pathname === '/delete' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const { path: relativePath } = JSON.parse(body) as { path: string }
          const filePath = path.join(ctx.root, relativePath)

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            ctx.refresh()
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          }
          else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: `File not found: ${filePath}` }))
          }
        }
        catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: (e as Error).message }))
        }
      })
      return
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(ctx.getHtml())
      return
    }

    const decodedPath = decodeURIComponent(url.pathname.slice(1))
    const imgPath = path.join(ctx.root, decodedPath)
    if (decodedPath && fs.existsSync(imgPath) && fs.statSync(imgPath).isFile()) {
      const ext = path.extname(imgPath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
      fs.createReadStream(imgPath).pipe(res)
      return
    }

    next?.()
  }
}

function openBrowser(url: string): void {
  try {
    const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
    execSync(`${cmd} ${url}`, { stdio: 'ignore' })
  }
  catch {
    console.log(`[image-audit] Open in browser: ${url}`)
  }
}

export function startReportServer(
  options: ImageAuditOptions = {},
  root: string = process.cwd(),
): Promise<ReportServerHandle> {
  const opts = resolveOptions(options, root)
  const ctx = createReportContext(options, root)

  logAnalysisSummary(ctx.result)

  if (opts.output) {
    const outputPath = path.isAbsolute(opts.output) ? opts.output : path.join(opts.root, opts.output)
    fs.writeFileSync(outputPath, ctx.getHtml(), 'utf-8')
    console.log(`[image-audit] Report written: ${outputPath}`)
  }

  const middleware = createReportMiddleware(ctx)

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      middleware(req, res, () => {
        res.writeHead(404)
        res.end('Not Found')
      })
    })

    server.listen(opts.port, () => {
      const url = `http://localhost:${opts.port}`
      console.log(`[image-audit] Report server: ${url}`)
      if (opts.open)
        openBrowser(url)

      resolve({
        port: opts.port,
        url,
        close: () => server.close(),
      })
    })
  })
}

import type { Plugin } from 'vite'
import type { ImageAuditOptions } from './types.js'
import { logAnalysisSummary } from './analyzer.js'
import { createReportContext, createReportMiddleware, startReportServer } from './server.js'
import { resolveOptions } from './constants.js'

export interface ViteImageAuditOptions extends ImageAuditOptions {
  /** Vite plugin apply filter */
  apply?: Plugin['apply']
  /** Mount path for the report UI (default: image-audit report on dedicated port) */
  mountPath?: string
  /**
   * When true, mount report middleware on the Vite dev server instead of a separate port.
   * Access at http://localhost:<vite-port>/__image-audit__/
   */
  integrate?: boolean
}

export function imageAudit(options: ViteImageAuditOptions = {}): Plugin {
  const {
    mountPath = '/__image-audit__',
    integrate = false,
    apply: userApply,
    ...coreOptions
  } = options

  let serverStarted = false

  return {
    name: 'image-audit',
    apply: userApply ?? 'serve',
    configureServer(server) {
      const root = server.config.root
      const opts = resolveOptions(coreOptions, root)

      console.log('[image-audit] Scanning project images...')
      const ctx = createReportContext(coreOptions, root)
      logAnalysisSummary(ctx.result)

      const middleware = createReportMiddleware(ctx)

      if (integrate) {
        server.middlewares.use(mountPath, (req, res, next) => {
          const base = mountPath.endsWith('/') ? mountPath.slice(0, -1) : mountPath
          const originalUrl = req.url || '/'
          req.url = originalUrl.startsWith(base)
            ? originalUrl.slice(base.length) || '/'
            : originalUrl
          middleware(req, res, next)
        })
        const url = `http://localhost:${server.config.server.port}${mountPath}/`
        console.log(`[image-audit] Report mounted at ${url}`)
      }
      else if (!serverStarted) {
        serverStarted = true
        startReportServer({ ...coreOptions, open: opts.open, port: opts.port }, root)
      }
    },
  }
}

export default imageAudit

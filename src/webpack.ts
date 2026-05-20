import type { Compiler } from 'webpack'
import type { ImageAuditOptions } from './types.js'
import { createReportContext, startReportServer } from './server.js'
import { logAnalysisSummary } from './analyzer.js'
import { resolveOptions } from './constants.js'

export interface WebpackImageAuditOptions extends ImageAuditOptions {
  /** Only run when webpack serve / watch is active */
  runInServeOnly?: boolean
}

export class ImageAuditWebpackPlugin {
  private options: WebpackImageAuditOptions
  private started = false

  constructor(options: WebpackImageAuditOptions = {}) {
    this.options = options
  }

  apply(compiler: Compiler): void {
    const { runInServeOnly = true, ...coreOptions } = this.options

    const shouldRun = () => {
      if (!runInServeOnly)
        return true
      return process.env.WEBPACK_SERVE === 'true' || compiler.watchMode
    }

    compiler.hooks.done.tap('image-audit', () => {
      if (this.started || !shouldRun())
        return

      this.started = true
      const root = compiler.context
      const opts = resolveOptions(coreOptions, root)

      console.log('[image-audit] Scanning project images...')
      const ctx = createReportContext(coreOptions, root)
      logAnalysisSummary(ctx.result)

      startReportServer({ ...coreOptions, open: opts.open, port: opts.port }, root)
    })
  }
}

export function imageAuditWebpack(options?: WebpackImageAuditOptions): ImageAuditWebpackPlugin {
  return new ImageAuditWebpackPlugin(options)
}

export default ImageAuditWebpackPlugin

export { analyze, logAnalysisSummary } from './analyzer.js'
export { scanImages, scanCodeFiles, findFiles } from './scanner.js'
export { generateReportHtml } from './report.js'
export {
  createReportContext,
  createReportMiddleware,
  startReportServer,
} from './server.js'
export type {
  AnalysisResult,
  ImageInfo,
  ImageAuditOptions,
  ReportServerHandle,
} from './types.js'
export {
  DEFAULT_ASSET_DIRS,
  DEFAULT_CODE_EXTENSIONS,
  DEFAULT_EXCLUDE_DIRS,
  DEFAULT_IMAGE_EXTENSIONS,
  DEFAULT_PORT,
  DEFAULT_SEARCH_DIRS,
  resolveOptions,
} from './constants.js'

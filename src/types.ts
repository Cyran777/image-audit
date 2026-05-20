export interface ImageInfo {
  path: string
  relativePath: string
  size: number
  name: string
}

export interface AnalysisResult {
  allImages: ImageInfo[]
  usedImages: Set<string>
  imageAudit: ImageInfo[]
}

export interface ImageAuditOptions {
  /** Project root directory */
  root?: string
  /** Directories to scan for code references */
  searchDirs?: string[]
  /** Directories to scan for image assets */
  assetDirs?: string[]
  imageExtensions?: string[]
  codeExtensions?: string[]
  excludeDirs?: string[]
  /** Dev server port for the report UI */
  port?: number
  /** Auto-open browser when report server starts */
  open?: boolean
  /** Output path for static HTML report (optional) */
  output?: string
}

export interface ReportServerHandle {
  port: number
  url: string
  close: () => void
}

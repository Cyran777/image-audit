import type { ImageAuditOptions } from './types.js'

export const DEFAULT_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.ico',
]

export const DEFAULT_CODE_EXTENSIONS = [
  '.vue',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.md',
]

export const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.output',
  '.nuxt',
  '.next',
  'coverage',
]

export const DEFAULT_SEARCH_DIRS = ['src']
export const DEFAULT_ASSET_DIRS = ['src', 'public']
export const DEFAULT_PORT = 8899

export function resolveOptions(options: ImageAuditOptions = {}, root: string) {
  return {
    root,
    searchDirs: options.searchDirs ?? DEFAULT_SEARCH_DIRS,
    assetDirs: options.assetDirs ?? DEFAULT_ASSET_DIRS,
    imageExtensions: options.imageExtensions ?? DEFAULT_IMAGE_EXTENSIONS,
    codeExtensions: options.codeExtensions ?? DEFAULT_CODE_EXTENSIONS,
    excludeDirs: options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS,
    port: options.port ?? DEFAULT_PORT,
    open: options.open ?? true,
    output: options.output,
  }
}

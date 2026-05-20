import fs from 'node:fs'
import path from 'node:path'
import type { ImageInfo } from './types.js'
import { resolveOptions } from './constants.js'
import type { ImageAuditOptions } from './types.js'

export function findFiles(
  dir: string,
  extensions: string[],
  excludeDirs: string[],
  fileList: string[] = [],
): string[] {
  const absDir = path.resolve(dir)
  if (!fs.existsSync(absDir))
    return fileList

  for (const file of fs.readdirSync(absDir)) {
    const filePath = path.join(absDir, file)
    try {
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file))
          findFiles(filePath, extensions, excludeDirs, fileList)
      }
      else if (extensions.includes(path.extname(file).toLowerCase())) {
        fileList.push(filePath)
      }
    }
    catch {
      // ignore inaccessible files
    }
  }

  return fileList
}

export function scanImages(
  options: ImageAuditOptions,
  root: string,
): ImageInfo[] {
  const opts = resolveOptions(options, root)
  const images: ImageInfo[] = []

  for (const dir of opts.assetDirs) {
    const absDir = path.join(opts.root, dir)
    const files = findFiles(absDir, opts.imageExtensions, opts.excludeDirs)
    for (const imgPath of files) {
      const relativePath = path.relative(opts.root, imgPath).replace(/\\/g, '/')
      images.push({
        path: imgPath,
        relativePath,
        size: fs.statSync(imgPath).size,
        name: path.basename(imgPath),
      })
    }
  }

  return images
}

export function scanCodeFiles(
  options: ImageAuditOptions,
  root: string,
): string[] {
  const opts = resolveOptions(options, root)
  const codeFiles: string[] = []

  for (const dir of opts.searchDirs) {
    const absDir = path.join(opts.root, dir)
    codeFiles.push(...findFiles(absDir, opts.codeExtensions, opts.excludeDirs))
  }

  return codeFiles
}

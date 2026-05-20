import fs from 'node:fs'
import path from 'node:path'
import type { AnalysisResult, ImageAuditOptions, ImageInfo } from './types.js'
import { scanCodeFiles, scanImages } from './scanner.js'

function getFileNameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.extname(filePath)).toLowerCase()
}

function isImageUsed(imagePath: string, codeFiles: string[]): boolean {
  const imageName = path.basename(imagePath).toLowerCase()
  const imageNameWithoutExt = getFileNameWithoutExt(imagePath)

  for (const codeFile of codeFiles) {
    try {
      const content = fs.readFileSync(codeFile, 'utf-8')
      if (content.includes(imageName) || content.includes(imageNameWithoutExt))
        return true
    }
    catch {
      // ignore read errors
    }
  }

  return false
}

export function analyze(
  options: ImageAuditOptions = {},
  root: string = process.cwd(),
): AnalysisResult {
  const allImages = scanImages(options, root)
  const codeFiles = scanCodeFiles(options, root)
  const usedImages = new Set<string>()
  const imageAudit: ImageInfo[] = []

  for (const img of allImages) {
    if (isImageUsed(img.path, codeFiles))
      usedImages.add(img.relativePath)
    else
      imageAudit.push(img)
  }

  return { allImages, usedImages, imageAudit }
}

export function logAnalysisSummary(result: AnalysisResult): void {
  const { allImages, usedImages, imageAudit } = result
  const size = imageAudit.reduce((sum, img) => sum + img.size, 0)

  console.log('\n[image-audit] Analysis complete')
  console.log(`  Total:  ${allImages.length}`)
  console.log(`  Used:   ${usedImages.size}`)
  console.log(`  Unused: ${imageAudit.length}`)
  console.log(`  Savings: ${(size / 1024).toFixed(2)} KB (unused only)\n`)
}

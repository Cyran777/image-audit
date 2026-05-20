#!/usr/bin/env node
import { startReportServer } from './server.js'

const args = process.argv.slice(2)

function parseArgs(): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--no-open')
      result.open = false
    else if (arg.startsWith('--port='))
      result.port = arg.slice(7)
    else if (arg === '--port' && args[i + 1])
      result.port = args[++i]
    else if (arg.startsWith('--output='))
      result.output = arg.slice(9)
    else if (arg === '--output' && args[i + 1])
      result.output = args[++i]
    else if (arg === '--help' || arg === '-h')
      result.help = true
  }
  return result
}

function printHelp(): void {
  console.log(`
image-audit — Find and visualize unused images in your project

Usage:
  image-audit [options]

Options:
  --port <number>    Report server port (default: 8899)
  --output <file>    Write static HTML report to file
  --no-open          Do not open browser automatically
  -h, --help         Show help

Examples:
  npx image-audit
  npx image-audit --port 9000 --output image-report.html
`)
}

async function main(): Promise<void> {
  const parsed = parseArgs()

  if (parsed.help) {
    printHelp()
    process.exit(0)
  }

  console.log('╔══════════════════════════════════════════╗')
  console.log('║           image-audit v1.0.0             ║')
  console.log('╚══════════════════════════════════════════╝\n')

  await startReportServer({
    port: parsed.port ? Number(parsed.port) : undefined,
    output: typeof parsed.output === 'string' ? parsed.output : undefined,
    open: parsed.open !== false,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Pencil get_variables 출력(JSON)을 tokens.css에 반영.
 * 사용: node scripts/sync-pencil-tokens.mjs [design/tokens.export.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const inputPath = resolve(root, process.argv[2] || 'design/tokens.export.json')
const manifestPath = resolve(root, 'design/tokens.manifest.json')
const tokensCssPath = resolve(root, 'frontend/src/design/tokens.css')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
let exportData
try {
  exportData = JSON.parse(readFileSync(inputPath, 'utf8'))
} catch {
  console.error(`파일 없음: ${inputPath}`)
  console.error('Pencil MCP get_variables 결과를 tokens.export.json 으로 저장하세요.')
  process.exit(1)
}

const cssVars = { ...readCssVars(readFileSync(tokensCssPath, 'utf8')) }

for (const [key, meta] of Object.entries(manifest.variables)) {
  const cssName = meta.css
  const exported = exportData.variables?.[key] ?? exportData[key]
  if (exported == null) continue
  const value = typeof exported === 'object' ? exported.value ?? exported.$value : exported
  if (value != null) cssVars[cssName] = String(value)
}

const header = `/**
 * Chick Sales ERP — Design Tokens
 * Pencil(.pen) 변수와 1:1 매핑. 자동 생성: scripts/sync-pencil-tokens.mjs
 * @see design/README.md
 */
`

const body =
  ':root {\n' +
  Object.entries(cssVars)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n') +
  '\n}\n'

writeFileSync(tokensCssPath, header + body)
console.log(`Updated ${tokensCssPath} (${Object.keys(cssVars).length} variables)`)

function readCssVars(css) {
  const vars = {}
  const re = /(--erp-[a-z0-9-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css))) vars[m[1]] = m[2].trim()
  return vars
}

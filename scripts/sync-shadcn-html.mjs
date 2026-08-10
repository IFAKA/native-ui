import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'

const repo = 'codylindley/shadcn-html'
const ref = process.env.SHADCN_HTML_REF || 'main'
const vendor = path.resolve('vendor/shadcn-html')
const api = 'https://api.github.com'
const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'native-ui-port' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function getJson(url) {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${url}`)
  return r.json()
}
async function getText(url) {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${url}`)
  return r.text()
}
async function pool(items, limit, fn) {
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const item = items[i++]; await fn(item) }
  })
  await Promise.all(workers)
}

await fs.rm(vendor, { recursive: true, force: true })
const tree = await getJson(`${api}/repos/${repo}/git/trees/${ref}?recursive=1`)
const files = tree.tree.filter(x => x.type === 'blob' && (x.path.startsWith('dist/') || x.path === 'LICENSE'))
await pool(files, 8, async file => {
  const dst = path.join(vendor, file.path)
  await fs.mkdir(path.dirname(dst), { recursive: true })
  const content = await getText(`https://raw.githubusercontent.com/${repo}/${ref}/${file.path}`)
  await fs.writeFile(dst, content)
})
console.log(`synced ${files.length} upstream files at ${tree.sha}`)
execFileSync(process.execPath, ['scripts/convert-shadcn-html.mjs', vendor, 'generated'], { stdio: 'inherit' })

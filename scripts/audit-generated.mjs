import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = path.resolve(process.argv[2] || 'generated')
const contractsFile = path.resolve(process.argv[3] || 'component-contracts.json')
const forbiddenCss = [
  /\.btn(?=[.#:[\s>{+~]|$)/,
  /\.input(?=[.#:[\s>{+~]|$)/,
  /var\(\s*--[\w-]+/,
  /(?:^|[;{])\s*--[\w-]+\s*:/m,
]
let failures = 0
const contracts = JSON.parse(await fs.readFile(contractsFile, 'utf8'))
const contractsByName = new Map(contracts.map((contract) => [contract.name, contract]))

function fail(message) {
  console.error(message)
  failures++
}

async function auditCss() {
  async function walk(dir) {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      if (ent.name === 'native-ui') continue
      const file = path.join(dir, ent.name)
      if (ent.isDirectory()) await walk(file)
      else if (file.endsWith('.css')) {
        const css = await fs.readFile(file, 'utf8')
        for (const rule of forbiddenCss) if (rule.test(css)) fail(`forbidden ${rule} in ${file}`)
      }
    }
  }
  await walk(root)
}

async function auditPages() {
  const report = JSON.parse(await fs.readFile(path.join(root, 'conversion-report.json'), 'utf8').catch(() => 'null'))
  if (!report) fail('missing conversion report: conversion-report.json')
  else if (path.isAbsolute(report.source)) fail(`non-reproducible conversion source: ${report.source}`)

  const entries = (await fs.readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !['native-ui', 'assets'].includes(entry.name))
  if (entries.length !== 55) fail(`expected 55 generated pages, found ${entries.length}`)
  if (contracts.length !== entries.length) fail(`contract/page count mismatch: ${contracts.length}/${entries.length}`)
  const catalog = await fs.readFile(path.join(root, 'COMPONENT_MINIMUM_STYLES.md'), 'utf8').catch(() => '')
  if (!catalog) fail('missing generated component catalog: COMPONENT_MINIMUM_STYLES.md')

  for (const entry of entries) {
    const component = entry.name
    const contract = contractsByName.get(component)
    if (!contract) {
      fail(`missing contract for ${component}`)
      continue
    }
    if (contract.cssPolicy !== 'native-visual-denylist')
      fail(`unsupported CSS policy for ${component}: ${contract.cssPolicy || 'missing'}`)
    if (!catalog.includes(`| [${component}](./${component}/index.html) |`))
      fail(`component catalog missing ${component}`)
    const dir = path.join(root, component)
    for (const requiredFile of contract.requiredFiles || []) {
      const filename = requiredFile === 'html'
        ? 'index.html'
        : `${component}.${requiredFile}`
      try {
        await fs.access(path.join(dir, filename))
      } catch {
        fail(`missing required ${requiredFile} file for ${component}: ${filename}`)
      }
    }
    const index = path.join(dir, 'index.html')
    let html
    try {
      html = await fs.readFile(index, 'utf8')
    } catch {
      fail(`missing page: ${index}`)
      continue
    }

    const refs = [
      ...html.matchAll(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']/gi),
      ...html.matchAll(/<script(?:\s+[^>]*)?\s+src=["']([^"']+)["'][^>]*><\/script>/gi),
    ]
    for (const [, ref] of refs) {
      if (/^(?:[a-z]+:)?\/\//i.test(ref) || ref.startsWith('/')) {
        fail(`non-local asset reference in ${index}: ${ref}`)
        continue
      }
      try {
        await fs.access(path.resolve(dir, ref))
      } catch {
        fail(`missing asset referenced by ${index}: ${ref}`)
      }
    }

    for (const [, ref] of html.matchAll(/<script(?:\s+[^>]*)?\s+src=["']([^"']+\.js)["'][^>]*><\/script>/gi)) {
      try {
        execFileSync(process.execPath, ['--check', path.resolve(dir, ref)], { stdio: 'pipe' })
      } catch (error) {
        fail(`invalid local script referenced by ${index}: ${ref}\n${error.stderr?.toString() || ''}`)
      }
    }

    for (const [, attributes] of html.matchAll(/<script\b([^>]*)\bsrc=["'][^"']+\.js["'][^>]*><\/script>/gi)) {
      if (/\bimport\s/.test(await fs.readFile(path.resolve(dir, (html.match(/<script\b[^>]*\bsrc=["']([^"']+\.js)/i) || [])[1] || ''), 'utf8').catch(() => '')) && !/\btype=["']module["']/i.test(attributes))
        fail(`module behavior script missing type=module in ${index}`)
    }

    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(([, id]) => id)
    if (new Set(ids).size !== ids.length) fail(`duplicate id in ${index}`)
    const idSet = new Set(ids)
    for (const [, attributes] of html.matchAll(/<([a-z][^>]*)>/gi)) {
      for (const [, attribute, value] of attributes.matchAll(/\b(data-(?:dialog|alert-dialog|sheet|context-menu|dropdown|tooltip|command)(?:-trigger|-open)?|popovertarget|aria-controls|aria-labelledby|aria-describedby|for)=["']([^"']+)["']/gi)) {
        for (const reference of value.split(/\s+/).map((item) => item.replace(/^#/, '')).filter(Boolean))
          if (!idSet.has(reference)) fail(`unresolved ${attribute} target in ${index}: ${reference}`)
      }
    }
    if (component === 'context-menu' && /class="[^"]*context-menu/.test(html) && !/<[^>]*class="[^"]*context-menu[^>]*role="menu"/.test(html))
      fail(`context-menu popover missing role=menu in ${index}`)
    if (component === 'sortable' && /<h2>[^<]*<\/h2>\s*<li\b/.test(html))
      fail(`sortable item is not contained by a list in ${index}`)
    if (component === 'tree-view' && /aria-expanded=/.test(html))
      fail(`tree-view duplicates native details state with aria-expanded in ${index}`)
    if (component === 'navigation-menu' && /href="#"/.test(html))
      fail(`navigation-menu contains a fake placeholder href in ${index}`)
    if (component === 'toast' && /class="[^"]*toast-container/.test(html) && !/data-toast-region/.test(html))
      fail(`toast container is not marked as the adapter root in ${index}`)
    for (const [, ref] of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']*)["']/gi)) {
      if (!ref) fail(`empty image source in ${index}`)
      try { await fs.access(path.resolve(dir, ref)) } catch { fail(`missing image referenced by ${index}: ${ref}`) }
    }
    // Vendor source remains unchanged; generated examples must still have
    // resolvable native interaction targets.
    for (const asset of contract.assets || []) {
      try { await fs.access(path.join(root, 'assets', asset)) }
      catch { fail(`missing contract asset for ${component}: ${asset}`) }
    }
    const cssFile = path.join(dir, `${component}.css`)
    const css = await fs.readFile(cssFile, 'utf8').catch(() => '')
    for (const selector of contract.requiredSelectors || []) {
      if (!css.includes(`${selector} {`)) fail(`missing contract selector for ${component}: ${selector}`)
    }
    for (const property of contract.requiredProperties || []) {
      const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      if (!new RegExp(`\\b${cssProperty.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*:`).test(css))
        fail(`missing contract property for ${component}: ${cssProperty}`)
    }
  }

  const checks = {
    alert: [/<div class="alert"[^>]*role="alert"/, /alert\.css/],
    'alert-dialog': [/alert-dialog\.js/, /data-alert-dialog-trigger=/, /<dialog\b[^>]*role="alertdialog"/, /data-alert-dialog-close/],
    calendar: [/calendar\.js/, /data-action="prev-month"/, /aria-live="polite"/],
    carousel: [/carousel\.css/, /carousel\.js/],
    combobox: [/combobox\.css/, /combobox\.js/, /popovertarget="[^"]+"/, /role="listbox"/, /role="option"/],
    command: [/command\.css/, /command\.js/, /data-command-trigger=/, /<dialog\b[^>]*class="command"/],
    dialog: [/dialog\.css/, /data-dialog-trigger=/, /<dialog\b/, /data-dialog-close/],
    dropdown: [/popovertarget="[^"]+"/, /role="menu"/],
    'context-menu': [/context-menu\.js/, /data-context-menu=/, /role="menu"/, /role="menuitem"/],
    sheet: [/sheet\.js/, /data-sheet-trigger=/, /data-sheet-close/],
    sortable: [/sortable\.js/, /role="listbox"/, /draggable="true"/],
    toast: [/toast\.js/, /role="status"/, /data-toast-close/],
    toggle: [/toggle\.js/, /aria-pressed=/],
    'toggle-group': [/toggle-group\.js/, /data-type="single"/, /aria-pressed=/],
    toolbar: [/toolbar\.js/, /role="toolbar"/],
    tooltip: [/popover="hint"/, /role="tooltip"/],
    tabs: [/tabs\.css/, /tabs\.js/],
    'navigation-menu': [/popovertarget="[^"]+"/, /<nav\b/, /href="(?!#)/],
    'tree-view': [/<details\b/, /<summary\b/, /role="tree"/],
  }
  for (const [component, patterns] of Object.entries(checks)) {
    const html = await fs.readFile(path.join(root, component, 'index.html'), 'utf8')
    for (const pattern of patterns) if (!pattern.test(html)) fail(`${component} behavior check failed: ${pattern}`)
  }

  const iconHtml = await fs.readFile(path.join(root, 'icon/index.html'), 'utf8')
  if (/data-lucide=/.test(iconHtml)) fail('icon preview still contains unresolved data-lucide placeholders')
  const svgBodies = [...iconHtml.matchAll(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gi)].map(([, body]) => body.trim())
  if (!svgBodies.length || svgBodies.some((body) => !body || body === '...')) fail('icon preview contains an empty SVG')
}

await auditCss()
await auditPages()
if (failures) process.exit(1)
console.log('generated audit: ok (55 pages, local assets, valid scripts, native behavior checks)')

import fs from 'node:fs'
import assert from 'node:assert/strict'

const core = fs.readFileSync(new URL('../src/core.css', import.meta.url), 'utf8')
const components = fs.readFileSync(new URL('../src/components.css', import.meta.url), 'utf8')
const behavior = (name) => fs.readFileSync(new URL(`../src/behavior/${name}.js`, import.meta.url), 'utf8')
const contracts = JSON.parse(fs.readFileSync(new URL('../component-contracts.json', import.meta.url), 'utf8'))
const contractFor = (name) => contracts.find((contract) => contract.name === name)

for (const selector of ['button {', 'select {', 'body {', 'h1 {', ':root {']) {
  assert.equal(core.includes(selector), false, `core.css must not style ${selector}`)
}

for (const forbidden of ['--primary', '--background', '--radius', '.btn', '.card {']) {
  assert.equal((core + components).includes(forbidden), false, `design-system token/abstraction forbidden: ${forbidden}`)
}

for (const rule of [
  '.alert {',
  'background: Canvas',
  'color: CanvasText',
  'ButtonFace',
  '.accordion-item[open] > .accordion-trigger .accordion-chevron',
  '.accordion-trigger::marker',
  '::-webkit-details-marker',
]) {
  assert.ok(components.includes(rule), `native preview default missing: ${rule}`)
}

assert.ok(fs.existsSync(new URL('../COMPONENT_MATRIX.md', import.meta.url)))

const dialog = behavior('dialog')
assert.match(dialog, /showModal\(\)/)
assert.match(dialog, /\.close\(/)
assert.match(dialog, /data-dialog-trigger/)
assert.match(dialog, /data-dialog-open/)

const command = behavior('command')
assert.match(command, /data-command-trigger/)
assert.match(command, /showModal\(\)/)
assert.match(command, /\.close\(\)/)
assert.match(command, /command-empty/)
for (const contract of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'aria-activedescendant', 'aria-selected', 'Enter', 'metaKey', 'ctrlKey'])
  assert.match(command, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

const dropdown = behavior('dropdown')
for (const contract of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'role="menuitem"', 'hidePopover'])
  assert.match(dropdown, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

const tooltip = behavior('tooltip')
for (const contract of ['pointerenter', 'pointerleave', 'focus', 'blur', 'aria-describedby', 'Escape', 'showPopover', 'hidePopover'])
  assert.match(tooltip, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

const combobox = behavior('combobox')
for (const contract of ['aria-activedescendant', 'aria-selected', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'showPopover', 'hidePopover'])
  assert.match(combobox, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

assert.equal(contractFor('navigation-menu').requiredFiles.includes('js'), false)
assert.match(contractFor('navigation-menu').behavior, /native popover/i)
assert.equal(contractFor('tree-view').requiredFiles.includes('js'), false)
assert.match(contractFor('tree-view').behavior, /native details/i)
for (const name of ['alert-dialog', 'calendar', 'context-menu', 'sheet', 'sortable', 'toast', 'toggle', 'toggle-group', 'toolbar'])
  assert.ok(contractFor(name).requiredFiles.includes('js'), `${name} must declare its behavior adapter`)
console.log('architecture invariants: ok')

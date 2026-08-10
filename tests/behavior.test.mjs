import assert from 'node:assert/strict'
import { enhanceCommand } from '../src/behavior/command.js'
import { enhanceDropdown } from '../src/behavior/dropdown.js'
import { enhanceTooltips } from '../src/behavior/tooltip.js'

class FakeElement {
  constructor({ text = '', id = '', selectors = [] } = {}) {
    this.textContent = text; this.id = id; this.hidden = false; this.open = false
    this.listeners = {}; this.attrs = {}; this.children = []; this.selectors = new Map(selectors)
    this.classList = { values: new Set(), toggle: (name, on) => on ? this.classList.values.add(name) : this.classList.values.delete(name) }
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn) }
  dispatch(type, event = {}) { for (const fn of this.listeners[type] || []) fn({ target: this, key: '', preventDefault() {}, ...event }) }
  setAttribute(name, value) { this.attrs[name] = String(value) }
  getAttribute(name) { return this.attrs[name] ?? null }
  querySelector(selector) { return this.selectors.get(selector) || null }
  querySelectorAll(selector) { return this.selectors.get(selector) || [] }
  closest(selector) { return selector === 'dialog' ? this.dialog : selector.includes('[popover') ? this.menu : null }
  focus() { this.focused = true }
  click() { this.clicked = true }
  matches(selector) { return selector === '[popover][role="menu"]' && this.popoverMenu }
  showPopover() { this.shown = true; this.showCount = (this.showCount || 0) + 1 }
  hidePopover() { this.hiddenByPopover = true }
  close() { this.closed = true }
}

const input = new FakeElement()
input.value = ''
const list = new FakeElement({ id: 'command-list' })
const empty = new FakeElement()
const items = [new FakeElement({ text: 'Alpha' }), new FakeElement({ text: 'Beta' }), new FakeElement({ text: 'Gamma' })]
const dialog = new FakeElement({ id: 'command-dialog' }); dialog.showModal = () => { dialog.open = true }; dialog.querySelector = () => input
const palette = new FakeElement({ id: 'command-dialog', selectors: [['input[type="search"], input[role="combobox"], .command-input', input], ['.command-list, [role="listbox"]', list], ['.command-empty', empty], ['[data-command-item], .command-item', items]] }); palette.dialog = dialog
const trigger = new FakeElement(); trigger.attrs['data-command-trigger'] = 'command-dialog'
const root = new FakeElement({ selectors: [['.command', [palette]], ['[data-command-trigger], [data-command-open]', trigger]] }); root.getElementById = (id) => id === dialog.id ? dialog : null
enhanceCommand(root)
input.dispatch('input')
palette.dispatch('keydown', { key: 'ArrowDown', preventDefault() {} })
assert.equal(input.attrs['aria-activedescendant'], items[1].id)
palette.dispatch('keydown', { key: 'End', preventDefault() {} })
assert.equal(items[2].classList.values.has('is-active'), true)
palette.dispatch('keydown', { key: 'Enter', preventDefault() {} })
assert.equal(items[2].clicked, true)
root.dispatch('keydown', { key: 'k', ctrlKey: true, preventDefault() {} })
assert.equal(dialog.open, true)

const menuItems = [new FakeElement(), new FakeElement(), new FakeElement()]
const menu = new FakeElement({ selectors: [['[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]', menuItems]] }); menu.popoverMenu = true; menu.id = 'menu'
const dropdownRoot = new FakeElement({ selectors: [['[popover][role="menu"]', [menu]]] });
for (const item of menuItems) item.menu = menu
enhanceDropdown(dropdownRoot)
dropdownRoot.dispatch('toggle', { target: menu, newState: 'open' })
assert.equal(menuItems[0].focused, true)
dropdownRoot.dispatch('keydown', { target: menuItems[0], key: 'End', preventDefault() {} })
assert.equal(menuItems[2].focused, true)

const tooltip = new FakeElement({ id: 'tip' }); tooltip.attrs.role = 'tooltip'
const tooltipTrigger = new FakeElement(); tooltipTrigger.attrs['data-tooltip-trigger'] = 'tip'
const tooltipRoot = new FakeElement({ selectors: [['[data-tooltip-trigger], [popovertarget]', [tooltipTrigger]]] }); tooltipRoot.getElementById = () => tooltip
enhanceTooltips(tooltipRoot)
tooltipTrigger.dispatch('pointerenter')
tooltipTrigger.dispatch('pointerenter')
assert.equal(tooltip.shown, true)
assert.equal(tooltip.showCount, 1)
assert.equal(tooltipTrigger.attrs['aria-describedby'], 'tip')
tooltipTrigger.dispatch('pointerleave')
assert.equal(tooltip.hiddenByPopover, true)
console.log('behavior runtime tests: ok')

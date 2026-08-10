import assert from 'node:assert/strict'
import fs from 'node:fs'
import { enhanceContextMenus } from '../src/behavior/context-menu.js'
import { enhanceCalendar } from '../src/behavior/calendar.js'

class Node {
  constructor() { this.listeners = {}; this.attrs = {}; this.style = {}; this.children = [] }
  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener) }
  dispatch(type, event = {}) { for (const listener of this.listeners[type] || []) listener({ target: this, preventDefault() {}, ...event }) }
  getAttribute(name) { return this.attrs[name] ?? null }
  setAttribute(name, value) { this.attrs[name] = String(value) }
  closest() { return this }
  querySelectorAll() { return [] }
  focus() { this.focused = true }
  showPopover() { this.open = true }
  hidePopover() { this.open = false }
}

const trigger = new Node()
trigger.attrs['data-context-menu'] = 'menu'
const menu = new Node()
menu.id = 'menu'
const root = new Node()
root.getElementById = () => menu
root.addEventListener = Node.prototype.addEventListener
enhanceContextMenus(root)
root.listeners.contextmenu[0]({ target: trigger, clientX: 120, clientY: 80, preventDefault() {} })
assert.equal(menu.style.left, '120px')
assert.equal(menu.style.top, '80px')
assert.equal(menu.open, true)

const heading = new Node()
heading.textContent = 'April 2026'
heading.attrs['aria-live'] = 'polite'
const grid = new Node()
const calendar = new Node()
calendar.querySelector = (selector) => selector.includes('aria-live') ? heading : grid
enhanceCalendar(calendar)
const next = new Node()
next.attrs['data-action'] = 'next-month'
calendar.listeners.click[0]({ target: { closest: () => next } })
assert.match(heading.textContent, /May 2026/)
assert.match(grid.innerHTML, /data-day="31"/)
assert.doesNotMatch(grid.innerHTML, /April 2026/)

const generated = (name) => fs.readFileSync(`generated/${name}/index.html`, 'utf8')
assert.match(generated('context-menu'), /popover[^>]*role="menu"/)
assert.doesNotMatch(generated('sortable'), /<h2>[^<]*<\/h2>\s*<li\b/)
assert.doesNotMatch(generated('tree-view'), /aria-expanded=/)
assert.match(generated('toast'), /class="toast-container"[^>]*data-toast-region/)
assert.doesNotMatch(generated('navigation-menu'), /href="#"/)
console.log('native contract runtime tests: ok')

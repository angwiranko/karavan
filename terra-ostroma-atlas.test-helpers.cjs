const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');

// A small deterministic UI adapter exercises the production handlers without
// launching or inspecting a browser. Image completion order is controlled below.
function atlasHarness(source, html, { hash = '', autoLoad = true, reduced = false } = {}) {
  class Element {
    constructor(id) {
      this.id = id; this.listeners = {}; this.attributes = new Map(); this.dataset = {};
      this.style = { setProperty(key, value) { this[key] = value; } };
      this.textContent = ''; this.innerHTML = ''; this.hidden = false;
      const classes = new Set();
      this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name), toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } };
    }
    get clientWidth() { return 1100; }
    get clientHeight() { return 650; }
    get offsetWidth() { return parseFloat(this.style.width) || 1100; }
    get offsetHeight() { return parseFloat(this.style.height) || 619; }
    setAttribute(key, value) { this.attributes.set(key, String(value)); }
    removeAttribute(key) { this.attributes.delete(key); }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
    querySelectorAll() { return []; }
    cloneNode() { return new Element('clone'); }
    getBoundingClientRect() { return { left: 0, top: 0, width: 1100, height: 650 }; }
  }
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], new Element(match[1])]));
  const doc = new Element('document');
  doc.body = new Element('body');
  doc.getElementById = id => { if (id === 'sceneStats' && !elements.has(id)) return null; assert.ok(elements.has(id), `Unknown DOM id ${id}`); return elements.get(id); };
  const media = new Element('media'); media.matches = reduced;
  const win = new Element('window');
  win.matchMedia = () => media;
  win.requestIdleCallback = () => {};
  const location = { hash };
  const pending = new Map();
  class Image {
    naturalWidth = 1672; naturalHeight = 941;
    set src(value) {
      this.url = value;
      const id = path.basename(value, '.png');
      pending.set(id, this);
      if (autoLoad) queueMicrotask(() => this.onload());
    }
    get src() { return this.url; }
    decode() { return Promise.resolve(); }
  }
  const context = vm.createContext({ document: doc, window: win, location, history: { pushState: (_, __, hash) => { location.hash = hash; } }, Image, ResizeObserver: class { observe() {} }, requestAnimationFrame: fn => fn(), setTimeout, console });
  vm.runInContext(source, context);
  return {
    elements, location, media,
    async settle() { await new Promise(resolve => setImmediate(resolve)); },
    release(id, fail = false) { const img = pending.get(id); assert.ok(img, id); if (fail) img.onerror(); else img.onload(); },
    clickScene(id) { doc.emit('click', { target: { closest: selector => selector === '[data-scene]' ? { dataset: { scene: id } } : null }, preventDefault() {} }); },
    clickRoom(id) { doc.emit('click', { target: { closest: selector => selector === '[data-room]' ? { dataset: { room: id } } : null } }); },
    button(id) { elements.get(id).emit('click'); },
    hash(id) { location.hash = `#${id}`; win.emit('hashchange'); }
  };
}

module.exports = { atlasHarness };

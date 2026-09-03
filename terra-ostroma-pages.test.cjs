const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { makeSheetService } = require('./terra-ostroma-sheet.test-helpers.cjs');
const { atlasHarness } = require('./terra-ostroma-atlas.test-helpers.cjs');
const astro = require('./terra-ostroma-astronomicon.js');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const astroHTML = read('terra-ostroma-astronomicon.html');
const astroSource = read('terra-ostroma-astronomicon.js') + '\n' + read('terra-ostroma-atlas.js');

test('Astronomicon has five separate plates, complete labels and safe connections', () => {
  assert.deepEqual(Object.keys(astro.scenes), ['overview', 'fortress', 'plasma', 'core', 'warp']);
  const hashes = new Set();
  for (const [id, scene] of Object.entries(astro.scenes)) {
    assert.equal(scene.stats.length, 4);
    const png = fs.readFileSync(path.join(__dirname, astro.assetRoot, id + '.png'));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1672);
    assert.equal(png.readUInt32BE(20), 941);
    hashes.add(crypto.createHash('sha256').update(png).digest('hex'));
    assert.equal(new Set(scene.rooms.map(room => room.id)).size, scene.rooms.length);
    for (const room of scene.rooms) {
      assert.ok(room.at[0] > 0 && room.at[0] < 1000, room.id);
      assert.ok(room.at[1] > 0 && room.at[1] < 562.5, room.id);
      assert.match(room.contour, /^M.+ Z$/);
      if (id === 'overview') assert.equal(room.label.length, 2);
      if (room.target) assert.ok(astro.scenes[room.target]);
      else assert.ok(room.text.length > 50);
    }
    for (const next of scene.links) assert.ok(astro.scenes[next]);
  }
  assert.equal(hashes.size, 5);
  for (const unsafe of ['#missing', '__proto__', 'constructor', null]) assert.equal(astro.resolveScene(unsafe), 'overview');
});

test('player dossier retains key facts and removes GM-only agendas and colour variants', () => {
  const content = JSON.stringify(astro.scenes);
  assert.doesNotMatch(content, /Malcador|Adalbert|Milipedes|Erda|Rektor|káoszisten|chaos god|mesélő|agenda|bíbor köd|bíborlila/i);
  for (const fact of ['888', '10 000', 'Typhon', 'Eye of Night', 'Navigátor', 'Astropatha', 'loyalista', 'nanorobot']) assert.ok(content.includes(fact), fact);
  for (const id of ['landing', 'reception', 'quarantine', 'preparation', 'sacrifice', 'temple', 'machines', 'barracks', 'isolator']) {
    assert.ok(astro.scenes.fortress.rooms.some(room => room.id === id));
  }
  assert.deepEqual(astro.scenes.core.rooms.slice(0, 3).map(room => room.name), ['Irányító mag', 'Hangoló mag', 'Erőforrás mag']);
  assert.equal(new Set(astro.scenes.core.flows.slice(0, 3).map(flow => flow.duration)).size, 3);
  assert.match(astro.scenes.warp.overlay, /warpFade/);
  assert.match(astro.scenes.warp.overlay, /warp-boundary/);
});

test('Astronomicon handlers visit each close-up, select each room and update telemetry', async () => {
  const page = atlasHarness(astroSource, astroHTML);
  await page.settle();
  for (const [id, scene] of Object.entries(astro.scenes)) {
    page.clickScene(id); await page.settle();
    assert.equal(page.elements.get('panelTitle').textContent, scene.title);
    assert.equal(page.elements.get('sceneImage').src, astro.assetRoot + id + '.png');
    assert.match(page.elements.get('sceneStats').innerHTML, /<dt>/);
    for (const [, value] of scene.stats) assert.ok(page.elements.get('sceneStats').innerHTML.includes(value.replace(/>/g, '&gt;')));
    for (const room of scene.rooms.filter(room => !room.target)) {
      page.clickRoom(room.id);
      assert.equal(page.elements.get('detailText').textContent, room.text);
      page.clickRoom(room.id);
      assert.equal(page.elements.get('detailText').textContent, scene.note[1]);
    }
  }
  for (const id of ['fortress', 'plasma', 'core', 'warp']) {
    page.button('back'); await page.settle();
    page.clickRoom(id); await page.settle();
    assert.equal(page.elements.get('panelTitle').textContent, astro.scenes[id].title);
    page.button('zoomIn'); assert.equal(page.elements.get('zoomValue').value, '140%');
    page.button('reset'); assert.equal(page.elements.get('zoomValue').value, '100%');
  }
});

test('Astronomicon image races, errors, aliases and reduced motion are handled', async () => {
  const page = atlasHarness(astroSource, astroHTML, { autoLoad: false, reduced: true, hash: '#base' });
  page.release('fortress', true); await page.settle();
  assert.equal(page.elements.get('imageError').hidden, false);
  page.button('retry'); page.release('fortress'); await page.settle();
  assert.equal(page.elements.get('imageError').hidden, true);
  assert.equal(page.elements.get('motion').disabled, true);
  page.clickScene('plasma'); page.clickScene('core');
  page.release('core'); await page.settle();
  page.release('plasma'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, astro.scenes.core.title);
  page.hash('upper'); page.release('warp'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, astro.scenes.warp.title);
});

function recordsHarness(filename, saved = null, options = {}) {
  class Element {
    constructor(id) {
      this.id = id; this.dataset = {}; this.listeners = {}; this.children = [];
      this.className = ''; this.attributes = {}; this.value = ''; this.scrollTop = 0;
      this.classList = {
        add: name => this.classList.toggle(name, true),
        remove: name => this.classList.toggle(name, false),
        toggle: (name, enabled) => {
          const classes = new Set(this.className.split(' ').filter(Boolean));
          if (enabled) classes.add(name); else classes.delete(name);
          this.className = [...classes].join(' ');
        }
      }; this.open = false;
    }
    set innerHTML(value) {
      this.markup = value; this.children = [];
      const child = (parent, tag, cls = '') => {
        const el = new Element(tag); el.className = cls; parent.appendChild(el); return el;
      };
      // Materialize the two fixed Ostrom templates for interaction tests.
      if (value.includes('class="defense-track"')) {
        for (const level of [2, 3, 4, 5, 6]) child(this, 'button', 'defense-die').dataset.level = String(level);
        const form = child(this, 'form', 'entry-form');
        child(form, 'input'); child(form, 'button');
        child(child(this, 'div', 'entry-list'), 'div', 'empty-message');
      } else if (value.startsWith('<span class="entry-kind-icon"')) {
        child(this, 'span', 'entry-kind-icon'); child(this, 'span', 'entry-label'); child(this, 'button', 'entry-remove');
      }
    }
    get innerHTML() { return this.markup || ''; }
    appendChild(child) { this.insertBefore(child, null); }
    insertBefore(child, before) {
      child.remove(); child.parentElement = this;
      const index = before ? this.children.indexOf(before) : this.children.length;
      this.children.splice(index, 0, child);
    }
    remove() {
      if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
      this.parentElement = null;
    }
    setAttribute(key, value) { this.attributes[key] = value; }
    matches(selector) {
      if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
      const data = selector.match(/^\[data-segment-id="([^"]+)"\]$/);
      return data ? this.dataset.segmentId === data[1] : this.id === selector;
    }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
    querySelectorAll(selector) {
      const descendants = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
      if (selector === '*') return descendants;
      return descendants.filter(child => selector.split(',').some(part => {
        const pieces = part.trim().split(/\s+/);
        return child.matches(pieces.at(-1)) && (pieces.length === 1 || child.parentElement?.closest(pieces[0]));
      }));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    focus() { this.focused = true; doc.activeElement = this; }
  }
  const html = read(filename);
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m => [m[1], new Element(m[1])]));
  const groups = ['rogue-trader', 'smuggler'].map(group => { const el = new Element(group); el.dataset.group = group; return el; });
  const doc = new Element('document');
  doc.visibilityState = 'visible';
  const win = new Element('window');
  doc.getElementById = id => { assert.ok(elements.has(id), id); return elements.get(id); };
  doc.createElement = tag => new Element(tag);
  doc.querySelectorAll = selector => selector === '.group-zone' ? groups : [];
  const stored = new Map(saved ? [['terra-ostroma-state-v1', JSON.stringify(saved)]] : []);
  if (options.stored) for (const [key, value] of options.stored) stored.set(key, value);
  const cloud = options.cloud || makeSheetService();
  const timers = new Map(); let timerId = 0;
  const context = vm.createContext({ document: doc, window: win, console, crypto: crypto.webcrypto, AbortController, fetch: options.fetch || cloud.fetch, localStorage: { getItem: id => stored.get(id), setItem: (id, value) => stored.set(id, value) }, setTimeout: (fn, delay) => { timers.set(++timerId, { fn, delay }); return timerId; }, clearTimeout: id => timers.delete(id) });
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  vm.runInContext(script, context);
  return { elements, groups, doc, win, stored, context, timers, cloud,
    state: () => JSON.parse(vm.runInContext('JSON.stringify(state)', context)),
    run: code => vm.runInContext(code, context),
    settle: () => new Promise(resolve => setImmediate(resolve)),
    fire: async delay => {
      const timer = [...timers].find(([, value]) => value.delay === delay);
      assert.ok(timer, `Missing timer with delay ${delay}`);
      timers.delete(timer[0]);
      await timer[1].fn();
      await new Promise(resolve => setImmediate(resolve));
    }
  };
}

test('Ostrom saves six scales, entries, category cycling and deletion to the target sheet', async () => {
  const page = recordsHarness('terra-ostroma.html'); await page.settle();
  const grid = page.elements.get('segmentsGrid');
  assert.equal(grid.children.length, 6);
  for (const card of grid.children) {
    assert.equal((card.innerHTML.match(/class="defense-die/g) || []).length, 5);
    assert.match(card.innerHTML, /<input type="text"/);
  }
  for (const segment of page.state().segments) {
    for (const level of [2, 3, 4, 5, 6]) {
      await page.run(`updateDefense('${segment.id}', ${level})`);
      assert.equal(page.state().segments.find(s => s.id === segment.id).defense, level);
    }
  }
  await page.run("addEntry('paktum', '  <script>próba</script>  ')");
  const entry = page.state().segments[0].entries[0];
  assert.equal(grid.children[0].querySelector('.entry-label').textContent, '<script>próba</script>');
  assert.equal(grid.children[0].querySelector('.entry-label').innerHTML, '');
  assert.equal(entry.status, 'normal');
  for (const status of ['inkognito', 'jogosultsag', 'normal']) {
    await page.run(`cycleEntryStatus('paktum', '${entry.id}')`);
    assert.equal(page.state().segments[0].entries[0].status, status);
  }
  const card = { dataset: { segmentId: 'paktum' } };
  const chip = { dataset: { entryId: entry.id }, closest: () => card };
  const target = { closest: selector => selector === '.entry-chip' ? chip : null };
  grid.emit('pointerdown', { target });
  const hold = [...page.timers.values()].find(timer => timer.delay === 620);
  assert.ok(hold); hold.fn();
  await page.settle();
  assert.equal(page.state().segments[0].entries[0].status, 'inkognito');
  grid.emit('pointerup');
  const remove = { closest: () => chip };
  const deleteTarget = { closest: selector => ({ '.segment-card': card, '.entry-chip': chip, '.entry-remove': remove })[selector] || null };
  grid.emit('pointerdown', { target: deleteTarget });
  assert.ok(![...page.timers.values()].some(timer => timer.delay === 620));
  grid.emit('click', { target: deleteTarget, stopPropagation() {} });
  await page.settle();
  assert.equal(page.state().segments[0].entries.length, 0);
  assert.equal(JSON.parse(page.stored.get('terra-ostroma-state-v1')).segments[0].entries.length, 0);
});

test('all seven portraits and their saved group assignment survive the redesign', async () => {
  const page = recordsHarness('terra-ostroma.html'); await page.settle();
  let payload = '';
  const dataTransfer = { setData: (_, value) => { payload = value; }, getData: () => payload };
  page.doc.emit('dragstart', { target: { closest: () => ({ dataset: { characterId: 'character-01' } }) }, dataTransfer });
  page.groups[1].emit('drop', { preventDefault() {}, dataTransfer });
  await page.settle();
  assert.equal(page.state().characters[0].group, 'smuggler');
  const reloaded = recordsHarness('terra-ostroma.html', page.state(), { cloud: page.cloud }); await reloaded.settle();
  assert.equal(reloaded.state().characters[0].group, 'smuggler');
  assert.equal(reloaded.state().characters.length, 7);
  for (const character of reloaded.state().characters) assert.ok(fs.existsSync(path.join(__dirname, character.image)));
});

test('empty remote sheet does not resurrect cached deletions, and legacy data has a separate backup', async () => {
  const first = recordsHarness('terra-ostroma.html'); await first.settle();
  await first.run("addEntry('paktum', 'Régi helyi bejegyzés')");
  const legacy = first.state();
  const page = recordsHarness('terra-ostroma.html', legacy); await page.settle();
  assert.equal(page.state().segments[0].entries.length, 0);
  assert.equal(page.elements.get('localBackupNotice').hidden, false);
  assert.equal(JSON.parse(page.stored.get('terra-ostroma-local-backup-v1')).state.segments[0].entries[0].label, 'Régi helyi bejegyzés');
  await page.run('importLocalState()');
  assert.equal(page.state().segments[0].entries.length, 1);
  assert.equal(page.elements.get('localBackupNotice').hidden, true);
  const id = page.state().segments[0].entries[0].id;
  await page.run(`removeEntry('paktum', '${id}')`);
  await page.settle();
  const reloaded = recordsHarness('terra-ostroma.html', legacy, { stored: page.stored, cloud: page.cloud }); await reloaded.settle();
  assert.equal(reloaded.state().segments[0].entries.length, 0);
  assert.equal(reloaded.elements.get('localBackupNotice').hidden, true);
});

test('legacy import adds missing records without overwriting existing remote values', async () => {
  const remote = recordsHarness('terra-ostroma.html'); await remote.settle();
  await remote.run("updateDefense('paktum', 6)");
  await remote.run("addEntry('paktum', 'Táblázatban lévő bejegyzés')");
  await remote.run("moveCharacter('character-01', 'smuggler')");
  await remote.settle();
  const legacy = remote.state();
  legacy.segments[0].defense = 3;
  legacy.segments[0].entries[0].label = 'Elavult helyi változat';
  legacy.segments[0].entries.push({ id: 'legacy-extra', label: 'Helyi új nyom', status: 'inkognito' });
  legacy.characters[0].group = 'rogue-trader';
  const page = recordsHarness('terra-ostroma.html', legacy, { cloud: remote.cloud }); await page.settle();
  await page.run('importLocalState()');
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(page.state().characters[0].group, 'smuggler');
  assert.equal(page.state().segments[0].entries[0].label, 'Táblázatban lévő bejegyzés');
  assert.equal(page.state().segments[0].entries[1].status, 'inkognito');
  await page.run('importLocalState()');
  assert.equal(page.state().segments[0].entries.length, 2);
});

test('wrong-target and HTML responses never report a successful connection', async () => {
  for (const data of [null, { success: true, service: 'terra-ostroma-v1', spreadsheetId: 'wrong', sheetId: 1140814065, rows: [] }]) {
    const page = recordsHarness('terra-ostroma.html', null, { fetch: async () => ({ ok: true, text: async () => data ? JSON.stringify(data) : '<html>Sign in</html>' }) });
    await page.settle();
    assert.equal(page.run('sheetReady'), false);
    assert.equal(await page.run("addEntry('paktum', 'Nem menthető')"), false);
    assert.equal(page.state().segments[0].entries.length, 0);
    assert.match(page.elements.get('sheetStatus').textContent, /nem elérhető/);
  }
});

test('unconfirmed writes retain an optimistic durable queue and retry without blocking edits', async () => {
  const cloud = makeSheetService();
  let fail = true;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: async (url, options) => {
    if (fail && options.method === 'POST') return { ok: true, text: async () => '<html>Unavailable</html>' };
    return cloud.fetch(url, options);
  } });
  await page.settle();
  page.run("entryDrafts.set('paktum', 'Megőrzendő vázlat')");
  assert.equal(await page.run("addEntry('paktum', 'Megőrzendő vázlat')"), true);
  await page.settle();
  assert.equal(page.state().segments[0].entries.length, 1);
  assert.equal(page.run("entryDrafts.has('paktum')"), false);
  assert.equal(page.run('sheetReady'), true);
  assert.equal(JSON.parse(page.stored.get('terra-ostroma-pending-v1')).length, 1);
  assert.match(page.elements.get('sheetStatus').textContent, /mentés vár/);
  assert.equal(await page.run("updateDefense('paktum', 6)"), true);
  assert.equal(page.state().segments[0].defense, 6);
  fail = false;
  await page.fire(3000);
  assert.equal(page.cloud.get().rows.filter(row => row.record_type === 'entry').length, 1);
  assert.equal(page.cloud.get().rows.find(row => row.record_type === 'segment').defense, 6);
  assert.equal(JSON.parse(page.stored.get('terra-ostroma-pending-v1')).length, 0);
  assert.match(page.elements.get('sheetStatus').textContent, /szinkronban/);
});

test('slow writes never block edits and coalesce unsent values without rewriting the in-flight request', async () => {
  const cloud = makeSheetService();
  let release;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: (url, options) => new Promise(resolve => { release = () => resolve(cloud.fetch(url, options)); }) });
  assert.equal(await page.run("addEntry('paktum', 'Too early')"), false);
  release(); await page.settle();
  assert.equal(await page.run("updateDefense('paktum', 4)"), true);
  assert.equal(page.state().segments[0].defense, 4);
  assert.equal(await page.run("updateDefense('paktum', 5)"), true);
  assert.equal(await page.run("updateDefense('paktum', 6)"), true);
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(page.run('pendingChanges.length'), 2);
  assert.equal(page.elements.get('segmentsGrid').children[0].querySelector('input').disabled, false);
  release(); await page.settle();
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(page.cloud.get().rows[0].defense, 4);
  release(); await page.settle();
  assert.equal(page.cloud.get().rows[0].defense, 6);
  assert.equal(page.run('pendingChanges.length'), 0);
});

test('polling reads another player changes without replacing inputs, notes or scroll containers', async () => {
  const page = recordsHarness('terra-ostroma.html'); await page.settle();
  await page.run("addEntry('paktum', 'Első nyom')"); await page.settle();
  const id = page.state().segments[0].entries[0].id;
  const grid = page.elements.get('segmentsGrid');
  const card = grid.children[0];
  const input = card.querySelector('input');
  const list = card.querySelector('.entry-list');
  const chip = list.querySelector('.entry-chip');
  input.value = 'Félkész feljegyzés'; input.focus(); input.selectionStart = 4; input.selectionEnd = 7;
  grid.emit('input', { target: input }); list.scrollTop = 45;
  const remote = recordsHarness('terra-ostroma.html', null, { cloud: page.cloud }); await remote.settle();
  await remote.run("updateDefense('paktum', 6)");
  await remote.run(`cycleEntryStatus('paktum', '${id}')`);
  await remote.run("addEntry('paktum', 'Másik játékos nyoma')");
  await remote.run("moveCharacter('character-01', 'smuggler')"); await remote.settle();
  await page.fire(10000);
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(page.state().segments[0].entries[0].status, 'inkognito');
  assert.equal(page.state().segments[0].entries.length, 2);
  assert.equal(page.state().characters[0].group, 'smuggler');
  assert.equal(grid.children[0], card);
  assert.equal(card.querySelector('input'), input);
  assert.equal(page.doc.activeElement, input);
  assert.equal(input.value, 'Félkész feljegyzés');
  assert.equal(input.selectionStart, 4); assert.equal(input.selectionEnd, 7);
  assert.equal(card.querySelector('.entry-list'), list); assert.equal(list.scrollTop, 45);
  assert.equal(list.querySelector('.entry-chip'), chip);
  assert.equal(chip.dataset.entryStatus, 'inkognito');
  await page.fire(10000);
  assert.equal(list.querySelector('.entry-chip'), chip);
  await remote.run(`removeEntry('paktum', '${id}')`); await remote.settle();
  await page.fire(10000);
  assert.equal(page.state().segments[0].entries.length, 1);
  assert.equal(chip.parentElement, null);
});

test('hidden tabs suspend polling; returning to the tab or reconnecting refreshes immediately', async () => {
  const page = recordsHarness('terra-ostroma.html'); await page.settle();
  const remote = recordsHarness('terra-ostroma.html', null, { cloud: page.cloud }); await remote.settle();
  page.doc.visibilityState = 'hidden'; page.doc.emit('visibilitychange');
  assert.ok(![...page.timers.values()].some(timer => timer.delay === 10000));
  await remote.run("updateDefense('paktum', 5)"); await remote.settle();
  assert.equal(page.state().segments[0].defense, 2);
  page.doc.visibilityState = 'visible'; page.doc.emit('visibilitychange'); await page.settle();
  assert.equal(page.state().segments[0].defense, 5);
  await remote.run("updateDefense('paktum', 6)"); await remote.settle();
  page.win.emit('online'); await page.settle();
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal([...page.timers.values()].filter(timer => timer.delay === 10000).length, 1);
});

test('edits during a slow background read overlay its old snapshot before serialized writes start', async () => {
  const cloud = makeSheetService();
  let delayReads = false; let release;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: (url, options) => {
    const snapshot = cloud.fetch(url, options);
    return delayReads && options.method === 'GET' ? new Promise(resolve => { release = () => resolve(snapshot); }) : snapshot;
  } });
  await page.settle(); delayReads = true;
  const refreshing = page.run('refreshFromSheet()');
  await page.run("updateDefense('paktum', 6)");
  await page.run("addEntry('paktum', 'Olvasás közben')");
  await page.run("moveCharacter('character-01', 'smuggler')");
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(cloud.calls.filter(call => call.method === 'POST').length, 0);
  delayReads = false; release(); await refreshing; await page.settle();
  assert.equal(page.state().segments[0].defense, 6);
  assert.equal(page.state().segments[0].entries[0].label, 'Olvasás közben');
  assert.equal(page.state().characters[0].group, 'smuggler');
  assert.equal(page.run('pendingChanges.length'), 0);
  assert.equal(cloud.get().rows.find(row => row.record_type === 'segment').defense, 6);
});

test('repeated long presses cycle immediately during slow saves and the delete button stays independent', async () => {
  const cloud = makeSheetService();
  let slow = false; let release;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: (url, options) =>
    slow && options.method === 'POST' ? new Promise(resolve => { release = () => resolve(cloud.fetch(url, options)); }) : cloud.fetch(url, options)
  });
  await page.settle(); await page.run("addEntry('paktum', 'Gyors típusváltás')"); await page.settle();
  const grid = page.elements.get('segmentsGrid');
  const chip = grid.children[0].querySelector('.entry-chip');
  const button = chip.querySelector('.entry-remove');
  slow = true;
  for (const status of ['inkognito', 'jogosultsag', 'normal']) {
    grid.emit('pointerdown', { target: chip }); await page.fire(620); grid.emit('pointerup');
    assert.equal(page.state().segments[0].entries[0].status, status);
    assert.equal(chip.dataset.entryStatus, status);
    assert.equal(button.disabled, false);
    assert.equal(grid.children[0].querySelector('.entry-chip'), chip);
  }
  assert.equal(page.run('pendingChanges.length'), 2);
  grid.emit('pointerdown', { target: button });
  assert.ok(![...page.timers.values()].some(timer => timer.delay === 620));
  grid.emit('click', { target: button, stopPropagation() {} });
  assert.equal(page.state().segments[0].entries.length, 0);
  assert.equal(page.run('pendingChanges.length'), 3);
  for (let i = 0; i < 3; i++) { release(); await page.settle(); }
  assert.equal(cloud.get().rows.filter(row => row.record_type === 'entry').length, 0);
  assert.equal(page.run('pendingChanges.length'), 0);
});

test('lost confirmations survive reload and replay without duplicating entries', async () => {
  const cloud = makeSheetService();
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: async (url, options) => {
    const response = await cloud.fetch(url, options);
    return options.method === 'POST' ? { ok: true, text: async () => '<html>Lost response</html>' } : response;
  } });
  await page.settle(); await page.run("addEntry('paktum', 'Megőrzött nyom')"); await page.settle();
  const id = page.state().segments[0].entries[0].id;
  await page.run(`cycleEntryStatus('paktum', '${id}')`);
  assert.equal(page.run('pendingChanges.length'), 2);
  const reloaded = recordsHarness('terra-ostroma.html', null, { cloud, stored: page.stored }); await reloaded.settle();
  assert.equal(reloaded.state().segments[0].entries.length, 1);
  assert.equal(reloaded.state().segments[0].entries[0].status, 'inkognito');
  assert.equal(cloud.get().rows.filter(row => row.record_type === 'entry').length, 1);
  assert.equal(cloud.get().rows.find(row => row.record_type === 'entry').entry_status, 'inkognito');
  assert.equal(reloaded.run('pendingChanges.length'), 0);
});

test('repeated failures back off, preserve pending work and permit immediate manual retry', async () => {
  const cloud = makeSheetService(); let fail = true;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: (url, options) => {
    if (fail && options.method === 'POST') throw new Error('Network unavailable');
    return cloud.fetch(url, options);
  } });
  await page.settle(); await page.run("updateDefense('paktum', 6)"); await page.settle();
  for (const delay of [3000, 6000, 12000, 24000, 30000]) {
    await page.fire(delay);
    assert.equal(page.run('pendingChanges.length'), 1);
    assert.equal(page.state().segments[0].defense, 6);
  }
  fail = false;
  await page.run('refreshFromSheet()'); await page.settle();
  assert.equal(page.run('pendingChanges.length'), 0);
  assert.equal(cloud.get().rows[0].defense, 6);
  assert.equal(page.run('retryTimer'), null);
});

test('a remotely deleted note cannot block the queue or be resurrected by a queued type change', async () => {
  const cloud = makeSheetService(); let fail = false;
  const page = recordsHarness('terra-ostroma.html', null, { cloud, fetch: (url, options) => {
    if (fail && options.method === 'POST') throw new Error('Offline');
    return cloud.fetch(url, options);
  } });
  await page.settle(); await page.run("addEntry('paktum', 'Eltávolított nyom')"); await page.settle();
  const id = page.state().segments[0].entries[0].id;
  const remote = recordsHarness('terra-ostroma.html', null, { cloud }); await remote.settle();
  fail = true;
  await page.run(`cycleEntryStatus('paktum', '${id}')`); await page.settle();
  await page.run("updateDefense('paktum', 5)");
  await remote.run(`removeEntry('paktum', '${id}')`); await remote.settle();
  fail = false; await page.fire(3000);
  assert.equal(page.state().segments[0].entries.length, 0);
  assert.equal(page.run('pendingChanges.length'), 0);
  assert.equal(cloud.get().rows.find(row => row.record_type === 'segment').defense, 5);
  assert.match(page.elements.get('toast').textContent, /időközben töröltek/);
});

test('the Apps Script refuses a different target and a foreign header without touching Starfort', () => {
  const cloud = makeSheetService();
  assert.equal(cloud.post({ action: 'add-entry', spreadsheetId: 'wrong', sheetId: 1140814065 }).success, false);
  assert.equal(cloud.writes.length, 0);
  const foreign = makeSheetService([['location_id', 'Starfort data']]);
  const before = JSON.stringify(foreign.cells);
  assert.equal(foreign.post({ action: 'update-segment', spreadsheetId: '1HS2z9dVFxzIzQCb3Ix2e7fDNlU_unGRhQncjLFmzrN0', sheetId: 1904387278, segment: { id: 'paktum', defense: 2 } }).success, false);
  assert.equal(JSON.stringify(foreign.cells), before);
});

test('character gallery opens, navigates, wraps and restores focus', () => {
  const page = recordsHarness('terra-ostroma-karakterek.html');
  assert.equal((page.elements.get('characterGrid').innerHTML.match(/class="character-card"/g) || []).length, 7);
  const card = { dataset: { characterId: 'character-01' }, focus() { this.focused = true; } };
  page.elements.get('characterGrid').emit('click', { target: { closest: () => card } });
  const dialog = page.elements.get('modal');
  assert.equal(dialog.open, true);
  assert.equal(page.elements.get('portraitCount').textContent, '1 / 7');
  page.elements.get('previousPortrait').emit('click');
  assert.equal(page.elements.get('portraitCount').textContent, '7 / 7');
  page.doc.emit('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(page.elements.get('portraitCount').textContent, '1 / 7');
  dialog.emit('click', { target: dialog });
  assert.equal(dialog.open, false);
  assert.equal(card.focused, true);
});

test('all Terra pages share navigation, resolve references and compile inline scripts', () => {
  const pages = ['terra-ostroma.html', 'terra-ostroma-karakterek.html', 'terra-ostroma-npc.html', 'terra-ostroma-astronomicon.html', 'terra-ostroma-eternity-gate.html'];
  for (const name of pages) {
    const html = read(name);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, name);
    assert.match(html, /class="masthead"/);
    for (const target of pages) assert.ok(html.includes(`href="${target}"`));
    for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (/^https:|\$\{/.test(match[1])) continue;
      assert.ok(fs.existsSync(path.join(__dirname, match[1])), `${name}: ${match[1]}`);
    }
    for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  }
  for (const name of ['terra-ostroma-shell.css', 'terra-ostroma-records.css', 'terra-ostroma-astronomicon.css', 'terra-ostroma-eternity-gate.css']) {
    const css = read(name);
    assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, name);
    assert.doesNotMatch(css, /letter-spacing:\s*-|font-size:\s*[\d.]+vw/);
  }
  assert.match(read('terra-ostroma-records.css'), /grid-template-columns: 1fr; grid-template-rows: none/);
  assert.match(read('terra-ostroma-records.css'), /prefers-reduced-motion/);
  assert.doesNotMatch(astroSource, /localStorage|script\.google|fetch\(/);
});

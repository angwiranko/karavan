const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scenes, resolveScene, clampTransform, fitImage, assetRoot } = require('./terra-ostroma-eternity-gate.js');
const source = fs.readFileSync(path.join(__dirname, 'terra-ostroma-eternity-gate.js'), 'utf8') +
  '\n' + fs.readFileSync(path.join(__dirname, 'terra-ostroma-atlas.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'terra-ostroma-eternity-gate.html'), 'utf8');

test('six distinct scenes, complete anchors and valid district connections', () => {
  assert.deepEqual(Object.keys(scenes), ['overview', 'outer', 'city', 'undercity', 'gate', 'throne']);
  for (const [id, scene] of Object.entries(scenes)) {
    const ids = new Set();
    assert.ok(scene.flows.length >= 2, id);
    for (const room of scene.rooms) {
      assert.ok(!ids.has(room.id)); ids.add(room.id);
      assert.ok(room.at[0] > 0 && room.at[0] < 1000, `${id}/${room.id} x`);
      assert.ok(room.at[1] > 0 && room.at[1] < 562.5, `${id}/${room.id} y`);
      assert.match(room.contour, /^M.+ Z$/);
      if (id !== 'overview') assert.ok(room.text.length > 30);
      if (room.target) assert.ok(Object.hasOwn(scenes, room.target));
    }
    for (const link of scene.links) assert.ok(Object.hasOwn(scenes, link));
  }
  assert.ok(scenes.gate.links.includes('throne'));
  assert.ok(!scenes.undercity.links.includes('throne'));
  assert.ok(scenes.city.rooms.some(room => room.name === 'Levéltár'));
  assert.ok(scenes.outer.rooms.some(room => room.name === 'Audienciaterem'));
});

test('every scene has a valid, separate PNG file with the source aspect ratio', () => {
  const signatures = new Set();
  for (const id of Object.keys(scenes)) {
    const buffer = fs.readFileSync(path.join(__dirname, assetRoot, `${id}.png`));
    assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(buffer.readUInt32BE(16), 1672);
    assert.equal(buffer.readUInt32BE(20), 941);
    signatures.add(require('node:crypto').createHash('sha256').update(buffer).digest('hex'));
  }
  assert.equal(signatures.size, 6);
});

test('legacy hashes resolve; unknown and prototype-property hashes are safe', () => {
  for (const [old, next] of Object.entries({ defense: 'outer', battlement: 'outer', processional: 'city', sanctum: 'city', dungeon: 'undercity' })) {
    assert.equal(resolveScene(`#${old}`), next);
  }
  for (const input of ['', null, '#missing', '__proto__', 'constructor', 'toString']) assert.equal(resolveScene(input), 'overview');
  assert.equal(resolveScene('#throne'), 'throne');
});

test('fit and pan bounds keep art in frame across desktop/mobile dimensions', () => {
  for (const [width, height] of [[1440, 900], [1050, 550], [390, 400], [320, 230]]) {
    const fit = fitImage(width, height, 1672 / 941);
    assert.ok(fit.width <= width && fit.height <= height);
    assert.ok(Math.abs(fit.width / fit.height - 1672 / 941) < 1e-10);
    for (const scale of [-2, 1, 1.4, 3, 10, NaN]) {
      const next = clampTransform(scale, 99999, -99999, fit.width, fit.height, width, height);
      assert.ok(next.scale >= 1 && next.scale <= 3);
      assert.ok(Math.abs(next.x) <= Math.max(0, (fit.width * next.scale - width) / 2));
      assert.ok(Math.abs(next.y) <= Math.max(0, (fit.height * next.scale - height) / 2));
    }
  }
});

const { atlasHarness } = require('./terra-ostroma-atlas.test-helpers.cjs');
const harness = options => atlasHarness(source, html, options);

test('all district handlers render, rooms select/deselect, and zoom resets', async () => {
  const page = harness(); await page.settle();
  for (const id of Object.keys(scenes)) {
    page.clickScene(id); await page.settle();
    assert.equal(page.elements.get('panelTitle').textContent, scenes[id].title);
    assert.equal(page.elements.get('listCount').textContent, String(scenes[id].rooms.length).padStart(2, '0'));
    assert.equal(page.elements.get('imageStatus').hidden, true);
    for (const room of scenes[id].rooms.filter(room => !room.target)) {
      page.clickRoom(room.id);
      assert.equal(page.elements.get('detailTitle').textContent, room.name);
      assert.equal(page.elements.get('detailText').textContent, room.text);
      page.clickRoom(room.id);
      assert.equal(page.elements.get('detailTitle').textContent, scenes[id].note[0]);
    }
  }
  page.button('zoomIn'); assert.equal(page.elements.get('zoomValue').value, '140%');
  for (let n = 0; n < 10; n++) page.button('zoomIn');
  assert.equal(page.elements.get('zoomValue').value, '300%');
  page.button('reset'); assert.equal(page.elements.get('zoomValue').value, '100%');
  page.button('back'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.overview.title);
  page.clickRoom('gate'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.gate.title);
});

test('obsolete image loads cannot overwrite the latest selection or leave busy state', async () => {
  const page = harness({ autoLoad: false });
  page.release('overview'); await page.settle();
  page.clickScene('outer');
  page.clickScene('overview');
  assert.equal(page.elements.get('imageStatus').hidden, true);
  assert.equal(page.elements.get('viewport').attributes.has('aria-busy'), false);
  page.release('outer'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.overview.title);
  page.clickScene('gate'); page.clickScene('throne');
  page.release('gate'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.overview.title);
  page.release('throne'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.throne.title);
  assert.equal(page.location.hash, '#throne');
});

test('a failed image can be retried; legacy hash links and reduced motion work', async () => {
  const page = harness({ hash: '#dungeon', autoLoad: false, reduced: true });
  page.release('undercity', true); await page.settle();
  assert.equal(page.elements.get('imageError').hidden, false);
  page.button('retry'); page.release('undercity'); await page.settle();
  assert.equal(page.elements.get('imageError').hidden, true);
  assert.equal(page.elements.get('panelTitle').textContent, scenes.undercity.title);
  assert.equal(page.elements.get('motion').disabled, true);
  assert.equal(page.elements.get('motion').attributes.get('aria-pressed'), 'true');
  page.hash('sanctum'); page.release('city'); await page.settle();
  assert.equal(page.elements.get('panelTitle').textContent, scenes.city.title);
});

test('page references stay local, assets exist, and styles support mobile/reduced motion', () => {
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (match[1].startsWith('https:')) continue;
    assert.ok(fs.existsSync(path.join(__dirname, match[1])), match[1]);
  }
  const css = fs.readFileSync(path.join(__dirname, 'terra-ostroma-eternity-gate.css'), 'utf8');
  assert.match(css, /@media \(max-width: 800px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
  assert.match(html, /preserveAspectRatio="none"/);
  assert.doesNotMatch(source, /localStorage|script\.google|fetch\(/);
});

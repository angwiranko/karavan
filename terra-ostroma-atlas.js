/* Lucide icons; notices: images/terra-ostroma/eternity-gate/LICENSE-icons.txt */
(() => {
  'use strict';
  const icons = {
    'zoom-in': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>',
    'zoom-out': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>',
    pause: '<rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>',
    play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"/>'
  };

  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function resolveScene(id, scenes, aliases = {}) {
    const key = String(id || '').replace(/^#/, '');
    return own(scenes, key) ? key : own(aliases, key) ? aliases[key] : 'overview';
  }
  function clampTransform(scale, x, y, width, height, viewportWidth, viewportHeight) {
    const zoom = Math.min(3, Math.max(1, Number.isFinite(scale) ? scale : 1));
    const maxX = Math.max(0, (width * zoom - viewportWidth) / 2);
    const maxY = Math.max(0, (height * zoom - viewportHeight) / 2);
    return { scale: zoom, x: Math.max(-maxX, Math.min(maxX, x || 0)), y: Math.max(-maxY, Math.min(maxY, y || 0)) };
  }
  function fitImage(width, height, ratio) {
    const fittedWidth = Math.min(width, height * ratio);
    return { width: fittedWidth, height: fittedWidth / ratio };
  }

  function mountAtlas(config) {
    const { scenes, assetRoot, aliases = {} } = config;
  const $ = id => document.getElementById(id);
  const svgIcon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ''}</svg>`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  document.querySelectorAll('[data-icon]').forEach(button => { button.innerHTML = svgIcon(button.dataset.icon); });

  const atlas = $('atlas');
  const viewport = $('viewport');
  const artboard = $('artboard');
  const sceneElement = $('scene');
  const image = $('sceneImage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 'overview';
  let currentRoom = null;
  let view = { scale: 1, x: 0, y: 0 };
  let sceneRatio = 16 / 9;
  let paused = reducedMotion.matches;
  let requestNumber = 0;
  let failedScene = 'overview';
  let initialized = false;
  let sceneAnimation = null;
  let zoomAnimation = null;
  const departures = new Set();
  let lastDragTime = 0;
  let dragging = false;
  let dragOrigin = null;
  const pointers = new Map();
  const imageCache = new Map();

  function updateView(animate = false) {
    const oldTransform = artboard.style.transform || 'translate(0px, 0px) scale(1)';
    view = clampTransform(view.scale, view.x, view.y, artboard.offsetWidth, artboard.offsetHeight, viewport.clientWidth, viewport.clientHeight);
    const transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    if (zoomAnimation) zoomAnimation.cancel();
    artboard.style.transform = transform;
    artboard.style.setProperty('--inverse-zoom', String(1 / view.scale));
    if (animate && !paused && !reducedMotion.matches && artboard.animate) {
      zoomAnimation = artboard.animate([{ transform: oldTransform }, { transform }], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
    viewport.classList.toggle('is-zoomed', view.scale > 1.01);
    $('zoomValue').value = `${Math.round(view.scale * 100)}%`;
    $('zoomOut').disabled = view.scale <= 1;
    $('zoomIn').disabled = view.scale >= 3;
  }

  function fit() {
    const size = fitImage(viewport.clientWidth, viewport.clientHeight, sceneRatio);
    artboard.style.width = `${size.width}px`;
    artboard.style.height = `${size.height}px`;
    updateView();
  }
  new ResizeObserver(fit).observe(viewport);

  function setZoom(scale, point) {
    const next = Math.min(3, Math.max(1, scale));
    if (point) {
      const ratio = next / view.scale;
      view.x = point.x - (point.x - view.x) * ratio;
      view.y = point.y - (point.y - view.y) * ratio;
    }
    view.scale = next;
    updateView(true);
  }

  function loadImage(id) {
    if (imageCache.has(id)) return imageCache.get(id);
    const promise = new Promise((resolve, reject) => {
      const next = new Image();
      next.onload = async () => {
        try { await next.decode(); } catch (_) { /* Loaded images still work where decode is unavailable. */ }
        if (next.naturalWidth) resolve(next); else reject(new Error('Empty image'));
      };
      next.onerror = () => reject(new Error('Image unavailable'));
      next.src = `${assetRoot}${id}.png`;
    }).catch(error => { imageCache.delete(id); throw error; });
    imageCache.set(id, promise);
    return promise;
  }

  function renderEffects(section) {
    const outlines = section.rooms.filter(room => room.contour).map(room => `<path class="contour" data-room-outline="${room.id}" d="${room.contour}"/>`).join('');
    const flows = section.flows.map(flow => `<path class="trace" d="${flow.d}"/><path class="energy ${flow.color || ''}" style="animation-duration:${flow.duration || 12}s;animation-direction:${flow.reverse ? 'reverse' : 'normal'}" d="${flow.d}"/>`).join('');
    const leaders = active === 'overview' ? section.rooms.map(room => {
      const [x, y] = room.at;
      const [lx, ly] = room.label;
      const cornerX = lx < x ? lx + 66 : lx;
      return `<path class="leader" d="M${lx} ${ly} H${cornerX} L${x} ${y}"/><circle class="locator" cx="${x}" cy="${y}" r="2.5"/>`;
    }).join('') : '';
    $('effects').innerHTML = `${section.overlay || ''}${flows}${outlines}${leaders}`;
  }

  function renderHotspots(section) {
    $('hotspots').innerHTML = section.rooms.map((room, index) => {
      const [x, y] = room.at;
      const pin = `<button type="button" class="hotspot ${x > 620 ? 'label-left' : ''}" style="left:${x / 10}%;top:${y / 5.625}%" data-room="${room.id}" aria-label="${escapeHtml(room.name)}" ${room.target ? '' : 'aria-pressed="false"'}><span class="pin">${String(index + 1).padStart(2, '0')}</span><span class="pin-label">${escapeHtml(room.name)}</span></button>`;
      const label = room.label && active === 'overview' ? `<button type="button" class="overview-label" style="left:${room.label[0] / 10}%;top:${room.label[1] / 5.625}%" data-room="${room.id}"><small>${String(index + 1).padStart(2, '0')} / ${escapeHtml(room.kind)}</small>${escapeHtml(room.name)}</button>` : '';
      return pin + label;
    }).join('');
  }

  function showDetails(room) {
    const section = scenes[active];
    $('detailCategory').textContent = room ? room.kind : (config.noteLabel || 'Irattári feljegyzés');
    $('detailTitle').textContent = room ? room.name : section.note[0];
    $('detailText').textContent = room ? room.text : section.note[1];
  }

  function highlight(id) {
    const selected = id || currentRoom;
    document.querySelectorAll('[data-room-outline]').forEach(outline => outline.classList.toggle('is-lit', outline.dataset.roomOutline === selected));
    document.querySelectorAll('.hotspot').forEach(pin => pin.classList.toggle('is-active', pin.dataset.room === selected));
  }

  function selectRoom(id) {
    const room = scenes[active].rooms.find(item => item.id === id);
    if (!room) return;
    if (room.target) { selectScene(room.target); return; }
    currentRoom = currentRoom === id ? null : id;
    document.querySelectorAll('[data-room][aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.room === currentRoom)));
    highlight(currentRoom);
    showDetails(currentRoom ? room : null);
    if (view.scale > 1.01 && currentRoom) {
      view.x = -(room.at[0] / 1000 - .5) * artboard.offsetWidth * view.scale;
      view.y = -(room.at[1] / 562.5 - .5) * artboard.offsetHeight * view.scale;
      updateView(true);
    }
  }

  function renderPanel() {
    const section = scenes[active];
    $('panelTitle').textContent = section.title;
    $('drawingTitle').textContent = section.title;
    $('panelLead').textContent = section.lead;
    $('eyebrow').textContent = active === 'overview' ? 'Cartographia / Totálkép' : `${config.sectionLabel || 'Körzet'} ${section.code} / Terra`;
    $('plateCode').textContent = `${config.chartCode || 'TERRA'} / ${section.code}`;
    $('signature').textContent = section.latin;
    $('level').textContent = section.level;
    $('listHeading').textContent = active === 'overview' ? (config.overviewLabel || 'Körzetek') : 'Helyszínjegyzék';
    $('listCount').textContent = String(section.rooms.length).padStart(2, '0');
    $('roomList').innerHTML = section.rooms.map((room, index) => `<button type="button" class="room-button" data-room="${room.id}" ${room.target ? '' : 'aria-pressed="false"'}><span class="room-number">${String(index + 1).padStart(2, '0')}</span><span class="room-name">${escapeHtml(room.name)}</span>${svgIcon('arrow-right')}</button>`).join('');
    $('connections').innerHTML = section.links.map(id => `<a class="connection" href="#${id}" data-scene="${id}">${svgIcon(id === 'overview' ? 'arrow-left' : 'arrow-right')}${id === 'overview' ? 'Totálkép' : escapeHtml(scenes[id].title)}</a>`).join('');
    document.querySelectorAll('.districts a').forEach(link => {
      if (link.dataset.scene === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    $('back').disabled = active === 'overview';
    if ($('sceneStats')) $('sceneStats').innerHTML = (section.stats || []).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    showDetails(null);
  }

  async function selectScene(requested, updateHash = true) {
    const id = resolveScene(requested, scenes, aliases);
    const token = ++requestNumber;
    failedScene = id;
    $('imageError').hidden = true;
    if (initialized && active === id) {
      $('imageStatus').hidden = true;
      viewport.removeAttribute('aria-busy');
      if (updateHash && location.hash !== `#${id}`) {
        try { history.pushState(null, '', `#${id}`); } catch (_) { location.hash = id; }
      }
      resetView();
      return;
    }
    $('imageStatus').textContent = 'Metszet betöltése…';
    $('imageStatus').hidden = false;
    viewport.setAttribute('aria-busy', 'true');
    let loaded;
    try { loaded = await loadImage(id); }
    catch (_) {
      if (token !== requestNumber) return;
      $('imageStatus').hidden = true;
      $('imageError').hidden = false;
      viewport.removeAttribute('aria-busy');
      return;
    }
    if (token !== requestNumber) return;
    const previous = active;
    const oldImage = initialized ? image.cloneNode() : null;
    if (sceneAnimation) sceneAnimation.cancel();
    for (const departure of departures) departure.cancel();
    departures.clear();
    artboard.querySelectorAll('.transition-image').forEach(node => node.remove());
    active = id;
    currentRoom = null;
    view = { scale: 1, x: 0, y: 0 };
    sceneRatio = loaded.naturalWidth / loaded.naturalHeight;
    image.src = loaded.src;
    image.alt = `${scenes[id].title} részletes, izometrikus építészeti metszete`;
    renderPanel();
    renderEffects(scenes[id]);
    renderHotspots(scenes[id]);
    fit();
    $('imageStatus').hidden = true;
    viewport.removeAttribute('aria-busy');
    if (updateHash && location.hash !== `#${id}`) {
      try { history.pushState(null, '', `#${id}`); } catch (_) { location.hash = id; }
    }
    document.title = `${scenes[id].title} | ${config.name}`;
    $('announcer').textContent = `${scenes[id].title}. ${scenes[id].rooms.length} helyszín.`;
    if (oldImage && !paused && !reducedMotion.matches && sceneElement.animate) {
      // A shared anchor ties the overview camera movement to the destination district.
      const anchor = scenes.overview.rooms.find(room => room.target === (id === 'overview' ? previous : id));
      const origin = anchor ? `${anchor.at[0] / 10}% ${anchor.at[1] / 5.625}%` : '50% 50%';
      oldImage.removeAttribute('id');
      oldImage.classList.add('transition-image');
      oldImage.alt = '';
      oldImage.setAttribute('aria-hidden', 'true');
      oldImage.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;transform-origin:${origin};z-index:3`;
      artboard.append(oldImage);
      const leaving = oldImage.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: previous === 'overview' ? 'scale(1.65)' : 'scale(.93)' }], { duration: 600, easing: 'cubic-bezier(.2,.65,.2,1)' });
      departures.add(leaving);
      const removeDeparture = () => { oldImage.remove(); departures.delete(leaving); };
      leaving.finished.then(removeDeparture).catch(removeDeparture);
      sceneAnimation = sceneElement.animate([{ opacity: .2, transform: 'scale(.96)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 650, easing: 'cubic-bezier(.2,.65,.2,1)' });
    }
    initialized = true;
    const preload = () => {
      if (active !== id) return;
      const next = scenes[id].links.find(link => link !== 'overview');
      if (next) loadImage(next).catch(() => {});
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(preload); else setTimeout(preload, 300);
  }

  function resetView() { view = { scale: 1, x: 0, y: 0 }; updateView(true); }
  function updateMotion() {
    atlas.classList.toggle('is-paused', paused || reducedMotion.matches);
    const stopped = paused || reducedMotion.matches;
    $('motion').innerHTML = svgIcon(stopped ? 'play' : 'pause');
    $('motion').setAttribute('aria-pressed', String(stopped));
    $('motion').setAttribute('aria-label', stopped ? 'Animációk indítása' : 'Animációk szüneteltetése');
    $('motion').title = stopped ? 'Animációk indítása' : 'Animációk szüneteltetése';
    $('motion').disabled = reducedMotion.matches;
    if (reducedMotion.matches) $('motion').title = 'Az animációkat a rendszer csökkentett mozgás beállítása tiltja';
    if (stopped) { sceneAnimation?.finish(); zoomAnimation?.finish(); for (const departure of departures) departure.finish(); }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-scene]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); selectScene(link.dataset.scene); return;
    }
    const room = event.target.closest('[data-room]');
    if (room && Date.now() - lastDragTime > 180) selectRoom(room.dataset.room);
  });
  for (const container of [$('hotspots'), $('roomList')]) {
    container.addEventListener('pointerover', event => { const room = event.target.closest('[data-room]'); if (room) highlight(room.dataset.room); });
    container.addEventListener('pointerleave', () => highlight(null));
    container.addEventListener('focusin', event => { const room = event.target.closest('[data-room]'); if (room) highlight(room.dataset.room); });
    container.addEventListener('focusout', () => highlight(null));
  }
  $('zoomIn').addEventListener('click', () => setZoom(view.scale + .4));
  $('zoomOut').addEventListener('click', () => setZoom(view.scale - .4));
  $('reset').addEventListener('click', resetView);
  $('back').addEventListener('click', () => selectScene('overview'));
  $('retry').addEventListener('click', () => { imageCache.delete(failedScene); selectScene(failedScene); });
  $('motion').addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);

  function syncExpanded() {
    const expanded = document.fullscreenElement === atlas || atlas.classList.contains('is-expanded');
    $('expand').innerHTML = svgIcon(expanded ? 'minimize' : 'maximize');
    $('expand').title = expanded ? 'Teljes képernyő bezárása' : 'Teljes képernyő';
    $('expand').setAttribute('aria-label', $('expand').title);
    document.body.classList.toggle('has-expanded', expanded);
    requestAnimationFrame(fit);
  }
  $('expand').addEventListener('click', async () => {
    if (document.fullscreenElement === atlas) await document.exitFullscreen();
    else if (atlas.classList.contains('is-expanded')) atlas.classList.remove('is-expanded');
    else {
      try { if (!atlas.requestFullscreen) throw new Error('Unavailable'); await atlas.requestFullscreen(); }
      catch (_) { atlas.classList.add('is-expanded'); }
    }
    syncExpanded();
  });
  document.addEventListener('fullscreenchange', syncExpanded);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && atlas.classList.contains('is-expanded')) { atlas.classList.remove('is-expanded'); syncExpanded(); }
  });

  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    const arrows = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(view.scale + .4); }
    else if (event.key === '-') { event.preventDefault(); setZoom(view.scale - .4); }
    else if (event.key === '0') { event.preventDefault(); resetView(); }
    else if (event.key === 'Escape') { resetView(); }
    else if (own(arrows, event.key) && view.scale > 1) { event.preventDefault(); view.x += arrows[event.key][0]; view.y += arrows[event.key][1]; updateView(true); }
  });
  viewport.addEventListener('dblclick', event => {
    if (event.target.closest('button')) return;
    const rect = viewport.getBoundingClientRect();
    setZoom(view.scale > 1 ? 1 : 2, { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 });
  });
  viewport.addEventListener('wheel', event => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    setZoom(view.scale - event.deltaY * .006, { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 });
  }, { passive: false });

  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button') || view.scale <= 1) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.setPointerCapture(event.pointerId);
    dragOrigin = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
    dragging = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      dragOrigin.distance = Math.hypot(a.x - b.x, a.y - b.y);
      dragOrigin.scale = view.scale;
    }
  });
  viewport.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !dragOrigin) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && dragOrigin.distance) {
      const [a, b] = [...pointers.values()];
      view.scale = dragOrigin.scale * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, dragOrigin.distance);
      dragging = true;
    } else {
      const dx = event.clientX - dragOrigin.x;
      const dy = event.clientY - dragOrigin.y;
      if (Math.hypot(dx, dy) > 4) dragging = true;
      view.x = dragOrigin.viewX + dx;
      view.y = dragOrigin.viewY + dy;
    }
    viewport.classList.toggle('is-dragging', dragging);
    updateView();
  });
  function endDrag(event) {
    pointers.delete(event.pointerId);
    if (dragging) lastDragTime = Date.now();
    if (!pointers.size) { dragOrigin = null; dragging = false; viewport.classList.remove('is-dragging'); }
    else { const point = [...pointers.values()][0]; dragOrigin = { x: point.x, y: point.y, viewX: view.x, viewY: view.y }; }
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('hashchange', () => selectScene(location.hash, false));
  updateMotion();
  selectScene(location.hash || 'overview', false);

  }
  const api = { resolveScene, clampTransform, fitImage, mountAtlas };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.TerraAtlas = api;
    if (window.TerraAtlasConfig) mountAtlas(window.TerraAtlasConfig);
  }
})();

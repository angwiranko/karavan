(function () {
  "use strict";

  const data = window.MARS_RPG_DATA;
  const webglEl = document.getElementById("webgl");
  const labelLayer = document.getElementById("labelLayer");
  const dossierEl = document.getElementById("dossier");
  const layerControlsEl = document.getElementById("layerControls");
  const layerCounterEl = document.getElementById("layerCounter");
  const locationListEl = document.getElementById("locationList");
  const locationSearchEl = document.getElementById("locationSearch");
  const coordReadoutEl = document.getElementById("coordReadout");
  const activeLayerReadoutEl = document.getElementById("activeLayerReadout");
  const selectedReadoutEl = document.getElementById("selectedReadout");
  const confidenceReadoutEl = document.getElementById("confidenceReadout");
  const classifiedButton = document.getElementById("classifiedButton");
  const lockButton = document.getElementById("lockButton");
  const clearSearchButton = document.getElementById("clearSearch");
  const toast = document.getElementById("toast");

  if (!window.THREE || !data) {
    webglEl.innerHTML = '<div class="webgl-error">Mars cogitator failed to load required scripts.</div>';
    return;
  }

  const DEG = Math.PI / 180;
  const GLOBE_RADIUS = 1.5;
  const OVERLAY_RADIUS = GLOBE_RADIUS * 1.012;
  const activeLayers = new Set(data.layers.map((layer) => layer.id));
  const labelsById = new Map();
  const markerById = new Map();
  const listItemById = new Map();
  const patternGroups = new Map();
  const layerColors = new Map(data.layers.map((layer) => [layer.id, layer.color]));
  const pointer = new THREE.Vector2();
  const projector = new THREE.Projector();
  const clock = new THREE.Clock();

  let scene;
  let camera;
  let renderer;
  let controls;
  let globe;
  let globeGroup;
  let markerGroup;
  let selectedLocation = data.locations[0];
  let classifiedUnlocked = sessionStorage.getItem("mars-classified-unlocked") === "true";
  let width = window.innerWidth;
  let height = window.innerHeight;

  init();
  animate();

  function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080403, 0.035);

    camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 250);
    camera.position.set(3.65, -4.7, 2.6);
    camera.up.set(0, 0, 1);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x040201, 0);
    webglEl.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.75;
    controls.zoomSpeed = 1.05;
    controls.panSpeed = 0.22;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.14;
    controls.minDistance = 2.25;
    controls.maxDistance = 8.5;
    controls.handleResize();

    scene.add(new THREE.AmbientLight(0x5a5143));

    const sun = new THREE.DirectionalLight(0xffe0a8, 1.12);
    sun.position.set(5, -4, 2.2);
    scene.add(sun);

    const redRim = new THREE.PointLight(0x8b2500, 0.35, 12);
    redRim.position.set(-2.5, 3, 2.5);
    scene.add(redRim);

    globeGroup = new THREE.Object3D();
    markerGroup = new THREE.Object3D();
    scene.add(globeGroup);
    createGlobe();
    createStars();
    createPatterns();
    createMarkersAndLabels();
    globeGroup.add(markerGroup);

    buildLayerControls();
    buildLocationList();
    bindEvents();
    updateClassifiedState();
    selectLocation(selectedLocation.id, { focus: true });
    updateLayerVisibility();
  }

  function createGlobe() {
    const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      ambient: 0x8a7a63,
      emissive: 0x050302,
      specular: 0x080604,
      shininess: 8,
      bumpScale: 0.035
    });

    globe = new THREE.Mesh(geometry, material);
    globe.rotateX(Math.PI / 2);
    globeGroup.add(globe);

    material.map = loadGlobeTexture("images/color_map_mgs_2k.jpg");
    material.bumpMap = loadGlobeTexture("images/mars_bump_map_4k_adj.jpg");

    const haloGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 96, 48);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xc5a844,
      transparent: true,
      opacity: 0.055,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    globeGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));
  }

  function createStars() {
    const geometry = new THREE.Geometry();
    const material = new THREE.ParticleBasicMaterial({
      color: 0xd9b882,
      size: 0.018,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 600; i += 1) {
      const radius = 55 + Math.random() * 85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      geometry.vertices.push(new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ));
    }

    scene.add(new THREE.ParticleSystem(geometry, material));
  }

  function loadGlobeTexture(path) {
    const texture = THREE.ImageUtils.loadTexture(path, undefined, function (loadedTexture) {
      loadedTexture.anisotropy = renderer.getMaxAnisotropy();
      if (globe && globe.material) {
        globe.material.needsUpdate = true;
      }
    });
    texture.anisotropy = renderer.getMaxAnisotropy();
    return texture;
  }

  function createPatterns() {
    data.layers.forEach((layer) => {
      const group = new THREE.Object3D();
      patternGroups.set(layer.id, group);
      globeGroup.add(group);
    });

    data.patterns.forEach((pattern) => {
      const group = patternGroups.get(pattern.layer);
      if (!group) return;

      if (pattern.pattern === "orbital") {
        group.add(createOrbitalRing(pattern));
      } else {
        createSurfacePattern(pattern).forEach((line) => group.add(line));
      }
    });
  }

  function createOrbitalRing(pattern) {
    const color = colorForLayer(pattern.layer);
    const ringGeometry = new THREE.TorusGeometry(GLOBE_RADIUS * 1.18, 0.008, 8, 180);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    return ring;
  }

  function createSurfacePattern(pattern) {
    const lines = [];
    const color = colorForLayer(pattern.layer);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: pattern.layer === "military" ? 0.25 : 0.2,
      blending: THREE.AdditiveBlending
    });
    const latStep = pattern.pattern === "hex" ? 7 : pattern.pattern === "target" ? 9 : 8;
    const lonStep = pattern.pattern === "hex" ? 10 : pattern.pattern === "circuit" ? 14 : 12;
    const lonRanges = splitLonRange(pattern.lonMin, pattern.lonMax);

    lonRanges.forEach((range) => {
      for (let lat = pattern.latMin; lat <= pattern.latMax; lat += latStep) {
        const points = [];
        for (let lon = range.min; lon <= range.max; lon += 3) {
          points.push(latLonToVector(lat, lon, OVERLAY_RADIUS));
        }
        lines.push(createLine(points, material));
      }

      for (let lon = range.min; lon <= range.max; lon += lonStep) {
        const points = [];
        for (let lat = pattern.latMin; lat <= pattern.latMax; lat += 3) {
          const offset = pattern.pattern === "hex" ? Math.sin(lat * DEG * 2) * 1.8 : 0;
          points.push(latLonToVector(lat, lon + offset, OVERLAY_RADIUS));
        }
        lines.push(createLine(points, material));
      }

      if (pattern.pattern === "target") {
        const centerLat = (pattern.latMin + pattern.latMax) / 2;
        const centerLon = midpointLon(range.min, range.max);
        [6, 12, 18].forEach((radius) => {
          const points = [];
          for (let a = 0; a <= 360; a += 8) {
            points.push(latLonToVector(centerLat + Math.sin(a * DEG) * radius * 0.45, centerLon + Math.cos(a * DEG) * radius, OVERLAY_RADIUS * 1.002));
          }
          lines.push(createLine(points, material));
        });
      }

      if (pattern.pattern === "cog" || pattern.pattern === "data") {
        for (let lon = range.min; lon <= range.max; lon += lonStep * 1.5) {
          const points = [
            latLonToVector(pattern.latMin, lon, OVERLAY_RADIUS),
            latLonToVector((pattern.latMin + pattern.latMax) / 2, lon + lonStep * 0.5, OVERLAY_RADIUS),
            latLonToVector(pattern.latMax, lon, OVERLAY_RADIUS)
          ];
          lines.push(createLine(points, material));
        }
      }
    });

    return lines;
  }

  function createLine(points, material) {
    const geometry = new THREE.Geometry();
    geometry.vertices = points;
    return new THREE.Line(geometry, material);
  }

  function createMarkersAndLabels() {
    data.locations.forEach((location) => {
      const marker = new THREE.Particle(makeMarkerMaterial(location));
      marker.position.copy(latLonToVector(location.lat, location.lon, GLOBE_RADIUS * 1.055));
      marker.scale.set(0.105, 0.105, 0.105);
      marker.userData.locationId = location.id;
      markerById.set(location.id, marker);
      markerGroup.add(marker);

      const label = document.createElement("button");
      label.className = "map-label";
      label.type = "button";
      label.dataset.locationId = location.id;
      label.textContent = location.shortName || location.name;
      label.addEventListener("click", () => selectLocation(location.id, { focus: true }));
      labelsById.set(location.id, label);
      labelLayer.appendChild(label);
    });
  }

  function makeMarkerMaterial(location) {
    const color = location.classified || location.traitorSensitive ? "#8b2500" : layerColors.get(location.layer) || "#c5a844";
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 96, 96);
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(8, 3, 2, 0.72)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(48, 48, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, 10);
    ctx.lineTo(48, 86);
    ctx.moveTo(10, 48);
    ctx.lineTo(86, 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(48, 48, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    return new THREE.ParticleBasicMaterial({
      map: canvasTexture(canvas),
      size: 0.18,
      transparent: true,
      opacity: 0.92,
      depthTest: false
    });
  }

  function buildLayerControls() {
    data.layers.forEach((layer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "layer-toggle active";
      button.style.setProperty("--layer-color", layer.color);
      button.dataset.layerId = layer.id;
      button.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">${layer.icon}</span>
        <span>${escapeHtml(layer.name)}</span>
      `;
      button.addEventListener("click", () => toggleLayer(layer.id));
      layerControlsEl.appendChild(button);
    });
  }

  function buildLocationList() {
    data.locations.forEach((location) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "location-chip";
      button.dataset.locationId = location.id;
      button.dataset.layerId = location.layer;
      button.innerHTML = `
        <span class="chip-name">${escapeHtml(location.shortName || location.name)}</span>
        <span class="material-symbols-outlined" aria-hidden="true">${location.classified || location.traitorSensitive ? "encrypted" : "place"}</span>
      `;
      button.addEventListener("click", () => selectLocation(location.id, { focus: true }));
      listItemById.set(location.id, button);
      locationListEl.appendChild(button);
    });
  }

  function bindEvents() {
    renderer.domElement.addEventListener("click", handleCanvasClick);
    renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    classifiedButton.addEventListener("click", unlockClassified);
    lockButton.addEventListener("click", lockClassified);
    locationSearchEl.addEventListener("input", filterLocations);
    clearSearchButton.addEventListener("click", function () {
      locationSearchEl.value = "";
      filterLocations();
      locationSearchEl.focus();
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "/" && document.activeElement !== locationSearchEl) {
        event.preventDefault();
        locationSearchEl.focus();
      }
      if (event.key === "Escape") {
        locationSearchEl.blur();
      }
    });
  }

  function handleCanvasClick(event) {
    const marker = pickMarker(event.clientX, event.clientY);
    if (marker) {
      selectLocation(marker.userData.locationId, { focus: false });
    }
  }

  function handlePointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const intersects = pickingRay().intersectObject(globe, false);

    if (intersects.length) {
      const localPoint = intersects[0].point.clone().normalize();
      const lat = Math.asin(localPoint.z) / DEG;
      const lon = (Math.atan2(localPoint.y, localPoint.x) / DEG * -1 + 360) % 360;
      coordReadoutEl.textContent = `${formatLat(lat)} / ${formatLon(lon)}`;
    }
  }

  function pickMarker(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    const hits = pickingRay().intersectObjects(markerGroup.children, true);
    for (let i = 0; i < hits.length; i += 1) {
      const marker = hits[i].object;
      const location = getLocation(marker.userData.locationId);
      if (location && activeLayers.has(location.layer)) {
        return marker;
      }
    }
    return null;
  }

  function pickingRay() {
    return projector.pickingRay(new THREE.Vector3(pointer.x, pointer.y, 0), camera);
  }

  function selectLocation(id, options) {
    const location = getLocation(id);
    if (!location) return;

    selectedLocation = location;
    selectedReadoutEl.textContent = location.shortName || location.name;
    confidenceReadoutEl.textContent = location.coordinateConfidence;

    labelsById.forEach((label) => label.classList.toggle("active", label.dataset.locationId === id));
    listItemById.forEach((item) => item.classList.toggle("active", item.dataset.locationId === id));

    renderDossier(location);
    if (options && options.focus) focusLocation(location);
  }

  function renderDossier(location) {
    const restricted = isRestricted(location);
    const layer = getLayer(location.layer);
    const sources = location.sourceKeys
      .map((key) => ({ key, url: data.sources[key] }))
      .filter((source) => source.url);

    const textMarkup = restricted
      ? `<div class="classified-copy">+++ ACCESS DENIED +++<br>Passkey required. Martian Synod authorization or Inquisitorial override only.</div>`
      : `<div class="dossier-text">${escapeHtml(location.text)}</div>`;

    dossierEl.innerHTML = `
      <h2>${escapeHtml(restricted ? "REDACTED DOSSIER" : location.name)}</h2>
      <p class="subtitle">${escapeHtml(restricted ? "Data-vault sealed" : location.subtitle)}</p>
      ${textMarkup}
      <div class="tag-row">
        <span class="tag">${escapeHtml(layer ? layer.name : location.layer)}</span>
        <span class="tag">${escapeHtml(location.status)}</span>
        ${location.classified ? '<span class="tag">CLASSIFIED</span>' : ""}
        ${location.traitorSensitive ? '<span class="tag">TRAITOR-SENSITIVE</span>' : ""}
      </div>
      <div class="meta-grid">
        <div class="meta-row"><span class="meta-key">Coordinates</span><span>${formatLat(location.lat)} / ${formatLon(location.lon)}</span></div>
        <div class="meta-row"><span class="meta-key">Precision</span><span>${escapeHtml(location.coordinateConfidence)}</span></div>
        <div class="meta-row"><span class="meta-key">Faction</span><span>${escapeHtml(restricted ? "REDACTED" : location.faction)}</span></div>
        <div class="meta-row"><span class="meta-key">Lore</span><span>${escapeHtml(location.loreConfidence)}</span></div>
      </div>
      <div class="source-list">
        ${sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.key)}</a>`).join("")}
      </div>
    `;
  }

  function focusLocation(location) {
    const distance = camera.position.length();
    const target = latLonToVector(location.lat, location.lon, Math.max(distance, 3.2));
    camera.position.copy(target);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function toggleLayer(layerId) {
    if (activeLayers.has(layerId)) {
      activeLayers.delete(layerId);
    } else {
      activeLayers.add(layerId);
    }
    updateLayerVisibility();
  }

  function updateLayerVisibility() {
    data.layers.forEach((layer) => {
      const active = activeLayers.has(layer.id);
      const control = layerControlsEl.querySelector(`[data-layer-id="${layer.id}"]`);
      if (control) control.classList.toggle("active", active);
      const group = patternGroups.get(layer.id);
      if (group) group.visible = active;
    });

    data.locations.forEach((location) => {
      const active = activeLayers.has(location.layer);
      const marker = markerById.get(location.id);
      const label = labelsById.get(location.id);
      const chip = listItemById.get(location.id);
      if (marker) marker.visible = active;
      if (label) label.style.display = active ? "" : "none";
      if (chip) chip.classList.toggle("hidden", !active);
    });

    const activeCount = activeLayers.size;
    layerCounterEl.textContent = `${activeCount}/${data.layers.length}`;
    activeLayerReadoutEl.textContent = `${activeCount} layers`;
    filterLocations();
  }

  function filterLocations() {
    const query = locationSearchEl.value.trim().toLowerCase();
    data.locations.forEach((location) => {
      const item = listItemById.get(location.id);
      if (!item) return;
      const inLayer = activeLayers.has(location.layer);
      const searchable = `${location.name} ${location.shortName} ${location.subtitle} ${location.status} ${location.faction}`.toLowerCase();
      item.classList.toggle("hidden", !inLayer || (query && !searchable.includes(query)));
    });
  }

  function unlockClassified() {
    const response = window.prompt("Enter Mars classified passkey:");
    if (!response) return;

    if (response.trim().toUpperCase() === data.CLASSIFIED_PASSKEY) {
      classifiedUnlocked = true;
      sessionStorage.setItem("mars-classified-unlocked", "true");
      showToast("Classified mode unlocked.");
      updateClassifiedState();
      renderDossier(selectedLocation);
    } else {
      showToast("Passkey rejected.");
    }
  }

  function lockClassified() {
    classifiedUnlocked = false;
    sessionStorage.removeItem("mars-classified-unlocked");
    showToast("Classified mode sealed.");
    updateClassifiedState();
    renderDossier(selectedLocation);
  }

  function updateClassifiedState() {
    document.body.classList.toggle("classified-unlocked", classifiedUnlocked);
    classifiedButton.classList.toggle("active", classifiedUnlocked);

    data.locations.forEach((location) => {
      const restricted = isRestricted(location);
      const label = labelsById.get(location.id);
      const item = listItemById.get(location.id);
      if (label) label.classList.toggle("restricted", restricted);
      if (item) item.classList.toggle("restricted", restricted);
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    markerGroup.children.forEach((marker, index) => {
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.08;
      marker.scale.set(0.105 * pulse, 0.105 * pulse, 0.105 * pulse);
    });
    if (controls.update) controls.update();
    renderer.render(scene, camera);
    updateLabels();
  }

  function updateLabels() {
    const cameraDirection = camera.position.clone().normalize();
    labelsById.forEach((label, id) => {
      const marker = markerById.get(id);
      const location = getLocation(id);
      if (!marker || !location || !activeLayers.has(location.layer)) return;

      const worldPosition = getObjectWorldPosition(marker);
      const surfaceDirection = worldPosition.clone().normalize();
      const facingCamera = surfaceDirection.dot(cameraDirection) > -0.06;
      const projected = projector.projectVector(worldPosition.clone(), camera);

      if (!facingCamera || projected.z < -1 || projected.z > 1) {
        label.style.opacity = "0";
        label.style.pointerEvents = "none";
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.style.opacity = "1";
      label.style.pointerEvents = "auto";
    });
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function latLonToVector(lat, lonWest, radius) {
    const latRad = lat * DEG;
    const lonRad = -lonWest * DEG;
    return new THREE.Vector3(
      radius * Math.cos(lonRad) * Math.cos(latRad),
      radius * Math.sin(lonRad) * Math.cos(latRad),
      radius * Math.sin(latRad)
    );
  }

  function getObjectWorldPosition(object) {
    const position = new THREE.Vector3();
    position.getPositionFromMatrix(object.matrixWorld);
    return position;
  }

  function splitLonRange(min, max) {
    const normMin = normalizeLon(min);
    const normMax = normalizeLon(max);
    if (min === 0 && max === 360) return [{ min: 0, max: 360 }];
    if (normMin <= normMax) return [{ min: normMin, max: normMax }];
    return [{ min: normMin, max: 360 }, { min: 0, max: normMax }];
  }

  function midpointLon(min, max) {
    return normalizeLon((min + max) / 2);
  }

  function normalizeLon(value) {
    return ((value % 360) + 360) % 360;
  }

  function getLocation(id) {
    for (let i = 0; i < data.locations.length; i += 1) {
      if (data.locations[i].id === id) return data.locations[i];
    }
    return null;
  }

  function getLayer(id) {
    for (let i = 0; i < data.layers.length; i += 1) {
      if (data.layers[i].id === id) return data.layers[i];
    }
    return null;
  }

  function colorForLayer(layerId) {
    return new THREE.Color(layerColors.get(layerId) || "#c5a844");
  }

  function canvasTexture(canvas) {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function isRestricted(location) {
    return !classifiedUnlocked && (location.classified || location.traitorSensitive);
  }

  function formatLat(lat) {
    return `${Math.abs(lat).toFixed(1)}${lat >= 0 ? "N" : "S"}`;
  }

  function formatLon(lon) {
    return `${normalizeLon(lon).toFixed(1)}W`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }
})();

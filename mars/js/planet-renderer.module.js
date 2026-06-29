import * as THREE from "./three.module.js";
import { TrackballControls } from "./TrackballControls.module.js";
import { KTX2Loader } from "./KTX2Loader.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";

(function () {
  "use strict";

  const data = window.PLANET_RPG_DATA || window.MARS_RPG_DATA;
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

  if (!data) {
    webglEl.innerHTML = '<div class="webgl-error">Planetary cogitator failed to load required scripts.</div>';
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
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();
  const appName = data.appName || "Mars Cogitator Map";
  const classifiedStorageKey = data.classifiedStorageKey || "mars-classified-unlocked";
  const supportsWebpTextures = detectWebpSupport();
  const markerStyle = data.markerStyle || {};
  const defaultHungarianTextById = {
    "olympus-mons": "A Nagy Hegy Sacred Mars legszentebb tengelye: kohóváros, trón-templom és a Fabricator-General székhelye. A hatalom liturgiái binharikus mennydörgésként gördülnek végig oldalain.",
    "temple-all-knowledge": "A Machine Cult tudásának hatalmas és ősi tárháza. Minden új felfedezést ennek oltárán ajánlanak fel, ahol dugattyú-páncéltermek és nooszférikus kórusok őrzik a vas emlékezetét.",
    "ring-of-iron": "Mars egyenlítői hajógyár-glóriája. Void-liftek kapaszkodnak fel a rozsdás felszínről dokkjaihoz, és hadihajók épülnek vákuum- és plazmaimák alatt.",
    "collegia-titanica": "Parancsnoki nexus Mars isten-gépeinek. Itt a princeps-vaultok és moderati kórusok bolygószintű fenyegetést fordítanak titánléptékű haraggá.",
    "glaivid-hive": "Vörös porból és réz nyomáskapukból álló hive-spire labirintus. A menialok tized, augmentáció és a géplitánia iránti engedelmesség útján emelkednek.",
    "oxygos-hive": "Oxygos az északi ipari fényből emelkedik ki: lezárt habszintek, oxigén-tized páncéltermek és katekizmus-kódolt tranzitaknák rétegzett hive-ja.",
    "olympus-undae-hive": "Poláris hive az Olympus északi dűnetengereihez horgonyozva. Külső burkai elektrosztatikus viharok és eltemetett manufactorum-hő alatt recsegnek.",
    "tantalus-hive": "Tantalus munka-kohorszokból és lezárt factorum klánokból álló éhséggép. Liftjei mélyebbre ereszkednek, mint amilyen magasra tornyai nőnek.",
    "nilosyrtis-hive": "Hive-háló a régi Nilosyrtis peremvidékén. A cogitator népszámláló-szellemek lakosságát ingadozónak, engedelmesnek és hasznosnak jelölik.",
    "milancovic-reactor": "Fúziós szív az északi szirtek alatt. Karbantartó kórusai csillagsűrítési rítusokat recitálnak, miközben a plazmaszelepek ketrecbe zárt hajnalokként izzanak.",
    "arcadia-solar": "Kilométereken át húzódó arany-fekete kollektorlapátok isszák a gyenge marsi napfényt, majd megszentelt földalatti vezetékeken táplálják a forge-templomokat.",
    "omnid-apertura": "Küklopszi adat-torok és rituális belépési csomópont. Belső zsalui csak jóváhagyott nooszférikus aláírásokra nyílnak meg.",
    "mareotis-forge": "Kohótemplom-komplexum, amelynek külső udvarai hővirágzással és szmoggal derengenek. Termékkódjait papi rangpecsétek zárják el.",
    "acheron-fosse-forges": "Kohótemplomok az ősi törések két oldalán. Servo-szállítók ereszkednek a szirtek közé ércet, fegyvert és csendet hordozva.",
    "deep-core-mines": "Bolygóméretű seb aknákból és nyomáskriptákból. Érc, relikvia-ötvözet és tiltott hőszignatúra emelkedik fel a vörös magból.",
    "navis-assembly-yards": "Felszínről orbitra dolgozó építőudvarok, ahol hajótest-bordákat áldanak meg, mielőtt a Ring of Iron felé emelnék őket.",
    "esperanos-space-port": "Vörösen világító daruk és void-lift horgonyok indító síksága. Forgalmát zarándokhajókban, tömegszállítókban és hadianyagban mérik.",
    "deus-manus-space-port": "Szent kikötő a nehéz void-forgalom számára. Gépszellemei minden hajtóműgyújtás előtt tömjént követelnek.",
    "mars-docks": "A bolygófelszíni dokk-interface az orbitális gyűrű alatt. Rakományimák, plazmafigyelmeztetések és battlefleet prioritási parancsok zsúfolják a voxot.",
    "mondus-terrawatt": "Titáni energiarendszer, amely kohó- és hive-negyedeket táplál. Biztonsági tartalékait nem mérnöki adatként, hanem doktrínaként recitálják.",
    "lybia-montes-forges": "Régi magasföldek között szétszórt kohótemplomok. Manufactoriáik hegyek mélyén fekvő gépszentélyeknek felelnek.",
    "lethe-zone": "Emlékezetárnyékos adminisztratív és adatnegyed. A zónát elhagyó servitorokat rutinszerűen megtisztítják útvonal-ismereteiktől.",
    "mondus-gamma": "Erős tharsisi kohótemplom, amelyre Heresy-kori termelése és Techmarine-képzésének minősége miatt emlékeznek. Jelenlegi feljegyzései hiányosak.",
    "mechavitae-forge": "Bio-mechanikus processziókhoz és megszentelt gyártási rítusokhoz kötött kohótemplom. Mélyebb páncéltermei nem szerepelnek a nyilvános tranzitsémákon.",
    "noctis-labyrinthus": "A Labyrinth of Night hivatalosan ellenséges, szennyezett és spirituálisan veszélyes zóna. Mélyebb igazság: a Dragon of Mars a labirintus alatt van megkötve, és a kitakart őrök nem alszanak.",
    "vaults-moravec": "Tiltott páncélterem-rendszer, amelyet Primus Moravec alapított. Megnyitása korrupt scrapcode-ot szabadított fel a Schism of Mars idején, és segített világra hozni a Dark Mechanicumot.",
    "magma-city": "Koriel Zeth egykori void-pajzsos városa, lávazsilipekkel és nooszférikus csodákkal. Heresy-tűzben és saját felszabadított magmájában pusztult el, Vulkan Gate-et hagyva emlékül.",
    "ascraeus-mons": "Tharsisi vulkán és a Legio Tempestus egykori erődje. A hűséges gépbüszkeség még mindig visszhangzik hamuja alatti rom-voxban.",
    "pavonis-mons": "Pavonis Mons adott otthont a Legio Mortis Heresy-kori erődjének. Neve vörös adatként maradt fenn a Titanicus archívumokban: itt a halál géptestben járt.",
    "aries-primus": "Egykor Mars második nagyvárosa és óriási hadianyag-forrása volt. Ring of Death védművei Heresy-feljegyzésekhez tartoznak; M41-es állapota bizonytalan."
  };
  const defaultEtymologyById = {
    "olympus-mons": "HU: Olympus a görög istenek hegye; Mons latinul hegy. EN: the name frames Mars as a divine machine-mountain. LAT: Mons Olympus, axis ferri et imperii.",
    "temple-all-knowledge": "HU: A név nem földrajzi, hanem liturgikus rang: minden tudás oltára. EN: a total archive-title, more creed than address. LAT: Templum Omnis Scientiae.",
    "ring-of-iron": "HU: Az Iron Ring név szó szerint vasgyűrű, Mars orbitális ipari koronája. EN: a shipyard-halo around the red world. LAT: Corona Ferri Martis.",
    "collegia-titanica": "HU: Collegia a római testület, Titanica az isten-gépek rendje. EN: an institutional name for Titan command authority. LAT: Collegia Titanica, ordo deorum machinae.",
    "glaivid-hive": "HU: A Glaivid név sötét, fegyveres hangzású hive-toponima. EN: treated as a Martian hive designation rather than a classical root. LAT: Civitas Glaivid, alvearium ferri.",
    "oxygos-hive": "HU: Oxygos a levegőre, oxidációra és túlélésre utaló ipari névként olvasható. EN: a hive-name tied to sealed atmosphere and oxygen tithe. LAT: Oxygos, domus aeris clausi.",
    "olympus-undae-hive": "HU: Undae latinul hullámok vagy dűnék; itt az Olympus körüli homoktenger hive-ja. EN: the hive of the rust-dune waves. LAT: Undae Olympicae.",
    "tantalus-hive": "HU: Tantalus a kielégíthetetlen éhség és elérhetetlen bőség mitológiai neve. EN: fitting for a hive that consumes labor and gives little back. LAT: Civitas Tantali.",
    "nilosyrtis-hive": "HU: Nilo-Syrtis klasszikus marsi albedó/topográfiai név; a hive a régi régiónév ipari örököse. EN: a cartographic name turned hab-engine. LAT: Nilo-Syrtis Habitatio.",
    "milancovic-reactor": "HU: Milankovic/Milancovic a valós marsi régiónévből jön; a reaktor név a csillagászati ciklusok hideg rendjét idézi. EN: orbital mathematics recast as fusion doctrine. LAT: Reactor Milancovic.",
    "arcadia-solar": "HU: Arcadia eredetileg idilli föld; Marson ironikus név a kietlen napmezőknek. EN: paradise reduced to solar extraction. LAT: Campi Solis Arcadiae.",
    "omnid-apertura": "HU: Apertura latinul nyílás; Omnid az omni/adatkapu érzetét hordozza. EN: the all-mouth, a ritual aperture into data. LAT: Apertura Omnid.",
    "mareotis-forge": "HU: Mareotis ókori földrajzi visszhang, itt forge-temple rangra emelve. EN: antique map-name recast as Mechanicus shrine. LAT: Templum Mareoticum.",
    "acheron-fosse-forges": "HU: Acheron az alvilág folyója, Fosse/Fossae árkokat jelent. EN: underworld trenches made into forge arteries. LAT: Fossae Acherontis.",
    "deep-core-mines": "HU: A név funkcionális: a bolygó mélymagjának bányái. EN: no ornament, only extraction. LAT: Fodinae Cordis Rubri.",
    "navis-assembly-yards": "HU: Navis Imperialis: császári flotta; assembly yards: hajótest-összeállító udvarok. EN: a logistical name, brutally exact. LAT: Navalia Imperialis.",
    "esperanos-space-port": "HU: Esperanos reményre és indulásra utaló portus-név. EN: a launch name for pilgrims and cargo. LAT: Portus Esperanos.",
    "deus-manus-space-port": "HU: Deus Manus, Isten Keze; kikötőnévként szentített emelőerőt jelent. EN: the hand that lifts vessels into void. LAT: Portus Manus Dei.",
    "mars-docks": "HU: Egyszerű haditengerészeti megnevezés: Mars dokkjai. EN: dry bureaucratic name for a sacred void interface. LAT: Doca Martis.",
    "mondus-terrawatt": "HU: Mondus a mundus/mondus gépiesített visszhangja, Terrawatt pedig nyers energiamérték. EN: world-scale power made title. LAT: Complexus Terrawatt.",
    "lybia-montes-forges": "HU: Lybia/Libya Montes valós magasföldi név; a forge-templomok hegyvidéki szentélyekké teszik. EN: mountains converted into machine chapels. LAT: Montes Lybiae.",
    "lethe-zone": "HU: Lethe a feledés folyója; adatnegyedként memóriatörlést és titkolást sugall. EN: a zone named for forgetting. LAT: Zona Lethes.",
    "mondus-gamma": "HU: Gamma a harmadik jel, katonai-ipari kódrang; Mondus a világ-kohó érzetét hordozza. EN: a coded forge-world name. LAT: Mondus Gamma.",
    "mechavitae-forge": "HU: Mecha + vitae, gép és élet. EN: a name for biotechnical manufacture. LAT: Machina Vitae.",
    "noctis-labyrinthus": "HU: Noctis Labyrinthus: az éjszaka labirintusa. EN: a real Martian maze-name made perfect for sealed heresy. LAT: Labyrinthus Noctis.",
    "vaults-moravec": "HU: Moravec személynév; vaults páncéltermeket jelent. EN: the founder's name became a warning label. LAT: Camerae Moravec.",
    "magma-city": "HU: Magma City szó szerint lávaváros. EN: an honest name for a city built over molten death. LAT: Civitas Magma.",
    "ascraeus-mons": "HU: Ascraeus Mons valós vulkánnév; a Heresy után a Tempestus-romokkal azonosul. EN: a volcano made Titan-fortress. LAT: Mons Ascraeus.",
    "pavonis-mons": "HU: Pavonis a páva latin alakja; ironikus név a Legio Mortis sötét erődjének. EN: the peacock mountain stained by traitor engines. LAT: Mons Pavonis.",
    "aries-primus": "HU: Aries a kos csillagjegye, Primus az első; harcias, elsődleges hadianyag-városnév. EN: ram-first, a munitions title. LAT: Aries Primus."
  };
  const defaultNotableById = {
    "olympus-mons": [{ name: "Xasandera Valdet", role: "Fabricator-General of Mars" }, { name: "Martian Synod", role: "supreme Mechanicus governing body" }],
    "temple-all-knowledge": [{ name: "Fabricator-General's data conclave", role: "custodians of sacred archives" }, { name: "Lexmechanic Magi Collegium", role: "ritual indexing and doctrinal audit" }],
    "ring-of-iron": [{ name: "Battlefleet Solar liaison board", role: "orbital dock authority" }, { name: "Magos Navis Fabricatorum", role: "void-yard production overseers" }],
    "collegia-titanica": [{ name: "Collegia Titanica", role: "Titan Legions command institution" }, { name: "Princeps Senioris Council", role: "god-engine strategic authority" }],
    "glaivid-hive": [{ name: "Hive Prefecture Glaivid", role: "hab-stack civil directorate" }, { name: "Skitarii Provost Cohort", role: "industrial order and tithe enforcement" }],
    "oxygos-hive": [{ name: "Oxygos Atmospheric Board", role: "oxygen tithe and seal integrity directors" }, { name: "Magos Biologis Aer-Vitae", role: "hab-survival and respirator doctrine" }],
    "olympus-undae-hive": [{ name: "Olympus Undae Dune Prefecture", role: "polar hive administration" }, { name: "Enginseer Sand-Seal Covenant", role: "outer-shell storm maintenance" }],
    "tantalus-hive": [{ name: "Tantalus Factorum Synod", role: "labor cohort allocation board" }, { name: "Magos Logis Famulorum", role: "population and production forecast director" }],
    "nilosyrtis-hive": [{ name: "Nilosyrtis Census Engine", role: "cogitator population authority" }, { name: "Hab-Magos Praefectus", role: "hive grid civil director" }],
    "milancovic-reactor": [{ name: "Magos Energetic Milancovic", role: "fusion rectorate title" }, { name: "Plasma Liturgist Choir", role: "reactor safety and ignition rites" }],
    "arcadia-solar": [{ name: "Arcadia Solar Rectorate", role: "collector-field authority" }, { name: "Magos Solis", role: "photonic yield and conduit sanctification" }],
    "omnid-apertura": [{ name: "Omnid Gate Conclave", role: "aperture access authority" }, { name: "Noospheric Signator Board", role: "identity and signal approval" }],
    "mareotis-forge": [{ name: "Mareotis Forge Temple Synod", role: "local forge command" }, { name: "Magos Manufactorum Mareoticus", role: "production seal and output director" }],
    "acheron-fosse-forges": [{ name: "Acheron Fosse Forge Synod", role: "fracture-zone forge authority" }, { name: "Servo-Hauler Dominus", role: "ore convoy and scar route director" }],
    "deep-core-mines": [{ name: "Deep Core Extraction Collegium", role: "mine network board" }, { name: "Magos Geologis Rubri Cordis", role: "sub-crustal survey and ore tithe" }],
    "navis-assembly-yards": [{ name: "Navis Imperialis Yard Masters", role: "hull assembly directorate" }, { name: "Magos Hullwright", role: "void-rib blessing and lift schedule" }],
    "esperanos-space-port": [{ name: "Portus Esperanos Traffic Synod", role: "launch corridor authority" }, { name: "Master of Pilgrim Conveyors", role: "civilian and cargo embarkation director" }],
    "deus-manus-space-port": [{ name: "Deus Manus Port Rectorate", role: "heavy void traffic command" }, { name: "Enginseer Dominus Ignitionis", role: "engine-spirit ignition rites" }],
    "mars-docks": [{ name: "Mars Dock Admiralty Liaison", role: "surface-orbital dock coordination" }, { name: "Cargo Prayer Office", role: "manifest sanctification and priority orders" }],
    "mondus-terrawatt": [{ name: "Terrawatt Rectorate II", role: "planetary power distribution board" }, { name: "Magos Energetic Dominus", role: "load doctrine and failure containment" }],
    "lybia-montes-forges": [{ name: "Lybia Montes Forge Synod", role: "highland forge authority" }, { name: "Mountain Shrine Enginseers", role: "deep chapel manufactorum maintenance" }],
    "lethe-zone": [{ name: "Lethe Memory Office", role: "data redaction and route scrubbing" }, { name: "Magos Mnemosyne", role: "servitor memory erasure director" }],
    "mondus-gamma": [{ name: "Lukas Chrom", role: "Heresy-era forge master of Mondus Gamma" }, { name: "Mondus Gamma War-Output Board", role: "munitions and Techmarine training authority" }],
    "mechavitae-forge": [{ name: "Mechavitae Genetor Synod", role: "bio-mechanical production board" }, { name: "Magos Biologis Augmenta", role: "life-machine processions and vat doctrine" }],
    "noctis-labyrinthus": [{ name: "Noctis Quarantine Synod", role: "sealed-zone authority" }, { name: "Dragon Warden Conclave", role: "classified custodial office" }],
    "vaults-moravec": [{ name: "Primus Moravec", role: "founder, Brotherhood of Singularitarianism" }, { name: "Adept Regulus", role: "opened the Vaults during the Schism of Mars" }],
    "magma-city": [{ name: "Koriel Zeth", role: "Forge-Mistress and Adept of Magma City" }, { name: "Dalia Cythera", role: "Zeth's protege, Akashic Reader participant" }],
    "ascraeus-mons": [{ name: "Legio Tempestus Princeps Council", role: "Heresy-era loyalist Titan command" }, { name: "Tempestus Moderati Choir", role: "god-engine battlefield coordination" }],
    "pavonis-mons": [{ name: "Legio Mortis", role: "Heresy-era traitor Titan Legion authority" }, { name: "Kelbor-Hal", role: "Fabricator-General during the Schism of Mars" }],
    "aries-primus": [{ name: "Aries Primus Munitions Directorate", role: "Heresy-era war materiel board" }, { name: "Ring of Death Command", role: "city defence authority" }]
  };

  let scene;
  let camera;
  let renderer;
  let controls;
  let globe;
  let composer;
  let bloomPass;
  let textureLoader;
  let ktx2Loader;
  let supportsKtx2Textures = false;
  let globeGroup;
  let markerGroup;
  let structureGroup;
  let trafficGroup;
  let moonWidget = null;
  const pulsingStructures = [];
  const trafficStreams = [];
  const hungarianTextById = data.hungarianTextById || defaultHungarianTextById;
  const etymologyById = data.etymologyById || defaultEtymologyById;
  const notableById = data.notableById || defaultNotableById;

  let selectedLocation = data.locations[0];
  let classifiedUnlocked = sessionStorage.getItem(classifiedStorageKey) === "true";
  let cameraFocusAnimation = null;
  let moonFocusAnimation = null;
  const CAMERA_FOCUS_DURATION = 1.2;
  let width = window.innerWidth;
  let height = window.innerHeight;

  try {
    init();
    animate();
  } catch (error) {
    webglEl.innerHTML = `<div class="webgl-error">${escapeHtml(error && error.message ? error.message : error)}</div>`;
    throw error;
  }

  function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080403, 0.035);

    camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 250);
    camera.position.set(3.65, -4.7, 2.6);
    camera.up.set(0, 0, 1);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x040201, 0);
    webglEl.appendChild(renderer.domElement);

    textureLoader = new THREE.TextureLoader();
    ktx2Loader = new KTX2Loader()
      .detectSupport(renderer);
    supportsKtx2Textures = Boolean(globalThis.MSC_TRANSCODER);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.75;
    controls.zoomSpeed = 1.05;
    controls.panSpeed = 0.22;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.14;
    controls.minDistance = 2.25;
    controls.maxDistance = 8.5;
    controls.handleResize();

    const materialConfig = data.material || {};
    scene.add(new THREE.AmbientLight(materialConfig.ambientLight || 0x5a5143));

    const sun = new THREE.DirectionalLight(
      materialConfig.sunColor || 0xffe0a8,
      materialConfig.sunIntensity === undefined ? 1.12 : materialConfig.sunIntensity
    );
    positionSunLight(sun, materialConfig);
    scene.add(sun);

    const redRim = new THREE.PointLight(0x8b2500, 0.35, 12);
    redRim.position.set(-2.5, 3, 2.5);
    scene.add(redRim);

    globeGroup = new THREE.Object3D();
    markerGroup = new THREE.Object3D();
    structureGroup = new THREE.Object3D();
    trafficGroup = new THREE.Object3D();
    scene.add(globeGroup);
    createGlobe();
    createStars();
    createPatterns();
    createMarkersAndLabels();
    createStructures();
    createTrafficRoutes();
    createMoonWidget();
    globeGroup.add(markerGroup);
    globeGroup.add(structureGroup);
    globeGroup.add(trafficGroup);
    setupBloomComposer(materialConfig);

    buildLayerControls();
    buildLocationList();
    bindEvents();
    updateClassifiedState();
    selectLocation(selectedLocation.id, { focus: true });
    updateLayerVisibility();
  }

  function setupBloomComposer(materialConfig) {
    const bloomConfig = materialConfig.bloom || {};
    if (!bloomConfig.enabled) return;

    composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      bloomConfig.strength === undefined ? 0.85 : bloomConfig.strength,
      bloomConfig.radius === undefined ? 0.48 : bloomConfig.radius,
      bloomConfig.threshold === undefined ? 0.38 : bloomConfig.threshold
    );
    composer.addPass(bloomPass);
  }

  function setupMoonBloomComposer(targetRenderer, targetScene, targetCamera, moonConfig) {
    const bloomConfig = moonConfig.bloom || {};
    if (!bloomConfig.enabled) return null;

    const moonComposer = new EffectComposer(targetRenderer);
    moonComposer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    moonComposer.addPass(new RenderPass(targetScene, targetCamera));
    moonComposer.addPass(new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      bloomConfig.strength === undefined ? 0.75 : bloomConfig.strength,
      bloomConfig.radius === undefined ? 0.42 : bloomConfig.radius,
      bloomConfig.threshold === undefined ? 0.45 : bloomConfig.threshold
    ));
    return moonComposer;
  }

  function createGlobe() {
    const textures = data.textures || {};
    const materialConfig = data.material || {};
    const geometry = new THREE.SphereBufferGeometry(GLOBE_RADIUS, 96, 64);
    const material = createGlobeMaterial(textures, materialConfig);

    globe = new THREE.Mesh(geometry, material);
    globe.rotateX(Math.PI / 2);
    globeGroup.add(globe);

    const haloGeometry = new THREE.SphereBufferGeometry(GLOBE_RADIUS * 1.035, 96, 48);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: materialConfig.haloColor || 0xc5a844,
      transparent: true,
      opacity: materialConfig.haloOpacity === undefined ? 0.055 : materialConfig.haloOpacity,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    globeGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));

    const nightOverlay = createNightColorOverlay(textures, materialConfig);
    if (nightOverlay) globeGroup.add(nightOverlay);

    if (textures.cloudMap) {
      const cloudGeometry = new THREE.SphereBufferGeometry(GLOBE_RADIUS * 1.018, 96, 64);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: loadGlobeTexture(textures.cloudMap),
        transparent: true,
        opacity: materialConfig.cloudOpacity === undefined ? 0.22 : materialConfig.cloudOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudMesh.rotateX(Math.PI / 2);
      globeGroup.add(cloudMesh);
    }
  }

  function createStars() {
    const positions = new Float32Array(600 * 3);
    const material = new THREE.PointsMaterial({
      color: 0xd9b882,
      size: 0.018,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 600; i += 1) {
      const radius = 55 + Math.random() * 85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geometry, material));
  }

  function loadGlobeTexture(path, options) {
    return loadSceneTexture(path, renderer, function () {
      if (globe && globe.material) {
        globe.material.needsUpdate = true;
      }
    }, options);
  }

  function loadSceneTexture(path, targetRenderer, onLoad, options) {
    const textureOptions = options || {};
    const source = resolveTextureSource(path);
    const loader = source.kind === "ktx2" && ktx2Loader ? ktx2Loader : textureLoader;
    const texture = loader.load(source.url, function (loadedTexture) {
      configureTexture(loadedTexture, targetRenderer, textureOptions);
      if (onLoad) onLoad(loadedTexture);
    });
    configureTexture(texture, targetRenderer, textureOptions);
    return texture;
  }

  function configureTexture(texture, targetRenderer, options) {
    texture.anisotropy = targetRenderer.capabilities.getMaxAnisotropy();
    if (options && options.normalMap) {
      texture.encoding = THREE.LinearEncoding;
    }
  }

  function resolveTextureSource(textureConfig) {
    if (!textureConfig || typeof textureConfig === "string") return { kind: "image", url: textureConfig };
    if (textureConfig.ktx2 && ktx2Loader && supportsKtx2Textures) return { kind: "ktx2", url: textureConfig.ktx2 };
    if (supportsWebpTextures && textureConfig.webp) return { kind: "image", url: textureConfig.webp };
    return {
      kind: "image",
      url: textureConfig.fallback || textureConfig.src || textureConfig.png || textureConfig.webp || textureConfig.ktx2
    };
  }

  function detectWebpSupport() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    } catch (error) {
      return false;
    }
  }

  function createMoonWidget() {
    if (!data.moon || !data.moon.locations || !data.moon.locations.length) return;

    ensureMoonWidgetStyles();

    const container = document.createElement("section");
    container.className = "moon-widget";
    container.setAttribute("aria-label", data.moon.title || "Luna Cogitator");

    const header = document.createElement("div");
    header.className = "moon-widget-header";
    header.innerHTML = `
      <span>${escapeHtml(data.moon.title || "Luna Cogitator")}</span>
      <small>${escapeHtml(data.moon.subtitle || "Terra satellite")}</small>
    `;

    const viewport = document.createElement("div");
    viewport.className = "moon-widget-viewport";
    const moonLabelLayer = document.createElement("div");
    moonLabelLayer.className = "moon-label-layer";

    container.appendChild(header);
    container.appendChild(viewport);
    viewport.appendChild(moonLabelLayer);
    document.body.appendChild(container);

    const moonScene = new THREE.Scene();
    const moonCamera = new THREE.PerspectiveCamera(34, 1, 0.01, 80);
    moonCamera.position.set(0.12, -4.15, 1.35);
    moonCamera.up.set(0, 0, 1);

    const moonRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    moonRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    moonRenderer.setClearColor(0x000000, 0);
    viewport.insertBefore(moonRenderer.domElement, moonLabelLayer);

    const moonControls = new TrackballControls(moonCamera, moonRenderer.domElement);
    moonControls.rotateSpeed = 2.2;
    moonControls.zoomSpeed = 0.75;
    moonControls.panSpeed = 0.08;
    moonControls.noPan = true;
    moonControls.staticMoving = false;
    moonControls.dynamicDampingFactor = 0.12;
    moonControls.minDistance = 2.15;
    moonControls.maxDistance = 6.4;

    const moonConfig = data.moon.material || {};
    moonScene.add(new THREE.AmbientLight(moonConfig.ambientLight || 0x22252d));
    const moonSun = new THREE.DirectionalLight(
      moonConfig.sunColor || 0xd9e6ff,
      moonConfig.sunIntensity === undefined ? 1.45 : moonConfig.sunIntensity
    );
    const moonSunPosition = moonConfig.sunPosition || { x: 2.5, y: -3.1, z: 2.2 };
    moonSun.position.set(moonSunPosition.x, moonSunPosition.y, moonSunPosition.z);
    moonScene.add(moonSun);

    const moonGroup = new THREE.Object3D();
    const moonMarkerGroup = new THREE.Object3D();
    moonScene.add(moonGroup);

    const moonRadius = 1;
    const moonTextures = data.moon.textures || {};
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: moonConfig.emissive === undefined ? 0x010203 : moonConfig.emissive,
      specular: moonConfig.specular === undefined ? 0x141a22 : moonConfig.specular,
      shininess: moonConfig.shininess === undefined ? 9 : moonConfig.shininess,
      bumpScale: moonConfig.bumpScale === undefined ? 0.035 : moonConfig.bumpScale,
      normalScale: moonConfig.normalScale ? new THREE.Vector2(moonConfig.normalScale, moonConfig.normalScale) : new THREE.Vector2(2, 2)
    });
    if (moonTextures.colorMap) {
      moonMaterial.map = loadSceneTexture(moonTextures.colorMap, moonRenderer, function () {
        applyMoonTextureTone(moonMaterial.map, moonConfig);
        moonMaterial.needsUpdate = true;
      });
      applyMoonTextureTone(moonMaterial.map, moonConfig);
    }
    const moonReliefMap = moonConfig.reliefMap || "normal";
    if (moonReliefMap === "bump" && moonTextures.bumpMap) {
      moonMaterial.bumpMap = loadSceneTexture(moonTextures.bumpMap, moonRenderer, function () {
        moonMaterial.needsUpdate = true;
      });
    } else if (moonTextures.normalMap) {
      moonMaterial.normalMap = loadSceneTexture(moonTextures.normalMap, moonRenderer, function () {
        moonMaterial.needsUpdate = true;
      }, { normalMap: true });
    } else if (moonTextures.bumpMap) {
      moonMaterial.bumpMap = loadSceneTexture(moonTextures.bumpMap, moonRenderer, function () {
        moonMaterial.needsUpdate = true;
      });
    }

    const moonMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(moonRadius, 96, 64), moonMaterial);
    moonMesh.rotateX(Math.PI / 2);
    moonGroup.add(moonMesh);

    const moonNightOverlay = createMoonNightOverlay(moonTextures, moonConfig, moonRenderer, moonRadius);
    if (moonNightOverlay) moonGroup.add(moonNightOverlay);

    const moonHalo = new THREE.Mesh(
      new THREE.SphereBufferGeometry(moonRadius * 1.035, 72, 40),
      new THREE.MeshBasicMaterial({
        color: moonConfig.haloColor || 0x9fc7ff,
        transparent: true,
        opacity: moonConfig.haloOpacity === undefined ? 0.07 : moonConfig.haloOpacity,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    );
    moonGroup.add(moonHalo);

    const labels = new Map();
    const markers = new Map();
    data.moon.locations.forEach((location) => {
      const marker = new THREE.Sprite(makeMarkerMaterial(location));
      marker.position.copy(latLonToVector(location.lat, location.lon, moonRadius * 1.07));
      marker.scale.set(0.09, 0.09, 0.09);
      marker.userData.locationId = location.id;
      markers.set(location.id, marker);
      moonMarkerGroup.add(marker);

      const label = document.createElement("button");
      label.type = "button";
      label.className = "map-label moon-map-label";
      label.dataset.locationId = location.id;
      label.textContent = location.shortName || location.name;
      label.addEventListener("click", () => selectMoonLocation(location.id));
      labels.set(location.id, label);
      moonLabelLayer.appendChild(label);
    });
    moonGroup.add(moonMarkerGroup);

    const moonComposer = setupMoonBloomComposer(moonRenderer, moonScene, moonCamera, moonConfig);

    moonRenderer.domElement.addEventListener("click", handleMoonCanvasClick);

    moonWidget = {
      container,
      viewport,
      labelLayer: moonLabelLayer,
      scene: moonScene,
      camera: moonCamera,
      renderer: moonRenderer,
      composer: moonComposer,
      controls: moonControls,
      group: moonGroup,
      mesh: moonMesh,
      markerGroup: moonMarkerGroup,
      labels,
      markers,
      locations: data.moon.locations,
      pointer: new THREE.Vector2(),
      raycaster: new THREE.Raycaster(),
      width: 0,
      height: 0
    };

    resizeMoonWidget();
  }

  function applyMoonTextureTone(texture, moonConfig) {
    if (!texture) return;
    const contrast = moonConfig.mapContrast === undefined ? 1 : moonConfig.mapContrast;
    const brightness = moonConfig.mapBrightness === undefined ? 0 : moonConfig.mapBrightness;
    if (contrast === 1 && brightness === 0) return;

    texture.onUpdate = function () {
      if (!texture.image || texture.userData.toneAdjusted) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        const context = canvas.getContext("2d");
        context.drawImage(texture.image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = toneChannel(data[i], contrast, brightness);
          data[i + 1] = toneChannel(data[i + 1], contrast, brightness);
          data[i + 2] = toneChannel(data[i + 2], contrast, brightness);
        }

        context.putImageData(imageData, 0, 0);
        texture.image = canvas;
        texture.userData.toneAdjusted = true;
        texture.needsUpdate = true;
      } catch (error) {
        texture.userData.toneAdjusted = true;
      }
    };
  }

  function toneChannel(value, contrast, brightness) {
    return Math.max(0, Math.min(255, (value - 128) * contrast + 128 + brightness));
  }

  function createMoonNightOverlay(textures, moonConfig, moonRenderer, moonRadius) {
    if (!textures.nightMap) return null;

    const overlayConfig = moonConfig.nightOverlay || {};
    if (overlayConfig.enabled === false) return null;

    const mode = normalizeOverlayMode(overlayConfig.mode);
    const opacity = overlayConfig.opacity === undefined ? 0.68 : overlayConfig.opacity;
    const nightTexture = loadSceneTexture(textures.nightMap, moonRenderer);
    const overlayGeometry = new THREE.SphereBufferGeometry(moonRadius * (overlayConfig.radiusScale || 1.006), 96, 64);
    let overlayMaterial;

    if (mode === "full") {
      overlayMaterial = new THREE.MeshBasicMaterial({
        map: nightTexture,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } else {
      overlayMaterial = new THREE.ShaderMaterial({
        uniforms: {
          nightMap: { type: "t", value: nightTexture },
          nightOpacity: { type: "f", value: opacity },
          sunDirection: { type: "v3", value: getSunDirection(moonConfig) },
          edgeSoftness: { type: "f", value: overlayConfig.edgeSoftness === undefined ? 0 : overlayConfig.edgeSoftness }
        },
        vertexShader: [
          "varying vec2 vUv;",
          "varying vec3 vWorldNormal;",
          "void main() {",
          "  vUv = uv;",
          "  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D nightMap;",
          "uniform float nightOpacity;",
          "uniform vec3 sunDirection;",
          "uniform float edgeSoftness;",
          "varying vec2 vUv;",
          "varying vec3 vWorldNormal;",
          "void main() {",
          "  vec4 nightColor = texture2D(nightMap, vUv);",
          "  float dayAmount = dot(normalize(vWorldNormal), normalize(sunDirection));",
          "  float softDay = smoothstep(-edgeSoftness, edgeSoftness, dayAmount);",
          "  float hardNight = 1.0 - step(0.0, dayAmount);",
          "  float nightMask = mix(hardNight, 1.0 - softDay, step(0.001, edgeSoftness));",
          "  gl_FragColor = vec4(nightColor.rgb, nightColor.a * nightOpacity * nightMask);",
          "}"
        ].join("\n"),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    }

    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlay.rotateX(Math.PI / 2);

    const glow = createNightLightGlowOverlay(nightTexture, moonConfig, overlayConfig, moonRadius);
    if (!glow) return overlay;

    const group = new THREE.Object3D();
    group.add(overlay);
    group.add(glow);
    return group;
  }

  function ensureMoonWidgetStyles() {
    if (document.getElementById("moon-widget-style")) return;

    const style = document.createElement("style");
    style.id = "moon-widget-style";
    style.textContent = `
      .moon-widget {
        position: fixed;
        right: 386px;
        bottom: 44px;
        width: 300px;
        height: 300px;
        z-index: 6;
        pointer-events: auto;
        border: 0px solid rgba(120, 198, 200, 0.38);
        background: radial-gradient(circle at 48% 42%, rgba(25, 38, 47, 0.01), rgba(2, 7, 9, 0.02) 62%, rgba(0, 0, 0, 0.01));
        box-shadow: 0 0 0px rgba(90, 205, 220, 0.12), inset 0 0 0px rgba(120, 198, 200, 0.08);
        overflow: hidden;
      }

      .moon-widget-header {
        position: absolute;
        left: 10px;
        top: 8px;
        z-index: 3;
        display: grid;
        gap: 2px;
        color: #8fe4e8;
        text-transform: uppercase;
        letter-spacing: 0;
        text-shadow: 0 0 10px rgba(80, 220, 230, 0.35);
        pointer-events: none;
      }

      .moon-widget-header span {
        font-family: Orbitron, sans-serif;
        font-size: 12px;
        font-weight: 700;
      }

      .moon-widget-header small {
        max-width: 180px;
        color: rgba(195, 232, 235, 0.64);
        font-size: 8px;
        line-height: 1.3;
      }

      .moon-widget-viewport,
      .moon-widget canvas,
      .moon-label-layer {
        position: absolute;
        inset: 0;
      }

      .moon-widget canvas {
        width: 100%;
        height: 100%;
        cursor: grab;
      }

      .moon-widget canvas:active {
        cursor: grabbing;
      }

      .moon-label-layer {
        pointer-events: none;
      }

      .moon-map-label {
        font-size: 8px;
        padding: 3px 6px;
        max-width: 104px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: auto;
      }

      @media (max-width: 1180px) {
        .moon-widget {
          right: 18px;
          bottom: 52px;
          width: 232px;
          height: 232px;
        }
      }

      @media (max-width: 760px) {
        .moon-widget {
          width: 178px;
          height: 178px;
          right: 12px;
          bottom: 46px;
        }

        .moon-widget-header small {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createGlobeMaterial(textures, materialConfig) {
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: materialConfig.emissive === undefined ? 0x050302 : materialConfig.emissive,
      specular: materialConfig.specular === undefined ? 0x080604 : materialConfig.specular,
      shininess: materialConfig.shininess === undefined ? 8 : materialConfig.shininess,
      bumpScale: materialConfig.bumpScale === undefined ? 0.035 : materialConfig.bumpScale,
      normalScale: materialConfig.normalScale ? new THREE.Vector2(materialConfig.normalScale, materialConfig.normalScale) : undefined
    });

    material.map = loadGlobeTexture(resolveSurfaceMap(textures, materialConfig));
    const normalMapPath = resolveNormalMap(textures, materialConfig);
    if (textures.bumpMap) {
      material.bumpMap = loadGlobeTexture(textures.bumpMap);
    } else if (normalMapPath) {
      material.normalMap = loadGlobeTexture(normalMapPath, { normalMap: true });
    } else {
      material.bumpMap = loadGlobeTexture("images/mars_bump_map_4k_adj.jpg");
    }
    if (textures.specularMap) {
      material.specularMap = loadGlobeTexture(textures.specularMap);
    }

    return material;
  }

  function createNightColorOverlay(textures, materialConfig) {
    if (!isDayNightSurface(materialConfig) || !textures.nightMap) return null;

    const overlayConfig = materialConfig.nightOverlay || {};
    const mode = normalizeOverlayMode(overlayConfig.mode);
    const opacity = overlayConfig.opacity === undefined ? 0.72 : overlayConfig.opacity;
    const overlayGeometry = new THREE.SphereBufferGeometry(GLOBE_RADIUS * (overlayConfig.radiusScale || 1.002), 96, 64);
    const nightTexture = loadGlobeTexture(textures.nightMap);
    let overlayMaterial;

    if (mode === "full") {
      overlayMaterial = new THREE.MeshBasicMaterial({
        map: nightTexture,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } else {
      overlayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        nightMap: { type: "t", value: nightTexture },
        nightOpacity: { type: "f", value: opacity },
        sunDirection: { type: "v3", value: getSunDirection(materialConfig) },
        edgeSoftness: { type: "f", value: overlayConfig.edgeSoftness === undefined ? 0 : overlayConfig.edgeSoftness }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "varying vec3 vWorldNormal;",
        "void main() {",
        "  vUv = uv;",
        "  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D nightMap;",
        "uniform float nightOpacity;",
        "uniform vec3 sunDirection;",
        "uniform float edgeSoftness;",
        "varying vec2 vUv;",
        "varying vec3 vWorldNormal;",
        "void main() {",
        "  vec4 nightColor = texture2D(nightMap, vUv);",
        "  float dayAmount = dot(normalize(vWorldNormal), normalize(sunDirection));",
        "  float softDay = smoothstep(-edgeSoftness, edgeSoftness, dayAmount);",
        "  float hardNight = 1.0 - step(0.0, dayAmount);",
        "  float nightMask = mix(hardNight, 1.0 - softDay, step(0.001, edgeSoftness));",
        "  gl_FragColor = vec4(nightColor.rgb, nightColor.a * nightOpacity * nightMask);",
        "}"
      ].join("\n"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
      });
    }

    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlay.rotateX(Math.PI / 2);

    const glow = createNightLightGlowOverlay(nightTexture, materialConfig, overlayConfig);
    if (!glow) return overlay;

    const group = new THREE.Object3D();
    group.add(overlay);
    group.add(glow);
    return group;
  }

  function createNightLightGlowOverlay(nightTexture, materialConfig, overlayConfig, globeRadius) {
    const glowConfig = materialConfig.nightGlow || {};
    if (!glowConfig.enabled) return null;

    const mode = normalizeOverlayMode(glowConfig.mode || overlayConfig.mode);
    const opacity = glowConfig.opacity === undefined ? 0.55 : glowConfig.opacity;
    const threshold = glowConfig.threshold === undefined ? 0.32 : glowConfig.threshold;
    const softness = glowConfig.softness === undefined ? 0.42 : glowConfig.softness;
    const colorBoost = glowConfig.colorBoost === undefined ? 1.4 : glowConfig.colorBoost;
    const radiusScale = glowConfig.radiusScale || 1.006;
    const geometry = new THREE.SphereBufferGeometry((globeRadius || GLOBE_RADIUS) * radiusScale, 96, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        nightMap: { type: "t", value: nightTexture },
        glowOpacity: { type: "f", value: opacity },
        threshold: { type: "f", value: threshold },
        softness: { type: "f", value: softness },
        colorBoost: { type: "f", value: colorBoost },
        sunDirection: { type: "v3", value: getSunDirection(materialConfig) },
        edgeSoftness: { type: "f", value: glowConfig.edgeSoftness === undefined ? overlayConfig.edgeSoftness || 0 : glowConfig.edgeSoftness },
        fullMode: { type: "f", value: mode === "full" ? 1 : 0 }
      },
      vertexShader: [
        "varying vec2 vUv;",
        "varying vec3 vWorldNormal;",
        "void main() {",
        "  vUv = uv;",
        "  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D nightMap;",
        "uniform float glowOpacity;",
        "uniform float threshold;",
        "uniform float softness;",
        "uniform float colorBoost;",
        "uniform vec3 sunDirection;",
        "uniform float edgeSoftness;",
        "uniform float fullMode;",
        "varying vec2 vUv;",
        "varying vec3 vWorldNormal;",
        "void main() {",
        "  vec4 nightColor = texture2D(nightMap, vUv);",
        "  float luminance = dot(nightColor.rgb, vec3(0.2126, 0.7152, 0.0722));",
        "  float warmth = max(nightColor.r, nightColor.g * 0.92) - nightColor.b * 0.24;",
        "  float lightMask = smoothstep(threshold, min(1.0, threshold + softness), max(luminance, warmth));",
        "  float dayAmount = dot(normalize(vWorldNormal), normalize(sunDirection));",
        "  float softDay = smoothstep(-edgeSoftness, edgeSoftness, dayAmount);",
        "  float hardNight = 1.0 - step(0.0, dayAmount);",
        "  float nightMask = mix(hardNight, 1.0 - softDay, step(0.001, edgeSoftness));",
        "  nightMask = mix(nightMask, 1.0, fullMode);",
        "  vec3 glowColor = max(nightColor.rgb * colorBoost, vec3(1.0, 0.72, 0.34) * luminance);",
        "  gl_FragColor = vec4(glowColor, lightMask * nightMask * glowOpacity);",
        "}"
      ].join("\n"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const glow = new THREE.Mesh(geometry, material);
    glow.rotateX(Math.PI / 2);
    return glow;
  }

  function resolveSurfaceMap(textures, materialConfig) {
    const surfaceMap = materialConfig.surfaceMap || "day";
    if (isDayNightSurface(materialConfig)) {
      const baseMap = materialConfig.dayNightBaseMap || "day";
      return textures[`${baseMap}Map`] || textures[baseMap] || textures.dayMap || textures.colorMap || "images/color_map_mgs_2k.jpg";
    }
    const namedMap = textures[`${surfaceMap}Map`] || textures[surfaceMap];
    return namedMap || textures.colorMap || "images/color_map_mgs_2k.jpg";
  }

  function resolveNormalMap(textures, materialConfig) {
    const normalMapMode = materialConfig.normalMapMode || "surface";
    if (normalMapMode === "bathymetry") {
      return textures.bathymetryNormalMap || textures.normalMap;
    }
    return textures.normalMap;
  }

  function getSunDirection(materialConfig) {
    const focus = materialConfig.sunFocus;
    if (focus && typeof focus.lat === "number" && typeof focus.lon === "number") {
      return latLonToVector(focus.lat, focus.lon, 1).normalize();
    }

    const position = materialConfig.sunPosition;
    if (position) {
      return new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0).normalize();
    }

    return new THREE.Vector3(5, -4, 2.2).normalize();
  }

  function isDayNightSurface(materialConfig) {
    const surfaceMap = String(materialConfig.surfaceMap || "").toLowerCase();
    return surfaceMap === "daynight" || surfaceMap === "overlap";
  }

  function normalizeOverlayMode(mode) {
    return String(mode || "nightoverlap").toLowerCase() === "full" ? "full" : "nightoverlap";
  }

  function positionSunLight(sun, materialConfig) {
    const focus = materialConfig.sunFocus;
    if (focus && typeof focus.lat === "number" && typeof focus.lon === "number") {
      sun.position.copy(latLonToVector(focus.lat, focus.lon, focus.distance || 8));
      return;
    }

    const position = materialConfig.sunPosition;
    if (position) {
      sun.position.set(position.x || 0, position.y || 0, position.z || 0);
      return;
    }

    sun.position.set(5, -4, 2.2);
  }

  function createPatterns() {
    data.layers.forEach((layer) => {
      const group = new THREE.Object3D();
      patternGroups.set(layer.id, group);
      globeGroup.add(group);
      const civilizationOverlay = createCivilizationOverlay(layer);
      if (civilizationOverlay) group.add(civilizationOverlay);
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
    const group = new THREE.Object3D();
    const color = colorForLayer(pattern.layer);
    const ringGeometry = new THREE.TorusBufferGeometry(GLOBE_RADIUS * 1.18, 0.008, 8, 180);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.visible = pattern.ringVisible === true;
    group.add(ring);

    createOrbitalPanels(pattern).forEach((panel) => group.add(panel));
    return group;
  }

  function createOrbitalPanels(pattern) {
    const panels = [];
    const width = getOrbitalPanelWidth(pattern);
    if (!width) return panels;

    const radius = GLOBE_RADIUS * (pattern.panelRadiusScale || 1.18);
    const panelSize = pattern.panelSize === undefined ? 0.022 : pattern.panelSize;
    const panelStep = pattern.panelStep || 5.5;
    const rowStep = pattern.panelRowStep || 1.7;
    const panelGeometry = createHexPanelGeometry(panelSize);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: pattern.panelColor || 0x9ba4aa,
      transparent: true,
      opacity: pattern.panelOpacity === undefined ? 0.24 : pattern.panelOpacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: pattern.panelWireColor || 0xcfd8dc,
      transparent: true,
      opacity: pattern.panelWireOpacity === undefined ? 0.18 : pattern.panelWireOpacity,
      wireframe: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const arcs = normalizePanelArcs(pattern);
    const rowOffset = (width - 1) / 2;

    arcs.forEach((arc, arcIndex) => {
      for (let row = 0; row < width; row += 1) {
        const lat = (row - rowOffset) * rowStep;
        const stagger = row % 2 ? panelStep * 0.5 : 0;
        for (let lon = arc.start + stagger; lon <= arc.end; lon += panelStep) {
          if (shouldSkipOrbitalPanel(pattern, arcIndex, row, lon)) continue;
          panels.push(createOrbitalPanelMesh(panelGeometry, panelMaterial, wireMaterial, lat, lon, radius));
        }
      }
    });

    return panels;
  }

  function createHexPanelGeometry(size) {
    const vertices = [0, 0, 0];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 6) + i * Math.PI / 3;
      vertices.push(Math.cos(angle) * size, Math.sin(angle) * size, 0);
    }

    const indices = [];
    for (let i = 1; i <= 6; i += 1) {
      indices.push(0, i, i === 6 ? 1 : i + 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function createOrbitalPanelMesh(panelGeometry, panelMaterial, wireMaterial, lat, lon, radius) {
    const normal = latLonToVector(lat, lon, 1).normalize();
    let tangent = new THREE.Vector3(-normal.y, normal.x, 0);
    if (tangent.lengthSq() < 0.000001) tangent = new THREE.Vector3(1, 0, 0);
    tangent.normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    const position = normal.clone().multiplyScalar(radius);
    const matrix = new THREE.Matrix4().makeBasis(tangent, bitangent, normal);

    const group = new THREE.Object3D();
    group.position.copy(position);
    group.setRotationFromMatrix(matrix);

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    const wire = new THREE.Mesh(panelGeometry, wireMaterial);
    group.add(panel);
    group.add(wire);
    return group;
  }

  function normalizePanelArcs(pattern) {
    const sourceArcs = Array.isArray(pattern.panelArcs) && pattern.panelArcs.length
      ? pattern.panelArcs
      : splitLonRange(pattern.lonMin || 0, pattern.lonMax === undefined ? 360 : pattern.lonMax).map((range) => ({ start: range.min, end: range.max }));
    const arcs = [];
    sourceArcs.forEach((arc) => {
      const start = normalizeLon(arc.start);
      const end = normalizeLon(arc.end);
      if (start <= end) {
        arcs.push({ start, end });
      } else {
        arcs.push({ start, end: 360 });
        arcs.push({ start: 0, end });
      }
    });
    return arcs;
  }

  function shouldSkipOrbitalPanel(pattern, arcIndex, row, lon) {
    const gapChance = pattern.panelGapChance === undefined ? 0.18 : pattern.panelGapChance;
    const holeChance = pattern.panelHoleChance === undefined ? 0.12 : pattern.panelHoleChance;
    const seed = hashTrafficSeed(`${pattern.id || "orbital"}:${arcIndex}:${row}:${Math.round(lon * 10)}`);
    const edgeBias = row === 0 || row === getOrbitalPanelWidth(pattern) - 1 ? 0.04 : 0;
    if (seededTrafficRandom(seed) < gapChance + edgeBias) return true;
    return seededTrafficRandom(seed + 4099) < holeChance && row > 0;
  }

  function getOrbitalPanelWidth(pattern) {
    const maxWidth = pattern.panelMaxWidth === undefined ? 12 : pattern.panelMaxWidth;
    return Math.max(0, Math.min(maxWidth, pattern.panelWidth === undefined ? 3 : pattern.panelWidth));
  }

  function createCivilizationOverlay(layer) {
    void layer;
    return null;
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
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  function createTrafficRoutes() {
    const config = data.traffic || {};
    const routes = data.trafficRoutes || [];
    if (config.enabled === false || !routes.length || !trafficGroup) return;

    routes.forEach((route, routeIndex) => {
      const from = resolveTrafficEndpoint(route.from || route.fromId || route.start);
      const to = resolveTrafficEndpoint(route.to || route.toId || route.end);
      if (!from || !to) return;

      const count = route.count || config.count || 5;
      const lineCount = Math.max(1, Math.min(12, count));
      const spacing = route.lineSpacing === undefined ? config.lineSpacing === undefined ? 0.018 : config.lineSpacing : route.lineSpacing;
      const routePhase = (route.phase || 0) + routeIndex * (config.routeStagger === undefined ? 1.35 : config.routeStagger);

      for (let i = 0; i < lineCount; i += 1) {
        const jitter = createTrafficLaneJitter(route, config, routeIndex, i);
        const lateralOffset = (i - (lineCount - 1) / 2) * spacing + jitter.lateral;
        const stream = createTrafficStream(route, config, from, to, lateralOffset, routePhase, i, jitter);
        if (!stream) continue;

        trafficStreams.push(stream);
        trafficGroup.add(stream.line);
      }
    });
  }

  function createTrafficStream(route, config, from, to, lateralOffset, routePhase, laneIndex, jitter) {
    const radius = GLOBE_RADIUS * (route.radiusScale || config.radiusScale || 1.105);
    const baseArcHeight = route.arcHeight === undefined ? config.arcHeight === undefined ? 0.28 : config.arcHeight : route.arcHeight;
    const arcHeight = Math.max(0, baseArcHeight + jitter.height);
    const segments = Math.max(16, route.segments || config.segments || 96);
    const points = createTrafficArcPoints(from, to, radius + jitter.altitude, arcHeight, lateralOffset, segments, jitter.tilt);
    if (points.length < 2) return null;

    const progress = new Float32Array(points.length);
    for (let i = 0; i < progress.length; i += 1) {
      progress[i] = i / (progress.length - 1);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute("routeProgress", new THREE.BufferAttribute(progress, 1));

    const color = new THREE.Color(route.color || config.color || "#ffd36a");
    const intensity = route.intensity === undefined ? config.intensity === undefined ? 1.35 : config.intensity : route.intensity;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { type: "c", value: color },
        uProgress: { type: "f", value: 0 },
        uTrailLength: { type: "f", value: route.trailLength === undefined ? config.trailLength === undefined ? 0.24 : config.trailLength : route.trailLength },
        uFadeDistance: { type: "f", value: route.fadeDistance === undefined ? config.fadeDistance === undefined ? 0.12 : config.fadeDistance : route.fadeDistance },
        uOpacity: { type: "f", value: route.opacity === undefined ? config.opacity === undefined ? 0.88 : config.opacity : route.opacity },
        uIntensity: { type: "f", value: intensity },
        uHeadPower: { type: "f", value: route.headPower === undefined ? config.headPower === undefined ? 2.4 : config.headPower : route.headPower }
      },
      vertexShader: [
        "attribute float routeProgress;",
        "varying float vRouteProgress;",
        "void main() {",
        "  vRouteProgress = routeProgress;",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform vec3 uColor;",
        "uniform float uProgress;",
        "uniform float uTrailLength;",
        "uniform float uFadeDistance;",
        "uniform float uOpacity;",
        "uniform float uIntensity;",
        "uniform float uHeadPower;",
        "varying float vRouteProgress;",
        "void main() {",
        "  float delta = uProgress - vRouteProgress;",
        "  float inTrail = step(0.0, delta) * step(delta, uTrailLength);",
        "  float tail = 1.0 - clamp(delta / max(0.0001, uTrailLength), 0.0, 1.0);",
        "  float head = pow(tail, uHeadPower);",
        "  float arrivalFade = 1.0 - smoothstep(1.0 - uFadeDistance, 1.0, uProgress);",
        "  float launchFade = smoothstep(0.0, min(0.2, uTrailLength), uProgress);",
        "  float alpha = inTrail * arrivalFade * launchFade * uOpacity * mix(0.12, 1.0, head);",
        "  if (alpha <= 0.002) discard;",
        "  vec3 color = uColor * uIntensity * mix(0.45, 1.35, head);",
        "  gl_FragColor = vec4(color, alpha);",
        "}"
      ].join("\n"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    });

    const line = new THREE.Line(geometry, material);
    const speed = route.speed === undefined ? config.speed === undefined ? 0.12 : config.speed : route.speed;
    const duration = route.duration || Math.max(0.1, 1 / Math.max(0.001, speed * jitter.speed));
    const pause = route.pause === undefined ? config.pause === undefined ? 1.4 : config.pause : route.pause;
    const lineStagger = route.lineStagger === undefined ? config.lineStagger === undefined ? 0.08 : config.lineStagger : route.lineStagger;

    return {
      line,
      material,
      duration,
      cycle: duration + pause,
      phase: routePhase + laneIndex * lineStagger + jitter.phase,
      baseOpacity: material.uniforms.uOpacity.value,
      restricted: Boolean(route.classified || from.classified || from.traitorSensitive || to.classified || to.traitorSensitive)
    };
  }

  function createTrafficLaneJitter(route, config, routeIndex, laneIndex) {
    const seedBase = hashTrafficSeed(`${route.id || routeIndex}:${route.from || route.start}:${route.to || route.end}:${laneIndex}`);
    const rand = (offset) => seededTrafficRandom(seedBase + offset * 1013);
    const randomAmount = route.randomness === undefined ? config.randomness === undefined ? 1 : config.randomness : route.randomness;
    const lateralJitter = route.lateralJitter === undefined ? config.lateralJitter === undefined ? 0.007 : config.lateralJitter : route.lateralJitter;
    const altitudeJitter = route.altitudeJitter === undefined ? config.altitudeJitter === undefined ? 0.018 : config.altitudeJitter : route.altitudeJitter;
    const arcHeightJitter = route.arcHeightJitter === undefined ? config.arcHeightJitter === undefined ? 0.055 : config.arcHeightJitter : route.arcHeightJitter;
    const tiltJitter = route.tiltJitter === undefined ? config.tiltJitter === undefined ? 0.055 : config.tiltJitter : route.tiltJitter;
    const phaseJitter = route.phaseJitter === undefined ? config.phaseJitter === undefined ? 0.22 : config.phaseJitter : route.phaseJitter;
    const speedJitter = route.speedJitter === undefined ? config.speedJitter === undefined ? 0.08 : config.speedJitter : route.speedJitter;

    return {
      lateral: centeredRandom(rand(1)) * lateralJitter * randomAmount,
      altitude: centeredRandom(rand(2)) * altitudeJitter * randomAmount,
      height: centeredRandom(rand(3)) * arcHeightJitter * randomAmount,
      tilt: centeredRandom(rand(4)) * tiltJitter * randomAmount,
      phase: centeredRandom(rand(5)) * phaseJitter * randomAmount,
      speed: Math.max(0.1, 1 + centeredRandom(rand(6)) * speedJitter * randomAmount)
    };
  }

  function hashTrafficSeed(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededTrafficRandom(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function centeredRandom(value) {
    return value * 2 - 1;
  }

  function createTrafficArcPoints(from, to, radius, arcHeight, lateralOffset, segments, tiltOffset) {
    const start = latLonToVector(from.lat, from.lon, 1).normalize();
    const end = latLonToVector(to.lat, to.lon, 1).normalize();
    let routeNormal = new THREE.Vector3().crossVectors(start, end);
    if (routeNormal.lengthSq() < 0.000001) {
      routeNormal = new THREE.Vector3().crossVectors(start, new THREE.Vector3(0, 0, 1));
      if (routeNormal.lengthSq() < 0.000001) {
        routeNormal = new THREE.Vector3().crossVectors(start, new THREE.Vector3(0, 1, 0));
      }
    }
    routeNormal.normalize();
    if (tiltOffset) {
      const midAxis = start.clone().add(end).normalize();
      if (midAxis.lengthSq() > 0.000001) {
        routeNormal.applyAxisAngle(midAxis, tiltOffset).normalize();
      }
    }

    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const base = slerpUnitVectors(start, end, t, routeNormal);
      const lateral = routeNormal.clone().cross(base).normalize().multiplyScalar(lateralOffset);
      const direction = base.clone().add(lateral).normalize();
      const altitude = radius + arcHeight * Math.sin(Math.PI * t);
      points.push(direction.multiplyScalar(altitude));
    }
    return points;
  }

  function slerpUnitVectors(start, end, t, fallbackAxis) {
    const dot = Math.max(-1, Math.min(1, start.dot(end)));
    if (dot > 0.9995) {
      return start.clone().lerp(end, t).normalize();
    }
    if (dot < -0.9995) {
      return start.clone().applyAxisAngle(fallbackAxis, Math.PI * t).normalize();
    }

    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const startScale = Math.sin((1 - t) * theta) / sinTheta;
    const endScale = Math.sin(t * theta) / sinTheta;
    return start.clone().multiplyScalar(startScale).add(end.clone().multiplyScalar(endScale)).normalize();
  }

  function resolveTrafficEndpoint(endpoint) {
    if (!endpoint) return null;
    if (typeof endpoint === "string") {
      return getLocation(endpoint);
    }
    if (typeof endpoint.lat === "number" && typeof endpoint.lon === "number") {
      return endpoint;
    }
    if (endpoint.id) {
      return getLocation(endpoint.id);
    }
    return null;
  }

  function createMarkersAndLabels() {
    data.locations.forEach((location) => {
      const marker = new THREE.Sprite(makeMarkerMaterial(location));
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

  function createStructures() {
    const structures = data.structures || [];
    structures.forEach((structure) => {
      if ((structure.type || "pyramid") !== "pyramid") return;
      const pyramid = createFallbackPyramid(structure);
      structureGroup.add(pyramid);
    });
  }

  function createFallbackPyramid(structure) {
    const normal = latLonToVector(structure.lat, structure.lon, 1).normalize();
    const poleAxis = Math.abs(normal.z) > 0.96 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
    const tangent = new THREE.Vector3().crossVectors(poleAxis, normal).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    const baseRadius = structure.baseRadius || 0.025;
    const height = structure.height || 0.42;
    const baseDistance = GLOBE_RADIUS * (structure.surfaceScale || 1.006);
    const baseCenter = normal.clone().multiplyScalar(baseDistance);
    const apex = normal.clone().multiplyScalar(baseDistance + height);

    const vertices = [
      baseCenter.clone().add(tangent.clone().multiplyScalar(baseRadius)).add(bitangent.clone().multiplyScalar(baseRadius)),
      baseCenter.clone().add(tangent.clone().multiplyScalar(-baseRadius)).add(bitangent.clone().multiplyScalar(baseRadius)),
      baseCenter.clone().add(tangent.clone().multiplyScalar(-baseRadius)).add(bitangent.clone().multiplyScalar(-baseRadius)),
      baseCenter.clone().add(tangent.clone().multiplyScalar(baseRadius)).add(bitangent.clone().multiplyScalar(-baseRadius)),
      apex
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    geometry.setIndex([
      0, 1, 4,
      1, 2, 4,
      2, 3, 4,
      3, 0, 4,
      0, 2, 1,
      0, 3, 2
    ]);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(structure.color || "#f4d27a"),
      emissive: new THREE.Color(structure.emissive || "#b56b18"),
      specular: new THREE.Color("#fff0b0"),
      shininess: structure.shininess === undefined ? 60 : structure.shininess,
      transparent: true,
      opacity: structure.opacity === undefined ? 0.92 : structure.opacity,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    const light = new THREE.PointLight(
      new THREE.Color(structure.lightColor || structure.emissive || "#ffd36a"),
      structure.lightIntensity === undefined ? 1.8 : structure.lightIntensity,
      structure.lightDistance || 1.2
    );
    light.position.copy(apex);
    mesh.add(light);

    const glow = new THREE.Sprite(makeStructureGlowMaterial(structure));
    glow.position.copy(apex);
    glow.scale.set(structure.glowSize || 0.28, structure.glowSize || 0.28, structure.glowSize || 0.28);
    mesh.add(glow);

    pulsingStructures.push({
      material,
      light,
      glow,
      baseOpacity: material.opacity,
      baseIntensity: light.intensity,
      baseGlowSize: structure.glowSize || 0.28,
      pulseSpeed: structure.pulseSpeed || 2.4,
      pulseIntensity: structure.pulseIntensity === undefined ? 1 : structure.pulseIntensity,
      opacityPulseIntensity: structure.opacityPulseIntensity === undefined ? structure.pulseIntensity === undefined ? 1 : structure.pulseIntensity : structure.opacityPulseIntensity,
      lightPulseIntensity: structure.lightPulseIntensity === undefined ? structure.pulseIntensity === undefined ? 1 : structure.pulseIntensity : structure.lightPulseIntensity,
      glowPulseIntensity: structure.glowPulseIntensity === undefined ? structure.pulseIntensity === undefined ? 1 : structure.pulseIntensity : structure.glowPulseIntensity
    });

    return mesh;
  }

  function makeStructureGlowMaterial(structure) {
    const color = structure.glowColor || structure.lightColor || "#ffd36a";
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.34, "rgba(255, 220, 120, 0.42)");
    gradient.addColorStop(1, "rgba(255, 220, 120, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.SpriteMaterial({
      map: canvasTexture(canvas),
      color: new THREE.Color(color),
      transparent: true,
      opacity: structure.glowOpacity === undefined ? 0.8 : structure.glowOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }

  function makeMarkerMaterial(location) {
    const color = location.classified || location.traitorSensitive ? "#8b2500" : layerColors.get(primaryLayerId(location)) || "#c5a844";
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

    return new THREE.SpriteMaterial({
      map: canvasTexture(canvas),
      color: 0xffffff,
      transparent: true,
      opacity: markerStyle.visible === false ? 0 : markerStyle.opacity === undefined ? 0.92 : markerStyle.opacity,
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
      addLocationListItem(location, "terra", () => selectLocation(location.id, { focus: true }));
    });
    getMoonLocations().forEach((location) => {
      addLocationListItem(location, "luna", () => selectMoonLocation(location.id));
    });
  }

  function addLocationListItem(location, body, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "location-chip";
    button.dataset.locationId = location.id;
    button.dataset.layerId = primaryLayerId(location);
    button.dataset.layerIds = getLocationLayerIds(location).join(" ");
    button.dataset.body = body;
    button.innerHTML = `
      <span class="chip-name">${escapeHtml(location.shortName || location.name)}</span>
      <span class="material-symbols-outlined" aria-hidden="true">${location.classified || location.traitorSensitive ? "encrypted" : body === "luna" ? "orbit" : "place"}</span>
    `;
    button.addEventListener("click", onSelect);
    listItemById.set(location.id, button);
    locationListEl.appendChild(button);
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
      if (location && isLocationLayerActive(location)) {
        return marker;
      }
    }
    return null;
  }

  function pickingRay() {
    raycaster.setFromCamera(pointer, camera);
    return raycaster;
  }

  function selectLocation(id, options) {
    const location = getLocation(id);
    if (!location) return;

    selectedLocation = location;
    selectedReadoutEl.textContent = location.shortName || location.name;
    confidenceReadoutEl.textContent = location.coordinateConfidence;

    labelsById.forEach((label) => label.classList.toggle("active", label.dataset.locationId === id));
    listItemById.forEach((item) => item.classList.toggle("active", item.dataset.locationId === id));
    if (moonWidget) {
      moonWidget.labels.forEach((label) => label.classList.remove("active"));
    }

    renderDossier(location);
    if (options && options.focus) focusLocation(location);
  }

  function selectMoonLocation(id) {
    const location = getMoonLocation(id);
    if (!location) return;

    selectedLocation = location;
    selectedReadoutEl.textContent = location.shortName || location.name;
    confidenceReadoutEl.textContent = location.coordinateConfidence;

    labelsById.forEach((label) => label.classList.remove("active"));
    listItemById.forEach((item) => item.classList.toggle("active", item.dataset.locationId === id));
    if (moonWidget) {
      moonWidget.labels.forEach((label) => label.classList.toggle("active", label.dataset.locationId === id));
    }

    renderDossier(location);
    focusMoonLocation(location);
  }

  function handleMoonCanvasClick(event) {
    const marker = pickMoonMarker(event.clientX, event.clientY);
    if (marker) {
      selectMoonLocation(marker.userData.locationId);
    }
  }

  function pickMoonMarker(clientX, clientY) {
    if (!moonWidget) return null;

    const rect = moonWidget.renderer.domElement.getBoundingClientRect();
    moonWidget.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    moonWidget.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    moonWidget.raycaster.setFromCamera(moonWidget.pointer, moonWidget.camera);
    const hits = moonWidget.raycaster.intersectObjects(moonWidget.markerGroup.children, true);

    for (let i = 0; i < hits.length; i += 1) {
      const marker = hits[i].object;
      const location = getMoonLocation(marker.userData.locationId);
      if (location && isLocationLayerActive(location)) return marker;
    }

    return null;
  }

  function renderDossier(location) {
    const restricted = isRestricted(location);
    const layers = getLocationLayers(location);
    const sources = (location.sourceKeys || [])
      .map((key) => ({ key, url: data.sources[key] }))
      .filter((source) => source.url);

    const restrictedClass = restricted ? " restricted-content" : "";
    const hungarianText = hungarianTextById[location.id] || location.text;
    const textMarkup = restricted
      ? renderBilingualText(location, hungarianText, restrictedClass, true)
      : renderBilingualText(location, hungarianText, "", false);
    const etymologyMarkup = renderEtymology(location, restrictedClass);
    const notableMarkup = renderNotables(location, restrictedClass);

    dossierEl.innerHTML = `
      <h2 class="${restricted ? "restricted-content" : ""}">${escapeHtml(location.name)}</h2>
      <p class="subtitle${restrictedClass}">${escapeHtml(location.subtitle)}</p>
      ${textMarkup}
      ${etymologyMarkup}
      ${notableMarkup}
      <div class="tag-row">
        ${layers.map((layer) => `<span class="tag">${escapeHtml(layer ? layer.name : primaryLayerId(location))}</span>`).join("")}
        <span class="tag">${escapeHtml(location.status)}</span>
        ${location.classified ? '<span class="tag">CLASSIFIED</span>' : ""}
        ${location.traitorSensitive ? '<span class="tag">TRAITOR-SENSITIVE</span>' : ""}
      </div>
      <div class="meta-grid">
        <div class="meta-row"><span class="meta-key">Coordinates</span><span>${formatLat(location.lat)} / ${formatLon(location.lon)}</span></div>
        <div class="meta-row"><span class="meta-key">Precision</span><span>${escapeHtml(location.coordinateConfidence)}</span></div>
        <div class="meta-row"><span class="meta-key">Faction</span><span class="${restricted ? "restricted-content" : ""}">${escapeHtml(location.faction)}</span></div>
        <div class="meta-row"><span class="meta-key">Lore</span><span class="${restricted ? "restricted-content" : ""}">${escapeHtml(location.loreConfidence)}</span></div>
      </div>
      <div class="source-list">
        ${sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.key)}</a>`).join("")}
      </div>
    `;
  }

  function renderEtymology(location, restrictedClass) {
    const etymology = etymologyById[location.id];
    if (!etymology) return "";

    return `
      <section class="dossier-section${restrictedClass}">
        <h3>Nomen / Etymologia</h3>
        <p class="etymology-copy">${escapeHtml(etymology)}</p>
      </section>
    `;
  }

  function renderNotables(location, restrictedClass) {
    const notables = notableById[location.id] || [];
    if (!notables.length) return "";

    return `
      <section class="dossier-section${restrictedClass}">
        <h3>Notable Personae / Directorate</h3>
        <ul class="notable-list">
          ${notables.map((person) => `
            <li>
              <span class="notable-name">${escapeHtml(person.name)}</span>
              <span class="notable-role">${escapeHtml(person.role)}</span>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }

  function renderBilingualText(location, hungarianText, restrictedClass, classifiedStyle) {
    const blockClass = classifiedStyle ? "classified-copy" : "dossier-text";
    return `
      <div class="${blockClass}${restrictedClass}">
        <div class="language-label">HU</div>
        <div>${escapeHtml(hungarianText)}</div>
      </div>
      <div class="${blockClass}${restrictedClass}">
        <div class="language-label">EN</div>
        <div>${escapeHtml(location.text)}</div>
      </div>
    `;
  }

  function focusLocation(location) {
    const distance = camera.position.length();
    const target = latLonToVector(location.lat, location.lon, Math.max(distance, 3.2));

    cameraFocusAnimation = {
      from: camera.position.clone(),
      to: target,
      startTime: clock.getElapsedTime(),
      duration: CAMERA_FOCUS_DURATION
    };

    controls.target.set(0, 0, 0);
  }

  function focusMoonLocation(location) {
    if (!moonWidget) return;

    const distance = moonWidget.camera.position.length();
    const target = latLonToVector(location.lat, location.lon, Math.max(distance, 3.2));

    moonFocusAnimation = {
      from: moonWidget.camera.position.clone(),
      to: target,
      startTime: clock.getElapsedTime(),
      duration: CAMERA_FOCUS_DURATION
    };

    moonWidget.controls.target.set(0, 0, 0);
  }

  function toggleLayer(layerId) {
    if (activeLayers.has(layerId)) {
      activeLayers.delete(layerId);
    } else {
      activeLayers.add(layerId);
    }
    updateLayerVisibility();
    if (selectedLocation && getMoonLocation(selectedLocation.id) && isLocationLayerActive(selectedLocation)) {
      focusMoonLocation(selectedLocation);
    }
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
      const active = isLocationLayerActive(location);
      const marker = markerById.get(location.id);
      const label = labelsById.get(location.id);
      const chip = listItemById.get(location.id);
      if (marker) marker.visible = active;
      if (label) label.style.display = active ? "" : "none";
      if (chip) chip.classList.toggle("hidden", !active);
    });
    getMoonLocations().forEach((location) => {
      const active = isLocationLayerActive(location);
      const marker = moonWidget ? moonWidget.markers.get(location.id) : null;
      const label = moonWidget ? moonWidget.labels.get(location.id) : null;
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
    getListLocations().forEach((location) => {
      const item = listItemById.get(location.id);
      if (!item) return;
      const inLayer = isLocationLayerActive(location);
      const searchable = buildLocationSearchText(location, item.dataset.body).toLowerCase();
      item.classList.toggle("hidden", !inLayer || (query && !searchable.includes(query)));
    });
  }

  function unlockClassified() {
    const response = window.prompt(`Enter ${appName} classified passkey:`);
    if (!response) return;

    const enteredPasskey = response.trim().toUpperCase();
    const expectedPasskey = String(data.CLASSIFIED_PASSKEY || "").trim().toUpperCase();
    if (enteredPasskey === expectedPasskey) {
      classifiedUnlocked = true;
      sessionStorage.setItem(classifiedStorageKey, "true");
      showToast("Classified mode unlocked.");
      updateClassifiedState();
      renderDossier(selectedLocation);
    } else {
      showToast("Passkey rejected.");
    }
  }

  function lockClassified() {
    classifiedUnlocked = false;
    sessionStorage.removeItem(classifiedStorageKey);
    showToast("Classified mode sealed.");
    updateClassifiedState();
    renderDossier(selectedLocation);
  }

  function updateClassifiedState() {
    document.body.classList.toggle("classified-unlocked", classifiedUnlocked);
    classifiedButton.classList.toggle("active", classifiedUnlocked);

    getListLocations().forEach((location) => {
      const restricted = isRestricted(location);
      const label = labelsById.get(location.id);
      const item = listItemById.get(location.id);
      setClass(label, "restricted", restricted);
      setClass(item, "restricted", restricted);
    });
    if (moonWidget) {
      moonWidget.locations.forEach((location) => {
        setClass(moonWidget.labels.get(location.id), "restricted", isRestricted(location));
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    updateCameraFocusAnimation(elapsed);

    markerGroup.children.forEach((marker, index) => {
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.08;
      marker.scale.set(0.105 * pulse, 0.105 * pulse, 0.105 * pulse);
    });
    pulsingStructures.forEach((structure, index) => {
      const pulse = 0.5 + Math.sin(elapsed * structure.pulseSpeed + index * 0.7) * 0.5;
      const opacityPulse = (0.68 + pulse * 0.32 - 1) * structure.opacityPulseIntensity;
      const lightPulse = (0.55 + pulse * 0.7 - 1) * structure.lightPulseIntensity;
      const glowPulse = (0.82 + pulse * 0.42 - 1) * structure.glowPulseIntensity;
      structure.material.opacity = Math.max(0, structure.baseOpacity * (1 + opacityPulse));
      structure.light.intensity = Math.max(0, structure.baseIntensity * (1 + lightPulse));
      const glowScale = structure.baseGlowSize * Math.max(0.01, 1 + glowPulse);
      structure.glow.scale.set(glowScale, glowScale, glowScale);
    });
    updateTrafficRoutes(elapsed);
    updateMoonWidget(elapsed);
    if (controls.update) controls.update();
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    updateLabels();
  }

  function updateTrafficRoutes(elapsed) {
    trafficStreams.forEach((stream) => {
      if (stream.restricted && !classifiedUnlocked) {
        stream.line.visible = false;
        return;
      }

      const localTime = (elapsed + stream.phase) % stream.cycle;
      if (localTime > stream.duration) {
        stream.line.visible = false;
        return;
      }

      const progress = Math.min(1, localTime / stream.duration);
      stream.line.visible = true;
      stream.material.uniforms.uProgress.value = progress;
      stream.material.uniforms.uOpacity.value = stream.baseOpacity;
    });
  }



  function updateCameraFocusAnimation(elapsed) {
    if (!cameraFocusAnimation) return;

    const progress = Math.min(
      (elapsed - cameraFocusAnimation.startTime) / cameraFocusAnimation.duration,
      1
    );

    // Smoothstep easing: slow start, smooth stop.
    const eased = progress * progress * (3 - 2 * progress);

camera.position.copy(cameraFocusAnimation.from);
camera.position.lerp(cameraFocusAnimation.to, eased);

    controls.target.set(0, 0, 0);

    if (progress >= 1) {
      camera.position.copy(cameraFocusAnimation.to);
      cameraFocusAnimation = null;
    }
  }

  function updateLabels() {
    const cameraDirection = camera.position.clone().normalize();
    labelsById.forEach((label, id) => {
      const marker = markerById.get(id);
      const location = getLocation(id);
      if (!marker || !location || !isLocationLayerActive(location)) return;

      const worldPosition = getObjectWorldPosition(marker);
      const surfaceDirection = worldPosition.clone().normalize();
      const facingCamera = surfaceDirection.dot(cameraDirection) > -0.06;
      const projected = worldPosition.clone().project(camera);

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

  function updateMoonWidget(elapsed) {
    if (!moonWidget) return;

    updateMoonFocusAnimation(elapsed);

    moonWidget.markerGroup.children.forEach((marker, index) => {
      const pulse = 1 + Math.sin(elapsed * 2.1 + index * 1.7) * 0.08;
      marker.scale.set(0.09 * pulse, 0.09 * pulse, 0.09 * pulse);
    });
    if (moonWidget.controls.update) moonWidget.controls.update();
    if (moonWidget.composer) {
      moonWidget.composer.render();
    } else {
      moonWidget.renderer.render(moonWidget.scene, moonWidget.camera);
    }
    updateMoonLabels();
  }

  function updateMoonFocusAnimation(elapsed) {
    if (!moonWidget || !moonFocusAnimation) return;

    const progress = Math.min(
      (elapsed - moonFocusAnimation.startTime) / moonFocusAnimation.duration,
      1
    );
    const eased = progress * progress * (3 - 2 * progress);

    moonWidget.camera.position.copy(moonFocusAnimation.from);
    moonWidget.camera.position.lerp(moonFocusAnimation.to, eased);
    moonWidget.controls.target.set(0, 0, 0);

    if (progress >= 1) {
      moonWidget.camera.position.copy(moonFocusAnimation.to);
      moonFocusAnimation = null;
    }
  }

  function updateMoonLabels() {
    if (!moonWidget || !moonWidget.width || !moonWidget.height) return;

    const cameraDirection = moonWidget.camera.position.clone().normalize();
    moonWidget.labels.forEach((label, id) => {
      const marker = moonWidget.markers.get(id);
      const location = getMoonLocation(id);
      if (!marker || !location || !isLocationLayerActive(location)) {
        label.style.opacity = "0";
        label.style.pointerEvents = "none";
        return;
      }

      const worldPosition = getObjectWorldPosition(marker);
      const surfaceDirection = worldPosition.clone().normalize();
      const facingCamera = surfaceDirection.dot(cameraDirection) > -0.02;
      const projected = worldPosition.clone().project(moonWidget.camera);

      if (!facingCamera || projected.z < -1 || projected.z > 1) {
        label.style.opacity = "0";
        label.style.pointerEvents = "none";
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * moonWidget.width;
      const y = (-projected.y * 0.5 + 0.5) * moonWidget.height;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.style.opacity = "1";
      label.style.pointerEvents = "auto";
    });
  }

  function resizeMoonWidget() {
    if (!moonWidget) return;

    const rect = moonWidget.viewport.getBoundingClientRect();
    moonWidget.width = Math.max(1, rect.width);
    moonWidget.height = Math.max(1, rect.height);
    moonWidget.camera.aspect = moonWidget.width / moonWidget.height;
    moonWidget.camera.updateProjectionMatrix();
    moonWidget.renderer.setSize(moonWidget.width, moonWidget.height);
    if (moonWidget.composer) {
      moonWidget.composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      moonWidget.composer.setSize(moonWidget.width, moonWidget.height);
    }
    if (moonWidget.controls.handleResize) moonWidget.controls.handleResize();
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (composer) {
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      composer.setSize(width, height);
    }
    resizeMoonWidget();
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
    object.getWorldPosition(position);
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

  function getMoonLocation(id) {
    const moonLocations = getMoonLocations();
    for (let i = 0; i < moonLocations.length; i += 1) {
      if (moonLocations[i].id === id) return moonLocations[i];
    }
    return null;
  }

  function getMoonLocations() {
    return data.moon && Array.isArray(data.moon.locations) ? data.moon.locations : [];
  }

  function getListLocations() {
    return data.locations.concat(getMoonLocations());
  }

  function getLocationLayerIds(location) {
    const layers = Array.isArray(location.layers) && location.layers.length ? location.layers : [location.layer];
    const unique = [];
    layers.forEach((layerId) => {
      if (layerId && unique.indexOf(layerId) === -1) unique.push(layerId);
    });
    return unique.length ? unique : ["unknown"];
  }

  function primaryLayerId(location) {
    return getLocationLayerIds(location)[0];
  }

  function getLocationLayers(location) {
    return getLocationLayerIds(location).map((layerId) => getLayer(layerId) || { id: layerId, name: layerId });
  }

  function isLocationLayerActive(location) {
    return getLocationLayerIds(location).some((layerId) => activeLayers.has(layerId));
  }

  function getLayer(id) {
    for (let i = 0; i < data.layers.length; i += 1) {
      if (data.layers[i].id === id) return data.layers[i];
    }
    return null;
  }

  function buildLocationSearchText(location, body) {
    const layers = getLocationLayers(location).map((layer) => `${layer.id} ${layer.name}`).join(" ");
    const sources = (location.sourceKeys || [])
      .map((key) => `${key} ${data.sources[key] || ""}`)
      .join(" ");
    const notables = (notableById[location.id] || [])
      .map((person) => `${person.name} ${person.role}`)
      .join(" ");
    return [
      body === "luna" ? "luna moon" : "terra earth",
      location.id,
      location.name,
      location.shortName,
      location.subtitle,
      location.coordinateConfidence,
      layers,
      location.faction,
      location.status,
      location.loreConfidence,
      location.text,
      hungarianTextById[location.id],
      etymologyById[location.id],
      notables,
      sources,
      location.classified ? "classified restricted" : "",
      location.traitorSensitive ? "traitor-sensitive traitor sensitive" : ""
    ].filter(Boolean).join(" ");
  }

  function colorForLayer(layerId) {
    return new THREE.Color(layerColors.get(layerId) || "#c5a844");
  }

  function canvasTexture(canvas) {
    return new THREE.CanvasTexture(canvas);
  }

  function isRestricted(location) {
    return Boolean(!classifiedUnlocked && (location.classified || location.traitorSensitive));
  }

  function setClass(element, className, enabled) {
    if (!element) return;
    if (enabled) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  function formatLat(lat) {
    return `${Math.abs(lat).toFixed(1)}${lat >= 0 ? "N" : "S"}`;
  }

  function formatLon(lon) {
    const normalized = normalizeLon(lon);
    if (data.longitudeLabels === "eastWest") {
      if (normalized <= 180) return `${normalized.toFixed(1)}W`;
      return `${(360 - normalized).toFixed(1)}E`;
    }
    return `${normalized.toFixed(1)}W`;
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

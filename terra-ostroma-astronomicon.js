(() => {
  'use strict';
  const assetRoot = 'images/terra-ostroma/astronomicon/';
  // Coordinates trace the five generated plates in a shared 1000 x 562.5 space.
  const scenes = {
    overview: {
      title: 'Astronomicon', latin: 'ASTRONOMICON / SECTIO GENERALIS', code: '00',
      level: 'Himalája / orbitális tér',
      lead: 'A Himalájától északra fekvő medencéből 888 km magasra emelkedő torony. Talapzatát a Forbidden Fortress veszi körül. Koronagyűrűi a galaxisba irányítják a warp-részecskék áramlását.',
      note: ['Eredet és kiterjedés', 'Marson készült; építője Typhon. A torony és erődrendszere több tízezer négyzetkilométert foglal el. A felső szerkezet a légkörön túl a warpba nyúlik.'],
      stats: [['Magasság', '888 km'], ['Napi betáplálás', '10 000 psyker'], ['Alapterület', 'Több tízezer km²'], ['Kibocsátás', 'Folyamatos']],
      links: ['fortress', 'plasma', 'core', 'warp'],
      rooms: [
        { id: 'fortress', name: 'Forbidden Fortress', kind: 'Talapzat', at: [603, 450], label: [210, 377], target: 'fortress', contour: 'M80 522 L189 473 L471 415 L475 373 L733 373 L742 421 L947 471 L947 529 L780 554 L398 555 Z' },
        { id: 'plasma', name: 'Plazmaszint', kind: 'Alsó szakasz', at: [606, 332], label: [210, 281], target: 'plasma', contour: 'M512 341 L513 303 Q600 277 696 305 L707 345 L700 390 L505 390 Z' },
        { id: 'core', name: 'Magcsarnok', kind: 'Középső szakasz', at: [606, 221], label: [210, 187], target: 'core', contour: 'M553 193 Q606 174 658 193 L680 269 Q607 297 535 270 Z' },
        { id: 'warp', name: 'Warpzóna', kind: 'Felső szakasz', at: [606, 46], label: [210, 81], target: 'warp', contour: 'M597 4 L615 4 L640 115 Q606 127 573 115 Z' },
        { id: 'patrol', name: 'Járőrflotta', kind: 'Orbitális védelem', at: [789, 187], label: [766, 139], text: 'A felső szakasz körül orbitális járőrök biztosítják a megközelítési útvonalakat. A torony sugárzási övezete korlátozza a hajók tartózkodási idejét.', contour: 'M745 147 L763 145 L768 151 L749 155 Z M769 182 L806 177 L814 183 L791 193 L767 191 Z' },
        { id: 'field', name: 'Sugárzási övezet', kind: 'Kitettség', at: [720, 353], label: [779, 307], text: 'A külső övezetben tartós kitettség hatására kifakulás és szöveti elváltozás léphet fel. Az állomány szolgálati idejét korlátozzák, a személyzetet rendszeresen váltják.', contour: 'M695 302 Q743 327 742 387 L721 423 L704 398 L706 349 Z' }
      ],
      flows: [
        { d: 'M606 532 C614 452 598 380 606 307 S612 154 606 20', duration: 16 },
        { d: 'M548 230 C537 250 674 263 677 233 C679 209 549 207 548 230 Z', color: 'silver orbit', duration: 32 }
      ]
    },
    fortress: {
      title: 'Forbidden Fortress', latin: 'FORTRESS / FUNDAMENTUM', code: '01',
      level: 'Felszín / három föld alatti szint',
      lead: 'A torony talapzatát körülvevő erőd fogadja a psykereket. Belső pajzsrendszere az Astronomicon kisugárzását szigeteli el Terrától; a külső védelmi vonal a beérkező támadásokat fogja fel.',
      note: ['Psykerfogadás', 'Leszállópálya → fogadócsarnok → karantén → előkészítő → áldozati kamra. A kamrában felszabaduló warp-részecskék zárt vezetéken jutnak a plazmaoszlopba.'],
      stats: [['Betáplálás', '10 000 psyker / nap'], ['Pajzsrendszer', 'Két védelmi réteg'], ['Föld alatti szintek', '3'], ['Személyzet', 'Váltásos szolgálat']],
      links: ['overview', 'plasma'],
      rooms: [
        { id: 'landing', name: 'Leszállópálya', kind: 'Felszín / érkezés', at: [146, 185], text: 'A psykerszállítók fogadására szolgáló fedélzet. A belépési ellenőrzés a pályához közvetlenül csatlakozó fogadócsarnokban történik.', contour: 'M36 177 L151 136 L273 184 L146 229 Z' },
        { id: 'reception', name: 'Fogadócsarnok', kind: 'Felszín / nyilvántartás', at: [348, 214], text: 'Az érkező csoportok azonosítása, nyilvántartásba vétele és átadása. Innen az elkülönítő folyosón keresztül érhető el a karantén.', contour: 'M271 211 L367 177 L453 211 L357 250 Z' },
        { id: 'quarantine', name: 'Karantén', kind: '−1 / elkülönítés', at: [303, 306], text: 'Zsilipkapukkal elválasztott megfigyelőcellák. Itt végzik a pszichés terhelés és a warp-kitettség ellenőrzését az előkészítés előtt.', contour: 'M249 295 L282 282 L355 309 L321 327 L274 331 L248 317 Z' },
        { id: 'preparation', name: 'Előkészítő', kind: '−1 / átadás', at: [476, 301], text: 'A karanténból átvett psykerek előkészítésére szolgáló állomás. A csarnokot ellenőrzött folyosó köti össze az áldozati kamrával.', contour: 'M419 295 L496 278 L562 299 L481 322 Z' },
        { id: 'sacrifice', name: 'Áldozati kamra', kind: 'Betáplálási rendszer', at: [649, 247], text: 'Az indukciós berendezésben naponta tízezer psykert égetnek el. A felszabaduló részecskeáramot a központi vezetékrendszer továbbítja az Astronomiconba.', contour: 'M580 239 C571 212 620 201 662 211 C713 213 746 236 713 265 Q654 292 593 269 Z' },
        { id: 'temple', name: 'Templom', kind: 'Felszín / szentély', at: [745, 139], text: 'Az erőd szolgálati állományának szentélye. A belső védelmi körön belül, a fogadó- és szolgálati útvonalaktól elkülönítve helyezkedik el.', contour: 'M672 139 L750 109 L816 138 L742 172 Z' },
        { id: 'machines', name: 'Pajzsgépház', kind: '−2 / energiavédelem', at: [784, 387], text: 'Két elkülönített generátor táplálja a védelmi rendszert. A belső rendszer a torony sugárzását, a külső rendszer a támadások energiáját tartóztatja fel.', contour: 'M699 361 L738 320 L776 338 L839 350 L865 403 L855 451 L789 459 L713 411 Z' },
        { id: 'barracks', name: 'Barakkok', kind: '−2 / állomány', at: [266, 439], text: 'Az őrség és a műszaki személyzet pihenőkörlete. A sugárzási terhelés miatt a szolgálati csoportokat rendszeresen váltják.', contour: 'M166 444 L250 398 L385 448 L271 502 Z' },
        { id: 'isolator', name: 'Mélyszinti izolátor', kind: '−3 / zárt géptér', at: [609, 486], text: 'A torony alapzatának mélyén elhelyezett leválasztó berendezés. A vastag falazat és az önálló hozzáférési zsilip elkülöníti a gépteret az erőd lakott szintjeitől.', contour: 'M507 478 Q563 412 655 441 L698 469 L709 505 Q650 553 556 534 Z' },
        { id: 'inner-shield', name: 'Belső pajzsgyűrű', kind: 'Sugárzásvédelem', at: [451, 103], text: 'Az Astronomicon warpmezőjét visszatartó belső védelmi réteg. A mező az erődön kívül is veszélyes; az Eye of Night védelmet nyújt a hatásával szemben.', contour: 'M388 73 Q352 109 459 127 Q579 151 639 99 L634 79 Q594 129 472 112 Q387 102 400 77 Z' },
        { id: 'outer-shield', name: 'Külső védelmi vonal', kind: 'Felszíni védelem', at: [881, 150], text: 'A kerületfal és a külső pajzsöv védi az erődöt a felszíni és orbitális támadásoktól. A kapuk és leszállófolyosók átjárását külön őrség ellenőrzi.', contour: 'M823 67 L889 119 L947 147 L963 188 L934 187 L921 160 L870 137 L819 87 Z' }
      ],
      flows: [
        { d: 'M651 245 C645 222 624 213 610 208 C595 192 574 206 568 185 C565 157 574 151 562 139 L523 133 L520 4', duration: 15 },
        { d: 'M751 381 L750 308 L665 279 L535 329 L456 317 L346 354 L318 342', color: 'silver', duration: 28 }
      ]
    },
    plasma: {
      title: 'Plazmaszint', latin: 'PLASMA / FLUXUS PARTICULARUM', code: '02',
      level: 'Alsó toronyszakasz / zárt mezőtér',
      lead: 'Sűrű, folyékony aranyra emlékeztető plazma tölti ki az alsó tengelyt. Az áldozati kamrából érkező részecskék ezen az oszlopon keresztül jutnak fel a magcsarnokba.',
      note: ['Optikai és anyagi kockázat', 'A belső mag közvetlen látványa vakságot okoz. Szűrt optikán keresztül aranyló részecskeáram észlelhető. Közeli kitettség esetén az élő szövet kvantumméretű, antirészecske-alapú warp-nanorobotokká alakul.'],
      stats: [['Hőmérséklet', '>10⁸ K · becsült'], ['Halmazállapot', 'Sűrű plazma'], ['Kvantumállapot', 'Instabil'], ['Áramlás', 'Felfelé']],
      links: ['overview', 'fortress', 'core'],
      rooms: [
        { id: 'stream', name: 'Plazmaoszlop', kind: 'Részecskeáram', at: [498, 242], text: 'A központi tengelyen felfelé haladó részecskefolyam. Az aranyló fény a sűrű plazma megfigyelhető optikai képe; a warp-összetevő nem írható le stabil anyagi állapottal.', contour: 'M478 3 L515 3 L524 435 Q517 471 495 472 Q477 465 478 433 Z' },
        { id: 'containment', name: 'Mezőhatároló gyűrűk', kind: 'Plazmavédelem', at: [555, 273], text: 'A tengely körül elhelyezett gyűrűk határolják a plazmaövezetet. A szervizhálózatot és a külső szerkezetet elválasztják a közvetlen részecskeáramtól.', contour: 'M407 238 C383 276 422 296 497 298 C568 300 602 273 577 245 L570 260 C574 281 433 290 418 268 Z' },
        { id: 'diagnostic', name: 'Diagnosztikai karzat', kind: 'Mérés', at: [127, 132], text: 'A plazma hőterhelését és a mező ingadozásait követő műszerállomás. A hőmérséklet nagyságrendi becslése meghaladja a százmillió kelvint; a kvantumállapot nem állandó.', contour: 'M45 153 L177 113 L212 127 L82 176 Z' },
        { id: 'shutters', name: 'Optikai zsalurendszer', kind: 'Sugárzásvédelem', at: [828, 117], text: 'Többrétegű szűrőrendszer a közvetett megfigyeléshez. Nyitott optikai útvonalon a mag fénye maradandó szemkárosodást okoz.', contour: 'M716 135 L747 40 L820 10 L938 70 L945 156 L890 188 Z' },
        { id: 'feed', name: 'Betápláló vezeték', kind: 'Kapcsolat / erőd', at: [306, 505], text: 'A Forbidden Fortress áldozati kamrájából érkező részecskeáram zárt csatornája. A vezeték az alsó indukciós csatlakozónál lép be a plazmaoszlopba.', contour: 'M130 541 L303 478 L361 466 L390 449 L456 432 L484 459 L471 473 L412 483 L384 506 L321 516 L151 559 Z' },
        { id: 'service', name: 'Szervizgépház', kind: 'Karbantartás', at: [784, 400], text: 'A burkolatok és mezőhatárolók kiszolgáló géptere. A személyzet az elkülönített karzatrendszeren közlekedik; a belső tengelybe nincs nyitott átjárás.', contour: 'M681 415 L784 367 L888 414 L790 459 Z' }
      ],
      flows: [
        { d: 'M119 555 L307 497 L355 484 L403 467 L475 451 Q492 446 498 427 L498 0', duration: 16 },
        { d: 'M440 231 C390 218 380 252 406 269 C445 295 552 291 574 267 C591 246 565 231 548 231', color: 'silver orbit', duration: 27 }
      ]
    },
    core: {
      title: 'Magcsarnok', latin: 'NUCLEI / MODERATIO', code: '03',
      level: 'Középső toronyszakasz / három mag',
      lead: 'Három összekapcsolt mag szabályozza a torony működését. Az irányító mag határozza meg a kibocsátás irányát, a hangoló mag a koronagyűrűket, az erőforrás mag a betáplált töltést kezeli.',
      note: ['Galaktikus jel', 'A kibocsátást Navigátorok és Astropathák érzékelik. Az Astronomicon a lakott világokra érzelmeket befolyásoló, loyalista üzeneteket is továbbít.'],
      stats: [['Magok', '3 összekapcsolt egység'], ['Hangolás', 'Koronagyűrűk'], ['Energiaforrás', 'Psyker-részecskék'], ['Jel', 'Navigátor / Astropatha']],
      links: ['overview', 'plasma', 'warp'],
      rooms: [
        { id: 'command', name: 'Irányító mag', kind: 'Irányítás', at: [502, 249], text: 'A központi mag szabályozza az Astronomicon kibocsátásának irányát és összehangolja a kapcsolódó rendszereket. Tengelye a függőleges részecskecsatornához kapcsolódik.', contour: 'M355 255 C334 209 377 142 438 123 C508 101 584 148 617 216 C650 285 610 335 534 340 C450 348 382 310 355 255 Z' },
        { id: 'tuning', name: 'Hangoló mag', kind: 'Mezőszabályozás', at: [229, 118], text: 'A koronagyűrűk összehangolását végző egység. A gyűrűrendszer beállítása szabályozza a toronyból kilépő warpmező terjedését.', contour: 'M167 148 C150 113 182 66 214 48 C240 34 278 47 290 83 C309 133 280 190 249 197 C208 207 176 185 167 148 Z' },
        { id: 'resource', name: 'Erőforrás mag', kind: 'Töltéskezelés', at: [755, 390], text: 'A napi betáplálásból érkező warp-részecskék töltését fogadja és elosztja. A részecskecsatornák az irányító maghoz és a felső kibocsátó rendszerhez vezetik az áramot.', contour: 'M648 389 C629 354 659 310 699 299 C745 283 787 307 818 345 C847 382 840 429 805 455 C765 484 679 450 648 389 Z' },
        { id: 'corona', name: 'Koronacsatoló', kind: 'Felső kapcsolat', at: [757, 94], text: 'A magcsarnokot a felső koronagyűrűkkel összekötő szerkezeti és energetikai csatlakozás. A hangolt jel innen jut a felső szakaszba.', contour: 'M704 86 L762 42 L825 76 L826 102 L773 132 L704 112 Z' },
        { id: 'choir', name: 'Jelmegfigyelő karzat', kind: 'Felügyelet', at: [190, 424], text: 'A kibocsátási adatok és az egységek összhangjának megfigyelésére szolgáló állomás. A munkahelyeket a magtértől külön szerkezeti és optikai réteg választja el.', contour: 'M81 438 L180 392 L281 426 L183 478 Z' }
      ],
      flows: [
        { d: 'M377 223 C354 150 451 90 524 139 C601 190 652 309 560 330 C472 350 398 286 377 223 Z', color: 'orbit', duration: 37 },
        { d: 'M184 126 C182 74 244 39 271 92 C296 144 260 200 222 187 C193 177 184 148 184 126 Z', color: 'silver orbit', duration: 53, reverse: true },
        { d: 'M662 375 C661 330 705 301 747 315 C799 332 838 389 815 426 C793 464 721 462 680 415 C668 401 662 386 662 375 Z', color: 'orbit', duration: 29 },
        { d: 'M800 414 L684 336 L527 260 L500 159 L500 5', duration: 19 }
      ]
    },
    warp: {
      title: 'Warpzóna', latin: 'CORONA / LIMEN IMMATERIUM', code: '04',
      level: 'Felső toronyszakasz / anyagi határ',
      lead: 'A felső koronagyűrűk fölött a torony anyagi szerkezete fokozatosan megszakad. A részecskeáram a warpba lép, majd a koronák által meghatározott irányokban távozik.',
      note: ['Folyamatos kibocsátás', 'A torony naponta feltöltött részecskeállománya a galaxisba áramlik, fenntartva a warp jelenlétét. Az anyagi határon túli távolság és helyzet nem határozható meg hagyományos térbeli méréssel.'],
      stats: [['Anyagi magasság', '888 km'], ['Felső tér', 'Warp'], ['Kibocsátás', 'Folyamatos'], ['Határon túli távolság', 'Nem meghatározható']],
      links: ['overview', 'core'],
      rooms: [
        { id: 'coronas', name: 'Felső koronagyűrűk', kind: 'Mezőirányítás', at: [686, 253], text: 'Egymás fölé rendezett gyűrűk szabályozzák a warpmező kilépését. A gyűrűk a magcsarnok hangolt jelét továbbítják a felső kibocsátási felületre.', contour: 'M188 240 C128 275 197 321 397 335 Q670 355 803 273 L814 248 Q769 327 412 319 Q184 307 204 249 Z' },
        { id: 'outlet', name: 'Kibocsátási tengely', kind: 'Warp-részecskék', at: [478, 105], text: 'A központi aranyló részecskeáram kilépési pontja. A felső tengelyen az anyagi burkolat elvékonyodik, majd a kontúrok folytonossága megszűnik.', contour: 'M457 172 L469 88 L477 23 L487 88 L496 174 Q477 185 457 172 Z' },
        { id: 'boundary', name: 'Anyagi határ', kind: 'Warpzóna', at: [650, 65], text: 'A határ felett az építmény anyagi körvonala már nem folytonos. A szerkezeti pontok közötti hagyományos távolságmérés itt nem ad állandó eredményt.', contour: 'M109 125 Q297 13 566 26 Q739 26 816 75 L815 99 Q662 42 424 62 Q228 78 141 156 Z' },
        { id: 'sensors', name: 'Orbitális mérőállomás', kind: 'Külső felügyelet', at: [872, 106], text: 'A koronagyűrűk külső terének elkülönített mérőpontja. A torony felé futó csatolások a kibocsátási rendszer állapotjelét továbbítják.', contour: 'M833 101 Q835 89 872 88 Q909 90 912 105 L909 114 Q875 137 837 117 Z' },
        { id: 'coupling', name: 'Külső csatoló', kind: 'Energiaátvitel', at: [881, 343], text: 'A koronák és a torony külső műszaki hálózata közötti kapcsolat. Az egység a felső gyűrűk energiaellátásának és felügyeletének része.', contour: 'M848 345 L874 319 Q889 313 916 331 L923 353 L897 382 L872 373 Z' },
        { id: 'platform', name: 'Műszerplatform', kind: 'Szerviz és mérés', at: [155, 441], text: 'A felső szerkezeti öv műszerállomása. Az összekötő hidak a koronák külső tartószerkezetéhez csatlakoznak; a központi tengelyhez nincs nyitott hozzáférés.', contour: 'M42 423 C42 395 108 383 154 390 C226 391 276 419 267 444 Q211 497 91 474 Z' }
      ],
      flows: [
        { d: 'M478 554 L478 194 C478 159 476 149 478 111 C480 87 495 70 477 44 C460 22 491 11 519 1', duration: 20 },
        { d: 'M317 142 C303 168 385 201 483 202 C579 203 661 168 655 151 C649 129 609 120 582 119', color: 'orbit', duration: 42 },
        { d: 'M530 141 C667 169 766 139 867 111', color: 'silver', duration: 25 }
      ],
      overlay: '<defs><linearGradient id="warpFade" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#020b15" stop-opacity="0"/><stop offset="1" stop-color="#02060c" stop-opacity=".76"/></linearGradient></defs><path fill="url(#warpFade)" d="M0 0H1000V140H0Z"/><path class="warp-boundary" d="M85 123 C293 6 675 6 818 99"/><text class="axis-caption" x="100" y="42">WARPTÉR / ANYAGI HATÁRON TÚL</text>'
    }
  };

  // The height axis is proportional; atmospheric layers stay close to the base.
  const altitude = km => 448 - (436 * km / 888);
  const ticks = [0, 100, 300, 500, 700, 888].map(km => `<path class="altitude-line" d="M74 ${altitude(km)}h10"/><text class="altitude-label" x="64" y="${altitude(km) + 4}" text-anchor="end">${km}</text>`).join('');
  scenes.overview.overlay = `<path class="altitude-line" d="M79 12V448"/>${ticks}<text class="axis-caption" x="39" y="478">km</text><path class="atmosphere-line" d="M85 ${altitude(50)}H450M85 ${altitude(12)}H450"/><path class="altitude-line" d="M145 ${altitude(12)}V${altitude(50)}L177 414"/><text class="axis-caption" x="181" y="415">SZTRATOSZFÉRA · 12–50 km</text>`;

  const aliases = { total: 'overview', base: 'fortress', lower: 'plasma', middle: 'core', upper: 'warp' };
  const config = { name: 'Astronomicon', noteLabel: 'Műszaki feljegyzés', sectionLabel: 'Szakasz', chartCode: 'AST', overviewLabel: 'Szakaszok és védelem', scenes, assetRoot, aliases };
  if (typeof module !== 'undefined' && module.exports) {
    const viewer = require('./terra-ostroma-atlas.js');
    module.exports = { ...viewer, ...config, resolveScene: id => viewer.resolveScene(id, scenes, aliases) };
  }
  if (typeof window !== 'undefined') window.TerraAtlasConfig = config;
})();

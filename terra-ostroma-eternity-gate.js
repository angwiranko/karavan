(() => {
  'use strict';
  const assetRoot = 'images/terra-ostroma/eternity-gate/';
  // All anchors and contours use the same 1000 x 562.5 image coordinate space.
  const scenes = {
    overview: {
      title: 'Imperiális Palota', latin: 'PALATIUM IMPERIALIS', code: '00', level: 'Felszín + alsóváros',
      lead: 'A Himalája hegyvonulatai közé zárt birodalmi erődváros. A külső kaputól a szakrális tengely vezet az Arany Trónusig.',
      note: ['Palotatengely', 'Négy felszíni körzet, egy föld alatti világ. Az Alsóváros a palota alatt ágazik el; a Végtelen Kapuja közvetlenül a tróntermet zárja.'],
      links: ['outer', 'undercity'],
      rooms: [
        { id: 'outer', name: 'Külső kapu', at: [143, 399], label: [21, 302], target: 'outer', kind: 'Felszíni körzet' },
        { id: 'city', name: 'Belső város', at: [427, 213], label: [321, 122], target: 'city', kind: 'Felszíni körzet' },
        { id: 'undercity', name: 'Alsóváros', at: [531, 427], label: [659, 493], target: 'undercity', kind: 'Föld alatti körzet' },
        { id: 'gate', name: 'Végtelen Kapuja', at: [711, 130], label: [617, 61], target: 'gate', kind: 'A trónterem főkapuja' },
        { id: 'throne', name: 'Arany Trónus', at: [897, 139], label: [812, 55], target: 'throne', kind: 'Belső szentély' }
      ],
      flows: []
    },
    outer: {
      title: 'Külső kapu', latin: 'PORTA EXTERIOR', code: '01', level: 'Külső védelmi öv',
      lead: 'A palota első küszöbe. A hegyoldali védművek között érkező küldöttségeket elkülönített fogadócsarnokban tartják vissza.',
      note: ['Belépési rend', 'A külső őrség ellenőrzi az áthaladást. Az audiencia és a katonai forgalom a kapu után külön útvonalra tér.'],
      links: ['city', 'overview'],
      rooms: [
        { id: 'entrance', name: 'Kapuzsilip', at: [350, 281], kind: 'Beléptetés', text: 'Kettős ellenőrzés a kapuhíd végén. A zsilip lezárásakor a külső híd és a belső udvar egymástól függetlenül tartható.', contour: '' },
        { id: 'audience', name: 'Audienciaterem', at: [650, 309], kind: 'Diplomácia', text: 'Oszlopos fogadóterem a küldöttségek és kérelmezők számára. A karzatról a teljes csarnok belátható; a belső kijárat az őrségi ellenőrzőponthoz vezet.', contour: '' },
        { id: 'checkpoint', name: 'Őrségi ellenőrzőpont', at: [700, 169], kind: 'Biztonság', text: 'Az audiencia utáni továbbhaladást a kapuőrség engedélyezi. Az iratok, pecsétek és kísérők ellenőrzése itt történik.', contour: '' },
        { id: 'barracks', name: 'Kapubástya és barakkok', at: [400, 422], kind: 'Helyőrség', text: 'A kapu védőinek körletei, fegyverkamrái és készenléti állásai. A szolgálati folyosó közvetlenül a kapuszerkezet alá vezet.', contour: '' },
        { id: 'shields', name: 'Pajzskapcsoló', at: [220, 141], kind: 'Védelmi gépészet', text: 'A hegyoldali védművek pajzselosztója. A hozzá kapcsolt vezetékeket a sziklába mélyített karbantartó járatok védik.', contour: '' }
      ], flows: []
    },
    city: {
      title: 'Belső város', latin: 'CIVITAS INTERIOR', code: '02', level: 'Belső palotaöv',
      lead: 'Katedrálisok, kerengők és palotaszárnyak sűrű szövete. A ceremoniális főút felett tornyok, alatta régi levéltárak és lezárt járatok húzódnak.',
      note: ['Belső tengely', 'A kerengők a Végtelen Kapujához vezetnek. A szolgálati felvonók az Alsóváros gépészeti és irattári körzeteit kötik össze a felszínnel.'],
      links: ['outer', 'undercity', 'gate'],
      rooms: [
        { id: 'archive', name: 'Levéltár', at: [280, 309], kind: 'Administratum', text: 'Többszintes irattári galériák, pecsétes okiratok és elfeledett palotatérképek. A mélyebb gyűjteményekhez az Alsóváros adatkriptája csatlakozik.', contour: '' },
        { id: 'court', name: 'Processziós udvar', at: [510, 290], kind: 'Szakrális útvonal', text: 'A belső palota ceremoniális találkozópontja. Innen a főút a Végtelen Kapujához, az oldalsó kerengők a levéltárhoz és a kápolnához vezetnek.', contour: '' },
        { id: 'chapel', name: 'Belső kápolna', at: [460, 141], kind: 'Ecclesiarchia', text: 'Bordás boltozatok alatt álló szentély, oldalsó relikviafülkékkel. A sekrestye mögött keskeny szolgálati átjáró marad szabadon.', contour: '' },
        { id: 'palace', name: 'Palotaszárnyak', at: [720, 293], kind: 'Belső körletek', text: 'Elzárt lakó- és hivatali termek, őrzött kerengőkkel. Több kisebb mellékhelyiség besorolása hiányzik az irattári jegyzékből.', contour: '' },
        { id: 'descent', name: 'Alsóvárosi felvonó', at: [520, 439], kind: 'Függőleges kapcsolat', text: 'A felszíni ellátóudvart köti össze a kábelkatedrális és az adatkripta szolgálati szintjeivel.', contour: '' }
      ], flows: []
    },
    undercity: {
      title: 'Alsóváros', latin: 'SUBSTRUCTURA IMPERIALIS', code: '03', level: 'Föld alatti szintek',
      lead: 'A palota gépészeti gyökérzete. Boltozatos aknák, kábelkötegek és csendmezők között régebbi városrétegek maradványai rejtőznek.',
      note: ['Mélységi hálózat', 'Az Alsóváros a Belső város alatti külön ág. Energia- és adatvezetékei a trón fenntartó rendszereihez futnak, de nem jelentenek szabad bejárást a trónterembe.'],
      links: ['city', 'overview'],
      rooms: [
        { id: 'cables', name: 'Kábelkatedrális', at: [350, 253], kind: 'Energiaelosztás', text: 'Tartópillérek közé függesztett, monumentális vezetéknyalábok. A galériák a kapcsolószentélyeket és a mélyebb reaktorszintet szolgálják ki.', contour: '' },
        { id: 'crypt', name: 'Adatkripta', at: [700, 180], kind: 'Tiltott irattár', text: 'A felszíni levéltár mélyraktára: adatoltárok, elkülönített memóriarekeszek és lezárt iratkamrák. Külön szolgálati ág kapcsolja a felvonóhoz.', contour: '' },
        { id: 'sisters', name: 'Sisters of Silence', at: [700, 349], kind: 'Csendmező', text: 'Elkülönített őrségi kerengő és nullkamrák. A csendmező a pszichés szivárgást határolja le a környező gépészeti szintektől.', contour: '' },
        { id: 'reactor', name: 'Psi-fúziós reaktor', at: [260, 416], kind: 'Energiaellátás', text: 'Mélyre süllyesztett erőforrás, leválasztható hőelvezető és elosztóágakkal. A kábelkatedrális innen kapja a fenntartó energiát.', contour: '' },
        { id: 'stasis', name: 'Stasis-kamrák', at: [500, 439], kind: 'Elkülönítés', text: 'Függetlenül lezárható kamrasorok a mélységi folyosó mellett. A névtelen szomszédos fülkék állapotáról nincs bejegyzés.', contour: '' },
        { id: 'shaft', name: 'Felszíni akna', at: [420, 101], kind: 'Függőleges kapcsolat', text: 'Őrzött felvonóakna a Belső város felé. Külön szinteken nyílik az irattári és a gépészeti forgalom számára.', contour: '' }
      ], flows: []
    },
    gate: {
      title: 'Végtelen Kapuja', latin: 'PORTA AETERNA', code: '04', level: 'A trónterem közvetlen főkapuja',
      lead: 'Aranyba foglalt, monumentális zár a palota szívében. Mögötte már az Arany Trónus csarnoka kezdődik.',
      note: ['Utolsó küszöb', 'A Végtelen Kapuja közvetlenül a trónterem előtt áll. Nincs újabb városnegyed vagy külön főkapu a két helyszín között.'],
      links: ['city', 'throne'],
      rooms: [
        { id: 'doors', name: 'Arany kapuszárnyak', at: [550, 225], kind: 'Főzár', text: 'Egymásba záródó, szakrális domborművekkel borított kapuszárnyak. A belső zárnyelvek a teljes faltestet átfogó szerkezethez csatlakoznak.', contour: '' },
        { id: 'custodes', name: 'Custodes záróvonal', at: [300, 360], kind: 'Őrzött megközelítés', text: 'A kapu előtti híd és az oldalsó őrfülkék közös védelmi sávja. A két oldali állások a teljes megközelítést ellenőrzik.', contour: '' },
        { id: 'silence', name: 'Csendmező határa', at: [660, 399], kind: 'Pszichés elhatárolás', text: 'A küszöb előtti elhatároló sáv a palota csendmező-hálózatához kapcsolódik. A mező fenntartását elkülönített szolgálati helyiségek támogatják.', contour: '' },
        { id: 'seals', name: 'Pecsétgépház', at: [770, 366], kind: 'Kapugépészet', text: 'A mechanikus zárak és a szakrális pecsétek kapcsolókamrája. A csatornák közvetlenül a kapu oldalsó pillérében futnak.', contour: '' },
        { id: 'vestibule', name: 'Tróntermi küszöb', at: [790, 214], kind: 'Belső átjáró', text: 'A kapu belső oldalán nyíló utolsó előtér, közvetlen kapcsolattal az Arany Trónus csarnokához.', contour: '' }
      ], flows: []
    },
    throne: {
      title: 'Arany Trónus', latin: 'THRONUS AUREUS', code: '05', level: 'Legbelső szentély',
      lead: 'Szakrális gép és birodalmi középpont. A trón lépcsőzete alatt kábelek, csatlakozókamrák és fenntartó rendszerek sűrűsödnek.',
      note: ['Belső szentély', 'Az energia a mélyebb gépészeti szintekről érkezik. A trón mögötti Webway határfelületét a csarnok fenntartó és elhatároló rendszerei veszik körül.'],
      links: ['gate', 'overview'],
      rooms: [
        { id: 'throne-core', name: 'Arany Trónus', at: [500, 253], kind: 'Szakrális központ', text: 'A lépcsőzetes emelvényen álló trón a teljes csarnok gépészeti fókusza. A vezetékek az alatta futó csatornákban egyesülnek.', contour: '' },
        { id: 'webway', name: 'Webway határfelület', at: [720, 152], kind: 'Warpmező', text: 'A trón mögötti tér idegen határfelülete. A lilás vonalak a mező alakját jelölik; a palota fizikai szerkezetétől külön kezelendő.', contour: '' },
        { id: 'guard', name: 'Hetaeron őrgaléria', at: [250, 253], kind: 'Belső őrség', text: 'A szentélyt övező, emelt őrjárati szint. Innen a trón megközelítése és az alsó gépészeti kijáratok egyaránt felügyelhetők.', contour: '' },
        { id: 'lifeline', name: 'Fenntartó gépészet', at: [300, 405], kind: 'Energiaellátás', text: 'A kábelkatedrálisból érkező fővezetékek fogadó- és elosztókamrái. A csarnok alatt önálló karbantartó folyosó fut.', contour: '' },
        { id: 'sarcophagi', name: 'Koporsócsatlakozók', at: [670, 411], kind: 'Stasis-rendszer', text: 'Elkülönített csatlakozórekeszek és stasis-állások. A helyi vezetéknyalábok a trón központi fenntartó rendszerébe futnak.', contour: '' },
        { id: 'null', name: 'Nullmező kamrája', at: [800, 321], kind: 'Pszichés elhatárolás', text: 'A szentély oldalában kialakított külön kamra, a csendmező belső határán. Hozzáférése elválik a fő megközelítéstől.', contour: '' }
      ], flows: []
    }
  };

  // Traced from the final 1672 x 941 artwork. Keeping source-image coordinates
  // together prevents hotspots, architectural masks and animated cables drifting apart.
  const geometry = {
    overview: {
      outer: [[275, 658], [[244, 722], [243, 607], [259, 581], [279, 566], [307, 611], [313, 684], [313, 707]]],
      city: [[771, 413], [[704, 433], [704, 352], [734, 305], [777, 280], [836, 303], [863, 350], [863, 411], [795, 448]]],
      undercity: [[876, 748], [[641, 784], [1113, 573], [1245, 626], [921, 823], [733, 893], [641, 864]]],
      gate: [[1190, 285], [[1146, 365], [1146, 267], [1155, 217], [1181, 181], [1190, 176], [1212, 208], [1246, 275], [1254, 306], [1254, 393]]],
      throne: [[1496, 238], [[1434, 271], [1434, 215], [1447, 189], [1486, 199], [1494, 189], [1537, 207], [1546, 256], [1505, 283]]]
    },
    outer: {
      entrance: [[673, 422], [[622, 492], [622, 374], [639, 333], [667, 302], [692, 341], [717, 402], [732, 458], [732, 541]]],
      audience: [[1288, 552], [[1094, 540], [1227, 478], [1295, 515], [1354, 543], [1437, 560], [1453, 587], [1388, 618], [1267, 665], [1153, 608]]],
      checkpoint: [[1255, 157], [[1114, 161], [1268, 99], [1429, 173], [1286, 238]]],
      barracks: [[868, 801], [[688, 823], [823, 762], [1043, 862], [911, 924]]],
      shields: [[259, 285], [[156, 286], [251, 240], [349, 285], [400, 319], [428, 337], [402, 359], [304, 383], [237, 357]]]
    },
    city: {
      archive: [[440, 577], [[130, 548], [350, 451], [349, 424], [497, 361], [548, 386], [548, 532], [632, 570], [504, 643], [507, 678], [368, 742], [238, 681], [132, 577]]],
      court: [[1018, 555], [[871, 548], [984, 497], [1120, 556], [1008, 610]]],
      chapel: [[727, 268], [[608, 352], [608, 143], [732, 95], [831, 141], [831, 280], [754, 330], [754, 350], [657, 395]]],
      palace: [[1290, 444], [[1136, 445], [1350, 351], [1468, 408], [1342, 466], [1385, 485], [1283, 531], [1168, 483]]],
      descent: [[817, 739], [[771, 882], [771, 554], [818, 532], [857, 550], [857, 883], [815, 904]]]
    },
    undercity: {
      cables: [[457, 381], [[248, 466], [250, 316], [276, 274], [304, 264], [420, 212], [463, 165], [542, 183], [584, 166], [644, 204], [668, 264], [668, 449], [378, 552]]],
      crypt: [[1223, 249], [[1073, 213], [1178, 164], [1407, 266], [1284, 323]]],
      sisters: [[1280, 533], [[1130, 501], [1286, 431], [1430, 499], [1430, 548], [1282, 615], [1141, 550]]],
      reactor: [[286, 723], [[204, 754], [204, 647], [223, 610], [283, 590], [333, 607], [355, 642], [355, 756], [314, 780], [262, 781]]],
      stasis: [[867, 739], [[620, 778], [1067, 578], [1190, 638], [738, 846]]],
      shaft: [[733, 158], [[700, 240], [700, 22], [733, 0], [777, 18], [777, 244], [744, 267]]]
    },
    gate: {
      doors: [[863, 382], [[784, 540], [784, 319], [789, 277], [809, 230], [836, 187], [864, 155], [897, 195], [928, 249], [950, 304], [963, 365], [963, 613]]],
      custodes: [[462, 552], [[375, 553], [497, 500], [563, 531], [462, 579]]],
      silence: [[976, 706], [[892, 682], [979, 645], [1111, 705], [1026, 744]]],
      seals: [[1455, 620], [[1279, 678], [1420, 612], [1444, 622], [1464, 588], [1532, 556], [1639, 606], [1479, 687], [1402, 724]]],
      vestibule: [[1349, 346], [[1192, 334], [1348, 263], [1491, 327], [1331, 400]]]
    },
    throne: {
      'throne-core': [[1021, 257], [[893, 353], [916, 329], [944, 315], [970, 306], [976, 239], [1013, 211], [1049, 246], [1049, 310], [1105, 341], [1080, 359], [1008, 377], [925, 374]]],
      webway: [[1206, 135], [[1092, 0], [1357, 0], [1348, 170], [1337, 261], [1303, 320], [1244, 346], [1168, 309], [1135, 223], [1121, 143]]],
      guard: [[419, 414], [[184, 532], [506, 388], [563, 414], [246, 558]]],
      lifeline: [[518, 697], [[296, 751], [545, 644], [697, 711], [697, 756], [452, 865], [305, 795]]],
      sarcophagi: [[1226, 732], [[1015, 721], [1124, 672], [1305, 751], [1351, 732], [1411, 760], [1238, 842]]],
      null: [[1414, 547], [[1325, 533], [1398, 500], [1487, 541], [1466, 551], [1530, 580], [1444, 619], [1333, 567]]]
    }
  };
  const sx = x => x * 1000 / 1672;
  const sy = y => y * 562.5 / 941;
  for (const [sceneId, rooms] of Object.entries(geometry)) {
    for (const [roomId, [anchor, polygon]] of Object.entries(rooms)) {
      const room = scenes[sceneId].rooms.find(item => item.id === roomId);
      room.at = [sx(anchor[0]), sy(anchor[1])];
      room.contour = polygon.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`).join(' ') + ' Z';
    }
  }
  function cable(commands, color = '') {
    return { color, d: commands.map(([command, ...coords]) => `${command}${coords.map((value, index) => (index % 2 ? sy(value) : sx(value)).toFixed(2)).join(' ')}`).join(' ') };
  }
  scenes.overview.flows = [
    cable([['M', 1150, 366], ['L', 1150, 270], ['Q', 1150, 222, 1190, 180], ['Q', 1248, 245, 1251, 304], ['L', 1251, 392]]),
    cable([['M', 1441, 264], ['L', 1480, 281], ['L', 1513, 281], ['L', 1547, 263]]),
    cable([['M', 1517, 77], ['C', 1613, 18, 1644, 182, 1584, 213], ['C', 1550, 230, 1513, 199, 1540, 166]], 'violet')
  ];
  scenes.outer.flows = [
    cable([['M', 626, 493], ['L', 626, 377], ['Q', 633, 334, 667, 306], ['Q', 720, 379, 729, 463], ['L', 729, 534]]),
    cable([['M', 145, 375], ['L', 205, 406], ['Q', 230, 425, 217, 452], ['L', 214, 493]])
  ];
  scenes.city.flows = [
    cable([['M', 778, 876], ['L', 778, 575], ['L', 817, 554], ['L', 850, 570], ['L', 850, 874]]),
    cable([['M', 258, 565], ['L', 451, 480], ['L', 451, 465], ['L', 500, 442]], 'silver')
  ];
  scenes.undercity.flows = [
    cable([['M', 277, 349], ['C', 326, 353, 382, 402, 453, 385], ['Q', 510, 375, 525, 345], ['L', 525, 333]]),
    cable([['M', 429, 193], ['L', 451, 202], ['C', 493, 226, 489, 261, 529, 304], ['C', 582, 353, 647, 318, 650, 287]]),
    cable([['M', 1142, 528], ['L', 1282, 589], ['L', 1425, 525], ['L', 1286, 463], ['L', 1142, 528]], 'silver')
  ];
  scenes.gate.flows = [
    cable([['M', 793, 536], ['L', 793, 318], ['Q', 800, 243, 864, 166], ['Q', 954, 272, 954, 370], ['L', 954, 602]]),
    cable([['M', 1109, 675], ['L', 1189, 711], ['Q', 1216, 727, 1242, 717], ['L', 1284, 697]]),
    cable([['M', 1255, 735], ['Q', 1254, 755, 1276, 745], ['L', 1367, 705], ['L', 1377, 658]])
  ];
  scenes.throne.flows = [
    cable([['M', 525, 751], ['L', 454, 782], ['C', 393, 809, 346, 778, 378, 738], ['L', 484, 689], ['L', 603, 632], ['Q', 658, 601, 710, 601], ['Q', 779, 605, 780, 563], ['L', 780, 544], ['Q', 779, 518, 800, 505], ['L', 897, 395], ['L', 971, 355]]),
    cable([['M', 1162, 786], ['L', 1109, 762], ['Q', 1098, 755, 1100, 738], ['L', 1100, 718], ['Q', 1100, 705, 1118, 697]]),
    cable([['M', 1173, 26], ['C', 1239, -8, 1294, 100, 1225, 127], ['C', 1177, 148, 1151, 91, 1190, 69], ['C', 1219, 53, 1246, 95, 1220, 101]], 'violet'),
    cable([['M', 1151, 142], ['C', 1257, 270, 1349, 181, 1315, 53]], 'violet')
  ];

  const aliases = { defense: 'outer', battlement: 'outer', processional: 'city', sanctum: 'city', dungeon: 'undercity' };

  const config = { scenes, assetRoot, aliases, name: 'Eternity Gate' };
  if (typeof module !== 'undefined' && module.exports) {
    const viewer = require('./terra-ostroma-atlas.js');
    module.exports = { ...viewer, scenes, assetRoot, resolveScene: id => viewer.resolveScene(id, scenes, aliases) };
  } else {
    window.TerraAtlasConfig = config;
  }
})();

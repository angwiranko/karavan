# White Mountain Prison: generation prompts

Generated with the built-in image generation tool. Four individual calls; no CLI fallback. Existing reference images were not modified.

## Overview

Output: `overview.png`

References (relative to repository root):
- `images/terra-ostroma/eternity-gate/overview.png`
- `images/terra-ostroma/astronomicon/fortress.png`

```text
Use case: infographic-diagram.
Asset type: one high-resolution 16:9 raster plate for a professional interactive architectural atlas in a Warhammer 40,000 tabletop campaign.
Primary request: TOTAL OVERVIEW of WHITE MOUNTAIN PRISON, a vast secret prison beneath the Antarctic Inquisition fortress. This is a NEW location, not the palace or the Astronomicon.
Input images: Image 1 is the existing Eternity Gate atlas overview, STYLE REFERENCE ONLY. Image 2 is the existing Astronomicon fortress cutaway, STYLE AND TECHNICAL DETAIL REFERENCE ONLY. Match their exquisite fine engraved steel-blue / ice-white architectural linework, near-black midnight-navy background, restrained antique-gold active infrastructure, orthographic axonometric cutaway, precise gothic engineering and subtly shaded faces. Do NOT copy their buildings, towers or layouts.

Scene and composition: an immense continuous carved ice-and-bedrock wedge, front and right walls removed so the connected underground prison is visible in several descending terraces. A crisp Antarctic ice cap with polygonal contour lines occupies only the upper 15 percent; a compact heavily buttressed Inquisition citadel and a recessed shuttle landing apron are visible at the top. The prison itself occupies 80 percent of the image. Camera from above front-right, orthographic isometric view, no fisheye. All districts must be fully within the frame with narrow margins. Clearly legible architectural hierarchy, highly detailed but separated districts, no exploded floating platforms.

Fixed spatial layout for the atlas:
A. Upper-left, beneath the landing apron: sealed prisoner intake, a sequential pair of gate airlocks, reception / registry, quarantine rooms, infirmary and four small interrogation chambers. A guarded transfer corridor feeds a central vertical elevator spine. A separate parallel service lift and utility duct descend alongside it.
B. Upper-middle / upper-right: ARGOS, one central cylindrical surveillance and control chamber with a faceted observation lantern, concentric consoles and a narrow gold data conduit linking the whole prison. Immediately adjacent: a small Castellan office, an archive of documents, and a geometrically ordered object-storage 'silent archive', isolated beside null-field generator pylons. Rectangular cell wings, watch stations, barracks and armoury branch off exact corridor nodes.
C. Middle-left: two enclosed residential simulation vaults. Largest oval dome is cut open, revealing a strangely orderly miniature residential district with little terraced houses, a square, a small chapel, covered paths, communal dining and a clinic; a smaller duplicate neighbourhood sits behind. Vault ribs and gridded false-sky canopy reveal that this is underground. Perimeter maintenance corridors are visible behind thick outer walls. Residential architecture remains imperial gothic, not modern suburbia.
D. Lower-middle / right: a deep semi-stasis honeycomb ward, recognisable stacked hexagonal containment modules with closed opaque medical capsules, circular maintenance rings, service galleries and small rehabilitation / observation rooms. No bodies, children or violence depicted.
E. Deepest bottom-right: the stasis isolation vault, a separate square vault within two containment shells. Three or four heavily separated opaque containment chambers accessed through paired vestibules, with one gold-rimmed sealed central capsule. Connect to the main lift through a narrow physically continuous guarded bridge, not floating lines.
F. Bottom-left and rear edge: heat exchangers, paired cooling tanks, water reclamation, air handling, waste sterilisation, servitor repair, power distribution. Utility lines form a separate coherent service network around the detention zones. Include a few small unlabeled empty reserve rooms.

Connectivity is paramount: bridges land on actual door openings at exactly matching floor heights; ramps and stairs meet floor slabs; corridors pass through clearly cut openings rather than walls; lift doors line up with each floor; pipe joints meet tangentially, never terminate randomly. Continuous strong structural supports carry the terraces. Detention circulation, staff circulation, and services have distinct but geometrically consistent paths. Fine antique-gold accents mark the central ARGOS network and transfer spine, not every surface.
Use subtle blue-grey gradients on the ice / rock strata and volumetric architectural faces to suggest depth while preserving the reference's clean line-drawing language. No neon, no fog, no lens flare, no glow blobs, no fantasy monsters, no exposed victims, no blood.
Text: NONE. No title, labels, annotations, numbers, UI, legend, border or watermark baked into the image. This plate will receive sharp live labels separately. Output one complete polished wide image, not a collage or multi-panel sheet.
```

## Intake and ARGOS

Output: `intake-argos.png`

References (relative to repository root):
- `images/terra-ostroma/white-mountain/overview.png`

```text
Use case: infographic-diagram.
Asset type: a single detailed 16:9 architectural atlas plate, matching the attached master overview of WHITE MOUNTAIN PRISON.
Input image: master prison overview, the authoritative design and spatial reference. Generate a CLOSE-UP of only its UPPER PRISON TERRACES: intake, ARGOS supervision, records and null-containment. Do not simply reproduce the complete overview. Zoom in around 2.5x and redraw the same section with the roofs and front walls selectively cut away to reveal properly planned interiors.
Preserve the master’s layout: the recessed shuttle apron / docking bay at upper-left; intake below it; the ornate double elevator spine to their right at about 40 percent image width; ARGOS as a cylindrical observation room to the right of that spine; the archive wing further right and null-field pylons at the far right. Include only a slim ice ceiling and a partial citadel base at the top. The residential domes, honeycomb and deep isolation districts are off-frame below. They must not be drawn here.

Architectural detail to add logically inside these established masses:
LEFT INTAKE: one compact cargo / prisoner transfer hangar, sequential sealed external and internal vestibules, intake registry with orderly desk rows, medical screening, two independent quarantine rooms, clean infirmary, personal-effects lockers, guard post and four individual interrogation rooms branching from a straight secured hall. Door openings visibly align across the hall; each room has believable furnishings. At least three small empty reserve rooms.
CENTER: split prisoner and personnel elevators with repeated stopping platforms and distinct doors; a short checkpoint bridge to ARGOS. ARGOS is one large circular/octagonal surveillance chamber, not a monster or floating eye: central instrument dais, stepped concentric consoles, observation window rings and an upper service gallery. Adjacent one small Castellan office with a substantial ornate command chair and archive cabinets, a watch room, barracks and armoury separated from detention circulation.
RIGHT ARCHIVES: an ordinary document / evidence archive with aisles, followed by a separately airlocked SILENT ARCHIVE where shelves contain geometrically arranged plain physical objects and blocks rather than books or writing. The silent archive sits next to three shielded null-field pylons and their control alcove. Below them, a conventional cell wing with individual doors and a continuous external guard gallery.
BACKSTAGE: independent ventilation, air filtration, water lines, sealed waste handling and electrical risers continue behind rooms and into the service shaft, never across prisoner walking paths.

Keep the same exquisite engraved steel-blue and pale ice-white lines, midnight-navy backdrop, restricted antique-gold circuits and structural highlights, subtly shaded gradient planes and icy rock wireframe. Orthographic axonometric technical cutaway, not photorealism, not a cartoon. It should read like a rigorously resolved architectural drawing with gothic Imperial cathedral buttresses plus real science-fiction containment engineering. Common floor heights, aligned doorways, no disconnected bridges, no corridors ending in solid walls, no pipes crossing through doors.
Text: none, no UI, title, numeric markers or legend. No people, bodies, gore, neon, fog, bloom or decorative swirls. Let the actual building fill the image clearly. One polished coherent wide plate.
```

## Residential vaults

Output: `residential.png`

References (relative to repository root):
- `images/terra-ostroma/white-mountain/overview.png`
- `images/terra-ostroma/white-mountain/intake-argos.png`

```text
Use case: infographic-diagram.
Asset type: one polished 16:9 architectural close-up plate of the RESIDENTIAL VAULTS of White Mountain Prison beneath Antarctica.
Input image 1: master prison overview, authoritative layout and building-design reference. Input image 2: upper-prison close-up, detail and linework reference only.
Zoom in on the middle-left residential district visible in the master, redrawing it with richer coherent architectural detail. Show ONE dominant oval vaulted habitat and its SMALLER secondary habitat at lower-left, plus the vertical transfer and service elevator spine on the right. Do not show the intake, ARGOS, the prison’s whole exterior, the honeycomb or deep stasis district. Preserve the distinctive oval dome footprint, circular small subsidiary dome, Imperial gothic miniature houses, surrounding circulation galleries and architectural vocabulary of the master. The main oval habitat should fill about 65 percent of the image; supporting service rooms fill the remaining right and bottom.

Scene: a vast under-ice cavity with rear bedrock and crosshatched blue ice ceiling, a clearly built artificial-sky vault supported by finely engineered ribs. The front half of this vault and selected house roofs are cut away. Inside: an orderly neighbourhood, 10–14 small two-storey gothic terraced dwellings in connected streets; a small central square with a low circular fountain and benches; one chapel with a simple spire, a community clinic, dining hall / food distribution and a small enclosed winter garden. The canopy is a physical gridded false-sky installation, not an open sky and not an external bubble. Three homes have readable cutaway kitchens, bedrooms and living rooms with miniature furnishings. Empty paths, no people.
At lower-left, a separate circular secondary habitat repeats only a handful of these buildings in a different courtyard arrangement, enclosed by thick observation walls. Its access is through an actual gated bridge and vestibule from the same circulation spine; it is not floating.
A precise staff-only service belt runs behind the dwellings and follows the oval perimeter, with discreet observation alcoves, sensor housings, camera conduits, air ducts and utility access. Neutral engineering presentation; do not expose plot twists through text or character identities. A control booth near the main entrance contains consoles and clean instrument panels.
At right of the oval vault, an elevator landing connects via two physical bridges at distinct matching floor levels: upper one to the residential entrance, lower one to kitchens, laundry, water recycling, staff lockers, maintenance workshop and servitor recharge docks. Put three small unoccupied reserve rooms among these ancillary rooms. At the front bottom, show heat exchangers, ventilation trunking and storage racks built into the structural subfloor.
Architecture must be geometrically rigorous. Corridors meet door apertures, stairs meet landings, bridges are supported and connect to real portals, floor slabs align, utility pipes join correctly and stay separate from occupied walkways. No impossible staircases or unsupported islands.
Match the exact reference style: detailed steel-blue and ice-white engraved linework on midnight navy, restrained antique-gold tracing along the supervision / lighting infrastructure, subtle blue-grey shaded planes and gradients providing fake 3D depth. Clear architectural cutaway, not concept-painting haze. Gothic medieval Imperial architecture mixed with restrained future containment technology; no neon cyberpunk. Same orthographic front-right camera angle as the master.
Text: NONE. No lettering, title, captions, markers, borders, UI or watermark. One coherent wide architectural plate, not a collage. No visible prisoners, children, violence, bodies or gore.
```

## Semi-stasis and isolation

Output: `stasis.png`

References (relative to repository root):
- `images/terra-ostroma/white-mountain/overview.png`
- `images/terra-ostroma/white-mountain/intake-argos.png`

```text
Use case: infographic-diagram.
Asset type: one final polished 16:9 atlas close-up of the LOWEST CONTAINMENT DISTRICTS of White Mountain Prison beneath the Antarctic Inquisition fortress.
Input image 1: complete master prison overview; authoritative design reference. Input image 2: upper-prison detailed cutaway; exact style and line fidelity reference.
Make a roughly 3x architectural zoom into the master overview’s lower-center honeycomb complex and its separated bottom-right isolation vault. This must visibly be the SAME prison, not a different map. Preserve the central round transfer junction encircled by hexagonal containment towers, the isolated angular double-shell vault to the right with its gold-trimmed cylindrical capsule, and the service / elevator access on the left. Omit surface fortress, intake, archives, residential domes and ARGOS upper control chamber; show only the target district and the rock surrounding it.

Main structure left / center, occupying 60 percent of the picture: the SEMI-STASIS HONEYCOMB. Eight to twelve connected tall hexagonal cell stacks surround a central circular transfer and observation hub. Each hexagonal stack has at least three visibly sectioned levels containing small sealed medical-stasis cells. Cut away selected front faces so dozens of individual opaque vertical capsules, maintenance hatches and small observation compartments are clearly readable. No visible people or bodies. A raised guard gallery follows the perimeter and radial transfer corridors terminate precisely in paired sealed doors. A lower equipment ring carries coherent cable bundles, cooling pipes, valves and manifold junctions beneath the walking deck. A compact observation / reconditioning suite and sealed servitor service alcoves branch from a side corridor. Include two spare empty chambers with genuine access doors.

Deep isolated structure at right, occupying about 30 percent: STASIS ISOLATION VAULT. It is lower than the honeycomb by one clearly drawn structural level, and reached by an actual stair or elevator landing then a short guarded bridge. Two concentric thick polygonal containment walls are cut open at the front. Between them are four restrained null-field generator towers, observation booths and an accessible inspection corridor. In the center a gold-rimmed CLOSED cylindrical containment capsule stands on an engineered platform inside a square sealed chamber; three smaller closed isolation rooms adjoin it. Access passes through two sequential rectangular vestibules. No name of the prisoner, no symbolic demons or portals, no throne imagery.

Far left and bottom, 10–20 percent of picture: a partial continuation of the master elevator spine, a landing checkpoint, an independently routed service passage, twin cryogenic cooling tanks, heat exchanger bank, backup electrical distribution, decontamination room, waste steriliser and repair benches. Infrastructure should look maintainable: floor grilles, catwalk handrails, valve clearances and load-bearing columns. No decoration added merely to fill space.
Connectivity: towers sit on continuous floor slabs, not disconnected islands. Adjacent levels have matching doorway elevations; every stair terminates on a landing; main and service corridors remain separate. Pipes meet fittings, never clip door openings. Lowered isolation block has explicit vertical circulation to resolve its height difference. Strong precise outlines let the viewer follow every route.

Match the master reference’s extremely fine engraved cold-white / desaturated steel-blue architectural lines on a near-black navy ground, with selective old-gold instrument edges and containment circuits. Crisp orthographic axonometric cutaway, elegantly shaded faces, blue-grey rock and ice strata gradients, richly detailed gothic-industrial Imperial architecture. False 3D through well-resolved linework, not glossy 3D rendering. No photographic textures, cartoon, neon, haze, bloom, glowing orbs, exposed victims, children, gore or horror characters.
Text: NONE. No labels, numbers, titles, UI, watermark or margins containing a legend. One coherent detailed wide architectural image.
```


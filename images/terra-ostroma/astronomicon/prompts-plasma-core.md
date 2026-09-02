# Astronomicon Image Provenance: plasma-core

Tool mode: built-in `image_gen` (`image_gen__imagegen`), one call per asset, two calls total. No CLI fallback.

Intent: generate new illustrations using the input as a strict style reference only, not an edit target.

Both calls used `referenced_image_paths: ["E:/Codex/karavan/images/terra-ostroma/eternity-gate/overview.png"]`.

The imagegen skill was reread fully before generation. The reference was viewed first, and both outputs were visually inspected. Image dimensions were read from the saved PNG files. Generated files remain outside the site checkout in the default generated_images directory.

Both files are 1672 x 941 pixels (approximately 16:9). The generator did not deliver the larger resolution requested in the prompts. No resizing or postprocessing was performed.

Hotspots below are recommended anchors from visual inspection, adjusted to actual output placement. Coordinates are normalized 0-100 from the full image's top-left, with x increasing right and y increasing down. Apply them before any display cropping.

## Asset: plasma

- Returned image path: `C:/Users/korte/.codex/generated_images/01a062ca-306c-7791-865a-76841c5021ca/exec-a524813d-e41e-4b00-af98-7bcf6cdc6914.png`
- Dimensions: 1672 x 941 pixels
- Tool mode: built-in `image_gen` (`image_gen__imagegen`)

### Inspected Hotspots

| Feature | X | Y |
|---|---:|---:|
| Gold filament stream | 50 | 45 |
| Diagnostic gallery | 13 | 23 |
| Optical shield shutters | 82 | 19 |
| Sacrificial feed conduit | 35 | 85 |
| Service chamber | 78 | 68 |
| Magnetogravitic containment ring | 58 | 47 |

Inspection: the image shows a narrow vertical gold filament stream surrounded by multiple supported mechanical rings, a continuous lower-left feed conduit entering the vessel base, an open diagnostic gallery, upper-right shutter panels and a lower-right service room. Diagnostic and shutter features sit higher than the requested prompt coordinates. No visible text, labels, people, bodies or figurative statues.

### Exact Final Prompt

```text
Use case: stylized-concept.
Asset: Astronomicon plasma. Create ONE separate 16:9 landscape architectural CUTAWAY illustration, ideally 2560x1440 or larger.
Input Image 1 is a STRICT STYLE REFERENCE ONLY, not an edit target. Adopt its breathtakingly intricate, sharp silver-blue engraved wireframe on midnight navy, selective antique-gold mechanical geometry, extremely fine architectural linework, delicately shaded dark cut faces, precise isometric/axonometric camera and dense Gothic science-fiction technical anatomy. Do not reproduce its buildings, giant gate, throne, symbols or purple vortex. Foreground left, rear right; vertical structures stay vertical.
Shared Astronomicon construction: a vastly tall tapering tower with a narrow gold core, enclosed by many stacked horizontal mechanical CORONA RINGS, Gothic ribbed buttresses and cylindrical conduits, rising from a broad mountain fortress with several underground levels. A central liquid-gold particle stream travels UPWARD through the rings toward a dark spacetime boundary at the tower top. This image is a huge CLOSE-UP of the lower tower containment chamber, not a distant tower overview.
Composition: a VERTICAL OPEN SECTION of the monumental plasma containment vessel inside a LANDSCAPE canvas. Remove its front housing to reveal a narrow central dense stream of individually drawn golden filaments at x50%, extending from y80% to y20% and continuing into the tower above. Keep the full close-up readable, with side galleries and lower structural levels filling the wide canvas. The liquid-gold stream is fine etched strands and minute signal particles with directional upward flow, never a broad luminous beam.
Subject: massive Gothic vacuum vessel housing, intricately bolted double walls, layered liners, maintenance ribs and strongly anchored support buttresses. Many separate horizontal mechanical corona rings at different elevations encircle the stream. Magnetogravitic containment coils are solid built assemblies with mounts, winding geometry, cooling conduits and brackets. Show real dark cut faces, rib-vaulted service aisles, tiny mechanical chambers, handrails, flanges, inspection ports and finely articulated machine parts at a detail density comparable to the reference.
Position the following readable features near these centers measured across the ENTIRE IMAGE from left and top; do not draw coordinates: silver-blue diagnostic gallery at (22,45), connected through real doors to the vessel service levels; upper optical shield shutters at (75,30), a bank of intricate segmented mechanical shutters connected to the upper containment ring by optical housings and access walkways; sacrificial feed conduit entering from lower left at (35,78), physically continuous, bending into a sealed injection throat at the very BOTTOM of the gold stream, with no disconnected ends; service chamber at lower right (76,75), cutaway ribbed ceiling, precise doorway, maintenance mechanisms and real corridor connection.
All joints meet their supports, conduits meet real ports, corridors terminate in actual open doorways and floor levels align. Rings attach to beams and the vessel walls; no floating pieces. Finely drawn mountain cross-section and several fortress sublevels may appear along the bottom and outer edges without stealing space from the close-up.
Only antique gold for the stream and restrained signal details, blue/silver for structure, midnight navy negative space. No rainbow, neon, large glows, bloom, colored gods, chaos symbols, faction emblems, throne, giant gate, giant decorative sphere, random orbs, people, bodies or figurative statues. Absolutely no text, equations, labels, letters, numbers, leaders, markers, diagram dots, pictograms, UI, borders or watermarks. All labeling will be added later in HTML. Exquisite architectural blueprint, not simplistic blocks, industrial cartoon or painterly concept art.
```

## Asset: core

- Returned image path: `C:/Users/korte/.codex/generated_images/01a062ca-306c-7791-865a-76841c5021ca/exec-dbc503c4-04e6-447f-9fa6-59af10f7d5ab.png`
- Dimensions: 1672 x 941 pixels
- Tool mode: built-in `image_gen` (`image_gen__imagegen`)

### Inspected Hotspots

| Feature | X | Y |
|---|---:|---:|
| Central commanding core | 50 | 44 |
| Upper-left tuning core | 23 | 22 |
| Lower-right resource core | 75 | 65 |
| Upper corona transfer gallery | 76 | 14 |
| Mechanical control/choir chamber | 19 | 70 |

Inspection: three clearly distinct supported mechanisms are visible: a largest central intersecting-ring assembly, upper-left nested inclined rings, and a lower-right coaxial disc assembly. Conduits and walkways connect the surrounding structure. The mechanical choir/control room is open at lower left. No visible text, labels, people, bodies or figurative statues.

### Exact Final Prompt

```text
Use case: stylized-concept.
Asset: Astronomicon core. Create ONE separate 16:9 landscape architectural CUTAWAY illustration, ideally 2560x1440 or larger.
Input Image 1 is a STRICT STYLE REFERENCE ONLY, not an edit target. Match its breathtakingly intricate Gothic science-fiction technical architecture: razor-fine silver-blue engraved wireframe on midnight navy, restrained antique-gold important mechanical geometry, crisp linework, densely ornamented but structurally precise anatomy, dark subtly shaded cut faces. Preserve its isometric/axonometric camera orientation, foreground left and rear right, with upright verticals. Do not copy the reference scene, gate, throne, symbols or purple vortex.
Shared Astronomicon construction: a vastly tall tapering gold-core tower enclosed by many stacked horizontal mechanical CORONA RINGS, Gothic ribbed buttresses and cylindrical conduits, built on a broad mountain fortress with several underground levels. A narrow central liquid-gold particle signal rises through the rings toward a dark spacetime boundary at the tower top. This image is a CLOSE-UP of the colossal cylindrical cathedral engine-room inside that same ringed tower, not a tower overview. Front walls and selected floors are removed to reveal an interconnected working architectural section.
Primary subject: EXACTLY THREE clearly separate, SOLID, intricately engineered mechanical gyroscope assemblies, each individually visible, visually different and mounted on tangible structural bearings. These are detailed physical machinery with thick faceted segmented rims, machined flanges, nested gears, bearings and shafts, never hollow decorative glowing orbs. Use enough dark separation between the three assemblies for independent HTML hotspots without letting walls hide their silhouettes.
Composition coordinates are percentages of the ENTIRE IMAGE from left and top, never draw coordinates: CENTRAL LARGEST COMMANDING CORE at (50,50), dominating the chamber with many layered FACETED intersecting mechanical rings, fine internal rings, robust axle supports and restrained gold trim; LEFT UPPER TUNING CORE at (28,30), a separate smaller assembly of NESTED INCLINED ELLIPSOID rings held in a tilted solid gimbal frame with obvious pivot bearings; RIGHT LOWER RESOURCE CORE at (74,66), a separate mechanism made of MANY COAXIAL DISC LAYERS around a shared axle, like an elaborate layered drum with finely toothed disc rims, clearly distinct from the other two gyroscopes.
Suspend each ring assembly on clear support beams and bearings tied into the cylinder walls and floor columns. Interconnect all three using cylindrical conduits routed on brackets along actual walkways, with bends and flanges entering actual machine ports. Make every passage continuous and every doorway open onto a matching floor. There must be no unsupported floating components or conduits ending in empty space.
Secondary readable locations: upper corona transfer gallery at (75,25), ring-segment equipment and transfer conduits with a walkway connecting through a real door to the upper structural corona; control/choir chamber at (25,65), entirely mechanical and empty of people, with orderly organ-like resonator tubes and control consoles inside an open Gothic vaulted room; many tiny cutaway maintenance chambers elsewhere. Layered circular balconies, cross-braced catwalks, ribbed cathedral buttresses, towering cylindrical conduit banks, wall cut faces and glimpses of lower fortress levels frame the machinery. Fine mountain section edges may appear at the perimeter.
Structure is blue/silver, dark faces are midnight navy, gold is used only sparingly for key rings, ports and thin signal paths. Breathtaking detail comparable to the reference, not simplified blocks, chunky industrial cartoon or painterly haze. Absolutely no text, equations, labels, letters, numbers, leaders, markers, diagram dots, pictograms, UI, borders or watermarks. No people, bodies, figurative statues, chaos symbols, faction emblems, colored gods, throne, giant gate, rainbow, neon, large glows, bloom, random floating orbs or giant decorative sphere. All labels will be HTML outside the artwork.
```

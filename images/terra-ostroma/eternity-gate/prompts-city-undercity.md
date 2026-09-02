# Image Generation Provenance

Tool mode: built-in `image_gen` (`image_gen__imagegen`), one call per asset. No CLI fallback.

Both calls used `referenced_image_paths: ["E:/Codex/Codex-kép 2026. szept. 2. 17_32_27.png"]`.

The reference and both generated outputs were visually inspected. Dimensions were read from the saved image files. Both outputs are approximately 16:9, below the requested ideal resolution.

## Asset 1: city

- Returned image path: `C:/Users/korte/.codex/generated_images/01a062ca-306c-7791-865a-76841c5021ca/exec-0b0ca372-bd11-4d39-bd04-31dc3fadcb0f.png`
- Dimensions: 1672 x 941 pixels
- Tool mode: built-in `image_gen` (`image_gen__imagegen`)

### Exact Final Prompt

```text
Use case: stylized-concept.
Asset: city. Generate one new landscape 16:9 raster architectural cutaway, ideally 3840x2160, at least 2560x1440 if supported.
Input Image 1 is the strict visual style, architectural language, palette and camera reference, not an image to annotate. Match it extremely closely: impossibly elaborate Warhammer 40k gothic architectural axonometric/isometric engraving, razor-fine sharp etched silver-blue lines on midnight navy, selective antique-gold important structural geometry, subdued shaded faces giving depth. Detail density and exquisite ornament comparable to the reference, never simplified blocks. Same camera orientation as reference, foreground on lower left receding toward rear upper right, identical axonometric projection, verticals upright.
Scene: a new CLOSE-UP of the central inner-city cathedral compound in Image 1. The compound fills most of the wide frame, with a thin wireframe mountain skyline across the top. A domed cathedral and its processional courtyard occupy the center. Partially section the roofs and front-facing walls so numerous functional rooms and passages are clearly readable while retaining ornate buttresses, spires, pinnacles, finely ribbed arches, traceried galleries, stairs, layered terraces and structurally precise interlocking cloisters.
Room placement coordinates are percentages across the WHOLE IMAGE from left and down from top, never print these coordinates: archive/leveltar centered at (28,55), a large open cutaway archive with many aisles of shelves, stacked stair galleries and arched entrances; east palace wings centered at (72,52), interconnected suites of tiny empty rooms and ornate pillared halls; chapel centered at (46,25), exposed ribbed vault interior with delicate Gothic ribs and a visible doorway; vertical lift down into the undercity at (52,78), an open architectural shaft with cage platform, rails, cutaway landings and access passages. Central domed cathedral around (51,43), processional courtyard around (49,58).
Every connecting cloister must run to actual door openings, meet the room floor at the right elevation, and have a readable route. Use cutaway roof sections, not exploded floating roofs. Keep the rooms empty of people; shelves, stairs and architectural fittings are appropriate. Gold sparingly outlines the important cathedral, chapel and lift geometry, never floods broad surfaces.
Absolutely no text, labels, letters, numbers, captions, leaders, callout lines, markers, diagram dots, border, UI or watermark anywhere. No people, random figures, humanoid statues, neon glows, purple portal, bloom, painterly blur or chunky industrial-cartoon forms. Crisp refined architectural blueprint with real intricacy. The output is only the finished artwork.
```

## Asset 2: undercity

- Returned image path: `C:/Users/korte/.codex/generated_images/01a062ca-306c-7791-865a-76841c5021ca/exec-2cea73bc-4d6d-4fdf-b072-c7d6a830612a.png`
- Dimensions: 1672 x 941 pixels
- Tool mode: built-in `image_gen` (`image_gen__imagegen`)

### Exact Final Prompt

```text
Use case: stylized-concept.
Asset: undercity. Generate one new landscape 16:9 raster architectural cutaway, ideally 3840x2160, at least 2560x1440 if supported.
Input Image 1 is the STRICT visual style, architectural language, palette and camera reference. Match its impossibly elaborate Warhammer 40k gothic architectural isometric/axonometric engraving extremely closely: hairline sharp etched silver-blue architectural edges on midnight navy, selective antique-gold important structural geometry, subtly depth-shaded faces, exquisite minute detail equal to the reference. Retain exactly its camera orientation, foreground lower left receding to rear upper right, parallel axonometric axes and upright vertical shafts.
Scene: a magnificent subterranean architectural cutaway UNDER the same mountain palace. Rocky mountain cross-section encloses the top and outer edges, etched as fine angular blue wireframe. Many readable stacked subterranean levels fill the wide landscape frame, linked by continuous lift shafts, staircases, door openings, elaborate rib-vaulted corridors and precise structural supports. Remove front-facing rock and selected walls and roofs to expose functional interiors. Gothic architectural blueprint, not an industrial cartoon, not an exploded diagram. Dense secondary tiny unlabelled EMPTY chambers, arches, buttresses, traceried galleries and interlocking passages.
Room coordinates below refer to centers across the WHOLE IMAGE, measured percent from left and top. These locations guide composition only and MUST NOT be drawn or written:
- Huge vaulted cable cathedral center-left at (35,45), the dominant chamber. Show soaring cutaway rib vaults, many fine columns and intricate antique-gold bundled cables hung on actual brackets, routed along real supports and into wall penetrations. Restrained gold lines, no glow.
- Data crypt at (70,32), an open chamber with ordered narrow aisles of detailed racks enclosed in Gothic stone piers, connected through an actual arched doorway to the upper corridor.
- Sisters of Silence cloister at (70,62), no Sisters or people shown: an empty cloister whose cold silver null-zone geometric enclosure is physically built from fine nested architectural frames around a quiet central court, with a readable entrance. Silver enclosure is structurally anchored and not an energy bubble.
- Psi reactor at (26,74), a carefully engineered Gothic cylindrical reactor shrine, exposed concentric mechanism and a small muted amber core, no neon or bloom. Proper doors and service access corridor.
- Stasis chambers at (50,78), rows of detailed closed unoccupied stasis sarcophagi/capsules in narrow vaulted bays; no visible bodies or figures, linked to the main circulation route.
- Shaft to city at (42,18), an open vertical lift shaft visibly continuing upward into the palace foundations and downward between readable landings and corridors.
All passages must meet actual door openings at correct floor levels. Give the stacked levels enough separation to see where stairs and elevator landings connect, without turning the complex into floating islands. Keep the cable cathedral grand and intricate, each named room visually distinct and large enough to place an HTML hotspot over later.
Absolutely no text, labels, letters, numbers, captions, leaders, callout lines, diagram dots, markers, borders, UI, watermark, people, random figures, humanoid statues, visible bodies, neon glows, purple portal or luminous effects. No chunky simplified blocks, painterly haze or blurry linework. This is a refined, astonishingly detailed, structurally coherent Gothic architectural blueprint artwork only.
```

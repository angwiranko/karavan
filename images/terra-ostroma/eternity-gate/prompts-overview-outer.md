# Eternity Image Asset Provenance

Tool mode: built-in `image_gen` (`image_gen__imagegen`), one call per asset. No CLI fallback or post-generation image processing.

Both calls used `referenced_image_paths` with `E:/Codex/Codex-kép 2026. szept. 2. 17_32_27.png`. The reference was viewed before generation, and each generated output was visually inspected.

Both returned images are 1672 x 941 pixels, approximately 16:9. The requested higher resolution and exact 16:9 dimensions were not honored by the generator.

## Asset 1: overview

- Returned image path: `C:\Users\korte\.codex\generated_images\01a062ca-2ffd-7212-9e1b-fd45363f772e\exec-c518caf9-6934-4a6f-873d-5c42c3744d71.png`
- Verified dimensions: 1672 x 941 pixels.
- Tool mode: built-in `image_gen`, reference-image edit using `referenced_image_paths`.

### Exact Final Prompt

```text
Use case: precise-object-edit.
Asset: overview, a single ultra-detailed landscape 16:9 architectural cutaway bitmap for HTML overlays. Render 2560x1440 or larger, preferably 3840x2160.
Input image 1 is the EDIT TARGET and exact architectural/style reference.
Primary request: Make the smallest possible edit to this reference. Remove all four text labels (KULSO KAPU / KÜLSŐ KAPU, BELSO VAROS / BELSŐ VÁROS, ETERNITY GATE, ARANY TRONUS / ARANY TRÓNUS) and every white label underline, leader line and white endpoint dot. Reconstruct the underlying architecture and mountain lines naturally.
Preserve invariants: Above-ground layout must remain unchanged. Preserve exact skyline, mountain wireframe landscape, camera angle and axonometric scale, outer gate lower left, intricate inner city in the center, huge antique-gold Eternity Gate upper right, golden throne and purple webway at far upper right. Same foreground-left to rear-right spatial orientation, not mirrored or rotated. Keep the immense, impossibly elaborate Warhammer 40k gothic architecture, bridges, pinnacles, flying buttresses, ribbed arches and precise interlocking passages in their existing positions.
The sole architectural refinement is in the existing bottom/central cutaway beneath the palace: clarify a dense multi-level undercity with roof-cut open chambers, ribbed cable vaults holding thick routed cable bundles, service galleries, structural columns, stairs and passages. Real visible door openings must join corridors. Integrate this detail into existing foundations without moving any above-ground architecture.
Style: Match reference extremely closely. Fine, sharp, etched silver-blue lines on midnight navy, selective antique-gold important geometry, subtle depth-shaded faces, wireframe mountains. Real intricate architectural detail comparable to the reference, never simplistic blocks. Keep purple webway linework understated and non-luminous.
Avoid: any text, lettering, labels, leaders, borders, UI, watermarks, diagram dots, neon glow, random people or figures. No new statues or figures. No compositional redesign. Output only one complete image.
```

## Asset 2: outer

- Returned image path: `C:\Users\korte\.codex\generated_images\01a062ca-2ffd-7212-9e1b-fd45363f772e\exec-c66eb089-4ba1-4e0d-aa1e-f059e9448007.png`
- Verified dimensions: 1672 x 941 pixels.
- Tool mode: built-in `image_gen`, reference-guided generation using `referenced_image_paths`.

### Exact Final Prompt

```text
Use case: stylized-concept.
Asset: outer, one separate architectural close-up bitmap for HTML room overlays.
Output canvas: landscape exactly 16:9, 2560x1440 pixels or larger, preferably 3840x2160. The input's pixel dimensions are not the requested output dimensions.
Input image 1 is the architectural, camera and style REFERENCE. Create a new CLOSE-UP of ONLY the outer gate compound seen at the lower left of that reference; do not redraw the full palace, inner city, Eternity Gate, throne or webway.
Composition: Keep the reference's identical isometric/axonometric camera orientation, with approach in foreground left and destination in rear right. Zoom into an immense elaborately built gothic gate compound filling the frame. Coordinates below are approximate percentages from image left and image top, never draw the coordinates.
Outer gate centered near (35,50), dominating left-center, with very tall elaborate gothic towers, fine pinnacles, buttresses and selective antique-gold arch tracery. Show a real OPEN pointed-arch portal at the gate threshold. A substantial arched bridge comes from bottom-left, passes THROUGH this open portal at mid-left, and continues as the main passage toward top-right. Keep portal and adjoining passage structurally connected and visible.
To the right, at (65,55), create a large ROOF-CUT OPEN audience hall: exposed detailed floor, apse, columns, ribbed wall bays and tiered benches, clearly readable from above. At (70,30) adjoining the audience hall and main passage create a roof-cut open guard checkpoint with inspection lanes and an actual open doorway into the connecting corridor. At (40,75) create a roof-cut open barracks wing with organized empty bunks, lockers and small service chambers. At (22,25) show a mountain bastion and exposed shield machinery: detailed mechanical coils, generators, cable feeds and armored gothic masonry embedded into wireframe mountain. Add only a few tiny empty side rooms. Every named space joins a coherent corridor through a visible door opening; no rooms sealed behind uninterrupted walls.
Style: Match the reference EXTREMELY closely, impossibly elaborate Warhammer 40k gothic architectural axonometric CUTAWAY. Fine sharp etched silver-blue lines on midnight navy, selective muted antique-gold important geometry, subtle shaded faces for depth, mountain wireframe backdrop. Very high density of real legible architectural detail comparable to the reference: traceried windows, columns, ribs, crenellations, interlocking passages, mechanical housings, buttressed bridges and thick structurally credible walls. Concentrate readable detail in this compound; no simplistic blocks and no flat abstract wireframe cubes.
No text, lettering, labels, leaders, dots, arrows, borders, UI or watermarks. No neon glow. No people, figures, soldiers or statues. Do not bake any hotspot symbols into the illustration. Output only one complete image.
```

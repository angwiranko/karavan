# Astronomicon Image Provenance: warp

## Generation

- Group: warp.
- Asset: close-up of the uppermost Astronomicon crown at the boundary of physical space.
- Tool mode: built-in `image_gen`, using `image_gen__imagegen`.
- Generation intent: new illustration using a strict style reference, not an edit of the reference.
- Generation calls: one.
- Reference path: `E:/Codex/karavan/images/terra-ostroma/eternity-gate/overview.png`.
- Reference argument: `referenced_image_paths: ["E:/Codex/karavan/images/terra-ostroma/eternity-gate/overview.png"]`.
- Reference was viewed before generation. The imagegen skill was reread in full before this task.
- Returned image path: `C:/Users/korte/.codex/generated_images/01a062ca-30ca-7bc3-9640-a7b9fae2effd/exec-53246052-1b9d-4498-ba81-582a476b2d71.png`.
- Verified dimensions: 1672 x 941 pixels.
- Format: PNG.
- Aspect ratio: approximately 16:9 (1.77683:1), not mathematically exact 16:9.
- Requested dimensions: landscape 16:9, ideally 2560x1440 or larger. The generator returned the smaller dimensions above.
- Output visually inspected at original resolution. Dimensions checked from the saved image.
- Original generated image retained outside the repository. No post-processing or additional generation calls.

## Inspected Hotspots

Coordinates are approximate visual anchors on the actual returned image, normalized to 0..100 with the origin at top-left. They describe visible features, not the requested target positions.

| Feature | x | y | Inspection note |
|---|---:|---:|---|
| Instrumentation deck | 15.5 | 76 | Circular open equipment deck at lower left. |
| Outer ring couplings | 88 | 61 | Large cylindrical coupling assembly at right. |
| Emission outlet | 48 | 18 | Tip of the central crown where fine gold threads emerge. |
| Orbital sensor platform | 87 | 19 | Small circular platform at upper right. |
| Central gold particle shaft | 48 | 70 | Exposed gold core within the foreground cutaway. |
| Supported Corona ring stack | 68 | 48 | Layered horizontal ring trusses and support ribs. |
| Fragmented remnant contours | 65 | 13 | Faint broken upper ring contours against the dark background. |

## Visual Inspection Notes

The output retains fine silver-blue and antique-gold architectural linework on midnight navy, dense Gothic tower anatomy, supported stacked rings, dark cut faces, an exposed gold core, an instrumentation deck, ring couplings and a small remote sensor platform. No visible text, UI, people, bodies, figurative statues, throne, giant gate or purple portal was found.

Placement differs from the request: the instrumentation deck is farther left and lower, the coupling assembly farther right, and the emission outlet and orbital platform higher. The material-to-fragmented-contour transition occurs mostly in the upper quarter rather than around y40%. Physical central spire details continue above y40%, and the near-black region is a gradual dark field rather than a sharply distinct boundary. These deviations were retained under the one-call constraint.

## Exact Final Prompt

```text
Use case: stylized-concept.
Asset: Astronomicon, group warp, one standalone architectural CUTAWAY illustration. Landscape 16:9 canvas, ideally 2560x1440 or larger. The subject rises vertically within the landscape frame.
Input image 1 is a STRICT STYLE REFERENCE ONLY, not an edit target. Generate a new Astronomicon crown scene. Match the reference's exceptionally sharp, delicate silver-blue engraved wireframe on midnight navy, selective restrained antique-gold geometry, very fine architectural detail and axonometric camera language. Do not copy its gate, throne, statues or violet portal.
Subject and framing: CLOSE-UP of the uppermost crown of the Astronomicon at the boundary of physical space. It is a vastly tall tapering gold-core tower enclosed by MANY STACKED HORIZONTAL CORONA RINGS, not a gate or throne. Gothic ribbed buttresses, elaborate ring trusses, cylindrical conduits, repeated arched service bays, extremely fine masonry joints, engineered couplings and a central liquid-gold PARTICLE STREAM. The tower belongs to a broad mountain fortress with several underground levels far below and outside this crown close-up. Retain the same monumental landmark design; do not turn this image into a whole-fortress overview.
Composition, normalized positions measured from top-left: the detailed lower physical tower section occupies x38..65%, y55..95%, continues out of the bottom edge, and is cut away on its foreground face to expose the central gold particle shaft and intricate technical anatomy. Camera is parallel-projection isometric/axonometric, foreground left and rear right. Many enormous stacked horizontal Corona rings surround the core, with precise physical supports and Gothic ribbing below the boundary. Successive rings become progressively thinner toward the top.
Boundary at approximately y40%: silver-blue structural ribs gradually fade into a near-black spacetime region. Above that transition solid material structures disappear. Only fragmented extremely fine dashed REMNANT CONTOURS in the upper third imply the same ringed geometry continuing with spatial warping. These are broken architectural contours, not dotted diagram leaders. Create a material-space fringe surrounding the near-black region, with restrained gold signal threads flowing upward through the central shaft and rings, emerging at the outlet and curling outward into the distance. Keep the dark region deep black/navy, no colored portal or giant glowing disc.
Visible locations: an open instrumentation deck centered x25%,y66%, with miniature precise non-textual technical equipment, physically connected to the tower by an axonometric service corridor whose ends meet real door openings and load-bearing supports. Exposed outer ring couplings centered x75%,y60%, connected directly to ring trusses and cylindrical conduits. Emission outlet centered x50%,y32%, where the narrow gold particle shaft releases restrained curling gold threads. A tiny separate orbital sensor platform far right at x83%,y25%, distant and geometrically intricate, with no pictograms or screens bearing symbols.
Rendering: breathtaking density of real structural detail comparable to the reference, never simplistic blocks. Fine etched silver-blue linework remains crisp and individually legible. Subtle shaded dark cut faces convey wall thickness and interior depth. Continuous material joints, supports, catwalks, corridors, pipes and doorways all meet precisely. Below the boundary the rings are physically supported; above it the deliberately broken contours express immaterial continuation. Gold signal only; blue/silver material structure and selective antique-gold important geometry. Particle stream is a fine tightly controlled flowing gold texture, not a huge luminous beam.
Absolute exclusions: no text, messages, lettering, numbers, leaders, labels, annotation lines, markers, diagram dots, UI, pictograms, symbols, watermarks or borders. No people, bodies, figurative statues, chaos symbols, factions, colored gods, throne, giant gate or purple portal. No rainbow, purple, neon, bloom, large glows, painterly blur or simplified block architecture.
```

# Astronomicon Image Provenance: overview-fortress

Tool mode: built-in `image_gen` (`image_gen__imagegen`), exactly one call per asset. No CLI fallback, additional generations, or post-generation image processing.

The imagegen skill was read fully again. The reference was viewed before generation; both outputs were visually inspected and their file dimensions were verified.

Reference used for both calls via `referenced_image_paths`: `E:/Codex/karavan/images/terra-ostroma/eternity-gate/overview.png`.

Reference role: STRICT STYLE REFERENCE ONLY, not an edit target. Assets remain at the returned generated-images paths outside the site checkout. No site files were modified.

## Returned Assets

### overview

- Exact returned path: `C:\Users\korte\.codex\generated_images\01a062ca-2ffd-7212-9e1b-fd45363f772e\exec-4ff15402-86a9-4b45-9200-9855d13f6bef.png`
- Verified dimensions: 1672 x 941 pixels.
- Mode: built-in image_gen, reference-guided new generation.
- Requested canvas: exact 16:9, 2560x1440 or larger, preferably 3840x2160.
- Actual canvas: approximately 16:9; requested resolution and exact ratio were not honored.

### fortress

- Exact returned path: `C:\Users\korte\.codex\generated_images\01a062ca-2ffd-7212-9e1b-fd45363f772e\exec-21b94351-9303-4787-8f40-4cd0baf418c9.png`
- Verified dimensions: 1672 x 941 pixels.
- Mode: built-in image_gen, reference-guided new generation.
- Requested canvas: exact 16:9, 2560x1440 or larger, preferably 3840x2160.
- Actual canvas: approximately 16:9; requested resolution and exact ratio were not honored.

## Inspection Notes

- Both images follow the fine engraved blue/silver and antique-gold Gothic technical style, with dark shaded cutaway faces. No visible text labels, people, bodies, figurative statues, faction symbols, throne, giant gate, rainbow colors or large neon glows were observed.
- Overview: vertical tower, many physical corona rings, narrow gold center, mountain fortress, underground halls and small spacecraft are present. However, tower axis is around x60.6 rather than x50. Its tip reaches the top edge instead of y8; the very top is clipped. Faint broad elliptical contours appear around the upper tip despite the exclusion of atmospheric arcs. Mountains extend above the bottom quarter. The left side remains broadly clear for HTML overlays.
- Fortress: central conduit exits the top near x52. Three exposed underground tiers, solid concentric fortifications, doors, passages and machinery are visible. Several requested room positions shifted substantially. Temple, twin shield machinery, barracks and deep isolator vault are clearly distinguishable. Reception is inferred from furnishings. Quarantine and prep functions are not visually unambiguous; their proposed hotspots are tentative, not verified room identities. Not every corridor-to-room connection can be conclusively traced from this image.
- No retries were made, respecting one call per asset.

## Actual Hotspot Recommendations

Coordinates are percentages normalized to 0..100 from the full image's top-left corner: x increases rightward and y downward. These are estimates from inspecting the returned images, not the prompt target coordinates. Low-confidence entries require integration review.

```json
{
  "overview": {
    "tower_top_boundary": {
      "x": 60.6,
      "y": 3.3,
      "confidence": "medium",
      "note": "Visible upper termination; top is clipped and faint elliptical contours are baked in."
    },
    "corona_rings": {
      "x": 60.6,
      "y": 43.8,
      "confidence": "high"
    },
    "gold_particle_stream": {
      "x": 60.6,
      "y": 59,
      "confidence": "high"
    },
    "mountain_fortress": {
      "x": 60.5,
      "y": 79.5,
      "confidence": "high"
    },
    "underground_halls": {
      "x": 60.5,
      "y": 93,
      "confidence": "high"
    },
    "orbital_patrol": {
      "x": 78.9,
      "y": 33.3,
      "confidence": "high"
    },
    "himalaya_basin": {
      "x": 21.4,
      "y": 75,
      "confidence": "high"
    }
  },
  "fortress": {
    "central_gold_conduit": {
      "x": 52,
      "y": 12,
      "confidence": "high"
    },
    "landing_deck": {
      "x": 14.5,
      "y": 32,
      "confidence": "high"
    },
    "reception": {
      "x": 34,
      "y": 39,
      "confidence": "medium",
      "note": "Open receiving/work hall beside landing deck; room function inferred from furnishings."
    },
    "quarantine": {
      "x": 29,
      "y": 63,
      "confidence": "low",
      "note": "Candidate empty chamber suite; isolation function not visually unambiguous."
    },
    "prep_room": {
      "x": 59,
      "y": 62,
      "confidence": "low",
      "note": "Candidate equipment/service bay; preparation function not visually unambiguous."
    },
    "sacrificial_machinery_chamber": {
      "x": 65,
      "y": 43,
      "confidence": "high"
    },
    "temple": {
      "x": 73,
      "y": 25,
      "confidence": "high"
    },
    "twin_shield_machinery": {
      "x": 78.7,
      "y": 68.2,
      "confidence": "high"
    },
    "barracks": {
      "x": 27,
      "y": 79,
      "confidence": "high"
    },
    "deep_isolator_vault": {
      "x": 61,
      "y": 87,
      "confidence": "high"
    },
    "outer_military_wall": {
      "x": 88,
      "y": 24,
      "confidence": "high"
    },
    "inner_shielding_ring": {
      "x": 43,
      "y": 18,
      "confidence": "medium",
      "note": "Inner solid ring around central conduit, distinct from perimeter wall."
    }
  }
}
```

## Exact Final Prompt: overview

```text
Use case: stylized-concept.
Asset: Astronomicon overview, a single landscape 16:9 architectural CUTAWAY illustration. Output exactly 2560x1440 or larger 16:9, preferably 3840x2160.
Input image 1 is STRICTLY A STYLE REFERENCE ONLY, not an edit target, not a composition or subject reference. Invent the requested Astronomicon structure. Do not copy its city, giant gate, throne, statues or purple vortex.
Style: Match the reference's breathtaking density of fine sharp silver-blue engraved wireframe lines on midnight navy, precise Gothic science-fiction technical anatomy, ribbed buttresses, cylindrical conduits, intricate mechanical joints, subtle shaded dark cut faces, selective muted antique gold. Actual detailed architecture, never simplistic blocks. Only gold signal and blue/silver structure. No rainbow, neon or large glows.
Subject: A vastly tall tapering gold-core tower rising vertically from a broad mountain fortress in a Himalaya basin all the way to space. MANY closely stacked horizontal CORONA RINGS enclose the tower in tier after tier, diminishing in diameter with altitude. They are physical engineered rings with fine ribs, supports, service walkways and structural links, not halo symbols. Gothic ribbed buttresses and cylindrical conduits form the shell. A narrow but clearly readable detailed central liquid-gold particle stream flows upward through the rings into a dark spacetime boundary at the top. Gold stream and broken fine gold contours at the very top fade into near-black space without a bright flare.
Composition: Show the WHOLE vertical tower and the WHOLE fortress footprint in one wide 16:9 frame, no cropping. Tower axis precisely at x50%, straight upright, NOT leaning or diagonal. Tower extends from y8% at top to y80% at base; mountain fortress centered at x50%, y82%. Architectural axonometric cutaway reveals technical anatomy with physically continuous connectors and supports. The fortress contains several underground levels and visibly cut-open halls in the bottom 15% of the frame. Surrounding wireframe Himalaya ridges stay in the bottom quarter. Upper half is predominantly empty midnight space around the narrow tower. Leave the leftmost 35% clear above the low mountains for a later HTML altitude axis.
A few faint small orbital patrol spacecraft near x77%, y30%, clearly distinct engineered ships with readable silhouettes but tiny relative to the tower; no giant ship and no bright engines.
Connectivity: All material joints and corridors must meet precise real doorways and supports. Exposed underground halls link through passages and actual openings.
Exclusions: Absolutely no atmospheric horizontal arcs, altitude lines or boundary guides crossing the scene; all four atmospheric arcs will be HTML overlays. No text, leaders, markers, labels, UI, pictograms, borders, watermarks, arrows or diagram dots. No people, bodies, figurative statues, chaos symbols, factions, colored gods, throne or giant gate. One complete image only.
```

## Exact Final Prompt: fortress

```text
Use case: stylized-concept.
Asset: Astronomicon fortress, a single landscape 16:9 architectural CUTAWAY close-up illustration. Output exactly 2560x1440 or larger 16:9, preferably 3840x2160.
Input image 1 is STRICTLY A STYLE REFERENCE ONLY, not an edit target, not a composition or subject reference. Create only the requested mountain-base Astronomicon fortress. Do not copy the reference's city layout, giant gate, throne, statues or purple vortex.
Shared Astronomicon design: A vastly tall tapering gold-core tower enclosed by many stacked horizontal physical CORONA RINGS, Gothic ribbed buttresses and cylindrical conduits, with a narrow liquid-gold particle stream rising through its center toward a dark spacetime boundary far above. This scene shows ONLY its broad mountain-base fortress. The vertical gold conduit, centered exactly at x50%, rises out through the TOP edge; show just the lower structural ring supports at the top, not the whole tower or space.
Style: Match the reference's extremely intricate sharp silver-blue engraved wireframe on midnight navy, selective muted antique gold important machinery and signal, dark shaded cut faces, fine Gothic science-fiction technical anatomy and breathtaking real detail. Elaborate ribbed arches, buttresses, precision cylinders, ducts, stairs and interlocking walkways. No simplistic blocks. Only gold signal and blue/silver structure, no rainbow, neon or large glows.
Composition: A wide giant mountain fortress, axonometric cutaway viewed from foreground-left toward rear-right. Show its whole broad footprint. Mountain wireframe ridges surround its foundations. Distinct outer military walls and inner shielding form TWO physically separate concentric fortification rings of solid masonry and machinery, with depth, supporting buttresses and gated openings; these are NOT energy bubbles. Cut away near-facing rock and walls to expose THREE stacked open underground levels and their detailed rooms. Continuous main corridors, vertical lift shafts and stairwells visibly connect the levels, with actual doors and landings at every room, aligned material joints and real supports. Many tiny unlabelled side rooms enrich the scale.
Room placement uses image percentages from left and top as composition guides only; do NOT draw coordinates or labels:
Landing deck at (15,45), far left-middle: broad empty landing platform with edge gantries, physically joined to a doorway into reception.
Reception at (30,44): open receiving hall with inspection counters and seating, attached to landing deck and interior corridor.
Quarantine at (43,59): open isolation suite with empty chambers, sealed-door frames and an airlock joined to the corridor.
Prep room at (51,66): open preparation chamber with empty equipment stations and supply cabinets.
Sacrificial machinery chamber at (62,61): elaborate empty ritual-industrial machine chamber, gold-lined induction apparatus, mechanical cradle and bundled conduits feeding the central shaft, absolutely no bodies or figures.
Temple at (74,38): roof-cut open Gothic sanctuary with ribbed columns, tiered benches and a nonfigurative architectural apse, no statues, bodies, icons or faction symbols.
Twin shield machinery at (82,64): TWO clearly distinct adjacent cylindrical shield generators in a cut-open machinery hall, visibly joined to inner shielding by conduits.
Barracks at (29,78): open lower-left hall with rows of empty bunks and lockers, joined to the lower circulation route.
Deep isolator vault at (60,83): deepest visible open vault with a massive isolated cylindrical machine on structural mounts, thick cut walls and an access door from the lowest corridor.
Prioritize clearly distinguishable open rooms at these locations. All passages must terminate in real door openings; machinery cables and pipes physically enter their housings. Gold conduit integrates with this multi-level foundation.
Avoid: text, leaders, markers, labels, UI, pictograms, watermarks, borders, diagram dots or arrows. No people, bodies, figurative statues, chaos symbols, factions, colored gods, throne or giant gate. No atmospheric arcs or floating energy bubbles. One complete image only.
```

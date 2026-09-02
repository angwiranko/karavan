# Astronomicon Plates

Five AI-generated architectural plates created for Terra Ostroma on 2026-09-02.
All PNG files are 1672 x 941 pixels. The generation prompts requested larger
images, but these are the actual delivered dimensions, not upscaled versions.

| Asset | Subject |
| --- | --- |
| overview.png | Complete tower, mountain fortress and orbital patrol |
| fortress.png | Fortress cutaway, reception route and underground machinery |
| plasma.png | Lower plasma column, containment and instrumentation |
| core.png | Command, tuning and resource cores |
| warp.png | Upper corona rings and the transition beyond material space |

## Provenance

The existing `../eternity-gate/overview.png` was supplied as a style reference.
It was not reused as Astronomicon architecture. Generated images were copied
without raster editing. Interactive markers, contour highlights, particle flows,
altitude labels and the warp fade are separate HTML/SVG/CSS layers.

The exact submitted prompts, output paths and image notes are retained in:

- [Overview and fortress](prompts-overview-fortress.md)
- [Plasma and core](prompts-plasma-core.md)
- [Warp boundary](prompts-warp.md)

Only fictional, player-facing campaign facts are included in the site data.
The temperature is an in-setting estimate, not a real scientific measurement.
Control ownership, faction takeover plans and alternative faction colours are
not published in the Astronomicon page.

The height axis uses the campaign's 888 km height. The approximate 12-50 km
stratospheric band uses [NASA's atmospheric layer reference](https://science.nasa.gov/earth/earth-atmosphere/earths-atmosphere-a-multi-layered-cake/).
It is a contextual terrestrial altitude guide, not a simulation of Terra's weather.

## Implementation

Scene data and calibrated coordinates: `../../../terra-ostroma-astronomicon.js`.
Viewer: `../../../terra-ostroma-atlas.js`.
The illustration and overlays share one transform and the PNG's aspect ratio.
Four close-ups are separate detailed plates, not enlargements of the overview.
The source portraits elsewhere in Terra Ostroma have not been changed.

Verification: `node --test terra-ostroma-eternity-gate.test.cjs terra-ostroma-pages.test.cjs`
from the repository root. Tests use a deterministic UI adapter, not browser
screenshots or a live Google Sheets connection.

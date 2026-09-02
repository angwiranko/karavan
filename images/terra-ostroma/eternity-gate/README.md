# Eternity Gate artwork

Reference: the user-supplied `Codex-kép 2026. szept. 2. 17_32_27.png`.
The original reference has not been modified.

These six separate PNG assets were created with the built-in `image_gen` tool,
not the API/CLI fallback. Every output is 1672 x 941 pixels. Higher resolution
was requested, but the generator returned the reference canvas dimensions.
The detail images are newly rendered close-up scenes, not crops or upscales.

| File | Scene | Prompt record |
| --- | --- | --- |
| [overview.png](overview.png) | Full palace, annotations removed, undercity refined | [Overview and outer](prompts-overview-outer.md) |
| [outer.png](outer.png) | Outer gate, audience hall and guard rooms | [Overview and outer](prompts-overview-outer.md) |
| [city.png](city.png) | Inner city, archive, chapel and lift | [City and undercity](prompts-city-undercity.md) |
| [undercity.png](undercity.png) | Cable cathedral, crypt, Sisters of Silence and reactor | [City and undercity](prompts-city-undercity.md) |
| [gate.png](gate.png) | Eternity Gate and its locking mechanisms | [Gate and throne](prompts-gate-throne.md) |
| [throne.png](throne.png) | Golden Throne, Webway and support machinery | [Gate and throne](prompts-gate-throne.md) |

The page uses separate HTML annotations and SVG masks/energy traces. Source-pixel
coordinates for the final artwork are recorded in the page's dedicated script;
image, masks and hotspots share one transform. Replacing an image requires
checking the corresponding anchors and paths. The enlarged scenes preserve the
architectural visual language; they are campaign illustrations, not surveyed
floor plans or official canon schematics.

No other Terra Ostroma page, character asset, data store or Google Sheets
integration is changed by this viewer.

Interface icons: Lucide, with upstream license notices in [LICENSE-icons.txt](LICENSE-icons.txt).

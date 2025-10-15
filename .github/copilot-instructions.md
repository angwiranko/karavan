# Copilot Instructions for `karavan` Codebase

## Big Picture Architecture
- This is a static HTML/JS project for interactive battlemap/counter/starfort tools, with all logic and UI contained in HTML files (`battlemap.html`, `counters.html`, `starfort.html`).
- No build system, package manager, or external JS dependencies are present; all code runs client-side in the browser.
- Images are stored in the `images/` directory and referenced directly in HTML/CSS.

## Key Patterns & Conventions
- **State Management:** Each tool (e.g., `starfort.html`) uses a local JS object for state, with persistence via `localStorage` under a unique key (e.g., `starfort-hub-state-v1`).
- **Data Loading:** Optionally, data can be loaded from a Google Sheet using a gviz API URL. See the `SHEET_URL` constant and `loadFromSheet()` function in `starfort.html` for the pattern.
- **UI Rendering:** All UI is dynamically generated using vanilla JS DOM manipulation. Major UI sections (location selector, alert bar, sector cards) are rendered from state objects.
- **Hungarian Language:** Most UI labels and comments are in Hungarian. Maintain this convention for new features unless otherwise specified.
- **Sector/Category/Item Structure:** Data is organized as locations → sectors → categories → items, with each item having a status (`info` or `insider`). Asset slots are visually tracked and linked to insider count.
- **No Frameworks:** Do not introduce frameworks (React, Vue, etc.) or build tools unless explicitly requested.

## Developer Workflows
- **Debugging:** Use browser DevTools for JS debugging and inspecting state. No automated tests or build steps are present.
- **Adding Features:** Extend the relevant HTML file with new JS functions and UI elements. Follow the modular structure seen in `starfort.html` (e.g., keep state logic, rendering, and event handling grouped).
- **Persistence:** Always update localStorage when mutating state, and call rendering functions to refresh the UI.
- **Google Sheet Integration:** To enable external data, set `SHEET_URL` to a valid gviz endpoint. See comments in `starfort.html` for the expected format.

## Integration Points
- **Images:** Place new images in `images/` and reference with relative paths.
- **External Data:** Only Google Sheets via gviz API are supported for external data loading.

## Examples
- See `starfort.html` for patterns: `fallbackState`, `loadFromSheet()`, `renderLocation()`, and event delegation for UI interactivity.

## File Reference
- Main files: `battlemap.html`, `counters.html`, `starfort.html`
- Assets: `images/`

---
For questions or unclear conventions, review the relevant HTML file for examples or ask for clarification.

# Earth Texture Assets

- `earth_daymap_8k.jpg`: Solar System Scope Earth Day Map texture. Source: https://www.solarsystemscope.com/textures/
- `earth_nightmap_8k.jpg`: Solar System Scope Earth Night Map texture. Source: https://www.solarsystemscope.com/textures/
- `earth_clouds_8k.jpg`: Solar System Scope Earth Clouds texture. Source: https://www.solarsystemscope.com/textures/
- `earth_normal_map_8k.tif` / `earth_normal_map_8k.png` / `earth_normal_map_8k.webp` / `earth_normal_map_8k_uastc.ktx2`: Solar System Scope Earth Normal Map texture, converted to PNG fallback, lossless WebP, and UASTC KTX2 normal-map delivery for modern Three.js loading. Source: https://www.solarsystemscope.com/textures/
- `earth_specular_map_8k.tif` / `earth_specular_map_8k.png`: Solar System Scope Earth Specular Map texture, converted to PNG for browser loading. Source: https://www.solarsystemscope.com/textures/
- `earth_bedrock_bathymetry_normal_8k.png` / `earth_bedrock_bathymetry_normal_8ki.webp` / `earth_bedrock_bathymetry_normal_8ki_uastc.ktx2`: generated from NOAA ETOPO1 Bedrock global relief, including ocean bathymetry. PNG remains the fallback; lossless WebP and UASTC KTX2 are used by modern browsers. Source: https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/bedrock/grid_registered/georeferenced_tiff/
- `earth_bedrock_bathymetry_color_8k.jpg`: optional dry/ocean-floor color map generated from the same NOAA ETOPO1 Bedrock source.
- `moon_color_lroc_4k.jpg`: browser-ready JPG generated from the NASA Scientific Visualization Studio CGI Moon Kit LRO color texture. Source: https://svs.gsfc.nasa.gov/4720/
- `moon_bump_lola_4k.jpg` / `moon_normal_lola_4k.png` / `moon_normal_lola_4k.webp` / `moon_normal_lola_4k_uastc.ktx2`: derived browser-ready bump and normal maps generated from the NASA Scientific Visualization Studio CGI Moon Kit LOLA elevation map. PNG remains the fallback; lossless WebP and UASTC KTX2 are used by modern browsers. Source: https://svs.gsfc.nasa.gov/4720/
- `moon_nightmap_4k.jpg`: temporary test texture resized from `earth_nightmap_8ki.jpg` to exercise the Luna night-glow renderer. This is not a real lunar city-light data source and should be replaced with project art or a lore map later.
- `earth_daymap_2k.jpg`: NASA Blue Marble fallback, land surface, ocean color, and sea ice. Source: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg
- `earth_clouds_2k.jpg`, `earth_normal_map_2k.*`, `earth_specular_map_2k.*`: lower-resolution Solar System Scope fallbacks.

Solar System Scope states its texture pack is distributed under Creative Commons Attribution 4.0 International.

KTX2 files were locally derived from vertically flipped copies of the listed PNG normal maps with Khronos `toktx` via the `ktx2tools` package, using UASTC encoding, generated mipmaps, linear transfer, RGB target type, and `rgb1` input swizzle so they remain non-color normal-map data. The flip matches Three.js r122 image-texture upload orientation.

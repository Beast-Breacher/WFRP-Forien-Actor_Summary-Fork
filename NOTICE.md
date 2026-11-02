# Attribution and source provenance

This is a compatibility maintenance fork of **Forien's Actors Summary**, original author **Forien**, upstream repository https://github.com/Foundry-Workshop/forien-actors-summary.

Input: user-supplied `forien-actors-summary.zip`, original version `0.1.3-beta`.
SHA-256: `58425B14C4FDF3199C6440853ECC554586573E28BB5FF4CA2B4F9395472E0764`.

Fork maintainer: **Beast-Breacher**. Changes dated 2026-11-03. The module ID and world setting keys are unchanged. Original MPL-2.0 license is included without changes. Modified covered files remain available as source in this repository and distribution; the JavaScript supplied upstream was already a readable compiled bundle with embedded Svelte/TRL runtime. Those runtimes have not been replaced.

Modified: application portions of `forien-actors-summary.js`, manifest, README and changelog. Added: compatibility helpers, tests, build/release tooling and documentation. Moved to tools/upstream for reference: original JavaScript source map with embedded source content; it is no longer linked by the modified bundle. Removed from runtime: obsolete JavaScript source map and transient LevelDB `LOCK`/`LOG` files. The LevelDB data files including `000003.log`, `CURRENT` and `MANIFEST-000002` are preserved byte for byte. Styles, CSS source map, English translation and original license are preserved byte for byte.

This fork is not an official upstream release. Original project links in this document identify provenance; installation and updates use the fork's release manifest.

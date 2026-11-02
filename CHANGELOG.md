# Changelog

## v0.1.4-beta.2
* Make the summary window title and header text white for contrast with dark system themes.
* Keep the verified core version at the live-tested Foundry 14.369 and publish a new version so normal module updates refresh cached package metadata.
* Preserve the original stylesheet and source map; the override is a separate compatibility.css.

## v0.1.4-beta.1 (compatibility fork)
* Target Foundry 11–14 with local API aliases and both scene-control formats.
* Guard malformed drops, invalid session state, missing actors and stale IDs.
* Destroy document stores when actor components unmount.
* Fix unmatched RegExp names, optional fields, nested arrays and boolean attributes.
* Clamp column count to the existing 1–6 CSS layouts.
* Add regression tests, reproducible release packaging and GitHub Actions.
* Preserve module ID, original settings, Svelte interface and compendium.
* Live smoke tests passed on Foundry 14.369 with WFRP4e 10.1.2; verified is now 14.369. Generations 11–13 have not been separately runtime-tested.
* Restore local fallbacks for removed MIN_WINDOW_HEIGHT/MIN_WINDOW_WIDTH globals.
* Serialize rapid setting changes and recover from failed setting writes.

## v0.1.3-beta
* Added support for Actors' Attributes as filters
* Added support for "disabling" filters, making them inactive, so it's now possible to hide sections without deleting them
* Updated example macros to support above options

## v0.1.2-beta
* Right-clicking on Actor header now opens the Actor's sheet
* Right-clicking on Item now opens the Item's sheet
* Added support for longer text in Additional fields
* Added support for specifying Additional field's "Label"

## v0.1.1-beta
* fixed the release workflow not attaching scripts

## v0.1.0-beta
* initial release

## Forien's Actors Summary 0.1.4-beta.1

Compatibility maintenance fork of Forien's original 0.1.3-beta module. The original interface, module ID, world settings and filter preset compendium are preserved.

- Target Foundry VTT 11–14; live-tested on **14.369 with WFRP4e 10.1.2**. Generations 11–13 have not been separately runtime-tested.
- Fix modern scene controls and relocated APIs, including removed legacy window-size constants.
- Guard malformed drops and stale/deleted actors; release document subscriptions when cards close.
- Fix rapid settings saves, optional attribute values, nested arrays, RegExp name fallback and column limits.
- 16 regression and packaging tests passed, plus live-world smoke checks for rendering, filters, updates, compendium access, reopening and actor deletion.

### Install in Foundry

Paste this URL into **Add-on Modules → Install Module → Manifest URL**:

https://github.com/Beast-Breacher/WFRP-Forien-Actor_Summary-Fork/releases/latest/download/module.json

Assets: `module.json` and `forien-actors-summary.zip`. Use the attached module ZIP rather than GitHub's generated Source code ZIP for manual installation. Do not install the original and fork as separate modules with the same ID.

See README for usage, TESTING.md for validation limits and NOTICE.md / LICENSE for attribution and MPL-2.0 terms. This is a beta maintenance release, not an official upstream release.

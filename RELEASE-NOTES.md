## Forien's Actors Summary 0.1.4-beta.2

This update makes the Actors Summary window title and header text **white**, improving contrast with dark Foundry/system themes. The original interface, module ID, world settings and filter preset compendium are preserved.

- Target Foundry VTT 11–14; live-tested on **14.369 with WFRP4e 10.1.2**. Generations 11–13 have not been separately runtime-tested.
- `compatibility.verified` remains **14.369**, the version actually tested in a live WFRP4e world.
- The new package version allows Foundry's normal update flow to refresh stale compatibility information from older installs.
- White text is implemented in a small separate stylesheet; the original stylesheet and its source map are unchanged.
- Existing compatibility and stability fixes from beta.1 are retained. 16 regression and packaging tests passed.

If Foundry still reports "verified on version 11", return to Setup, update the module and restart the Foundry server. Refreshing only the browser tab does not reread a package manifest replaced on disk while the server was running.

### Install in Foundry

Paste this URL into **Add-on Modules → Install Module → Manifest URL**:

https://github.com/Beast-Breacher/WFRP-Forien-Actor_Summary-Fork/releases/latest/download/module.json

Assets: `module.json` and `forien-actors-summary.zip`. Use the attached module ZIP rather than GitHub's generated Source code ZIP for manual installation. Do not install the original and fork as separate modules with the same ID.

See README for usage, TESTING.md for validation limits and NOTICE.md / LICENSE for attribution and MPL-2.0 terms. This is a beta maintenance release, not an official upstream release.

# Battery Sim Suite — Releases

Installer and add-on releases for **Battery Sim Suite**, a Windows desktop application for battery pack simulation with equivalent-circuit and electrochemical cell models.

**Website:** https://sohamdange.github.io/battery-sim-releases

## Download

- **App:** the Windows installer is on the [Downloads page](https://sohamdange.github.io/battery-sim-releases/downloads/), or attached to the latest `v*` release on the [Releases](https://github.com/sohamdange/battery-sim-releases/releases) page.
- **Electrochemical Models Add-On:** install it from inside the app (**Settings → About → Install**). For offline computers, download the add-on zip and its `.json` listing from the latest `addon-*` release and use **Install from file**.

A licence key is required to run the app. Keys are currently free: [get one here](https://sohamdange.github.io/battery-sim-releases/licence/).

## System Requirements

- Windows 10 or Windows 11 (64-bit)
- ~500 MB disk space (more with the add-on installed)
- 4 GB RAM minimum (8 GB recommended for large packs)
- No additional runtime or Python installation required

## Contact

soham.perpetual@gmail.com

## Website source

The website lives in [`docs/`](docs/) and is built by GitHub Pages with Jekyll.
Release and download links, and the Content-Security-Policy, are kept in
`docs/_data/release_links.yml`, `docs/assets/js/release-info.js` and
`docs/_includes/csp.html`, which the "Guard protected changes" check watches.

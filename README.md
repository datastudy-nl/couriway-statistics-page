# Couriway Statistics Page

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./package.json)
[![Static Site](https://img.shields.io/badge/build-static%20site-lightgrey.svg)](#)

A lightweight, static statistics dashboard for Couriway's **100K Seeds Minecraft Speedrun Challenge**. This project is designed to be served as a simple static website and developed locally with a minimal setup.

## Features / Highlights

- Static, client-side dashboard (no backend required)
- Simple local development server via `python -m http.server`
- Clean separation of concerns:
  - UI markup (`index.html`)
  - Styling (`styles.css`)
  - Dashboard logic (`app.js`)
- Easy to host on any static hosting provider (e.g., GitHub Pages)

## Prerequisites

- One of the following:
  - **Python 3** (recommended for the included dev server), or
  - Any static file server of your choice
- Optional:
  - **Node.js + npm** (only needed if you want to use the npm scripts)

## Installation

1. Clone the repository:
   - `git clone https://github.com/datastudy-nl/couriway-statistics-page.git`
   - `cd couriway-statistics-page`

2. (Optional) Install npm dependencies  
   This project does not require dependencies by default, but you can still use npm scripts:
   - `npm install`

## Usage

### Run locally (recommended)

Using npm (wraps Python’s built-in static server):

- Start the local server:
  - `npm run dev`

This serves the site on:
- http://localhost:3000

### Run locally without npm

If you prefer to skip npm entirely:

- `python -m http.server 3000`

Then open:
- http://localhost:3000

### Deploy

Because this is a static site, deployment is as simple as serving these files:

- `index.html`
- `styles.css`
- `app.js`

If using GitHub Pages, ensure the repository is configured to publish from the correct branch/folder. The presence of `CNAME` indicates it may be set up for a custom domain.

## Configuration

This project is intended to be configuration-light.

- **Custom domain:**  
  - `CNAME` is used by GitHub Pages for a custom domain configuration.
- **Dashboard behavior / data sources:**  
  - If you need to adjust how statistics are loaded, processed, or displayed, look in `app.js` for the relevant logic.

If you add environment-specific configuration, consider documenting it here and keeping secrets out of the repository (this project is static and should not require secrets).

## Project Structure

- `index.html` — Main page markup for the dashboard
- `styles.css` — Styling for the UI
- `app.js` — Client-side JavaScript powering the dashboard (data loading, rendering, interactivity)
- `package.json` — Project metadata and convenience scripts for local serving
- `CNAME` — Custom domain setting for GitHub Pages (if applicable)

## Contributing

Contributions are welcome. Please see:
- `CONTRIBUTING.md`

## License

Licensed under the **MIT License**. See the license field in `package.json` or add a dedicated `LICENSE` file if you want the full text checked into the repository.
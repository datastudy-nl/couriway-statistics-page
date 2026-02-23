# Contributing to couriway-statistics-page

Thanks for your interest in contributing to **couriway-statistics-page**! This project is a lightweight, static HTML/CSS/JavaScript dashboard for **Couriway’s 100K Seeds Minecraft Speedrun Challenge** statistics. Contributions of all kinds are welcome: bug reports, feature ideas, documentation improvements, and code changes.

This guide explains how to set up the project locally, propose changes, and submit high-quality pull requests.

## Table of Contents

- [Ways to contribute](#ways-to-contribute)
- [Reporting bugs](#reporting-bugs)
- [Suggesting features](#suggesting-features)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Code style and guidelines](#code-style-and-guidelines)
- [Pull request process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)

## Ways to contribute

You can help by:

- Reporting bugs and regressions
- Suggesting improvements or new dashboard features
- Fixing issues (small or large)
- Improving UI/UX (CSS), performance, or accessibility
- Updating documentation or adding comments for clarity
- Refining copy, labels, and user-facing text

If you’re unsure where to start, open an issue describing what you’d like to work on and what part of the page it affects.

## Reporting bugs

Please open an issue with enough detail for someone else to reproduce and diagnose the problem.

### Before filing a bug report

- Check existing issues to avoid duplicates.
- Try to reproduce the bug in a clean environment:
  - Hard refresh (Ctrl/Cmd + Shift + R)
  - Private window
  - Disable extensions if relevant
- If the project is deployed (e.g., GitHub Pages), test both locally and on the hosted site if possible.

### What to include

Include as many of the following as you can:

- **Summary**: what happened vs. what you expected
- **Steps to reproduce**: numbered steps
- **Expected behavior** and **actual behavior**
- **Screenshots / screen recordings** (if UI-related)
- **Browser + version** (e.g., Chrome 121, Firefox 122)
- **OS** (Windows/macOS/Linux)
- **Console errors**: copy/paste from DevTools Console
- **Network details** (if data fetching is involved):
  - failing requests
  - status codes
  - response snippets (remove sensitive info)
- **Relevant files/lines**: if you already located the problem

### Bug report template (recommended)

- **Description**:
- **Steps to reproduce**:
  1.
  2.
  3.
- **Expected**:
- **Actual**:
- **Environment**:
  - Browser:
  - OS:
- **Console output / errors**:
- **Network (if applicable)**:
- **Additional context**:

## Suggesting features

Feature suggestions are welcome. Please open an issue and provide:

- **Problem statement**: what pain point or goal this addresses
- **Proposed solution**: what you’d like to see happen
- **Alternatives considered**: other approaches you considered
- **Scope**: small/medium/large (best guess)
- **Mockups or examples** (if UI-related): sketches, screenshots, links
- **Acceptance criteria**: how we’ll know it’s done

If you’re willing to implement it, mention that in the issue so we can align on approach before you invest time.

## Development setup

This repository is a static site. There is no build step required; development is done by running a local static server so that browser APIs (like `fetch`) work consistently.

### Prerequisites

- **Python 3** (recommended and used by the npm scripts)
- Optional:
  - **Node.js + npm** (only for running the convenience scripts; the app itself has no runtime dependencies)
  - A modern browser (Chrome/Firefox/Safari/Edge)

### Getting the code

1. Fork the repo on GitHub (recommended), then clone your fork:
   - `git clone https://github.com/<your-username>/couriway-statistics-page.git`
2. Go to the project directory:
   - `cd couriway-statistics-page`

### Run locally (recommended)

Using the provided npm scripts:

1. (Optional) Install npm dependencies:
   - `npm install`
   - Note: there are currently no dependencies; this step is safe but not required.
2. Start the dev server:
   - `npm run dev`
3. Open the site in your browser:
   - http://localhost:3000

### Run locally (without npm)

If you don’t want to use npm, you can run a static server directly:

- Python:
  - `python -m http.server 3000`
- If port 3000 is taken:
  - `python -m http.server 8080`

### Troubleshooting

- **Blank page or stale changes**: hard refresh your browser cache.
- **Fetch/CORS issues**: always use a local server (not `file://`) while developing.
- **Port already in use**: use a different port and update the URL accordingly.

## Project structure

The repository is intentionally simple:

- `index.html` — Page structure and script/style includes
- `styles.css` — Styling for the dashboard
- `app.js` — Main client-side logic (data fetching, parsing, rendering, interactions)
- `CNAME` — Custom domain configuration for GitHub Pages (if applicable)
- `package.json` — Convenience scripts for local development
- `README.md` — Project overview and usage (if present)
- `CONTRIBUTING.md` — This guide

If you add new files, prefer keeping the structure simple and documented. If you introduce a new module or utility file, consider a small `js/` or `src/` folder and update this section accordingly.

## Code style and guidelines

There is currently no enforced linter/formatter in the repository. Please follow these conventions to keep the code consistent and easy to review.

### General

- Keep changes focused. Avoid unrelated refactors in the same PR.
- Prefer readability and clarity over cleverness.
- Avoid introducing heavy dependencies unless there is a strong reason.
- Keep the dashboard working in modern browsers.
- When changing behavior, update any relevant text/help content in the UI and/or README.

### JavaScript

- Match existing formatting and patterns in `app.js`.
- Use `const`/`let` (avoid `var`).
- Prefer small helper functions for repeated logic.
- Handle errors gracefully:
  - Show user-friendly messages for failed fetches or unexpected data.
  - Avoid unhandled promise rejections.
- Be mindful of performance:
  - Avoid unnecessary re-renders inside loops.
  - Cache derived values when appropriate.
- Avoid mutating shared/global state unless necessary; document it when you do.
- If you add non-obvious parsing or transformation logic, add brief inline comments explaining intent.

### HTML/CSS

- Keep HTML semantic (use appropriate elements).
- Keep CSS maintainable:
  - Prefer reusable classes
  - Avoid overly specific selectors
  - Keep layout and component rules organized
- Consider accessibility:
  - Color contrast
  - Keyboard navigation where relevant
  - Labels for controls
  - Sensible focus styles
- Ensure the page is responsive (desktop + mobile).

### UI/UX expectations (practical checklist)

If your change affects visuals or interaction:

- Test at a narrow viewport (mobile-like) and a wide viewport (desktop).
- Ensure important content isn’t clipped or overflowed.
- Avoid adding motion/animations that could be distracting; if you do, keep it subtle.

### Optional tooling (welcome as a contribution)

If you’d like to add consistent formatting/linting, propose it in an issue or PR (e.g., Prettier + ESLint). Keep configuration minimal and document how to run it. Prefer tooling that works with a static project and doesn’t add a heavy build step unless clearly beneficial.

## Pull request process

### Before you open a PR

- For non-trivial changes, create (or comment on) an issue describing the change.
- Create a new branch from `main`:
  - `git checkout -b <type>/<short-description>`
  - Examples:
    - `fix/chart-legend-overflow`
    - `feat/filter-by-category`
    - `docs/update-readme`

### PR requirements

Your PR should:

- Clearly describe **what** changed and **why**
- Link relevant issues (e.g., “Closes #12”)
- Include screenshots/GIFs for UI changes (before/after if helpful)
- Keep the diff as small as possible for the intended change
- Not break existing functionality

### Testing checklist (manual)

Since this is a static frontend project, manual verification is important:

- Load the page locally and verify the dashboard renders correctly.
- Open DevTools Console and ensure there are no errors or warnings introduced by your change.
- Test key interactions (filters, sorting, toggles, etc. if applicable).
- Verify responsiveness (narrow viewport/mobile).
- If your change is browser-sensitive, test at least one additional browser.

### Commit messages

Use clear, descriptive commit messages. Conventional Commits are encouraged but not required.

Examples:

- `Fix stats table alignment on mobile`
- `Add loading state for data fetch`
- `Refactor chart rendering helpers`
- `Docs: clarify local dev server usage`

### Review and merge

- Be responsive to review feedback and questions.
- If changes are requested, push updates to the same branch/PR.
- A maintainer will merge once approved.

### What maintainers look for

- Correctness and robustness (especially around data parsing and error handling)
- Clear UI behavior and consistent styling
- Minimal complexity for the value added
- Good defaults (sensible loading/error states)

## Code of Conduct

This project follows the **Contributor Covenant Code of Conduct**.

- Reference: https://www.contributor-covenant.org/version/2/1/code_of_conduct/

By participating, you’re expected to uphold respectful, inclusive behavior in issues, pull requests, and other project spaces.

If you experience or witness unacceptable behavior, please open an issue (if appropriate) or contact the repository owner/maintainers via GitHub.
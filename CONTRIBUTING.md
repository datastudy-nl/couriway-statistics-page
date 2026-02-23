# Contributing to couriway-statistics-page

Thanks for your interest in contributing to **couriway-statistics-page**! This project is a lightweight, static JavaScript dashboard for **Couriway’s 100K Seeds Minecraft Speedrun Challenge** statistics. Contributions of all kinds are welcome: bug reports, feature ideas, documentation improvements, and code changes.

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

If you’re unsure where to start, open an issue describing what you’d like to work on.

## Reporting bugs

Please open an issue with enough detail for someone else to reproduce and diagnose the problem.

### Before filing a bug report

- Check existing issues to avoid duplicates.
- Try to reproduce the bug in a clean environment (e.g., hard refresh, private window).
- If the project is hosted on GitHub Pages (or similar), test both locally and on the hosted site if possible.

### What to include

Include as many of the following as you can:

- **Summary**: what happened vs. what you expected
- **Steps to reproduce**: numbered steps
- **Expected behavior** and **actual behavior**
- **Screenshots / screen recordings** (if UI-related)
- **Browser + version** (e.g., Chrome 121, Firefox 122)
- **OS** (Windows/macOS/Linux)
- **Console errors**: copy/paste from DevTools Console
- **Network details** (if data fetching is involved): failing requests, status codes, response snippets
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

This repository is a static site (HTML/CSS/JavaScript). There is no build step required; development is done by running a local static server.

### Prerequisites

- **Python 3** (used to run a local dev server)
- Optionally:
  - **Node.js + npm** (not required for runtime, but useful if you add tooling like linters/tests later)
  - A modern browser (Chrome/Firefox/Safari/Edge)

### Install / run locally

1. Fork the repo on GitHub (recommended), then clone your fork:
   - `git clone https://github.com/<your-username>/couriway-statistics-page.git`
2. Go to the project directory:
   - `cd couriway-statistics-page`
3. Start the dev server (served at port 3000):
   - `npm install` (optional; there are no dependencies, but it’s fine to run)
   - `npm run dev`
4. Open:
   - http://localhost:3000

### Notes

- The `dev` and `start` scripts in `package.json` both run `python -m http.server 3000`.
- If port 3000 is taken, you can run Python manually on another port:
  - `python -m http.server 8080`

## Project structure

The repository is intentionally simple:

- `index.html` — Page structure and script/style includes
- `styles.css` — Styling for the dashboard
- `app.js` — Main client-side logic (data fetching, parsing, rendering, interactions)
- `CNAME` — Custom domain configuration for GitHub Pages (if applicable)
- `package.json` — Convenience scripts for local development

If you add new files, prefer keeping the structure simple and documented.

## Code style and guidelines

There is currently no enforced linter/formatter in the repository. Please follow these conventions to keep the code consistent and reviewable.

### General

- Keep changes focused. Avoid unrelated refactors in the same PR.
- Prefer readability and clarity over cleverness.
- Avoid introducing heavy dependencies unless there is a strong reason.
- Ensure the dashboard works in modern browsers.

### JavaScript

- Use consistent formatting (2 spaces or 4 spaces—match existing style in `app.js`).
- Use `const`/`let` (avoid `var`).
- Prefer small, pure helper functions where practical.
- Handle errors gracefully:
  - Show user-friendly messages for failed fetches or unexpected data.
  - Avoid unhandled promise rejections.
- Avoid mutating shared state unless necessary; document it when you do.
- If you introduce new data transformations, add inline comments for non-obvious logic.

### HTML/CSS

- Keep HTML semantic (use appropriate elements).
- Keep CSS maintainable:
  - Prefer reusable classes
  - Avoid overly specific selectors
- Consider accessibility:
  - Color contrast
  - Keyboard navigation where relevant
  - Labels for controls
- Ensure the page is responsive (desktop + mobile).

### Optional tooling (welcome as a contribution)

If you’d like to add consistent formatting/linting, propose it in an issue or PR (e.g., Prettier + ESLint). Keep configuration minimal and document how to use it.

## Pull request process

### Before you open a PR

- Create (or comment on) an issue describing the change, especially for larger work.
- Create a new branch from `main`:
  - `git checkout -b <type>/<short-description>`
  - Examples:
    - `fix/chart-legend-overflow`
    - `feat/filter-by-category`
    - `docs/update-readme`

### PR requirements

Your PR should:

- Clearly describe **what** changed and **why**
- Include screenshots/GIFs for UI changes (before/after if helpful)
- Keep the diff as small as possible for the intended change
- Not break existing functionality

### Testing checklist (manual)

Since this is a static frontend project, manual verification is important:

- Load the page locally and verify the dashboard renders correctly.
- Open DevTools Console and ensure there are no errors.
- Test key interactions (filters, sorting, toggles, etc. if applicable).
- Verify responsiveness (narrow viewport/mobile).
- Verify behavior on at least one additional browser if your change is browser-sensitive.

### Commit messages

Use clear, descriptive commit messages. Conventional Commits are encouraged but not required. Examples:

- `Fix stats table alignment on mobile`
- `Add loading state for data fetch`
- `Refactor chart rendering helpers`

### Review and merge

- Be responsive to review feedback and questions.
- If changes are requested, update the same PR.
- Once approved, a maintainer will merge your PR.

## Code of Conduct

This project follows the **Contributor Covenant Code of Conduct**.

- Reference: https://www.contributor-covenant.org/version/2/1/code_of_conduct/

By participating, you’re expected to uphold respectful, inclusive behavior in issues, pull requests, and other project spaces.

If you experience or witness unacceptable behavior, please open an issue (if appropriate) or contact the repository owner/maintainers via GitHub.
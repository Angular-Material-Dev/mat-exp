# Contributing to Mat Expressive

Thank you for contributing! This guide covers local development, testing, and commit conventions.

## Table of Contents

- [Development Setup](#development-setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Commit Convention](#commit-convention)

## Development Setup

**Prerequisites:** Node.js ≥ 20, npm ≥ 10

```bash
git clone https://github.com/Angular-Material-Dev/mat-expr.git
cd mat-expressive
npm install
```

## Running the Project

The workspace contains two Angular projects: the library and the docs app.

```bash
# Build the library first (required before serving docs)
npm run build:lib

# Serve the docs app on http://localhost:4200
npm start

# Watch-build the library during development
npm run watch:lib
```

## Testing

```bash
# Docs app unit tests (Vitest)
npm test

# Library tests only
ng test --project @ngm-dev/mat-exp

# Run a single test file
ng test --project mat-exp-docs --testPathPattern="foo"

# End-to-end tests (Playwright — spins up a dev server automatically)
ng e2e

# Lint
ng lint
```

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitizen:

```bash
npm run commit
```

Use this instead of `git commit` to get an interactive prompt that formats your message correctly. semantic-release uses commit messages to determine version bumps and generate changelogs.

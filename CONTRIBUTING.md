# Contributing to Native UI

Thank you for helping make semantic HTML more attractive and practical.

## Before opening code

1. Search existing issues and specifications.
2. Open a proposal for public API, behavior, browser-support, or dependency changes.
3. Describe the user problem, native primitive considered, no-JavaScript path, accessibility contract, and author override.
4. Wait for agreement on the specification before implementation.

Small documentation fixes may go directly to a pull request.

## Development workflow

```sh
npm install
npm test
npm run pack:check
```

Changes follow this evidence chain:

```text
requirement → specification → plan → task → failing test → implementation → verification
```

Pull requests must remain focused, link the relevant requirement/task, explain retained JavaScript, and include keyboard/responsive/accessibility evidence where applicable.

## Public API policy

Public CSS selectors, custom properties, data attributes, events, package exports, recipe contracts, and browser requirements are API. Adding one requires:

- manifest entry;
- documented use case;
- no smaller native alternative;
- automated tests;
- example or recipe;
- changelog entry;
- size impact.

## Commit messages

Use concise conventional prefixes such as `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `build:`, and `chore:`. Keep commits reviewable and independently passing where practical.

## Conduct and security

Participation is governed by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Report vulnerabilities privately according to [`SECURITY.md`](SECURITY.md).

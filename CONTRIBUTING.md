# Contributing to Stream Deck SDK

Thank you for your interest in contributing to the Stream Deck SDK! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
    - [Feature Requests](#feature-requests)
    - [Fixing Issues](#fixing-issues)
- [AI Policy](#ai-policy)
- [Development](#development)
    - [Prerequisites](#rrerequisites)
    - [Installation](#installation)
- [Testing](#testing)
    - [Running Tests](#running-tests)
    - [Writing Tests](#writing-tests)
- [Documentation](#documentation)
    - [Generating](#generating)
    - [Writing Guidelines](#writing-guidelines)
- [Code Style](#code-style)
    - [Linting](#linting)
    - [Style Guidelines](#style-guidelines)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors. Please be considerate and professional in all interactions.

## Contributing

Before submitting a pull request, we kindly ask that you first create an issue to discuss your proposed changes. This helps ensure that your contribution aligns with the project's goals, and allows maintainers and the community to provide feedback early in the process.

### Feature Requests

We welcome feature requests; to propose a new feature:

1. Search existing issues to see if it has already been requested.
2. Create a new issue if needed, including:
    - The problem it solves.
    - How you envision it working.
    - Any alternatives you've considered.
    - Whether you're willing to contribute the implementation.

### Fixing Issues

If you find a bug or have a problem with the SDK:

1. Search existing issues to see if it has already been reported.
2. Create a new issue if needed.

## AI Policy

We welcome contributions that leverage AI tools as assistants in the development process. However, we require that:

- You must fully understand all code you submit.
- You are responsible for the quality and correctness of your code.
- Automated or low-quality AI pull requests will be rejected.

## Development

### Prerequisites

- **Node.js 24 or higher** - we recommend using a version manager such as [nvm](https://github.com/nvm-sh/nvm) (macOS) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows).
- **pnpm** - available from [pnpm.io](https://pnpm.io/).

### Installation

1. Install dependencies:

    ```
    pnpm install
    ```

2. Build the project:

    ```
    pnpm build
    ```

3. Start development environment:
    ```
    pnpm dev
    ```

## Testing

We use [Vitest](https://vitest.dev/) for testing. Please ensure all tests pass before submitting your changes.

### Running Tests

- Run all tests:

    ```
    pnpm test
    ```

- Run tests in watch mode:

    ```
    pnpm test:watch
    ```

- Run tests with coverage:
    ```
    pnpm test:coverage
    ```

### Writing Tests

- Place test files in `__tests__` directories next to the code they test
- Name test files with the `.test.ts` pattern (e.g., `action.test.ts`)
- Write clear, descriptive test names that explain what is being tested
- Aim for high test coverage, especially for public APIs and critical functionality

## Documentation

Documentation ships with `@elgato/streamdeck`, and is located in `packages/plugin/docs/`.

### Generating

The references are generated from the build output, and code snippets in `docs/_snippets/` are inlined into the pages.

1. Build the project:

    ```
    pnpm build
    ```

2. Generate the documentation (from `packages/plugin`):

    ```
    pnpm docs:generate
    ```

3. Check the documentation is up to date, lint it, and type check the snippets:

    ```
    pnpm docs:check
    ```

### Writing Guidelines

- Write [GitHub Flavored Markdown](https://github.github.com/gfm/) that renders on GitHub and npm.
- Start every page with a level one heading; frontmatter is limited to `sidebar_label`, `sidebar_position`, and `unlisted`.
- Use [GitHub alerts](https://github.com/orgs/community/discussions/16925) (e.g., `> [!TIP]`) instead of admonitions.
- Add custom anchors with an `<a id="..."></a>` tag on the line before the heading.
- Write tabs with `<Tabs>` and `<TabItem value="Label">`, with a blank line between the tags and their content.
- Link pages with relative `.md` links, and other sites with absolute URLs.
- Reference snippets with an `<!-- snippet: node/path/to/file.ts -->` comment before the code block; highlight lines in the snippet with `// [!code highlight]`.
- Do not edit content between `<!-- generated: id -->` and `<!-- /generated -->` comments.
- Define each directory's `label`, `position`, and `collapsible` in its `_category_.json`.
- Limit HTML to `<Tabs>`, `<TabItem>`, `<details>`, `<summary>`, `<kbd>`, `<sup>`, `<br>`, `<code>`, and `<ul>`/`<li>` in table cells.

Linting rules, and their exceptions, are in `packages/plugin/.markdownlint-cli2.jsonc`.

## Code Style

This project uses ESLint and Oxfmt to maintain consistent code style.

### Linting

- Check for linting errors:

    ```bash
    pnpm lint
    ```

- Auto-fix formatting issues:
    ```bash
    pnpm fmt
    ```

### Style Guidelines

- Use TypeScript for all code.
- Follow existing patterns and conventions in the codebase.
- Write clear, self-documenting code with meaningful variable and function names.
- Add JSDoc comments for public APIs.
- Keep functions focused and concise.

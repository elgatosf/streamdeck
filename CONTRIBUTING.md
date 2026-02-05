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

- **Node.js v20.5.1 or higher** - we recommend using a version manager such as [nvm](https://github.com/nvm-sh/nvm) (macOS) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows).
- **npm** (comes with Node.js).

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Build the project:

    ```bash
    npm run build
    ```

3. Start development environment:
    ```bash
    npm run dev
    ```

## Testing

We use [Vitest](https://vitest.dev/) for testing. Please ensure all tests pass before submitting your changes.

### Running Tests

- Run all tests:

    ```bash
    npm test
    ```

- Run tests in watch mode:

    ```bash
    npm run test:watch
    ```

- Run tests with coverage:
    ```bash
    npm run test:coverage
    ```

### Writing Tests

- Place test files in `__tests__` directories next to the code they test
- Name test files with the `.test.ts` pattern (e.g., `action.test.ts`)
- Write clear, descriptive test names that explain what is being tested
- Aim for high test coverage, especially for public APIs and critical functionality

## Code Style

This project uses ESLint and Prettier to maintain consistent code style.

### Linting

- Check for linting errors:

    ```bash
    npm run lint
    ```

- Auto-fix linting and formatting issues:
    ```bash
    npm run lint:fix
    ```

### Style Guidelines

- Use TypeScript for all code.
- Follow existing patterns and conventions in the codebase.
- Write clear, self-documenting code with meaningful variable and function names.
- Add JSDoc comments for public APIs.
- Keep functions focused and concise.

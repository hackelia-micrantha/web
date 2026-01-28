# Gemini Project: Micrantha Web

This document provides a comprehensive overview of the Micrantha Web project for Gemini, outlining its architecture, key technologies, and operational procedures.

## Project Overview

The Micrantha Web project is a modern, isomorphic React application built with the Remix framework. It serves as the main marketing and informational website for micrantha.com. The application is designed to be lean and efficient, utilizing a minimal setup with a focus on performance and maintainability.

### Key Technologies

- **Framework:** Remix is used for both server-side and client-side rendering, providing a seamless and fast user experience.
- **Language:** The project is written in TypeScript, ensuring type safety and improved developer experience.
- **Styling:** Tailwind CSS is used for styling, following a utility-first approach for rapid UI development. The styles are processed via a CLI pipeline.
- **Linting and Formatting:** The project enforces a consistent code style through ESLint and Prettier.

### Architecture

The application follows the standard Remix project structure:

- `app/`: This directory contains all the core application code, including routes, components, and styles.
- `public/`: This directory is used for static assets such as images, fonts, and the compiled CSS.
- `build/`: This directory holds the production build output.

## Building and Running

The following commands are essential for the development and deployment of the project.

### Requirements

- Node.js version 18 or higher.
- Yarn as the preferred package manager.

### Development

To get started with development, clone the repository and run the following commands:

```sh
yarn install
yarn dev
```

This will start the development server, and you can access the application at `http://localhost:3000`.

### Production

To build the application for production, use the following command:

```sh
yarn build
```

This will create a production-ready build in the `build/` and `public/build/` directories. To run the production server, use:

```sh
yarn start
```

### Docker

The project can also be containerized using Docker. The following commands can be used to build and run the Docker image:

```sh
make image
make run
```

Alternatively, you can use the standard Docker commands:

```sh
docker build -t micrantha/web .
docker run --rm -p 3000:3000 micrantha/web
```

## Development Conventions

### Coding Style

The project follows the standard React and TypeScript best practices. The code is formatted using Prettier and linted with ESLint to ensure consistency and readability. The ESLint configuration is based on the recommended rules for JavaScript, TypeScript, and React.

### Testing

The `README.md` and `package.json` do not contain information about the testing practices.

### Contribution Guidelines

The `README.md` and `package.json` do not contain information about the contribution guidelines.

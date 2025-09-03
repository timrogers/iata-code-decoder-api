# Contributing to IATA Code Decoder API

Thank you for your interest in contributing to the IATA Code Decoder API! This project provides a simple API for identifying airports, airlines, and aircraft by their IATA codes, serving both traditional REST API clients and AI systems through the Model Context Protocol (MCP).

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Code Style and Standards](#code-style-and-standards)
- [Making Changes](#making-changes)
- [Working with Data](#working-with-data)
- [API Development](#api-development)
- [MCP Server Development](#mcp-server-development)
- [Docker Development](#docker-development)
- [Testing and Validation](#testing-and-validation)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Reporting Issues](#reporting-issues)
- [Code of Conduct](#code-of-conduct)

## Development Environment Setup

### Prerequisites

- **Node.js v24** (v24.4.1 is recommended) - This project specifically requires Node.js v24
- **npm** (comes with Node.js)
- **Git**
- **Docker** (optional, for containerized development)

### Environment Variables

You'll need a Duffel API access token for updating cached data:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your Duffel access token:
   ```
   PORT=4000
   DUFFEL_ACCESS_TOKEN=your_actual_token_here
   ```

   > **Note**: The Duffel access token is only required if you plan to update the cached airport, airline, or aircraft data. For general API development, you can use the dummy token provided in `.env.example`.

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iata-code-decoder-api.git
   cd iata-code-decoder-api
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/timrogers/iata-code-decoder-api.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables** (see [Environment Variables](#environment-variables))

6. **Build the project**:
   ```bash
   npm run build
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

8. **Test the API**:
   Visit `http://localhost:4000/airports?query=LHR` in your browser to see information about Heathrow airport.

## Project Structure

```
├── src/                    # TypeScript source code
│   ├── api.ts             # Main Express application and routes
│   ├── index.ts           # Application entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   ├── airports.ts        # Airport data loading
│   ├── airlines.ts        # Airline data loading
│   └── aircraft.ts        # Aircraft data loading
├── scripts/               # Data generation scripts
│   ├── generate_airports_json.js
│   ├── generate_airlines_json.js
│   └── generate_aircraft_json.js
├── data/                  # Cached JSON data files
├── .github/               # GitHub Actions workflows
├── Dockerfile             # Docker container configuration
├── eslint.config.mjs      # ESLint configuration
├── tsconfig.json          # TypeScript configuration
└── .prettierrc           # Prettier configuration
```

## Code Style and Standards

This project uses automated code formatting and linting:

### TypeScript
- All source code is written in TypeScript
- Strict type checking is enabled
- Use ES modules (`import`/`export`)

### Code Formatting
- **Prettier** for automatic code formatting
- Run formatting: `npm run prettier-fix`
- Check formatting: `npm run prettier`

### Linting
- **ESLint** with TypeScript and Prettier integration
- Run linting: `npm run eslint`
- Fix auto-fixable issues: `npm run eslint-fix`

### Commit Messages
Follow conventional commit format:
- `feat: add new airport search endpoint`
- `fix: resolve CORS issue in MCP server`
- `docs: update API documentation`
- `refactor: improve error handling`
- `chore: update dependencies`

## Making Changes

### Git Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

## Working with Data

### Cached Data
The API uses cached JSON files for airport, airline, and aircraft data stored in the `data/` directory. This data is automatically updated via GitHub Actions.

### Updating Data Locally
To update the cached data manually:

1. **Ensure you have a valid Duffel access token** in your `.env` file

2. **Run the data generation scripts**:
   ```bash
   npm run generate-airports
   npm run generate-airlines
   npm run generate-aircraft
   ```

3. **Commit the updated data files**:
   ```bash
   git add data/
   git commit -m "chore: update cached IATA data"
   ```

> **Note**: Data updates are typically handled automatically by GitHub Actions. Manual updates are mainly needed for development or testing purposes.

## API Development

### REST API Endpoints
- `GET /airports?query=CODE` - Search airports by IATA code
- `GET /airlines?query=CODE` - Search airlines by IATA code  
- `GET /aircraft?query=CODE` - Search aircraft by IATA code
- `GET /health` - Health check endpoint

### Adding New Endpoints
1. Add route handlers in `src/api.ts`
2. Follow existing patterns for caching headers and error handling
3. Ensure proper TypeScript typing
4. Test with various input scenarios

### Response Format
All API responses follow this structure:
```json
{
  "data": [...] // Array of matching results
}
```

Error responses:
```json
{
  "error": "descriptive error message"
}
```

## MCP Server Development

The API includes a Model Context Protocol (MCP) server at the `/mcp` endpoint that provides IATA lookup tools for AI systems.

### Available Tools
- `lookup_airport` - Find airport by IATA code
- `lookup_airline` - Find airline by IATA code
- `lookup_aircraft` - Find aircraft by IATA code

### MCP Development Guidelines
- MCP server logic is integrated into `src/api.ts`
- Tools should provide clear descriptions and input schemas
- Follow MCP specification for tool responses
- Test with MCP-compatible clients (e.g., Claude Desktop)

### Testing MCP Integration
1. Start the development server: `npm run dev`
2. Configure an MCP client to connect to `http://localhost:4000/mcp`
3. Test tool availability and functionality

## Docker Development

### Building the Docker Image
```bash
docker build . -t timrogers/iata-code-decoder-api
```

### Running with Docker
```bash
docker run -d -p 4000:4000 timrogers/iata-code-decoder-api
```

### Docker Development Workflow
1. Make changes to the code
2. Rebuild the Docker image
3. Test the containerized application
4. Ensure the Dockerfile remains optimized

## Testing and Validation

While this project doesn't have a formal test suite, please validate your changes thoroughly:

### Manual Testing Checklist
- [ ] API endpoints return expected responses
- [ ] Error handling works correctly
- [ ] CORS headers are properly set
- [ ] MCP server tools function correctly
- [ ] Docker container builds and runs successfully
- [ ] No ESLint or TypeScript compilation errors

### Validation Commands
```bash
# Lint check
npm run eslint

# Type check and build
npm run build

# Format check
npm run prettier

# Start development server
npm run dev
```

### Testing API Endpoints
Test each endpoint with various scenarios:
```bash
# Valid queries
curl "http://localhost:4000/airports?query=LHR"
curl "http://localhost:4000/airlines?query=BA"
curl "http://localhost:4000/aircraft?query=77W"

# Invalid queries
curl "http://localhost:4000/airports?query="
curl "http://localhost:4000/airports"

# Health check
curl "http://localhost:4000/health"
```

## Submitting Pull Requests

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All linting checks pass (`npm run eslint`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Code is properly formatted (`npm run prettier`)
- [ ] Changes have been manually tested
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### Pull Request Guidelines
1. **Provide a clear title** describing the change
2. **Include a detailed description** explaining:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
3. **Reference related issues** using `Fixes #123` or `Closes #123`
4. **Keep pull requests focused** - one feature or fix per PR
5. **Update documentation** if necessary

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Other (please describe)

## Testing
Describe how you tested these changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Manual testing performed
- [ ] Documentation updated (if needed)
```

## Reporting Issues

### Bug Reports
When reporting bugs, please include:
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (Node.js version, OS, etc.)
- **Relevant logs or error messages**
- **Screenshots** if applicable

### Feature Requests
For new features, please include:
- **Clear description** of the proposed feature
- **Use case** - why is this feature needed?
- **Implementation ideas** (if any)
- **Potential impact** on existing functionality

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Code of Conduct

### Our Standards
- **Be respectful** and inclusive in all interactions
- **Focus on constructive feedback** and collaborative problem-solving
- **Welcome newcomers** and help them get started
- **Respect different viewpoints** and experiences
- **Accept responsibility** for mistakes and learn from them

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

### Enforcement
Project maintainers are responsible for enforcing these standards and may take appropriate action in response to unacceptable behavior.

---

## Questions or Need Help?

If you have questions about contributing or need help getting started:

1. **Check existing issues** for similar questions
2. **Create a new issue** with the `question` label
3. **Review the README.md** for additional project information

Thank you for contributing to the IATA Code Decoder API! 🛩️
# IATA Code Decoder API

A simple API, written in Node.js with the Express framework, which allows you to identify airports, airlines and aircraft by their IATA code.

This is used by my [IATA Code Decoder extension](https://github.com/timrogers/raycast-iata-code-decoder) for [Raycast](https://raycast.com).

The data in the API is cached version of the airport, airline and aircraft data from the [Duffel](https://duffel.com) API. We use a cached copy for speed because the Duffel API does not allow you to view all records in one response - you can only see up to 200 at a time.

The cached data is updated regularly thanks to the power of GitHub Actions 👼

## Getting started

First, clone the repository:

```shell
git clone https://github.com/timrogers/iata-code-decoder-api.git
cd iata-code-decoder-api
```

Then install the dependencies:

```shell
npm install
```

Then build the TypeScript code:

```shell
npm run build
```

You'll then be ready to start the server:

```shell
npm start
```

The server will run on port 3000, or the port defined by the `PORT` environment variable.

## Development

To run the API in development mode with auto-reloading when changes are made, run:

```shell
npm run dev
```

## Testing

This project includes a comprehensive test suite for ensuring API reliability and correctness.

### Running Tests

The project includes multiple testing options:

#### Manual Integration Tests (Recommended)
```shell
npm run test:manual
```

This runs a custom integration test suite that validates all API endpoints without complex configuration issues.

#### Jest Tests (Advanced)
```shell
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ci          # Run tests for CI/CD
```

### Test Coverage

The test suite covers:
- ✅ All API endpoints (`/health`, `/airports`, `/airlines`, `/aircraft`)
- ✅ Error handling and validation
- ✅ Data integrity and structure
- ✅ Performance requirements
- ✅ Edge cases and malformed inputs
- ✅ Utility functions and data loading

### Test Documentation

For detailed information about the test suite, see [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md).

## API Usage

### Health Check

```
GET /health
```

### Search Airports

```
GET /airports?query=LAX
```

### Search Airlines

```
GET /airlines?query=AA
```

### Search Aircraft

```
GET /aircraft?query=737
```

## API

The API documentation is available at https://iata-code-decoder-api.duffel.com/docs.

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/timrogers/iata-code-decoder-api).

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Usage

## Running locally with Node

1. Make sure you're running Node.js v18 (v18.7.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Start the application by running `npm run dev`. You'll see a message once the app is ready to go.
4. Hit <https://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳

### Updating cached data

The cached data is updated regularly and committed to the repository thanks to the power of GitHub Actions. You can also do this locally yourself.

1. Make sure you're running Node.js v18 (v18.7.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Set your Duffel access token. Make a copy of the example `.env` file with `cp .env.example .env`, and then edit the resulting `.env` file.
4. Run `npm run generate-airports && rpm run generate-airlines && npm run generate-aircraft`. Commit the result.

## Running locally wih Docker

1. Build the Docker image with `docker build . -t timrogers/iata-code-decoder-api`
2. Start a container using your built Docker image by running `docker run -d -p 4000:4000 timrogers/iata-code-decoder-api`
3. Hit <https://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳
4. To stop your container - because you're done or because you want to rebuild from step 1, run `docker kill` with the container ID returned from `docker run`.

# IATA Code Decoder API

A simple API, written in Node.js with the Express framework, which allows you to identify airports, airlines and aircraft by their IATA code.

This is used by my [IATA Code Decoder extension](https://github.com/timrogers/raycast-iata-code-decoder) for [Raycast](https://raycast.com).

The data in the API is cached version of the airport, airline and aircraft data from the [Duffel](https://duffel.com) API. We use a cached copy for speed because the Duffel API does not allow you to view all records in one response - you can only see up to 200 at a time.

The cached data is updated regularly thanks to the power of GitHub Actions 👼

## Usage

### API Documentation

The API includes comprehensive OpenAPI 3.0 specification and interactive documentation:

- **Interactive Documentation**: Visit `/docs` to explore the API with Swagger UI
- **OpenAPI Specification (JSON)**: Available at `/openapi.json`
- **OpenAPI Specification (YAML)**: Available at `/openapi.yaml`

The API provides the following endpoints:

- `GET /health` - Health check endpoint
- `GET /airports?query={code}` - Search airports by IATA code (3 characters)
- `GET /airlines?query={code}` - Search airlines by IATA code (2 characters)  
- `GET /aircraft?query={code}` - Search aircraft by IATA code (3 characters)

All search endpoints require a `query` parameter and return results in the format:
```json
{
  "data": [
    // Array of matching results
  ]
}
```

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

# IATA Code Decoder API

A simple API, written in Node.js with the Express framework, which allows you to identify airports, airlines and aircraft by their IATA code.

This is used by my [IATA Code Decoder extension](https://github.com/timrogers/raycast-iata-code-decoder) for [Raycast](https://raycast.com).

The data in the API is cached version of the airport, airline and aircraft data from the [Duffel](https://duffel.com) API. We use a cached copy for speed because the Duffel API does not allow you to view all records in one response - you can only see up to 200 at a time.

The cached data is updated regularly thanks to the power of GitHub Actions 👼

## Usage

## Running locally with Node

1. Make sure you're running Node.js v18 (v18.7.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Start the application by running `npm run dev`. You'll see a message once the app is ready to go.
4. Hit <https://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳

## Performance Benchmarks

The API has been benchmarked on Node.js v18 with the following results:

### Individual Endpoint Performance

| Endpoint | Avg Response Time | P95 | P99 | Success Rate |
|----------|------------------|-----|-----|--------------|
| Health | 0.8ms | 1.1ms | 10.8ms | 100.0% |
| Airports | 1.1ms | 2.4ms | 2.6ms | 100.0% |
| Airlines | 0.6ms | 1.0ms | 1.6ms | 100.0% |
| Aircraft | 0.5ms | 0.8ms | 1.5ms | 100.0% |

### Load Testing Results

- **Concurrent requests**: 20 concurrent connections
- **Total requests**: 100 requests
- **Average response time**: 9.0ms
- **Requests per second**: 1196.7 req/s
- **Success rate**: 100.0%

### Performance Notes

- All endpoints demonstrate consistent sub-10ms response times under normal load
- The API maintains high throughput with minimal latency degradation under concurrent load
- Caching headers are properly configured for optimal client-side performance
- Memory usage remains stable throughout testing

*Benchmarks performed on: 2025-06-25*

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

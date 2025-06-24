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

## Performance Benchmarks

The API has been thoroughly benchmarked to ensure optimal performance across all endpoints. Below are the results from comprehensive testing with 100 requests per endpoint:

### Summary

| Endpoint Type | Average Response Time | P95 Response Time | Requests/sec | Success Rate |
|--------------|----------------------|-------------------|--------------|--------------|
| Health Check | 0.58ms | 1.03ms | 1,712.3 | 100% |
| Airports (exact match) | 1.01ms | 1.53ms | 990.4 | 100% |
| Airlines (exact match) | 0.59ms | 0.92ms | 1,689.7 | 100% |
| Aircraft (exact match) | 0.47ms | 0.76ms | 2,120.9 | 100% |

### Key Performance Insights

- **Ultra-fast response times**: All endpoints respond in under 1ms on average for exact matches
- **High throughput**: The API can handle 1,000+ requests per second across all endpoints
- **Excellent reliability**: 100% success rate across all test scenarios
- **Efficient caching**: Response times remain consistent even with large result sets
- **Scalable search**: Performance scales well from single character to full code searches

### Detailed Results

#### Health Check Endpoint
- **Path**: `/health`
- **Average Response Time**: 0.58ms
- **P95 Response Time**: 1.03ms
- **Throughput**: 1,712.3 requests/second

#### Airport Search Performance
| Query Type | Example | Avg Response (ms) | P95 (ms) | RPS | Results |
|-----------|---------|-------------------|----------|-----|---------|
| Exact Code | `?query=LHR` | 1.04 | 1.64 | 958.2 | 1 |
| Exact Code | `?query=JFK` | 0.98 | 1.42 | 1,022.6 | 1 |
| Two Chars | `?query=LA` | 0.94 | 1.25 | 1,062.9 | 23 |
| Single Char | `?query=L` | 2.07 | 2.94 | 482.8 | 463 |
| No Match | `?query=invalid` | 0.54 | 0.77 | 1,839.9 | 0 |

#### Airline Search Performance
| Query Type | Example | Avg Response (ms) | P95 (ms) | RPS | Results |
|-----------|---------|-------------------|----------|-----|---------|
| Exact Code | `?query=BA` | 0.59 | 0.92 | 1,693.6 | 1 |
| Exact Code | `?query=AA` | 0.59 | 0.93 | 1,685.7 | 1 |
| Single Char | `?query=B` | 0.69 | 0.97 | 1,448.0 | 32 |
| No Match | `?query=invalid` | 0.53 | 0.90 | 1,883.6 | 0 |

#### Aircraft Search Performance
| Query Type | Example | Avg Response (ms) | P95 (ms) | RPS | Results |
|-----------|---------|-------------------|----------|-----|---------|
| Exact Code | `?query=737` | 0.47 | 0.76 | 2,120.9 | 1 |
| Partial Code | `?query=A32` | 0.64 | 0.97 | 1,566.5 | 1 |
| Single Char | `?query=7` | 0.62 | 0.98 | 1,614.2 | 99 |
| No Match | `?query=invalid` | 0.75 | 1.00 | 1,335.5 | 0 |

### Test Environment
- **Node.js Version**: v22.16.0
- **Test Date**: June 24, 2025
- **Requests per Test**: 100
- **Hardware**: AWS Linux 6.8.0-1024-aws

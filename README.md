# IATA Code Decoder API

A simple API, written in Node.js with the Express framework, which allows you to identify airports, airlines and aircraft by their IATA code.

This project provides two interfaces:
1. **REST API**: Traditional HTTP endpoints for looking up IATA codes (`/airports`, `/airlines`, `/aircraft`)
2. **MCP Server**: A Model Context Protocol (MCP) server for AI systems and other MCP clients (`/mcp`)

This is used by my [IATA Code Decoder extension](https://github.com/timrogers/raycast-iata-code-decoder) for [Raycast](https://raycast.com).

The data in the API is cached version of the airport, airline and aircraft data from the [Duffel](https://duffel.com) API. We use a cached copy for speed because the Duffel API does not allow you to view all records in one response - you can only see up to 200 at a time.

The cached data is updated regularly thanks to the power of GitHub Actions 👼

## Usage

### Running locally with Node

1. Make sure you're running at least Node.js v24 (v24.6.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Start the application by running `npm run dev`. You'll see a message once the app is ready to go.
4. Hit <http://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳

### Running locally with Docker

1. Build the Docker image with `docker build . -t timrogers/iata-code-decoder-api`
2. Start a container using your built Docker image by running `docker run -d -p 4000:4000 timrogers/iata-code-decoder-api`
3. Hit <http://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳
4. To stop your container - because you're done or because you want to rebuild from step 1, run `docker kill` with the container ID returned from `docker run`.

### Updating cached data

The cached data is updated regularly and committed to the repository thanks to the power of GitHub Actions. You can also do this locally yourself.

1. Make sure you're running at least Node.js v24 (v24.6.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Set your Duffel access token. Make a copy of the example `.env` file with `cp .env.example .env`, and then edit the resulting `.env` file.
4. Run `npm run generate-airports && rpm run generate-airlines && npm run generate-aircraft`. Commit the result.

## Model Context Protocol (MCP) server

Model Context Protocol (MCP) is an open standard that enables AI systems to securely access external data sources and tools. 

The API exposes a remote MCP endpoint, offering the IATA code lookup functionality as tools that can be used by AI systems and other MCP clients.

### Using the MCP server

#### Claude Desktop

Claude Desktop does not support remote MCP servers out of the box, but they can be accessed through a proxy.

1. From the Claude app, open the "Developer" menu, then click "Open App Config File...".
1. Add the MCP server to the `mcpServers` key in your config:

```json
{
  "mcpServers": {
    "iata-code-decoder-api": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:4000/mcp"]
    }
  }
}
```

1. Back in the Claude app, open the "Developer" menu, then click "Reload MCP Configuration".
1. To check that the MCP server is running, start a chat, then click the "Search and tools" button under the chat input, and check for a "iata-code-decoder-api" item in the menu.

### Available Tools

The server provides three tools:

### 1. lookup_airport
- **Description**: Look up airport information by IATA code (3-letter code like LHR, JFK, etc.)
- **Input**: `query` - The IATA airport code or partial code to search for
- **Returns**: JSON object with matching airports including name, location, timezone, and other details

### 2. lookup_airline
- **Description**: Look up airline information by IATA code (2-letter code like BA, AA, etc.)
- **Input**: `query` - The IATA airline code or partial code to search for
- **Returns**: JSON object with matching airlines including name and IATA code

### 3. lookup_aircraft
- **Description**: Look up aircraft information by IATA code (3-letter code like 777, A320, etc.)
- **Input**: `query` - The IATA aircraft code or partial code to search for
- **Returns**: JSON object with matching aircraft including name and IATA code


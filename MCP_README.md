# IATA Code Decoder MCP Server

This is a Model Context Protocol (MCP) server that provides tools for looking up IATA codes for airports, airlines, and aircraft.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI systems to securely access external data sources and tools. This MCP server exposes the IATA code lookup functionality as tools that can be used by AI systems and other MCP clients.

## Available Tools

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

## Usage

### Running the MCP Server

To start the MCP server:

```bash
npm run mcp-server
```

The server runs on stdio and will output a message when ready:
```
IATA Code Decoder MCP Server running on stdio
```

### Using with MCP Clients

This server can be used with any MCP-compatible client. The server implements the MCP protocol and communicates via stdin/stdout.

Example tool calls:
- Look up Heathrow Airport: `lookup_airport` with query "LHR"
- Look up British Airways: `lookup_airline` with query "BA"  
- Look up Boeing 777: `lookup_aircraft` with query "777"

### Data Source

The server uses the same cached IATA code data as the REST API, sourced from the Duffel API. The data includes:
- **Airports**: Over 7,000 airports worldwide with IATA codes
- **Airlines**: Hundreds of airlines with IATA codes
- **Aircraft**: Various aircraft types with IATA codes

## Technical Details

- Built using the [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- Written in TypeScript
- Uses the same data processing logic as the existing REST API
- Supports partial matching for all lookup operations
# Airports API

A very simple API, written in Node.js with the Express framework, which returns basic information about airports around the world.

This data is sourced from the [Duffel](https://duffel.com) API. You might use this rather than access that API directly because the Duffel API does not allow you to view all airports in one response - you can only see up to 200 at a time.

## Usage

1. Make sure you're running Node.js v24 (v24.5.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Set your Duffel access token. Make a copy of the example `.env` file with `cp .env.example .env`, and then edit the resulting `.env` file.
4. Start the application by running `npm run dev`. You'll see a message once the app is ready to go.
5. Hit `/airports/LHR` in your browser. You'll see information about Heathrow airport 🥳

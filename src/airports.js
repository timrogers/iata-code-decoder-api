"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirportByIataCode = exports.AIRPORTS = void 0;
const airports_json_1 = __importDefault(require("./../data/airports.json"));
const utils_1 = require("./utils");
const airportDataToAirport = (airport) => (0, utils_1.snakifyKeys)(airport);
exports.AIRPORTS = airports_json_1.default.map(airportDataToAirport);
const getAirportByIataCode = (iataCode) => {
    return exports.AIRPORTS.find((airport) => airport.iata_code === iataCode);
};
exports.getAirportByIataCode = getAirportByIataCode;

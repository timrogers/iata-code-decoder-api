"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const airports_1 = require("./airports");
const app = (0, express_1.default)();
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('tiny'));
app.get('/airports', async (req, res) => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);
    res.json({ data: airports_1.AIRPORTS });
});
app.get('/airports/:iataCode', async (req, res) => {
    const { iataCode } = req.params;
    const airport = (0, airports_1.getAirportByIataCode)(iataCode);
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);
    if (airport) {
        res.json({ data: airport });
    }
    else {
        res.status(404).json({ data: { error: 'Not found' } });
    }
});
exports.default = app;

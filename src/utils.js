"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakifyKeys = void 0;
const camelToSnakeCase = (string) => string.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const snakifyKeys = (object) => Object.fromEntries(Object.entries(object).map(([key, value]) => [camelToSnakeCase(key), value]));
exports.snakifyKeys = snakifyKeys;

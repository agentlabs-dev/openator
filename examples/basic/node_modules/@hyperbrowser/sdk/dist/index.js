"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hyperbrowser = exports.HyperbrowserError = void 0;
const client_1 = require("./client");
var client_2 = require("./client");
Object.defineProperty(exports, "HyperbrowserError", { enumerable: true, get: function () { return client_2.HyperbrowserError; } });
// Export HyperbrowserClient as Hyperbrowser for named imports
exports.Hyperbrowser = client_1.HyperbrowserClient;
exports.default = client_1.HyperbrowserClient;
// For CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
    module.exports = client_1.HyperbrowserClient;
    module.exports.Hyperbrowser = client_1.HyperbrowserClient;
    module.exports.HyperbrowserClient = client_1.HyperbrowserClient;
    module.exports.default = client_1.HyperbrowserClient;
}

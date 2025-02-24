"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatXml = void 0;
function formatXml(intermediateSteps) {
    let log = "";
    for (const step of intermediateSteps) {
        const { action, observation } = step;
        log += `<tool>${action.tool}</tool><tool_input>${action.toolInput}\n</tool_input><observation>${observation}</observation>`;
    }
    return log;
}
exports.formatXml = formatXml;

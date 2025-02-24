"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLangChainErrorFields = void 0;
function addLangChainErrorFields(error, lc_error_code) {
    error.lc_error_code = lc_error_code;
    error.message = `${error.message}\n\nTroubleshooting URL: https://js.langchain.com/docs/troubleshooting/errors/${lc_error_code}/\n`;
    return error;
}
exports.addLangChainErrorFields = addLangChainErrorFields;

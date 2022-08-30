"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
async function error(method, message, reason) {
    let error;
    if (reason instanceof Error)
        error = reason.toString();
    else
        error = reason;
    return Promise.reject({
        method,
        message,
        reason: error,
    });
}
exports.error = error;

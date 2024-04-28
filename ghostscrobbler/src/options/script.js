"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_handler_1 = require("../api_handler");
function handleResponse(message) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Message from the background script: ${message.response.token}`);
        let token = message.response.token;
        const authUrlElement = document.getElementById("auth-url");
        if (authUrlElement) {
            if (token) {
                authUrlElement.href = `http://www.last.fm/api/auth/?api_key=${api_handler_1.API_KEY}&token=${token}`;
            }
            else {
                authUrlElement.textContent = "No token found";
            }
        }
    });
}
function handleError(error) {
    console.log(error);
}
function notifyBackgroundPage(e) {
    return __awaiter(this, void 0, void 0, function* () {
        var token = yield (0, api_handler_1.fetchToken)();
        const sending = browser.runtime.sendMessage({
            page: "options",
            data: token,
        });
        sending.then(handleResponse, handleError);
    });
}
window.addEventListener("load", notifyBackgroundPage);

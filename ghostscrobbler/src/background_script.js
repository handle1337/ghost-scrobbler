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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var yt_oumbed_url = "https://www.youtube.com/oembed";
function getTabs() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, browser.tabs.query({ currentWindow: true, active: true })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getActiveTabURL() {
    return __awaiter(this, void 0, void 0, function () {
        var tabs, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTabs()];
                case 1:
                    tabs = _a.sent();
                    url = tabs[0].url;
                    return [2 /*return*/, url !== null && url !== void 0 ? url : ""];
            }
        });
    });
}
function isTabYoutube(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("".concat(url.host, " ").concat(url.pathname, " ").concat(url.searchParams));
            return [2 /*return*/, url.toString().includes("youtube.com/watch?v=")];
        });
    });
}
var song = {
    title: '',
    author: '',
    url: '',
    thumbnail_url: ''
};
function setSong() {
    return __awaiter(this, void 0, void 0, function () {
        var tab_url, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = URL.bind;
                    return [4 /*yield*/, getActiveTabURL()];
                case 1:
                    tab_url = new (_a.apply(URL, [void 0, _b.sent()]))();
                    return [4 /*yield*/, isTabYoutube(tab_url)];
                case 2:
                    if (_b.sent()) {
                        axios_1.default.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response) {
                            console.log(response);
                            song.title = response.data.title;
                            song.author = response.data.author;
                            song.url = tab_url.toString();
                            song.thumbnail_url = response.data.thumbnail_url;
                        }).then(function () { console.log("done"); });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleMessage(request, sender, sendResponse) {
    console.log("A content script sent a message: ".concat(request));
    sendResponse({ response: JSON.stringify(song) });
}
browser.runtime.onMessage.addListener(handleMessage);
browser.tabs.onActivated.addListener(setSong);
//browser.tabs.onUpdated.addListener(isTabYoutube);

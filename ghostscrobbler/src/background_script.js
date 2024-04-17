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
var qs_1 = require("qs");
var crypto_js_1 = require("crypto-js");
var xml2js_1 = require("xml2js");
//import { error } from 'console';
var yt_oumbed_url = "https://www.youtube.com/oembed";
var SCROBBLER_URL = "http://ws.audioscrobbler.com/2.0/";
var API_KEY = "1e6a459987c034f59dc5788315bedafe";
var API_SECRET = "";
//TODO: https://www.last.fm/api/desktopauth tHISISIS
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
    thumbnail_url: '',
};
;
function getMethodSignature(params, secret) {
    console.log(params);
    var filteredParams = Object.keys(params)
        .filter(function (key) { return key !== 'format' && key !== 'callback'; })
        .sort() // Sort parameters alphabetically by parameter name
        .map(function (key) { return "".concat(key).concat(params[key]); }) // Concatenate parameter name and value
        .join(''); // Concatenate all parameters into one string
    //const signature_base = encodeURIComponent(filteredParams + secret);
    //console.log(signature_base);
    return (0, crypto_js_1.MD5)(filteredParams + secret).toString();
}
function fetchToken() {
    return __awaiter(this, void 0, void 0, function () {
        var token, service_method, signature, params, response, xml_string, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = "";
                    service_method = "auth.getToken";
                    signature = getMethodSignature({ api_key: API_KEY, method: service_method }, API_SECRET);
                    params = {
                        method: service_method,
                        api_key: API_KEY,
                        api_sig: signature,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post(SCROBBLER_URL, (0, qs_1.stringify)(params))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response];
                case 3:
                    xml_string = (_a.sent()).data;
                    (0, xml2js_1.parseString)(xml_string, function (error, result) {
                        if (error) {
                            console.error(error);
                        }
                        token = result.lfm.token[0];
                    });
                    console.log(token);
                    return [2 /*return*/, token];
                case 4:
                    error_1 = _a.sent();
                    console.log(error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchSession(auth_token) {
    return __awaiter(this, void 0, void 0, function () {
        var service_method, params, signature, session_key, response, xml_string, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service_method = "auth.getSession";
                    params = {
                        method: service_method,
                        api_key: API_KEY,
                        token: auth_token,
                    };
                    console.log(params);
                    signature = getMethodSignature(params, API_SECRET);
                    params.api_sig = signature;
                    session_key = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    response = axios_1.default.get("".concat(SCROBBLER_URL, "?").concat((0, qs_1.stringify)(params)));
                    return [4 /*yield*/, response];
                case 2:
                    xml_string = (_a.sent()).data;
                    console.log(xml_string);
                    (0, xml2js_1.parseString)(xml_string, function (error, result) {
                        if (error) {
                            console.error(error);
                        }
                        session_key = result.lfm.session[0].key[0];
                    });
                    return [2 /*return*/, session_key];
                case 3:
                    error_2 = _a.sent();
                    console.log(error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function updateNowPlaying() {
    return __awaiter(this, void 0, void 0, function () {
        var service_method, session_key;
        return __generator(this, function (_a) {
            service_method = "track.updateNowPlaying";
            browser.storage.local.get('session').then(function (result) {
                session_key = result.session;
                if (session_key) {
                    var params = {
                        method: service_method,
                        artist: song.author,
                        track: song.title,
                        api_key: API_KEY,
                        sk: session_key,
                    };
                    var signature = getMethodSignature(params, API_SECRET);
                    params.api_sig = signature;
                    var options = {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    };
                    //By default axios serializes objects to json, so we use qs to urlencode the body
                    try {
                        axios_1.default.post(SCROBBLER_URL, (0, qs_1.stringify)(params), options)
                            .then(function (response) { console.log(response); });
                    }
                    catch (error) {
                        console.log("Failed to communicate with last.fm");
                        throw error;
                    }
                }
                else {
                    console.warn("last.fm not connected");
                }
            }).catch(function (error) {
                console.log(error);
            });
            return [2 /*return*/];
        });
    });
}
function handleTab() {
    return __awaiter(this, void 0, void 0, function () {
        var localhost, tab_url, _a, token_regex, auth_token, fetched_session_key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localhost = "127.0.0.1";
                    _a = URL.bind;
                    return [4 /*yield*/, getActiveTabURL()];
                case 1:
                    tab_url = new (_a.apply(URL, [void 0, _b.sent()]))();
                    if (!(tab_url.host === localhost)) return [3 /*break*/, 4];
                    token_regex = tab_url.toString().match((/token=([^&]+)/));
                    if (!(token_regex && token_regex[1])) return [3 /*break*/, 4];
                    auth_token = token_regex[1];
                    return [4 /*yield*/, fetchSession(auth_token)];
                case 2:
                    fetched_session_key = _b.sent();
                    console.log("session ".concat(fetched_session_key));
                    return [4 /*yield*/, browser.storage.local.set({ session: fetched_session_key }).then(function () { console.log("saved session key"); })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [4 /*yield*/, isTabYoutube(tab_url)];
                case 5:
                    if (_b.sent()) {
                        // TODO: use qs here as well
                        axios_1.default.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response) {
                            console.log(response);
                            song.title = response.data.title;
                            song.author = response.data.author_name;
                            console.log(response.data.author_name);
                            song.url = tab_url.toString();
                            song.thumbnail_url = response.data.thumbnail_url;
                        }).then(updateNowPlaying);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleMessage(request, sender, sendResponse) {
    console.log("A content script sent a message: ".concat(request));
    sendResponse({ response: song });
}
browser.runtime.onMessage.addListener(handleMessage);
//browser.runtime.onStartup.addListener(Auth);
browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);

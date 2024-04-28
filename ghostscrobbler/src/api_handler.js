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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrobble = exports.updateNowPlaying = exports.getTimestamp = exports.fetchSession = exports.fetchToken = exports.song = exports.API_KEY = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = require("qs");
const crypto_js_1 = require("crypto-js");
const xml2js_1 = require("xml2js");
const SCROBBLER_URL = "http://ws.audioscrobbler.com/2.0/";
exports.API_KEY = "1e6a459987c034f59dc5788315bedafe";
const API_SECRET = "9a2288e9eeecbdee511de18c16d36d94";
const AXIOS_OPTIONS = {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
};
exports.song = {
    title: '',
    author: '',
    url: '',
    thumbnail_url: '',
};
;
function getMethodSignature(params, secret) {
    const filteredParams = Object.keys(params)
        .filter(key => key !== 'format' && key !== 'callback')
        .sort()
        .map(key => `${key}${params[key]}`)
        .join('');
    return (0, crypto_js_1.MD5)(filteredParams + secret).toString();
}
function fetchToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let token = "";
        const service_method = "auth.getToken";
        const signature = getMethodSignature({ api_key: exports.API_KEY, method: service_method }, API_SECRET);
        const params = {
            method: service_method,
            api_key: exports.API_KEY,
            api_sig: signature,
        };
        try {
            const response = yield axios_1.default.post(SCROBBLER_URL, (0, qs_1.stringify)(params));
            const xml_string = (yield response).data;
            (0, xml2js_1.parseString)(xml_string, (error, result) => {
                if (error) {
                    console.error(error);
                }
                token = result.lfm.token[0];
            });
            console.log(`Token: ${token}`);
            return token;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    });
}
exports.fetchToken = fetchToken;
function fetchSession(auth_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const service_method = "auth.getSession";
        const params = {
            method: service_method,
            api_key: exports.API_KEY,
            token: auth_token,
        };
        console.log(params);
        const signature = getMethodSignature(params, API_SECRET);
        params.api_sig = signature;
        let session_key = "";
        try {
            const response = axios_1.default.get(`${SCROBBLER_URL}?${(0, qs_1.stringify)(params)}`);
            const xml_string = (yield response).data;
            console.log(xml_string);
            (0, xml2js_1.parseString)(xml_string, (error, result) => {
                if (error) {
                    console.error(error);
                }
                session_key = result.lfm.session[0].key[0];
            });
            return session_key;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    });
}
exports.fetchSession = fetchSession;
function getTimestamp() {
    return Math.floor(Date.now() / 1000); //timestamp must be in milliseconds and not seconds
}
exports.getTimestamp = getTimestamp;
function updateNowPlaying() {
    return __awaiter(this, void 0, void 0, function* () {
        const service_method = "track.updateNowPlaying";
        var session_key;
        browser.storage.local.get('session').then(function (result) {
            session_key = result.session;
            if (session_key) {
                let params = {
                    method: service_method,
                    artist: exports.song.author,
                    track: exports.song.title,
                    api_key: exports.API_KEY,
                    sk: session_key,
                };
                const signature = getMethodSignature(params, API_SECRET);
                params.api_sig = signature;
                //By default axios serializes objects to json, so we use qs to urlencode the body
                try {
                    axios_1.default.post(SCROBBLER_URL, (0, qs_1.stringify)(params), AXIOS_OPTIONS)
                        .then((response) => { console.log(response); });
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
    });
}
exports.updateNowPlaying = updateNowPlaying;
function scrobble(duration) {
    return __awaiter(this, void 0, void 0, function* () {
        const service_method = "track.scrobble";
        var session_key;
        browser.storage.local.get('session').then(function (result) {
            session_key = result.session;
            if (session_key) {
                let params = {
                    method: service_method,
                    artist: exports.song.author,
                    track: exports.song.title,
                    api_key: exports.API_KEY,
                    sk: session_key,
                    timestamp: getTimestamp(),
                    duration: duration,
                };
                const signature = getMethodSignature(params, API_SECRET);
                params.api_sig = signature;
                console.log(params);
                try {
                    axios_1.default.post(SCROBBLER_URL, (0, qs_1.stringify)(params), AXIOS_OPTIONS)
                        .then((response) => { console.log(response); });
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
    });
}
exports.scrobble = scrobble;

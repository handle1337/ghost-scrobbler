"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const api_handler = __importStar(require("./api_handler"));
const axios_1 = __importDefault(require("axios"));
const yt_oumbed_url = "https://www.youtube.com/oembed";
var auth_token = "";
var session_exists;
function getTabs() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield browser.tabs.query({ currentWindow: true, active: true });
    });
}
function getActiveTabURL() {
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield getTabs();
        const url = tabs[0].url; //get current tab
        return url !== null && url !== void 0 ? url : "";
    });
}
function isTabYoutube(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`${url.host} ${url.pathname} ${url.searchParams}`)
        return url.toString().includes("youtube.com/watch?v=");
    });
}
function checkSession() {
    return __awaiter(this, void 0, void 0, function* () {
        return browser.storage.local.get('session').then(data => {
            console.log(data.session);
            return !!data.session;
        });
    });
}
/**
async function checkToken() {
        api_handler.fetchToken().then((token: string) => {auth_token = token});
}**/
function isScrobble(duration, timestamp) {
    return ((timestamp > 400 || timestamp > (duration / 2)) && duration > 30);
}
function handleTab() {
    return __awaiter(this, void 0, void 0, function* () {
        //if we make this global we might fix the problem with multiple execs
        var tab_url = new URL(yield getActiveTabURL());
        session_exists = yield checkSession();
        //check if active tab is youtube
        if (yield isTabYoutube(tab_url)) {
            if (!session_exists && auth_token) {
                let session_key = yield api_handler.fetchSession(auth_token);
                yield browser.storage.local.set({ session: session_key }).then(() => { console.log("saved session key"); });
            }
            // TODO: use qs here as well
            try {
                axios_1.default.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response) {
                    console.log(response);
                    api_handler.song.title = response.data.title;
                    api_handler.song.author = response.data.author_name;
                    api_handler.song.url = tab_url.toString();
                    api_handler.song.thumbnail_url = response.data.thumbnail_url;
                });
            }
            catch (error) {
                console.log(error);
            }
            yield api_handler.updateNowPlaying();
        }
    });
}
function handleMessage(request, sender, sendResponse) {
    var _a;
    console.log(`A content script sent a message: ${request}`);
    if (request.page === "content-script") {
        let track_timestamp = request.timestamp; // the current time elapsed in playback
        let track_duration = request.duration;
        if (isScrobble(track_duration, track_timestamp)) {
            (() => __awaiter(this, void 0, void 0, function* () {
                let session_exists = yield checkSession();
                if (session_exists) {
                    console.log(`scrobbling`);
                    yield api_handler.scrobble(track_duration).then(sendResponse({ response: { scrobbled: true } }));
                }
            }))();
        }
        else {
            sendResponse({ response: { scrobbled: false } }); //this deals with replays
        }
    }
    if (request.page === "options") {
        auth_token = (_a = request.data) !== null && _a !== void 0 ? _a : null;
        console.log(`fetched: ${auth_token}`);
        if (auth_token) {
            sendResponse({ response: { token: auth_token } });
        }
    }
    if (request.page === "browser-action") {
        console.log(api_handler.song);
        sendResponse({ response: { song: api_handler.song, auth: session_exists } });
    }
    return true; //we do this to avoid prepending async to the func
}
browser.runtime.onMessage.addListener(handleMessage);
//browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);

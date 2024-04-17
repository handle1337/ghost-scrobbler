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
        console.log(`${url.host} ${url.pathname} ${url.searchParams}`);
        return url.toString().includes("youtube.com/watch?v=");
    });
}
function handleTab() {
    return __awaiter(this, void 0, void 0, function* () {
        api_handler.fetchToken().then((token) => { auth_token = token; });
        var tab_url = new URL(yield getActiveTabURL());
        let session_exists = yield api_handler.checkSession();
        //TODO: check if the user has authorized the app
        if (!session_exists) {
            let token = yield api_handler.fetchToken();
            let fetched_session_key = yield api_handler.fetchSession(token);
            yield browser.storage.local.set({ session: fetched_session_key }).then(() => { console.log("saved session key"); });
        }
        if (yield isTabYoutube(tab_url)) {
            // TODO: use qs here as well
            axios_1.default.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response) {
                console.log(response);
                api_handler.song.title = response.data.title;
                api_handler.song.author = response.data.author_name;
                api_handler.song.url = tab_url.toString();
                api_handler.song.thumbnail_url = response.data.thumbnail_url;
            }).then(api_handler.updateNowPlaying);
        }
    });
}
function handleMessage(request, sender, sendResponse) {
    console.log(`A content script sent a message: ${request.data}`);
    if (request.page === "options") {
        console.log(`fetched: ${auth_token}`);
        sendResponse({ response: { token: auth_token } });
    }
    if (request.page = "browser-action") {
        sendResponse({ response: api_handler.song });
    }
}
browser.runtime.onMessage.addListener(handleMessage);
//browser.runtime.onStartup.addListener(Auth);
browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);

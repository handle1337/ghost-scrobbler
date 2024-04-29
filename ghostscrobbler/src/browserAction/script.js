"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_handler_1 = require("../api_handler");
function handleResponse(message) {
    console.log(`Message from the background script: ${message.response.auth}`);
    const song = message.response.song;
    const thumbnail_element = document.getElementById("thumbnail-element");
    const song_title_element = document.getElementById("song-title");
    const song_author_element = document.getElementById("song-author");
    const btn_love_element = document.getElementById('btn-love-track');
    btn_love_element.classList.toggle('greyed-out');
    if (thumbnail_element && song_title_element && song_author_element) {
        thumbnail_element.src = song.thumbnail_url;
        song_title_element.textContent = song.title;
        song_author_element.textContent = song.author;
    }
    const auth_element = document.getElementById("auth");
    if (message.response.auth && auth_element) {
        auth_element.textContent = "Last.fm is Authenticated";
        btn_love_element.addEventListener('click', function () {
            this.classList.toggle('greyed-out');
            if (!song.loved) {
                (0, api_handler_1.loveTrack)(song);
                song.loved = true;
            }
            else {
                (0, api_handler_1.unloveTrack)(song);
                song.loved = false;
            }
        });
    }
}
function handleError(error) {
    console.log(error);
}
function notifyBackgroundPage(e) {
    const sending = browser.runtime.sendMessage({
        page: "browser-action",
        data: "Msg from browser action",
    });
    sending.then(handleResponse, handleError);
}
window.addEventListener("load", notifyBackgroundPage);

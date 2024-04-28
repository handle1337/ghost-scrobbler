"use strict";
// https://developers.google.com/youtube/iframe_api_reference
browser.runtime.onMessage.addListener(handleMessage);
function handleMessage(request, sender, sendResponse) {
    sendResponse(request);
}
var ytplayer = document.getElementsByTagName('video')[0];
var scrobbled;
function videoIsPlaying() {
    return !ytplayer.paused && !ytplayer.ended;
}
function getTimestamp() {
    return ytplayer.currentTime;
}
function getDuration() {
    return ytplayer.duration;
}
console.log(getTimestamp());
function handleResponse(message) {
    console.log(`Message from the background script: ${message.response}`);
    scrobbled = message.response.scrobbled;
}
function handleError(error) {
    console.log(error);
}
function notifyBackgroundPage(e) {
    if (!scrobbled) {
        var timestamp = getTimestamp();
        var duration = getDuration();
        const sending = browser.runtime.sendMessage({
            page: "content-script",
            timestamp: timestamp,
            duration: duration,
        });
        sending.then(handleResponse, handleError);
    }
}
const intervalId = setInterval(() => {
    if (videoIsPlaying()) {
        notifyBackgroundPage(null);
    }
});

// https://developers.google.com/youtube/iframe_api_reference

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request: any, sender: any, sendResponse: any) {
    sendResponse(request);
}


var ytplayer = document.getElementsByTagName('video')[0] as HTMLVideoElement;
var scrobbled: boolean;

function videoIsPlaying(): boolean {
    return !ytplayer.paused && !ytplayer.ended;
}

function getTimestamp(): number {
    return ytplayer.currentTime;
}

function getDuration(): number {
    return ytplayer.duration;
}

console.log(getTimestamp());

function handleResponse(message: any) {
    console.log(`Message from the background script: ${message.response}`);
    scrobbled = message.response.scrobbled;
}
  
function handleError(error: Error): void
{
    console.log(error);
}


function notifyBackgroundPage(e: any) {
    if (!scrobbled) {
        var timestamp: number = getTimestamp();
        var duration: number = getDuration();
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
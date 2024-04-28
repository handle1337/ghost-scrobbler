import * as api_handler from './api_handler'
import axios from 'axios';


const yt_oumbed_url: string = "https://www.youtube.com/oembed";
var auth_token: string = "";
var session_exists: boolean;

async function getTabs(): Promise<browser.tabs.Tab[]> {
    return await browser.tabs.query({ currentWindow: true, active: true });
}


async function getActiveTabURL(): Promise<string> {
    const tabs = await getTabs();
    const url = tabs[0].url; //get current tab
    return url ?? ""
}


async function isTabYoutube(url: URL): Promise<boolean> {
   // console.log(`${url.host} ${url.pathname} ${url.searchParams}`)
    return url.toString().includes("youtube.com/watch?v=");
}

async function checkSession(): Promise<boolean> {
    return browser.storage.local.get('session').then(data => {
        console.log(data.session);
        return !!data.session;
    });
}

/** 
async function checkToken() {
        api_handler.fetchToken().then((token: string) => {auth_token = token});
}**/

function isScrobble(duration: number, timestamp: number): boolean {
    return ((timestamp > 400 || timestamp > (duration / 2)) && duration > 30);
}

async function handleTab() {    
    //if we make this global we might fix the problem with multiple execs
    var tab_url: URL = new URL(await getActiveTabURL());

    session_exists = await checkSession();

    //check if active tab is youtube
    if (await isTabYoutube(tab_url)) {

        if (!session_exists && auth_token) {
            let session_key = await api_handler.fetchSession(auth_token);
            await browser.storage.local.set({session: session_key}).then(() => {console.log("saved session key")});
        }

        // TODO: use qs here as well
        try {
            axios.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response: any) {
                console.log(response);
                api_handler.song.title = response.data.title;
                api_handler.song.author = response.data.author_name;
                api_handler.song.url = tab_url.toString();
                api_handler.song.thumbnail_url = response.data.thumbnail_url;
                });
        } catch (error: any) {
            console.log(error);
        }

        await api_handler.updateNowPlaying();
    }
}


function handleMessage(request: any, sender: any, sendResponse: any) {
    console.log(`A content script sent a message: ${request}`);
    if (request.page === "content-script") {
        let track_timestamp = request.timestamp; // the current time elapsed in playback
        let track_duration = request.duration;
        
        if (isScrobble(track_duration, track_timestamp)) {
            (async () => {
                let session_exists: boolean = await checkSession();
                if (session_exists) {
                    await api_handler.scrobble(track_duration).then(sendResponse({response: {scrobbled: true}})); 
                }
            })();
        } else {
            sendResponse({response: {scrobbled: false}}); //this deals with replays
        }
    }
    if (request.page === "options") {
        auth_token = request.data ?? null;
        console.log(`fetched: ${auth_token}`);
        if (auth_token) {
            sendResponse({ response: { token: auth_token } });
        }
    }
    if (request.page === "browser-action") {
        console.log(api_handler.song);
        sendResponse({ response: {song: api_handler.song, auth: session_exists} });
    }

    return true; //we do this to avoid prepending async to the func
}
  


browser.runtime.onMessage.addListener(handleMessage);

//browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);

import * as api_handler from './api_handler'
import axios from 'axios';


const yt_oumbed_url: string = "https://www.youtube.com/oembed";


//TODO: https://www.last.fm/api/desktopauth tHISISIS


async function getTabs(): Promise<browser.tabs.Tab[]> {
    return await browser.tabs.query({ currentWindow: true, active: true });
}


async function getActiveTabURL(): Promise<string> {
    const tabs = await getTabs();
    const url = tabs[0].url; //get current tab
    return url ?? ""
}


async function isTabYoutube(url: URL): Promise<boolean> {
    console.log(`${url.host} ${url.pathname} ${url.searchParams}`)
    return url.toString().includes("youtube.com/watch?v=");
}

async function handleTab() {
    var localhost = "127.0.0.1"
    var tab_url = new URL(await getActiveTabURL());

    if (tab_url.host === localhost) {
        let token_regex: RegExpMatchArray | null = tab_url.toString().match((/token=([^&]+)/));
        if (token_regex && token_regex[1]) {
            
            let auth_token = token_regex[1]; //we can infer this is populated
            let fetched_session_key = await api_handler.fetchSession(auth_token);
            console.log(`session ${fetched_session_key}`);
            await browser.storage.local.set({session: fetched_session_key}).then(() => {console.log("saved session key")});
        }
    }

    if (await isTabYoutube(tab_url)) {
        // TODO: use qs here as well
        axios.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response: any) {
            console.log(response);
            api_handler.song.title = response.data.title;
            api_handler.song.author = response.data.author_name;
            api_handler.song.url = tab_url.toString();
            api_handler.song.thumbnail_url = response.data.thumbnail_url;
            
            }).then(api_handler.updateNowPlaying);
    }
}

function handleMessage(request: any, sender: any, sendResponse: any) {
    console.log(`A content script sent a message: ${request}`);
    /*if (request.page === "options") {
        sendResponse({ response: fetchSession(request.data) })
    }*/
    sendResponse({ response: api_handler.song });
}
  

browser.runtime.onMessage.addListener(handleMessage);
//browser.runtime.onStartup.addListener(Auth);

browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);

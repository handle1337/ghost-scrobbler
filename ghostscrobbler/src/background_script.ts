import axios from 'axios';

const yt_oumbed_url = "https://www.youtube.com/oembed"


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

interface ISong {
    title: string;
    author: string
    url: string;
    thumbnail_url: string;
}

let song: ISong = {
    title: '',
    author: '',
    url: '',
    thumbnail_url: '',
};

async function setSong() {

    const tab_url = new URL(await getActiveTabURL());
    if (await isTabYoutube(tab_url)) {

        axios.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response: any) {
            console.log(response);
            song.title = response.data.title;
            song.author = response.data.author_name;
            console.log(response.data.author_name);
            song.url = tab_url.toString();
            song.thumbnail_url = response.data.thumbnail_url;
            
            }).then(() => {console.log("done")})
    }
}


function handleMessage(request: any, sender: any, sendResponse: any) {
    console.log(`A content script sent a message: ${request}`);
    sendResponse({ response: song });
}
  
browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onActivated.addListener(setSong);
browser.tabs.onUpdated.addListener(setSong);
import axios, { AxiosRequestConfig } from 'axios';
import { stringify, parse } from 'qs';
import {MD5} from 'crypto-js';
import { parseString } from 'xml2js'


const yt_oumbed_url: string = "https://www.youtube.com/oembed";
const SCROBBLER_URL: string = "http://ws.audioscrobbler.com/2.0/";
const API_KEY: string = "1e6a459987c034f59dc5788315bedafe";
const API_SECRET = "" ;


const AXIOS_OPTIONS: AxiosRequestConfig = {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
};

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

interface IParams {
    method: string,
    api_key: string,
    [key: string]: string;
};


function getMethodSignature(params: Record<string, any>, secret: string): string {
    
    const filteredParams = Object.keys(params)
    .filter(key => key !== 'format' && key !== 'callback')
    .sort() 
    .map(key => `${key}${params[key]}`) 
    .join(''); 

    return MD5(filteredParams + secret).toString();
}


async function fetchToken(): Promise<string> {
    let token: string = "";
    const service_method: string = "auth.getToken";
    const signature: string = getMethodSignature({api_key: API_KEY, method: service_method}, API_SECRET);
    const params: IParams = {
        method: service_method,
        api_key: API_KEY,
        api_sig: signature,
    };
    try {
    const response = await axios.post(SCROBBLER_URL, stringify(params));
    const xml_string = (await response).data;
    
    
    parseString(xml_string, (error, result) => {
        if (error) {
            console.error(error);
        }
        token = result.lfm.token[0];
    });
    console.log(token);
    return token;

    } catch (error) {
        console.log(error)
        throw error;
    }
}


async function fetchSession(auth_token: string): Promise<string> {
    const service_method: string = "auth.getSession";

    const params: IParams = {
        method: service_method,
        api_key: API_KEY,
        token: auth_token,
    }

    console.log(params);
    const signature: string = getMethodSignature(params, API_SECRET);
    params.api_sig = signature;

    let session_key: string = "";
    

    try {
        
        const response = axios.get(`${SCROBBLER_URL}?${stringify(params)}`);
        const xml_string = (await response).data;
        console.log(xml_string);
        parseString(xml_string, (error, result) => {
            if (error) {
                console.error(error);
            }
            session_key = result.lfm.session[0].key[0];
        });

        return session_key;

    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function updateNowPlaying(): Promise<void> {

    const service_method: string = "track.updateNowPlaying";
    
    var session_key: string;

    browser.storage.local.get('session').then(
        function (result) {
            session_key = result.session;
            if (session_key) {
                let params: IParams = {
                    method: service_method,
                    artist: song.author,
                    track: song.title,
                    api_key: API_KEY,
                    sk: session_key,
                }

                const signature: string = getMethodSignature(params, API_SECRET); 
                params.api_sig = signature;

                //By default axios serializes objects to json, so we use qs to urlencode the body
                try {
                    axios.post(SCROBBLER_URL, stringify(params), AXIOS_OPTIONS)
                    .then((response: any) => {console.log(response)}); 
                } catch(error) {
                    console.log("Failed to communicate with last.fm")
                    throw error;
                }
            } else {
                console.warn("last.fm not connected")
            }
        }).catch(function (error) {
            console.log(error)
        });
}


async function handleTab() {
    var localhost = "127.0.0.1"
    var tab_url = new URL(await getActiveTabURL());

    if (tab_url.host === localhost) {
        let token_regex: RegExpMatchArray | null = tab_url.toString().match((/token=([^&]+)/));
        if (token_regex && token_regex[1]) {
            
            let auth_token = token_regex[1]; //we can infer this is populated
            let fetched_session_key = await fetchSession(auth_token);
            console.log(`session ${fetched_session_key}`);
            await browser.storage.local.set({session: fetched_session_key}).then(() => {console.log("saved session key")});
        }
    }

    if (await isTabYoutube(tab_url)) {
        // TODO: use qs here as well
        axios.get(yt_oumbed_url + '?format=json&url=' + tab_url.toString()).then(function (response: any) {
            console.log(response);
            song.title = response.data.title;
            song.author = response.data.author_name;
            song.url = tab_url.toString();
            song.thumbnail_url = response.data.thumbnail_url;
            
            }).then(updateNowPlaying);
    }
}


function handleMessage(request: any, sender: any, sendResponse: any) {
    console.log(`A content script sent a message: ${request}`);
    /*if (request.page === "options") {
        sendResponse({ response: fetchSession(request.data) })
    }*/
    sendResponse({ response: song });
}
  

browser.runtime.onMessage.addListener(handleMessage);
//browser.runtime.onStartup.addListener(Auth);

//browser.tabs.onActivated.addListener(handleTab);
browser.tabs.onUpdated.addListener(handleTab);


import axios, { AxiosRequestConfig } from 'axios';
import { stringify, parse } from 'qs';
import {MD5} from 'crypto-js';
import { parseString } from 'xml2js'


const SCROBBLER_URL: string = "http://ws.audioscrobbler.com/2.0/";
export const API_KEY: string = "";
const API_SECRET = "" ;


const AXIOS_OPTIONS: AxiosRequestConfig = {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
};


export interface ISong {
    title: string;
    author: string
    url: string;
    thumbnail_url: string;
    timestamp?: number;
    scrobbled?: boolean;
    loved?: boolean;
}

export let song: ISong = {
    title: '',
    author: '',
    url: '',
    thumbnail_url: '',
};

interface IParams {
    method: string,
    api_key: string,
    [key: string]: any;
};


function getMethodSignature(params: Record<string, any>, secret: string): string {
    
    const filteredParams = Object.keys(params)
    .filter(key => key !== 'format' && key !== 'callback')
    .sort() 
    .map(key => `${key}${params[key]}`) 
    .join(''); 

    return MD5(filteredParams + secret).toString();
}


export async function fetchToken(): Promise<string> {
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
    console.log(`Token: ${token}`);
    return token;

    } catch (error) {
        console.log(error)
        throw error;
    }
}


export async function fetchSession(auth_token: string): Promise<string> {
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

export function getTimestamp(): number {
    return Math.floor(Date.now() / 1000); //timestamp must be in milliseconds and not seconds
}

export async function updateNowPlaying(): Promise<void> {

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


export async function loveOrUnloveTrack(service_method: string, _song: ISong): Promise<void> {
    
    var session_key: string;

    browser.storage.local.get('session').then(
        function (result): any {
            session_key = result.session;

            if (!session_key) 
            { 
                console.warn("last.fm not connected");
                return; 
            }

            let params: IParams = {
                method: service_method,
                artist: _song.author,
                track: _song.title,
                api_key: API_KEY,
                sk: session_key,
            }

            const signature: string = getMethodSignature(params, API_SECRET); 
            params.api_sig = signature;

            console.log(params);

            try {
                axios.post(SCROBBLER_URL, stringify(params), AXIOS_OPTIONS)
                .then((response: any) => {console.log(response)}); 
            } catch(error) {
                console.log("Failed to communicate with last.fm")
                throw error;
            }
        }).catch(function (error) {
            console.log(`Failed with ${error}`)
        });
}


export async function loveTrack(_song: ISong): Promise<void> {
    const service_method: string = "track.love"
    await loveOrUnloveTrack(service_method, _song);
}

export async function unloveTrack(_song: ISong): Promise<void> {
    const service_method: string = "track.unlove"
    await loveOrUnloveTrack(service_method, _song);
}



export async function scrobble(duration?: number): Promise<void> {

    const service_method: string = "track.scrobble";
    
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
                    timestamp: getTimestamp(),
                    duration: duration,
                }

                const signature: string = getMethodSignature(params, API_SECRET); 
                params.api_sig = signature;
                console.log(params);

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

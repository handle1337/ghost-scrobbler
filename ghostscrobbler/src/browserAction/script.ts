import { loveTrack, unloveTrack, ISong } from '../api_handler'

function handleResponse(message: any) {
  console.log(`Message from the background script: ${message.response.auth}`);

  const song: ISong = message.response.song;

  const thumbnail_element = document.getElementById("thumbnail-element") as HTMLImageElement;
  const song_title_element = document.getElementById("song-title") as HTMLParagraphElement;
  const song_author_element = document.getElementById("song-author") as HTMLParagraphElement;
  const btn_love_element = document.getElementById('btn-love-track') as HTMLInputElement;

  btn_love_element.classList.toggle('greyed-out');


  if (thumbnail_element && song_title_element && song_author_element) {
    thumbnail_element.src = song.thumbnail_url;
    song_title_element.textContent = song.title;
    song_author_element.textContent = song.author;
  }
  
  const auth_element = document.getElementById("auth") as HTMLParagraphElement;

  if (message.response.auth && auth_element) {
    auth_element.textContent = "Last.fm is Authenticated";

    btn_love_element.addEventListener('click', function() {
      this.classList.toggle('greyed-out'); 
      if (!song.loved) {
        loveTrack(song);
        song.loved = true;
      } else {
        unloveTrack(song);
        song.loved = false;
      }
    });

  }
}

function handleError(error: any) {
  console.log(error);
}

function notifyBackgroundPage(e: any) {
  const sending = browser.runtime.sendMessage({
    page: "browser-action",
    data: "Msg from browser action",
  });
  sending.then(handleResponse, handleError);
}



window.addEventListener("load", notifyBackgroundPage);







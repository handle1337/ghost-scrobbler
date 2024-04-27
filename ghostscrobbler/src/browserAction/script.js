

function handleResponse(message) {
  console.log(`Message from the background script: ${message.response.auth}`);
  document.getElementById("thumbnail-element").src = message.response.song.thumbnail_url;
  document.getElementById("song-title").textContent = message.response.song.title;
  document.getElementById("song-author").textContent = message.response.song.author;
  if (message.response.auth) {
    document.getElementById("auth").textContent = "Last.fm is Authenticated";
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





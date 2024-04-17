function handleResponse(message) {
  console.log(`Message from the background script: ${message.response.title}`);

}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(e) {
  const sending = browser.runtime.sendMessage({
    data: "Msg from browser action",
  });
  sending.then(handleResponse, handleError);
}

window.addEventListener("load", notifyBackgroundPage);

document.getElementById("thumbnail-element").src = message.response.thumbnail_url;
document.getElementById("song-title").textContent = message.response.title;
document.getElementById("song-author").textContent = message.response.author;



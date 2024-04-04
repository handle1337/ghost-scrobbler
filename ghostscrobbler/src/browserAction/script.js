function handleResponse(message) {
  console.log(`Message from the background script: ${message.response}`);
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
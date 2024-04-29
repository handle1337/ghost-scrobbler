import { fetchToken, API_KEY } from '../api_handler'

async function handleResponse(message: any) {
  console.log(`Message from the background script: ${message.response.token}`);
  let token: string = message.response.token;
  const auth_url_element = document.getElementById("auth-url") as HTMLAnchorElement;
  if (auth_url_element) {
    if (token) {
      auth_url_element.href = `http://www.last.fm/api/auth/?api_key=${API_KEY}&token=${token}`;
    } else {
      auth_url_element.textContent = "No token found";
    }
  }
}

function handleError(error: Error): void
{
  console.log(error);
}

async function notifyBackgroundPage(e: any) {
  var token: string = await fetchToken();
  const sending = browser.runtime.sendMessage({
    page: "options",
    data: token,
  });
  sending.then(handleResponse, handleError);
}

window.addEventListener("load", notifyBackgroundPage);





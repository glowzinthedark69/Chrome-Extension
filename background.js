let apiLogs = [];

function shouldIgnoreRequest(details) {
  // Add conditions to filter out requests made by the extension itself
  const ignoredInitiators = ["chrome-extension://<your-extension-id>"]; // Replace with your actual extension ID
  const ignoredUrls = ["<url-to-ignore-1>", "<url-to-ignore-2>"]; // Add specific URLs to ignore

  return (
    ignoredInitiators.includes(details.initiator) ||
    ignoredUrls.some((url) => details.url.includes(url))
  );
}

// Capture all API calls, regardless of status code
chrome.webRequest.onCompleted.addListener(
  function (details) {
    // Filter out requests that should be ignored
    if (shouldIgnoreRequest(details)) {
      return;
    }

    const apiDetails = {
      url: details.url,
      method: details.method,
      statusCode: details.statusCode,
      timeStamp: new Date().toLocaleString(),
      fromCache: details.fromCache,
      ip: details.ip || "N/A",
      initiator: details.initiator || "N/A",
    };

    console.log("API Call Captured:", apiDetails);
    apiLogs.push(apiDetails);

    // Save the logs to chrome.storage for persistence
    chrome.storage.local.set({ apiLogs });

    // Notify the popup with the API call details
    try {
      chrome.runtime.sendMessage({
        type: "apiCall",
        apiDetails: apiDetails,
      });
    } catch (error) {
      console.warn("No listener available for the message:", error);
    }
  },
  { urls: ["https://the-internet.herokuapp.com/*"] }
);

// Capture Request Body for POST Requests
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Filter out requests that should be ignored
    if (shouldIgnoreRequest(details)) {
      return {};
    }

    let requestBody = null;

    if (details.method === "POST" && details.requestBody) {
      requestBody = details.requestBody.raw
        ? String.fromCharCode.apply(
            null,
            new Uint8Array(details.requestBody.raw[0].bytes)
          )
        : null;
    }

    details.requestBodyContext = requestBody;

    return {};
  },
  { urls: ["https://the-internet.herokuapp.com/*"] },
  ["requestBody"]
);

// Monitor network failures
chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
    // Filter out requests that should be ignored
    if (shouldIgnoreRequest(details)) {
      return;
    }

    console.warn("Network Error Captured:", details);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "networkError",
        url: details.url,
      });
    });
  },
  { urls: ["https://the-internet.herokuapp.com/*"] }
);

console.log("Background script for capturing all API calls and errors started");

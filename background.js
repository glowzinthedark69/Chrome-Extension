let apiLogs = [];
let errorLogs = [];

// Helper function to store logs
function storeLogs(type, logs) {
  const storageKey = type === "api" ? "apiLogs" : "errorLogs";
  chrome.storage.local.set({ [storageKey]: logs }, function () {
    console.log(
      `${type === "api" ? "API" : "Error"} logs stored successfully.`
    );
  });
}

// Capture all API calls to any URL that includes ".vndly.com/*"
chrome.webRequest.onCompleted.addListener(
  function (details) {
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

    // Store logs persistently
    storeLogs("api", apiLogs);

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

// Capture Request Body for POST Requests to ".vndly.com/*"
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
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

// Monitor network failures for ".vndly.com/*"
chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
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

// Capture console errors
const originalConsoleError = console.error;
console.error = function (...args) {
  const errorDetails = {
    type: "consoleError",
    message: args.join(" "),
    timestamp: new Date().toISOString(),
  };
  console.log("Console Error Captured:", errorDetails);
  errorLogs.push(errorDetails);

  // Store logs persistently
  storeLogs("error", errorLogs);

  chrome.runtime.sendMessage({ type: "consoleError", data: errorDetails });
  originalConsoleError.apply(console, args);
};

// Clear logs and respond to messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getApiLogs") {
    sendResponse(apiLogs || []);
  } else if (request.type === "getErrorLogs") {
    sendResponse(errorLogs || []);
  } else if (request.type === "clearApiLogs") {
    apiLogs = [];
    chrome.storage.local.set({ apiLogs: [] });
    sendResponse({ status: "success" });
  } else if (request.type === "clearErrorLogs") {
    errorLogs = [];
    chrome.storage.local.set({ errorLogs: [] });
    sendResponse({ status: "success" });
  }
});

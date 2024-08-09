let apiLogs = [];

// Capture all API calls, regardless of status code
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
  { urls: ["<all_urls>"] }
);

// Capture Request Body for POST Requests
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
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

// Clear in-memory logs when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "clearApiLogs") {
    apiLogs = []; // Clear in-memory logs
    chrome.storage.local.set({ apiLogs: [] }); // Clear persistent logs
    console.log("API logs cleared");
  } else if (request.type === "getApiLogs") {
    sendResponse(apiLogs);
  }
});

console.log("Background script for capturing all API calls started");

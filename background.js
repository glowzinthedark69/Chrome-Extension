let errorLogs = [];

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.statusCode >= 400) {
      const errorDetails = {
        url: details.url,
        method: details.method,
        statusCode: details.statusCode,
        timeStamp: new Date().toLocaleString(),
        requestBody: details.requestBodyContext || null,
      };

      console.log("Error Captured:", errorDetails);
      errorLogs.push(errorDetails);

      // Save the logs to chrome.storage for persistence
      chrome.storage.local.set({ errorLogs });

      // Notify the popup with the error details
      try {
        chrome.runtime.sendMessage({
          type: "networkError",
          error: errorDetails,
        });
      } catch (error) {
        console.warn("No listener available for the message:", error);
      }

      // Notify the user with a real-time notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: `Error Captured: ${details.statusCode}`,
        message: `Error on ${details.url}`,
        priority: 2,
      });
    }
  },
  { urls: ["<all_urls>"] }
);

// Capture network-level errors such as net::ERR_NAME_NOT_RESOLVED
chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
    const errorDetails = {
      url: details.url,
      method: details.method,
      error: details.error, // This will include errors like net::ERR_NAME_NOT_RESOLVED
      timeStamp: new Date().toLocaleString(),
      requestBody: details.requestBodyContext || null,
    };

    console.log("Network Error Captured:", errorDetails);
    errorLogs.push(errorDetails);

    // Save the logs to chrome.storage for persistence
    chrome.storage.local.set({ errorLogs });

    // Notify the popup with the error details
    try {
      chrome.runtime.sendMessage({
        type: "networkError",
        error: errorDetails,
      });
    } catch (error) {
      console.warn("No listener available for the message:", error);
    }

    // Notify the user with a real-time notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: `Network Error Captured`,
      message: `Error on ${details.url}: ${details.error}`,
      priority: 2,
    });
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
  if (request.type === "clearErrors") {
    errorLogs = []; // Clear in-memory logs
    chrome.storage.local.set({ errorLogs: [] }); // Clear persistent logs
    console.log("Error logs cleared");
  } else if (request.type === "getErrors") {
    sendResponse(errorLogs);
  }
});

console.log(
  "Background script with enhanced capture and clear functionality started"
);

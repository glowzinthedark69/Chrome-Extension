// Initialize an array to store captured errors
let errorLogs = [];

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.statusCode >= 400) {
      // Capture all 4xx and 5xx errors
      const errorDetails = {
        url: details.url,
        statusCode: details.statusCode,
        timeStamp: new Date().toLocaleString(),
      };
      console.log("Error Captured:", errorDetails);
      errorLogs.push(errorDetails); // Store the error details

      // Send the error details to the popup
      chrome.runtime.sendMessage({
        type: "networkError",
        error: errorDetails,
      });

      // Create a real-time notification for all errors
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: `Error Captured: ${details.statusCode}`,
        message: `Error on ${details.url}`,
        priority: 2,
      });
    }
  },
  { urls: ["<all_urls>"] } // Monitor all URLs
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getErrors") {
    sendResponse(errorLogs);
  }
});

console.log("Background script started");

chrome.runtime.sendMessage({ type: "getApiLogs" }, (response) => {
  const apiList = document.getElementById("api-list");
  apiList.innerHTML = ""; // Clear the list first

  if (response && response.length > 0) {
    response.forEach((apiCall) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
          <div style="margin-bottom: 10px;">
            <strong>Time:</strong> ${apiCall.timeStamp}<br>
            <strong>Status Code:</strong> <span style="color: ${
              apiCall.statusCode >= 500
                ? "red"
                : apiCall.statusCode >= 400
                ? "orange"
                : "green"
            }">${apiCall.statusCode}</span><br>
            <strong>URL:</strong> <a href="${
              apiCall.url
            }" target="_blank" class="url-truncate" title="${apiCall.url}">${
        apiCall.url
      }</a><br>
            <strong>Method:</strong> ${apiCall.method}<br>
            <strong>From Cache:</strong> ${apiCall.fromCache}<br>
            <strong>IP:</strong> ${apiCall.ip}<br>
            <strong>Initiator:</strong> ${apiCall.initiator}
          </div>
        `;

      apiList.appendChild(listItem);
    });
  } else {
    apiList.innerHTML = "<li>No API calls captured.</li>";
  }
});

// Clear logs functionality
document.getElementById("clear-logs").addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all API logs?")) {
    // Clear the stored API logs in chrome.storage
    chrome.storage.local.set({ apiLogs: [] }, () => {
      // Clear the UI
      const apiList = document.getElementById("api-list");
      apiList.innerHTML = "<li>No API calls captured.</li>";
    });

    // Clear in-memory logs by sending a message to the background script
    chrome.runtime.sendMessage({ type: "clearApiLogs" });
  }
});

// Retrieve and display logs when the popup opens
chrome.storage.local.get(["apiLogs"], function (result) {
  const logs = result.apiLogs || [];
  displayLogs(logs); // Function to render logs in the popup
});

function displayLogs(logs) {
  const logList = document.getElementById("api-list");
  logList.innerHTML = ""; // Clear previous logs

  logs.forEach((log) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong>Time:</strong> ${log.timeStamp}<br>
          <strong>Status Code:</strong> <span style="color: ${
            log.statusCode >= 500
              ? "red"
              : log.statusCode >= 400
              ? "orange"
              : "green"
          }">${log.statusCode}</span><br>
          <strong>URL:</strong> <a href="${
            log.url
          }" target="_blank" class="url-truncate" title="${log.url}">${
      log.url
    }</a><br>
          <strong>Method:</strong> ${log.method}<br>
          <strong>From Cache:</strong> ${log.fromCache}<br>
          <strong>IP:</strong> ${log.ip}<br>
          <strong>Initiator:</strong> ${log.initiator}
        </div>
      `;
    logList.appendChild(listItem);
  });
}

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

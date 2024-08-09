// Load and display error logs
chrome.runtime.sendMessage({ type: "getErrors" }, (response) => {
  const errorList = document.getElementById("error-list");
  errorList.innerHTML = ""; // Clear the list first

  if (response && response.length > 0) {
    response.forEach((error) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
          <div style="margin-bottom: 10px;">
            <strong>Time:</strong> ${error.timeStamp}<br>
            <strong>Status Code:</strong> <span style="color: ${
              error.statusCode >= 500 ? "red" : "orange"
            };">${error.statusCode}</span><br>
            <strong>URL:</strong> <a href="${
              error.url
            }" target="_blank" class="url-truncate" title="${error.url}">${
        error.url
      }</a><br>
            <strong>Method:</strong> ${error.method || "N/A"}<br>
            <strong>Request Body:</strong> <pre>${
              error.requestBody ? error.requestBody : "N/A"
            }</pre>
          </div>
        `;

      errorList.appendChild(listItem);
    });
  } else {
    errorList.innerHTML = "<li>No errors captured.</li>";
  }
});

// Clear logs functionality
document.getElementById("clear-logs").addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all error logs?")) {
    // Clear the stored error logs in chrome.storage
    chrome.storage.local.set({ errorLogs: [] }, () => {
      // Clear the UI
      const errorList = document.getElementById("error-list");
      errorList.innerHTML = "<li>No errors captured.</li>";
    });

    // Clear in-memory logs by sending a message to the background script
    chrome.runtime.sendMessage({ type: "clearErrors" });
  }
});

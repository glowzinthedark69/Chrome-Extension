document.addEventListener("DOMContentLoaded", function () {
  // Tab switching functionality
  document.getElementById("apiTab").addEventListener("click", function (event) {
    openTab(event, "ApiCalls");
  });
  document
    .getElementById("errorTab")
    .addEventListener("click", function (event) {
      openTab(event, "Errors");
    });

  // Retrieve and display API logs (only successful calls)
  chrome.runtime.sendMessage({ type: "getApiLogs" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving API logs:", chrome.runtime.lastError);
      displayLogs("api-list", []);
    } else {
      const successfulCalls = response.filter((log) => log.statusCode < 400);
      displayLogs("api-list", successfulCalls);
    }
  });

  // Retrieve and display Error logs (failed calls and other errors)
  chrome.runtime.sendMessage({ type: "getApiLogs" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving Error logs:", chrome.runtime.lastError);
      displayLogs("error-list", []);
    } else {
      const failedCalls = response.filter((log) => log.statusCode >= 400);
      displayLogs("error-list", failedCalls);
    }
  });

  // Clear API logs functionality
  document
    .getElementById("clear-api-logs")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to clear all API logs?")) {
        chrome.runtime.sendMessage({ type: "clearApiLogs" }, (response) => {
          if (response && response.status === "success") {
            displayLogs("api-list", []);
          }
        });
      }
    });

  // Clear Error logs functionality
  document
    .getElementById("clear-error-logs")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to clear all Error logs?")) {
        chrome.runtime.sendMessage({ type: "clearErrorLogs" }, (response) => {
          if (response && response.status === "success") {
            displayLogs("error-list", []);
          }
        });
      }
    });
});

function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  const tablinks = document.getElementsByClassName("tablink");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function displayLogs(listId, logs) {
  const logList = document.getElementById(listId);
  logList.innerHTML = ""; // Clear previous logs

  if (!logs || logs.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "No logs found.";
    logList.appendChild(listItem);
    return;
  }

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

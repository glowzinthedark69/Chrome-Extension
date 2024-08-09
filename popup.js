// Request the error logs from the background script when the popup opens
chrome.runtime.sendMessage({ type: "getErrors" }, (response) => {
  const errorList = document.getElementById("error-list");
  errorList.innerHTML = ""; // Clear the list first

  if (response && response.length > 0) {
    response.forEach((error) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${error.timeStamp}: ${error.statusCode} - ${error.url}`;
      errorList.appendChild(listItem);
    });
  } else {
    errorList.innerHTML = "<li>No errors captured.</li>";
  }
});

// Listen for real-time error updates from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "networkError") {
    const errorList = document.getElementById("error-list");
    const listItem = document.createElement("li");
    listItem.textContent = `${request.error.timeStamp}: ${request.error.statusCode} - ${request.error.url}`;
    errorList.appendChild(listItem);
  }
});

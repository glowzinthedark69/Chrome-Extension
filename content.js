// Enhanced logging structure
const logs = [];

// Capture console errors
const originalConsoleError = console.error;
console.error = function (...args) {
  const logEntry = {
    type: "consoleError",
    severity: "error",
    message: args.join(" "),
    timestamp: new Date().toISOString(),
  };
  logs.push(logEntry);
  chrome.runtime.sendMessage({ type: "logEntry", data: logEntry });
  originalConsoleError.apply(console, args);
};

// Capture JavaScript errors
window.onerror = function (message, source, lineno, colno, error) {
  const logEntry = {
    type: "jsError",
    severity: "error",
    message: `${message} at ${source}:${lineno}:${colno}`,
    error: error ? error.stack : null,
    timestamp: new Date().toISOString(),
  };
  logs.push(logEntry);
  chrome.runtime.sendMessage({ type: "logEntry", data: logEntry });
};

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", function (event) {
  const logEntry = {
    type: "unhandledRejection",
    severity: "error",
    message: event.reason
      ? event.reason.toString()
      : "Unhandled Promise Rejection",
    timestamp: new Date().toISOString(),
  };
  logs.push(logEntry);
  chrome.runtime.sendMessage({ type: "logEntry", data: logEntry });
});

// Monitor network errors
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "networkError") {
    const logEntry = {
      type: "networkError",
      severity: "warning",
      message: `Failed to load ${request.url}`,
      timestamp: new Date().toISOString(),
    };
    logs.push(logEntry);
  }
});

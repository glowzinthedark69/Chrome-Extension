// Capture console errors
const originalConsoleError = console.error;
console.error = function (...args) {
  chrome.runtime.sendMessage({ type: "consoleError", data: args });
  originalConsoleError.apply(console, args);
};

// Capture JavaScript errors
window.onerror = function (message, source, lineno, colno, error) {
  chrome.runtime.sendMessage({
    type: "jsError",
    message: message,
    source: source,
    lineno: lineno,
    colno: colno,
    error: error ? error.stack : null,
  });
};

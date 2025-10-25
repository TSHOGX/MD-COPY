let modKeyDown = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // grab Shift key state as fast as we can
  const forceTitle = modKeyDown;
  //   let clipboardData = request.tabTitle + "\n" + request.tabUrl;
  let clipboardData =
    "[" + request.tabTitle + "](" + request.tabUrl + ") " + "\n";

  if (request.useSelection) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      //   clipboardData = selectedText + "\n" + request.tabUrl;
      clipboardData =
        selectedText +
        " [" +
        request.tabTitle +
        "](" +
        request.tabUrl +
        ") " +
        "\n";
      if (forceTitle) {
        clipboardData = request.tabTitle + "\n" + clipboardData;
      }
    }
  }

  // When we copy data, we create a new DOM element.
  // This destroys current selection, so we save the selection
  // and restore it after copying.
  let selectionRange = null;
  if (request.useSelection) {
    selectionRange = saveSelection();
  }

  copyToClipboard(clipboardData);

  if (selectionRange) {
    restoreSelection(selectionRange);
  }

  // Show success feedback
  showCopyFeedback();
});

function copyToClipboard(data) {
  // https://stackoverflow.com/questions/3436102/copy-to-clipboard-in-chrome-extension
  const copySource = document.createElement("textarea");
  copySource.textContent = data;
  document.body.appendChild(copySource);
  copySource.select();
  document.execCommand("copy");
  document.body.removeChild(copySource);
}

document.addEventListener("keydown", (event) => {
  modKeyDown = event.shiftKey || event.ctrlKey;
});

document.addEventListener("keyup", (event) => {
  // for our purposes, user will not be pressing any other keys
  modKeyDown = false;
});

// Save and Restore DOM text selection, by dantaex
// https://gist.github.com/dantaex/543e721be845c18d2f92652c0ebe06aa
// (reduced to bare minimum that we need here)
function saveSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  }
  return null;
}

function restoreSelection(range) {
  if (range) {
    if (window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

function showCopyFeedback() {
  // Create toast element
  const toast = document.createElement("div");
  toast.textContent = "✅ Copied!";
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  `;

  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 800);
}

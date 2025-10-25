const REQUEST_TITLE = "md-copy-page";
const REQUEST_SELECTION = "md-copy-selection";

/* This extension creates two context menu items: one for the default case,
    and one to use when some text is selected on a web page. Only one of the
    two items is shown at a time, otherwise Firefox puts them in a submenu,
    which requires additional clicks to navigate.
*/

// support Firefox and Chrome
if (!browser) {
  var browser = chrome;
}

// Remove all existing context menu items to avoid duplicate ID errors
browser.contextMenus.removeAll(function() {
  browser.contextMenus.create({
    id: REQUEST_TITLE,
    title: "copy page",
    contexts: ["page"],
    // onclick: handleCopyRequest,
  });
  browser.contextMenus.create({
    id: REQUEST_SELECTION,
    title: "copy selection",
    contexts: ["selection"],
    // onclick: handleCopyRequest,
  });
});

// Add event listener for menu item clicks
browser.contextMenus.onClicked.addListener(handleCopyRequest);

function handleCopyRequest(info, tab) {
  // check in which context the command was clicked
  const useSelection = info.menuItemId === REQUEST_SELECTION;
  chrome.tabs.sendMessage(tab.id, {
    tabUrl: tab.url,
    tabTitle: tab.title,
    useSelection: useSelection,
  });
}

// Add event listener for extension icon clicks
browser.action.onClicked.addListener(function(tab) {
  // When icon is clicked, copy the current page as markdown link
  chrome.tabs.sendMessage(tab.id, {
    tabUrl: tab.url,
    tabTitle: tab.title,
    useSelection: false,
  });
});

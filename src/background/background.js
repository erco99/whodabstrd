let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "get_ds_user_id") {
    chrome.cookies.getAll({ domain: ".instagram.com" }, (cookies) => {
      const dsUserCookie = cookies.find(c => c.name === "ds_user_id");
      sendResponse({ ds_user_id: dsUserCookie ? dsUserCookie.value : null });
    });
    return true;
  }

  if (msg.action === "get_csrftoken") {
      chrome.cookies.getAll({ domain: ".instagram.com" }, (cookies) => {
      const csrfToken = cookies.find(c => c.name === "csrftoken");
      sendResponse({ csrftoken: csrfToken ? csrfToken.value : null });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.runtime.sendMessage({
      type: "url_changed"
    });
  }
});


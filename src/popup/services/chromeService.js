export const ChromeService = {
  getUserId() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "get_ds_user_id" },
        (response) => resolve(response?.ds_user_id)
      );
    });
  },

  sendUsersToContent(users) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, {
        action: "insertUsers",
        users
      });
    });
  }
};

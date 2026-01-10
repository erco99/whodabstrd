import { ChromeService } from "../services/chromeService.js";
import { InstagramService } from "../services/instagramService.js";
import { ScanProgressService } from "../services/scanProgressService.js";
import { ScanUI } from "../ui/scanUI.js";

export const ScanController = {
  async init() {
    await this.updateButtonState();

    ScanUI.button().addEventListener("click", () => this.scan());

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "url_changed") {
        this.updateButtonState();
      }
    });
  },

  async scan() {
    try {
      ScanUI.setLoading(true);

      const userId = await ChromeService.getUserId();
      if (!userId) throw new Error("No user id");

      const username = await InstagramService.getUsernameFromId(userId);

      const total =
        await InstagramService.getFollowersAndFollowingCount(username);

      ScanProgressService.reset(total, (processed, total) => {
        ScanUI.updateProgress(`${processed} / ${total}`);
      });

      const [followers, following] = await Promise.all([
        InstagramService.fetchAll("followers", userId),
        InstagramService.fetchAll("following", userId)
      ]);

      const followerIds = new Set(followers.map(u => u.id));
      const notFollowingBack =
        following.filter(u => !followerIds.has(u.id));

      ChromeService.sendUsersToContent(notFollowingBack);

    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      ScanUI.setLoading(false);
    }
  },

  async canEnable() {
    try {
      const userId = await ChromeService.getUserId();
      if (!userId) return false;

      const username = await InstagramService.getUsernameFromId(userId);

      const tab = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          resolve(tab);
        });
      });

      if (!tab?.url) return false;

      const url = new URL(tab.url);

      return (
        url.hostname === "www.instagram.com" &&
        url.pathname === `/${username}/`
      );
    } catch {
      return false;
    }
  },

  async updateButtonState() {
    const enabled = await this.canEnable();
    ScanUI.setEnabled(enabled);
  },
};

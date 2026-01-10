import { ChromeService } from "../services/chromeService.js";
import { InstagramService } from "../services/instagramService.js";
import { UserUI } from "../ui/userUI.js";

export const UserController = {
  async init() {
    try {
      const userId = await ChromeService.getUserId();
      const username = await InstagramService.getUsernameFromId(userId);

      UserUI.setUsername(username);
    } catch {
      UserUI.setNotLogged();
    }
  }
};

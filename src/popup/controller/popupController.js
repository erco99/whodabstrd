import { ScanController } from "./scanController.js";
import { UserController } from "./userController.js";

export const PopupController = {
  async init() {
    await UserController.init();
    ScanController.init();
  }
};

import { registerEvent } from "../register-event";
import type { GameShop } from "@types";
import { Ludusavi } from "@main/services";

const getGameBackupPreview = async (
  _event: Electron.IpcMainInvokeEvent,
  objectId: string,
  shop: GameShop
) => {
  return Ludusavi.getBackupPreview(shop, objectId);
};

registerEvent("getGameBackupPreview", getGameBackupPreview);

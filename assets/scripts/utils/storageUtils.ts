import { sys } from "cc";
import ConsoleUtils from "./consoleUtils";

enum StorageKey {
  TOKEN = "token",
  SETTING_SPEACILSOUND = "setting_speacilsound",
  SETTING_MUSIC = "setting_music",
  SETTING_SHAKE = "setting_shake",
  LEVEL_DATA = "LEVEL_DATA",
}

class StorageUtils {
  private static storage: Storage = sys?.localStorage || window.localStorage;

  public static set = <T = any>(key: StorageKey, value: T): boolean => {
    try {
      const jsonString = JSON.stringify(value);
      this.storage.setItem(key, jsonString);
      return true;
    } catch (error) {
      ConsoleUtils.error("StorageUtils_SET", error);
      return false;
    }
  };

  public static get = <T = any>(key: StorageKey): T | null => {
    try {
      const value = this.storage.getItem(key);
      return value !== null ? JSON.parse(value) : null;
    } catch (error) {
      ConsoleUtils.error("StorageUtils_GET:", error);
      return null;
    }
  };

  public static remove = (key: StorageKey): void => {
    this.storage.removeItem(key);
  };

  public static clear = (): void => {
    this.storage.clear();
  };
}

export default StorageUtils;
export { StorageKey };

import StorageUtils, { StorageKey } from "./storageUtils";
import AudioUtils from "./audioUtils";

export default class SettingUtils {
  private constructor() {}
  private static _value_speacilSound: boolean;
  public static get value_speacilSound(): boolean {
    if (this._value_speacilSound == null) {
      this._value_speacilSound = this.getValue(StorageKey.SETTING_SPEACILSOUND);
    }
    return this._value_speacilSound;
  }
  public static set value_speacilSound(v: boolean) {
    this._value_speacilSound = v;
    this.setValue(StorageKey.SETTING_SPEACILSOUND, v);
  }

  private static _value_music: boolean;
  public static get value_music(): boolean {
    if (this._value_music == null) {
      this._value_music = this.getValue(StorageKey.SETTING_MUSIC);
    }
    return this._value_music;
  }
  public static set value_music(v: boolean) {
    this._value_music = v;
    this.setValue(StorageKey.SETTING_MUSIC, v);
    if (!v) {
      AudioUtils.stopBGM();
    } else {
      // AudioUtils.playBGM(AudioUtils.bgm);
    }
  }

  private static _value_shake: boolean;
  public static get value_shake(): boolean {
    if (this._value_shake == null) {
      this._value_shake = this.getValue(StorageKey.SETTING_SHAKE);
    }
    return this._value_shake;
  }
  public static set value_shake(v: boolean) {
    this._value_shake = v;
    this.setValue(StorageKey.SETTING_SHAKE, v);
  }

  private static getValue(key: StorageKey): boolean {
    const value = StorageUtils.get(key);
    if (value == null) {
      this.setValue(key, true);
      return true;
    }
    return value;
  }

  private static setValue(key: StorageKey, value: boolean) {
    StorageUtils.set(key, value);
  }
}

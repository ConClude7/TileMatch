import { instantiate, Prefab } from "cc";
import AudioUtils, { AudioKey } from "./audioUtils";
import StorageUtils, { StorageKey } from "./storageUtils";
import NodeUtils from "./nodeUtils";
import ConsoleUtils from "./consoleUtils";

export default class SettingUtils {
  private constructor() {}
  private static _singleTon: SettingUtils | null = null;
  public static get Instance(): SettingUtils {
    if (this._singleTon === null) {
      this._singleTon = new SettingUtils();
    }
    return this._singleTon;
  }

  public prefab: Prefab | null = null;
  private _audio: AudioUtils | null = null;

  private get audio(): AudioUtils {
    if (this._audio === null) {
      this._audio = AudioUtils.Instance;
    }
    return this._audio;
  }

  private _value_speacilSound: boolean | null = null;
  public get value_speacilSound(): boolean {
    if (this._value_speacilSound == null) {
      this._value_speacilSound = this.getValue(StorageKey.SETTING_SPEACILSOUND);
    }
    return this._value_speacilSound;
  }
  public set value_speacilSound(v: boolean) {
    this._value_speacilSound = v;
    this.setValue(StorageKey.SETTING_SPEACILSOUND, v);
  }

  private _value_music: boolean | null = null;
  public get value_music(): boolean {
    if (this._value_music == null) {
      this._value_music = this.getValue(StorageKey.SETTING_MUSIC);
    }
    return this._value_music;
  }
  public set value_music(v: boolean) {
    this._value_music = v;
    this.setValue(StorageKey.SETTING_MUSIC, v);
    if (!v) {
      this.audio.stopBGM();
    } else {
      this.audio.playBGM(AudioKey.BGM);
    }
  }

  private _value_shake: boolean | null = null;
  public get value_shake(): boolean {
    if (this._value_shake == null) {
      this._value_shake = this.getValue(StorageKey.SETTING_SHAKE);
    }
    return this._value_shake;
  }
  public set value_shake(v: boolean) {
    this._value_shake = v;
    this.setValue(StorageKey.SETTING_SHAKE, v);
  }

  private getValue(key: StorageKey): boolean {
    const value = StorageUtils.get(key);
    if (value == null) {
      this.setValue(key, true);
      return true;
    }
    return value;
  }

  private setValue(key: StorageKey, value: boolean) {
    StorageUtils.set(key, value);
  }

  public showModal() {
    if (!this.prefab) {
      ConsoleUtils.error("AudioUtils", { msg: "没有设置弹窗的Prefab" }, true);
      return;
    }
    const node = instantiate(this.prefab);
    NodeUtils.canvas?.addChild(node);
  }
}

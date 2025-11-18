import { AudioClip, AudioSource, resources } from "cc";
import ConsoleUtils from "./consoleUtils";
import SettingUtils from "./settingUtils";

enum AudioKey {
  BGM = "bgm",
  BUTTON_CLICK = "button_click",
}

class AudioUtils {
  private constructor() {
    this._audioSource = new AudioSource();
  }
  private static _singleTon: AudioUtils | null = null;
  public static get Instance(): AudioUtils {
    if (this._singleTon === null) {
      this._singleTon = new AudioUtils();
      this._singleTon.init();
    }
    return this._singleTon;
  }

  private _path = "audios/";
  private _audioSource: AudioSource;
  private _setting: SettingUtils | null = null;

  public get setting(): SettingUtils {
    if (this._setting === null) {
      this._setting = SettingUtils.Instance;
    }
    return this._setting;
  }

  private init = () => {
    // 初始化音频组件设置
    this._audioSource.loop = false;
    this._audioSource.volume = 1.0;
  };

  // 新增背景音乐控制方法 ----------------------------------
  public playBGM = (sound: AudioKey, volume = 1.0) => {
    if (!this.setting.value_music) return;
    const playClip = (clip: AudioClip) => {
      this._audioSource.stop();
      this._audioSource.clip = clip;
      this._audioSource.loop = true;
      this._audioSource.volume = volume;
      this._audioSource.play();
    };
    resources.load(this._path + sound, (err, clip: AudioClip) => {
      if (err) {
        ConsoleUtils.error("背景音乐加载失败", err);
        return;
      }
      playClip(clip);
    });
  };

  public stopBGM = () => {
    this._audioSource.stop();
    this._audioSource.clip = null; // 清空当前音频剪辑
  };

  public restartBGM = () => {
    if (this._audioSource && this._audioSource.clip) {
      this._audioSource.play();
    }
  };

  public playOneShot = (sound: AudioKey, volumn = 1.0) => {
    this.playSound(sound, volumn);
  };

  private playSound = (sound: AudioKey, volumn = 1.0) => {
    if (!this.setting.value_speacilSound) return;
    resources.load(this._path + sound, (err, clip: AudioClip) => {
      if (err) {
        ConsoleUtils.error("音频播放失败", err);
        return;
      }
      this._audioSource.playOneShot(clip, volumn);
    });
  };
}
export { AudioKey };
export default AudioUtils;

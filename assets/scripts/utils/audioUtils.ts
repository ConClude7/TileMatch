import { AudioClip, AudioSource, resources } from "cc";
import SettingUtils from "./settingUtils";
import ConsoleUtils from "./consoleUtils";
import { math } from "cc";

export default class AudioUtils {
  private static _instance: AudioUtils | null = null;
  private static _audioSource: AudioSource | null = null;

  // 静态音频资源声明
  public static bgm_home: AudioClip | undefined;
  public static bgm_game: AudioClip | undefined;

  public static sound_button_click: AudioClip | undefined;
  public static sound_tileDestory: AudioClip[];
  public static sound_bigDestory: AudioClip[];

  public static sound_win: AudioClip | undefined;
  public static sound_fail: AudioClip | undefined;

  public static sound_propsBomb: AudioClip | undefined;

  public static init = () => {
    if (this._instance === null) {
      this._instance = new AudioUtils();
      this._audioSource = new AudioSource();
      // 初始化音频组件设置
      this._audioSource.loop = false;
      this._audioSource.volume = 1.0;
    }
  };

  // 新增背景音乐控制方法 ----------------------------------
  public static playBGM = (sound: string | AudioClip, volume = 1.0) => {
    if (!SettingUtils.value_music) return;

    const playClip = (clip: AudioClip) => {
      if (!this._audioSource) return;
      this._audioSource.stop();
      this._audioSource.clip = clip;
      this._audioSource.loop = true;
      this._audioSource.volume = volume;
      this._audioSource.play();
    };

    if (sound instanceof AudioClip) {
      playClip(sound);
    } else {
      resources.load(sound, (err, clip: AudioClip) => {
        if (err) {
          ConsoleUtils.error("背景音乐加载失败", err);
          return;
        }
        playClip(clip);
      });
    }
  };

  public static stopBGM = () => {
    if (this._audioSource) {
      this._audioSource.stop();
      this._audioSource.clip = null; // 清空当前音频剪辑
    }
  };

  public static restartBGM = () => {
    if (this._audioSource && this._audioSource.clip) {
      this._audioSource.play();
    }
  };

  public static playOneShot = (sound: string | AudioClip, volumn = 1.0) => {
    if (!SettingUtils.value_speacilSound) return;
    this.playSound(sound, volumn);
  };

  private static playSound = (sound: string | AudioClip, volumn = 1.0) => {
    if (sound instanceof AudioClip) {
      if (!this._audioSource) return;

      this._audioSource.playOneShot(sound, volumn);
      return;
    }
    resources.load(sound, (err, clip: AudioClip) => {
      if (!this._audioSource) return;
      if (err) {
        ConsoleUtils.error("音频播放失败", err);
        return;
      }
      this._audioSource.playOneShot(clip, volumn);
    });
  };

  public static playButton = () => {
    if (!this.sound_button_click) return;
    this.playOneShot(this.sound_button_click);
  };

  public static playPropsBomb = () => {
    if (!this.sound_propsBomb) return;
    this.playOneShot(this.sound_propsBomb);
  };

  public static playTileDestory = (num: number) => {
    const targetNum = Math.min(Math.max(1, num), 7);
    this.playOneShot(this.sound_tileDestory[targetNum - 1]);
  };

  public static playBigDestory = (num: number) => {
    let targetNum = 1;
    switch (num) {
      case 4:
        targetNum = 1;
        break;
      case 5:
        targetNum = 2;
        break;
      case 6:
        targetNum = 3;
        break;
      default:
        targetNum = 4;
        break;
    }
    this.playOneShot(this.sound_bigDestory[targetNum - 1]);
  };

  public static playBgmHome = () => {
    if (!this.bgm_home) return;
    this.stopBGM();
    this.playBGM(this.bgm_home);
  };

  public static playBgmGame = () => {
    if (!this.bgm_game) return;
    this.stopBGM();
    this.playBGM(this.bgm_game);
  };

  public static playOver = (win: boolean) => {
    const targetSound = win ? this.sound_win : this.sound_fail;
    if (!targetSound) return;
    this.playOneShot(targetSound);
  };
}

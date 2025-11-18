import { sys, __private, screen, Node, view, ResolutionPolicy } from "cc";
import EventUtils, { EventKey } from "./eventUtils";
import ConsoleUtils from "./consoleUtils";
import SettingUtils from "./settingUtils";
import {
  AppEnv,
  NetworkType,
  ShakeType,
  SystemPlatform,
} from "../enum/system/index";
import ToastUtils from "./toastUtils";

export default class SystemUtils {
  private static finishInit = false;
  /**
   * 环境
   */
  public static env: AppEnv;
  public static get isRelease(): boolean {
    // return true;
    if (this.isTtGame) return true;
    return [AppEnv.RELEASE, AppEnv.TRIAL].includes(this.env);
  }
  private static nativeIsRelease = false;

  /**
   * 当前版本
   */
  public static appVersion: string;
  /**
   * 微信小游戏环境
   */
  public static isWechatGame: boolean;

  public static get isTtGame(): boolean {
    return this.platform === SystemPlatform.BYTEDANCE_MINI_GAME;
  }
  /**
   * 当前运行系统
   */
  public static os: __private._pal_system_info_enum_type_operating_system__OS;
  /**
   * 当前运行系统版本字符串
   */
  public static osVersion: string;
  /**
   * 当前系统主版本
   */
  public static osMainVersion: number;
  /**
   * 当前运行平台或环境
   */
  public static platform: SystemPlatform;
  /**
   * 网络类型枚举
   */
  public static network: NetworkType;
  /**
   * 当前运行环境的语言
   */
  public static language: __private._pal_system_info_enum_type_language__Language;

  public static get isNative(): boolean {
    return sys.isNative;
  }

  public static get isIos(): boolean {
    return this.platform === SystemPlatform.IOS;
  }

  public static get isAndroid(): boolean {
    return this.platform === SystemPlatform.ANDROID;
  }
  public static windowSize: {
    width: number;
    height: number;
  };

  /**
   * 初始化
   */
  public static init = async (): Promise<unknown> => {
    if (this.finishInit) return;

    this.finishInit = true;
    this.windowSize = {
      width: 375,
      height: 812,
    };
    this.windowSize = screen.windowSize;

    this.os = sys.os;
    this.osVersion = sys.osVersion;
    this.osMainVersion = sys.osMainVersion;
    this.platform = sys.platform as unknown as SystemPlatform;
    this.network = sys.getNetworkType() as unknown as NetworkType;
    this.language = sys.language;
    this.isWechatGame = this.platform === SystemPlatform.WECHAT_GAME;

    this.initResolutionPolicy();
    this.addResizeEvent();
    this.initEnv();
    this.initWindowInfo();
    this.listenMemoryWran();
    this.checkUpdate();
    ConsoleUtils.log(`SystemInfo`, {
      env: this.env,
      appVersion: this.appVersion,
      isWechatGame: this.isWechatGame,
      os: this.os,
      osVersion: this.osVersion,
      osMainVersion: this.osMainVersion,
      platform: this.platform,
      network: this.network,
      language: this.language,
      windowSize: this.windowSize,
    });
  };

  /**
   * 初始化设备窗口
   */
  public static initWindowInfo = () => {
    switch (this.platform) {
      case SystemPlatform.IOS:
        break;
      case SystemPlatform.ANDROID:
        break;
      default:
        break;
    }
  };

  // 初始化适配策略
  private static initResolutionPolicy() {
    // 获取实际屏幕尺寸
    const screenSize = view.getVisibleSize();
    const screenRatio = screenSize.width / screenSize.height;
    const designRatio = 375 / 812;

    // 根据宽高比自动选择适配模式
    if (screenRatio >= designRatio) {
      // 宽屏设备：保持高度适配，宽度延伸
      view.setDesignResolutionSize(375, 812, ResolutionPolicy.FIXED_HEIGHT);
    } else {
      // 窄屏设备：保持宽度适配，高度延伸
      view.setDesignResolutionSize(375, 812, ResolutionPolicy.FIXED_WIDTH);
    }
  }

  // 添加窗口resize监听
  private static addResizeEvent() {
    view.setResizeCallback(() => {
      this.initResolutionPolicy();
    });
  }

  private static initEnv = () => {
    switch (this.platform) {
      case SystemPlatform.IOS:
        break;
      case SystemPlatform.ANDROID:
        this.env =
          this.nativeIsRelease === true ? AppEnv.RELEASE : AppEnv.TRIAL;
        break;
      default:
        this.env = AppEnv.UNKNOWN;
        break;
    }
  };

  /**
   * 刷新网络环境
   */
  public static refreshNetwork = () => {
    const networkType = sys.getNetworkType() as unknown as NetworkType;
    if (this.network === networkType) return;
    EventUtils.emit(EventKey.CHANGE_NETWORK, {
      success: true,
      data: networkType,
    });
    this.network = networkType;
    if (networkType === NetworkType.WWAN) {
      ToastUtils.showNormal("正在使用移动数据");
    }
  };

  /**
   * 用户设备震动
   * @param type 震动等级
   * @param isLong 是否长震动
   */
  public static shakeUser = async (type: ShakeType, isLong = false) => {
    if (!SettingUtils.Instance.value_shake) return;
    switch (this.platform) {
      case SystemPlatform.IOS:
        break;
      case SystemPlatform.ANDROID:
        break;
      default:
        break;
    }
  };

  /**
   * 监听内存警告
   */
  private static listenMemoryWran = () => {
    switch (this.platform) {
      case SystemPlatform.IOS:
        break;
      case SystemPlatform.ANDROID:
        break;
      default:
        break;
    }
  };

  /**
   * 检查更新
   */
  public static checkUpdate = () => {};

  /**
   * 复制到剪贴板
   * @param data 复制的文本
   */
  public static copyToClipBoard = (data: string) => {
    try {
      const showSuccess = () => {
        ToastUtils.showNormal("复制成功");
      };

      switch (SystemUtils.platform) {
        case SystemPlatform.IOS:
          break;
        case SystemPlatform.ANDROID:
          break;
        default:
          navigator.clipboard.writeText(data).then(() => {
            showSuccess();
          });
          break;
      }
    } catch (error) {
      ToastUtils.showError("复制到剪贴板出错");
      ConsoleUtils.error("复制到剪贴板出错", error, false);
    }
  };

  /**
   * 获取剪贴板内容
   * @returns 剪贴板内容-可能为空
   */
  public static getClipBoard = async (): Promise<string | null> => {
    try {
      let data = null;
      switch (SystemUtils.platform) {
        case SystemPlatform.IOS:
          break;
        case SystemPlatform.ANDROID:
          break;
        default:
          data = await navigator.clipboard.readText();
          break;
      }
      return data;
    } catch (error) {
      ToastUtils.showError("获取剪贴板内容出错");
      ConsoleUtils.error("获取剪贴板内容出错", error, false);
      return null;
    }
  };

  /**
   * 获取冷启动分享参数
   * @returns query
   */
  public static getShareInfo = async (): Promise<any | null> => {
    let data = null;
    switch (this.platform) {
      case SystemPlatform.IOS:
        break;
      case SystemPlatform.ANDROID:
        break;
      default:
        break;
    }
    return data;
  };
}

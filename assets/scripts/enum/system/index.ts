enum AppEnv {
  UNKNOWN = "未知",
  DEVELOPER = "开发版",
  TRIAL = "体验版",
  RELEASE = "正式版",
}

enum SystemPlatform {
  UNKNOWN = "UNKNOWN",
  EDITOR_PAGE = "EDITOR_PAGE",
  EDITOR_CORE = "EDITOR_CORE",
  MOBILE_BROWSER = "MOBILE_BROWSER",
  DESKTOP_BROWSER = "DESKTOP_BROWSER",
  WIN32 = "WIN32",
  ANDROID = "ANDROID",
  IOS = "IOS",
  MACOS = "MACOS",
  OHOS = "OHOS",
  OPENHARMONY = "OPENHARMONY",
  WECHAT_GAME = "WECHAT_GAME",
  WECHAT_MINI_PROGRAM = "WECHAT_MINI_PROGRAM",
  BAIDU_MINI_GAME = "BAIDU_MINI_GAME",
  XIAOMI_QUICK_GAME = "XIAOMI_QUICK_GAME",
  ALIPAY_MINI_GAME = "ALIPAY_MINI_GAME",
  TAOBAO_CREATIVE_APP = "TAOBAO_CREATIVE_APP",
  TAOBAO_MINI_GAME = "TAOBAO_MINI_GAME",
  BYTEDANCE_MINI_GAME = "BYTEDANCE_MINI_GAME",
  OPPO_MINI_GAME = "OPPO_MINI_GAME",
  VIVO_MINI_GAME = "VIVO_MINI_GAME",
  HUAWEI_QUICK_GAME = "HUAWEI_QUICK_GAME",
  COCOSPLAY = "COCOSPLAY",
  LINKSURE_MINI_GAME = "LINKSURE_MINI_GAME",
  QTT_MINI_GAME = "QTT_MINI_GAME",
}

enum ShakeType {
  LIGHT = "light",
  MEDIUM = "medium",
  HEAVY = "heavy",
}

enum NetworkType {
  /**
   * @en Network is unreachable.
   * @zh 网络不通
   */
  NONE = 0,
  /**
   * @en Network is reachable via WiFi or cable.
   * @zh 通过无线或者有线本地网络连接因特网
   */
  LAN = 1,
  /**
   * @en Network is reachable via Wireless Wide Area Network
   * @zh 通过蜂窝移动网络连接因特网
   */
  WWAN = 2,
}

export { AppEnv, SystemPlatform, ShakeType, NetworkType };

import { director, Director, Scene, SceneAsset } from "cc";
import ConsoleUtils from "../utils/consoleUtils";

import { log } from "cc";
import { getEnumey } from "../enum";

enum GameScene {
  Home = "HOME",
  GAME = "GAME",
}

class SceneUtils {
  /** 获取当前Scene */
  public static get nowScene(): GameScene | null {
    const nowScene = director.getScene();
    if (!nowScene) {
      ConsoleUtils.error("SceneUtils", { msg: "当前场景为空" }, true);
      return null;
    }
    const sceneName = nowScene.name;
    const gameScene = getEnumey(GameScene, sceneName);
    ConsoleUtils.log("获取当前场景", { gameScene }, true);
    return gameScene;
  }

  /**
   * 预加载
   * @param gameScene 场景名称
   * @param onLoaded 回调
   */
  public static preload = (
    gameScene: GameScene,
    onProgress?: (progress: number) => void
  ) => {
    try {
      let lastPreloadItem: any = null;
      director.preloadScene(
        gameScene,
        (completedCount: number, totalCount: number, item: any) => {
          if (lastPreloadItem !== item) {
            log("正在预加载", item);
            lastPreloadItem = item;
          }
          // 计算加载进度
          const progress = completedCount / totalCount;
          onProgress?.(progress);
        },
        (error: null | Error, sceneAsset?: SceneAsset) => {
          if (error) {
            ConsoleUtils.error(`预加载场景失败_{${gameScene}}`, error);
            return;
          }
          ConsoleUtils.log(`预加载场景_{${gameScene}}`, sceneAsset, false);
        }
      );
    } catch (error) {
      ConsoleUtils.error(`预加载场景失败_{${gameScene}}`, error);
    }
  };

  /**
   * 切换场景
   * @param gameScene 场景名称
   * @param onLaunched 回调
   * @param onUnloaded 回调
   */
  public static load = (
    gameScene: GameScene,
    onLaunched?: Director.OnSceneLaunched,
    onUnloaded?: Director.OnUnload
  ) => {
    try {
      const onLaunch = (error: null | Error, scene?: Scene) => {
        onLaunched?.(error, scene);
        if (error) {
          ConsoleUtils.error(`加载场景失败_{${gameScene}}`, error);
          return;
        }
        ConsoleUtils.log(`切换场景_{${gameScene}}`, scene);
      };

      const onUnload = () => {
        onUnloaded?.();
      };
      director.loadScene(gameScene, onLaunch, onUnload);
    } catch (error) {
      ConsoleUtils.error(`加载场景失败_{${gameScene}}`, error);
    }
  };
}

export default SceneUtils;
export { GameScene };

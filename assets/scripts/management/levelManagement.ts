import ConsoleUtils from "../utils/consoleUtils";
import StorageUtils, { StorageKey } from "../utils/storageUtils";

const TAG = "LevelManager";

export default class LevelManager {
  private constructor() {}
  private static _singleton: LevelManager | null = null;
  public static get Instance() {
    if (!this._singleton) {
      this._singleton = new LevelManager();
    }
    return this._singleton;
  }

  private maxLevel = 9;
  private storageKey = StorageKey.LEVEL_DATA;

  public currentGameLevel = 1;

  public levelConfig = (): LevelConfig => {
    const levelConfig: LevelConfig = {
      TILE_TYPE: 5,
      TOTAL_SCORE: 100,
      TOTAL_TIME: 90,
    };

    switch (this.currentGameLevel) {
      case 1:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 60,
          TOTAL_TIME: 90,
        });
        break;
      case 2:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 80,
          TOTAL_TIME: 90,
        });
        break;
      case 3:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 100,
          TOTAL_TIME: 90,
        });
        break;
      case 4:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 120,
          TOTAL_TIME: 90,
        });
        break;
      case 5:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 150,
          TOTAL_TIME: 90,
        });
        break;
      case 6:
        Object.assign(levelConfig, {
          TILE_TYPE: 7,
          TOTAL_SCORE: 180,
          TOTAL_TIME: 90,
        });
        break;
      default:
        Object.assign(levelConfig, {
          TILE_TYPE: 5,
          TOTAL_SCORE: 200,
          TOTAL_TIME: 90,
        });
        break;
    }
    return levelConfig;
  };

  private createEmptyData() {
    return new Promise<Array<LevelData>>((resolve) => {
      const dataList: Array<LevelData> = [];
      let level = 1;
      const next = () => {
        if (level >= this.maxLevel) {
          resolve(dataList);
          return;
        }
        dataList.push({
          level,
          stars: 0,
          played: false,
        });
        level++;
        next();
      };
      next();
    });
  }

  private _data: Array<LevelData> = [];
  public init = async () => {
    ConsoleUtils.log(TAG, "开始初始化");
    const levelData = StorageUtils.get<Array<LevelData>>(this.storageKey);

    if (!levelData) {
      this._data = await this.createEmptyData();
      StorageUtils.set(this.storageKey, this._data);
    } else {
      this._data = levelData;
    }
  };

  public getData(): Array<LevelData> {
    return this._data;
  }

  public updateLevelData(levelData: LevelData) {
    const copyData = [...this._data];
    const map = new Map(copyData.map((item) => [item.level, item]));
    map.set(levelData.level, levelData);
    const updateList = Array.from(map.values());
    StorageUtils.set(this.storageKey, updateList);
    this._data = updateList;
  }

  public gameWin() {
    const levelData: LevelData = {
      level: this.currentGameLevel,
      stars: 3,
      played: true,
    };
    this.updateLevelData(levelData);
  }
}

export interface LevelData {
  level: number;
  stars: 0 | 1 | 2 | 3;
  played: boolean;
}

export interface LevelConfig {
  TILE_TYPE: number;
  TOTAL_SCORE: number;
  TOTAL_TIME: number;
}

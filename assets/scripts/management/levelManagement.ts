import ConsoleUtils from "../utils/consoleUtils";
import StorageUtils, { StorageKey } from "../utils/storageUtils";

const TAG = "LevelManager";

export default class LevelManager {
  private constructor() {
    this.init();
  }
  private static _singleton: LevelManager | null = null;
  public static get Instance() {
    if (!this._singleton) {
      this._singleton = new LevelManager();
    }
    return this._singleton;
  }

  private maxLevel = 5;
  private storageKey = StorageKey.LEVEL_DATA;

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
  private init = async () => {
    ConsoleUtils.log(TAG, "开始初始化");
    const levelData = StorageUtils.get<Array<LevelData>>(this.storageKey);
    if (!levelData) {
      this._data = await this.createEmptyData();
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
  }
}

export interface LevelData {
  level: number;
  stars: 0 | 1 | 2 | 3;
  played: boolean;
}

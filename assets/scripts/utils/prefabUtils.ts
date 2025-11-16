import { _decorator, Component, Prefab } from "cc";
const { ccclass, property } = _decorator;

// 定义预制体类型枚举
export enum PrefabType {
  TILE = "Box_Tile",
}

@ccclass("prefabView")
export class prefabView extends Component {
  // 使用序列化字段来配置预制体映射
  @property({ type: [Prefab], tooltip: "按照 PrefabType 枚举顺序配置预制体" })
  prefabList: Prefab[] = [];

  protected onLoad(): void {
    // 方式1：使用数组配置
    PrefabUtils.initializeWithArray(this.prefabList);
  }
}

export default class PrefabUtils {
  // 存储所有预制体的映射
  private static prefabMap: Map<PrefabType, Prefab> = new Map();
  private static isInitialized: boolean = false;

  /**
   * 使用数组方式初始化（按枚举顺序）
   */
  public static initializeWithArray(prefabList: Prefab[]): void {
    this.prefabMap.clear();

    const enumValues = Object.values(PrefabType);
    for (let i = 0; i < prefabList.length && i < enumValues.length; i++) {
      if (prefabList[i]) {
        this.prefabMap.set(enumValues[i] as PrefabType, prefabList[i]);
      }
    }

    this.isInitialized = true;
    console.log("PrefabUtils 初始化完成（数组方式）", this.prefabMap);
  }

  /**
   * 动态添加或更新预制体
   */
  public static setPrefab(type: PrefabType, prefab: Prefab): void {
    if (!prefab) {
      console.warn(`尝试设置空的预制体: ${type}`);
      return;
    }
    this.prefabMap.set(type, prefab);
    console.log(`更新预制体: ${type}`);
  }

  /**
   * 获取预制体
   */
  public static getPrefab(type: PrefabType): Prefab {
    if (!this.isInitialized) {
      throw "PrefabUtils 未初始化，请先在 prefabView 中配置预制体";
    }

    const prefab = this.prefabMap.get(type);
    if (!prefab) {
      throw `预制体未配置: ${type}，请在 prefabView 中检查配置`;
    }
    return prefab;
  }

  /**
   * 安全获取预制体（不会抛出错误）
   */
  public static getPrefabSafe(type: PrefabType): Prefab | null {
    return this.prefabMap.get(type) || null;
  }

  /**
   * 检查预制体是否存在
   */
  public static hasPrefab(type: PrefabType): boolean {
    return this.prefabMap.has(type) && this.prefabMap.get(type) !== null;
  }

  /**
   * 获取所有已配置的预制体类型
   */
  public static getConfiguredTypes(): PrefabType[] {
    return Array.from(this.prefabMap.keys());
  }

  /**
   * 清空所有预制体配置
   */
  public static clear(): void {
    this.prefabMap.clear();
    this.isInitialized = false;
  }

  // 快捷访问方法（保持向后兼容）
  public static get PrefabTile(): Prefab {
    return this.getPrefab(PrefabType.TILE);
  }
}

import { Layout } from "cc";
import GameData, { GameSize } from "../management/gameData";
import ConsoleUtils from "../utils/consoleUtils";
import EventUtils, {
  EventDataTileAutoClear,
  EventDataTileMatchError,
  EventDataTileMatchSuccess,
  EventKey,
} from "../utils/eventUtils";
import Tile, { TileOptions, TilePos, TileValue } from "./tile";

export interface GameOptions {
  size: GameSize; // 地图尺寸
  max_golden: number; // 最大金币数量
  level: number; // 难度: MIN: 1
  time: number; // 时间 second
  score: number; // 积分
  tileType: number;
}

export type GameMap = Array<Array<Tile>>;

const TAG = "TileMatch";
export default class TileMatch {
  public options: GameOptions;

  public constructor(options: GameOptions) {
    this.options = options;
    ConsoleUtils.error(TAG, { msg: "TileMatch creator!" });
  }

  public map: GameMap = [];

  public isAuto = false;
  public isOver = false;

  public get tiles(): Array<Tile> {
    const { width, height } = this.options.size;
    const tiles: Tile[] = [];
    const map = this.map;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tiles.push(map[x][y]);
      }
    }

    return tiles;
  }

  private createMap(layout: Layout) {
    const { size, max_golden, level } = this.options;
    this.map = [];
    const maxNormalType = this.getMaxNormalTypeByLevel(level);

    // 1. 使用洗牌算法创建随机但均匀分布的花色
    const totalTiles = size.width * size.height;
    const randomTypes = this.createRandomTileTypes(totalTiles, maxNormalType);
    let typeIndex = 0;

    // 2. 创建基础地图（普通方块）
    for (let x = 0; x < size.width; x++) {
      this.map[x] = [];
      for (let y = 0; y < size.height; y++) {
        const { cellSize, spacingX } = layout;
        const tileOptions: TileOptions = {
          pos: { x, y },
          value: randomTypes[typeIndex++], // 使用洗牌后的花色
          tileSize: cellSize.width,
          tileSpacing: spacingX,
        };
        this.map[x][y] = new Tile(tileOptions);
      }
    }

    // 3. 随机放置金币格子
    this.placeGoldenTiles(max_golden);

    // 4. 确保初始地图没有可直接消除的组合
    this.ensureNoInitialMatches().then(() => {
      ConsoleUtils.log(
        TAG,
        `地图创建完成: ${size.width}x${size.height}, 金币: ${max_golden}, 难度: ${level}`
      );
      EventUtils.emit(EventKey.MAP_CREATE, { data: {}, success: true });
    });
  }

  /**
   * 创建随机但均匀分布的花色数组
   * @param totalTiles 总格子数
   * @param maxType 最大花色类型数
   * @returns 洗牌后的花色数组
   */
  private createRandomTileTypes(totalTiles: number, maxType: number): number[] {
    const tiles: number[] = [];

    // 确保每种花色出现次数大致相等
    for (let type = 0; type < maxType; type++) {
      const countPerType = Math.floor(totalTiles / maxType);
      for (let i = 0; i < countPerType; i++) {
        tiles.push(type);
      }
    }

    // 补充分配剩余的位置
    const remaining = totalTiles % maxType;
    for (let i = 0; i < remaining; i++) {
      tiles.push(i % maxType);
    }

    // 使用 Fisher-Yates 洗牌算法随机打乱顺序
    return this.shuffleArray(tiles);
  }

  /**
   * Fisher-Yates 洗牌算法
   * @param array 要洗牌的数组
   * @returns 洗牌后的数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 根据难度等级返回最大普通方块类型数量
   * 难度越高，方块种类越多，游戏越难
   */
  private getMaxNormalTypeByLevel(level: number): number {
    return this.options.tileType;
  }

  /**
   * 随机放置金币格子
   */
  private placeGoldenTiles(maxGolden: number): void {
    if (maxGolden <= 0) return;

    const { width, height } = this.options.size;
    const totalTiles = width * height;

    // 确保金币数量不超过地图总格子的20%
    const actualGoldenCount = Math.min(maxGolden, Math.floor(totalTiles * 0.2));

    let placedCount = 0;
    const maxAttempts = totalTiles * 2; // 防止无限循环

    for (
      let attempt = 0;
      attempt < maxAttempts && placedCount < actualGoldenCount;
      attempt++
    ) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);

      // 检查这个位置是否已经是金币，且周围没有太多金币（避免金币扎堆）
      if (
        this.map[x][y].value !== TileValue.BTC &&
        this.canPlaceGoldenAt(x, y)
      ) {
        this.map[x][y].value = TileValue.BTC;
        placedCount++;
      }
    }

    ConsoleUtils.log(TAG, `成功放置 ${placedCount} 个金币格子`);
  }

  /**
   * 检查是否可以在这个位置放置金币
   * 避免金币过于集中
   */
  private canPlaceGoldenAt(x: number, y: number): boolean {
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0], // 上下左右
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1], // 对角线
    ];

    let adjacentGoldenCount = 0;

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (
        this.isValidPosition(newX, newY) &&
        this.map[newX][newY].value === TileValue.BTC
      ) {
        adjacentGoldenCount++;

        // 如果周围已经有2个以上的金币，就不在这里放
        if (adjacentGoldenCount >= 2) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查坐标是否在地图范围内
   */
  public isValidPosition(x: number, y: number): boolean {
    const { width, height } = this.options.size;
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  /**
   * 确保初始地图没有可直接消除的组合
   */
  private ensureNoInitialMatches(): Promise<void> {
    return new Promise((resolve) => {
      let hasMatches = true;
      let reshuffleCount = 0;
      const maxReshuffles = 100;

      // while (hasMatches && reshuffleCount < maxReshuffles) {
      //   hasMatches = this.checkInitialMatches();

      //   if (hasMatches) {
      //     this.reshuffleNormalTiles();
      //     reshuffleCount++;
      //   }
      // }

      if (reshuffleCount > 0) {
        ConsoleUtils.log(TAG, `重排了 ${reshuffleCount} 次以消除初始匹配`);
      }

      // 地图生成完成后，再次检查确保没有残留的匹配
      setTimeout(() => {
        this.checkAndClearMatches();
        resolve();
      }, 100);
    });
  }

  /**
   * 自动检测并消除所有连续的Tile
   * 返回是否进行了消除
   */
  public checkAndClearMatches(): boolean {
    if (this.isOver) return false;
    const { width, height } = this.options.size;
    const allMatches: Set<Tile> = new Set();

    // 1. 收集所有匹配的Tile
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const matches = this.getMatchesAt(x, y);
        if (matches.length > 0) {
          matches.forEach((tile) => allMatches.add(tile));
          break;
        }
      }
    }

    // 2. 如果没有匹配，直接返回
    if (allMatches.size === 0) {
      this.isAuto = false;
      return false;
    }
    this.isAuto = true;

    // 3. 将Set转为数组
    const matchesArray = Array.from(allMatches);

    // 4. 执行消除逻辑
    this.autoClearMatches(matchesArray);

    return true;
  }

  /**
   * 自动清除匹配的Tile
   */
  private autoClearMatches(matches: Tile[]): void {
    console.log(`自动消除 ${matches.length} 个连续方块`);

    // 统计金币数量
    let goldenCount = 0;
    let normalCount = 0;

    // 计算下落偏移量（按列统计）
    const columnOffsets: Map<number, number> = new Map();

    // 标记要消除的方块
    for (const tile of matches) {
      if (tile.value === TileValue.BTC) {
        goldenCount++;
      } else {
        normalCount++;
      }

      // 记录这一列有一个方块被消除
      const col = tile.pos.x;
      columnOffsets.set(col, (columnOffsets.get(col) || 0) + 1);

      // 标记为空白
      tile.value = TileValue.EMPTY;
    }

    // 触发消除效果
    this.onAutoClearMatched(matches, goldenCount, normalCount);

    // 设置回调，在动画完成后执行下落和填充
    this.callback_matchSuccess = () => {
      // 方块下落
      this.applyGravityByColumn(columnOffsets);

      // 填充新的方块
      this.fillEmptyTilesByColumn(columnOffsets);

      // 递归检查是否还有新的匹配（连锁反应）
      setTimeout(() => {
        const hasMoreMatches = this.checkAndClearMatches();
        if (!hasMoreMatches) {
          // 没有更多匹配了，检查游戏状态
          if (!this.checkMapHasResult()) {
            console.log("没有可消除的组合了，重新整理地图");
            this.refershMap();
          }
          this.checkGameEnd();
        }
      }, GameData.TWEEN_TILE_CREATE_S * 4000);
    };
  }

  /**
   * 按列应用重力
   */
  private applyGravityByColumn(columnOffsets: Map<number, number>): void {
    const { height } = this.options.size;

    for (const [col, offset] of columnOffsets) {
      if (offset <= 0) continue;

      // 从下往上移动该列的方块
      for (let y = height - 1; y >= 0; y--) {
        if (this.map[col][y].value === TileValue.EMPTY) {
          // 在上面寻找非空白格子下落
          for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
            if (this.map[col][aboveY].value !== TileValue.EMPTY) {
              // 下落
              this.map[col][y].value = this.map[col][aboveY].value;
              this.map[col][aboveY].value = TileValue.EMPTY;
              this.map[col][y].animation_create(offset);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 按列填充空白格子
   */
  private fillEmptyTilesByColumn(columnOffsets: Map<number, number>): void {
    const { height } = this.options.size;
    const { level } = this.options;
    const maxNormalType = this.getMaxNormalTypeByLevel(level);

    for (const [col, offset] of columnOffsets) {
      // 从顶部开始填充空白
      for (let y = 0; y < height; y++) {
        if (this.map[col][y].value === TileValue.EMPTY) {
          const randomType = Math.floor(Math.random() * maxNormalType);
          this.map[col][y].value = randomType;
          this.map[col][y].animation_create(offset);
        }
      }
    }
  }

  /**
   * 自动清除匹配的事件回调
   */
  private onAutoClearMatched(
    tiles: Tile[],
    goldenCount: number,
    normalCount: number
  ): void {
    // 在这里处理自动消除成功的事件
    // 比如：更新分数、播放音效、触发特效等
    const data: EventDataTileAutoClear = { tiles, goldenCount, normalCount };
    EventUtils.emit(EventKey.TILE_AUTO_CLEAR, { data, success: true });
  }

  /**
   * 检查初始地图是否有匹配
   */
  private checkInitialMatches(): boolean {
    const { width, height } = this.options.size;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.hasMatchAt(x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 检查指定位置是否有匹配
   * 以当前格子为中心，检查水平和垂直方向是否有连续3个或以上相同类型的格子
   */
  private hasMatchAt(x: number, y: number): boolean {
    const { width, height } = this.options.size;
    const tile = this.map[x][y]; // 金币不参与匹配
    // if (tile.value === TileValue.BTC) return false;

    const tileType = tile.value;

    // 检查水平方向
    let horizontalCount = 1; // 当前格子自己

    // 向左检查
    for (let i = x - 1; i >= 0; i--) {
      if (this.map[i][y].value === tileType) {
        horizontalCount++;
      } else {
        break;
      }
    }

    // 向右检查
    for (let i = x + 1; i < width; i++) {
      if (this.map[i][y].value === tileType) {
        horizontalCount++;
      } else {
        break;
      }
    }

    // 如果水平方向有3个或以上连续相同
    if (horizontalCount >= 3) {
      return true;
    }

    // 检查垂直方向
    let verticalCount = 1; // 当前格子自己

    // 向上检查
    for (let j = y - 1; j >= 0; j--) {
      if (this.map[x][j].value === tileType) {
        verticalCount++;
      } else {
        break;
      }
    }

    // 向下检查
    for (let j = y + 1; j < height; j++) {
      if (this.map[x][j].value === tileType) {
        verticalCount++;
      } else {
        break;
      }
    }

    // 如果垂直方向有3个或以上连续相同
    if (verticalCount >= 3) {
      return true;
    }

    return false;
  }

  /**
   * 重新排列普通方块（保持金币位置不变）
   */
  private reshuffleNormalTiles(): void {
    const normalTiles: Tile[] = [];
    const goldenPositions: TilePos[] = [];
    const { width, height } = this.options.size;

    // 收集所有普通方块和金币位置
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        normalTiles.push(this.map[x][y]);
      }
    }

    // 随机打乱普通方块
    this.shuffleArray(normalTiles);

    // 重新填充地图
    let normalIndex = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const isGolden = goldenPositions.some(
          (pos) => pos.x === x && pos.y === y
        );
        if (isGolden) {
          continue; // 保持金币位置不变
        } else {
          // 更新普通方块的值（保持位置不变）
          this.map[x][y].value = normalTiles[normalIndex].value;
          normalIndex++;
        }
      }
    }
  }

  /**
   * 数组随机打乱
   */
  /*   private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  } */

  public start(layout: Layout) {
    this.createMap(layout);
  }
  /**
   * 交换两个方块
   */
  public changeTile(start: Tile, end: Tile): boolean {
    // 检查是否相邻
    if (!this.isAdjacent(start, end)) {
      console.log("只能交换相邻的方块");
      return false;
    }

    // 检查是否都是金币（金币不能交换）
    // if (start.value === TileValue.BTC && end.value === TileValue.BTC) {
    //   console.log("金币不能互相交换");
    //   return false;
    // }

    // 执行交换
    this.swapTiles(start, end);

    // 检查交换后是否有匹配
    const startMatch = this.getMatchesAt(start.pos.x, start.pos.y);
    const endMatch = this.getMatchesAt(end.pos.x, end.pos.y);

    if (startMatch.length > 0 || endMatch.length > 0) {
      // 交换成功，有匹配
      const allMatches = [...startMatch, ...endMatch];
      // 去重
      const uniqueMatches = Array.from(new Set(allMatches));
      this.matchSuccess(start, end, uniqueMatches);
      return true;
    } else {
      // 交换失败，没有匹配，交换回来
      this.matchWrong(start, end);
      return false;
    }
  }

  /**
   * 检查两个方块是否相邻
   */
  private isAdjacent(tile1: Tile, tile2: Tile): boolean {
    const dx = Math.abs(tile1.pos.x - tile2.pos.x);
    const dy = Math.abs(tile1.pos.y - tile2.pos.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  /**
   * 交换两个方块的值
   */
  private swapTiles(tile1: Tile, tile2: Tile): void {
    const tempValue = tile1.value;
    tile1.value = tile2.value;
    tile2.value = tempValue;
    // tile1.drawImage();
    // tile2.drawImage();
  }

  /**
   * 匹配指定位置的方块，返回所有匹配的方块数组
   */
  private matchTile(tile: Tile): Tile[] {
    return this.getMatchesAt(tile.pos.x, tile.pos.y);
  }
  /**
   * 获取指定位置的所有匹配方块
   */
  private getMatchesAt(x: number, y: number): Tile[] {
    const tile = this.map[x][y];
    // if (tile.value === TileValue.BTC) return [];

    const matchedTiles: Tile[] = [];
    const tileType = tile.value;

    // 检查水平方向
    const horizontalMatches = this.getDirectionMatches(x, y, 1, 0); // 向右
    const horizontalMatchesLeft = this.getDirectionMatches(x, y, -1, 0); // 向左

    // 检查垂直方向
    const verticalMatches = this.getDirectionMatches(x, y, 0, 1); // 向下
    const verticalMatchesUp = this.getDirectionMatches(x, y, 0, -1); // 向上

    // 合并所有匹配
    if (horizontalMatches.length + horizontalMatchesLeft.length >= 2) {
      matchedTiles.push(...horizontalMatches, ...horizontalMatchesLeft);
    }

    if (verticalMatches.length + verticalMatchesUp.length >= 2) {
      matchedTiles.push(...verticalMatches, ...verticalMatchesUp);
    }

    // 如果有匹配，包含当前方块
    if (matchedTiles.length > 0) {
      matchedTiles.push(tile);
    }

    // 去重
    return Array.from(new Set(matchedTiles));
  }

  /**
   * 获取指定方向的连续匹配方块
   */
  private getDirectionMatches(
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ): Tile[] {
    const { width, height } = this.options.size;
    const matches: Tile[] = [];
    const tileType = this.map[startX][startY].value;

    for (let i = 1; i < width; i++) {
      const newX = startX + dx * i;
      const newY = startY + dy * i;

      if (!this.isValidPosition(newX, newY)) break;

      if (this.map[newX][newY].value === tileType) {
        matches.push(this.map[newX][newY]);
      } else {
        break;
      }
    }

    return matches;
  }

  /**
   * 匹配成功处理
   */
  public callback_matchSuccess: (() => void) | null = null;
  private matchSuccess(
    tileStart: Tile,
    tileEnd: Tile,
    tiles: Array<Tile>
  ): void {
    console.log(`匹配成功！消除了 ${tiles.length} 个方块`);

    // 统计金币数量
    let goldenCount = 0;
    let normalCount = 0;

    let offsetY = 0;
    // 消除方块
    let lastY = -1;
    for (const tile of tiles) {
      if (lastY !== tile.pos.y) {
        offsetY++;
      }
      lastY = tile.pos.y;
      if (tile.value === TileValue.BTC) {
        goldenCount++;
      } else {
        normalCount++;
      }
      // 标记为空白（可以用一个特殊值表示，比如 -1）
      tile.value = TileValue.EMPTY;
    }

    // 触发消除效果、播放动画、加分等
    this.onTilesMatched(tileStart, tileEnd, tiles, goldenCount, normalCount);

    this.callback_matchSuccess = () => {
      // 方块下落
      this.applyGravity(offsetY);

      // 填充新的方块
      this.fillEmptyTiles(offsetY);

      // 下落和填充完成后，检查是否有新的匹配
      setTimeout(() => {
        this.checkAndClearMatches();
      }, GameData.TWEEN_TILE_MOVE_S * 4000);
    };

    // 检查是否还有可消除的组合
    if (!this.checkMapHasResult()) {
      console.log("没有可消除的组合了，重新整理地图");
      this.refershMap();
    }

    // 检查游戏是否结束
    this.checkGameEnd();
  }

  private drawMap() {
    this.tiles.forEach((tile) => {
      tile.drawImage();
    });
  }

  /**
   * 匹配失败处理（交换回来）
   */
  private matchWrong(start: Tile, end: Tile): void {
    console.log("匹配失败，交换回来");

    // 交换回来
    this.swapTiles(start, end);

    // 可以在这里添加一些失败动画或音效
    this.onMatchFailed(start, end);
  }

  /**
   * 检查地图是否还有可消除的结果
   */
  private checkMapHasResult(): boolean {
    const { width, height } = this.options.size;

    // 检查所有可能的交换
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.hasPossibleMoveAt(x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 检查指定位置是否有可能的移动
   */
  private hasPossibleMoveAt(x: number, y: number): boolean {
    const directions = [
      [1, 0], // 右
      [0, 1], // 下
      [-1, 0], // 左
      [0, -1], // 上
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValidPosition(newX, newY)) {
        // 临时交换
        this.swapTiles(this.map[x][y], this.map[newX][newY]);

        // 检查是否有匹配
        const hasMatch =
          this.getMatchesAt(x, y).length > 0 ||
          this.getMatchesAt(newX, newY).length > 0;

        // 交换回来
        this.swapTiles(this.map[x][y], this.map[newX][newY]);

        if (hasMatch) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 重新整理地图（当没有可消除的组合时）
   */
  private refershMap(): void {
    const { width, height } = this.options.size;

    console.log("重新整理地图");

    // 收集所有非金币的方块
    const normalTiles: Tile[] = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.map[x][y].value !== TileValue.BTC) {
          normalTiles.push(this.map[x][y]);
        }
      }
    }

    // 随机打乱
    this.shuffleArray(normalTiles);

    // 重新分配值
    let index = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.map[x][y].value !== TileValue.BTC) {
          this.map[x][y].value = normalTiles[index].value;
          index++;
        }
      }
    }

    // 确保整理后没有初始匹配
    this.ensureNoInitialMatches();
  }

  /**
   * 应用重力，让方块下落
   */
  private applyGravity(offsetY: number): void {
    const { width, height } = this.options.size;

    for (let x = 0; x < width; x++) {
      // 从下往上检查每一列
      for (let y = height - 1; y >= 0; y--) {
        if (this.map[x][y].value === -1) {
          // 空白格子
          // 在上面寻找非空白格子下落
          for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
            if (this.map[x][aboveY].value !== -1) {
              // 下落
              this.map[x][y].value = this.map[x][aboveY].value;
              this.map[x][aboveY].value = TileValue.EMPTY;
              this.map[x][y].animation_create(offsetY);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 填充空白格子
   */
  private fillEmptyTiles(offsetY: number): void {
    const { width, height } = this.options.size;
    const { level } = this.options;
    const maxNormalType = this.getMaxNormalTypeByLevel(level);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.map[x][y].value === -1) {
          const randomType = Math.floor(Math.random() * maxNormalType);
          this.map[x][y].value = randomType;
          this.map[x][y].animation_create(offsetY);
        }
      }
    }
  }

  /**
   * 检查游戏是否结束
   */
  private checkGameEnd(): void {
    // 这里可以根据你的游戏规则来实现
    // 比如：步数用完、时间结束、特定目标完成等
  }

  // 事件回调方法（需要你在外部实现）
  private onTilesMatched(
    tileStart: Tile,
    tileEnd: Tile,
    tiles: Tile[],
    goldenCount: number,
    normalCount: number
  ): void {
    // 在这里处理消除成功的事件
    // 比如：更新分数、播放音效、触发特效等
    const data: EventDataTileMatchSuccess = { tileStart, tileEnd, tiles };
    EventUtils.emit(EventKey.TILE_MATCH, { data, success: true });
  }

  private onMatchFailed(start: Tile, end: Tile): void {
    // 在这里处理匹配失败的事件
    // 比如：播放失败音效、显示提示等
    const data: EventDataTileMatchError = { tileStart: start, tileEnd: end };
    EventUtils.emit(EventKey.TILE_MATCH, { data, success: false });
  }
}

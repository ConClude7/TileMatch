import { instantiate } from "cc";
import { NodeTile } from "../../components/SceneGames/NodeTile";
import PrefabUtils from "../utils/prefabUtils";
import ConsoleUtils from "../utils/consoleUtils";
import { getEnumey, getEnumKey } from "../enum";
import TouchUtils, { MoveDirection } from "../utils/touchUtils";
import { Vec2 } from "cc";
import GameData from "../management/gameData";
import EventUtils, { EventKey } from "../utils/eventUtils";
import { Layout } from "cc";
import { Vec3 } from "cc";
import { tween } from "cc";
import { easing } from "cc";
import { Sprite } from "cc";
import { color } from "cc";

export interface TilePos {
  x: number;
  y: number;
}

export enum TileValue {
  "EMPTY" = -1,
  "BNB" = 0,
  "DOCE" = 1,
  "ETH" = 2,
  "LINK" = 3,
  "SOL" = 4,
  "USDT" = 5,
  "XRP" = 6,
  "BTC" = 99,
  // ...others
}

export interface TileOptions {
  pos: TilePos;
  value: TileValue;
  tileSize: number;
  tileSpacing: number;
}

const TAG = "TILE";
export default class Tile {
  public pos: TilePos;
  private _size: number;
  private _spacing: number;
  private _value: TileValue;
  public isMatched = false;
  public get value(): TileValue {
    return this._value;
  }
  public set value(v: TileValue) {
    const lastValue = this._value;
    this._value = v;
    // this.drawImage();
    if (this.isMatched) {
      return;
    }
    // this.animation_create();
  }

  public nodeTile: NodeTile;

  private _touch: TouchUtils;

  public constructor(options: TileOptions) {
    ({
      pos: this.pos,
      value: this._value,
      tileSize: this._size,
      tileSpacing: this._spacing,
    } = options);
    const node = instantiate(PrefabUtils.PrefabTile);
    const tileScript = node.getScript<NodeTile>("NodeTile");
    if (!tileScript) throw "TileScript is NULL!";
    this.nodeTile = tileScript;
    this._touch = new TouchUtils(this.nodeTile.node);
    this.init();
  }

  public init = () => {
    this._touch.onMove = this.onMove;
    this._touch.touchStart = () => {
      this._event_called = false;
    };
    this._touch.touchEnd = () => {
      this._event_called = false;
    };
  };

  public destory = () => {
    this.nodeTile.NodeImg.active = false;
  };

  public drawImage = () => {
    const nodeImg = this.nodeTile.NodeImg;
    nodeImg.position = Vec3.ZERO;
    nodeImg.changeScale(Vec2.ONE);
    nodeImg.changeColor(color(255, 255, 255, 255));
    if (this.value === TileValue.EMPTY) {
      // ConsoleUtils.error(TAG, {
      //   data: this,
      //   mssage: "TileValue.EMPTY can not draw!",
      // });
      return;
    }
    const keyName = getEnumKey(TileValue, this.value);
    nodeImg.changeSpriteFrame(`Tiles/${keyName}`);
  };

  private _event_called = false;

  private onMove = (moveDirection: MoveDirection, moveDistance: number) => {
    if (moveDistance > GameData.TILE_MOVE_DISTANCE && !this._event_called) {
      const data: EventTileTouchMove = { tile: this, direction: moveDirection };
      EventUtils.emit(EventKey.TILE_TOUCH_MOVE, { data, success: true });
      this._event_called = true;
    }
  };

  private _tween_move = (end: Vec3): Promise<void> => {
    return new Promise((resolve) => {
      tween(this.nodeTile.NodeImg)
        .to(
          GameData.TWEEN_TILE_MOVE_S,
          { position: end },
          {
            // easing: "circIn",
            onComplete: () => {
              resolve();
            },
          }
        )
        .start();
    });
  };

  public animation_move = async (
    options: AnimationMoveOptions
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      const { tileStart, tileEnd, targetPos, grid, success } = options;
      const { cellSize, spacingX, spacingY } = grid;

      const start = this.nodeTile.NodeImg.position.clone();
      const end = start.clone();
      const selfPos = this.pos;
      end.x += (targetPos.x - selfPos.x) * (cellSize.width + spacingX);
      end.y += (selfPos.y - targetPos.y) * (cellSize.height + spacingY);
      console.log({ start, end });
      await this._tween_move(end);
      if (success) {
        const templateValue = tileEnd.value;
        tileEnd.value = tileStart.value;
        tileStart.value = templateValue;
        tileStart.drawImage();
        tileEnd.drawImage();
      } else {
        await this._tween_move(start);
      }
      resolve();
    });
  };

  private _tween_destory = (): Promise<void> => {
    const node = this.nodeTile.NodeImg;
    const sprite = node.getComponent(Sprite);
    if (!sprite) throw "_tween_destory node.sprite is null!";

    return new Promise((resolve) => {
      let completedCount = 0;
      const checkComplete = () => {
        completedCount++;
        if (completedCount === 2) {
          resolve();
        }
      };

      tween(sprite)
        .to(GameData.TWEEN_TILE_DESTORY_S, { color: color(255, 255, 255, 50) })
        .call(checkComplete)
        .start();

      tween(node)
        .to(GameData.TWEEN_TILE_DESTORY_S, { scale: Vec3.ZERO })
        .call(checkComplete)
        .start();
    });
  };

  public animation_destory = (): Promise<void> => {
    ConsoleUtils.log(TAG, "执行销毁动画！");
    return this._tween_destory();
  };

  private _tween_create = (offsetCount: number): Promise<void> => {
    const startY = (this._size + this._spacing) * offsetCount;
    this.drawImage();
    this.nodeTile.NodeImg.setPosition(new Vec3(0, startY, 0));
    return new Promise((resolve) => {
      tween(this.nodeTile.NodeImg)
        .to(
          GameData.TWEEN_TILE_CREATE_S * offsetCount,
          {
            position: Vec3.ZERO,
          },
          {
            onComplete: () => {
              resolve();
            },
          }
        )
        .start();
    });
  };

  public animation_create = (offsetY: number): Promise<void> => {
    ConsoleUtils.log(TAG, "执行创建动画！");
    return this._tween_create(offsetY);
  };
}

export interface AnimationMoveOptions {
  tileStart: Tile;
  tileEnd: Tile;
  targetPos: TilePos;
  grid: Layout;
  success: boolean;
}

export interface EventTileTouchMove {
  tile: Tile;
  direction: MoveDirection;
}

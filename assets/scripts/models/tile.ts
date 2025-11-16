import { instantiate } from "cc";
import { NodeTile } from "../../components/SceneGames/NodeTile";
import PrefabUtils from "../utils/prefabUtils";
import ConsoleUtils from "../utils/consoleUtils";
import { getEnumKey } from "../enum";
import TouchUtils, { MoveDirection } from "../utils/touchUtils";
import { Vec2 } from "cc";
import GameData from "../management/gameData";
import EventUtils, { EventKey } from "../utils/eventUtils";

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
}

const TAG = "TILE";
export default class Tile {
  public pos: TilePos;
  public value: TileValue;
  public nodeTile: NodeTile;

  private _touch: TouchUtils;

  public constructor(options: TileOptions) {
    ({ pos: this.pos, value: this.value } = options);
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
    this.nodeTile.node.destorySelf();
  };

  public drawImage = () => {
    if (this.value === TileValue.EMPTY) {
      ConsoleUtils.error(TAG, {
        data: this,
        mssage: "TileValue.EMPTY can not draw!",
      });
      return;
    }
    const keyName = getEnumKey(TileValue, this.value);
    this.nodeTile.NodeImg.changeSpriteFrame(`Tiles/${keyName}`);
  };

  private _event_called = false;

  private onMove = (moveDirection: MoveDirection, moveDistance: number) => {
    if (moveDistance > GameData.TILE_MOVE_DISTANCE && !this._event_called) {
      const data: EventTileTouchMove = { tile: this, direction: moveDirection };
      EventUtils.emit(EventKey.TILE_TOUCH_MOVE, { data, success: true });
      this._event_called = true;
    }
  };
}

export interface EventTileTouchMove {
  tile: Tile;
  direction: MoveDirection;
}

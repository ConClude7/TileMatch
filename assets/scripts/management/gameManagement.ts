import { Node } from "cc";
import TileMatch, { GameMap } from "../models/game";
import { page_game } from "../pages/page_game";
import EventUtils, {
  EventKey,
  EventData,
  EventDataTileMatchError,
  EventDataTileMatchSuccess,
} from "../utils/eventUtils";
import GameData from "./gameData";
import { EventTileTouchMove, TilePos } from "../models/tile";
import { MoveDirection } from "../utils/touchUtils";
import ConsoleUtils from "../utils/consoleUtils";
import { Layout } from "cc";

const TAG = "GameManagement";
export default class GameManagement {
  public game: TileMatch;
  private _node: page_game;

  // public get node(): Node {
  //   return this._node.node;
  // }

  public get NodeGrid(): Node {
    return this._node.NodeGrid;
  }

  public get LayoutGrid(): Layout {
    const layout = this.NodeGrid.getComponent(Layout);
    if (!layout) throw "LayoutGrid.Layout is NULL!";
    return layout;
  }

  public constructor(PageGame: page_game) {
    this._node = PageGame;
    this.game = new TileMatch({
      size: GameData.GAME_SIZE_DEFAULT,
      max_golden: 10,
      level: 1,
    });
  }

  public init() {
    EventUtils.on(EventKey.MAP_CREATE, this.event_map_create, this);
    EventUtils.on(EventKey.TILE_TOUCH_MOVE, this.event_tile_touch_move, this);
    this.startGame();
  }

  private startGame() {
    this.game.start();
  }

  public destory() {
    EventUtils.off(EventKey.MAP_CREATE, this.event_map_create, this);
    EventUtils.off(EventKey.TILE_TOUCH_MOVE, this.event_tile_touch_move, this);
  }

  private drawMap = ({ isUpdate = false }) => {
    const tiles = this.game.tiles;
    tiles.forEach((tile) => {
      this.NodeGrid.addChild(tile.nodeTile.node);
      tile.drawImage();
    });
  };

  event_map_create = (e: EventData) => {
    this.drawMap({});
  };

  event_tile_touch_move = (e: EventData<EventTileTouchMove>) => {
    const { tile, direction } = e.data;
    const targetTilePos: TilePos = { ...tile.pos };
    switch (direction) {
      case MoveDirection.LEFT:
        targetTilePos.x -= 1;
        break;
      case MoveDirection.UP:
        targetTilePos.y -= 1;
        break;
      case MoveDirection.RIGHT:
        targetTilePos.x += 1;
        break;
      case MoveDirection.DOWN:
        targetTilePos.y += 1;
        break;
    }
    const { x: targetX, y: targetY } = targetTilePos;
    const targetIsTile = this.game.isValidPosition(targetX, targetY);
    if (!targetIsTile) {
      ConsoleUtils.error(TAG, {
        tile,
        targetTilePos,
        eventData: e.data,
        message: "Target pos is not Tile!",
      });
      return;
    }

    const targetTile = this.game.map[targetX][targetY];
    ConsoleUtils.log(TAG, { tile, targetTile, message: "Change Tile!" });
    const isMatch = this.game.changeTile(tile, targetTile);
  };

  event_tile_match = (e: EventData) => {
    if (e.success) {
      this.matchSuccess(e.data);
    } else {
      this.matchError(e.data);
    }
  };

  private matchSuccess = (data: EventDataTileMatchSuccess) => {
    data.tiles.forEach((tile) => {
      tile.destory();
    });
  };

  private matchError = (data: EventDataTileMatchError) => {};

  private moveTile = () => {};
}

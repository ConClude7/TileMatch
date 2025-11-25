import { Node } from "cc";
import TileMatch, { GameMap } from "../models/game";
import { page_game } from "../pages/page_game";
import EventUtils, {
  EventKey,
  EventData,
  EventDataTileMatchError,
  EventDataTileMatchSuccess,
  EventDataTileAutoClear,
} from "../utils/eventUtils";
import GameData from "./gameData";
import Tile, { EventTileTouchMove, TilePos } from "../models/tile";
import { MoveDirection } from "../utils/touchUtils";
import ConsoleUtils from "../utils/consoleUtils";
import { Layout } from "cc";
import { TimerUtils } from "../utils/timerUtils";
import PrefabUtils, { PrefabType } from "../utils/prefabUtils";
import ModalUtils from "../utils/modalUtils";
import LevelManager from "./levelManagement";
import { instantiate } from "cc";
import { ScoreAdd } from "../../components/SceneGames/ScoreAdd";
import { find } from "cc";
import AudioUtils from "../utils/audioUtils";

const TAG = "GameManagement";

export enum GameStatus {
  STOP = "STOP",
  PLAY = "PLAY",
  MATCH = "MATCH",
  OVER = "OVER",
}

export default class GameManagement {
  public game: TileMatch;
  public status: GameStatus;
  private _node: page_game;
  private timer: TimerUtils | undefined;
  private _score: number = 0;
  private _totalScore = 1000;
  private _totalTime = 90;
  public set score(v: number) {
    this._score = v;
    this._node.Node_Score?.changeLabelString(
      `所需分数：${this._totalScore} 当前分数：${v}`
    );
    if (this.score >= this._totalScore) {
      this.gameOver(true);
    }
  }
  public get score(): number {
    return this._score;
  }

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
    const levelConfig = LevelManager.Instance.levelConfig();
    this._totalScore = levelConfig.TOTAL_SCORE;
    this._totalTime = levelConfig.TOTAL_TIME;
    this.game = new TileMatch({
      size: GameData.GAME_SIZE_DEFAULT,
      max_golden: 10,
      level: 1,
      time: this._totalTime,
      score: this._totalScore,
      tileType: levelConfig.TILE_TYPE,
    });
    this.status = GameStatus.STOP;
    this.score = 0;
  }

  private _isInitialized = false;
  public init() {
    if (this._isInitialized) {
      this.destory(); // 清理之前的实例
    }
    EventUtils.on(EventKey.MAP_CREATE, this.event_map_create, this);
    EventUtils.on(EventKey.TILE_TOUCH_MOVE, this.event_tile_touch_move, this);
    EventUtils.on(EventKey.TILE_MATCH, this.event_tile_match, this);
    EventUtils.on(EventKey.TILE_AUTO_CLEAR, this.event_auto_clear, this);
    this.timer = new TimerUtils(this._totalTime);
    this.startGame();
    this._isInitialized = true;
  }

  private startGame() {
    this.game.start(this.LayoutGrid);
    this.status = GameStatus.PLAY;
  }

  public destory() {
    ConsoleUtils.warn(TAG, "destory!");
    EventUtils.off(EventKey.MAP_CREATE, this.event_map_create, this);
    EventUtils.off(EventKey.TILE_TOUCH_MOVE, this.event_tile_touch_move, this);
    EventUtils.off(EventKey.TILE_MATCH, this.event_tile_match, this);
    EventUtils.off(EventKey.TILE_AUTO_CLEAR, this.event_auto_clear, this);

    this.status = GameStatus.STOP;
    this._isInitialized = false;
  }

  private drawMap = ({ isUpdate = false }) => {
    const tiles = this.game.tiles;
    tiles.forEach((tile) => {
      if (!isUpdate) {
        this.NodeGrid.addChild(tile.nodeTile.node);
      }
      tile.drawImage();
    });
  };

  private startTimer = () => {
    this.timer?.start(this.callback_timer);
  };

  private callback_timer = (currnetTime: number, stop: boolean) => {
    if (stop) {
      ConsoleUtils.warn(TAG, "Time Over!");
      this.gameOver(false);
    } else {
      this._node.Node_Time?.changeLabelString(
        `${this._totalTime - currnetTime}S`
      );
    }
  };

  event_map_create = (e: EventData) => {
    this.drawMap({});
    this.startTimer();
  };

  event_tile_touch_move = (e: EventData<EventTileTouchMove>) => {
    if (this.game.isAuto) return;
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

  private playBombTween = (tiles: Array<Tile>) => {
    const centerTileIndex = Math.round(tiles.length / 2);
    const targetTile = tiles[centerTileIndex];
    if (!targetTile) {
      throw "playBombTween targetTile is null!";
    }

    const prefab = PrefabUtils.getPrefab(PrefabType.SCORE_ADD);
    if (!prefab) return;
    const bombNode = instantiate(prefab);
    const scoreAdd = bombNode.getComponent(ScoreAdd);
    if (!scoreAdd) return;
    find("Canvas")?.addChild(bombNode);
    scoreAdd.show(targetTile.nodeTile.node, tiles.length);
  };

  event_auto_clear = async (e: EventData<EventDataTileAutoClear>) => {
    const { tiles } = e.data;
    AudioUtils.playTileDestory();
    await Promise.all(tiles.map((tile) => tile.animation_destory()));
    this.playBombTween(tiles);
    if (this.game.callback_matchSuccess) {
      ConsoleUtils.log(TAG, "执行Callback_MatchSuccess_AUTO");
      this.game.callback_matchSuccess();
      this.score += e.data.tiles.length;
    }
  };

  event_tile_match = async (e: EventData) => {
    console.error({ status: this.status });
    if (this.status === GameStatus.OVER) return;
    if (this.status === GameStatus.MATCH) return;
    if (this.status === GameStatus.STOP) return;
    try {
      this.status = GameStatus.MATCH;
      if (e.success) {
        await this.matchSuccess(e.data);
      } else {
        await this.matchError(e.data);
      }
    } catch (error) {
      ConsoleUtils.error(TAG, error);
    } finally {
      this.status = GameStatus.PLAY;
    }
  };

  private matchSuccess = async (data: EventDataTileMatchSuccess) => {
    const { tileStart, tileEnd, tiles } = data;
    await Promise.all([
      tileStart.animation_move({
        tileStart,
        tileEnd,
        targetPos: { ...tileEnd.pos },
        grid: this.LayoutGrid,
        success: true,
      }),
      tileEnd.animation_move({
        tileStart,
        tileEnd,
        targetPos: { ...tileStart.pos },
        grid: this.LayoutGrid,
        success: true,
      }),
    ]);
    // [tileStart, tileEnd]
    //   .filter((tile) => !tiles.includes(tile))
    //   .forEach((tile) => tile.drawImage());
    AudioUtils.playTileDestory();
    await Promise.all(tiles.map((tile) => tile.animation_destory()));
    if (this.game.callback_matchSuccess) {
      ConsoleUtils.log(TAG, "执行Callback_MatchSuccess");
      this.game.callback_matchSuccess();
    }
    this.playBombTween(tiles);

    this.score += tiles.length;
  };

  private matchError = async ({
    tileStart,
    tileEnd,
  }: EventDataTileMatchError) => {
    await Promise.all([
      tileStart.animation_move({
        tileStart,
        tileEnd,
        targetPos: { ...tileEnd.pos },
        grid: this.LayoutGrid,
        success: false,
      }),
      tileEnd.animation_move({
        tileStart,
        tileEnd,
        targetPos: { ...tileStart.pos },
        grid: this.LayoutGrid,
        success: false,
      }),
    ]);
    // await Promise.all([
    //   tileStart.animation_move({
    //     targetPos: { ...tileStart.pos },
    //     grid: this.LayoutGrid,
    //     success: false,
    //   }),
    //   tileEnd.animation_move({
    //     targetPos: { ...tileEnd.pos },
    //     grid: this.LayoutGrid,
    //     success: false,
    //   }),
    // ]);
  };

  private gameOver = (isWin: boolean) => {
    this.game.isOver = true;
    console.warn({ status: this.status });
    if (this.status === GameStatus.OVER) {
      return;
    }
    this.status = GameStatus.OVER;
    if (isWin) {
      LevelManager.Instance.gameWin();
    }
    this.timer?.clear();
    const prefab = PrefabUtils.getPrefab(
      isWin ? PrefabType.GAME_SUCCESS : PrefabType.GAME_FAIL
    );
    ModalUtils.show(prefab);
  };
}

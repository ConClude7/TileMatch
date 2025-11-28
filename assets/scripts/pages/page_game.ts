import { _decorator, Component, Node } from "cc";
import EventUtils, { EventData, EventKey } from "../utils/eventUtils";
import GameManagement from "../management/gameManagement";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
import LevelManager from "../management/levelManagement";
import AudioUtils from "../utils/audioUtils";
import StorageUtils, { StorageKey } from "../utils/storageUtils";
const { ccclass, property } = _decorator;

@ccclass("page_game")
export class page_game extends Component {
  @property(Node)
  Node_Score: Node | undefined;

  @property(Node)
  Node_Time: Node | undefined;

  @property(Node)
  Node_Grid: Node | undefined;

  @property(Node)
  Label_Level: Node | undefined;

  @property(Node)
  Lavel_Level_Bottom: Node | undefined;

  @property(Node)
  Label_Bomb: Node | undefined;

  @property(Node)
  Border_Bomb: Node | undefined;

  public get NodeGrid(): Node {
    if (!this.Node_Grid) throw "Node_Grid is NULL!";
    return this.Node_Grid;
  }

  public _manager: GameManagement | null = null;
  public _levelManager = LevelManager.Instance;

  onEnable() {
    EventUtils.on(EventKey.ROUTER_BACK, this.event_router_back, this);
    this._manager = new GameManagement(this);
    const trueIndex =
      (StorageUtils.get(StorageKey.LEVEL_PAGE_INDEX) ?? 0) * 9 +
      this._levelManager.currentGameLevel;
    this.Label_Level?.changeLabelString(`${trueIndex}关`);
    this.Lavel_Level_Bottom?.changeLabelString(`${trueIndex}`);
    this.NodeGrid.destroyAllChildren();
    this.scheduleOnce(() => {
      if (this._manager) {
        this._manager.init();
      }
    });
  }

  onDestroy() {
    EventUtils.off(EventKey.ROUTER_BACK, this.event_router_back, this);
  }

  event_router_back(e: EventData<RouterPage>) {
    const page = e.data;
    if (page === RouterPage.GAME) {
      this._manager?.destory();
      this._manager = null;
    }
  }

  event_click_bomb() {
    if (!this._manager) return;
    this._manager.bombMode = !this._manager.bombMode;
    AudioUtils.playButton();
  }

  event_click_back() {
    RouterUtils.back();
  }
}

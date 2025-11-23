import { _decorator, Component, Node } from "cc";
import EventUtils, { EventData, EventKey } from "../utils/eventUtils";
import GameManagement from "../management/gameManagement";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
import LevelManager from "../management/levelManagement";
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

  public get NodeGrid(): Node {
    if (!this.Node_Grid) throw "Node_Grid is NULL!";
    return this.Node_Grid;
  }

  public _manager: GameManagement | null = null;
  public _levelManager = LevelManager.Instance;

  onEnable() {
    EventUtils.on(EventKey.ROUTER_BACK, this.event_router_back, this);
    this._manager = new GameManagement(this);
    this.Label_Level?.changeLabelString(
      `${this._levelManager.currentGameLevel}关`
    );
    this.Lavel_Level_Bottom?.changeLabelString(
      `${this._levelManager.currentGameLevel}`
    );
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
}

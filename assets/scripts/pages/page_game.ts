import { _decorator, Component, Node } from "cc";
import EventUtils, { EventData, EventKey } from "../utils/eventUtils";
import GameManagement from "../management/gameManagement";
import RouterUtils from "../utils/routerUtils";
const { ccclass, property } = _decorator;

@ccclass("page_game")
export class page_game extends Component {
  @property(Node)
  Node_Grid: Node | undefined;

  public get NodeGrid(): Node {
    if (!this.Node_Grid) throw "Node_Grid is NULL!";
    return this.Node_Grid;
  }

  public _manager: GameManagement | null = null;

  onLoad() {
    this._manager = new GameManagement(this);
  }

  onEnable() {
    this.scheduleOnce(() => {
      if (this._manager) {
        this._manager.init();
      }
    });
  }

  onDestroy() {
    this._manager?.destory();
    this._manager = null;
  }

  event_click_back() {
    this.NodeGrid.destroyAllChildren();
    RouterUtils.back();
  }
}

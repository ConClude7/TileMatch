import { _decorator, Component, Node } from "cc";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
const { ccclass, property } = _decorator;

@ccclass("scene_game")
export class scene_game extends Component {
  onLoad() {
    RouterUtils.init();
  }
  onEnable() {
    RouterUtils.go(RouterPage.LEVEL);
  }
}

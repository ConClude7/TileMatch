import { _decorator, Component, Node } from "cc";
import SceneUtils, { GameScene } from "../utils/sceneUtils";
import { ProgressBar } from "cc";
import SystemUtils from "../utils/systemUtils";
const { ccclass, property } = _decorator;

@ccclass("scene_home")
export class scene_home extends Component {
  @property(ProgressBar)
  ProgressBar: ProgressBar | undefined;

  @property(Node)
  Button_Start: Node | undefined;

  onLoad() {
    SceneUtils.preload(GameScene.GAME, (percent) => {
      if (this.ProgressBar) {
        this.ProgressBar.progress = percent;
        if (percent >= 1) {
          this.ProgressBar.node.active = false;
          this.gameInit();
        }
      }
    });
  }

  private async gameInit() {
    await SystemUtils.init();

    if (this.Button_Start) {
      this.Button_Start.active = true;
    }
  }

  event_click_start() {
    SceneUtils.load(GameScene.GAME);
  }
}

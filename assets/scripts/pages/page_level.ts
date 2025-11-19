import { Button } from "cc";
import { find } from "cc";
import { _decorator, Component, Node } from "cc";
import ConsoleUtils from "../utils/consoleUtils";
import { color } from "cc";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
const { ccclass, property } = _decorator;

const TAG = "page_level";
@ccclass("page_level")
export class page_level extends Component {
  @property(Node)
  Parent_Levels: Node | undefined;

  @property(Node)
  Label_Level: Node | undefined;

  private buttons: Array<Node | null> = [];

  onEnable() {
    if (!this.Parent_Levels) throw "PageLevel.parent_levels is null!";
    this.buttons = this.Parent_Levels.children.map((child) =>
      find("Button_Level", child)
    );
    this.buttons.forEach((child, index) => {
      if (!child) {
        return;
      }
      const level = index + 1;
      this.tween_button_show(child);
      child.on(
        Button.EventType.CLICK,
        () => this.event_click_level(level),
        this
      );
    });
  }

  onDestroy() {
    this.buttons.forEach((button, index) => {
      button?.off(
        Button.EventType.CLICK,
        () => this.event_click_level(index + 1),
        this
      );
    });
  }

  tween_button_show(button: Node | null) {}

  event_click_level = (level: number) => {
    ConsoleUtils.log(TAG, { level, msg: "Click Button!" });
    RouterUtils.go(RouterPage.GAME);
  };
}

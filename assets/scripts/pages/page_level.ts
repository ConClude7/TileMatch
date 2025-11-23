import { Button } from "cc";
import { find } from "cc";
import { _decorator, Component, Node } from "cc";
import ConsoleUtils from "../utils/consoleUtils";
import { color } from "cc";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
import LevelManager, { LevelData } from "../management/levelManagement";
import { Button_Level } from "../../components/Buttons/Button_Level";
import EventUtils, { EventData, EventKey } from "../utils/eventUtils";
const { ccclass, property } = _decorator;

const TAG = "page_level";
@ccclass("page_level")
export class page_level extends Component {
  @property(Node)
  Parent_Levels: Node | undefined;

  @property(Node)
  Label_Level: Node | undefined;

  private buttons: Array<Node | null> = [];

  private _manager = LevelManager.Instance;

  private getButtonLevel = (button: Node): Button_Level => {
    const script = button.getScript<Button_Level>("Button_Level");
    if (!script) {
      throw "Button has not Button_Level!";
    }
    return script;
  };

  onEnable() {
    EventUtils.on(EventKey.ROUTER, this.event_router, this);
  }

  onDestroy() {
    EventUtils.off(EventKey.ROUTER, this.event_router, this);
    const levelDatas = this._manager.getData();
    this.buttons.forEach((button, index) => {
      const levelData = levelDatas[index];
      button?.off(Button.EventType.CLICK);
    });
  }

  event_router = (e: EventData<RouterPage>) => {
    if (e.data === RouterPage.LEVEL) {
      this.initView();
    }
  };

  private initView = () => {
    if (!this.Parent_Levels) throw "PageLevel.parent_levels is null!";

    this.buttons = this.Parent_Levels.children.map((child) =>
      find("Button_Level", child)
    );
    const levelDatas = this._manager.getData();
    const nowIndex =
      levelDatas.findLastIndex((fItem) => fItem.played && fItem.stars === 3) +
      1;
    this.Label_Level?.changeLabelString(`${nowIndex + 1}关`);
    this.buttons.forEach((child, index) => {
      if (!child) {
        return;
      }
      const levelData = levelDatas[index];
      if (levelData) {
        this.initButton(child, levelDatas[index]);
        if (index <= nowIndex) {
          const buttonLevel = this.getButtonLevel(child);
          buttonLevel.show_on();
          child.off(Button.EventType.CLICK);
          child.on(
            Button.EventType.CLICK,
            () => this.event_click_level(levelData),
            this
          );
        }
      }
    });
  };

  private initButton = (button: Node, data: LevelData) => {
    this.tween_button_show(button);
    const { level } = data;

    const buttonLevel = this.getButtonLevel(button);
    buttonLevel.initView(data);
  };

  tween_button_show(button: Node | null) {}

  event_click_level = (levelData: LevelData) => {
    const copyData = { ...levelData };
    copyData.played = true;
    const { level } = copyData;
    this._manager.currentGameLevel = level;
    this._manager.updateLevelData(copyData);
    ConsoleUtils.log(TAG, { level, msg: "Click Button!" });
    RouterUtils.go(RouterPage.GAME);
  };
}

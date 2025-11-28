import { Button } from "cc";
import { find } from "cc";
import { _decorator, Component, Node } from "cc";
import ConsoleUtils from "../utils/consoleUtils";
import { color } from "cc";
import RouterUtils, { RouterPage } from "../utils/routerUtils";
import LevelManager, { LevelData } from "../management/levelManagement";
import { Button_Level } from "../../components/Buttons/Button_Level";
import EventUtils, { EventData, EventKey } from "../utils/eventUtils";
import AudioUtils from "../utils/audioUtils";
import { UITransform } from "cc";
import { Vec3 } from "cc";
import { tween } from "cc";
import StorageUtils, { StorageKey } from "../utils/storageUtils";
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

  onLoad() {
    this._manager.pageLevel = this;
  }

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
      AudioUtils.playBgmHome();
    } else if (e.data === RouterPage.GAME) {
      AudioUtils.playBgmGame();
    }
  };

  public nextGo = false;
  public goPage = () => {
    this.nextGo = false;
    const targetPage = this.Parent_Levels;
    if (!targetPage) return;

    const canvas = find("Canvas")?.getComponent(UITransform);
    if (!canvas) return;

    const canvasHeight = canvas.height;

    // 设置起始位置（从上方滑入）
    const startPos = new Vec3(0, canvasHeight, 0);
    const endPos = Vec3.ZERO;

    targetPage.setPosition(startPos);
    targetPage.active = true;

    let changed = false;
    // 执行滑动动画
    tween(targetPage)
      .to(
        1,
        { position: endPos },
        {
          onUpdate: (target, ratio) => {
            if (!changed && ratio && ratio >= 0.5) {
              changed = true;
              this._manager.resetData().then(() => {
                this.initView();
              });
            }
          },
          easing: "cubicOut",
        }
      )
      .start();
  };

  private initView = () => {
    if (!this.Parent_Levels) throw "PageLevel.parent_levels is null!";
    if (this.nextGo) {
      this.goPage();
      return;
    }
    const pageIndex = StorageUtils.get(StorageKey.LEVEL_PAGE_INDEX) || 0;
    const levelTotal = this.Parent_Levels.children.length ?? 9;
    const trueIndex = levelTotal * pageIndex;
    this.buttons = this.Parent_Levels.children.map((child) =>
      find("Button_Level", child)
    );
    const levelDatas = this._manager.getData();
    const nowIndex =
      levelDatas.findLastIndex((fItem) => fItem.played && fItem.stars === 3) +
      1;
    this.Label_Level?.changeLabelString(`${trueIndex + nowIndex + 1}关`);
    this.buttons.forEach((child, index) => {
      if (!child) {
        return;
      }

      const levelData = levelDatas[index];
      if (levelData) {
        this.initButton(child, levelDatas[index], trueIndex + index + 1);
        const buttonLevel = this.getButtonLevel(child);

        if (index <= nowIndex) {
          buttonLevel.show_on();
          child.off(Button.EventType.CLICK);
          child.on(
            Button.EventType.CLICK,
            () => this.event_click_level(levelData),
            this
          );
        } else {
          buttonLevel.show_off();
        }
      }
    });
  };

  private initButton = (button: Node, data: LevelData, trueIndex: number) => {
    this.tween_button_show(button);
    const { level } = data;

    const buttonLevel = this.getButtonLevel(button);
    buttonLevel.initView(data, trueIndex);
  };

  tween_button_show(button: Node | null) {}

  event_click_level = (levelData: LevelData) => {
    const copyData = { ...levelData };
    copyData.played = true;
    const { level } = copyData;
    this._manager.currentGameLevel = level;
    this._manager.updateLevelData(copyData);
    ConsoleUtils.log(TAG, { level, msg: "Click Button!" });
    AudioUtils.playButton();
    RouterUtils.go(RouterPage.GAME);
  };
}

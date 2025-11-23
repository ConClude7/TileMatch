import { _decorator, Component, Node } from "cc";
import { LevelData } from "../../scripts/management/levelManagement";
const { ccclass, property } = _decorator;

@ccclass("Button_Level")
export class Button_Level extends Component {
  @property(Node)
  Node_Off: Node | undefined;

  @property(Node)
  Node_On: Node | undefined;

  @property(Node)
  Label_Level: Node | undefined;

  private _level: number = 0;
  public get level(): number {
    return this._level;
  }
  public set level(v: number) {
    this._level = v;
    this.Label_Level?.changeLabelString(String(v));
  }

  start() {}

  update(deltaTime: number) {}

  show_on() {
    if (this.Node_Off) this.Node_Off.active = false;
    if (this.Node_On) this.Node_On.active = true;
  }

  initView(data: LevelData) {
    const { level } = data;
    this.level = level;
  }
}

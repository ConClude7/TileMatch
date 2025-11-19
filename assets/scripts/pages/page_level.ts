import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("page_level")
export class page_level extends Component {
  @property(Node)
  Parent_Levels: Node | undefined;

  start() {}

  update(deltaTime: number) {}

  event_click_level = (level: number) => {};
}

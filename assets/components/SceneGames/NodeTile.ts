import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("NodeTile")
export class NodeTile extends Component {
  @property(Node)
  Node_Img: Node | undefined;

  public get NodeImg(): Node {
    return this.Node_Img;
  }
}

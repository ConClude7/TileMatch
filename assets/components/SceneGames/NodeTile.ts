import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("NodeTile")
export class NodeTile extends Component {
  @property(Node)
  Node_Img: Node | undefined;

  @property(Node)
  Node_Bomb: Node | undefined;

  public get NodeImg(): Node {
    if (!this.Node_Img) throw "Tile.Node_Img is null!";
    return this.Node_Img;
  }

  public get NodeBomb(): Node {
    if (!this.Node_Bomb) throw "Tile.Node_Bomb is null!";
    return this.Node_Bomb;
  }
}

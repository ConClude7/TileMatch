import { Animation, find, instantiate, Node, Prefab } from "cc";
import NodeUtils from "./nodeUtils";
import ConsoleUtils from "./consoleUtils";

enum ToastType {
  NORMAL = "Toast_Normal",
  SUCCESS = "Toast_Success",
  Error = "Toast_Error",
}

export default class ToastUtils {
  private static async getColNode(): Promise<Node | null> {
    const canvas = NodeUtils.canvas;
    if (!canvas) {
      ConsoleUtils.warn("ToastUtils", { msg: "没有ColNode" }, true);
      return null;
    }
    const findCol = find("Toast_Col", canvas);
    if (findCol) {
      findCol.setSiblingIndex(canvas.children.length - 1);
      return findCol;
    }
    const colPrefab = await NodeUtils.initPrefab("prefab/toast/Toast_Col");
    if (!colPrefab) {
      ConsoleUtils.warn("ToastUtils", { msg: "没有colPrefab" }, true);
      return null;
    }
    const colNode = instantiate(colPrefab);
    canvas.addChild(colNode);
    // colNode.updateLayout();
    return colNode;
  }

  private static checkColLength = (colNode: Node) => {
    const colLength = colNode.children.length;
    for (let index = 0; index < colLength - 6; index++) {
      const nodeItem = colNode.children[index];
      this.out(nodeItem);
    }
  };

  private static out(toastNode: Node) {
    const nodeAnimation = toastNode.getComponent(Animation);
    if (!nodeAnimation) {
      ConsoleUtils.error(
        "ToastUtils",
        { msg: "toastNode没有Animation组件" },
        true
      );
      return;
    }
    const clip_out = nodeAnimation.clips[1];
    if (!clip_out) {
      ConsoleUtils.error(
        "ToastUtils",
        { msg: "toastNode没有Clip_out动画" },
        true
      );
      return;
    }
    if (!nodeAnimation.getState(clip_out.name).isPlaying) {
      nodeAnimation.play(clip_out.name);
      setTimeout(async () => {
        toastNode.destorySelf();
        // const colNode = await this.getColNode();
        // if (colNode && colNode.children.length <= 0) {
        //   colNode.destorySelf();
        // }
      }, 350);
    }
  }

  private static async create(prefab: Prefab, label: string) {
    const colNode = await this.getColNode();
    if (!colNode) return;
    this.checkColLength(colNode);
    const toastNode = instantiate(prefab);
    const labelNode = find("Content/Label", toastNode);
    if (!labelNode) return;
    labelNode.changeLabelString(label);
    colNode.addChild(toastNode);
    setTimeout(() => {
      if (toastNode.isValid) {
        this.out(toastNode);
      }
    }, 2000);
  }

  public static async show(type: ToastType, label: string) {
    const prefab = await NodeUtils.initPrefab(`prefab/toast/${type}`);
    if (!prefab) {
      ConsoleUtils.error("ToastUtils_未找到预制体", { type, label }, true);
      return;
    }
    this.create(prefab, label);
  }

  public static showError(label: string) {
    this.show(ToastType.Error, label);
  }
  public static showNormal(label: string) {
    this.show(ToastType.NORMAL, label);
  }
  public static showSuccess(label: string) {
    this.show(ToastType.SUCCESS, label);
  }
}

export { ToastType };

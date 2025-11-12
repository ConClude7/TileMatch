import { Node } from "cc";
import PrefabUtils from "./prefabUtils";
import ConsoleUtils from "./consoleUtils";
import { instantiate } from "cc";
import { find } from "cc";
import { Prefab } from "cc";
import AnimationUtils from "./animationUtils";

export type ModalOptionPayRemind = {
  onSubmit: () => void;
};

export default class ModalUtils {
  private static list_modal: Array<Node> = [];
  private static get modal_last(): Node | undefined {
    return this.list_modal.pop();
  }

  private static get canvas(): Node | null {
    const canvas = find("Canvas");
    return canvas;
  }

  /// Destory last modal.
  public static close() {
    const lastModal = this.modal_last;
    if (!lastModal) {
      return;
    }
    lastModal.destorySelf();
    const contentNode = find("Content", lastModal);
    if (!contentNode) {
      lastModal.destorySelf();
      return;
    }
    const playSuccess = AnimationUtils.play(contentNode, "common_out");
    if (playSuccess) {
      setTimeout(() => {
        lastModal.destorySelf();
        ConsoleUtils.log("ModalUtils", { msg: "Delayed destory modal!" });
      }, 250);
    } else {
      lastModal.destorySelf();
    }
  }

  /// Show modal,won't destory last modal.
  private static show(prefab: Prefab | null): Node | null {
    if (!prefab) {
      ConsoleUtils.warn("ModalUtils", { msg: "Prefab is Null!" });
      return null;
    }
    const modalNode = instantiate(prefab);
    const canvas = this.canvas;
    if (!canvas) {
      ConsoleUtils.error("ModalUtils", { msg: "Canvas is Null!" });
      return null;
    }
    canvas.addChild(modalNode);
    this.list_modal.push(modalNode);
    ConsoleUtils.log("ModalUtils", {
      modalNode,
      nowLength: this.list_modal.length,
    });
    return modalNode;
  }
}

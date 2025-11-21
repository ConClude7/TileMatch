import { _decorator, Component, Node } from "cc";
import ModalUtils from "../utils/modalUtils";
import RouterUtils from "../utils/routerUtils";
const { ccclass, property } = _decorator;

@ccclass("modal_common")
export class modal_common extends Component {
  event_click_close() {
    ModalUtils.close();
    RouterUtils.back();
  }
}

import { _decorator, Component, Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass("prefabView")
export class prefabView extends Component {
  @property(Prefab)
  prefab_dialog: Prefab | null = null;

  @property(Prefab)
  Prefab_Modal_PayRemind: Prefab | null = null;

  @property(Prefab)
  Prefab_Modal_GameSuccess: Prefab | null = null;

  @property(Prefab)
  Prefab_Miner: Prefab | null = null;

  protected onLoad(): void {
    PrefabUtils.prefab_dialog = this.prefab_dialog;
    PrefabUtils.prefab_modal_payRemind = this.Prefab_Modal_PayRemind;
    PrefabUtils.prefab_gameSuccess = this.Prefab_Modal_GameSuccess;
    PrefabUtils.prefab_miner = this.Prefab_Miner;
  }
}

export default class PrefabUtils {
  public static prefab_dialog: Prefab | null = null;

  public static prefab_modal_payRemind: Prefab | null = null;

  public static prefab_gameSuccess: Prefab | null = null;

  public static prefab_miner: Prefab | null = null;
}

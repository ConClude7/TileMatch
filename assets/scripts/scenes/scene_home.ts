import { _decorator, Component, Node } from "cc";
import SceneUtils, { GameScene } from "../utils/sceneUtils";
import { ProgressBar } from "cc";
import SystemUtils from "../utils/systemUtils";
import LevelManager from "../management/levelManagement";
import AudioUtils from "../utils/audioUtils";
import { AudioClip } from "cc";
const { ccclass, property } = _decorator;

@ccclass("scene_home")
export class scene_home extends Component {
  @property(ProgressBar)
  ProgressBar: ProgressBar | undefined;

  @property(Node)
  Button_Start: Node | undefined;

  @property(AudioClip)
  Bgm_Home: AudioClip | undefined;

  @property(AudioClip)
  Bgm_Game: AudioClip | undefined;

  @property(AudioClip)
  Sound_ButtonClick: AudioClip | undefined;

  @property([AudioClip])
  Sound_TileDestorys: Array<AudioClip> = [];

  @property([AudioClip])
  Sound_BigDestorys: Array<AudioClip> = [];

  @property(AudioClip)
  Sound_Win: AudioClip | undefined;

  @property(AudioClip)
  Soune_Fail: AudioClip | undefined;

  onLoad() {
    if (this.Button_Start) this.Button_Start.active = false;
    SceneUtils.preload(GameScene.GAME, (percent) => {
      if (this.ProgressBar) {
        this.ProgressBar.progress = percent;
        if (percent >= 1) {
          this.ProgressBar.node.active = false;
          this.gameInit();
        }
      }
    });
  }

  private async gameInit() {
    await SystemUtils.init();
    AudioUtils.init();
    AudioUtils.bgm_home = this.Bgm_Home;
    AudioUtils.bgm_game = this.Bgm_Game;
    AudioUtils.sound_bigDestory = this.Sound_BigDestorys;
    AudioUtils.sound_button_click = this.Sound_ButtonClick;
    AudioUtils.sound_tileDestory = this.Sound_TileDestorys;
    AudioUtils.sound_win = this.Sound_Win;
    AudioUtils.sound_fail = this.Soune_Fail;
    await LevelManager.Instance.init();
    if (this.Button_Start) {
      this.Button_Start.active = true;
    }
  }

  event_click_start() {
    AudioUtils.playButton();
    SceneUtils.load(GameScene.GAME);
  }
}

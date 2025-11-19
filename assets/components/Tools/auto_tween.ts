import {
  _decorator,
  CCBoolean,
  CCFloat,
  Component,
  Enum,
  tween,
  Vec3,
  Widget,
} from "cc";
import AnimationUtils from "../../scripts/utils/animationUtils";
import EventUtils, {
  EventData,
  EventKey,
} from "../../scripts/utils/eventUtils";
import { RouterPage } from "../../scripts/utils/routerUtils";

const { ccclass, property } = _decorator;

@ccclass("auto_tween")
export class auto_tween extends Component {
  @property({ type: Enum(RouterPage), displayName: "监听路由" })
  RouterPage: RouterPage = RouterPage.HOME;

  @property({ type: CCFloat, displayName: "偏移量" })
  Offset = 0.2;

  @property({ type: CCBoolean, displayName: "上方" })
  public set Up(v: boolean) {
    this._down = !v;
    this._up = v;
  }
  public get Up(): boolean {
    return this._up ?? false;
  }
  @property
  _up: boolean | undefined;

  @property({ type: CCBoolean, displayName: "下方" })
  public set Down(v: boolean) {
    this._up = !v;
    this._down = v;
  }
  public get Down(): boolean {
    return this._down ?? false;
  }
  @property
  _down: boolean | undefined;

  public get nowPos(): Vec3 {
    return this.node.getPosition();
  }

  public set nowPos(v: Vec3) {
    this.node.setPosition(v);
  }

  public get widget(): Widget {
    const target = this.node.getComponent(Widget);
    if (!target) throw "AutoTween has not widget!";
    return target;
  }

  private _targetOffset: number | undefined;
  private _startOffset: number | undefined;

  onLoad() {
    this._targetOffset = this._up ? this.widget.top : this.widget.bottom;
    const nodeWidget = this.widget;
    if (this._up) {
      nodeWidget.top -= this.Offset;
      this._startOffset = nodeWidget.top;
    } else {
      nodeWidget.bottom -= this.Offset;
      this._startOffset = nodeWidget.bottom;
    }
    EventUtils.on(EventKey.ROUTER, this.eventOn, this);
    // this.startTween();
  }

  private startTweenIn() {
    tween(this.widget)
      .to(
        0.3,
        this._up ? { top: this._targetOffset } : { bottom: this._targetOffset },
        {
          easing: "quadInOut",
          onComplete: () => {
            this.tweenComplete();
          },
        }
      )
      .start();
  }

  private startTweenOut() {
    tween(this.widget)
      .to(
        0.3,
        this._up ? { top: this._startOffset } : { bottom: this._startOffset },
        {
          easing: "quadInOut",
          onComplete: () => {
            this.pauseAnimation();
          },
        }
      )
      .start();
  }

  private tweenComplete() {
    AnimationUtils.play(this.node);
  }

  private pauseAnimation() {
    AnimationUtils.pause(this.node);
  }

  onEnable() {}

  onDestroy() {
    EventUtils.off(EventKey.ROUTER, this.eventOn, this);
  }

  eventOn = (eventData: EventData<RouterPage>) => {
    if (!eventData.success) return;
    if (eventData.data === this.RouterPage) {
      this.startTweenIn();
    } else {
      this.startTweenOut();
    }
  };
}

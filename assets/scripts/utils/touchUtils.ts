import { EventTouch, Node, NodeEventType, Touch, v2, Vec2 } from "cc";
import ConsoleUtils from "./consoleUtils";

export default class TouchUtils {
  public constructor(node: Node) {
    if (node === null || node === undefined) {
      throw { message: "TouchUtils_挂载Node为空", node };
    }
    this._node = node;

    this.initNodeEvent();
    // ConsoleUtils.log("TouchUtils_初始化", { node, options, this: this });
  }

  public destory() {
    this.offNodeEvent();
  }

  private _node: Node;

  public touchStart: (() => void) | null = null;
  public touchEnd: (() => void) | null = null;
  public touchCancel: (() => void) | null = null;
  public onClick: ((touchEvent?: EventTouch) => void) | null = null;
  public onMove:
    | ((
        moveDirection: MoveDirection,
        moveDistance: number,
        startPoint: Vec2,
        touchLength: number
      ) => void)
    | null = null;
  public onTurnPage: ((moveDirection: MoveDirection) => void) | null = null;
  public onZoomIn: ((scaleDouble: number) => void) | null = null;
  public onZoomOut: ((scaleDouble: number) => void) | null = null;

  private initNodeEvent = () => {
    this._node.on(NodeEventType.TOUCH_START, this.handleTouchStart, this);
    this._node.on(NodeEventType.TOUCH_MOVE, this.handleTouchMove, this);
    this._node.on(NodeEventType.TOUCH_CANCEL, this.handleTouchCancel, this);
    this._node.on(NodeEventType.TOUCH_END, this.handleTouchEnd, this);
  };

  public offNodeEvent = () => {
    this._node.off(NodeEventType.TOUCH_START, this.handleTouchStart, this);
    this._node.off(NodeEventType.TOUCH_MOVE, this.handleTouchMove, this);
    this._node.off(NodeEventType.TOUCH_CANCEL, this.handleTouchCancel, this);
    this._node.off(NodeEventType.TOUCH_END, this.handleTouchEnd, this);
  };

  private handleTouchStart = (touchEvent: EventTouch) => {
    touchEvent.preventSwallow = true;
    const touchList = touchEvent.getTouches();
    // ConsoleUtils.log(`TouchUtils_Start`, { touchList }, false);
    if (touchList.length === 1) {
      if (this.touchStart) {
        this.touchStart();
      }
    }
  };

  private _moveDeadLine = 100;
  private _moveOverLine: boolean = false;

  private handleTouchMove = (touchEvent: EventTouch) => {
    touchEvent.preventSwallow = true;
    const touchList: Touch[] = touchEvent.getTouches();
    if (touchList.length === 1) {
      this.handleOneMove(touchEvent);
    } else if (touchList.length === 2) {
      this.handleTwoMove(touchEvent);
    }
  };

  private handleOneMove = (touchEvent: EventTouch) => {
    const touchList: Touch[] = touchEvent.getTouches();
    const firstTouch = touchList[0];

    const startTemp = v2();
    Vec2.subtract(
      startTemp,
      firstTouch.getUIStartLocation(),
      firstTouch.getUILocation()
    );
    const previousTemp = v2();
    Vec2.subtract(
      previousTemp,
      firstTouch.getUIStartLocation(),
      firstTouch.getUILocation()
    );

    // 起点到终点移动距离
    const moveDistance = startTemp.length();
    const previousDistance = previousTemp.length();
    // 移动坐标-上一点
    const dirVec = firstTouch
      .getUILocation()
      .subtract(firstTouch.getUIPreviousLocation());
    // 移动坐标-起点
    const movePosStart = firstTouch
      .getUILocation()
      .subtract(firstTouch.getUIStartLocation());
    const moveX = movePosStart.x;
    const moveY = movePosStart.y;
    let moveDirection: MoveDirection | null = null;
    if (Math.abs(moveX) > Math.abs(moveY)) {
      // 横向移动
      if (moveX < 0) {
        // 左
        moveDirection = MoveDirection.LEFT;
      } else {
        // 右
        moveDirection = MoveDirection.RIGHT;
      }
    } else {
      // 纵向移动
      if (moveY < 0) {
        // 下
        moveDirection = MoveDirection.DOWN;
      } else {
        // 上
        moveDirection = MoveDirection.UP;
      }
    }
    if (movePosStart.length() > 0 && this.onMove) {
      this.onMove(
        moveDirection,
        moveDistance,
        firstTouch.getUIStartLocation(),
        touchList.length
      );
    }
    if (this._moveOverLine) return;
    if (moveDistance >= this._moveDeadLine) {
      // 超过移动预期阀值
      this._moveOverLine = true;
      if (this.onTurnPage) {
        this.onTurnPage(moveDirection);
      }
      ConsoleUtils.log(
        `TouchUtils_TurnPage`,
        {
          moveDirection,
          moveTemp: startTemp,
          moveDistance,
          dirVec,
          firstTouch,
        },
        false
      );
    }
  };

  private handleTwoMove = (touchEvent: EventTouch) => {
    const touchList = touchEvent.getTouches();
    if (touchList.length !== 2) return;
    const firstTouch = touchList[0];
    const secondTouch = touchList[1];
    const previousTemp = v2();
    Vec2.subtract(
      previousTemp,
      firstTouch.getStartLocation(),
      secondTouch.getStartLocation()
    );
    const nowTemp = v2();
    Vec2.subtract(nowTemp, firstTouch.getLocation(), secondTouch.getLocation());
    const previousDistance = previousTemp.length();
    const nowDistance = nowTemp.length();
    const distance = nowDistance - previousDistance;
    if (distance > 0) {
      // 放大
      const scale_in = nowDistance / previousDistance;
      if (this.onZoomIn) {
        this.onZoomIn(scale_in);
      }
    } else if (distance < 0) {
      // 缩小
      const scale_out = nowDistance / previousDistance;
      if (this.onZoomOut) {
        this.onZoomOut(scale_out);
      }
    }
  };

  private handleTouchCancel = (touchEvent: EventTouch) => {
    touchEvent.preventSwallow = true;
    this._moveOverLine = false;
    const touchList: Touch[] = touchEvent.getTouches();
    const touch = touchList[0];
    // ConsoleUtils.log(`TouchUtils_Cancel`, { touch }, false);
    if (this.touchCancel) {
      this.touchCancel();
    }
  };

  private handleTouchEnd = (touchEvent: EventTouch) => {
    touchEvent.preventSwallow = true;
    this._moveOverLine = false;
    const touchList: Touch[] = touchEvent.getTouches();
    const touch = touchList[0];

    const temp = v2();
    Vec2.subtract(temp, touch.getStartLocation(), touch.getLocation());
    const distance = temp.length();
    /*   ConsoleUtils.log(
      `TouchUtils_End`,
      {
        temp,
        touch,
      },
      false
    ); */
    if (Math.abs(distance) < 3) {
      // ConsoleUtils.log("TouchUtils", { this: this }, false);
      if (this.onClick) {
        this.onClick(touchEvent);
      }
    }
    if (touchList.length === 1) {
      if (this.touchEnd) {
        this.touchEnd();
      }
    }
  };
}

export enum MoveDirection {
  LEFT = "LEFT",
  UP = "UP",
  RIGHT = "RIGHT",
  DOWN = "DOWN",
  // LEFT_UP = "LEFT_UP",
  // LEFT_DOWN = "LEFT_DOWN",
  // RIGHT_UP = "RIGHT_UP",
  // RIGHT_DOWN = "RIGHT_DOWN",
}

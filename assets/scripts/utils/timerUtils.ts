import ConsoleUtils from "./consoleUtils";

export class TimerUtils {
  private _timer: number | null = null;
  private _currentTime: number = 0;
  private _totalTime: number;
  private _stepTime: number;

  private callBack: ((currnetTime: number, stop: boolean) => void) | null =
    null;

  public get currentTime(): number {
    return this._currentTime;
  }

  public get totalTime(): number {
    return this._totalTime;
  }
  public set totalTime(v: number) {
    this._totalTime = v;
  }
  public get stepTime(): number {
    return this._stepTime;
  }
  public set stepTime(v: number) {
    this._stepTime = v;
  }

  /**
   *
   * @param totalTime 总时长，0 代表无限不停止，单位S
   * @param stepTime 回调步长，单位ms
   */
  public constructor(totalTime = 0, stepTime = 1000) {
    this._totalTime = totalTime;
    this._stepTime = stepTime;
  }

  /**
   * 停止计时器
   * 回清空Interval实例，不清空当前时间
   */
  public stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
      ConsoleUtils.log("TimerUtils", { msg: "结束Timer" }, true);
    } else {
      ConsoleUtils.warn("TimerUtils", { msg: "当前没有运行中的Timer" }, true);
    }
  }

  /**
   * 清空计时器
   * 会触发一次回调
   */
  public clear() {
    this.stop();
    if (this.callBack) {
      this.callBack(this._currentTime, true);
      this.callBack = null;
    }
    this._currentTime = 0;
  }

  /**
   * 启动
   * @param callBack 计时回调，返回 当前时间 是否结束
   */
  public start(callBack: (currnetTime: number, stop: boolean) => void) {
    if (!this._timer) {
      this.stop();
      this.callBack = callBack;
      this._timer = setInterval(() => {
        if (this._timer === null) return;
        this._currentTime += 1;
        if (this.totalTime > 0 && this._currentTime > this.totalTime) {
          ConsoleUtils.log(
            "Timer",
            {
              currentTime: this._currentTime,
              totalTime: this.totalTime,
            },
            true
          );
          callBack(this._currentTime, true);
          this.stop();
          return;
        }
        callBack(this._currentTime, false);
      }, this._stepTime);
    }
  }

  /**
   * 添加时间，会触发一次回调
   * @param value 添加的时间，单位秒
   */
  public addTime(value: number) {
    this._currentTime += value;
    this.callBack?.(this._currentTime, false);
  }
}

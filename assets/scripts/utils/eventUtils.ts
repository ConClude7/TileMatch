import { EventTarget } from "cc";
import ConsoleUtils from "./consoleUtils";
import Tile from "../models/tile";

type EventData<T = any> = {
  success: boolean;
  data: T;
  message?: string;
};

enum EventKey {
  ROUTER = "ROUTER",
  ROUTER_BACK = "ROUTER_BACK",
  CHANGE_NETWORK = "CHANGE_NETWORK",
  CALL_ELEVATOR = "CALL_ELEVATOR",
  MAP_CREATE = "MAP_CREATE",
  TILE_TOUCH_MOVE = "TILE_TOUCH_MOVE",
  TILE_MATCH = "TILE_MATCH",
  TILE_AUTO_CLEAR = "TILE_AUTO_CLEAR",
}
class EventUtils {
  private static eventTarget = new EventTarget();
  private constructor() {}

  public static on = <T = any>(
    key: EventKey,
    callback: (data: EventData<T>) => void,
    target?: any
  ) => {
    this.eventTarget.on(key, callback, target);
  };

  public static off = <T = any>(
    key: EventKey,
    callback: (data: EventData<T>) => void,
    target?: any
  ) => {
    this.eventTarget.off(key, callback, target);
  };

  public static emit = (key: EventKey, data: EventData) => {
    ConsoleUtils.log(`Event{${key}}`, data);
    this.eventTarget.emit(key, data);
  };

  // 添加一次性事件监听
  public static once = <T = any>(
    key: EventKey,
    callback: (data: EventData<T>) => void,
    target?: any
  ) => {
    this.eventTarget.once(key, callback, target);
  };

  // 移除目标的所有事件监听
  public static removeAll = (target: any) => {
    this.eventTarget.targetOff(target);
  };
}

export default EventUtils;
export { type EventData, EventKey };

export interface EventDataTileMatchSuccess {
  tileStart: Tile;
  tileEnd: Tile;
  tiles: Array<Tile>;
}

export interface EventDataTileMatchError {
  tileStart: Tile;
  tileEnd: Tile;
}

export interface EventDataTileAutoClear {
  tiles: Tile[];
  goldenCount: number;
  normalCount: number;
}

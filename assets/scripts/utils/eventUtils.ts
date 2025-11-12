import { EventTarget } from "cc";
import ConsoleUtils from "./consoleUtils";

type EventData<T = any> = {
  success: boolean;
  data: T;
  message?: string;
};

enum EventKey {
  ROUTER = "ROUTER",
  CHANGE_NETWORK = "CHANGE_NETWORK",
  CALL_ELEVATOR = "CALL_ELEVATOR",
}
class EventUtils {
  private static eventTarget = new EventTarget();
  private constructor() {}
  // public static Instance = new EventUtils();

  public static on = <T = any>(
    key: EventKey,
    callback: (data: EventData<T>) => void,
    target: any
  ) => {
    this.eventTarget.on(key, (e: EventData) => callback(e), target);
  };

  public static off = <T = any>(
    key: EventKey,
    callback: Function,
    target: any
  ) => {
    this.eventTarget.off(key, (e: EventData<T>) => callback(e), target);
  };

  public static emit = (key: EventKey, data: EventData) => {
    ConsoleUtils.log(`Event{${key}}`, data);
    this.eventTarget.emit(key, data);
  };
}

export default EventUtils;
export { type EventData, EventKey };

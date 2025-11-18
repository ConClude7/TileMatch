import SystemUtils from "./systemUtils";
import { AppEnv } from "../enum/system";

export default class ConsoleUtils {
  private static sign = "========================";
  private static isRelease = SystemUtils.env === AppEnv.RELEASE;
  public static log = (TAG: string, data: any, stringify = false) => {
    if (this.isRelease) return;
    console.log(`Log${this.sign + TAG + this.sign}`);
    if (stringify) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    console.log(data);
  };

  public static warn = (TAG: string, data: any, stringify = false) => {
    if (this.isRelease) return;
    console.warn(`Log${this.sign + TAG + this.sign}`);
    if (stringify) {
      console.warn(JSON.stringify(data, null, 2));
      return;
    }
    console.warn(data);
  };

  public static error = (TAG: string, data: any, stringify = false) => {
    if (this.isRelease) return;
    console.error(`Error${this.sign + TAG + this.sign}`);
    if (stringify) {
      console.error(JSON.stringify(data, null, 2));
      return;
    }
    console.error(data);
  };

  public static oneLine = (data: any) => {
    if (this.isRelease) return;
    console.log(data);
  };
}

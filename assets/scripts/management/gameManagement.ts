import MinerGame from "../models/game";

export default class GameManagement {
  private constructor() {}
  private static _singleton: GameManagement | null = null;
  public static get Instance(): GameManagement {
    if (!this._singleton) {
      this._singleton = new GameManagement();
    }
    return this._singleton;
  }

  public game: MinerGame | null = null;
}

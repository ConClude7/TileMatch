export default class GameData {
  private constructor() {}
  private static _singleton: GameData | null = null;
  public static get Instance(): GameData {
    if (!this._singleton) {
      this._singleton = new GameData();
    }
    return this._singleton;
  }
}

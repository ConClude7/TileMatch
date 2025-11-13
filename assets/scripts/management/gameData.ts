export interface GameSize {
  width: number;
  height: number;
}

export default class GameData {
  public static GAME_SIZE_DEFAULT: GameSize = { width: 10, height: 10 };

  public static CHECK_REMOVE_MIN = 3;
}

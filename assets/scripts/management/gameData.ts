export interface GameSize {
  width: number;
  height: number;
}

export default class GameData {
  public static GAME_SIZE_DEFAULT: GameSize = { width: 7, height: 10 };

  public static CHECK_REMOVE_MIN = 3;

  public static LEVEL_MIN_TILE_TYPE = 4;

  public static LEVEL_MAX_TILE_TYPE = 7;

  public static TILE_MOVE_DISTANCE = 20;

  public static TWEEN_TILE_MOVE_S = 0.2;

  public static TWEEN_TILE_CREATE_S = 0.4;

  public static TWEEN_TILE_DESTORY_S = 0.15;
}

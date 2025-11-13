export interface TilePos {
  x: number;
  y: number;
}

export enum TileValue {
  "EMPTY" = -1,
  "RED" = 0,
  "BLUE" = 1,
  "YELLOW" = 2,
  "GOLDEN" = 9,
  // ...others
}

export interface TileOptions {
  pos: TilePos;
  value: TileValue;
}

export default class Tile {
  public pos: TilePos;
  public value: TileValue;
  public constructor(options: TileOptions) {
    ({ pos: this.pos, value: this.value } = options);
  }
}

import { color } from "cc";
import { randomRangeInt } from "cc";
import { randomRange } from "cc";
import { math } from "cc";
import { Size } from "cc";
import { _decorator, Component, Node, Vec3, tween, random, Sprite } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ScoreAdd")
export class ScoreAdd extends Component {
  @property(Node)
  Label: Node | undefined;

  private startPos: Vec3 = new Vec3();
  private targetPos: Vec3 = new Vec3();

  show(nodeTile: Node, score: number) {
    console.warn({ nodeTile, score });
    this.node.active = true;
    this.Label?.changeLabelString(`+${score}`);

    const tilePos = nodeTile.getWorldPosition();
    const tileSize = nodeTile.getSize();

    if (!tileSize) return;

    // 设置初始位置（在Tile周围随机位置）
    this.setStartPosition(tilePos, tileSize);

    // 执行动画序列
    this.playAnimation();
  }

  /**
   * 设置起始位置
   */
  private setStartPosition(tilePos: Vec3, tileSize: Size): void {
    // 随机偏移量：tileSize的0.1~0.8倍
    const offsetX =
      (randomRange(0, 1) * 0.7 + 0.1) * tileSize.width * randomRangeInt(-1, 1);
    const offsetY =
      (randomRange(0, 1) * 0.7 + 0.1) * tileSize.height * randomRangeInt(-1, 1);

    this.startPos.set(tilePos.x + offsetX, tilePos.y + offsetY, tilePos.z);

    // 设置目标位置（向上移动一定距离）
    this.targetPos.set(this.startPos.x, this.startPos.y + 15, this.startPos.z);

    this.node.setWorldPosition(this.startPos);
    this.node.setScale(Vec3.ZERO);
    this.node.changeColor(color(255, 255, 255, 0));
  }

  /**
   * 播放完整动画序列
   */
  private playAnimation(): void {
    const sprite = this.node.getComponent(Sprite);

    // 1. 进入动画：快速出现并上移
    tween(this.node)
      .parallel(
        // 缩放动画
        tween().to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" }),
        // 位置上移
        tween().to(0.3, {
          worldPosition: new Vec3(
            this.startPos.x,
            this.startPos.y + 5,
            this.startPos.z
          ),
        }),
        // 透明度动画
        sprite
          ? tween(sprite).to(0.2, { color: color(255, 255, 255, 255) })
          : tween()
      )
      .call(() => {
        // 2. 过程动画：漂浮 + 随机左右移动
        this.playFloatAnimation();
      })
      .start();
  }

  /**
   * 过程动画：漂浮 + 随机左右移动
   */
  private playFloatAnimation(): void {
    const currentPos = this.node.getWorldPos();
    if (!currentPos) return;
    // 随机左右移动的幅度
    const floatRange = 5;
    const randomOffsetX = math.randomRange(-1, 1) * floatRange;

    tween(this.node)
      .parallel(
        // 继续上浮
        tween().to(0.5, {
          position: new Vec3(
            currentPos.x + randomOffsetX,
            currentPos.y + 10,
            currentPos.z
          ),
        }),
        // 轻微缩放波动
        tween()
          .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
          .to(0.5, { scale: new Vec3(1, 1, 1) })
      )
      .call(() => {
        // 3. 结束动画：缓慢上浮并消失
        this.playExitAnimation();
      })
      .start();
  }

  /**
   * 结束动画：缓慢上浮并消失
   */
  private playExitAnimation(): void {
    const sprite = this.node.getComponent(Sprite);
    const finalPos = new Vec3(
      this.targetPos.x,
      this.targetPos.y + 20,
      this.targetPos.z
    );

    tween(this.node)
      .parallel(
        // 继续上浮
        tween().to(0.3, { worldPosition: finalPos }),
        // 透明度逐渐消失
        sprite
          ? tween(sprite).to(0.3, { color: color(255, 255, 255, 0) })
          : tween(),
        // 逐渐缩小
        tween().to(0.3, { scale: new Vec3(0.8, 0.8, 1) })
      )
      .call(() => {
        // 动画完成，隐藏节点
        this.node.active = false;
        // 重置状态
        this.resetState();
      })
      .start();
  }

  /**
   * 重置状态
   */
  private resetState(): void {
    this.node.setScale(Vec3.ONE);
    this.node.changeColor(color(255, 255, 255, 0));
    this.destroy();
  }
}

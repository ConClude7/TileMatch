import { Animation, bezier, math, Node, tween, Vec3 } from "cc";
import ConsoleUtils from "./consoleUtils";

export default class AnimationUtils {
  public static play(node: Node, animationName?: string | undefined): boolean {
    const nodeAnimation = node.getComponent(Animation);
    const clips = nodeAnimation?.clips ?? [];
    const defaultAnimation = clips[0];
    if (!nodeAnimation || !defaultAnimation) {
      ConsoleUtils.error("AnimationUtils", { msg: "Node没有Clip", node });
      return false;
    }
    const targetName = animationName ?? defaultAnimation.name;
    if (nodeAnimation.getState(targetName).isPlaying) {
      ConsoleUtils.warn("AnimationUtils", {
        msg: "目标动画正在播放中",
        targetName,
      });
      return false;
    }
    nodeAnimation.play(targetName);
    return true;
  }

  public static pause(node: Node) {
    const nodeAnimation = node.getComponent(Animation);
    if (!nodeAnimation || nodeAnimation.clips.length <= 0) return;
    nodeAnimation.pause();
  }
  public static stop(node: Node) {
    const nodeAnimation = node.getComponent(Animation);
    if (!nodeAnimation || nodeAnimation.clips.length <= 0) return;
    nodeAnimation.stop();
  }

  public static async bezierTo(
    startPoint: Vec3,
    endPoint: Vec3,
    node: Node,
    millSecond: number
  ) {
    const centerPoint = new Vec3(
      (endPoint.x + startPoint.x) / 2,
      (endPoint.y + startPoint.y) / 2
    );
    const cellTime = 100;
    const steps = Math.floor(millSecond / cellTime);
    const path: Vec3[] = [];

    const getPointByTime = (time: number): Vec3 => {
      const pointX = bezier(
        startPoint.x,
        startPoint.x + 20,
        endPoint.x - 20,
        endPoint.x,
        time
      );
      const pointY = bezier(
        startPoint.y,
        centerPoint.y + 100,
        centerPoint.y + 100,
        endPoint.y,
        time
      );
      return new Vec3(pointX, pointY, 1);
    };
    for (let index = 0; index < steps; index++) {
      const stepTime = index / steps;
      path.push(getPointByTime(stepTime));
    }
    if (path.length < 2) {
      ConsoleUtils.oneLine("路径点不足，无法执行动画");
      return;
    }

    // 执行动画
    this.animateAlongPath(node, path, cellTime);

    //动画完成后销毁节点;
    setTimeout(() => {
      node.destorySelf();
    }, millSecond);
  }

  private static animateAlongPath(node: Node, path: Vec3[], cellTime: number) {
    const tw = tween(node);

    path.forEach((pos) => {
      tw.to(cellTime / 1000, { position: pos });
    });

    tw.start();
  }

  private static async tweenShake(
    node: Node,
    angle: number,
    time: number
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      tween(node)
        .to(
          time,
          { angle: angle },
          {
            onComplete: () => {
              resolve();
            },
          }
        )
        .start();
    });
  }

  public static shakeNode = async (node: Node) => {
    const randomAngleLeft = -math.randomRange(0.5, 1);
    const randomAngleRight = math.randomRange(0.5, 1);
    const randomTimeLeft = math.randomRange(0.1, 0.15);
    const randomTimeRight = math.randomRange(0.1, 0.15);
    await this.tweenShake(node, randomAngleLeft, randomTimeLeft);
    await this.tweenShake(node, randomAngleRight, randomTimeRight);
    await this.tweenShake(node, randomAngleLeft, randomTimeLeft);
    await this.tweenShake(node, randomAngleRight, randomTimeRight);
    await this.tweenShake(node, 0, randomTimeRight / 2);
  };
}

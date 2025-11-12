import {
  assetManager,
  Color,
  find,
  ImageAsset,
  Label,
  Layout,
  Node,
  Prefab,
  resources,
  RichText,
  Size,
  Sprite,
  SpriteFrame,
  Texture2D,
  tween,
  UITransform,
  Vec3,
  Widget,
} from "cc";
import ConsoleUtils from "./consoleUtils";
import { Vec2 } from "cc";
import { ProgressBar } from "cc";
import { Tween } from "cc";

// 类型声明扩展
declare module "cc" {
  interface Node {
    /** 销毁Node */
    destorySelf: () => void;

    /**
     * 更改Node颜色
     * @param color 颜色
     */
    changeColor: (color: Color) => void;

    /**
     * 更改Node颜色-带过渡效果
     * @param color 颜色
     * @param time 时间（单位：秒）
     */
    changeColorWithTween: (color: Color, time?: number) => void;

    /**
     * 更改abel颜色
     * @param color 颜色
     */
    changeLabelColor: (color: Color) => void;

    /**
     * 更改Label值
     * @param string 值
     */
    changeLabelString: (string: string) => void;

    /**
     * 更改RichText值
     * @param string 值
     */
    changeRichTextString: (string: string) => void;

    /**
     * 更改Node SpriteFrame —— 本地资源（同步方法）
     * @param imagePath 本地图片路径
     * @param callback 加载完成后的回调，返回尺寸或null
     */
    changeSpriteFrame: (
      imagePath: string,
      callback?: (size: Size | null) => void
    ) => void;

    /**
     * 更改Node SpirtFrame —— 远程资源（异步方法）
     * @param url 远程图片路径
     * @param callback 加载完成后的回调，返回尺寸或null
     */
    changeSpriteFrameFromUrl: (
      url: string,
      callback?: (size: Size | null) => void
    ) => void;

    /**
     * 刷新Widget
     * @param targetNode Widget对齐的Node
     */
    updateWidget: (targetNode?: Node) => void;

    /** 刷新Layout */
    updateLayout: () => void;

    /**
     * 修改Node尺寸
     * @returns 大小
     */
    getSize: () => Size | null;

    /**
     * 修改Node尺寸
     * @param size 大小
     */
    changeSize: (size: Size) => void;

    /**
     * 更改Node缩放
     * @param scale 缩放
     */
    changeScale: (scale: Vec2) => void;

    changeFillRange: (value: number) => void;

    /**
     * 修改坐标
     * @param targetPos 目标坐标点
     * @param tweenTime 传入number开启缓动动画
     * @returns 如果开启滑动动画返回为Tween实例
     */
    setPositionTween: (targetPos: Vec3, tweenTime?: number) => Tween | null;

    /** 获取世界位置 */
    getWorldPos: () => Vec3 | null;

    /**
     * 修改进度条
     * @param progress 进度值
     * @param tweenTime 传入number开启缓动动画
     * @returns 如果开启滑动动画返回为Tween实例
     */
    changeProgress: (progress: number, tweenTime?: number) => Tween | null;

    /** 获取绑定的脚本 */
    getScript: <T>(scriptName: string) => T | undefined;
  }
}
// if (!("visible" in Node.prototype)) {
//   Object.defineProperty(Node.prototype, "visible", {
//     configurable: true, // 必须设置为可配置
//     enumerable: true,
//     get() {
//       return this.active && this.isValid;
//     },
//     set(v: boolean) {
//       if (!this?.isValid) return;
//       this.active = v;
//     },
//   });
// } else {
//   console.error("Cannot redefine existing 'visible' property on Node!");
// }

Node.prototype.destorySelf = function () {
  const node = this;
  if (!node.active) {
    return;
  }
  node.destroy();
};
Node.prototype.changeColor = function (color: Color) {
  const node = this;
  if (!node.active) {
    return;
  }
  const sprite = node.getComponent(Sprite);
  if (!sprite) {
    ConsoleUtils.error("Node缺少Sprite组件", { node });
    return;
  }
  sprite.color = color;
};
Node.prototype.changeColorWithTween = function (color: Color, time = 0.15) {
  const node = this;
  if (!node.active) {
    return;
  }
  const sprite = node.getComponent(Sprite);
  if (!sprite) {
    ConsoleUtils.error("Node缺少Sprite组件", { node });
    return;
  }
  tween(sprite).to(time, { color: color }, { easing: "sineInOut" }).start();
};

Node.prototype.changeLabelColor = function (color: Color) {
  const node = this;
  if (!node.active) {
    return;
  }
  const label = node.getComponent(Label);
  if (!label) {
    ConsoleUtils.error("Node缺少Label组件", { node });
    return;
  }
  label.color = color;
};
Node.prototype.changeLabelString = function (str: string) {
  const node = this;
  if (!node.active) {
    return;
  }
  const label = node.getComponent(Label);
  if (!label) {
    ConsoleUtils.error("Node缺少Label组件", { node });
    return;
  }
  label.string = str;
};
Node.prototype.changeRichTextString = function (str: string) {
  const node = this;
  if (!node.active) {
    return;
  }
  const richText = node.getComponent(RichText);
  if (!richText) {
    ConsoleUtils.error("Node缺少RichText组件", { node });
    return;
  }
  richText.string = str;
};
Node.prototype.changeSpriteFrame = function (
  imagePath: string,
  callback?: (size: Size | null) => void
) {
  const node = this;
  if (!node?.isValid) {
    // 简化判断逻辑
    callback?.(null);
    return;
  }
  const sprite = node.getComponent(Sprite);
  if (!sprite) {
    ConsoleUtils.error("Node缺少Sprite组件", { node });
    callback?.(null);
    return;
  }

  resources.load<SpriteFrame>(
    `${imagePath}/spriteFrame`,
    SpriteFrame,
    (err: Error | null, spriteFrame: SpriteFrame) => {
      if (!!err || !spriteFrame) {
        ConsoleUtils.error("替换Node资源失败", err);
        callback?.(null);
        return;
      }
      sprite.spriteFrame = spriteFrame;
      const size = spriteFrame.originalSize;
      callback?.(size);
    }
  );
};
Node.prototype.changeSpriteFrameFromUrl = function (
  url: string,
  callback?: (size: Size | null) => void
) {
  const node = this;
  if (!node.isValid || !url) {
    return;
  }
  const nodeUi = node.getComponent(UITransform);
  if (!nodeUi) {
    ConsoleUtils.error("Node缺少UITransform组件", { node });
    return;
  }
  const sprite = node.getComponent(Sprite);
  if (!sprite) {
    ConsoleUtils.error("Node缺少Sprite组件", { node });
    return;
  }
  const urlHaveSuffix = [".png", ".jpg", ".jpeg"].some((suffix) =>
    url.includes(suffix)
  );
  assetManager.loadRemote<ImageAsset>(
    url,
    urlHaveSuffix ? null : { ext: ".png" },
    (err, imageAsset) => {
      if (err) {
        return;
      }
      var newSpriteFrame = new SpriteFrame();
      const texture = new Texture2D();
      texture.image = imageAsset;
      newSpriteFrame.texture = texture;
      const scaleNum: Vec3 = node.scale;
      const nodeSize: Size = nodeUi.contentSize;
      if (node.isValid) {
        sprite.spriteFrame = newSpriteFrame;
        node.setScale(scaleNum);
        nodeUi.setContentSize(nodeSize);
        const size = newSpriteFrame.originalSize;
        callback?.(size);
      }
    }
  );
};
Node.prototype.updateWidget = function (targetNode?: Node) {
  const node = this;
  if (!node.active) {
    return;
  }
  const widget = node.getComponent(Widget);
  if (!widget) {
    ConsoleUtils.error("Node缺少Widget组件", { node });
    return;
  }
  if (targetNode && !targetNode.active) {
    ConsoleUtils.error("TargetNode不可用", { targetNode });
  }
  if (targetNode && targetNode.active) widget.target = targetNode;
  widget.updateAlignment();
};
Node.prototype.updateLayout = function () {
  const node = this;
  if (!node.active) {
    return;
  }
  const layout = node.getComponent(Layout);
  if (!layout) {
    ConsoleUtils.error("Node缺少Widget组件", { node });
    return;
  }

  layout.updateLayout();
};

Node.prototype.getSize = function (): Size | null {
  const node = this;
  if (!node.active) {
    return null;
  }
  const uiTransform = node.getComponent(UITransform);
  if (!uiTransform) {
    ConsoleUtils.error("Node缺少UITransform组件", { node });
    return null;
  }
  const size = uiTransform.contentSize;
  return size;
};

Node.prototype.changeSize = function (size: Size) {
  const node = this;
  if (!node.active) {
    return;
  }
  const uiTransform = node.getComponent(UITransform);
  if (!uiTransform) {
    ConsoleUtils.error("Node缺少UITransform组件", { node });
    return;
  }
  uiTransform.setContentSize(size);
};
Node.prototype.changeScale = function (scale: Vec2) {
  const node = this;
  if (!node.active) {
    return;
  }
  node.scale = new Vec3(scale.x, scale.y, 1);
};
Node.prototype.changeFillRange = function (value: number) {
  const node = this;
  if (!node.active) {
    return;
  }
  const sprite = node.getComponent(Sprite);
  if (!sprite) {
    ConsoleUtils.error("Node缺少Sprite组件", { node });
    return;
  }
  sprite.fillRange = value;
};
Node.prototype.setPositionTween = function (targetPos: Vec3, tweenTime = 1) {
  const node = this;
  if (!node.active) {
    return null;
  }
  const nodeTween = tween(node)
    .to(
      tweenTime,
      {
        position: targetPos,
      },
      { easing: "cubicIn" }
    )
    .start();
  return nodeTween;
};
Node.prototype.getWorldPos = function (): Vec3 | null {
  const node = this;
  const canvasNode = find("Canvas");
  if (!canvasNode?.active) {
    return null;
  }
  const canvasUiTransform = canvasNode.getComponent(UITransform);
  if (!canvasUiTransform) {
    ConsoleUtils.error("Node缺少UITransform组件", { canvasNode });
    return null;
  }
  const canvasSize = canvasUiTransform.contentSize;
  const parent = node.parent;
  if (!parent) {
    ConsoleUtils.error("Node缺少父节点", { node });
    return null;
  }
  const parentUiTransform = parent.getComponent(UITransform);
  if (!parentUiTransform) {
    ConsoleUtils.error("Node缺少UITransform组件", { parent });
    return null;
  }
  const worldPosition = parentUiTransform.convertToWorldSpaceAR(node.position);
  const truePos = new Vec3(
    worldPosition.x - canvasSize.width / 2,
    worldPosition.y - canvasSize.height / 2
  );
  return truePos;
};

Node.prototype.changeProgress = function (
  value: number,
  tweenTime?: number
): Tween | null {
  const node = this;
  if (!node.active) {
    return null;
  }
  const nodeProgress = node.getComponent(ProgressBar);
  if (!nodeProgress) {
    ConsoleUtils.error("Node缺少ProgressBar组件", { parent });
    return null;
  }
  if (!tweenTime) {
    nodeProgress.progress = value;
    return null;
  }
  const progressTween = tween(nodeProgress)
    .to(tweenTime, { progress: value }, { easing: "cubicIn" })
    .start();
  return progressTween;
};

Node.prototype.getScript = function <T>(scriptName: string): T | undefined {
  const node = this;
  const nodeScript = node.getComponent(scriptName);
  if (!nodeScript) return undefined;
  return nodeScript as unknown as T;
};

export default class NodeUtils {
  public static get canvas(): Node | null {
    const canvas = find("Canvas");
    const useable = this.getNodeUseable(canvas);
    if (!useable) return null;
    return find("Canvas");
  }

  public static getNodeUseable(node: Node | null): boolean {
    if (!node || !node.isValid) {
      ConsoleUtils.error("NodeUtils", { msg: "Node为空或不可用" }, true);
      return false;
    }
    return true;
  }

  public static async initPrefab(path: string): Promise<Prefab | null> {
    const promise = new Promise<null | Prefab>((resolve) => {
      resources.load(`${path}`, Prefab, (error, prefab) => {
        if (error) {
          ConsoleUtils.error("获取预制件失败", error);
          resolve(null);
        } else {
          resolve(prefab);
        }
      });
    });
    return promise;
  }

  // public static refreshHeight = (node: Node) => {
  //   const nodeSize = node.getComponent(UITransform).contentSize;
  //   const nodeLayout = node.getComponent(Layout);
  //   let height = 0;
  //   node.children.forEach((child) => {
  //     height +=
  //       child.getComponent(UITransform).contentSize.height * child.scale.y;
  //   });
  //   if (nodeLayout) {
  //     height += nodeLayout.paddingTop;
  //     height += nodeLayout.paddingBottom;
  //   }
  //   this.changeSize(node, new Size(nodeSize.width, height));
  // };

  private static getCharLength(char: string) {
    // 判断是否为中文字或Emoji
    if (/[\u4e00-\u9fa5]/.test(char)) {
      return 2;
    } else if (/\p{Emoji}/u.test(char)) {
      return 4;
    } else {
      return 1;
    }
  }

  public static subStringLengh = (
    label: string,
    length: number,
    fixString?: string
  ): string => {
    let totalLength = 0;
    for (let i = 0; i < label.length; i++) {
      totalLength += this.getCharLength(label[i]);
    }
    if (totalLength > length * 2) {
      let subString = label.substring(0, length);
      subString += fixString ?? "…";
      return subString;
    }
    return label;
  };
}
